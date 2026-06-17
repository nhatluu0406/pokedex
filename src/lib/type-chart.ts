import typeChartData from "../../public/data/types.json";
import type { TypeChartData } from "./types";

const chart = typeChartData as TypeChartData;

export function getTypeChart(): TypeChartData {
  return chart;
}

/** Union of types that deal 2× damage to any of the defender's types. */
export function getWeaknesses(
  defenderTypes: string[],
  chart: TypeChartData,
): string[] {
  const weaknesses = new Set<string>();

  for (const defType of defenderTypes) {
    const entry = chart.types[defType];
    if (!entry) continue;
    for (const attackingType of entry.damageRelations.double_damage_from) {
      weaknesses.add(attackingType);
    }
  }

  return Array.from(weaknesses).sort();
}

export function getResistances(
  defenderTypes: string[],
  chart: TypeChartData,
): string[] {
  const resistances = new Set<string>();

  for (const defType of defenderTypes) {
    const entry = chart.types[defType];
    if (!entry) continue;
    for (const attackingType of entry.damageRelations.half_damage_from) {
      resistances.add(attackingType);
    }
    for (const attackingType of entry.damageRelations.no_damage_from) {
      resistances.add(attackingType);
    }
  }

  return Array.from(resistances).sort();
}
