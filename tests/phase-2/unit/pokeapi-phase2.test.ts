import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractSpeciesId,
  fetchPokemonNameIndex,
  fetchPokemonSpecies,
  parseEvolutionChain,
} from "@/lib/pokeapi";
import type { PokeApiEvolutionChain, PokeApiSpecies } from "@/lib/types";

describe("extractSpeciesId", () => {
  it("extracts numeric id from species URL", () => {
    expect(
      extractSpeciesId("https://pokeapi.co/api/v2/pokemon-species/25/"),
    ).toBe(25);
  });
});

describe("parseEvolutionChain", () => {
  it("returns null when there are no evolutions", () => {
    const chain: PokeApiEvolutionChain = {
      chain: {
        species: {
          name: "ditto",
          url: "https://pokeapi.co/api/v2/pokemon-species/132/",
        },
        evolves_to: [],
      },
    };

    expect(parseEvolutionChain(chain)).toBeNull();
  });

  it("parses a two-stage evolution chain", () => {
    const chain: PokeApiEvolutionChain = {
      chain: {
        species: {
          name: "pikachu",
          url: "https://pokeapi.co/api/v2/pokemon-species/25/",
        },
        evolves_to: [
          {
            species: {
              name: "raichu",
              url: "https://pokeapi.co/api/v2/pokemon-species/26/",
            },
            evolution_details: [{ min_level: 20 }],
            evolves_to: [],
          },
        ],
      },
    };

    expect(parseEvolutionChain(chain)).toEqual({
      pokemon: [
        { id: 25, name: "pikachu" },
        { id: 26, name: "raichu" },
      ],
      levels: [20],
    });
  });

  it("parses a three-stage evolution chain", () => {
    const chain: PokeApiEvolutionChain = {
      chain: {
        species: {
          name: "bulbasaur",
          url: "https://pokeapi.co/api/v2/pokemon-species/1/",
        },
        evolves_to: [
          {
            species: {
              name: "ivysaur",
              url: "https://pokeapi.co/api/v2/pokemon-species/2/",
            },
            evolution_details: [{ min_level: 16 }],
            evolves_to: [
              {
                species: {
                  name: "venusaur",
                  url: "https://pokeapi.co/api/v2/pokemon-species/3/",
                },
                evolution_details: [{ min_level: 32 }],
                evolves_to: [],
              },
            ],
          },
        ],
      },
    };

    expect(parseEvolutionChain(chain)).toEqual({
      pokemon: [
        { id: 1, name: "bulbasaur" },
        { id: 2, name: "ivysaur" },
        { id: 3, name: "venusaur" },
      ],
      levels: [16, 32],
    });
  });
});

describe("fetchPokemonNameIndex", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps results to sequential ids", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
          ],
        }),
      }),
    );

    const index = await fetchPokemonNameIndex();
    expect(index).toEqual([
      { id: 1, name: "bulbasaur" },
      { id: 2, name: "ivysaur" },
    ]);
  });
});

describe("fetchPokemonSpecies", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns English flavor text and evolution chain URL", async () => {
    const species: PokeApiSpecies = {
      flavor_text_entries: [
        {
          flavor_text: "Seed Pokémon\f",
          language: { name: "ja" },
        },
        {
          flavor_text: "A strange seed was\fplanted on its back at birth.",
          language: { name: "en" },
        },
      ],
      evolution_chain: {
        url: "https://pokeapi.co/api/v2/evolution-chain/1/",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => species,
      }),
    );

    const result = await fetchPokemonSpecies(
      "https://pokeapi.co/api/v2/pokemon-species/1/",
    );

    expect(result.flavorText).toBe(
      "A strange seed was planted on its back at birth.",
    );
    expect(result.evolutionChainUrl).toBe(
      "https://pokeapi.co/api/v2/evolution-chain/1/",
    );
  });
});
