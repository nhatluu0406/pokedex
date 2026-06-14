# Verification: phase-4

**Date:** 2026-06-14
**Result:** PASS (Part A/B/C/D/E)

## Part E — Sprite clearance, typography & responsive (2026-06-14)

### Key CSS values

| Token / rule | Value |
|--------------|-------|
| Sprite transform (desktop) | `translate(-50%, calc(-50% - 20px))` |
| `--detail-card-padding-top` | `clamp(7vh, 8vh, 9vh)` |
| `.detail-id` | `0.95rem`, `margin-top: 8px` |
| `.detail-name` | `clamp(1.65rem, 4vw, 2rem)` |
| `.detail-flavor-text` / `.detail-info-pill` | `1rem` |
| `.detail-section-title` | `1.1rem` |
| `.stat-pill-item` | `border-radius: 10px` |
| `.stat-pill-label` | `26×18px`, `border-radius: 8px`, `font-size: 10px` |
| `.stat-pill-value` | `0.85rem` |
| `.stat-pill-tot-wrap` | `border-radius: 12px` |
| `--detail-width` (1100–1279) | `380px` |
| `--detail-width` (1280–1599) | `420px` |
| `--detail-width` (1600+) | `440px` |
| Mobile body padding | `clamp(16px, 5vw, 10vw)` |

### Changes

- Raised desktop detail sprite 20px via transform; tightened e2e clearance to 8px gap
- Bumped detail panel typography ~10–15% across id, name, flavor, pills, section titles, stat values
- Stat containers: rounded rectangles (10px items, 8px labels) instead of pill ovals / circles
- Stepped responsive `--detail-width`; narrow desktop evolution horizontal scroll fallback; smaller stat labels at 1100–1200px

### Automated checks (Part E verify)

| Check | Result | Output |
|-------|--------|--------|
| lint | PASS | exit 0 |
| build | PASS | exit 0 |
| unit tests | PASS | exit 0 |
| e2e | PASS | exit 0, **29 passed**, 17 skipped, 0 failed (~38s) |

### E2e updates (Part E)

| Test | Change |
|------|--------|
| `detail sprite does not overlap detail id at scroll top` | Tolerance `detailIdTop - 8` (was `+ 4`) |
| `kadabra sprite clears detail id at scroll top` | New — Kadabra #64 regression for tall sprite feet |

---

## Part D — Sidebar density & UX (2026-06-14)

### CSS tokens (final)

| Token | Value |
|-------|-------|
| `--detail-width` | `440px` |
| `--detail-panel-height` | `88vh` |
| `--detail-card-margin-top` | `2vh` |
| `--detail-card-padding-top` | `8vh` |
| Sprite `max-height` (desktop) | `20vh` |

### Changes

- Separate stat pills: six `.stat-pill-item` wrappers + TOT in `.stat-pill-tot-wrap`
- Compact section margins (stats, evolution, entry, section titles)
- Loading state: animated `.detail-loading-ball` (60px, `rotatePokeBall`)
- Empty state: flat `.detail-empty-card` (no shadow/gradient)
- Evolution chain centered at desktop; sprites `60px`; `overflow-x: visible`

### Automated checks (Part D verify)

| Check | Result | Output |
|-------|--------|--------|
| lint | PASS | exit 0 |
| build | PASS | exit 0, Next.js 16.2.9 |
| unit tests | PASS | exit 0, 21 passed |
| e2e | PASS | exit 0, **28 passed**, 16 skipped, 0 failed (~37s) |

### E2e updates (Part D)

| Test | Change |
|------|--------|
| Sidebar position | `x ≥ 800`, width `≥ 400` (440px panel) |
| List/card width | List `≥ 620`, card `≥ 140` |
| Pikachu detail | `.stat-pill-item` count 6 |
| Loading animation | New test with delayed PokeAPI route |
| Sprite scroll | Resize to 620px height to force scroll under compact layout |

**Note:** Initial e2e run hit a stale server on port 3100 (loading screen stuck); restarted production server and re-ran — all pass.

---

| Check | Result | Output |
|-------|--------|--------|
| lint | PASS | exit 0, eslint clean |
| build | PASS | exit 0, Next.js 16.2.9 compiled successfully |
| unit tests | PASS | exit 0, Vitest 4 files 21 tests passed |
| e2e (Playwright) | PASS | exit 0, 27 passed, 15 skipped, 0 failed (36.1s) |

## Part C — Reference parity (2026-06-14)

### Automated checks (Part C verify)

| Check | Result | Output |
|-------|--------|--------|
| lint | PASS | exit 0 |
| build | PASS | exit 0 |
| unit tests | PASS | exit 0, 21 passed |
| e2e | PASS | exit 0, 27 passed, 15 skipped (36.1s) |

### E2e additions (Part C)

| Test | Assertion |
|------|-----------|
| `desktop detail panel flush with viewport bottom` | `.pokemon-detail-panel` bottom ≥ viewport height − 2px |
| `empty detail state on desktop` | `.detail-empty-sprite img` src contains `no-pokemon-selected.png` |
| `back-to-top does not overlap pokemon cards` | `right ≥ 380px`, `left > 800px`; no card intersection |
| `detail stats and evolution fully visible at scroll bottom` | `.stat-pill-tot-wrap` visible when detail loaded |

