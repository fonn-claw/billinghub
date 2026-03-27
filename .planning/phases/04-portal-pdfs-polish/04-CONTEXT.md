# Phase 4: Portal, PDFs & Polish - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Customer self-service portal (account summary, invoice history, PDF downloads), PDF generation for invoices and account statements with marina branding, dark mode with proper color mapping, page transitions, skeleton loading states, and micro-interactions. This phase makes the app showcase-ready.

</domain>

<decisions>
## Implementation Decisions

### Customer Portal
- Portal route group `(portal)` already exists with TopBar layout and auth redirect
- Account summary page at `/portal`: card showing current balance, next due date, last payment date, total overdue
- Invoice history below summary: table of customer's invoices with status badges, amounts, dates
- Invoice detail at `/portal/invoices/[id]`: line items, payment history, status, "Download PDF" button
- "Pay Now" button displayed prominently in Harbor Gold (#E8AA42) but disabled with "Coming Soon" tooltip (PORT-05)
- Portal body text slightly larger (15px) per DESIGN-SPEC.md §7 for consumer-friendly feel
- Simplified navigation: TopBar with logo, account name, logout — no sidebar (PORT-04)
- Portal data fetched using existing DAL functions filtered by session.customerId
- Customer can only see their own invoices (enforced server-side, not just UI)

### PDF Invoice Generation
- @react-pdf/renderer for client-side PDF generation (locked decision from PROJECT.md)
- Invoice PDF layout per DESIGN-SPEC.md §12:
  - Header: marina logo (left) + "INVOICE" in 28px (right), Deep Navy #0C2D48
  - Full-width 2px accent line in Harbor Gold #E8AA42 below header
  - Bill-to / invoice details: two-column layout, Inter 400 11px
  - Line items table: header row #0C2D48 background with white text, clean row borders, amounts right-aligned
  - Total section: right-aligned stack (subtotal, tax, total), total row #0C2D48 bg, white text, Inter 700 16px
  - Footer: wave-pattern.svg at 5% opacity as decoration, marina contact info in Inter 400 10px #6B7A8D
  - Paper: standard letter, margins 48px top/bottom, 56px sides
- PDF download triggered from invoice detail page via button click
- PDF rendered client-side with dynamic import to avoid SSR issues

### PDF Account Statement
- Statement PDF for monthly or quarterly period per customer
- Header: marina logo + "ACCOUNT STATEMENT" + period dates
- Customer info section: name, address, account number
- Summary: opening balance, charges, payments, closing balance
- Transaction list: date, description, charges, payments, running balance
- Footer: same wave pattern decoration as invoice PDF
- Generated from customer profile page or portal with date range selection

### Dark Mode
- next-themes library for theme management with CSS class strategy
- ThemeProvider wrapping the app in root layout
- Toggle in sidebar bottom (admin layout) and top bar (portal layout)
- Persisted in localStorage via next-themes default behavior
- All dark mode colors from DESIGN-SPEC.md §9:
  - Background: #0A1628, Card: #111D2E, Sidebar: #070F1A
  - Elevated: #152238, Muted: #0E1824, Border: #1C2E42
  - Text Primary: #E8ECF2, Text Secondary: #8896A8
  - Harbor Gold unchanged (#E8AA42), Success slightly brighter (#22B47E), Danger brighter (#E85D6A), Links brighter (#3A9CC7)
- Wave pattern in dark mode: strokes #1B6B93 at 6-10% opacity
- Dashboard header overlay becomes rgba(10, 22, 40, 0.90) in dark mode
- Badge dark mode: backgrounds become 12% opacity of text color

### Page Transitions & Micro-interactions
- Page transitions: content area fade-in with slide-up (200ms, ease-out), opacity 0→1, translateY 8px→0 (UI-05)
- Use CSS animations or a lightweight approach (no heavy animation library needed for simple transitions)
- Card hover: translateY -2px, shadow deepens (200ms, ease-out) (UI-06)
- Button press: translateY 1px, slight darken (100ms) (UI-06)
- Sidebar item hover: background slides in from left (150ms) (UI-06)
- Table row hover: background color transition (100ms) (UI-06)
- Badge appear: scale 0.9→1 with opacity fade (150ms) (UI-06)
- Chart animations already configured in Phase 3 Recharts components (UI-07)

### Skeleton Loading States
- Skeleton shapes mirror exact layout of content they replace (UI-08)
- Pulse animation: opacity oscillates 0.4↔1.0 (1.5s cycle)
- Skeleton color: #EEF1F6 (light) / #1C2E42 (dark)
- Border radius matches content (12px for cards, 8px for inputs)
- Key pages needing skeletons: dashboard (KPI cards + charts), invoice list, customer list, portal

### Claude's Discretion
- @react-pdf/renderer component structure and font registration
- Exact skeleton component implementation (CSS-only vs component library)
- Page transition implementation approach (CSS animations vs layout-level wrapper)
- Statement date range picker design on portal
- Loading.tsx vs Suspense boundary strategy for skeleton placement

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Identity & Polish
- `DESIGN-SPEC.md` §9 — Dark mode color mapping (all surface, text, accent, semantic colors)
- `DESIGN-SPEC.md` §6 — Motion & interaction specs (page transitions, micro-interactions, skeleton loading)
- `DESIGN-SPEC.md` §7 — Customer portal screen visual direction, empty states
- `DESIGN-SPEC.md` §12 — PDF invoice styling (header, accent line, line items table, total section, footer wave pattern)
- `DESIGN-SPEC.md` §4 — Component style guide (cards, buttons, badges, sidebar, tables — dark mode variants)

### Business Requirements
- `BRIEF.md` — Customer Portal feature spec (§5), PDF Generation notes
- `.planning/REQUIREMENTS.md` — PORT-01 through PORT-05, PDF-01 through PDF-03, UI-04 through UI-08

### Database & Data Layer
- `src/lib/db/schema.ts` — All table definitions
- `src/lib/dal/invoices.ts` — Invoice queries (getInvoices, getInvoiceWithDetails)
- `src/lib/dal/payments.ts` — Payment queries
- `src/lib/dal/customers.ts` — Customer queries
- `src/lib/dal/dashboard.ts` — Dashboard aggregation (reusable for portal summary)

### Existing Portal & Layout Code
- `src/app/(portal)/layout.tsx` — Portal layout with TopBar, auth redirect
- `src/app/(portal)/portal/page.tsx` — Placeholder portal page
- `src/components/layout/top-bar.tsx` — TopBar component (needs dark mode toggle)
- `src/components/layout/sidebar-client.tsx` — Sidebar (needs dark mode toggle)

### Assets for PDF
- `public/assets/logo.svg` — Marina logo for PDF header
- `public/assets/wave-pattern.svg` — Wave pattern for PDF footer decoration

### Prior Phase Context
- `.planning/phases/01-foundation-auth/01-CONTEXT.md` — Auth, layout patterns, design system
- `.planning/phases/02-billing-engine/02-CONTEXT.md` — DAL pattern, invoice data structures
- `.planning/phases/03-dashboard-reports/03-CONTEXT.md` — Dashboard components, chart animations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/(portal)/layout.tsx` — Portal layout already set up with TopBar and auth
- `src/app/(portal)/portal/page.tsx` — Placeholder page to replace with account summary
- `src/components/layout/top-bar-client.tsx` — TopBar client component (add dark mode toggle)
- `src/components/layout/sidebar-client.tsx` — Sidebar client component (add dark mode toggle)
- `src/lib/dal/invoices.ts` — getInvoices (filter by customerId), getInvoiceWithDetails
- `src/lib/dal/payments.ts` — getPayments (filter by customerId)
- `src/lib/dal/customers.ts` — getCustomer
- `src/lib/dal/dashboard.ts` — getDashboardKPIs (reuse aggregation pattern for portal summary)
- `src/components/ui/badge.tsx` — Status badges for invoice statuses
- `src/components/ui/table.tsx` — Table for invoice list
- `src/components/ui/card.tsx` — Cards for summary and detail sections
- `src/components/ui/tooltip.tsx` — For "Coming Soon" on Pay Now button
- `src/lib/formatting.ts` — Money formatting (cents to dollars)
- `public/assets/logo.svg`, `wave-pattern.svg` — For PDF branding

### Established Patterns
- DAL pattern: `src/lib/dal/<entity>.ts` with server-side SQL aggregation
- Server components for data fetching, client components for interactivity
- Integer cents for money, format only in presentation layer
- shadcn/ui components with Tailwind CSS custom properties
- Route groups: `(admin)` for staff, `(portal)` for customer
- iron-session for auth — session.customerId available for portal filtering

### Integration Points
- Portal pages need customer-specific DAL queries (filter by customerId from session)
- PDF components need invoice data from existing DAL functions
- Dark mode requires CSS variable updates in globals.css and ThemeProvider in root layout
- Skeleton loading needs Next.js loading.tsx files or Suspense boundaries
- Dark mode toggle needs to be added to both sidebar and top bar

</code_context>

<specifics>
## Specific Ideas

- Portal should feel consumer-friendly — slightly larger text (15px body), less data-dense than admin
- "Pay Now" button prominent in Harbor Gold but disabled with "Coming Soon" tooltip
- Invoice PDF must have the wave pattern footer — this is a signature brand element
- Dark mode toggle should be a sun/moon icon button, not a switch
- Dashboard header in dark mode: overlay becomes rgba(10, 22, 40, 0.90) — image barely visible beneath
- Page transitions should be subtle (200ms) — not flashy, just polished

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-portal-pdfs-polish*
*Context gathered: 2026-03-27*
