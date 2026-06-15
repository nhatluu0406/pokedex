# Phase 7 verification report

**Date:** 2026-06-16  
**Status:** PASS (Option C — local JSON + deploy hardening)

## Summary

Phase 7 ships **Option C**: bundled `public/data/` JSON (1025 Pokémon), zero runtime `pokeapi.co` calls for list/types/detail, security headers on all routes, and an updated service worker (`pokedex-v2`) that precaches index/meta and runtime-caches `/data/pokemon/` on fetch. Sprites remain on the PokeAPI GitHub CDN until Phase 7B.

## Automated checks

| Check | Result |
|-------|--------|
| `npm run lint` | PASS |
| `npm test` | PASS (29 tests, 6 files) |
| `npm run build` | PASS |
| `npm run test:e2e` | PASS (66 passed, 40 skipped) |

## Deploy hardening delivered

| Task | Verification |
|------|--------------|
| `add-security-headers` | `next.config.ts` — `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` |
| `update-sw-precache` | `public/sw.js` — `CACHE_NAME: pokedex-v2`; install precache `/data/index.json`, `/data/meta.json`; stale-while-revalidate for `/data/**`; no install `addAll` for 1025 pokemon files |
| `update-deploy-docs` | `docs/DEPLOY.md` rewritten — fetch-data setup, zero env vars, security checklist, Option C sprite note |

## Data layer (Option C)

| Task | Verification |
|------|--------------|
| `create-download-script` | `scripts/fetch-pokemon-data.ts` with throttling, resumable flags |
| `run-download-locally` | `public/data/meta.json` — `totalPokemon: 1025` |
| `commit-data-files` | `public/data/index.json` + `public/data/pokemon/{1..1025}.json` present |
| `migrate-data-layer` | `src/lib/data.ts` — `/data/index.json`, `/data/pokemon/{id}.json`; hooks updated |
| `add-fetch-data-scripts` | `package.json` — `fetch-data`, `fetch-data:force` |

## Phase 7 e2e (`tests/e2e/phase-7-deploy.spec.ts`)

| Test | Result |
|------|--------|
| Security headers on document response | PASS (desktop + mobile) |
| `/data/index.json` returns 200 with ≥1025 entries | PASS (desktop + mobile) |
| No `pokeapi.co` requests during normal browse | PASS (desktop; mobile skipped — modal overlap) |

## E2e updates for local data

- Loading tests route `/data/pokemon/{id}.json` instead of `pokeapi.co`
- SW cache cleared before delayed-fetch tests to avoid instant cache hits
- Removed duplicate pokeball loading test from `pokedex-ui.spec.ts` (covered in `ui-contrast.spec.ts`)

## Remaining (deferred)

| Task | Notes |
|------|-------|
| `update-sprite-urls` | Phase 7B — local `/sprites/` |
| `simplify-next-config` | Remove `images.remotePatterns` when sprites local |
| `vercel-deploy-test` | Manual production deploy + offline PWA check |
| Offline manual test | List/detail after first visit with network disabled |

## Known limitations

- Sprites still load from `raw.githubusercontent.com` (Option C)
- Data sync is manual: `npm run fetch-data` then commit `public/data/`
- Full offline animations require local GIFs (Phase 7B)
