---
phase: 01-foundation-auth
plan: 02
subsystem: ui, auth
tags: [next.js, app-router, sidebar, layout, responsive, design-spec, lucide-react, next-themes]

requires:
  - phase: 01-foundation-auth
    provides: iron-session auth, getSession(), login/logout actions, shadcn/ui components, Tailwind v4 design tokens
provides:
  - Admin sidebar with role-filtered navigation (manager vs billing_clerk)
  - Portal top-bar for customer layout
  - Breadcrumbs component from route segments
  - Three route group layouts ((auth), (admin), (portal))
  - Styled login page with DESIGN-SPEC.md split layout, hero image, wave pattern
  - Dashboard placeholder with hero header using dashboard-header.png
affects: [02-billing-core, 03-dashboard-reports, 04-portal-pdf]

tech-stack:
  added: []
  patterns: [server-component layout with client sidebar, Sheet overlay for mobile sidebar, role-filtered navigation items, split-screen login with hero image]

key-files:
  created:
    - src/components/layout/sidebar.tsx
    - src/components/layout/sidebar-client.tsx
    - src/components/layout/top-bar.tsx
    - src/components/layout/top-bar-client.tsx
    - src/components/layout/breadcrumbs.tsx
    - src/app/(admin)/page.tsx
    - src/app/(portal)/page.tsx
  modified:
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/layout.tsx
    - src/app/(admin)/layout.tsx
    - src/app/(admin)/dashboard/page.tsx
    - src/app/(portal)/layout.tsx
    - src/app/(portal)/portal/page.tsx

key-decisions:
  - "Sidebar split into server component (getSession) + client component (interactivity, usePathname, useTheme)"
  - "Portal page lives at (portal)/portal/page.tsx to avoid route conflict with (admin) root page"
  - "Login page uses hardcoded hex colors for left panel since it's a standalone branded page"

patterns-established:
  - "Server component wrapper + client component pattern for layouts needing both session data and interactivity"
  - "Sidebar stores collapse preference in localStorage"
  - "Admin layout wraps content at max-w-[1400px], portal at max-w-[1200px]"

requirements-completed: [AUTH-04, AUTH-05, AUTH-06, UI-09, UI-10, UI-11, UI-12]

duration: 4min
completed: 2026-03-27
---

# Phase 01 Plan 02: Application Shells & Login Styling Summary

**Role-filtered admin sidebar with responsive collapse, portal top-bar, breadcrumbs, and DESIGN-SPEC.md split-screen login with hero-marina.png and wave pattern**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-27T00:08:18Z
- **Completed:** 2026-03-27T00:12:30Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Admin sidebar with role-filtered navigation: manager sees Settings, billing_clerk does not
- Sidebar collapses to 72px icons at 768px, becomes Sheet overlay at 640px
- Portal top-bar with logo, customer name, dark mode toggle, and logout
- Login page styled per DESIGN-SPEC.md: 55/45 split, hero-marina.png, wave-pattern.svg at 6% opacity, gradient blend, demo credentials card
- Auth layout redirects already-logged-in users to their appropriate dashboard
- Dashboard placeholder with dashboard-header.png hero card and dark overlay

## Task Commits

Each task was committed atomically:

1. **Task 1: Build admin sidebar, portal top-bar, breadcrumbs, and route group layouts** - `3e924d36` (feat)
2. **Task 2: Style login page with split layout, hero image, wave pattern, demo credentials** - `366ec88f` (feat)

## Files Created/Modified
- `src/components/layout/sidebar.tsx` - Server component wrapper calling getSession for role
- `src/components/layout/sidebar-client.tsx` - Client sidebar with collapse, mobile overlay, role-filtered nav
- `src/components/layout/top-bar.tsx` - Server component wrapper for portal navigation
- `src/components/layout/top-bar-client.tsx` - Client top-bar with logo, name, theme toggle, logout
- `src/components/layout/breadcrumbs.tsx` - Client breadcrumbs from usePathname route segments
- `src/app/(admin)/layout.tsx` - Admin shell with Sidebar + Breadcrumbs, max-w-1400px
- `src/app/(admin)/dashboard/page.tsx` - Dashboard placeholder with hero header card
- `src/app/(portal)/layout.tsx` - Portal shell with TopBar, max-w-1200px
- `src/app/(portal)/portal/page.tsx` - Portal home with account summary placeholders
- `src/app/(auth)/layout.tsx` - Auth layout with logged-in redirect
- `src/app/(auth)/login/page.tsx` - Full DESIGN-SPEC split-screen login page

## Decisions Made
- Sidebar uses server/client component split pattern: server fetches session, client handles interactivity
- Portal page placed at `/portal` route (not root) to avoid Next.js route conflict between (admin) and (portal) route groups
- Login page uses explicit hex colors rather than Tailwind tokens for the branded left panel background

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed seed.ts readonly type error**
- **Found during:** Task 1 (build verification)
- **Issue:** PAYMENT_METHODS array used `as const` making it readonly, incompatible with drizzle's mutable parameter type
- **Fix:** Changed from `as const` to explicit union type annotation
- **Files modified:** src/lib/db/seed.ts
- **Verification:** Build passes
- **Committed in:** 3e924d36 (Task 1 commit)

**2. [Rule 3 - Blocking] Resolved route conflict between (admin) and (portal) root pages**
- **Found during:** Task 1 (build verification)
- **Issue:** Both (admin)/page.tsx and (portal)/page.tsx resolved to same path `/`, causing Turbopack build error
- **Fix:** Removed (admin)/page.tsx (middleware handles routing), kept portal content at /portal sub-route
- **Files modified:** src/app/(admin)/page.tsx (removed), src/app/(portal)/portal/page.tsx
- **Verification:** Build passes
- **Committed in:** 3e924d36 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for build to pass. No scope creep.

## Issues Encountered
- Next.js Turbopack does not allow two parallel route group pages resolving to the same path -- resolved by removing (admin)/page.tsx and relying on middleware for routing

## User Setup Required
None - all assets pre-generated in public/assets/.

## Next Phase Readiness
- All three application shells ready for feature pages
- Sidebar navigation links to /invoices, /payments, /customers, /reports, /settings (pages to be built in Phase 2+)
- Design tokens and component styling patterns established for future pages

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-27*
