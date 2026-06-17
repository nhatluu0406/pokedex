"use client";

import type { ListMode } from "@/utils/pokemonFilters";

interface FavoritesToggleProps {
  mode: ListMode;
  onChange: (mode: ListMode) => void;
}

export function FavoritesToggle({ mode, onChange }: FavoritesToggleProps) {
  const active = mode === "favorites";

  return (
    <button
      type="button"
      className={`theme-toggle favorites-toggle${active ? " favorites-toggle-active" : ""}`}
      aria-label={active ? "Show all Pokémon" : "Show favorites only"}
      aria-pressed={active}
      title={active ? "Show all" : "Favorites"}
      onClick={() => onChange(active ? "all" : "favorites")}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
