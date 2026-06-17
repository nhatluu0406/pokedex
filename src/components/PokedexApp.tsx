"use client";

import { useRouter } from "next/navigation";
import { PokemonDetail } from "@/components/detail/PokemonDetail";
import { PokemonList } from "@/components/list/PokemonList";
import { BackToTop } from "@/components/shared/BackToTop";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useFavorites } from "@/hooks/useFavorites";
import { usePokemonHash } from "@/hooks/usePokemonHash";
import { usePokemonNameIndex } from "@/hooks/usePokemonNameIndex";
import type { PokemonDetail as PokemonDetailData } from "@/lib/types";

interface PokedexAppProps {
  /** Pre-selected Pokémon on `/pokemon/[id]` SSG routes. */
  initialSelectedId?: number;
  /** Server-loaded detail — skips client fetch on first paint. */
  initialDetail?: PokemonDetailData;
  /** `path` uses `/pokemon/{id}` URLs; `hash` uses `/#pokemon/{id}` on home. */
  linkMode?: "path" | "hash";
}

export function PokedexApp({
  initialSelectedId,
  initialDetail,
  linkMode = "hash",
}: PokedexAppProps) {
  const router = useRouter();
  const hash = usePokemonHash();
  const { index, loading: indexLoading, filterByName, getNameById } =
    usePokemonNameIndex();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const selectedId =
    linkMode === "path" ? (initialSelectedId ?? null) : hash.selectedId;

  const select = (id: number) => {
    if (linkMode === "path") {
      router.push(`/pokemon/${id}`);
      return;
    }
    hash.select(id);
  };

  const close = () => {
    if (linkMode === "path") {
      router.push("/");
      return;
    }
    hash.close();
  };

  const detailInitialData =
    initialDetail && initialDetail.id === selectedId ? initialDetail : undefined;

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
          initialData={detailInitialData}
        />
      </main>
      <BackToTop />
    </>
  );
}
