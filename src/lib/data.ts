import type { PokemonDetail, PokemonNameEntry } from "./types";

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
