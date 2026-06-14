"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPokemonTypes } from "@/lib/pokeapi";

const MAX_CONCURRENT = 6;

export function useInfinitePokemonList(sourceIds: number[], pageSize = 30) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [typesCache, setTypesCache] = useState<Map<number, string[]>>(
    new Map(),
  );
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const fetchedRef = useRef<Set<number>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sourceKey = sourceIds.join(",");

  const visibleIds = useMemo(
    () => sourceIds.slice(0, visibleCount),
    [sourceIds, visibleCount],
  );
  const hasMore = visibleCount < sourceIds.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, sourceIds.length));
  }, [pageSize, sourceIds.length]);

  useEffect(() => {
    // Reset visible range when the filtered ID list changes (search).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional pagination reset
    setVisibleCount(pageSize);
  }, [sourceKey, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, visibleIds.length]);

  useEffect(() => {
    const abortController = new AbortController();
    const inFlight = new Set<number>();
    let activeCount = 0;

    const queue = visibleIds.filter((id) => !fetchedRef.current.has(id));

    function pumpQueue() {
      while (activeCount < MAX_CONCURRENT && queue.length > 0) {
        const id = queue.shift()!;
        if (fetchedRef.current.has(id) || inFlight.has(id)) continue;
        startFetch(id);
      }
    }

    function startFetch(id: number) {
      inFlight.add(id);
      activeCount++;

      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      fetchPokemonTypes(id, abortController.signal)
        .then((types) => {
          if (abortController.signal.aborted) return;

          fetchedRef.current.add(id);
          setTypesCache((prev) => {
            const next = new Map(prev);
            next.set(id, types);
            return next;
          });
        })
        .catch(() => {
          // Leave ID out of fetchedRef so a later scroll/render can retry.
        })
        .finally(() => {
          inFlight.delete(id);
          activeCount--;

          setLoadingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });

          if (!abortController.signal.aborted) {
            pumpQueue();
          }
        });
    }

    pumpQueue();

    return () => abortController.abort();
  }, [visibleIds]);

  return { visibleIds, typesCache, loadingIds, sentinelRef, hasMore };
}
