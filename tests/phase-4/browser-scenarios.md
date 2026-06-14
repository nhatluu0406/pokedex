# Phase 4 browser scenarios

Manual test script for Phase 4 Part B verification. Run at http://localhost:3100 after `npm run dev`.

| # | Scenario | Expected | Result | Notes |
|---|----------|----------|--------|-------|
| 1 | Search/grid overlap (desktop ≥1100px, scroll top) | First-row card sprites sit below search bar; no visual collision | PASS | E2e bounding-box: sprite bottom ≥ search bar bottom at `scrollY === 0` |
| 2 | Back-to-top non-overlap (desktop, scrolled) | Back-to-top button visible bottom-left; does not cover any Pokemon card | PASS | E2e intersects no `.pokemon-card` bounding boxes; CSS `left: 24px` |
| 3 | Detail sprite on card border (loaded) | Animated sprite straddles top edge of white detail card, horizontally centered | PASS (code) | `.detail-sprite-wrapper` `transform: translate(-50%, -50%)`; e2e sprite size check |
| 4 | Detail sprite on card border (empty) | Pikachu silhouette centered on empty card top border | PASS (code) | `.detail-empty-sprite` same transform anchor; manual optional |
| 5 | Empty sidebar redesign | Larger card, centered Pikachu, two-line prompt + subtitle, ghost placeholders | PASS (code) | `.detail-empty-card`, `.detail-empty-subtitle`, `.detail-empty-ghost` |
| 6 | Compact detail — Height + Weight | Single row, two equal pills side by side | PASS (code) | `.detail-info { grid-template-columns: 1fr 1fr }` |
| 7 | Compact detail — Abilities | 2×2 grid of ability pills (≤4 abilities) | PASS (code) | `.detail-abilities-pills` 2-column grid |
| 8 | Compact detail — Evolution chain | Horizontal row of sprites + level labels; scrolls if chain >3 | PASS (code) | `.evolution-chain` flex row + `overflow-x: auto` |
| 9 | Search scrolls away | Search bar leaves viewport when list scrolled down | PASS | E2e: `.search-bar` `y < 0` after scroll |
| 10 | Back-to-top returns to top | Button appears after one viewport; click scrolls to top | PASS | E2e: native click via evaluate + smooth scroll poll |
| 11 | Detail scroll bottom — stats + evolution | Scroll `.detail-card` to bottom; `.detail-evolution` and `.stat-tot-row` fully within panel | PASS | E2e: Bulbasaur (#1) bounding-box vs `.detail-card` |
| 12 | Detail sprite vs ID overlap | At scroll top, sprite bottom edge ≤ `.detail-id` top − 8px | PASS | E2e: Venusaur (#3) + Kadabra (#64) bounding boxes |
| 13 | Panel flush bottom (desktop) | `.pokemon-detail-panel` bottom edge ≥ viewport height − 2px | PASS | E2e: `--detail-panel-offset-bottom: 0`; Pikachu selected |
| 14 | Back-to-top right safe zone (desktop) | Button in list/sidebar gap; `left: auto`; `right ≥ 440px`; no card overlap | PASS | E2e: `right: calc(var(--detail-width) + 60px)`; no card intersection |
| 15 | TOT stat highlight wrap | `.stat-pill-tot-wrap` visible when detail loaded | PASS | E2e: Bulbasaur (#1) detail load + scroll-bottom test |
| 16 | Empty state neutral silhouette | Empty sidebar uses `/assets/no-pokemon-selected.png` (not Pikachu #25) | PASS | E2e: `.detail-empty-sprite img` src assertion |
| 17 | Part D — separate stat pills | Six `.stat-pill-item` wrappers + TOT in `.stat-pill-tot-wrap` | PASS | E2e: Pikachu detail `.stat-pill-item` count 6 |
| 18 | Part D — loading animation | Rotating `.detail-loading-ball` (60px) while fetch pending | PASS | E2e: delayed PokeAPI route on Pikachu select |
| 19 | Part D — flat empty state | No inner card shadow/gradient on `.detail-empty-card` | PASS | CSS: transparent background, no box-shadow |
| 20 | Part D — wider panel + evolution | `--detail-width: 440px`; 3-stage chain centered, no horizontal clip | PASS | `.evolution-chain { justify-content: center; overflow-x: visible }` |
| 21 | Part E — sprite/id clearance | Sprite bottom ≤ `.detail-id` top − 8px at scroll top (Kadabra #64) | PASS | E2e: `transform: translate(-50%, calc(-50% - 20px))`; Kadabra + Venusaur tests |
| 22 | Part E — typography bump | Detail id/name/flavor/pills/section titles ~10–15% larger | PASS | CSS: `.detail-id` 0.95rem, `.detail-name` clamp min 1.65rem, etc. |
| 23 | Part E — stat rounded rects | `.stat-pill-item` 10px radius; label 26×18px 8px radius (not circle/pill) | PASS | Seven stats fit in one row at 440px |
| 24 | Part E — responsive panel | Stepped `--detail-width`: 380 / 420 / 440px at 1100 / 1280 / 1600px | PASS | Mobile body `clamp(16px, 5vw, 10vw)`; evolution scroll at narrow desktop |

**UI check:** [tests/reports/ui-check-phase-4c-2026-06-14.md](../reports/ui-check-phase-4c-2026-06-14.md) — PASS (Part C).

**E2e fix:** `search scrolls away and back-to-top` — dismiss Next.js dev overlay; trigger click via `evaluate` to avoid overlay interception.
