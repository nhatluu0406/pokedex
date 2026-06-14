import { describe, expect, it } from "vitest";
import {
  buildPokemonHash,
  parsePokemonHash,
} from "@/utils/hash";

describe("parsePokemonHash", () => {
  it("parses a valid pokemon hash", () => {
    expect(parsePokemonHash("#pokemon/25")).toBe(25);
    expect(parsePokemonHash("#pokemon/1")).toBe(1);
  });

  it("returns null for invalid hashes", () => {
    expect(parsePokemonHash("")).toBeNull();
    expect(parsePokemonHash("#pokemon/")).toBeNull();
    expect(parsePokemonHash("#pokemon/abc")).toBeNull();
    expect(parsePokemonHash("#other/25")).toBeNull();
    expect(parsePokemonHash("?id=25")).toBeNull();
  });

  it("returns null for non-positive ids", () => {
    expect(parsePokemonHash("#pokemon/0")).toBeNull();
    expect(parsePokemonHash("#pokemon/-1")).toBeNull();
  });
});

describe("buildPokemonHash", () => {
  it("builds hash from id", () => {
    expect(buildPokemonHash(25)).toBe("#pokemon/25");
  });
});
