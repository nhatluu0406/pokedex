"use client";

import { useCallback, useEffect, useState } from "react";
import { PokemonDetail } from "@/components/detail/PokemonDetail";
import { PokemonList } from "@/components/list/PokemonList";
import { BackToTop } from "@/components/shared/BackToTop";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useFavorites } from "@/hooks/useFavorites";
import { usePokemonNameIndex } from "@/hooks/usePokemonNameIndex";
import { parsePokemonHash, setPokemonHash } from "@/utils/hash";

export default function Home() {
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    return parsePokemonHash(window.location.hash);
  });
  const { index, loading: indexLoading, filterByName, getNameById } =
    usePokemonNameIndex();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const handleHashChange = () => {
      const id = parsePokemonHash(window.location.hash);
      setSelectedId(id);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
    setPokemonHash(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setPokemonHash(null);
  }, []);

  return (
    <>
      <LoadingScreen visible={indexLoading} />
      <main className="app-shell">
        <PokemonList
          selectedId={selectedId}
          onSelect={handleSelect}
          filterByName={filterByName}
          getNameById={getNameById}
          nameIndex={index}
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
        <PokemonDetail
          selectedId={selectedId}
          onSelect={handleSelect}
          onClose={handleClose}
          isFavorite={selectedId !== null ? isFavorite(selectedId) : false}
          onToggleFavorite={toggleFavorite}
        />
      </main>
      <BackToTop />
    </>
  );
}
