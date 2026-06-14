---
name: check-pokedex-ui
description: >-
  Runs browser-based GUI checks on the Pokedex app with Playwright: UI behavior,
  console errors, broken images, layout at desktop/mobile widths, and phase
  browser scenarios. Produces a PASS/FAIL report with issues. Use when the user
  asks to check UI in browser, test GUI behavior, find UI bugs, run browser
  tests, or verify visual/interaction issues after changes.
---

# Check Pokedex UI (Browser)

Automated **browser GUI verification** for `c:\Workspace\pokedex`. Uses **Playwright** against `http://localhost:3100`. Complements [verify-pokedex-task](../verify-pokedex-task/SKILL.md) (lint/build/unit) — run this when UI behavior needs confirmation.

## When to use

| Trigger | Scope |
|---------|-------|
| "check UI", "test in browser", "GUI check", `/check-pokedex-ui` | Full UI pass |
| After UI/component changes | Targeted scenarios (see below) |
| Before release or after phase work | `phase-1`, `phase-2`, or `all` |
| User reports a visual bug | Reproduce + extend `tests/e2e/pokedex-ui.spec.ts` |

## Prerequisites

1. `npm install` completed at project root
2. Playwright installed (Step 1 below adds it if missing)
3. Dev server on port **3100** (`npm run dev`)

## Workflow

```
UI check progress:
- [ ] Step 1: Ensure Playwright + e2e script exist
- [ ] Step 2: Start dev server (background) if not already running
- [ ] Step 3: Subagent — browser-runner (Playwright + console/network scan)
- [ ] Step 4: Subagent — ui-reviewer (map results to scenarios, write report)
- [ ] Step 5: Fix failures, re-run Steps 3–4 until PASS or user stops
```

### Step 1 — Playwright setup

From project root, ensure dependencies and scripts exist:

```powershell
npm install -D @playwright/test
npx playwright install chromium
```

Add to `package.json` if missing:

```json
"test:e2e": "playwright test --config tests/e2e/playwright.config.ts"
```

E2E files live in `tests/e2e/` (`playwright.config.ts`, `pokedex-ui.spec.ts`). Extend specs when new UI features ship.

### Step 2 — Dev server

Check if port 3100 responds. If not, start in background:

```powershell
npm run dev
```

Wait until `http://localhost:3100` returns 200 before Step 3.

### Step 3 — Subagent: browser-runner

Launch **one** `Task` with `subagent_type: "shell"`.

**Prompt template** (replace `<SCOPE>` with `all`, `phase-1`, or `phase-2`):

```
You are the browser-runner for c:\Workspace\pokedex UI checks.

Scope: <SCOPE>

1. Confirm dev server at http://localhost:3100 (start npm run dev in background if needed).
2. Run: npm run test:e2e
3. If test:e2e script missing, run Step 1 from .cursor/skills/check-pokedex-ui/SKILL.md first, then retry.
4. Capture full Playwright output (pass/fail per test, stack traces).
5. Scan .next/dev/logs/next-development.log for recent Browser ERROR/WARN lines (last 50 relevant entries).
6. Return:
   - e2e: PASS | FAIL + failed test names + snippets
   - console log issues: list of ERROR/WARN (dedupe)
   - dev server: running | started | failed
```

Wait for completion before Step 4.

### Step 4 — Subagent: ui-reviewer

Launch **one** `Task` with `subagent_type: "generalPurpose"` and `readonly: true`.

**Prompt template** (paste browser-runner output into `<RUNNER_RESULTS>`):

```
You are the ui-reviewer for c:\Workspace\pokedex.

Scope: <SCOPE>

Read:
- .cursor/skills/check-pokedex-ui/ui-checklist.md
- tests/phase-1/browser-scenarios.md and/or tests/phase-2/browser-scenarios.md (by scope)
- tests/e2e/pokedex-ui.spec.ts (what is automated)
- Relevant src/components/ for failed areas

Browser-runner results:
<RUNNER_RESULTS>

Tasks:
1. Map each browser scenario to PASS/FAIL/NOT RUN (automated vs manual-only).
2. List UI issues by severity: Critical (blocks use), Major (wrong behavior), Minor (polish/a11y/LCP warnings).
3. Write report to tests/reports/ui-check-<YYYY-MM-DD>.md using report-template.md format.
4. Update Result/Notes columns in tests/<phase>/browser-scenarios.md for scenarios you can confirm.
5. Return PASS or FAIL summary.

PASS only if: no Critical issues, e2e PASS, no uncaught console errors during tests.
LCP or lazy-load WARN alone does not FAIL — note as Minor.
```

### Step 5 — Handle result

Read `tests/reports/ui-check-<date>.md`.

| Result | Action |
|--------|--------|
| **PASS** | Done; share report with user |
| **FAIL** | Fix issues in main agent; re-run Steps 3–4 |

## Targeted checks (single feature)

When scope is narrow, run matching Playwright tests only:

```powershell
npx playwright test --config tests/e2e/playwright.config.ts -g "search"
npx playwright test --config tests/e2e/playwright.config.ts -g "mobile"
```

Add or adjust tests in `pokedex-ui.spec.ts` for the feature under review.

## Selectors (stable hooks)

Prefer accessibility hooks already in the app:

| Element | Selector |
|---------|----------|
| Search | `getByRole('searchbox', { name: /search pokémon/i })` |
| Card by id | `.pokemon-card` filtered by `#25` text |
| Card (named) | `getByRole('button', { name: /select bulbasaur/i })` after list data loads |
| Empty detail | `.pokemon-detail-empty` |
| Detail name | `.detail-name` |
| Close modal | `getByRole('button', { name: /close pokémon details/i })` |
| Loading screen | `.loading-screen` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED :3100` | Start `npm run dev`; wait for ready |
| Playwright browsers missing | `npx playwright install chromium` |
| Flaky animation tests | Increase timeout or use `toBeVisible` not snapshot |
| Stale dev log errors | Clear log or note fixed-after timestamp in report |
| Phase 2 infinite scroll | Scroll `.pokemon-list` or page; wait for card count increase |

## Additional resources

- Extended checks: [ui-checklist.md](ui-checklist.md)
- Report format: [report-template.md](report-template.md)
- Phase scenarios: [phase-checklists.md](../verify-pokedex-task/phase-checklists.md)
- E2E tests: [tests/e2e/](../../../tests/e2e/)
