# Phase 1: Foundation & Auth - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Database schema design, session-based authentication with three roles (manager, billing_clerk, customer), styled application shell with sidebar navigation, design system initialization per DESIGN-SPEC.md, and comprehensive seed data (25 customers, 150+ invoices, 3 demo accounts). This phase delivers the foundation that all subsequent phases build on.

</domain>

<decisions>
## Implementation Decisions

### Login Flow & Session Handling
- iron-session with encrypted cookies for session management (no external auth service needed for 3 demo accounts)
- Generic "Invalid email or password" error message (no user enumeration)
- Sessions persist for 7 days, no explicit "remember me" toggle
- Role-based redirect after login: manager/clerk → /dashboard, customer → /portal
- Passwords hashed with bcrypt
- Middleware enforces role-based route protection at the server level — not just UI hiding

### Database Schema & Money Storage
- All monetary values stored as integer cents in Postgres (never floats)
- Format to dollars only in the UI presentation layer
- Use Postgres `integer` type for amounts, not `numeric` or `decimal` (sufficient precision for marina billing amounts)
- Invoice numbers auto-increment as INV-XXXXX format
- Drizzle ORM with `drizzle-kit` for migrations
- Use Postgres enums for status fields (invoice_status, payment_method, charge_category, user_role)

### Design System Initialization
- Initialize shadcn/ui and override CSS variables to match DESIGN-SPEC.md color palette
- next/font for loading DM Serif Display (headings) and Inter (body) from Google Fonts
- Tailwind config extended with custom colors: deep-navy, ocean-teal, harbor-gold, and all semantic/surface colors
- Card, Button, Input, Table, Badge components styled per DESIGN-SPEC.md specifications
- Dark mode toggle in sidebar bottom (admin) and top bar (portal) — uses CSS class strategy
- Signature gradient as reusable utility class

### Application Shell Layout
- Admin layout: 260px sidebar (expanded) / 72px (collapsed) with content area
- Customer portal layout: top bar with logo, account name, logout — no sidebar
- Auth layout: split screen (55/45) for login page
- Sidebar collapses to icon-only at 768px breakpoint, becomes overlay at 640px
- Breadcrumbs generated dynamically from route segments
- Logo rendered from public/assets/logo.svg at 36px with "BillingHub" wordmark
- Wave pattern SVG used as background decoration at 5-8% opacity on login, empty states

### Seed Data Strategy
- All dates relative to `new Date()` so aging buckets look realistic on any run date
- Idempotent: truncate all tables then re-insert (safe to run multiple times)
- 25 customers with realistic names, vessel details (name, type, length), slip assignments across docks A-E
- 150+ invoices spanning 6 months with distribution: 60% paid on time, 20% paid late, 15% currently overdue, 5% in collections
- Mixed revenue types per invoice: slip rental (monthly), fuel purchases, maintenance, amenity fees, services
- 15 long-term slip holders with recurring monthly invoices
- 3 customers with active payment plans (partial payments recorded)
- 3 demo accounts: manager@billinghub.app, billing@billinghub.app, boater@billinghub.app (all password: demo1234)
- Realistic marina names for vessels (e.g., "Sea Breeze", "Windward Spirit", "Blue Horizon")

### Claude's Discretion
- Exact Drizzle schema field names and table relationships
- Middleware implementation approach (Next.js middleware.ts vs per-route checks)
- Skeleton loading component design details
- Exact sidebar nav item ordering and grouping

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Identity
- `DESIGN-SPEC.md` — Complete visual identity: colors, typography, component styles, layout, motion, dark mode, chart styling, PDF styling
- `BRIEF.md` — Business context, feature requirements, demo data specifications, tech stack constraints

### Pre-generated Assets
- `public/assets/logo.svg` — App logo (48x48 viewBox), invoice on waves
- `public/assets/favicon.svg` — Simplified favicon (32x32 viewBox)
- `public/assets/hero-marina.png` — Login screen right panel hero image
- `public/assets/dashboard-header.png` — Dashboard welcome header background
- `public/assets/wave-pattern.svg` — Signature background element
- `public/assets/empty-invoices.svg` — Empty state illustration for invoices
- `public/assets/empty-payments.svg` — Empty state illustration for payments
- `public/assets/empty-customers.svg` — Empty state illustration for customers

### Research
- `.planning/research/STACK.md` — Verified library versions and rationale
- `.planning/research/PITFALLS.md` — Domain-specific pitfalls (money storage, PDF compat, aging dates)
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, build order

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project
- Pre-generated SVG/PNG assets in public/assets/ ready to integrate

### Established Patterns
- None yet — this phase establishes all patterns for subsequent phases

### Integration Points
- Database schema established here will be consumed by all subsequent phases
- Auth middleware established here gates all protected routes
- Design system (colors, components, typography) established here is used everywhere
- Sidebar navigation structure must accommodate Phase 2-4 menu items (invoices, payments, customers, dashboard, reports)

</code_context>

<specifics>
## Specific Ideas

- Login page must have split layout with hero-marina.png on right panel, gradient fade into left panel
- Dashboard header uses dashboard-header.png with dark overlay for text legibility
- Wave pattern at bottom of login left panel at 5-8% opacity
- Revenue numbers use Harbor Gold (#E8AA42) for primary figure
- Sidebar active item has left border in Harbor Gold with teal background accent
- Demo credentials displayed in subtle card below login form

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-auth*
*Context gathered: 2026-03-26*
