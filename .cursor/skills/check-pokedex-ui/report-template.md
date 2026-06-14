# UI check report template

Save completed reports as `tests/reports/ui-check-<YYYY-MM-DD>.md`.

```markdown
# UI check: <scope>

**Date:** YYYY-MM-DD
**Result:** PASS | FAIL
**Dev server:** http://localhost:3100

## E2E (Playwright)

| Check | Result | Notes |
|-------|--------|-------|
| npm run test:e2e | PASS / FAIL | |

## Browser scenarios

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | ... | PASS / FAIL / MANUAL | |

## Issues found

### Critical
- (none)

### Major
- (none)

### Minor
- (none)

## Console / dev log

| Level | Message | When |
|-------|---------|------|
| ERROR | ... | on load / on search / ... |

## Recommended fixes

1. ...

## Screenshots / traces

- Playwright trace: `tests/artifacts/test-results/` (if enabled)
```
