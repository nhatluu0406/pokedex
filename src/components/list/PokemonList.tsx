"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PokemonCard } from "./PokemonCard";
import { LoadMoreTrigger } from "./LoadMoreTrigger";
import { ListFilterBar } from "@/components/search/ListFilterBar";
import { SearchBar } from "@/components/search/SearchBar";
import { TypeFilter } from "@/components/search/TypeFilter";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useInfinitePokemonList } from "@/hooks/useInfinitePokemonList";
import type { PokemonNameEntry } from "@/lib/types";
import {
  filterByFavorites,
  filterByType,
  type ListMode,
} from "@/utils/pokemonFilters";

interface PokemonListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  filterByName: (query: string) => number[];
  getNameById: (id: number) => string | undefined;
  nameIndex: PokemonNameEntry[];
  favorites: Set<number>;
  isFavorite: (id: number) => boolean;
  onToggleFavorite: (id: number) => void;
}

export function PokemonList({
  selectedId,
  onSelect,
  filterByName,
  getNameById,
  nameIndex,
  favorites,
  isFavorite,
  onToggleFavorite,
}: PokemonListProps) {
  const [query, setQuery] = useState("");
  const [listMode, setListMode] = useState<ListMode>("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const previousQueryRef = useRef("");

  const nameFilteredIds = useMemo(
    () => filterByName(query),
    [query, filterByName],
  );

  const favoritesFilteredIds = useMemo(
    () => filterByFavorites(nameFilteredIds, listMode, favorites),
    [nameFilteredIds, listMode, favorites],
  );

  const { visibleIds, typesCache, loadingIds, sentinelRef, hasMore } =
    useInfinitePokemonList(favoritesFilteredIds, nameIndex);

  const displayIds = useMemo(
    () => filterByType(visibleIds, selectedTypes, typesCache),
    [visibleIds, selectedTypes, typesCache],
  );

  const allActive = listMode === "all" && selectedTypes.length === 0;

  const handleListModeChange = (mode: ListMode) => {
    setListMode(mode);
    if (mode === "all") {
      setSelectedTypes([]);
    }
  };

  const handleTypesChange = (types: string[]) => {
    setSelectedTypes(types);
  };

  const hasActiveFilters =
    query.trim() !== "" || listMode === "favorites" || selectedTypes.length > 0;

  const selectedTypesKey = selectedTypes.join(",");

  useEffect(() => {
    if (previousQueryRef.current === query) return;
    previousQueryRef.current = query;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [query]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [listMode, selectedTypesKey]);

  return (
    <section className="pokemon-list">
      <div className="search-toolbar-row">
        <ListFilterBar
          mode={listMode}
          allActive={allActive}
          onChange={handleListModeChange}
        />
        <div className="search-bar-wrap">
          <SearchBar onChange={setQuery} />
        </div>
        <ThemeToggle />
      </div>
      <TypeFilter selectedTypes={selectedTypes} onChange={handleTypesChange} />
      {displayIds.length === 0 && hasActiveFilters ? (
        <p className="pokemon-list-empty">No Pokémon found.</p>
      ) : (
        <div className="pokemon-grid">
          {displayIds.map((id) => (
            <PokemonCard
              key={id}
              id={id}
              name={getNameById(id)}
              types={typesCache.get(id)}
              typesLoading={loadingIds.has(id)}
              selected={id === selectedId}
              favorite={isFavorite(id)}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
      {hasMore && <LoadMoreTrigger ref={sentinelRef} />}
    </section>
  );
}
