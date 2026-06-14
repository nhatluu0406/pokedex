import { describe, expect, it } from "vitest";
import {
  SPRITE_BASE,
  STAT_COLORS,
  TOTAL_POKEMON,
  TYPE_COLORS,
} from "@/lib/constants";

describe("TYPE_COLORS", () => {
  it("defines all standard Pokémon types plus shadow", () => {
    const expectedTypes = [
      "normal",
      "fighting",
      "flying",
      "poison",
      "ground",
      "rock",
      "bug",
      "ghost",
      "steel",
      "fire",
      "water",
      "grass",
      "electric",
      "psychic",
      "ice",
      "dragon",
      "dark",
      "fairy",
      "shadow",
    ];

    for (const type of expectedTypes) {
      expect(TYPE_COLORS[type]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
    expect(Object.keys(TYPE_COLORS)).toHaveLength(expectedTypes.length);
  });
});

describe("STAT_COLORS", () => {
  it("defines colors for all stat bar labels", () => {
    const expectedStats = ["hp", "atk", "def", "spa", "spd", "speed", "total"];

    for (const stat of expectedStats) {
      expect(STAT_COLORS[stat]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
    expect(Object.keys(STAT_COLORS)).toHaveLength(expectedStats.length);
  });
});

describe("SPRITE_BASE", () => {
  it("points at the PokeAPI GitHub sprites repo", () => {
    expect(SPRITE_BASE).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon",
    );
  });
});

describe("TOTAL_POKEMON", () => {
  it("matches the national dex cap for Phase 1", () => {
    expect(TOTAL_POKEMON).toBe(1025);
  });
});
