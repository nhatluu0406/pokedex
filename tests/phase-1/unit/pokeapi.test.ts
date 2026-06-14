import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchPokemonById,
  getAnimatedSpriteUrl,
  getStaticSpriteUrl,
} from "@/lib/pokeapi";
import { SPRITE_BASE } from "@/lib/constants";
import type { PokeApiPokemon } from "@/lib/types";

describe("getAnimatedSpriteUrl", () => {
  it("returns Gen V animated GIF for id below 650", () => {
    expect(getAnimatedSpriteUrl(25)).toBe(
      `${SPRITE_BASE}/versions/generation-v/black-white/animated/25.gif`,
    );
  });

  it("returns static PNG for id 649 (last GIF id)", () => {
    expect(getAnimatedSpriteUrl(649)).toBe(
      `${SPRITE_BASE}/versions/generation-v/black-white/animated/649.gif`,
    );
  });

  it("returns static PNG fallback for id 650 and above", () => {
    expect(getAnimatedSpriteUrl(650)).toBe(`${SPRITE_BASE}/650.png`);
    expect(getAnimatedSpriteUrl(1025)).toBe(`${SPRITE_BASE}/1025.png`);
  });
});

describe("getStaticSpriteUrl", () => {
  it("returns list thumbnail PNG URL for any id", () => {
    expect(getStaticSpriteUrl(1)).toBe(`${SPRITE_BASE}/1.png`);
    expect(getStaticSpriteUrl(650)).toBe(`${SPRITE_BASE}/650.png`);
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
