# Pokedex App — Plan Review (Updated)

> **Status:** Updated 2026-06-14 (sixth pass) — Reference audit findings **resolved in `PLAN.md`** as Phase 4 Part C tasks and decisions Q28–Q36.

> **Reviewed:** 2026-06-14
> **Source plan:** [`docs/PLAN.md`](./PLAN.md)
> **Reference site:** [pokedex.david-hckh.com](https://pokedex.david-hckh.com/)

---

## Section 1 — Reference Site Audit (Summary)

Full comparison table preserved from fifth pass. Key gaps now tracked as **Phase 4 Part C** in `PLAN.md`:

| Issue | Reference | Was (Part B code) | Part C fix |
|-------|-----------|-------------------|------------|
| R1 Panel flush | `bottom: 0` | `offset-bottom: 24px` | `fix-detail-panel-flush` |
| R2 Panel width | `320px` | `360px` | `fix-panel-dimensions` |
| R3 Back-to-top side | `right: 20px` | `left: 24px` (interim) | `fix-back-to-top-position` |
| R4 Back-to-top icon | PNG arrow | Unicode `↑` | `fix-back-to-top-icon` |
| R5 TOT highlight | `#88aaea` outer wrap | Circle only | `fix-tot-stat-highlight` |
| R6 ID format | `#213` | `N° 25` | **Q32: keep `N°` intentional** |
| R7 Card grid | Flex wrap | CSS grid 4-col | **Q36: intentional** |
| R8 Empty image | Neutral silhouette | Pikachu #25 | `fix-empty-placeholder` |
| R9 Panel height | `82vh` | `85vh` | `fix-panel-dimensions` |
| R10 Sprite max | `22vh` | `20vh` | `fix-panel-dimensions` |

---

## Section 2 — Phase 4 Status

| Sub-phase | Status | Verified |
|-----------|--------|----------|
| Part A — initial polish | Complete | Code + e2e |
| Part B — overlap & density | Complete | [phase-4-report.md](../tests/reports/phase-4-report.md) PASS |
| **Part C — reference parity** | Complete | [phase-4-report.md](../tests/reports/phase-4-report.md) Part C PASS |

### Part B interim fixes (superseded by Part C)

| Task | Part B outcome | Part C follow-up |
|------|----------------|------------------|
| `fix-back-to-top-overlap` | `left: 24px` — no card overlap | Move to `right: calc(var(--detail-width) + 60px)` per Q30 |
| `center-detail-sprite` | Fixed sprite + `11vh` padding | Tune after `320px` / `82vh` / `22vh` tokens |
| `fix-search-grid-overlap` | `padding-top: 68px` | ✅ Keep — exceeds reference clearance |
| `compact-detail-layout` | 2-col grids, horizontal evolution | ✅ Keep — may restore 74px evolution sprites |

---

## Section 3 — Decisions Resolved in PLAN.md (Q28–Q36)

| # | Decision | Recorded in PLAN.md |
|---|----------|---------------------|
| Q28 | Panel flush `bottom: 0` | ✅ |
| Q29 | Width `320px` (reference) | ✅ |
| Q30 | Back-to-top safe zone `right: calc(var(--detail-width) + 60px)` | ✅ (supersedes Q20) |
| Q31 | Inline SVG arrow icon | ✅ |
| Q32 | Keep `N°` ID format | ✅ |
| Q33 | Neutral empty silhouette asset | ✅ |
| Q34 | Height `82vh` | ✅ |
| Q35 | Sprite `max-height: 22vh` | ✅ |
| Q36 | 4-col grid intentional | ✅ |

Also updated: **Q10** (CSS variables), **Q20** (superseded), **Q23** (fixed sprite anchoring).

---

## Section 4 — Prior Phases (Resolved)

| Phase | Status |
|-------|--------|
| Phase 1–2 | Complete, verified |
| Phase 3 | Complete — [phase-3-report.md](../tests/reports/phase-3-report.md) PASS |
| Phase 4 Part A/B | Complete — Part B verified 2026-06-14 |
| Phase 5 | Planned — Phase 4 complete |

---

## Section 5 — Pre-Start Checklist — Phase 4 Part C

- [x] Q28–Q36 recorded in `PLAN.md` Decisions table
- [x] Part C task table added to `PLAN.md`
- [x] Implement `fix-detail-panel-flush` + `fix-panel-dimensions`
- [x] Implement `fix-back-to-top-position` + `fix-back-to-top-icon`
- [x] Implement `fix-tot-stat-highlight` + `fix-empty-placeholder`
- [x] Update e2e for flush bottom + back-to-top right zone
- [x] Run `phase-4c-verify`; update `phase-4-report.md`
- [x] Mark Phase 4 **Complete** in `PLAN.md` current status when Part C passes

---

## Verification summary

| Phase | Report | E2e (desktop) |
|-------|--------|---------------|
| 1–3 | PASS | Partial |
| 4 Part B | [phase-4-report.md](../tests/reports/phase-4-report.md) PASS | 19+ passed (2026-06-14) |
| 4 Part C | [phase-4-report.md](../tests/reports/phase-4-report.md) PASS | 27 passed, 15 skipped (2026-06-14) |

---

*Review updated: 2026-06-14 (sixth pass — findings synced to PLAN.md Part C)*
