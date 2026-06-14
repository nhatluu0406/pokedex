# Phase 6.1 — Browser scenarios (regression fixes)

Follow-up manual checks after Phase 6 e2e and artifact layout updates.

## Theme persistence

1. Open the app and toggle dark mode (moon icon).
2. Reload the page.
3. Confirm `html[data-theme="dark"]` remains — preference stored in `localStorage` (`pokedex-theme`).

## Background — light mode at top

1. Switch to light mode.
2. Scroll to the very top (`scrollY === 0`).
3. Confirm the faint Pokéball decoration is clearly visible (opacity noticeably above 0.2).

## Background — dark mode while scrolled

1. Enable dark mode.
2. Scroll down at least 300px (`body.bg-scrolled` applied).
3. Confirm the decorative background is still faintly visible (opacity > 0) — dark mode does not fully hide it on scroll.

## Evolution chain centered

1. Select **Charmander** (#4).
2. Wait for the evolution section to load.
3. Confirm the evolution sprites row is horizontally centered in the detail card.

## Toolbar order

1. At desktop width (≥1100px), confirm **All / ★ Favorites** chips sit to the **left** of the search bar on the same row.
2. Theme toggle sits to the right of the search bar.

## Loading Pokéball

1. Throttle network or select a Pokémon not yet cached (e.g. legendary).
2. Confirm a **rotating Pokéball** (`.detail-loading-ball`) appears in the detail panel while data loads — no skeleton-only placeholder.

## Playwright artifacts

Failed e2e runs write traces and screenshots to `tests/artifacts/test-results/` (not repo root).

## Regression spot-check

1. Prior Phase 6 fixes still hold: dark contrast, back-to-top bottom-right, share icon-only, empty silhouette visible.
2. Hash deep link `#pokemon/25` still opens Pikachu detail.

## Part H — Regression fixes (2026-06-15)

### Pokeball background — light mode at top

1. Switch to light mode.
2. Scroll to the very top (`scrollY === 0`).
3. Confirm `body::before` opacity is clearly visible (≥ 0.45).

### Panel loading Pokéball

1. Throttle network or select a Pokémon with delayed API (e.g. Mewtwo #150).
2. Confirm `.detail-panel-loading .detail-loading-ball`, `.detail-panel-loading`, or `.detail-loading-ball` is visible while detail fetch is pending.

### Filter chips — no border ring

1. At desktop width, inspect **All** and **★ Favorites** chips in `.search-toolbar-row`.
2. Confirm computed `border-width` is `0px` (or `border-style: none`) — chips match theme-toggle card style, not outlined pills.

### Scrollbar gutter — no layout shift

1. At desktop width with a long list (vertical scrollbar present).
2. Confirm `html { scrollbar-gutter: stable }` in computed styles.
3. Click **★ Favorites** — toolbar row should not jump horizontally (shift < 2px).

### Detail actions — favorite vs share spacing

1. Select any Pokémon on desktop sidebar.
2. Confirm favorite (☆/★) and share icon buttons do not overlap — visible gap between them.

### High zoom mobile modal (manual)

1. Set browser zoom to 150% on mobile viewport.
2. Open Pokémon detail modal.
3. Confirm full sprite visible and close (X) button stays in viewport.
