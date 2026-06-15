export interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
}

export interface PokemonNameEntry {
  id: number;
  name: string;
  types: string[];
}

export interface EvolutionDisplay {
  pokemon: { id: number; name: string }[];
  levels: (number | null)[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
  speciesUrl?: string;
  flavorText?: string;
  evolutionChainUrl?: string;
  evolution?: EvolutionDisplay | null;
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  species: { url: string };
}

export interface PokeApiNameList {
  results: { name: string; url: string }[];
}

export interface PokeApiSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  evolution_chain: { url: string };
}

export interface PokeApiEvolutionChain {
  chain: PokeApiEvolutionLink;
}

export interface PokeApiEvolutionLink {
  species: { name: string; url: string };
  evolves_to: {
    species: { name: string; url: string };
    evolution_details: { min_level: number | null }[];
    evolves_to: PokeApiEvolutionLink["evolves_to"];
  }[];
}
