export interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  isLegendary?: boolean;
  isMythical?: boolean;
  isBaby?: boolean;
  color?: string | null;
  habitat?: string | null;
  weaknesses?: string[];
  resistances?: string[];
}

export interface PokemonNameEntry {
  id: number;
  name: string;
  types: string[];
  isLegendary?: boolean;
  isMythical?: boolean;
  isBaby?: boolean;
  color?: string | null;
  habitat?: string | null;
  weaknesses?: string[];
  resistances?: string[];
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
  genera?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  cryUrl?: string;
}

export interface TypeDamageRelations {
  double_damage_from: string[];
  half_damage_from: string[];
  no_damage_from: string[];
}

export interface TypeChartEntry {
  name: string;
  damageRelations: TypeDamageRelations;
}

export interface TypeChartData {
  types: Record<string, TypeChartEntry>;
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
  cries?: { latest: string };
  sprites?: {
    other?: {
      showdown?: { front_default: string | null };
    };
  };
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
  genera: { genus: string; language: { name: string } }[];
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  color: { name: string };
  habitat: { name: string } | null;
}

export interface PokeApiType {
  id: number;
  name: string;
  damage_relations: {
    double_damage_from: { name: string }[];
    half_damage_from: { name: string }[];
    no_damage_from: { name: string }[];
  };
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
