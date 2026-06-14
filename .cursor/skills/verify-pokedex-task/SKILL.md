---
name: verify-pokedex-task
description: >-
  Verifies and tests a completed Pokedex project phase using Cursor subagents.
  Creates test cases in tests/, runs automated checks, and produces a PASS/FAIL
  report. Use when all Phase 1 or Phase 2 tasks are done, when the user asks to
  verify a phase, or before starting the next phase.
---

# Verify Pokedex Phase (Cursor Subagents)

Run structured **verification and testing** after an entire phase is complete in [docs/PLAN.md](../../../docs/PLAN.md). Do **not** run after individual tasks — only when all tasks in the phase are marked `[x]`.

Uses **three Cursor subagents** (Task tool).

## Prerequisites

1. All phase tasks marked `[x]` in [docs/PLAN.md](../../../docs/PLAN.md)
2. Project at `c:\Workspace\pokedex` with `npm install` done
3. [phase-checklists.md](phase-checklists.md) and [tests/README.md](../../../tests/README.md) present

## When to use

| Trigger | Phase |
|---------|-------|
| All Phase 1 tasks marked `[x]` | `phase-1` |
| All Phase 2 features implemented | `phase-2` |
| User says "verify phase 1", "test phase 1", `/verify-pokedex-task` | matching phase |
| Before starting Phase 2 | verify `phase-1` first |

## Verification workflow

The **parent agent** orchestrates three subagents in order. Do not skip steps.

```
Phase verification progress:
- [ ] Step 1: Confirm all phase tasks are [x] in docs/PLAN.md
- [ ] Step 2: Subagent — test-author (create/update tests in tests/<phase-id>/)
- [ ] Step 3: Subagent — test-runner (lint, build, run tests)
- [ ] Step 4: Subagent — verifier (code review + report PASS/FAIL)
- [ ] Step 5: Fix failures, re-run Steps 2–4 until PASS
- [ ] Step 6: Mark phase success criteria [x] in docs/PLAN.md
```

### Step 1 — Confirm phase readiness

Read [docs/PLAN.md](../../../docs/PLAN.md) and [phase-checklists.md](phase-checklists.md).

Valid phase IDs: `phase-1`, `phase-2`.

### Step 2 — Subagent: test-author

Launch **one** `Task` with `subagent_type: "generalPurpose"`.

**Prompt template** (replace `<PHASE_ID>`):

```
You are the test-author for the Pokedex project at c:\Workspace\pokedex.

Phase: <PHASE_ID>

Read:
- docs/PLAN.md (phase tasks and success criteria)
- .cursor/skills/verify-pokedex-task/phase-checklists.md (section <PHASE_ID>)
- tests/README.md

Create or update test artifacts under tests/<PHASE_ID>/:

1. browser-scenarios.md — table of manual browser tests with Result/Notes columns (from phase-checklists browser script)
2. unit/ — add *.test.ts for testable pure code (lib/pokeapi.ts, lib/constants.ts, utils/format.ts). Use Vitest if not installed: add vitest + npm test script only when unit tests are added.
3. Do NOT modify src/ unless a test utility is strictly required.

Return a summary listing every file created or updated.
```

Wait for completion before Step 3.

### Step 3 — Subagent: test-runner

Launch **one** `Task` with `subagent_type: "shell"`.

**Prompt template**:

```
You are the test-runner for c:\Workspace\pokedex.

Run from project root:
1. npm run lint
2. npm run build
3. npm test (if script exists; report SKIPPED if not)

Record exit codes and key output lines for each command.

Return:
- lint: PASS | FAIL + output snippet
- build: PASS | FAIL + output snippet
- test: PASS | FAIL | SKIPPED + output snippet
```

Wait for completion before Step 4.

### Step 4 — Subagent: verifier

Launch **one** `Task` with `subagent_type: "generalPurpose"` and `readonly: true`.

**Prompt template** (paste test-runner results into `<RUNNER_RESULTS>`):

```
You are the verifier for c:\Workspace\pokedex phase <PHASE_ID>.

Read:
- docs/PLAN.md (Phase success criteria)
- .cursor/skills/verify-pokedex-task/phase-checklists.md (<PHASE_ID> section)
- tests/<PHASE_ID>/ (all test files)
- Relevant src/ implementation files

Test-runner results:
<RUNNER_RESULTS>

Tasks:
1. Confirm every expected file from phase-checklists exists.
2. Read implementation against all pass criteria.
3. Assess browser-scenarios.md — list scenarios that need manual confirmation vs code-verified.
4. Write report to tests/reports/<PHASE_ID>-report.md using tests/reports/verification-report.template.md format.
5. Return PASS or FAIL with summary.

PASS only if: lint PASS, build PASS, all critical pass criteria met, no blocking failures.
Unit test FAIL or SKIPPED alone does not FAIL phase if criteria are met by code review — note in report.
```

### Step 5 — Handle result

Read `tests/reports/<PHASE_ID>-report.md`.

| Result | Action |
|--------|--------|
| **PASS** | Mark phase success criteria `[x]` in `docs/PLAN.md`; proceed to next phase |
| **FAIL** | Fix issues; re-run Steps 2–4 |

### Step 6 — Update PLAN.md

Only after PASS, check off every item in the phase success criteria section.

## Manual browser tests (parent or user)

After subagents pass automated checks, optionally run browser scenarios from `tests/<PHASE_ID>/browser-scenarios.md`:

```powershell
npm run dev
```

Open http://localhost:3100, fill Result/Notes columns, and update the report if any scenario fails.

## Subagent launch example (parent agent)

Use three sequential Task calls — not parallel (runner depends on author; verifier depends on runner).

```typescript
// 1. test-author
Task({ subagent_type: "generalPurpose", description: "Create phase-1 tests", prompt: "..." })

// 2. test-runner (after author completes)
Task({ subagent_type: "shell", description: "Run lint build tests", prompt: "..." })

// 3. verifier (after runner completes, readonly)
Task({ subagent_type: "generalPurpose", readonly: true, description: "Verify phase-1", prompt: "..." })
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Phase tasks not all `[x]` | Complete implementation first |
| Build fails | Fix in main agent; re-run test-runner |
| No `npm test` | test-author adds Vitest + tests, or report tests as SKIPPED |
| Browser scenarios untested | Run manually; update report Result column |
| Subagent report says FAIL | Read `tests/reports/<phase-id>-report.md` Recommended fixes |

## Additional resources

- Phase pass criteria: [phase-checklists.md](phase-checklists.md)
- Test folder layout: [tests/README.md](../../../tests/README.md)
- Project plan: [docs/PLAN.md](../../../docs/PLAN.md)
