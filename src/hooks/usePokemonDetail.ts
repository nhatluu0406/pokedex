"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPokemonDetail } from "@/lib/data";
import type { PokemonDetail } from "@/lib/types";

export function usePokemonDetail(
  id: number | null,
  options?: { initialData?: PokemonDetail | null },
) {
  const initialData = options?.initialData;
  const [data, setData] = useState<PokemonDetail | null>(() =>
    id !== null && initialData?.id === id ? initialData : null,
  );
  const [loading, setLoading] = useState(
    () => id !== null && !(initialData?.id === id),
  );
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

    if (retryKey === 0 && initialData?.id === id) {
      setData(initialData);
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
  }, [id, retryKey, initialData]);

  return {
    data: id === null ? null : data,
    loading: id === null ? false : loading,
    error: id === null ? null : error,
    retry,
  };
}