### E2e fixes during Part C verify

1. **Empty placeholder img src** — Next.js Image optimizer serves `/_next/image?url=...`; regex updated to match `no-pokemon-selected.png` in optimized URL.
2. **Back-to-top position** — Replaced `left === "auto"` check (computed style returns used pixel value) with `left > 800` + `right ≥ 380` for list/sidebar safe zone.
3. **Stale dev server** — E2e initially timed out on stuck port 3100 process; re-ran against fresh `npm run start` production server.

### Browser tests (Phase 4 Part C)

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 13 | Panel flush bottom | PASS (e2e) | `--detail-panel-offset-bottom: 0`; Pikachu selected |
| 14 | Back-to-top right safe zone | PASS (e2e) | `right: calc(var(--detail-width) + 60px)`; no card overlap |
| 15 | TOT stat highlight wrap | PASS (e2e) | `.stat-pill-tot-wrap` visible on Bulbasaur detail |
| 16 | Empty neutral silhouette | PASS (e2e) | `/assets/no-pokemon-selected.png` via Next Image |

### Part C pass criteria verified

| Area | Status | Evidence |
|------|--------|----------|
| Panel flush bottom | PASS | `--detail-panel-offset-bottom: 0px`; e2e bounding box |
| Panel dimensions | PASS | `--detail-width: 320px`, `--detail-panel-height: 82vh`, sprite `22vh` |
| Back-to-top safe zone | PASS | Desktop `right: calc(var(--detail-width) + 60px)`; e2e position + non-intersection |
| Back-to-top SVG icon | PASS | `BackToTop.tsx` inline SVG arrow |
| TOT highlight | PASS | `.stat-pill-tot-wrap { background: #88aaea }` in `globals.css` |
| Empty placeholder | PASS | `no-pokemon-selected.png` in `PokemonDetail.tsx` |

**UI check:** [ui-check-phase-4c-2026-06-14.md](./ui-check-phase-4c-2026-06-14.md) — PASS

---

## Part B (2026-06-14)

## E2e fix applied

**Test:** `search scrolls away and back-to-top shortcut appears` (Phase 3)

**Problem:** Next.js dev tools overlay intercepted Playwright pointer click on `.back-to-top`; `force: true` did not fire React `onClick`.

**Fix in `tests/e2e/pokedex-ui.spec.ts`:**
- Added `dismissNextDevOverlay()` helper
- Trigger back-to-top via `page.evaluate(() => document.querySelector('.back-to-top')?.click())`
- Extended smooth-scroll poll timeout to 10s

## Browser tests (Phase 4 Part B)

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Search/grid overlap at scroll top | PASS (e2e) | `.pokemon-grid { padding-top: 68px }`; sprite bottom ≥ search bottom |
| 2 | Back-to-top non-overlap | PASS (e2e) | Desktop `.back-to-top { left: 24px }`; no card intersection |
| 3 | Detail sprite on card border (loaded) | PASS (code) | `.detail-sprite-wrapper` centered on `.detail-card` top |
| 4 | Detail sprite on card border (empty) | PASS (code) | `.detail-empty-sprite` same transform anchor |
| 5 | Empty sidebar redesign | PASS (code) | Larger card, subtitle, ghost placeholders in `PokemonDetail.tsx` |
| 6 | Height + Weight one row | PASS (code) | `.detail-info` 2-column grid |
| 7 | Abilities 2×2 grid | PASS (code) | `.detail-abilities-pills` 2-column grid |
| 8 | Evolution horizontal row | PASS (code) | `.evolution-chain` flex row, `overflow-x: auto` |
| 9 | Search scrolls away | PASS (e2e) | Search bar `y < 0` when scrolled |
| 10 | Back-to-top returns to top | PASS (e2e) | Button visible + scrollY → 0 after click |

## Code review

**Expected files (phase-4):**

| File | Status |
|------|--------|
| `tests/phase-4/browser-scenarios.md` | Present |
| `tests/reports/phase-4-report.md` | Present |
| `tests/reports/ui-check-phase-4-2026-06-14.md` | Present |

**Part B pass criteria verified:**

| Area | Status | Evidence |
|------|--------|----------|
| Search/grid clearance | PASS | `padding-top: 68px` on `.pokemon-grid`; e2e overlap test |
| Back-to-top safe zone | PASS | `left: 24px` desktop; e2e non-intersection test |
| Sprite border anchor | PASS | `translate(-50%, -50%)` on loaded + empty wrappers |
| Empty sidebar polish | PASS | `.detail-empty-card`, ghost rows, subtitle |
| Compact detail layout | PASS | Grid info, abilities pills, horizontal evolution |
| Automated suite | PASS | lint/build/test/e2e all exit 0 |

**Key files reviewed:** `globals.css`, `PokemonDetail.tsx`, `EvolutionChain.tsx`, `BackToTop.tsx`, `tests/e2e/pokedex-ui.spec.ts`

## Failures

None (one e2e failure fixed during verify)

## Recommended fixes

None — optional manual browser pass for empty-state sprite feel and long evolution chains.
