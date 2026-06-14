"use client";

import Image from "next/image";
import { TypeBadge } from "@/components/shared/TypeBadge";
import { getStaticSpriteUrl } from "@/lib/pokeapi";
import { capitalizeName, formatPokemonId } from "@/utils/format";

interface PokemonCardProps {
  id: number;
  name: string | undefined;
  types: string[] | undefined;
  typesLoading: boolean;
  selected: boolean;
  favorite: boolean;
  onSelect: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export function PokemonCard({
  id,
  name,
  types,
  typesLoading,
  selected,
  favorite,
  onSelect,
  onToggleFavorite,
}: PokemonCardProps) {
  const displayName = name ? capitalizeName(name) : `#${id}`;

  return (
    <article
      className={`pokemon-card${selected ? " pokemon-card-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Select ${displayName}`}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(id);
        }
      }}
    >
      <button
        type="button"
        className={`favorite-btn${favorite ? " favorite-btn-active" : ""}`}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorite}
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(id);
        }}
      >
        {favorite ? "★" : "☆"}
      </button>
      <div className="pokemon-card-sprite">
        <Image
          src={getStaticSpriteUrl(id)}
          alt={`${displayName} thumbnail`}
          width={88}
          height={88}
          loading="lazy"
        />
      </div>
      <span className="pokemon-card-id">{formatPokemonId(id)}</span>
      <span className="pokemon-card-name">{displayName}</span>
      {types ? (
        <div className="pokemon-card-types">
          {types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      ) : typesLoading ? (
        <span className="pokemon-card-types pokemon-card-loading">...</span>
      ) : null}
    </article>
  );
}
