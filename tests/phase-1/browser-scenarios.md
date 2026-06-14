# Phase 1 browser scenarios

Manual test script for phase-1 verification. Run at http://localhost:3100 after `npm run dev`.

| # | Scenario | Expected | Result | Notes |
|---|----------|----------|--------|-------|
| 1 | Initial load | Grid shows ~30 Pokemon cards with sprites, names, type badges | | |
| 2 | Load more | Click "Load more" — additional cards appear | | |
| 3 | Empty detail | Right panel shows "Select a Pokemon to display here." | | |
| 4 | Select Pikachu (#25) | Animated GIF sprite; ID, name, types, height, weight, abilities, 6 stats + total | | |
| 5 | Select Charizard (#6) | Animated GIF plays | | |
| 6 | Select Pokemon #650+ | Static PNG sprite (no broken image) | | |
| 7 | Selected highlight | Clicked card has distinct border/style vs others | | |
| 8 | Rapid switching | Click several Pokemon quickly — detail shows correct Pokemon (no stale data) | | |
| 9 | Error retry | Simulate offline or invalid id if possible — error message + retry works | | |
| 10 | Mobile width (<1100px) | Stacked layout: list above, detail below, scrollable | | |

Generated from `.cursor/skills/verify-pokedex-task/phase-checklists.md`. The test-author subagent updates this table during phase verification.
