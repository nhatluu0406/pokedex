"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPokemonDetail } from "@/lib/data";
import type { PokemonDetail } from "@/lib/types";

export function usePokemonDetail(id: number | null) {
  const [data, setData] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => {
    setRetryKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (id === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when detail closes
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const abortController = new AbortController();

    setData(null);
    setLoading(true);
    setError(null);

    fetchPokemonDetail(id, abortController.signal)
      .then((detail) => {
        if (!abortController.signal.aborted) {
          setData(detail);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (abortController.signal.aborted) return;
        if (err.name === "AbortError") return;
        setError("Couldn't load Pokémon data. Try again.");
        setLoading(false);
      });

    return () => abortController.abort();
  }, [id, retryKey]);

  return {
    data: id === null ? null : data,
    loading: id === null ? false : loading,
    error: id === null ? null : error,
    retry,
  };
}
