import { POKEAPI_BASE, TOTAL_POKEMON } from "./constants";
import type {
  EvolutionDisplay,
  PokeApiEvolutionChain,
  PokeApiEvolutionLink,
  PokeApiNameList,
  PokeApiPokemon,
  PokeApiSpecies,
  PokemonDetail,
  PokemonListItem,
  PokemonNameEntry,
} from "./types";

export function getAnimatedSpriteUrl(id: number): string {
  return id < 650
    ? `/sprites/animated/${id}.gif`
    : `/sprites/pokemon/${id}.png`;
}

export function getStaticSpriteUrl(id: number): string {
  return `/sprites/pokemon/${id}.png`;
}

function mapPokemonResponse(data: PokeApiPokemon): PokemonDetail {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a) => a.ability.name),
    stats: data.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    speciesUrl: data.species.url,
  };
}

function mapListItem(data: PokeApiPokemon): PokemonListItem {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
  };
}

export async function fetchPokemonById(
  id: number,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon #${id}`);
  }

  const data: PokeApiPokemon = await response.json();
  return mapPokemonResponse(data);
}

export async function fetchPokemonListItem(
  id: number,
  signal?: AbortSignal,
): Promise<PokemonListItem> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon #${id}`);
  }

  const data: PokeApiPokemon = await response.json();
  return mapListItem(data);
}

export async function fetchPokemonTypes(
  id: number,
  signal?: AbortSignal,
): Promise<string[]> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon #${id} types`);
  }

  const data: PokeApiPokemon = await response.json();
  return data.types.map((t) => t.type.name);
}

export function extractSpeciesId(url: string): number {
  return Number(
    url.replace(`${POKEAPI_BASE}/pokemon-species/`, "").replace(/\/$/, ""),
  );
}

function normalizeFlavorText(text: string): string {
  return text.replace(/\f/g, " ").replace(/\s+/g, " ").trim();
}

function getMinLevel(link: PokeApiEvolutionLink["evolves_to"][0]): number | null {
  return link.evolution_details[0]?.min_level ?? null;
}

export function parseEvolutionChain(
  apiChain: PokeApiEvolutionChain,
): EvolutionDisplay | null {
  const root = apiChain.chain;
  if (root.evolves_to.length === 0) return null;

  const pokemon: EvolutionDisplay["pokemon"] = [
    {
      id: extractSpeciesId(root.species.url),
      name: root.species.name,
    },
    {
      id: extractSpeciesId(root.evolves_to[0].species.url),
      name: root.evolves_to[0].species.name,
    },
  ];
  const levels: (number | null)[] = [getMinLevel(root.evolves_to[0])];

  if (root.evolves_to[0].evolves_to.length > 0) {
    const secondStage = root.evolves_to[0];
    pokemon.push({
      id: extractSpeciesId(secondStage.evolves_to[0].species.url),
      name: secondStage.evolves_to[0].species.name,
    });
    levels.push(getMinLevel(secondStage.evolves_to[0]));
  }

  return { pokemon, levels };
}

export async function fetchPokemonNameIndex(
  signal?: AbortSignal,
): Promise<PokemonNameEntry[]> {
  const response = await fetch(
    `${POKEAPI_BASE}/pokemon?limit=${TOTAL_POKEMON}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Pokémon name index");
  }

  const data: PokeApiNameList = await response.json();
  return data.results.map((entry, index) => ({
    id: index + 1,
    name: entry.name,
    types: [] as string[],
  }));
}

export async function fetchPokemonSpecies(
  url: string,
  signal?: AbortSignal,
): Promise<{ flavorText: string; evolutionChainUrl: string }> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch Pokémon species data");
  }

  const data: PokeApiSpecies = await response.json();
  const englishEntry = data.flavor_text_entries.find(
    (entry) => entry.language.name === "en",
  );

  return {
    flavorText: englishEntry
      ? normalizeFlavorText(englishEntry.flavor_text)
      : "",
    evolutionChainUrl: data.evolution_chain.url,
  };
}

export async function fetchEvolutionChain(
  url: string,
  signal?: AbortSignal,
): Promise<EvolutionDisplay | null> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch evolution chain");
  }

  const data: PokeApiEvolutionChain = await response.json();
  return parseEvolutionChain(data);
}
