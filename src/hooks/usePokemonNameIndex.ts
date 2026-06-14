"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPokemonNameIndex } from "@/lib/pokeapi";
import { TOTAL_POKEMON } from "@/lib/constants";
import type { PokemonNameEntry } from "@/lib/types";

const ALL_IDS = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);

export function usePokemonNameIndex() {
  const [index, setIndex] = useState<PokemonNameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetchPokemonNameIndex(abortController.signal)
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
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
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
    (query: string): number[] => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return ALL_IDS;

      return index
        .filter((entry) =>
          entry.name.replaceAll("-", " ").includes(normalized),
        )
        .map((entry) => entry.id);
    },
    [index],
  );

  return { index, loading, error, filterByName, nameById, getNameById };
}
