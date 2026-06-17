# Pokedex

A Next.js Pokédex for browsing all 1025 Pokémon with animated Gen V sprites, stats, evolution chains, favorites, type filters, dark mode, and PWA install support. Data and sprites are bundled locally — no runtime calls to PokeAPI or external CDNs.

**Live app:** [https://pokedex-delta-seven-41.vercel.app](https://pokedex-delta-seven-41.vercel.app)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3100](http://localhost:3100).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server on port 3100 |
| `npm run build` | Production build |
| `npm start` | Production server on port 3100 |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e (requires server on 3100) |
| `npm run fetch-data` | Download / refresh Pokémon JSON into `public/data/` |
| `npm run fetch-data:force` | Full resync of local JSON |
| `npm run fetch-sprites` | Download PNG + GIF sprites into `public/sprites/` |
| `npm run fetch-types` | Download type chart into `public/data/types.json` |
| `npm run rebuild-index` | Rebuild `index.json` filter fields from local `pokemon/*.json` |

## Features

- **Advanced filters** — search by dex number, Legendary/Mythical/Baby, weak to / resists type, color & habitat (when in index)
- **Detail panel** — animated sprites, stats, abilities, Pokédex entry, evolution chain
- **Favorites** — star Pokémon; filter to ★ Favorites (`localStorage`)
- **Detail extras** — genus, Legendary/Mythical badges, type weaknesses/resistances, Pokémon cry button
- **Showdown sprites** — animated GIFs for IDs 650+ when downloaded with `--showdown`
- **Dark mode** — cookie-backed SSR theme + manual toggle
- **PWA** — installable, service worker caches app shell, data, and sprites
- **Responsive** — fixed detail sidebar on desktop; full-screen modal on mobile

## Static assets

UI chrome lives in `public/assets/` (Pokémon sprites are in `public/sprites/`):

| File | Used by |
|------|---------|
| `pokeball-watermark.svg` | Page background watermark |
| `pokeball-icon.png` | Loading screen, detail loader, offline page |
| `search-icon.png` | Search bar |
| `share-icon.png` | Detail share button |
| `arrow-up-icon.png` | Back-to-top button |
| `no-pokemon-selected.png` | Empty detail state |

Close button uses an inline SVG in the detail panel (no image asset).

## Deploy to Vercel

1. Push to GitHub and import at [vercel.com/new](https://vercel.com/new).
2. Build: `npm run build` · Install: `npm install`
3. **Environment variables:** none required
4. Ensure `public/data/` and `public/sprites/` are committed (or run fetch scripts in `prebuild`).

See [docs/DEPLOY.md](docs/DEPLOY.md) for the full checklist.

## Offline

After the first visit, the service worker caches the app shell, `/data/**` JSON, and `/data/index.json`. Sprites under `/sprites/` are cached on fetch. Browse names, types, detail, and sprites without network once cached.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [PokeAPI](https://pokeapi.co/) — source for bundled data (download time only)
