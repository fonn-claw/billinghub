---
phase: 02-billing-engine
plan: 03
subsystem: invoicing
tags: [invoices, drizzle, server-actions, forms, line-items, aging]

requires:
  - phase: 02-01
    provides: "Schema tables (invoices, lineItems, payments), validation schemas, utility functions"
  - phase: 01-foundation-auth
    provides: "Session auth, admin layout, sidebar navigation"
provides:
  - "Invoice DAL with computeInvoiceStatus, getInvoices, getInvoiceWithDetails, getCustomerSelectList"
  - "Server actions for createInvoice, updateInvoice, markAsSent, deleteInvoice"
  - "Invoice list page with status filter tabs and search"
  - "Invoice creation form with dynamic multi-revenue line items and auto-calculated totals"
  - "Invoice detail view with payment history, progress bar, and status-appropriate actions"
  - "Invoice edit page with draft-only guard"
affects: [02-04-payments, 02-05-recurring, 03-dashboard, 04-pdf]

tech-stack:
  added: []
  patterns: [computed-status-derivation, post-query-filtering, dynamic-form-line-items, useActionState-with-json-formdata]

key-files:
  created:
    - src/lib/dal/invoices.ts
    - src/app/(admin)/invoices/actions.ts
    - src/app/(admin)/invoices/page.tsx
    - src/app/(admin)/invoices/new/page.tsx
    - src/app/(admin)/invoices/[id]/page.tsx
    - src/app/(admin)/invoices/[id]/edit/page.tsx
    - src/components/invoices/invoice-table.tsx
    - src/components/invoices/invoice-form.tsx
    - src/components/invoices/line-item-row.tsx
    - src/components/invoices/invoice-detail.tsx
  modified: []

key-decisions:
  - "Invoice status computed server-side from payments + due date via computeInvoiceStatus pure function"
  - "Status filtering done post-query since status is derived (not stored directly for non-draft)"
  - "Form data serialized as JSON in hidden input for useActionState compatibility with complex structures"
  - "Tax rate stored as decimal (0.085) but displayed/entered as percentage (8.5%)"

patterns-established:
  - "DAL pattern: src/lib/dal/*.ts exports typed query functions with computed fields"
  - "Invoice form: serialize complex form state as JSON to FormData for server actions"
  - "Draft-only guard: check status before allowing edit/delete operations"

requirements-completed: [INV-01, INV-02, INV-03, INV-04, INV-05, INV-06, INV-07, INV-08]

duration: 11min
completed: 2026-03-27
---

# Phase 02 Plan 03: Invoice Management Summary

**Full invoice CRUD with dynamic multi-revenue line items, auto-calculated totals, computed status derivation from payments and due dates, and draft-only editing enforcement**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-27T00:41:22Z
- **Completed:** 2026-03-27T00:52:30Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Invoice DAL with pure status computation function deriving effective status from payments and due dates
- Complete invoice CRUD with server actions enforcing draft-only editing and deletion
- Dynamic line item form with auto-calculated subtotal, tax, and total
- Invoice list page with status filter tabs (All, Draft, Sent, Paid, Overdue, Partial) and search
- Invoice detail view with line items table, payment history with progress bar, and action buttons
- Edit page with redirect guard for non-draft invoices

## Task Commits

Each task was committed atomically:

1. **Task 1: Invoice DAL, server actions, and list page** - `0247496a` (feat)
2. **Task 2: Invoice form, detail page, and edit page** - `55ff65a5` (feat)

## Files Created/Modified
- `src/lib/dal/invoices.ts` - Invoice data access layer with computed status and balance derivation
- `src/app/(admin)/invoices/actions.ts` - Server actions for invoice CRUD with role checks and draft guards
- `src/app/(admin)/invoices/page.tsx` - Invoice list page with status and search filtering
- `src/components/invoices/invoice-table.tsx` - Client table with status tabs, aging badges, dropdown actions
- `src/app/(admin)/invoices/new/page.tsx` - New invoice page with customer selector
- `src/app/(admin)/invoices/[id]/page.tsx` - Invoice detail page using getInvoiceWithDetails
- `src/app/(admin)/invoices/[id]/edit/page.tsx` - Edit page with draft-only redirect guard
- `src/components/invoices/invoice-form.tsx` - Dynamic form with line items and auto-calculated totals
- `src/components/invoices/line-item-row.tsx` - Line item row with category select and dollar-to-cents conversion
- `src/components/invoices/invoice-detail.tsx` - Detail view with payments progress bar and action buttons

## Decisions Made
- Invoice status is computed server-side via a pure function rather than relying on stored status for non-draft invoices
- Status filtering is done post-query since computed status requires payment aggregation
- Complex form data serialized as JSON in a hidden FormData field for useActionState compatibility
- Tax rate stored as decimal but displayed/entered as percentage for user clarity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Invoice management complete, ready for payment recording (Plan 04)
- getInvoiceWithDetails provides payment history data for the payment form
- computeInvoiceStatus will auto-update status as payments are recorded

## Self-Check: PASSED

All 10 created files verified. Both task commits (0247496a, 55ff65a5) verified in git log.

---
*Phase: 02-billing-engine*
*Completed: 2026-03-27*
