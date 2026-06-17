"use client";

import { useMemo } from "react";
import { TypeBadge } from "@/components/shared/TypeBadge";
import { getResistances, getTypeChart, getWeaknesses } from "@/lib/type-chart";

interface TypeEffectivenessProps {
  types: string[];
}

export function TypeEffectiveness({ types }: TypeEffectivenessProps) {
  const chart = useMemo(() => getTypeChart(), []);
  const weaknesses = useMemo(
    () => getWeaknesses(types, chart),
    [types, chart],
  );
  const resistances = useMemo(
    () => getResistances(types, chart),
    [types, chart],
  );

  if (weaknesses.length === 0 && resistances.length === 0) {
    return null;
  }

  return (
    <div className="detail-type-chart">
      {weaknesses.length > 0 && (
        <div className="detail-type-chart-row">
          <h3 className="detail-section-title">Weak to</h3>
          <div className="detail-type-chart-pills">
            {weaknesses.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      )}
      {resistances.length > 0 && (
        <div className="detail-type-chart-row">
          <h3 className="detail-section-title">Resists</h3>
          <div className="detail-type-chart-pills">
            {resistances.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
