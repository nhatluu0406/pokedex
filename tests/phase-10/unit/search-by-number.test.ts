import { describe, expect, it } from "vitest";
import type { PokemonNameEntry } from "@/lib/types";
import { matchPokemonSearch } from "@/utils/pokemonSearch";

const entries: PokemonNameEntry[] = [
  { id: 1, name: "bulbasaur", types: ["grass", "poison"] },
  { id: 10, name: "caterpie", types: ["bug"] },
  { id: 25, name: "pikachu", types: ["electric"] },
  { id: 100, name: "voltorb", types: ["electric"] },
  { id: 150, name: "mewtwo", types: ["psychic"] },
  { id: 1000, name: "gholdengo", types: ["steel", "ghost"] },
];

describe("matchPokemonSearch", () => {
  it("returns full range for empty query", () => {
    expect(matchPokemonSearch("", entries, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(matchPokemonSearch("   ", entries, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("matches names case-insensitively with hyphens as spaces", () => {
    expect(matchPokemonSearch("pika", entries)).toEqual([25]);
    expect(matchPokemonSearch("PIKA", entries)).toEqual([25]);
  });

  it("exact numeric match for single digit", () => {
    expect(matchPokemonSearch("1", entries)).toEqual([1]);
  });

  it("exact numeric match for multi-digit id", () => {
    expect(matchPokemonSearch("25", entries)).toEqual([25]);
    expect(matchPokemonSearch("1000", entries)).toEqual([1000]);
  });

  it("prefix numeric match when query length is at least 2", () => {
    expect(matchPokemonSearch("10", entries)).toEqual([10, 100, 1000]);
    expect(matchPokemonSearch("15", entries)).toEqual([150]);
  });

  it("does not prefix-match single digit queries beyond exact id", () => {
    expect(matchPokemonSearch("1", entries)).toEqual([1]);
    expect(matchPokemonSearch("1", entries)).not.toContain(10);
  });
});
