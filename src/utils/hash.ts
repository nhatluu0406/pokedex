const HASH_PATTERN = /^#pokemon\/(\d+)$/;

const hashListeners = new Set<() => void>();

export function parsePokemonHash(hash: string): number | null {
  const match = HASH_PATTERN.exec(hash);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function getPokemonHashSelectedId(): number | null {
  if (typeof window === "undefined") return null;
  return parsePokemonHash(window.location.hash);
}

export function subscribeToPokemonHash(listener: () => void): () => void {
  const onHashChange = () => listener();
  window.addEventListener("hashchange", onHashChange);
  hashListeners.add(listener);
  return () => {
    window.removeEventListener("hashchange", onHashChange);
    hashListeners.delete(listener);
  };
}

function notifyHashListeners() {
  hashListeners.forEach((listener) => listener());
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
  notifyHashListeners();
}
