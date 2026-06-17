import type { PokemonNameEntry } from "@/lib/types";

export type ListMode = "all" | "favorites";

export type FilterGroup = "type" | "weak" | "resist" | "color" | "habitat";

export type CategoryFilter = "all" | "legendary" | "mythical" | "baby";

export type TacticalFilter = {
  mode: "none" | "weak" | "resist";
  type: string | null;
};

export function buildIndexMap(
  index: PokemonNameEntry[],
): Map<number, PokemonNameEntry> {
  const map = new Map<number, PokemonNameEntry>();
  for (const entry of index) {
    map.set(entry.id, entry);
  }
  return map;
}

export function filterByFavorites(
  ids: number[],
  mode: ListMode,
  favorites: Set<number>,
): number[] {
  if (mode === "all") return ids;
  return ids.filter((id) => favorites.has(id));
}

export function filterByCategory(
  ids: number[],
  category: CategoryFilter,
  indexMap: Map<number, PokemonNameEntry>,
): number[] {
  if (category === "all") return ids;
  return ids.filter((id) => {
    const entry = indexMap.get(id);
    if (!entry) return false;
    switch (category) {
      case "legendary":
        return entry.isLegendary === true;
      case "mythical":
        return entry.isMythical === true;
      case "baby":
        return entry.isBaby === true;
      default:
        return true;
    }
  });
}

export function filterByTactical(
  ids: number[],
  tactical: TacticalFilter,
  indexMap: Map<number, PokemonNameEntry>,
): number[] {
  if (tactical.mode === "none" || !tactical.type) return ids;
  return ids.filter((id) => {
    const entry = indexMap.get(id);
    if (!entry) return false;
    const list =
      tactical.mode === "weak" ? entry.weaknesses : entry.resistances;
    return list?.includes(tactical.type!) ?? false;
  });
}

export function filterByColor(
  ids: number[],
  colors: string[],
  indexMap: Map<number, PokemonNameEntry>,
): number[] {
  if (colors.length === 0) return ids;
  return ids.filter((id) => {
    const entry = indexMap.get(id);
    return entry?.color != null && colors.includes(entry.color);
  });
}

export function filterByHabitat(
  ids: number[],
  habitats: string[],
  indexMap: Map<number, PokemonNameEntry>,
): number[] {
  if (habitats.length === 0) return ids;
  return ids.filter((id) => {
    const entry = indexMap.get(id);
    return entry?.habitat != null && habitats.includes(entry.habitat);
  });
}

export function filterByType(
  ids: number[],
  selectedTypes: string[],
  typesCache: Map<number, string[]>,
): number[] {
  if (selectedTypes.length === 0) return ids;
  return ids.filter((id) => {
    const types = typesCache.get(id);
    if (!types) return true;
    return selectedTypes.some((type) => types.includes(type));
  });
}
