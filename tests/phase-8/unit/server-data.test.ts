import { describe, expect, it } from "vitest";
import {
  getAllPokemonStaticParams,
  readPokemonDetailFromDisk,
} from "@/lib/server-data";
import { TOTAL_POKEMON } from "@/lib/constants";

describe("server-data", () => {
  it("generates static params for all pokemon ids", () => {
    const params = getAllPokemonStaticParams();
    expect(params).toHaveLength(TOTAL_POKEMON);
    expect(params[0]).toEqual({ id: "1" });
    expect(params[TOTAL_POKEMON - 1]).toEqual({ id: String(TOTAL_POKEMON) });
  });

  it("reads pokemon detail from disk", async () => {
    const data = await readPokemonDetailFromDisk(25);
    expect(data).not.toBeNull();
    expect(data?.name).toBe("pikachu");
    expect(data?.types).toContain("electric");
  });

  it("returns null for out-of-range ids", async () => {
    await expect(readPokemonDetailFromDisk(0)).resolves.toBeNull();
    await expect(readPokemonDetailFromDisk(9999)).resolves.toBeNull();
  });
});
