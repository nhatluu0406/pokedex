import { readFile } from "fs/promises";
import path from "path";
import { TOTAL_POKEMON } from "./constants";
import type { PokemonDetail } from "./types";

export function getAllPokemonStaticParams(): { id: string }[] {
  return Array.from({ length: TOTAL_POKEMON }, (_, index) => ({
    id: String(index + 1),
  }));
}

export async function readPokemonDetailFromDisk(
  id: number,
): Promise<PokemonDetail | null> {
  if (!Number.isInteger(id) || id < 1 || id > TOTAL_POKEMON) {
    return null;
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public/data/pokemon",
      `${id}.json`,
    );
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as PokemonDetail;
  } catch {
    return null;
  }
}
