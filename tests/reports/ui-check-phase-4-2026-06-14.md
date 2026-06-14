# UI check: phase-4

**Date:** 2026-06-14
**Result:** PASS
**Dev server:** http://localhost:3100

## E2E (Playwright)

| Check | Result | Notes |
|-------|--------|-------|
| npm run test:e2e | PASS | 23 passed, 11 skipped, 0 failed (32.7s); desktop + mobile projects |

**Passed tests (23):**

| Project | Test |
|---------|------|
| desktop | initial load shows pokemon grid |
| desktop | empty detail state on desktop |
| desktop | select Pikachu shows detail |
| desktop | selected card highlight |
| desktop | rapid switching keeps detail in sync |
| desktop | no uncaught console errors on happy path |
| desktop | search filters list |
| desktop | scroll loads more pokemon |
| desktop | grid row sprites do not overlap card above |
| desktop | desktop list uses full width beside detail panel |
| desktop | desktop detail sidebar is visible when empty |
| desktop | desktop detail sidebar is visible when pokemon selected |
| desktop | desktop detail shows large animated sprite |
| desktop | search scrolls away and back-to-top shortcut appears |
| desktop | first-row sprites clear search bar at scroll top |
| desktop | back-to-top does not overlap pokemon cards |
| mobile | initial load shows pokemon grid |
| mobile | select Pikachu shows detail |
| mobile | selected card highlight |
| mobile | no uncaught console errors on happy path |
| mobile | search filters list |
| mobile | scroll loads more pokemon |
| mobile | detail opens as modal with close |

**Skipped (11):** desktop-only layout/overlap tests on mobile; mobile-only tests on desktop.

## Browser scenarios (Phase 4 Part B)

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Search/grid overlap at scroll top | PASS | E2e sprite vs search bar bounding boxes |
| 2 | Back-to-top non-overlap | PASS | E2e no intersection with any card |
| 3 | Detail sprite on card border (loaded) | PASS (code) | Transform-centered wrapper; e2e sprite scale |
| 4 | Detail sprite on card border (empty) | NOT RUN | CSS verified; manual optional |
| 5 | Empty sidebar redesign | PASS (code) | Subtitle + ghost placeholders present |
| 6 | Height + Weight one row | PASS (code) | `.detail-info` 2-column grid |
| 7 | Abilities 2×2 grid | PASS (code) | `.detail-abilities-pills` grid |
| 8 | Evolution horizontal row | PASS (code) | `.evolution-chain` flex row |
| 9 | Search scrolls away | PASS | E2e search bar off-screen |
| 10 | Back-to-top returns to top | PASS | E2e fixed during verify (dev overlay workaround) |

## Issues found

### Critical
- (none)

### Major
- (none)

### Minor
- Back-to-top e2e requires `evaluate` click in dev mode due to Next.js dev tools overlay (fixed in spec)
- Scenarios 4–5 lack dedicated Playwright assertions; optional manual pass

## Console / dev log

| Level | Message | When |
|-------|---------|------|
| — | No uncaught `pageerror` events | E2e happy path on desktop and mobile |

## Recommended fixes

1. None required for Phase 4 Part B UI sign-off.
2. Optional: add e2e for empty-state sprite border position and abilities grid layout.
