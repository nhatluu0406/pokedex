"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PokemonCard } from "./PokemonCard";
import { LoadMoreTrigger } from "./LoadMoreTrigger";
import { FavoritesToggle } from "@/components/search/FavoritesToggle";
import {
  FilterCategorySelect,
  FilterValueBar,
} from "@/components/search/FilterCombobox";
import { SearchBar } from "@/components/search/SearchBar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useInfinitePokemonList } from "@/hooks/useInfinitePokemonList";
import type { PokemonNameEntry } from "@/lib/types";
import { scrollToPokemonCard } from "@/utils/scrollToPokemonCard";
import {
  buildIndexMap,
  filterByCategory,
  filterByColor,
  filterByFavorites,
  filterByHabitat,
  filterByTactical,
  filterByType,
  type CategoryFilter,
  type FilterGroup,
  type ListMode,
  type TacticalFilter,
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

const INITIAL_TACTICAL: TacticalFilter = { mode: "none", type: null };

function clearGroupState() {
  return {
    categoryFilter: "all" as CategoryFilter,
    tactical: INITIAL_TACTICAL,
    selectedTypes: [] as string[],
    selectedColors: [] as string[],
    selectedHabitats: [] as string[],
  };
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
  const [filterGroup, setFilterGroup] = useState<FilterGroup>("type");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [tactical, setTactical] = useState<TacticalFilter>(INITIAL_TACTICAL);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedHabitats, setSelectedHabitats] = useState<string[]>([]);
  const previousQueryRef = useRef("");
  const previousSelectedIdRef = useRef<number | null>(null);
  const pendingCloseScrollIdRef = useRef<number | null>(null);
  const skipScrollForIdRef = useRef<number | null>(null);
  const isFirstFilterScrollRef = useRef(true);

  const handleListSelect = useCallback(
    (id: number) => {
      skipScrollForIdRef.current = id;
      onSelect(id);
    },
    [onSelect],
  );

  const indexMap = useMemo(() => buildIndexMap(nameIndex), [nameIndex]);

  const nameFilteredIds = useMemo(
    () => filterByName(query),
    [query, filterByName],
  );

  const categoryFilteredIds = useMemo(
    () => filterByCategory(nameFilteredIds, categoryFilter, indexMap),
    [nameFilteredIds, categoryFilter, indexMap],
  );

  const favoritesFilteredIds = useMemo(
    () => filterByFavorites(categoryFilteredIds, listMode, favorites),
    [categoryFilteredIds, listMode, favorites],
  );

  const tacticalFilteredIds = useMemo(
    () => filterByTactical(favoritesFilteredIds, tactical, indexMap),
    [favoritesFilteredIds, tactical, indexMap],
  );

  const colorHabitatFilteredIds = useMemo(() => {
    let ids = tacticalFilteredIds;
    ids = filterByColor(ids, selectedColors, indexMap);
    ids = filterByHabitat(ids, selectedHabitats, indexMap);
    return ids;
  }, [tacticalFilteredIds, selectedColors, selectedHabitats, indexMap]);

  const { visibleIds, typesCache, sentinelRef, hasMore, ensureIdVisible } =
    useInfinitePokemonList(colorHabitatFilteredIds, nameIndex);

  const displayIds = useMemo(
    () => filterByType(visibleIds, selectedTypes, typesCache),
    [visibleIds, selectedTypes, typesCache],
  );

  const handleGroupChange = (group: FilterGroup) => {
    setFilterGroup(group);
    const cleared = clearGroupState();
    setCategoryFilter(cleared.categoryFilter);
    setTactical(cleared.tactical);
    setSelectedTypes(cleared.selectedTypes);
    setSelectedColors(cleared.selectedColors);
    setSelectedHabitats(cleared.selectedHabitats);
  };

  const handleCategorySelect = (category: CategoryFilter) => {
    setCategoryFilter((current) =>
      current === category ? "all" : category,
    );
  };

  const handleTacticalSelect = (type: string) => {
    if (filterGroup === "weak") {
      setTactical((current) =>
        current.mode === "weak" && current.type === type
          ? INITIAL_TACTICAL
          : { mode: "weak", type },
      );
      return;
    }
    if (filterGroup === "resist") {
      setTactical((current) =>
        current.mode === "resist" && current.type === type
          ? INITIAL_TACTICAL
          : { mode: "resist", type },
      );
    }
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type],
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((current) =>
      current.includes(color)
        ? current.filter((value) => value !== color)
        : [...current, color],
    );
  };

  const handleHabitatToggle = (habitat: string) => {
    setSelectedHabitats((current) =>
      current.includes(habitat)
        ? current.filter((value) => value !== habitat)
        : [...current, habitat],
    );
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    listMode === "favorites" ||
    categoryFilter !== "all" ||
    tactical.mode !== "none" ||
    selectedColors.length > 0 ||
    selectedHabitats.length > 0 ||
    selectedTypes.length > 0;

  const hasFilterGroupSelection =
    (filterGroup === "type" &&
      (selectedTypes.length > 0 || categoryFilter !== "all")) ||
    (filterGroup === "weak" &&
      tactical.mode === "weak" &&
      tactical.type !== null) ||
    (filterGroup === "resist" &&
      tactical.mode === "resist" &&
      tactical.type !== null) ||
    (filterGroup === "color" && selectedColors.length > 0) ||
    (filterGroup === "habitat" && selectedHabitats.length > 0);

  const filterScrollKey = [
    listMode,
    filterGroup,
    categoryFilter,
    tactical.mode,
    tactical.type,
    selectedColors.join(","),
    selectedHabitats.join(","),
    selectedTypes.join(","),
  ].join("|");

  useEffect(() => {
    if (previousQueryRef.current === query) return;
    previousQueryRef.current = query;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [query]);

  useEffect(() => {
    if (isFirstFilterScrollRef.current) {
      isFirstFilterScrollRef.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [filterScrollKey]);

  useEffect(() => {
    const previousSelectedId = previousSelectedIdRef.current;
    previousSelectedIdRef.current = selectedId;

    if (selectedId !== null) {
      ensureIdVisible(selectedId);
      return;
    }

    if (previousSelectedId !== null) {
      pendingCloseScrollIdRef.current = previousSelectedId;
    }
  }, [selectedId, ensureIdVisible]);

  useLayoutEffect(() => {
    const closeScrollTarget = pendingCloseScrollIdRef.current;
    if (closeScrollTarget !== null) {
      if (!displayIds.includes(closeScrollTarget)) return;

      const card = document.querySelector(
        `[data-pokemon-id="${closeScrollTarget}"]`,
      );
      if (!card) return;

      pendingCloseScrollIdRef.current = null;
      scrollToPokemonCard(closeScrollTarget, {
        onlyIfNeeded: true,
        behavior: "smooth",
      });
      return;
    }

    if (selectedId === null) return;
    if (!displayIds.includes(selectedId)) return;

    if (skipScrollForIdRef.current === selectedId) {
      skipScrollForIdRef.current = null;
      return;
    }

    const card = document.querySelector(`[data-pokemon-id="${selectedId}"]`);
    if (!card) return;

    scrollToPokemonCard(selectedId, {
      onlyIfNeeded: true,
      behavior: "auto",
    });
  }, [displayIds, selectedId]);

  return (
    <section className="pokemon-list">
      <div className="search-toolbar-row">
        <FilterCategorySelect
          group={filterGroup}
          hasActiveSelection={hasFilterGroupSelection}
          onGroupChange={handleGroupChange}
        />
        <div className="search-bar-wrap">
          <SearchBar onChange={setQuery} />
        </div>
        <FavoritesToggle mode={listMode} onChange={setListMode} />
        <ThemeToggle />
      </div>
      <FilterValueBar
        group={filterGroup}
        categoryFilter={categoryFilter}
        tactical={tactical}
        selectedTypes={selectedTypes}
        selectedColors={selectedColors}
        selectedHabitats={selectedHabitats}
        onCategorySelect={handleCategorySelect}
        onTacticalSelect={handleTacticalSelect}
        onTypeToggle={handleTypeToggle}
        onColorToggle={handleColorToggle}
        onHabitatToggle={handleHabitatToggle}
      />
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
              selected={id === selectedId}
              favorite={isFavorite(id)}
              onSelect={handleListSelect}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
      {hasMore && <LoadMoreTrigger ref={sentinelRef} />}
    </section>
  );
}
