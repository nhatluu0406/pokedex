import { describe, expect, it } from "vitest";
import { getResistances, getWeaknesses } from "@/lib/type-chart";
import type { TypeChartData } from "@/lib/types";

const chart: TypeChartData = {
  types: {
    electric: {
      name: "electric",
      damageRelations: {
        double_damage_from: ["ground"],
        half_damage_from: ["electric", "flying", "steel"],
        no_damage_from: [],
      },
    },
    fire: {
      name: "fire",
      damageRelations: {
        double_damage_from: ["water", "ground", "rock"],
        half_damage_from: ["fire", "grass", "ice", "bug", "steel", "fairy"],
        no_damage_from: [],
      },
    },
  },
};

describe("type-chart", () => {
  it("returns weaknesses for a single type", () => {
    expect(getWeaknesses(["electric"], chart)).toEqual(["ground"]);
  });

  it("unions weaknesses across dual types", () => {
    expect(getWeaknesses(["fire", "electric"], chart).sort()).toEqual(
      ["ground", "rock", "water"].sort(),
    );
  });

  it("returns resistances including immunities", () => {
    expect(getResistances(["electric"], chart).sort()).toEqual(
      ["electric", "flying", "steel"].sort(),
    );
  });
});
