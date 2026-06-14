# Pokedex

A Next.js Pokédex for browsing all 1025 Pokémon with animated Gen V sprites, stats, evolution chains, favorites, type filters, dark mode, and PWA install support.

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

## Features (Phase 5)

- **PWA** — `manifest.json`, theme color, installable icons, service worker for app shell
- **Favorites** — star Pokémon; filter list to ★ Favorites (persisted in `localStorage`)
- **Type filter** — multi-select type chips combined with search
- **Deep links** — `#pokemon/25` opens Pokémon detail; Web Share API on detail panel
- **Dark mode** — system preference + manual toggle

## Deploy to Vercel

1. Push to GitHub and import at [vercel.com/new](https://vercel.com/new).
2. Build: `npm run build` · Install: `npm install`
3. **Environment variables:** none required
4. Deploy and update the production URL below.

See [docs/DEPLOY.md](docs/DEPLOY.md) for the full checklist.

**Production URL:** `https://your-pokedex.vercel.app` _(update after deploy)_

## Offline note

The service worker caches the app shell and static assets. Pokémon names, types, and detail data still require network access to PokeAPI.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [PokeAPI](https://pokeapi.co/)
