import { mkdir, writeFile, access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { POKEAPI_BASE, SPRITE_BASE, TOTAL_POKEMON } from "../src/lib/constants";
import { parseEvolutionChain } from "../src/lib/pokeapi";
import { getResistances, getWeaknesses } from "../src/lib/type-chart";
import type {
  EvolutionDisplay,
  PokeApiEvolutionChain,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiType,
  PokemonListItem,
  TypeChartData,
} from "../src/lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "public", "data");
const POKEMON_DIR = path.join(DATA_DIR, "pokemon");
const SPRITE_PNG_DIR = path.join(ROOT, "public", "sprites", "pokemon");
const SPRITE_GIF_DIR = path.join(ROOT, "public", "sprites", "animated");
const SHOWDOWN_DIR = path.join(ROOT, "public", "sprites", "showdown");
const CRIES_DIR = path.join(ROOT, "public", "cries");
const TYPES_PATH = path.join(DATA_DIR, "types.json");

const CONCURRENCY = 10;
const TYPE_IDS = Array.from({ length: 18 }, (_, index) => index + 1);
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
  genera?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  isBaby?: boolean;
  color?: string | null;
  habitat?: string | null;
  cryUrl?: string;
}

interface CliOptions {
  skipExisting: boolean;
  from: number;
  to: number;
  noSprites: boolean;
  noGifs: boolean;
  spritesOnly: boolean;
  typesOnly: boolean;
  indexOnly: boolean;
  cries: boolean;
  showdown: boolean;
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
  let typesOnly = false;
  let indexOnly = false;
  let cries = false;
  let showdown = false;

