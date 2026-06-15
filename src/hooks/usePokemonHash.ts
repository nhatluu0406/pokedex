"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getPokemonHashSelectedId,
  setPokemonHash,
  subscribeToPokemonHash,
} from "@/utils/hash";

function getServerHashSnapshot(): null {
  return null;
}

export function usePokemonHash() {
  const selectedId = useSyncExternalStore(
    subscribeToPokemonHash,
    getPokemonHashSelectedId,
    getServerHashSnapshot,
  );

  const select = useCallback((id: number) => {
    setPokemonHash(id);
  }, []);

  const close = useCallback(() => {
    setPokemonHash(null);
  }, []);

  return { selectedId, select, close };
}
