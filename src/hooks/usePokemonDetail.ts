"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPokemonById, fetchPokemonSpecies } from "@/lib/pokeapi";
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

    fetchPokemonById(id, abortController.signal)
      .then(async (detail) => {
        if (abortController.signal.aborted) return detail;

        if (detail.speciesUrl) {
          const species = await fetchPokemonSpecies(
            detail.speciesUrl,
            abortController.signal,
          );
          return {
            ...detail,
            flavorText: species.flavorText,
            evolutionChainUrl: species.evolutionChainUrl,
          };
        }

        return detail;
      })
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
