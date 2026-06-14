"use client";

import type { ListMode } from "@/utils/pokemonFilters";

interface ListFilterBarProps {
  mode: ListMode;
  allActive: boolean;
  onChange: (mode: ListMode) => void;
}

export function ListFilterBar({ mode, allActive, onChange }: ListFilterBarProps) {
  return (
    <div className="list-filter-bar" role="group" aria-label="List filter">
      <button
        type="button"
        className={`list-filter-chip${allActive ? " list-filter-chip-active" : ""}`}
        aria-pressed={allActive}
        onClick={() => onChange("all")}
      >
        All
      </button>
      <button
        type="button"
        className={`list-filter-chip${mode === "favorites" ? " list-filter-chip-active" : ""}`}
        aria-pressed={mode === "favorites"}
        onClick={() => onChange("favorites")}
      >
        ★ Favorites
      </button>
    </div>
  );
}
