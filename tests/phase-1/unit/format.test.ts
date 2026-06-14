import { describe, expect, it } from "vitest";
import {
  capitalizeName,
  formatHeight,
  formatPokemonId,
  formatWeight,
} from "@/utils/format";

describe("formatPokemonId", () => {
  it("formats id with N° prefix", () => {
    expect(formatPokemonId(25)).toBe("N° 25");
    expect(formatPokemonId(1)).toBe("N° 1");
  });
});

describe("capitalizeName", () => {
  it("capitalizes a single-word name", () => {
    expect(capitalizeName("pikachu")).toBe("Pikachu");
  });

  it("capitalizes hyphenated compound names", () => {
    expect(capitalizeName("mr-mime")).toBe("Mr Mime");
    expect(capitalizeName("ho-oh")).toBe("Ho Oh");
  });
});

describe("formatHeight", () => {
  it("converts decimeters to meters with one decimal", () => {
    expect(formatHeight(40)).toBe("4.0 m");
    expect(formatHeight(17)).toBe("1.7 m");
  });
});

describe("formatWeight", () => {
  it("converts hectograms to kilograms with one decimal", () => {
    expect(formatWeight(600)).toBe("60.0 kg");
    expect(formatWeight(905)).toBe("90.5 kg");
  });
});
