---
phase: 01-foundation-auth
plan: 01
subsystem: auth, database, ui
tags: [next.js, tailwind-v4, drizzle, iron-session, bcryptjs, neon-postgres, shadcn-ui]

requires:
  - phase: none
    provides: greenfield project
provides:
  - Next.js 15 project with Tailwind v4 design tokens from DESIGN-SPEC.md
  - Complete Drizzle schema (users, customers, invoices, lineItems, payments, collectionNotes, recurringTemplates)
  - Neon Postgres database with pushed schema and 3 demo users
  - iron-session authentication with login/logout server actions
  - Role-based middleware route protection (customer vs staff)
  - shadcn/ui component library initialized (button, card, input, table, badge, etc.)
  - Currency formatting utilities (formatCurrency, formatCurrencyParts)
affects: [01-foundation-auth, 02-billing-core, 03-dashboard-reports, 04-portal-pdf]

tech-stack:
  added: [next.js@15, drizzle-orm, @neondatabase/serverless, iron-session@8, bcryptjs, next-themes, zod, date-fns, lucide-react, shadcn/ui, tailwind-v4]
  patterns: [iron-session encrypted cookies, Tailwind v4 @theme inline, neon-http driver, server actions for auth, middleware route protection]

key-files:
  created:
    - src/app/globals.css
    - src/lib/db/schema.ts
    - src/lib/db/index.ts
    - src/lib/auth/session.ts
    - src/lib/auth/actions.ts
    - src/middleware.ts
    - src/lib/formatting.ts
    - drizzle.config.ts
    - src/app/(auth)/login/page.tsx
  modified:
    - src/app/layout.tsx
    - package.json

key-decisions:
  - "Used Vercel-Neon integration for database provisioning (auto-created project quiet-art-82532001)"
  - "Login server action uses (prevState, formData) signature for useActionState compatibility"
  - "Middleware duplicates sessionOptions inline since edge runtime cannot import next/headers"

patterns-established:
  - "Tailwind v4 @theme inline for all color tokens -- no tailwind.config.js"
  - "iron-session getSession() in server components/actions, getIronSession(req,res) in middleware"
  - "All monetary values as integer cents in Postgres schema"
  - "Route groups: (auth), (admin), (portal) for layout separation"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-07, AUTH-08, UI-01, UI-02, UI-03, SEED-03]

duration: 13min
completed: 2026-03-27
---

# Phase 01 Plan 01: Foundation & Auth Summary

**Next.js 15 with Tailwind v4 design tokens, Drizzle schema on Neon Postgres, iron-session auth with role-based middleware, and shadcn/ui component library**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-26T23:51:15Z
- **Completed:** 2026-03-27T00:04:30Z
- **Tasks:** 2
- **Files modified:** 28

## Accomplishments
- Next.js 15 project with all DESIGN-SPEC.md color tokens live as Tailwind v4 CSS variables
- Complete Drizzle schema with 7 tables and 5 Postgres enums pushed to Neon
- 3 demo users seeded with bcrypt-hashed passwords
- Login/logout with iron-session encrypted cookies and 7-day TTL
- Middleware enforces role-based routing: unauthenticated to /login, customer to /portal, staff to /dashboard

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js 15, design tokens, Drizzle schema, demo users** - `2f258852` (feat)
2. **Task 2: iron-session auth and middleware route protection** - `7c480a40` (feat)

## Files Created/Modified
- `src/app/globals.css` - Tailwind v4 design tokens from DESIGN-SPEC.md with @theme inline
- `src/app/layout.tsx` - Root layout with DM Serif Display + Inter fonts, ThemeProvider
- `src/lib/db/schema.ts` - Complete Drizzle schema: users, customers, invoices, lineItems, payments, collectionNotes, recurringTemplates
- `src/lib/db/index.ts` - Neon-http database connection
- `src/lib/db/seed-users.ts` - Script to seed 3 demo user accounts
- `src/lib/auth/session.ts` - iron-session getSession helper with SessionData type
- `src/lib/auth/actions.ts` - Login/logout server actions
- `src/middleware.ts` - Route protection with role enforcement
- `src/lib/formatting.ts` - formatCurrency and formatCurrencyParts utilities
- `src/app/(auth)/login/page.tsx` - Functional login page with useActionState
- `src/app/(admin)/dashboard/page.tsx` - Placeholder dashboard page
- `src/app/(portal)/portal/page.tsx` - Placeholder portal page
- `drizzle.config.ts` - Drizzle Kit configuration for Neon Postgres
- `src/components/ui/*` - 10 shadcn/ui components (button, card, input, table, badge, etc.)

## Decisions Made
- Used Vercel-Neon integration for database provisioning -- simplest path for Vercel deployment
- Login server action uses (prevState, formData) signature to work with React 19 useActionState
- Middleware duplicates sessionOptions inline because edge runtime cannot import modules using next/headers
- Placeholder /dashboard and /portal pages created as redirect targets (full layouts come in Plan 02)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed login server action signature for useActionState**
- **Found during:** Task 2
- **Issue:** Server action had `(formData: FormData)` signature but useActionState requires `(prevState, formData)`
- **Fix:** Changed to `(prevState: { error: string } | null, formData: FormData)`
- **Files modified:** src/lib/auth/actions.ts
- **Verification:** Build passes, TypeScript type checks pass

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for React 19 useActionState API. No scope creep.

## Issues Encountered
- create-next-app refused to run in a directory with existing files (.git, .planning/) -- resolved by initializing in /tmp and copying files back
- neonctl CLI hanging due to missing authentication -- used Vercel integration instead to auto-provision Neon database
- drizzle-kit push required explicit env var loading (not auto-loading .env.local) -- used export from .env.local

## User Setup Required
None - Neon database provisioned via Vercel integration, all env vars in .env.local.

## Next Phase Readiness
- Database schema ready for seed script (Plan 03)
- Auth system ready for layout shell integration (Plan 02)
- Design tokens ready for styled components (Plan 02)
- All shadcn/ui base components available for use

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-27*