  for (const arg of argv) {
    if (arg === "--force") {
      skipExisting = false;
    } else if (arg === "--skip-existing") {
      skipExisting = true;
    } else if (arg === "--sprites-only") {
      spritesOnly = true;
    } else if (arg === "--types-only") {
      typesOnly = true;
    } else if (arg === "--index-only") {
      indexOnly = true;
    } else if (arg === "--cries") {
      cries = true;
    } else if (arg === "--showdown") {
      showdown = true;
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

  return {
    skipExisting,
    from,
    to,
    noSprites,
    noGifs,
    spritesOnly,
    typesOnly,
    indexOnly,
    cries,
    showdown,
  };
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

function getEnglishGenus(species: PokeApiSpecies): string | undefined {
  const entry = species.genera.find((genus) => genus.language.name === "en");
  return entry?.genus;
}

function mapPokemonDetail(
  pokemon: PokeApiPokemon,
  species: PokeApiSpecies,
  flavorText: string,
  evolution: EvolutionDisplay | null,
  cryUrl?: string,
): LocalPokemonDetail {
  const detail: LocalPokemonDetail = {
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
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    isBaby: species.is_baby,
    color: species.color?.name ?? null,
    habitat: species.habitat?.name ?? null,
  };

  const genera = getEnglishGenus(species);
  if (genera) {
    detail.genera = genera;
  }

  if (cryUrl) {
    detail.cryUrl = cryUrl;
  }

  return detail;
}

function toListItem(
  detail: LocalPokemonDetail,
  typeChart: TypeChartData,
): PokemonListItem {
  const item: PokemonListItem = {
    id: detail.id,
    name: detail.name,
    types: detail.types,
    weaknesses: getWeaknesses(detail.types, typeChart),
    resistances: getResistances(detail.types, typeChart),
  };

  if (detail.isLegendary !== undefined) {
    item.isLegendary = detail.isLegendary;
  }
  if (detail.isMythical !== undefined) {
    item.isMythical = detail.isMythical;
  }
  if (detail.isBaby !== undefined) {
    item.isBaby = detail.isBaby;
  }
  if (detail.color !== undefined) {
    item.color = detail.color;
  }
  if (detail.habitat !== undefined) {
    item.habitat = detail.habitat;
  }

  return item;
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

async function maybeDownloadCry(
  id: number,
  pokemon: PokeApiPokemon,
  options: CliOptions,
): Promise<string | undefined> {
  if (!options.cries) {
    return undefined;
  }

  const crySourceUrl = pokemon.cries?.latest;
  if (!crySourceUrl) {
    console.warn(`  warn: no cry URL for #${id}`);
    return undefined;
  }

  await mkdir(CRIES_DIR, { recursive: true });
  const destination = path.join(CRIES_DIR, `${id}.ogg`);
  await downloadBinary(crySourceUrl, destination, options.skipExisting);
  return `/cries/${id}.ogg`;
}

async function maybeDownloadShowdown(
  id: number,
  pokemon: PokeApiPokemon,
  options: CliOptions,
): Promise<void> {
  if (!options.showdown || id < 650) {
    return;
  }

  const showdownUrl = pokemon.sprites?.other?.showdown?.front_default;
  if (!showdownUrl) {
    console.warn(`  warn: no showdown sprite for #${id}`);
    return;
  }

  await mkdir(SHOWDOWN_DIR, { recursive: true });
  const destination = path.join(SHOWDOWN_DIR, `${id}.gif`);
  try {
    await downloadBinary(showdownUrl, destination, options.skipExisting);
  } catch (error) {
    console.warn(
      `  warn: skipping showdown GIF for #${id}: ${error instanceof Error ? error.message : error}`,
    );
  }
}

async function fetchPokemonDetail(
  id: number,
  options: CliOptions,
): Promise<LocalPokemonDetail> {
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

  const cryUrl = await maybeDownloadCry(id, pokemon, options);
  await maybeDownloadShowdown(id, pokemon, options);

  return mapPokemonDetail(pokemon, species, flavorText, evolution, cryUrl);
}

async function patchPokemonAssets(id: number, options: CliOptions): Promise<void> {
  const pokemon = await fetchJson<PokeApiPokemon>(`${POKEAPI_BASE}/pokemon/${id}`);
  const cryUrl = await maybeDownloadCry(id, pokemon, options);
  await maybeDownloadShowdown(id, pokemon, options);

  if (!cryUrl) {
    return;
  }

  const pokemonPath = path.join(POKEMON_DIR, `${id}.json`);
  const raw = await readFile(pokemonPath, "utf8");
  const detail = JSON.parse(raw) as LocalPokemonDetail;
  if (detail.cryUrl === cryUrl) {
    return;
  }

  detail.cryUrl = cryUrl;
  await writeFile(pokemonPath, `${JSON.stringify(detail, null, 2)}\n`, "utf8");
}

async function fetchAllTypes(): Promise<void> {
  const types: TypeChartData["types"] = {};

  for (const id of TYPE_IDS) {
    const typeData = await fetchJson<PokeApiType>(`${POKEAPI_BASE}/type/${id}`);
    types[typeData.name] = {
      name: typeData.name,
      damageRelations: {
        double_damage_from: typeData.damage_relations.double_damage_from.map(
          (entry) => entry.name,
        ),
        half_damage_from: typeData.damage_relations.half_damage_from.map(
          (entry) => entry.name,
        ),
        no_damage_from: typeData.damage_relations.no_damage_from.map(
          (entry) => entry.name,
        ),
      },
    };
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(TYPES_PATH, `${JSON.stringify({ types }, null, 2)}\n`, "utf8");
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
    options.typesOnly ? "types-only run" : null,
    options.spritesOnly ? "sprites-only run" : `Range ${options.from}-${options.to}`,
    options.noSprites ? "sprites skipped" : "sprites downloaded",
    options.noGifs ? "gifs skipped" : "gifs downloaded",
    options.cries ? "cries downloaded" : "cries skipped",
    options.showdown ? "showdown sprites downloaded" : "showdown sprites skipped",
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

async function loadTypeChartFromDisk(): Promise<TypeChartData> {
  if (!(await fileExists(TYPES_PATH))) {
    throw new Error(`Missing ${TYPES_PATH}. Run npm run fetch-types first.`);
  }

  const raw = await readFile(TYPES_PATH, "utf8");
  return JSON.parse(raw) as TypeChartData;
}

async function buildIndexFromPokemonFiles(
  typeChart: TypeChartData,
): Promise<PokemonListItem[]> {
  const allPokemonFiles = await readdir(POKEMON_DIR);
  const pokemonIds = allPokemonFiles
    .filter((file) => file.endsWith(".json"))
    .map((file) => Number(file.replace(/\.json$/, "")))
    .filter((id) => Number.isInteger(id) && id > 0)
    .sort((a, b) => a - b);

  const indexItems: PokemonListItem[] = [];

  for (const id of pokemonIds) {
    const pokemonPath = path.join(POKEMON_DIR, `${id}.json`);
    const raw = await readFile(pokemonPath, "utf8");
    const detail = JSON.parse(raw) as LocalPokemonDetail;
    indexItems.push(toListItem(detail, typeChart));
  }

  return indexItems;
}

async function rebuildIndexOnly(): Promise<void> {
  console.log("Rebuilding index from existing pokemon JSON files (no API fetch)");

  const typeChart = await loadTypeChartFromDisk();
  const indexItems = await buildIndexFromPokemonFiles(typeChart);

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    path.join(DATA_DIR, "index.json"),
    `${JSON.stringify(indexItems, null, 2)}\n`,
    "utf8",
  );

  const meta: FetchMeta = {
    generatedAt: new Date().toISOString(),
    totalPokemon: indexItems.length,
    sourceVersion: POKEAPI_SOURCE_VERSION,
    notes: "index-only rebuild from existing pokemon JSON",
  };

  await writeFile(
    path.join(DATA_DIR, "meta.json"),
    `${JSON.stringify(meta, null, 2)}\n`,
    "utf8",
  );

  console.log(`Done. Index: ${indexItems.length} entries.`);
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

  if (options.indexOnly) {
    await rebuildIndexOnly();
    return;
  }

  if (options.typesOnly) {
    console.log(`Fetching type chart (${TYPE_IDS.length} types)`);
    await fetchAllTypes();
    console.log(`Done. Wrote ${TYPES_PATH}.`);
    return;
  }

  const ids = Array.from(
    { length: options.to - options.from + 1 },
    (_, index) => options.from + index,
  );

  if (options.spritesOnly) {
    console.log(
      `Downloading sprites ${options.from}–${options.to} (${ids.length} IDs, concurrency ${CONCURRENCY})`,
    );
    console.log(
      `Options: skipExisting=${options.skipExisting}, noSprites=${options.noSprites}, noGifs=${options.noGifs}, cries=${options.cries}, showdown=${options.showdown}`,
    );

    const { errors } = await runWithConcurrency(ids, async (id) => {
      console.log(`  sprite #${id}`);
      await maybeDownloadSprites(id, options);
      if (options.cries || options.showdown) {
        const pokemon = await fetchJson<PokeApiPokemon>(
          `${POKEAPI_BASE}/pokemon/${id}`,
        );
        await maybeDownloadCry(id, pokemon, options);
        await maybeDownloadShowdown(id, pokemon, options);
      }
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
    `Options: skipExisting=${options.skipExisting}, noSprites=${options.noSprites}, noGifs=${options.noGifs}, cries=${options.cries}, showdown=${options.showdown}`,
  );

  await mkdir(POKEMON_DIR, { recursive: true });

  let skipped = 0;
  const idsToFetch: number[] = [];
  const idsForAssetsOnly: number[] = [];

  for (const id of ids) {
    const pokemonPath = path.join(POKEMON_DIR, `${id}.json`);
    if (options.skipExisting && (await fileExists(pokemonPath))) {
      skipped++;
      if (options.cries || options.showdown) {
        idsForAssetsOnly.push(id);
      }
      continue;
    }
    idsToFetch.push(id);
  }

  if (skipped > 0) {
    console.log(`Skipping ${skipped} existing pokemon JSON file(s).`);
  }

  const { results: fetchedDetails, errors: fetchErrors } = await runWithConcurrency(
    idsToFetch,
    async (id) => {
      console.log(`  fetch #${id}`);
      const detail = await fetchPokemonDetail(id, options);
      const pokemonPath = path.join(POKEMON_DIR, `${id}.json`);
      await writeFile(pokemonPath, `${JSON.stringify(detail, null, 2)}\n`, "utf8");
      await maybeDownloadSprites(id, options);
      return detail;
    },
  );

  const { errors: assetErrors } = await runWithConcurrency(
    idsForAssetsOnly,
    async (id) => {
      console.log(`  assets #${id}`);
      await patchPokemonAssets(id, options);
      return id;
    },
  );

  const errors = [...fetchErrors, ...assetErrors];

  const typeChart = await loadTypeChartFromDisk();
  const indexItems = await buildIndexFromPokemonFiles(typeChart);

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
