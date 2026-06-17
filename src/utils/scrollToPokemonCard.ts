export function isPokemonCardInViewport(
  id: number,
  margin = 12,
): boolean {
  if (typeof document === "undefined") return false;

  const card = document.querySelector(`[data-pokemon-id="${id}"]`);
  if (!card) return false;

  const rect = card.getBoundingClientRect();
  return (
    rect.top >= margin &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight - margin &&
    rect.right <= window.innerWidth
  );
}

export function scrollToPokemonCard(
  id: number,
  options: { behavior?: ScrollBehavior; onlyIfNeeded?: boolean } = {},
): boolean {
  const { behavior = "smooth", onlyIfNeeded = true } = options;

  if (typeof document === "undefined") return false;

  const card = document.querySelector(`[data-pokemon-id="${id}"]`);
  if (!card) return false;

  if (onlyIfNeeded && isPokemonCardInViewport(id)) {
    return false;
  }

  card.scrollIntoView({ block: "nearest", behavior });
  return true;
}
