# Phase 6 — Browser scenarios

Manual checks for dark-theme polish, toolbar layout, sprite/background UX, and share icon.

## Empty silhouette visible

1. Open the app at desktop width (≥1100px) without selecting a Pokémon.
2. Confirm the empty-state silhouette (`no-pokemon-selected.png`) is fully visible — not clipped at the top of the viewport.
3. Resize to a shorter viewport height — silhouette should remain visible above the “Select a Pokemon” card.

## Dark theme contrast

1. Click the moon icon (🌙) to enable dark mode.
2. Select **Bulbasaur** or **Ivysaur**.
3. Confirm section titles (Pokedex Entry, Abilities, Stats, Evolution) are light/readable — not navy `#011030`.
4. Confirm Height/Weight/Abilities pills use a dark pill background with readable text.

## Toolbar single row

1. At desktop width (≥1100px), confirm one row contains: search bar, theme toggle, **All**, and **★ Favorites**.
2. Type filter chips (fire, water, etc.) should appear on a **second row** below.
3. Narrow the window below 768px — toolbar may wrap to two rows (search on row 1; theme + filters on row 2).

## Back-to-top bottom-right in dark mode

1. Scroll the list past one viewport height.
2. Enable dark mode.
3. Confirm the back-to-top button appears at the **bottom-right** (not bottom-left).
4. Confirm the arrow icon is visible against the dark card background.

## Background fade on scroll

1. At page top, note the faint Pokéball decoration in the background.
2. Scroll down past ~200px.
3. Confirm the decoration fades out (opacity → 0).
4. Scroll back to top — decoration should return.

## Share icon

1. Select any Pokémon (e.g. Pikachu).
2. Confirm the share control in the detail card is an **icon-only** button (no “Share” text label).
3. Click share — URL with `#pokemon/{id}` is copied or shared via Web Share API.

## No loading pokeball

1. Throttle network in DevTools (Slow 3G) or use offline-then-online trick.
2. Select a Pokémon you have not loaded before.
3. Confirm the sidebar shows a **rotating Pokéball** (`.detail-loading-ball`) while fetch is in progress.

## Phase 6.1 follow-up

See [`tests/phase-6.1/browser-scenarios.md`](../phase-6.1/browser-scenarios.md) for theme persistence, background opacity, evolution centering, toolbar order, and artifact path checks.

## Mobile sprite

1. Resize to mobile width (&lt;1100px) or use device emulation.
2. Select a tall Pokémon (e.g. Wigglytuff or Venusaur).
3. Open the detail modal — animated sprite should be fully visible above the card, not clipped at the top.
4. Close modal with the X button — list remains usable.

## Regression spot-check

1. Toggle light/dark — preference persists after reload.
2. Favorites and type filters still work with the new toolbar layout.
3. Hash deep link `#pokemon/25` still opens Pikachu detail.
