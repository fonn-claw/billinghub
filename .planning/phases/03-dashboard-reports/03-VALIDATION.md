---
phase: 03
slug: dashboard-reports
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification + build check |
| **Config file** | next.config.ts |
| **Quick run command** | `npm run build 2>&1 | tail -20` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build 2>&1 | tail -20`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must pass
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DASH-01,02,03,04 | build+manual | `npm run build` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | DASH-05,06,07 | build+manual | `npm run build` | ✅ | ⬜ pending |
| 03-01-03 | 01 | 1 | DASH-08,09,10 | build+manual | `npm run build` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | RPT-01,02,03,04 | build+manual | `npm run build` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | RPT-05 | build+manual | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `recharts` package installed
- [ ] Recharts imports resolve in build

*Existing infrastructure covers most phase requirements. Only new dependency is recharts.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Counter roll-up animation | DASH-09 | Visual animation timing | Load dashboard, verify numbers animate from 0 |
| Chart draw-in animations | DASH-05,06,07 | Visual animation | Load dashboard, verify charts animate on entry |
| Dashboard header hero image | DASH-10 | Visual layout | Verify gradient overlay on dashboard-header.png |
| CSV file downloads | RPT-05 | Browser download behavior | Click export, verify .csv file downloads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
