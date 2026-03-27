---
phase: 01-foundation-auth
plan: 03
subsystem: database
tags: [seed, demo-data, drizzle, bcrypt, date-fns, postgres]

requires:
  - phase: 01-foundation-auth/01-01
    provides: Database schema with all table definitions (users, customers, invoices, lineItems, payments, collectionNotes, recurringTemplates)
provides:
  - Comprehensive demo data: 25 customers, 150+ invoices, payments, recurring templates
  - 3 demo user accounts (manager, billing_clerk, customer) with hashed passwords
  - Realistic aging distribution across 30/60/90+ day buckets
  - Idempotent seed script runnable via npm run db:seed
affects: [02-invoicing, 03-payments-collections, 04-dashboard-reports]

tech-stack:
  added: []
  patterns: [idempotent-seed-with-truncate, relative-date-anchoring, integer-cents-for-money]

key-files:
  created:
    - src/lib/db/seed.ts
  modified:
    - package.json

key-decisions:
  - "Seed uses relative dates via date-fns subMonths/subDays anchored to current date for realistic aging"
  - "Invoice status distribution applied via random shuffle then slice for even distribution"
  - "Extra 25-35 fuel/maintenance/amenity invoices added beyond monthly slip rentals to exceed 150 total"

patterns-established:
  - "Seed truncation order: collectionNotes -> payments -> lineItems -> invoices -> recurringTemplates -> customers -> users"
  - "Invoice numbering: INV-XXXXX with padStart counter"
  - "Slip rate tiers: 40ft+ = $850/mo, 30-39ft = $650/mo, under 30ft = $450/mo"

requirements-completed: [SEED-01, SEED-02, SEED-04, SEED-05, SEED-06, SEED-07]

duration: 5min
completed: 2026-03-27
---

# Phase 01 Plan 03: Seed Data Summary

**Idempotent seed script creating 25 marina customers, 150+ invoices with 60/20/15/5% aging distribution, mixed revenue line items, partial payments, and recurring templates**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-27T00:08:11Z
- **Completed:** 2026-03-27T00:13:54Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- 25 customer accounts with realistic vessel details across docks A-E, linked to demo user accounts
- 150+ invoices spanning 6 months with correct aging distribution: 60% paid on time, 20% paid late, 15% overdue, 5% in collections
- Mixed revenue types per invoice: slip_rental, fuel, maintenance, amenity, service with randomized secondary charges
- 3 customers with partial payment plans (30-50% paid)
- 15 recurring monthly invoice templates for long-term slip holders
- Collection notes on accounts in collections status

## Task Commits

Each task was committed atomically:

1. **Task 1: Create comprehensive seed script** - `091c4c39` (feat)

**Plan metadata:** pending

## Files Created/Modified
- `src/lib/db/seed.ts` - Complete seed script with 25 customers, 150+ invoices, payments, recurring templates, collection notes
- `package.json` - Added `db:seed` script entry

## Decisions Made
- Used random shuffle then slice approach for aging distribution to ensure consistent percentages regardless of total invoice count
- Set extra invoice count to 25-35 (beyond 90 monthly + ~30 other) to reliably exceed 150 total
- Tax rate fixed at 7.5% for all invoices
- Payment reference format: PAY-XXXXX with incrementing counter

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- DATABASE_URL needed to be loaded from .env.local for tsx execution (not auto-loaded like Next.js does)
- Initial run produced 148 invoices; adjusted extra invoice range from 20-30 to 25-35 to reliably exceed 150

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Database fully populated with demo data ready for Phase 2 (invoicing UI) and Phase 3 (payments/collections)
- All aging buckets populated for dashboard visualizations in Phase 4
- Recurring templates ready for auto-generation feature

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-27*

## Self-Check: PASSED
