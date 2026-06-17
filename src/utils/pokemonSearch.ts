import { TOTAL_POKEMON } from "@/lib/constants";
import type { PokemonNameEntry } from "@/lib/types";

export function matchPokemonSearch(
  query: string,
  entries: PokemonNameEntry[],
  totalPokemon = TOTAL_POKEMON,
): number[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return Array.from({ length: totalPokemon }, (_, i) => i + 1);
  }

  if (/^\d+$/.test(normalized)) {
    const num = Number(normalized);
    return entries
      .filter((entry) => {
        if (entry.id === num) return true;
        if (normalized.length >= 2 && String(entry.id).startsWith(normalized)) {
          return true;
        }
        return false;
      })
      .map((entry) => entry.id);
  }

  return entries
    .filter((entry) => entry.name.replaceAll("-", " ").includes(normalized))
    .map((entry) => entry.id);
}
