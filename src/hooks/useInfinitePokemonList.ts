"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PokemonNameEntry } from "@/lib/types";

export function useInfinitePokemonList(
  sourceIds: number[],
  nameIndex: PokemonNameEntry[],
  pageSize = 30,
) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sourceKey = sourceIds.join(",");

  const typesCache = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const entry of nameIndex) {
      map.set(entry.id, entry.types);
    }
    return map;
  }, [nameIndex]);

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

  return {
    visibleIds,
    typesCache,
    loadingIds: new Set<number>(),
    sentinelRef,
    hasMore,
  };
}
