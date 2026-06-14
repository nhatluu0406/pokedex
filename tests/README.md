# Pokedex tests

Test cases and verification artifacts for phase completion. Phases are defined in [`docs/PLAN.md`](../docs/PLAN.md). Automated verification uses **Vitest** (unit) and **Playwright** (e2e). Manual browser scripts live under `tests/phase-N/browser-scenarios.md`.

## Folder layout

```
tests/
├── README.md
├── artifacts/
│   └── test-results/            # Playwright failure output (screenshots, traces)
├── e2e/
│   ├── playwright.config.ts
│   ├── helpers.ts
│   ├── pokedex-ui.spec.ts       # Cross-phase UI regression
│   └── ui-contrast.spec.ts      # Phase 6 — dark theme, contrast, layout
├── reports/                     # Phase verification reports
│   ├── verification-report.template.md
│   ├── phase-1-report.md … phase-6-report.md
│   └── ui-check-*.md
├── phase-1/ … phase-6/
│   ├── browser-scenarios.md
│   └── unit/                    # where applicable
└── fixtures/                    # optional screenshot baselines
```

## Test types

| Type | Location | Runner | When to run |
|------|----------|--------|-------------|
| **Unit** | `tests/phase-N/unit/*.test.ts` | Vitest | Every commit; logic checks (format, pokeapi, hooks) |
| **E2e** | `tests/e2e/*.spec.ts` | Playwright | Before phase sign-off; server on port 3100 |
| **Browser scenarios** | `tests/phase-N/browser-scenarios.md` | Manual | Visual/UX checks Playwright cannot cover |
| **Reports** | `tests/reports/<phase>-report.md` | — | PASS/FAIL after verification |

## Running tests

```powershell
npm run lint
npm run build
npm test              # Vitest — vitest.config.ts
npm run start         # or: npm run dev — http://localhost:3100
npm run test:e2e      # Playwright — tests/e2e/playwright.config.ts
```

**E2e projects:** `desktop` (Chrome 1400×900) and `mobile` (Pixel 5). Desktop-only tests skip on mobile via `isMobileProject()`.

**Playwright artifacts:** Failed runs write to `tests/artifacts/test-results/` (`outputDir` in `playwright.config.ts`). This directory is gitignored; `tests/artifacts/.gitkeep` keeps the folder in the repo.

## Phase coverage map

| Phase | Unit tests | E2e | Browser scenarios |
|-------|------------|-----|-------------------|
| 1 | format, constants, pokeapi | Phase 1 — core UI | phase-1/browser-scenarios.md |
| 2 | pokeapi-phase2 | Phase 2 — search and scroll | phase-2/browser-scenarios.md |
| 3 | — | Phase 3 — layout polish | phase-3/browser-scenarios.md |
| 4 | — | Phase 4 — layout overlap | phase-4/browser-scenarios.md |
| 5 | favorites, hash | Phase 5 — PWA & growth | phase-5/browser-scenarios.md |
| 6 | — | ui-contrast.spec.ts | phase-6/browser-scenarios.md |
| 6.1 | — | ui-contrast.spec.ts (regression fixes) | phase-6.1/browser-scenarios.md |

### Phase 6 UI regression tests

`tests/e2e/ui-contrast.spec.ts` covers:

- Dark theme text contrast (section titles, info pills)
- Back-to-top visible in dark mode; bottom-right position
- Empty-state silhouette fully in viewport
- Background decoration fixed + fades on scroll (light mode only)
- Light-mode background visible at scroll top; dark mode keeps decoration when scrolled
- Search toolbar single row (All/Favorites left of search; theme + All aligned)
- Theme preference persists after reload
- Evolution chain centered (Charmander)
- Rotating Pokéball loader on slow detail fetch (no prior data)
- Share button is icon-only

## Conventions

| Item | Rule |
|------|------|
| **Naming** | `*.test.ts` (unit); `*.spec.ts` (e2e); `browser-scenarios.md` (manual) |
| **Phase folder** | One folder per plan phase (`phase-1` … `phase-N`) |
| **Reports** | `tests/reports/phase-N-report.md` |
| **Artifacts** | `tests/artifacts/test-results/` (Playwright; gitignored) |
| **Pass criteria** | `docs/PLAN.md` success criteria per phase |

## Verification checklist (any phase)

1. `npm run lint` — PASS  
2. `npm run build` — PASS  
3. `npm test` — PASS  
4. Server on 3100 → `npm run test:e2e` — PASS  
5. Manual scenarios in `tests/phase-N/browser-scenarios.md` — PASS  
6. Write report from [`verification-report.template.md`](./reports/verification-report.template.md)
