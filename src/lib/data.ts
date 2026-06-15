import type { PokemonDetail, PokemonNameEntry } from "./types";

export { getAnimatedSpriteUrl, getStaticSpriteUrl } from "./pokeapi";

export async function fetchNameIndex(
  signal?: AbortSignal,
): Promise<PokemonNameEntry[]> {
  const response = await fetch("/data/index.json", { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch Pokémon name index");
  }

  return response.json();
}

export async function fetchPokemonDetail(
  id: number,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const response = await fetch(`/data/pokemon/${id}.json`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to load Pokémon #${id}`);
  }

  return response.json();
}

export function getTypesForId(
  index: PokemonNameEntry[],
  id: number,
): string[] {
  const entry = index.find((e) => e.id === id);
  return entry?.types ?? [];
}

export function fetchPokemonTypesFromIndex(
  index: PokemonNameEntry[],
  id: number,
): string[] {
  return getTypesForId(index, id);
}
