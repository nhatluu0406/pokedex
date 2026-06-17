import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchPokemonById,
  getAnimatedSpriteFallbackUrl,
  getAnimatedSpriteUrl,
  getStaticSpriteUrl,
} from "@/lib/pokeapi";
import type { PokeApiPokemon } from "@/lib/types";

describe("getAnimatedSpriteUrl", () => {
  it("returns local animated GIF for id below 650", () => {
    expect(getAnimatedSpriteUrl(25)).toBe("/sprites/animated/25.gif");
  });

  it("returns local animated GIF for id 649 (last GIF id)", () => {
    expect(getAnimatedSpriteUrl(649)).toBe("/sprites/animated/649.gif");
  });

  it("returns showdown GIF path for id 650 and above", () => {
    expect(getAnimatedSpriteUrl(650)).toBe("/sprites/showdown/650.gif");
    expect(getAnimatedSpriteUrl(1025)).toBe("/sprites/showdown/1025.gif");
  });

  it("falls back to static PNG via getAnimatedSpriteFallbackUrl", () => {
    expect(getAnimatedSpriteFallbackUrl(650)).toBe("/sprites/pokemon/650.png");
  });
});

describe("getStaticSpriteUrl", () => {
  it("returns local list thumbnail PNG path for any id", () => {
    expect(getStaticSpriteUrl(1)).toBe("/sprites/pokemon/1.png");
    expect(getStaticSpriteUrl(650)).toBe("/sprites/pokemon/650.png");
  });
});

describe("fetchPokemonById", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps stats by stat.name, not array order", async () => {
    const apiPayload: PokeApiPokemon = {
      id: 25,
      name: "pikachu",
      height: 4,
      weight: 60,
      types: [{ type: { name: "electric" } }],
      abilities: [{ ability: { name: "static" } }],
      stats: [
        { base_stat: 90, stat: { name: "speed" } },
        { base_stat: 35, stat: { name: "hp" } },
        { base_stat: 55, stat: { name: "attack" } },
        { base_stat: 40, stat: { name: "defense" } },
        { base_stat: 50, stat: { name: "special-attack" } },
        { base_stat: 50, stat: { name: "special-defense" } },
      ],
      species: { url: "https://pokeapi.co/api/v2/pokemon-species/25/" },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => apiPayload,
      }),
    );

    const detail = await fetchPokemonById(25);

    expect(detail.stats).toEqual([
      { name: "speed", value: 90 },
      { name: "hp", value: 35 },
      { name: "attack", value: 55 },
      { name: "defense", value: 40 },
      { name: "special-attack", value: 50 },
      { name: "special-defense", value: 50 },
    ]);
    expect(detail.types).toEqual(["electric"]);
    expect(detail.abilities).toEqual(["static"]);
    expect(detail.speciesUrl).toBe(
      "https://pokeapi.co/api/v2/pokemon-species/25/",
    );
  });

  it("throws when the API response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(fetchPokemonById(99999)).rejects.toThrow(
      "Failed to fetch Pokémon #99999",
    );
  });
});
