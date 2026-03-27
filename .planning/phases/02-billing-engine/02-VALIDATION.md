---
phase: 2
slug: billing-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (from Phase 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CUST-01..06 | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | INV-01..09 | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | REC-01..03 | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | PAY-01..05, COLL-01..05 | smoke | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. vitest already installed from Phase 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Customer create form fields | CUST-01 | Form UI validation | Create customer, verify all fields save |
| Invoice line item auto-calculation | INV-02, INV-03 | UI interaction | Add line items, verify subtotal/tax/total calculate |
| Invoice status auto-update | INV-07 | Multi-step workflow | Record payment, verify status changes |
| Collections flag toggle | COLL-02 | UI interaction | Flag customer, verify badge appears |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
