"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPokemonListItem } from "@/lib/pokeapi";
import { TOTAL_POKEMON } from "@/lib/constants";
import type { PokemonListItem } from "@/lib/types";

export function usePokemonList(pageSize = 30) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [cache, setCache] = useState<Map<number, PokemonListItem>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const fetchedRef = useRef<Set<number>>(new Set());

  const visibleIds = Array.from(
    { length: Math.min(visibleCount, TOTAL_POKEMON) },
    (_, i) => i + 1,
  );

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, TOTAL_POKEMON));
  }, [pageSize]);

  useEffect(() => {
    const abortController = new AbortController();
    const count = Math.min(visibleCount, TOTAL_POKEMON);
    const idsToFetch: number[] = [];

    for (let id = 1; id <= count; id++) {
      if (!fetchedRef.current.has(id)) {
        idsToFetch.push(id);
      }
    }

    idsToFetch.forEach((id) => {
      fetchedRef.current.add(id);

      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      fetchPokemonListItem(id, abortController.signal)
        .then((item) => {
          if (abortController.signal.aborted) return;

          setCache((prev) => {
            const next = new Map(prev);
            next.set(id, item);
            return next;
          });
        })
        .catch(() => {
          if (abortController.signal.aborted) return;
          fetchedRef.current.delete(id);
        })
        .finally(() => {
          if (abortController.signal.aborted) return;

          setLoadingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
    });

    return () => abortController.abort();
  }, [visibleCount]);

  return { visibleIds, loadMore, cache, loadingIds };
}
