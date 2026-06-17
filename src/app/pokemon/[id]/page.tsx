import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PokedexApp } from "@/components/PokedexApp";
import {
  getAllPokemonStaticParams,
  readPokemonDetailFromDisk,
} from "@/lib/server-data";
import { capitalizeName } from "@/utils/format";

export function generateStaticParams() {
  return getAllPokemonStaticParams();
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pokemonId = Number.parseInt(id, 10);
  const data = await readPokemonDetailFromDisk(pokemonId);

  if (!data) {
    return { title: "Pokémon not found | Pokedex" };
  }

  const name = capitalizeName(data.name);
  const description =
    data.flavorText?.trim() ||
    `View ${name}'s stats, abilities, and evolution chain in the Pokedex.`;

  return {
    title: `${name} | Pokedex`,
    description,
    openGraph: {
      title: `${name} | Pokedex`,
      description,
      type: "website",
    },
  };
}

export default async function PokemonPage({ params }: PageProps) {
  const { id } = await params;
  const pokemonId = Number.parseInt(id, 10);
  const data = await readPokemonDetailFromDisk(pokemonId);

  if (!data) {
    notFound();
  }

  return (
    <PokedexApp
      initialSelectedId={pokemonId}
      initialDetail={data}
      linkMode="path"
    />
  );
}
