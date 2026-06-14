const HASH_PATTERN = /^#pokemon\/(\d+)$/;

export function parsePokemonHash(hash: string): number | null {
  const match = HASH_PATTERN.exec(hash);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function buildPokemonHash(id: number): string {
  return `#pokemon/${id}`;
}

export function setPokemonHash(id: number | null): void {
  if (typeof window === "undefined") return;
  const nextHash = id === null ? "" : buildPokemonHash(id);
  if (window.location.hash === nextHash) return;
  const url = nextHash
    ? `${window.location.pathname}${window.location.search}${nextHash}`
    : `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", url);
}
