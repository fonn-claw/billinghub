# Project Research Summary

**Project:** BillingHub -- Marina Multi-Revenue Invoicing & Collections Platform
**Domain:** Billing / invoicing SaaS (marina-specific)
**Researched:** 2026-03-26
**Confidence:** MEDIUM-HIGH

## Executive Summary

BillingHub is a multi-revenue invoicing platform for marina operators, combining slip rental, fuel, maintenance, amenity, and service charges into unified invoices. This is a well-understood domain -- invoicing systems have established patterns for schema design, payment tracking, and accounts receivable aging. The recommended stack (Next.js 15 App Router, Drizzle ORM, Neon Postgres, Recharts, @react-pdf/renderer) is prescribed by the brief and verified as compatible. The architecture follows a standard Server Components + Server Actions pattern with route groups separating admin and customer portal experiences.

The core differentiator is multi-revenue-stream invoicing on a single bill -- something existing marina tools (Dockwa, MarinaOffice, Molo) do not offer. The hero feature is a revenue dashboard with KPI cards, aging visualization, and revenue breakdown charts. The build should prioritize the billing data model and core CRUD first, then layer on financial operations (payments, aging, collections), then the dashboard and PDF generation, and finally the customer portal. This dependency chain is clear and linear.

The most dangerous pitfalls are financial: floating-point money arithmetic (use integer cents or Postgres `numeric`, never floats), partial payment balance tracking (derive balance from payment records, don't store as mutable state), and aging bucket drift in demo data (use relative dates in the seed script). A secondary risk is @react-pdf/renderer SSR compatibility with Next.js App Router -- this should be prototyped early, not deferred to the end.

## Key Findings

### Recommended Stack

The stack is largely prescribed by the brief. All versions verified against npm registry. Key decision: use Next.js 15.5.x (not 16.x) for ecosystem stability with shadcn/ui and Recharts. Tailwind v4 with CSS-native config. Custom session auth instead of NextAuth (three demo accounts do not warrant a framework).

**Core technologies:**
- **Next.js 15.5 + React 19:** Full-stack framework with App Router, Server Components, Server Actions. Stable and Vercel-optimized.
- **Drizzle ORM + @neondatabase/serverless:** Type-safe ORM with Neon's serverless Postgres driver. Schema-as-code.
- **shadcn/ui + Tailwind v4:** Component library generating source code (fully customizable per DESIGN-SPEC.md) with utility-first CSS.
- **Recharts 3.8:** React-native charting for the revenue dashboard. Supports bar, line, area, donut charts with animations.
- **@react-pdf/renderer 4.3:** React component model for invoice and statement PDFs with custom fonts and branding.
- **Zod 4.3:** Runtime validation for Server Actions and form inputs.
- **date-fns 4.1:** Date arithmetic for aging calculations, due dates, and formatting.
- **bcryptjs 3.0:** Password hashing for demo accounts (pure JS, no native deps).

### Expected Features

**Must have (table stakes):**
- Invoice CRUD with multi-revenue line items (the core product)
- Customer account management with vessel/slip data
- Payment recording with partial payment support
- Invoice status tracking (draft/sent/paid/partial/overdue/collections)
- Accounts receivable aging (30/60/90+ day buckets)
- Tax calculation on line items
- PDF invoice generation with marina branding
- Role-based access control (manager, billing clerk, customer)
- Revenue reporting and dashboard KPIs
- Seed data: 25 customers, 150+ invoices, realistic aging distribution

**Should have (differentiators):**
- Unified multi-revenue invoicing (one bill, all charge types) -- THE differentiator
- Revenue dashboard with KPI cards, aging chart, revenue breakdown, trends -- hero feature
- Recurring invoice templates with auto-generation
- Collections workflow (flags, notes, promise-to-pay tracking)
- Customer self-service portal
- Statement PDF generation
- Cash flow forecast
- Dark mode

**Defer (v2+):**
- Online payment processing (Stripe/PayPal) -- massive scope, demo uses "Pay Now" placeholder
- Email delivery of invoices/reminders -- just track reminder status
- Multi-marina support -- single-tenant is fine for demo
- QuickBooks integration -- CSV export covers the use case
- Inventory management -- separate domain entirely

### Architecture Approach

Next.js App Router with Server Components for read-heavy pages (dashboard, lists) and Server Actions for mutations (invoice creation, payment recording). Route groups separate three experiences: `(admin)` with sidebar shell for manager/clerk, `(portal)` with top-bar for customers, `(auth)` for login. A Data Access Layer (DAL) in `src/lib/dal/` centralizes all Drizzle queries and business logic. PDF generation via API routes (returns binary data, not suitable for Server Actions).

**Major components:**
1. **Auth Middleware** -- Session validation, role-based route protection via encrypted cookies
2. **Admin Shell** -- Sidebar navigation layout for manager and billing clerk roles
3. **Invoice Module** -- CRUD with multi-revenue line items, status management, recurring templates
4. **Payment Module** -- Full and partial payment recording, balance tracking, payment plans
5. **Dashboard Module** -- Revenue KPIs, aging chart, revenue by category, collection trends
6. **PDF Service** -- Invoice and statement PDF generation via @react-pdf/renderer
7. **Customer Portal** -- Simplified read-only view for boaters (own invoices, account summary)
8. **Data Access Layer** -- All Drizzle queries organized by domain, used by Server Components and Actions

### Critical Pitfalls

1. **Floating-point money arithmetic** -- Store all amounts as integer cents or Postgres `numeric(10,2)`. Never use `real`/`doublePrecision`. Round tax calculations explicitly. Must be correct in schema design from day one.
2. **Partial payment balance desync** -- Model payments as separate table. Derive balance from `total - SUM(payments)`. Never store balance as a mutable field. Add overpayment prevention.
3. **Aging bucket drift in demo data** -- Use relative dates (anchored to `new Date()`) in seed script, not hardcoded dates. Produce the brief's exact distribution: 60% paid on time, 20% paid late, 15% overdue, 5% collections.
4. **@react-pdf/renderer SSR issues** -- Prototype PDF generation early in API routes, not as last feature. Register fonts at module scope. Have jsPDF as fallback plan.
5. **UI-only role checks** -- Enforce authorization at middleware AND server action/query level. Customer must not access admin routes by URL manipulation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Auth
**Rationale:** Everything depends on database schema, auth, and layouts. Schema design decisions (especially money storage) cannot be changed later without migration pain.
**Delivers:** Database schema, Drizzle config, auth system (login, session, middleware, role checks), admin shell layout, portal layout, auth layout, design system setup (Tailwind theme, shadcn/ui component overrides per DESIGN-SPEC.md).
**Addresses:** Auth & roles (P1), responsive layout foundation
**Avoids:** Pitfall 1 (float money -- schema must use integer cents), Pitfall 6 (UI-only role checks -- middleware from day one)

### Phase 2: Core Billing Data
**Rationale:** Customers and invoices are the two central entities. Every other feature depends on them existing. Seed data is needed to validate everything visually from this point forward.
**Delivers:** Customer CRUD (profiles, vessels, slip assignments), Invoice CRUD with multi-revenue line items, invoice listing with status/aging filters, seed script with realistic demo data.
**Addresses:** Customer accounts (P1), Invoice CRUD (P1), Invoice list (P1), Seed data (P1)
**Avoids:** Pitfall 2 (aging drift -- seed uses relative dates)

### Phase 3: Payments & Financial Operations
**Rationale:** Payments modify invoice state and are required for dashboard aggregations to be meaningful. Collections workflow depends on overdue invoices existing.
**Delivers:** Payment recording (full and partial), automatic invoice status updates, recurring invoice templates, collections workflow (flags, notes, aging categorization).
**Addresses:** Payment recording + partial payments (P1), Recurring templates (P2), Collections workflow (P2)
**Avoids:** Pitfall 4 (partial payment balance bugs -- derive balance, don't store), Pitfall 5 (recurring invoice duplicates -- idempotency checks)

### Phase 4: Revenue Dashboard & Reports
**Rationale:** Dashboard and reports are read-only aggregations over invoices + payments. They need both data layers to be complete. This is the hero feature for the LinkedIn showcase.
**Delivers:** Revenue dashboard (KPI cards with counter animations, aging bar chart, revenue by category donut, collection rate trends, cash flow forecast), reports module, CSV export.
**Addresses:** Revenue dashboard (P1), Reports + CSV export (P2), Cash flow forecast (P2)
**Avoids:** Pitfall 7 (dashboard query performance -- consolidate queries, add indexes, use Promise.all)

### Phase 5: PDF Generation
**Rationale:** PDF templates depend on invoice and customer data structures being finalized. Can overlap with Phase 4 but must be prototyped early to catch @react-pdf/renderer SSR issues.
**Delivers:** Invoice PDF generation with marina branding, statement PDF generation, API routes for PDF download.
**Addresses:** PDF invoice generation (P1), Statement PDF (P2)
**Avoids:** Pitfall 3 (@react-pdf SSR crash -- use API routes, register fonts, test in production build)

### Phase 6: Customer Portal
**Rationale:** The portal is a simplified view of existing data. It requires invoices, payments, and PDF generation to all be functional. It's a separate layout with scoped-down data access.
**Delivers:** Portal layout and navigation, account summary, invoice list (own invoices only), PDF download, "Pay Now" placeholder.
**Addresses:** Customer self-service portal (P2)
**Avoids:** Pitfall 6 (customer accessing admin routes -- ownership filtering on all queries)

### Phase 7: Polish & Dark Mode
**Rationale:** Visual polish comes last. Animations, responsive breakpoints, and dark mode require actual components to exist. This phase is about showcase quality for LinkedIn.
**Delivers:** Dark mode, motion/animation (counter roll-up, chart draw-in, skeleton loading), responsive design, empty states.
**Addresses:** Dark mode (P2), responsive design refinement

### Phase Ordering Rationale

- **Schema first, UI second:** Pitfall 1 (float money) and Pitfall 4 (payment balance) make schema design the highest-risk decision. Getting it wrong is a HIGH recovery cost.
- **Seed data early:** The demo is only convincing if aging distributions, payment histories, and revenue breakdowns look realistic. Seed script in Phase 2 enables visual validation of every subsequent phase.
- **Dashboard after payments:** The hero feature (dashboard) depends on both invoices AND payments existing. Building it before payments means testing with incomplete data.
- **PDF prototype early:** Although PDF is Phase 5, a quick proof-of-concept should happen during Phase 2 or 3 to catch @react-pdf/renderer SSR issues before they become a blocker.
- **Portal last (before polish):** The portal reuses existing data and infrastructure. It's the least risky phase.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (PDF Generation):** @react-pdf/renderer SSR behavior with Next.js 15 App Router needs verification. Font registration, image embedding, and production build behavior are all potential failure points. Prototype early.
- **Phase 3 (Recurring Invoices):** Scheduling logic and idempotency patterns need careful design. For the demo, pre-seeding recurring invoices may be simpler than runtime generation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation & Auth):** Well-documented Next.js App Router patterns. Custom cookie auth is straightforward.
- **Phase 2 (Core Billing Data):** Standard CRUD with Drizzle ORM. Invoicing schema is a solved problem.
- **Phase 4 (Dashboard):** Recharts with Server Components passing data as props is well-established.
- **Phase 6 (Customer Portal):** Same stack, simplified views, scoped queries.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry. Stack is prescribed by brief. |
| Features | MEDIUM | Based on training data knowledge of marina software landscape. Core invoicing patterns are stable. Competitor feature details may be 6-18 months stale. |
| Architecture | MEDIUM | Established Next.js App Router patterns. Invoicing schema is well-understood. Specific Drizzle/Neon integration details should be verified against current docs. |
| Pitfalls | MEDIUM | Patterns are well-established (float money, SSR issues) but specific library version behaviors need verification during implementation. |

**Overall confidence:** MEDIUM-HIGH

The domain (invoicing) and stack (Next.js + Drizzle) are both well-understood. The main uncertainty is around library-specific edge cases (@react-pdf/renderer SSR, Drizzle + Neon connection behavior) that can only be resolved by testing during implementation.

### Gaps to Address

- **@react-pdf/renderer SSR compatibility:** Training data suggests potential issues. Must prototype early in development. Have jsPDF fallback plan ready.
- **Neon serverless cold start latency:** Dashboard with multiple queries may hit cold start delays. Verify by testing consolidated queries with Promise.all.
- **Tailwind v4 + shadcn/ui integration:** Tailwind v4 uses CSS-native config, which is newer. Verify shadcn/ui component generation works correctly with v4 during Phase 1 setup.
- **Recharts + dark mode:** Chart theming with dark mode colors needs verification. Recharts may need explicit color props rather than inheriting from CSS variables.

## Sources

### Primary (HIGH confidence)
- npm registry -- all package versions verified (2026-03-26)
- BRIEF.md -- project requirements, demo data specifications, tech stack prescriptions

### Secondary (MEDIUM confidence)
- Training data knowledge of Next.js 15 App Router patterns
- Training data knowledge of Drizzle ORM + Neon Postgres integration
- Training data knowledge of invoicing/billing system design patterns
- Training data knowledge of marina management software landscape (Dockwa, MarinaOffice, Molo)

### Tertiary (LOW confidence)
- @react-pdf/renderer server-side rendering behavior with Next.js 15 -- needs verification
- Tailwind v4 CSS-native config with shadcn/ui -- relatively new, verify during setup

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
