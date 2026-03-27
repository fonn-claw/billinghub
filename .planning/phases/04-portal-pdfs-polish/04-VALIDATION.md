---
phase: 04
slug: portal-pdfs-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Build check + manual verification |
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
| 04-01-01 | 01 | 1 | PORT-01,02,03,04,05 | build+manual | `npm run build` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | PDF-01,02,03 | build+manual | `npm run build` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | UI-04 | build+manual | `npm run build` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | UI-05,06,07,08 | build+manual | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `@react-pdf/renderer` package installed
- [ ] @react-pdf imports resolve in build

*Existing infrastructure covers most requirements. Only new dependency is @react-pdf/renderer.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Portal account summary display | PORT-01 | Visual layout | Log in as boater@billinghub.app, verify account summary card |
| PDF invoice branding | PDF-01 | Visual output | Download invoice PDF, verify logo, gold accent line, wave footer |
| PDF statement generation | PDF-02 | Visual output | Generate statement PDF, verify transaction list and branding |
| Dark mode color mapping | UI-04 | Visual theme | Toggle dark mode, verify all surfaces use correct dark colors |
| Page transitions | UI-05 | Visual animation | Navigate between pages, verify fade-in slide-up |
| Skeleton loading states | UI-08 | Visual loading | Throttle network, verify skeleton shapes match content layout |
| Pay Now button disabled | PORT-05 | Interaction | Click Pay Now, verify tooltip shows "Coming Soon" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
