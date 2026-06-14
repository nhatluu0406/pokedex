# Phase 5 — Browser scenarios

Manual checks for PWA, favorites, filters, dark mode, and share deep links.

## PWA install

1. Open the app in Chrome (desktop or Android).
2. Confirm **Install** / **Add to Home Screen** is available (may require HTTPS or localhost).
3. Install the app and launch from the home screen icon.
4. Verify standalone display (no browser URL bar on supported platforms).
5. Open DevTools → Application → Manifest — confirm name **Pokedex**, icons 192/512, theme color `#f6f8fc`.

## Offline shell

1. Load the app online and wait for the loading screen to finish.
2. Open DevTools → Application → Service Workers — confirm `/sw.js` is registered.
3. Enable offline mode in DevTools (or disconnect network).
4. Reload the page — cached shell should load (list UI may show without fresh PokeAPI data).
5. Note: Pokémon detail/stats still require network (PokeAPI limitation).

## Favorites

1. Search **pikachu** and click the ☆ on the Pikachu card.
2. Star should become ★ (filled).
3. Click **★ Favorites** filter chip — only favorited Pokémon appear.
4. Reload the page — Pikachu remains favorited.
5. Open Pikachu detail — star in detail panel matches card state.
6. Toggle star off in detail — card star clears; favorites filter hides Pikachu.

## Type filter

1. Clear search. Click **fire** type chip — list narrows to Fire types as types load.
2. Search **char** with **fire** selected — Charmander line should remain visible.
3. Click **fire** again to deselect — full list returns (subject to search).
4. Combine **★ Favorites** + type filter — intersection works.

## Share & deep link

1. Select Pikachu (#25). URL hash should update to `#pokemon/25`.
2. Copy URL and open in a new tab — Pikachu detail should open automatically.
3. On mobile (or with Web Share API), tap **Share** in detail — share sheet or clipboard receives URL with hash.
4. Close detail — hash clears from URL.

## Dark mode

1. Click moon icon (🌙) in search toolbar — theme switches to dark (`data-theme="dark"` on `<html>`).
2. Background, cards, and text use dark tokens.
3. Reload — preference persists from `localStorage`.
4. Click sun icon (☀️) — returns to light mode.

## Mobile safe areas

1. On iPhone simulator or notched device, open detail modal.
2. Close button and modal edges respect safe-area insets (no overlap with notch/home indicator).

## Lighthouse PWA (manual)

1. Run Lighthouse PWA audit on production or `npm run build && npm start`.
2. Target PWA score ≥ 90 (installable, manifest, service worker).

## Deferred

- **Capacitor wrap** — optional native store build not in scope.
- **Lighthouse** — run manually before store submission.
