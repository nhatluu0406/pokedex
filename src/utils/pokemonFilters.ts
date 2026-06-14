export type ListMode = "all" | "favorites";

export function filterByFavorites(
  ids: number[],
  mode: ListMode,
  favorites: Set<number>,
): number[] {
  if (mode === "all") return ids;
  return ids.filter((id) => favorites.has(id));
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
