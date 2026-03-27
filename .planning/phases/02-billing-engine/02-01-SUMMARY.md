---
phase: 02-billing-engine
plan: 01
subsystem: database, ui, utilities
tags: [drizzle, shadcn, zod, date-fns, aging, validation]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: "Schema with customers, invoices, collectionNotes tables; sidebar navigation"
provides:
  - "customerNotes table for billing communication log"
  - "isCollectionsFlagged and lastReminderDate columns on customers"
  - "Amended collectionNotes with customerId, noteType, promisedDate, promisedAmountCents"
  - "Aging bucket utility (getAgingBucket, agingColors, agingLabels)"
  - "Zod validation schemas for all Phase 2 forms"
  - "Invoice number generator (INV-XXXXX format)"
  - "InvoiceStatusBadge component (6 statuses)"
  - "Sidebar nav items for Recurring and Collections"
  - "shadcn components: dialog, select, tabs, textarea, switch, popover, calendar, progress"
affects: [02-billing-engine, 03-customer-portal, 04-reports-pdf]

# Tech tracking
tech-stack:
  added: [react-day-picker]
  patterns: [aging-bucket-categorization, zod-form-validation, invoice-number-sequence]

key-files:
  created:
    - src/lib/utils/aging.ts
    - src/lib/utils/validation.ts
    - src/lib/utils/invoice-number.ts
    - src/components/invoices/status-badge.tsx
    - src/components/ui/dialog.tsx
    - src/components/ui/select.tsx
    - src/components/ui/tabs.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/switch.tsx
    - src/components/ui/popover.tsx
    - src/components/ui/calendar.tsx
    - src/components/ui/progress.tsx
  modified:
    - src/lib/db/schema.ts
    - src/components/layout/sidebar-client.tsx
    - src/lib/db/seed.ts

key-decisions:
  - "Aging buckets: current=1-30d, 30day=31-60d, 60day=61-90d, 90plus=91+d overdue"
  - "collectionNotes now linked to customer (required) with optional invoice reference"

patterns-established:
  - "Aging utility: import getAgingBucket from @/lib/utils/aging for overdue categorization"
  - "Validation: import Zod schemas from @/lib/utils/validation for form validation"
  - "Status badge: import InvoiceStatusBadge for consistent invoice status display"

requirements-completed: [INV-09, COLL-01]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 2 Plan 1: Billing Engine Foundation Summary

**Schema amendments for collections workflow, shared aging/validation/invoice-number utilities, status badge component, and 8 shadcn UI primitives**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-27T00:36:05Z
- **Completed:** 2026-03-27T00:39:09Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Amended schema with customerNotes table, collections fields on customers and collectionNotes
- Created aging bucket utility for AR aging categorization (current/30/60/90+ days)
- Created Zod validation schemas for all Phase 2 forms (customer, invoice, payment, recurring, collection)
- Created InvoiceStatusBadge with 6 color-coded status variants
- Installed 8 shadcn components and added Recurring/Collections to sidebar nav

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema amendments, shadcn install, and sidebar nav update** - `62bab2ca` (feat)
2. **Task 2: Shared utilities - aging, validation, invoice number, status badge** - `37082ca9` (feat)
3. **Dependencies update** - `ea37d475` (chore)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added customerNotes table, isCollectionsFlagged/lastReminderDate on customers, amended collectionNotes
- `src/lib/utils/aging.ts` - Aging bucket categorization with colors and labels
- `src/lib/utils/validation.ts` - Zod schemas for all Phase 2 forms
- `src/lib/utils/invoice-number.ts` - Sequential invoice number generator (INV-XXXXX)
- `src/components/invoices/status-badge.tsx` - Color-coded badge for 6 invoice statuses
- `src/components/layout/sidebar-client.tsx` - Added Recurring and Collections nav items
- `src/components/ui/{dialog,select,tabs,textarea,switch,popover,calendar,progress}.tsx` - shadcn UI primitives
- `src/lib/db/seed.ts` - Fixed collectionNotes insert to include customerId

## Decisions Made
- Aging buckets use standard 30-day intervals: current (1-30), 30day (31-60), 60day (61-90), 90plus (91+)
- collectionNotes now require customerId (customer-level notes) with optional invoiceId

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed seed file collectionNotes insert**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** Schema change made customerId required on collectionNotes but seed file did not provide it
- **Fix:** Added customerId field to collectionNotes insert using inv.customerId
- **Files modified:** src/lib/db/seed.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 37082ca9 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for type safety after schema change. No scope creep.

## Issues Encountered
- `npx shadcn@latest` command failed due to npx/npm version issue; resolved by using `npm exec -- shadcn@latest`
- `drizzle-kit push` required `--force` flag due to adding not-null customerId to existing collectionNotes rows

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 2 shared utilities and schema changes are in place
- Subsequent plans can import aging, validation, invoice-number utilities and InvoiceStatusBadge
- All 8 shadcn UI components available for billing forms

---
*Phase: 02-billing-engine*
*Completed: 2026-03-27*

## Self-Check: PASSED
