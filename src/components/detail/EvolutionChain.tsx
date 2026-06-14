"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchEvolutionChain, getStaticSpriteUrl } from "@/lib/pokeapi";
import type { EvolutionDisplay } from "@/lib/types";
import { capitalizeName } from "@/utils/format";

interface EvolutionChainProps {
  evolutionChainUrl?: string;
  onSelect: (id: number) => void;
}

export function EvolutionChain({
  evolutionChainUrl,
  onSelect,
}: EvolutionChainProps) {
  const [chain, setChain] = useState<EvolutionDisplay | null>(null);

  useEffect(() => {
    if (!evolutionChainUrl) return;

    const abortController = new AbortController();

    fetchEvolutionChain(evolutionChainUrl, abortController.signal)
      .then((result) => {
        if (!abortController.signal.aborted) {
          setChain(result);
        }
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setChain(null);
        }
      });

    return () => abortController.abort();
  }, [evolutionChainUrl]);

  if (!chain) return null;

  return (
    <div className="detail-evolution">
      <h3 className="detail-section-title">Evolution</h3>
      <div className="evolution-chain">
        {chain.pokemon.map((stage, index) => (
          <div key={stage.id} className="evolution-stage-group">
            {index > 0 && (
              <div className="evolution-level">
                Lv. {chain.levels[index - 1] ?? "?"}
              </div>
            )}
            <button
              type="button"
              className="evolution-sprite-btn"
              onClick={() => onSelect(stage.id)}
              aria-label={`View ${capitalizeName(stage.name)}`}
            >
              <Image
                src={getStaticSpriteUrl(stage.id)}
                alt={`${capitalizeName(stage.name)} sprite`}
                width={56}
                height={56}
                className="evolution-sprite"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
