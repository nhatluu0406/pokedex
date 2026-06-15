"use client";

import Image from "next/image";
import { getStaticSpriteUrl } from "@/lib/pokeapi";
import type { EvolutionDisplay } from "@/lib/types";
import { capitalizeName } from "@/utils/format";

interface EvolutionChainProps {
  evolution?: EvolutionDisplay | null;
  onSelect: (id: number) => void;
}

export function EvolutionChain({ evolution, onSelect }: EvolutionChainProps) {
  if (!evolution) return null;

  return (
    <div className="detail-evolution">
      <h3 className="detail-section-title">Evolution</h3>
      <div className="evolution-chain">
        {evolution.pokemon.map((stage, index) => (
          <div key={stage.id} className="evolution-stage-group">
            {index > 0 && (
              <div className="evolution-level">
                Lv. {evolution.levels[index - 1] ?? "?"}
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
