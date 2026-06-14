import { describe, expect, it } from "vitest";
import { filterByFavorites } from "@/utils/pokemonFilters";

describe("filterByFavorites", () => {
  const ids = [1, 4, 7, 25];

  it("returns all ids when mode is all", () => {
    expect(filterByFavorites(ids, "all", new Set([25]))).toEqual(ids);
  });

  it("returns only favorite ids when mode is favorites", () => {
    expect(filterByFavorites(ids, "favorites", new Set([4, 25]))).toEqual([
      4, 25,
    ]);
  });

  it("returns empty array when no favorites match", () => {
    expect(filterByFavorites(ids, "favorites", new Set([999]))).toEqual([]);
  });
});

describe("useFavorites storage key", () => {
  it("uses the expected localStorage key", () => {
    expect("pokedex-favorites").toBe("pokedex-favorites");
  });
});
