import { mkdir, writeFile, access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { POKEAPI_BASE, SPRITE_BASE, TOTAL_POKEMON } from "../src/lib/constants";
import { parseEvolutionChain } from "../src/lib/pokeapi";
import type {
  EvolutionDisplay,
  PokeApiEvolutionChain,
  PokeApiPokemon,
  PokeApiSpecies,
  PokemonListItem,
} from "../src/lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "public", "data");
const POKEMON_DIR = path.join(DATA_DIR, "pokemon");
const SPRITE_PNG_DIR = path.join(ROOT, "public", "sprites", "pokemon");
const SPRITE_GIF_DIR = path.join(ROOT, "public", "sprites", "animated");

const CONCURRENCY = 10;
const POKEAPI_SOURCE_VERSION = "v2";

interface LocalPokemonDetail {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
  flavorText: string;
  evolution: EvolutionDisplay | null;
}

interface CliOptions {
  skipExisting: boolean;
  from: number;
  to: number;
  noSprites: boolean;
  noGifs: boolean;
  spritesOnly: boolean;
}

interface FetchMeta {
  generatedAt: string;
  totalPokemon: number;
  sourceVersion: string;
  notes: string;
}

function parseArgs(argv: string[]): CliOptions {
  let skipExisting = true;
  let from = 1;
  let to = TOTAL_POKEMON;
  let noSprites = true;
  let noGifs = true;
  let spritesOnly = false;

  for (const arg of argv) {
    if (arg === "--force") {
      skipExisting = false;
    } else if (arg === "--skip-existing") {
      skipExisting = true;
    } else if (arg === "--sprites-only") {
      spritesOnly = true;
    } else if (arg === "--no-sprites") {
      noSprites = true;
    } else if (arg === "--sprites") {
      noSprites = false;
    } else if (arg === "--no-gifs") {
      noGifs = true;
    } else if (arg === "--gifs") {
      noGifs = false;
    } else if (arg.startsWith("--from=")) {
      from = Number(arg.slice("--from=".length));
    } else if (arg.startsWith("--to=")) {
      to = Number(arg.slice("--to=".length));
    }
  }

  if (!Number.isInteger(from) || from < 1) {
    throw new Error(`Invalid --from value: ${from}`);
  }
  if (!Number.isInteger(to) || to < from) {
    throw new Error(`Invalid --to value: ${to}`);
  }

  return { skipExisting, from, to, noSprites, noGifs, spritesOnly };
}

class Semaphore {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly capacity: number) {}

  async acquire(): Promise<void> {
    if (this.active < this.capacity) {
      this.active++;
      return;
    }

    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
    this.active++;
  }

  release(): void {
    this.active--;
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function normalizeFlavorText(text: string): string {
  return text.replace(/\f/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

function mapPokemonDetail(
  pokemon: PokeApiPokemon,
  flavorText: string,
  evolution: EvolutionDisplay | null,
): LocalPokemonDetail {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map((entry) => entry.type.name),
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map((entry) => entry.ability.name),
    stats: pokemon.stats.map((entry) => ({
      name: entry.stat.name,
      value: entry.base_stat,
    })),
    flavorText,
    evolution,
  };
}

function toListItem(detail: LocalPokemonDetail): PokemonListItem {
  return {
    id: detail.id,
    name: detail.name,
    types: detail.types,
  };
}

async function downloadBinary(
  url: string,
  destination: string,
  skipExisting: boolean,
): Promise<boolean> {
  if (skipExisting && (await fileExists(destination))) {
    return false;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
  return true;
}

async function fetchPokemonDetail(id: number): Promise<LocalPokemonDetail> {
  const pokemon = await fetchJson<PokeApiPokemon>(`${POKEAPI_BASE}/pokemon/${id}`);
  const species = await fetchJson<PokeApiSpecies>(pokemon.species.url);

  const englishEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === "en",
  );
  const flavorText = englishEntry
    ? normalizeFlavorText(englishEntry.flavor_text)
    : "";

  let evolution: EvolutionDisplay | null = null;
  if (species.evolution_chain?.url) {
    const chain = await fetchJson<PokeApiEvolutionChain>(
      species.evolution_chain.url,
    );
    evolution = parseEvolutionChain(chain);
  }

  return mapPokemonDetail(pokemon, flavorText, evolution);
}

async function maybeDownloadSprites(
  id: number,
  options: CliOptions,
): Promise<void> {
  if (!options.noSprites) {
    await mkdir(SPRITE_PNG_DIR, { recursive: true });
    const pngPath = path.join(SPRITE_PNG_DIR, `${id}.png`);
    await downloadBinary(
      `${SPRITE_BASE}/${id}.png`,
      pngPath,
      options.skipExisting,
    );
  }

  if (!options.noGifs && id < 650) {
    await mkdir(SPRITE_GIF_DIR, { recursive: true });
    const gifPath = path.join(SPRITE_GIF_DIR, `${id}.gif`);
    const gifUrl = `${SPRITE_BASE}/versions/generation-v/black-white/animated/${id}.gif`;
    try {
      await downloadBinary(gifUrl, gifPath, options.skipExisting);
    } catch (error) {
      console.warn(
        `  warn: skipping GIF for #${id}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}

async function runWithConcurrency<T>(
  items: number[],
  worker: (id: number) => Promise<T>,
): Promise<{ results: T[]; errors: Array<{ id: number; message: string }> }> {
  const semaphore = new Semaphore(CONCURRENCY);
  const results: T[] = [];
  const errors: Array<{ id: number; message: string }> = [];

  await Promise.all(
    items.map(async (id) => {
      await semaphore.acquire();
      try {
        const result = await worker(id);
        results.push(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push({ id, message });
        console.error(`  error #${id}: ${message}`);
      } finally {
        semaphore.release();
      }
    }),
  );

  return { results, errors };
}

async function writeMeta(
  options: CliOptions,
  errors: Array<{ id: number; message: string }>,
  totalPokemon: number,
  extraNote?: string,
): Promise<void> {
  const notes = [
    options.spritesOnly ? "sprites-only run" : `Range ${options.from}-${options.to}`,
    options.noSprites ? "sprites skipped" : "sprites downloaded",
    options.noGifs ? "gifs skipped" : "gifs downloaded",
    errors.length > 0 ? `${errors.length} fetch error(s)` : "no fetch errors",
    extraNote,
  ]
    .filter(Boolean)
    .join("; ");

  const meta: FetchMeta = {
    generatedAt: new Date().toISOString(),
    totalPokemon,
    sourceVersion: POKEAPI_SOURCE_VERSION,
    notes,
  };

  await writeFile(
    path.join(DATA_DIR, "meta.json"),
    `${JSON.stringify(meta, null, 2)}\n`,
    "utf8",
  );
}

async function countPokemonFiles(): Promise<number> {
  try {
    const allPokemonFiles = await readdir(POKEMON_DIR);
    return allPokemonFiles.filter((file) => file.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const ids = Array.from(
    { length: options.to - options.from + 1 },
    (_, index) => options.from + index,
  );

  if (options.spritesOnly) {
    console.log(
      `Downloading sprites ${options.from}–${options.to} (${ids.length} IDs, concurrency ${CONCURRENCY})`,
    );
    console.log(
      `Options: skipExisting=${options.skipExisting}, noSprites=${options.noSprites}, noGifs=${options.noGifs}`,
    );

    const { errors } = await runWithConcurrency(ids, async (id) => {
      console.log(`  sprite #${id}`);
      await maybeDownloadSprites(id, options);
      return id;
    });

    await mkdir(DATA_DIR, { recursive: true });
    let totalPokemon = await countPokemonFiles();
    const indexPath = path.join(DATA_DIR, "index.json");
    if (await fileExists(indexPath)) {
      const raw = await readFile(indexPath, "utf8");
      totalPokemon = (JSON.parse(raw) as PokemonListItem[]).length;
    }
    await writeMeta(options, errors, totalPokemon);

    console.log(`Done. Processed ${ids.length} sprite ID(s). Errors: ${errors.length}.`);

    if (errors.length > 0) {
      process.exitCode = 1;
    }
    return;
  }

  console.log(
    `Fetching Pokémon ${options.from}–${options.to} (${ids.length} IDs, concurrency ${CONCURRENCY})`,
  );
  console.log(
    `Options: skipExisting=${options.skipExisting}, noSprites=${options.noSprites}, noGifs=${options.noGifs}`,
  );

  await mkdir(POKEMON_DIR, { recursive: true });

  let skipped = 0;
  const idsToFetch: number[] = [];

  for (const id of ids) {
    const pokemonPath = path.join(POKEMON_DIR, `${id}.json`);
    if (options.skipExisting && (await fileExists(pokemonPath))) {
      skipped++;
      continue;
    }
    idsToFetch.push(id);
  }

  if (skipped > 0) {
    console.log(`Skipping ${skipped} existing pokemon JSON file(s).`);
  }

  const { results: fetchedDetails, errors } = await runWithConcurrency(
    idsToFetch,
    async (id) => {
      console.log(`  fetch #${id}`);
      const detail = await fetchPokemonDetail(id);
      const pokemonPath = path.join(POKEMON_DIR, `${id}.json`);
      await writeFile(pokemonPath, `${JSON.stringify(detail, null, 2)}\n`, "utf8");
      await maybeDownloadSprites(id, options);
      return detail;
    },
  );

  const indexItems: PokemonListItem[] = [];
  const allPokemonFiles = await readdir(POKEMON_DIR);

  const pokemonIds = allPokemonFiles
    .filter((file) => file.endsWith(".json"))
    .map((file) => Number(file.replace(/\.json$/, "")))
    .filter((id) => Number.isInteger(id) && id > 0)
    .sort((a, b) => a - b);

  for (const id of pokemonIds) {
    const pokemonPath = path.join(POKEMON_DIR, `${id}.json`);
    const raw = await readFile(pokemonPath, "utf8");
    const detail = JSON.parse(raw) as LocalPokemonDetail;
    indexItems.push(toListItem(detail));
  }

  await writeFile(
    path.join(DATA_DIR, "index.json"),
    `${JSON.stringify(indexItems, null, 2)}\n`,
    "utf8",
  );

  await writeMeta(options, errors, indexItems.length);

  console.log(`Done. Wrote ${fetchedDetails.length} pokemon file(s) this run.`);
  console.log(`Index: ${indexItems.length} entries. Errors: ${errors.length}.`);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
