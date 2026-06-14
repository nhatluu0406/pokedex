# Phase 3 browser scenarios

Manual test script for phase-3 verification. Run at http://localhost:3100 after `npm run dev`.

| # | Scenario | Expected | Result | Notes |
|---|----------|----------|--------|-------|
| 1 | Initial load | Card names visible immediately (not `#id` placeholders) | PASS | E2e + code review; name index wired |
| 2 | Select cached Pokemon | No sidebar double-jump; detail updates smoothly | NOT RUN | Code verified; manual UX optional |
| 3 | Scroll list (desktop ≥1100px) | Detail panel stays fixed while list scrolls | NOT RUN | CSS fixed panel verified in code |
| 4 | Select different Pokemon | Smooth highlight + panel transition (no layout flicker) | NOT RUN | Code verified; manual UX optional |
| 5 | Long detail content | Detail panel scrolls internally (flavor text, evolutions, stats) | NOT RUN | `.detail-card` overflow-y in CSS |
| 6 | Stats section | Horizontal reference-style layout (compact row/grid, not vertical stack) | PASS | E2e Pikachu detail stats count |
| 7 | Select while detail loading | Rotating Pokeball shown in detail loading state | NOT RUN | `.detail-loading-ball` in code |
| 8 | Scroll past one viewport | Back-to-top button appears bottom-right; click returns smoothly to top | NOT RUN | `BackToTop.tsx` in code |
| 9 | Rapid switching (cached Pokemon) | No stale detail data; no layout jump between selections | PASS | E2e rapid-switch desktop |
| 10 | Route error (if testable) | Friendly error message with retry button | NOT RUN | `error.tsx` present |
| 11 | Page metadata | Tab title "Pokedex"; head includes description and openGraph tags | NOT RUN | `layout.tsx` metadata in code |

**UI check:** [tests/reports/ui-check-2026-06-14.md](../reports/ui-check-2026-06-14.md) — PASS (16/16 e2e passed). Grid sprite overlap fixed (`gap: 64px 16px`).
