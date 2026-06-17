"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchNameIndex } from "@/lib/data";
import type { PokemonNameEntry } from "@/lib/types";
import { matchPokemonSearch } from "@/utils/pokemonSearch";

export function usePokemonNameIndex() {
  const [index, setIndex] = useState<PokemonNameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetchNameIndex(abortController.signal)
      .then((entries) => {
        if (!abortController.signal.aborted) {
          setIndex(entries);
        }
      })
      .catch((err: Error) => {
        if (abortController.signal.aborted || err.name === "AbortError") return;
        setError("Failed to load Pokémon index.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => abortController.abort();
  }, []);

  const nameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const entry of index) {
      map.set(entry.id, entry.name);
    }
    return map;
  }, [index]);

  const getNameById = useCallback(
    (id: number): string | undefined => nameById.get(id),
    [nameById],
  );

  const filterByName = useCallback(
    (query: string): number[] => matchPokemonSearch(query, index),
    [index],
  );

  return { index, loading, error, filterByName, nameById, getNameById };
}
