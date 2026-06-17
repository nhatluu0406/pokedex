# Phase 8 Report — RSC / SSG

**Date:** 2026-06-17  
**Result:** PASS

## Scope (QV-8)

**Partial migration:** home `/` keeps hash-based SPA (`#pokemon/25`); new route `/pokemon/[id]` pre-renders detail from local JSON at build time.

## Delivered

| Task | Notes |
|------|-------|
| `src/lib/server-data.ts` | Disk read + `generateStaticParams` helper |
| `src/app/pokemon/[id]/page.tsx` | RSC + `generateMetadata` |
| `src/components/PokedexApp.tsx` | Shared shell; `linkMode` path vs hash |
| `initialData` prop | `usePokemonDetail` / `PokemonDetail` skip client fetch on SSG first paint |
| `not-found.tsx` | Invalid IDs return 404 |

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | PASS |
| `npm test` | 32/32 PASS (incl. `tests/phase-8/unit/server-data.test.ts`) |
| `npm run build` | PASS — 1030 static pages generated |
| E2e SSG tests | 6/6 PASS (desktop + mobile) |

## URLs

- Home (hash): `/#pokemon/25`
- SSG: `/pokemon/25` — title "Pikachu | Pokedex", detail without loading flash

## Deferred

- `search-index.json` pre-build
- `meta.json` "last updated" in UI
- Full migration (list on separate static routes)
