"use client";

import { PokemonDetail } from "@/components/detail/PokemonDetail";
import { PokemonList } from "@/components/list/PokemonList";
import { BackToTop } from "@/components/shared/BackToTop";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useFavorites } from "@/hooks/useFavorites";
import { usePokemonHash } from "@/hooks/usePokemonHash";
import { usePokemonNameIndex } from "@/hooks/usePokemonNameIndex";

export default function Home() {
  const { selectedId, select, close } = usePokemonHash();
  const { index, loading: indexLoading, filterByName, getNameById } =
    usePokemonNameIndex();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  return (
    <>
      <LoadingScreen visible={indexLoading} />
      <main className="app-shell">
        <PokemonList
          selectedId={selectedId}
          onSelect={select}
          filterByName={filterByName}
          getNameById={getNameById}
          nameIndex={index}
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
        <PokemonDetail
          selectedId={selectedId}
          onSelect={select}
          onClose={close}
          isFavorite={selectedId !== null ? isFavorite(selectedId) : false}
          onToggleFavorite={toggleFavorite}
        />
      </main>
      <BackToTop />
    </>
  );
}
