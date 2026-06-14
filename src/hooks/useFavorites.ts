"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pokedex-favorites";

function readFavorites(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((value): value is number => typeof value === "number"),
    );
  } catch {
    return new Set();
  }
}

function writeFavorites(favorites: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(() => readFavorites());

  useEffect(() => {
    writeFavorites(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number) => favorites.has(id),
    [favorites],
  );

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
