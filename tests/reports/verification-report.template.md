# Verification report template

Subagents save completed reports as `tests/reports/<phase-id>-report.md`.

```markdown
# Verification: <phase-id>

**Date:** YYYY-MM-DD
**Result:** PASS | FAIL

## Automated checks

| Check | Result | Output |
|-------|--------|--------|
| lint | PASS / FAIL | |
| build | PASS / FAIL | |
| unit tests | PASS / FAIL / SKIPPED | |

## Browser tests

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | ... | PASS / FAIL | |

## Code review

- (files checked, criteria met or missed)

## Failures

- (list or "None")

## Recommended fixes

- (list or "None")
```
