import { describe, expect, it } from "vitest";
import type { PokemonNameEntry } from "@/lib/types";
import {
  buildIndexMap,
  filterByCategory,
  filterByColor,
  filterByHabitat,
  filterByTactical,
} from "@/utils/pokemonFilters";

const sampleIndex: PokemonNameEntry[] = [
  {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    isLegendary: false,
    isMythical: false,
    isBaby: false,
    color: "green",
    habitat: "grassland",
    weaknesses: ["fire", "ice", "flying", "psychic"],
    resistances: ["water", "electric", "grass", "fighting"],
  },
  {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    isLegendary: false,
    isMythical: false,
    isBaby: false,
    color: "yellow",
    habitat: "forest",
    weaknesses: ["ground"],
    resistances: ["electric", "flying", "steel"],
  },
  {
    id: 150,
    name: "mewtwo",
    types: ["psychic"],
    isLegendary: true,
    isMythical: false,
    isBaby: false,
    color: "purple",
    habitat: "rare",
    weaknesses: ["bug", "ghost", "dark"],
    resistances: ["fighting", "psychic"],
  },
  {
    id: 151,
    name: "mew",
    types: ["psychic"],
    isLegendary: false,
    isMythical: true,
    isBaby: false,
    color: "pink",
    habitat: "rare",
    weaknesses: ["bug", "ghost", "dark"],
    resistances: ["fighting", "psychic"],
  },
  {
    id: 172,
    name: "pichu",
    types: ["electric"],
    isLegendary: false,
    isMythical: false,
    isBaby: true,
    color: "yellow",
    habitat: "forest",
    weaknesses: ["ground"],
    resistances: ["electric", "flying", "steel"],
  },
];

const ids = sampleIndex.map((entry) => entry.id);
const indexMap = buildIndexMap(sampleIndex);

describe("buildIndexMap", () => {
  it("maps entries by id", () => {
    expect(indexMap.get(25)?.name).toBe("pikachu");
    expect(indexMap.size).toBe(5);
  });
});

describe("filterByCategory", () => {
  it("returns all ids when category is all", () => {
    expect(filterByCategory(ids, "all", indexMap)).toEqual(ids);
  });

  it("filters legendary pokemon", () => {
    expect(filterByCategory(ids, "legendary", indexMap)).toEqual([150]);
  });

  it("filters mythical pokemon", () => {
    expect(filterByCategory(ids, "mythical", indexMap)).toEqual([151]);
  });

  it("filters baby pokemon", () => {
    expect(filterByCategory(ids, "baby", indexMap)).toEqual([172]);
  });
});

describe("filterByTactical", () => {
  it("returns all ids when mode is none", () => {
    expect(
      filterByTactical(ids, { mode: "none", type: null }, indexMap),
    ).toEqual(ids);
  });

  it("filters pokemon weak to ground", () => {
    expect(
      filterByTactical(ids, { mode: "weak", type: "ground" }, indexMap),
    ).toEqual([25, 172]);
  });

  it("filters pokemon that resist psychic", () => {
    expect(
      filterByTactical(ids, { mode: "resist", type: "psychic" }, indexMap),
    ).toEqual([150, 151]);
  });
});

describe("filterByColor", () => {
  it("returns all ids when no colors selected", () => {
    expect(filterByColor(ids, [], indexMap)).toEqual(ids);
  });

  it("filters by selected colors", () => {
    expect(filterByColor(ids, ["yellow"], indexMap)).toEqual([25, 172]);
    expect(filterByColor(ids, ["green", "purple"], indexMap)).toEqual([1, 150]);
  });
});

describe("filterByHabitat", () => {
  it("returns all ids when no habitats selected", () => {
    expect(filterByHabitat(ids, [], indexMap)).toEqual(ids);
  });

  it("filters by selected habitats", () => {
    expect(filterByHabitat(ids, ["forest"], indexMap)).toEqual([25, 172]);
    expect(filterByHabitat(ids, ["rare"], indexMap)).toEqual([150, 151]);
  });
});
