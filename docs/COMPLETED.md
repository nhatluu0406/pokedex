# Pokedex — Completed Work Archive

> **Last updated:** 2026-06-17  
> **Live app:** [pokedex-delta-seven-41.vercel.app](https://pokedex-delta-seven-41.vercel.app)  
> **Active plan:** [PLAN.md](./PLAN.md) · **Future roadmap:** [PLAN_REVIEWED.md](./PLAN_REVIEWED.md)

---

## Stack

Next.js 16 · React 19 · TypeScript · Global CSS · Port 3100 · Vitest + Playwright e2e

---

## Phase completion summary

| Phase | Delivered | Report |
|-------|-----------|--------|
| **1** | Two-panel layout, paginated list, detail panel, Gen V sprites | [phase-1-report.md](../tests/reports/phase-1-report.md) |
| **2** | Search, infinite scroll, species/flavor, evolution, modal, CI | [phase-2-report.md](../tests/reports/phase-2-report.md) |
| **3** | Card names, fixed sidebar, stats pills, back-to-top, metadata | [phase-3-report.md](../tests/reports/phase-3-report.md) |
| **4** | Reference UI parity Parts A–E (layout, density, typography) | [phase-4-report.md](../tests/reports/phase-4-report.md) |
| **5** | PWA, favorites, type filter, hash deep links, dark mode | — |
| **6** | Dark-theme UX, toolbar, watermark, mobile modal Parts A–N | [phase-6-report.md](../tests/reports/phase-6-report.md) |
| **7** | Local JSON (`public/data/`), security headers, SW data cache | [phase-7-report.md](../tests/reports/phase-7-report.md) |
| **7B** | Local sprites (`public/sprites/`), no CDN | — |
| **Post-7B** | Vercel deploy, hash hydration fix, CI lockfile | — |
| **8** | RSC/SSG `/pokemon/[id]` (1025 pages), `PokedexApp`, `initialData` | [phase-8-report.md](../tests/reports/phase-8-report.md) |
| **9** | Type chart, genus, cries, showdown sprites, SW v4 | [phase-9-report.md](../tests/reports/phase-9-report.md) |

---

## Phase deliverables (condensed)

### Phase 1
`scaffold-nextjs` · `data-layer` · `sprite-component` · `list-panel` · `detail-panel` · `wire-page`

### Phase 2
`loading-screen` · `search` · `infinite-scroll` · `species-detail` · `evolution-chain` · `panel-animation` · `mobile-modal` · `github-ci`

### Phase 3
`fix-card-names` · `fix-fetch-cache` · `fixed-detail-panel` · `smooth-select-ux` · `detail-scroll-layout` · `stats-reference-ui` · `detail-loading-pokeball` · `back-to-top` · `production-polish` · `phase-3-verify`

### Phase 4 (Parts A–E)
Reference parity: sprite scale, empty/loading states, search flow, sidebar flush/dimensions, back-to-top position, TOT highlight, 440px panel, separate stat pills, mobile responsive polish

### Phase 5
`pwa-manifest` · `offline-shell` · `mobile-safe-areas` · `favorites-local` · `type-filter` · `share-deep-link` · `dark-mode` · `deploy-pipeline` · `phase-5-verify` — *optional `capacitor-wrap` not done*

### Phase 6 (Parts A–N)
Dark contrast, single-row toolbar, fixed watermark, share icon, mobile sprite-in-card, cookie SSR theme (Part K), hash hydration (Part J), filter mutual exclusion (Part M), mobile modal layout (Part N)

### Phase 7 + 7B
`fetch-pokemon-data.ts` · `public/data/` · `public/sprites/` · `src/lib/data.ts` · `src/lib/server-data.ts` · security headers · SW v3 · `fetch-data` / `fetch-sprites` scripts · Option A deploy

### Post-7B
`usePokemonHash` · `useIsMobile` · asset cleanup · README · `package-lock.json` npm 10 sync

### Phase 8
`decide-rsc-scope` (partial) · `add-pokemon-route` · `refactor-detail-rsc` · `phase-8-verify`

### Phase 9
`extend-fetch-script` · `types.json` · `TypeEffectiveness` · `PokemonMeta` · `PokemonCryButton` · showdown sprites 650+ · SW v4

---

## Verification

| Phase | Report |
|-------|--------|
| 1–4 | `tests/reports/phase-1-report.md` … `phase-4-report.md` |
| 6–9 | `phase-6-report.md` … `phase-9-report.md` (PASS) |

---

## Answered questions — Phase 9 (QV)

| # | Decision |
|---|----------|
| **QV-1** | Showdown GIFs via `--showdown` |
| **QV-3** | Genus in detail panel |
| **QV-4** | Legendary/Mythical badges |
| **QV-5** | Weak to / Resists chart |
| **QV-13** | Cries + play button |

---

## Optional backlog

Shiny toggle (QV-2) · SVG icons (QV-14) · Capacitor (QV-12) · CSP / abilities (QV-6, QV-11)

---

## Detailed phase history

| Former pain | Resolution |
|-------------|------------|
| PokeAPI rate limits / 429 at runtime | Local JSON — zero runtime API |
| Name index waterfall | `public/data/index.json` |
| Per-card type fetch | Types in index JSON |
| 3-fetch detail waterfall | Inlined evolution in `{id}.json` |
| CDN sprites | `public/sprites/` local |
| Offline detail broken | SW caches `/data/` + `/sprites/` |
| No SSR value | Phase 8 `/pokemon/[id]` SSG |

---

## Deployment & data sync (resolved)

| Decision | Answer |
|----------|--------|
| Deploy strategy | **Option A** — commit `public/data/` + `public/sprites/` |
| Vercel env vars | None |
| Data sync | Manual: `npm run fetch-data`, `fetch-data:force`, `fetch-sprites` |
| CI lockfile | Regenerate with **npm 10** (Node 20) before push |
| Production URL | [pokedex-delta-seven-41.vercel.app](https://pokedex-delta-seven-41.vercel.app) |

**Data sync commands:**
```bash
npm run fetch-data              # skip existing
npm run fetch-data:force        # full resync
npm run fetch-data -- --from=1026 --to=1100
npm run fetch-sprites
```

Do not automate weekly re-fetch — data is stable.

---

## Framework decision

**Stay with Next.js. Do not migrate to Astro.**

- App is interaction-heavy (SPA, infinite scroll, filters, modal, favorites)
- Phase 8 RSC/SSG delivers static HTML without a rewrite
- Astro migration cost >> benefit for this project

---

## Answered questions — Phases 1–6 (Q1–Q79)

| # | Decision |
|---|----------|
| **Q1** | Paginated 1–1025; Phase 2 adds name index |
| **Q2** | Selected card highlight — yes |
| **Q3** | No auto-select first Pokémon |
| **Q4** | IDs 1–1025 |
| **Q5** | Exclude alternate forms |
| **Q6** | Manual build Phase 1; CI optional Phase 2 |
| **Q7** | Desktop-first ≥1100px |
| **Q8** | List caches types only; detail always full fetch |
| **Q9** | No new Phase 3 unit tests |
| **Q10** | CSS variables for fixed detail panel |
| **Q11–Q13** | Hook docs updated; `POKEAPI_BASE` added; Next 16 OK |
| **Q14** | No Phase 4 unit tests — e2e instead |
| **Q15** | PWA first; optional Capacitor |
| **Q16** | Combined phase-4 verify after Part B |
| **Q17–Q19** | Loading ball classes; `N° {id}` format; empty state superseded |
| **Q20** | Superseded by Q30 |
| **Q21–Q22** | E2e per fix; `check-pokedex-ui` skill documented |
| **Q23–Q36** | Sprite anchoring; Capacitor WebView; hash routing; filter pipeline; panel 320px→440px; back-to-top safe zone; grid layout |
| **Q37–Q41** | Part D: 440px width; separate stat pills; 88vh panel; animated loader; flat empty state |
| **Q42–Q44** | Part E: sprite/id gap; rounded-rect stats; responsive `clamp` width |
| **Q45–Q50** | Phase 6: separate empty sprite offset; bg fade removed (Q64); bottom-right back-to-top; skeleton loading; tests→`reports/` |
| **Q51–Q53** | Part H: panel loader; filter chip style; watermark opacity |
| **Q54–Q55** | Part I: SVG watermark; favicon assets |
| **Q56–Q58** | Part J: external theme script → cookie SSR (Q59–Q60) |
| **Q59–Q60** | Cookie + localStorage theme; `useSyncExternalStore` toggle |
| **Q61–Q63** | Part L: `html::before` watermark; sprite absolute in panel |
| **Q64–Q66** | Part M: no scroll fade; `allActive` filter; watermark contrast |
| **Q77–Q79** | Part N: mobile sprite inside `.detail-card`; card scrolls |

---

## Answered questions — Phase 7 review (Q-A–Q-J)

| # | Decision |
|---|----------|
| **Q-A** | Option A — JSON + sprites committed |
| **Q-B** | Git LFS not required yet (~100–150 MB sprites) |
| **Q-C** | `tsx` + `npm run fetch-data` |
| **Q-D** | Vercel 45 min build limit sufficient |
| **Q-E** | Manual data sync only |
| **Q-F** | Inline evolution in each `{id}.json` |
| **Q-G** | RSC deferred → done in Phase 8 |
| **Q-H** | GIFs local (Phase 7B) |
| **Q-I** | CSP deferred |
| **Q-J** | `prebuild` via npm lifecycle if needed |

---

## Answered questions — Phase 7 open (Q67–Q76)

| # | Decision |
|---|----------|
| **Q67** | Option A sprites |
| **Q68** | Git LFS revisit if clone size problematic |
| **Q69** | `tsx` devDependency |
| **Q70** | Option A avoids long Vercel build |
| **Q71–Q76** | Manual sync; inline evolution; local GIFs; defer CSP; `meta.json` count future |

---

## Answered questions — Review (QV resolved)

| # | Decision |
|---|----------|
| **QV-7** | Vercel deploy validated — production URL live |
| **QV-8** | **Partial** — `/` hash SPA + `/pokemon/[id]` SSG (2026-06-17) |

---

## Phase 7 task table (all done)

| ID | Task |
|----|------|
| `create-download-script` | `scripts/fetch-pokemon-data.ts` |
| `run-download-locally` | 1025 JSON verified |
| `commit-data-files` | `public/data/` |
| `migrate-data-layer` | `src/lib/data.ts` |
| `update-sprite-urls` | Local `/sprites/` |
| `simplify-next-config` | No `remotePatterns` |
| `add-security-headers` | X-Frame-Options, etc. |
| `update-sw-precache` | SW precache + runtime cache |
| `add-fetch-data-scripts` | npm scripts |
| `update-deploy-docs` | `docs/DEPLOY.md` |
| `vercel-deploy-test` | Production validated |
| `phase-7-verify` | E2e PASS |

---

## Production checklist (completed)

- [x] `npm run build` — 1030 static pages
- [x] `/data/index.json` — 1025 entries
- [x] `/sprites/pokemon/25.png` loads
- [x] PWA manifest + SW on HTTPS
- [x] Offline: list, types, detail after first visit
- [x] No runtime `pokeapi.co` or GitHub CDN
- [x] Security headers present

**Known limitations:** GIFs IDs 1–649 only; PNG fallback 650–1025; data frozen at last `fetch-data` run.

---

## Detailed phase history

Full task IDs, implementation notes, and success criteria for Phases 1–8 were archived from `PLAN.md` on 2026-06-17. See git history (`docs/PLAN.md` before this date) for line-by-line task details if needed.
