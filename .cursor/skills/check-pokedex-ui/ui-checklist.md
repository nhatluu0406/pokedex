# UI check checklist

Used by [check-pokedex-ui](SKILL.md). Beyond phase browser scenarios, scan for these issues during review.

## Console and network

- [ ] No uncaught `TypeError` / `ReferenceError` on load and interaction
- [ ] No failed fetches to `pokeapi.co` during normal use (offline tests excepted)
- [ ] No 404 sprite URLs (broken `<img>` / empty natural dimensions)

## Layout and responsive

- [ ] Desktop (≥1100px): two-panel layout — list left, detail right
- [ ] Mobile (<1100px): stacked list; detail opens as modal with close control
- [ ] No horizontal overflow on 375px and 768px widths
- [ ] Loading screen dismisses after name index loads

## List panel

- [ ] Initial grid shows ~30 cards with sprite, `#id`, name, type badges
- [ ] Selected card uses `.pokemon-card-selected` (visible distinction)
- [ ] Search filters by name; empty query shows full list; no matches shows "No Pokémon found."
- [ ] Infinite scroll loads more cards at bottom (Phase 2)

## Detail panel

- [ ] Empty state: "Select a Pokemon to display here."
- [ ] Pikachu (#25): animated GIF, stats (6 + total), abilities, height/weight
- [ ] Pokemon #650+: static PNG, no broken image
- [ ] Rapid selection: detail matches last clicked card (no stale name/id)
- [ ] Error state shows message + "Try again" when fetch fails
- [ ] Pokedex entry section when flavor text exists (Phase 2)
- [ ] Evolution chain with level labels; clicking evolution switches Pokemon (Phase 2)
- [ ] Desktop: slide animation on Pokemon change (Phase 2)

## Accessibility

- [ ] List cards are `<button>` with `aria-pressed` when selected
- [ ] Search input has `aria-label`
- [ ] Sprites have descriptive `alt` text
- [ ] Modal close button has `aria-label`
- [ ] Keyboard: Tab reaches cards and search; Enter/Space selects card

## Performance / polish (Minor)

- [ ] Next.js LCP warning on first thumbnail (note only)
- [ ] No layout shift when detail content loads
- [ ] Spinner visible during detail fetch

## Severity guide

| Severity | Examples |
|----------|----------|
| **Critical** | White screen, uncaught exception, search/list completely broken |
| **Major** | Wrong Pokemon in detail, modal won't close, broken sprites at scale |
| **Minor** | LCP hint, slight animation jank, cosmetic spacing |
