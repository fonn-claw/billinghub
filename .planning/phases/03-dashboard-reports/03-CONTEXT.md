# Phase 3: Dashboard & Reports - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Revenue dashboard with KPI cards (total revenue, outstanding balance, collection rate, cash flow forecast), accounts receivable aging bar chart, revenue breakdown donut chart, collection trend area chart, outstanding balance alerts. Reports module with revenue-by-category, aging, collections, and monthly comparison reports. CSV export for all reports. This phase delivers the manager's primary decision-making view.

</domain>

<decisions>
## Implementation Decisions

### Dashboard KPI Cards
- New `src/lib/dal/dashboard.ts` for aggregation queries (total revenue current month + YTD, outstanding balance, collection rate %, expected payments this month)
- All monetary aggregation done server-side in SQL for accuracy — never sum in JavaScript
- KPI cards as a 4-column grid per DESIGN-SPEC.md §5 (stat cards layout)
- Counter roll-up animation on load: client component with useEffect-driven count-up from 0 (800ms, ease-out) per DASH-09
- Sparkline in each KPI card using Recharts mini line chart (no axes, just the trend line)
- Revenue number in Harbor Gold (#E8AA42), other stats in Deep Navy (#0C2D48)
- Trend indicators: green with + prefix for positive, red with - prefix for negative, percentage shown next to number

### Dashboard Charts
- Recharts library for all visualizations (specified in tech stack constraints)
- Accounts Receivable Aging: horizontal stacked bar chart with aging colors from DESIGN-SPEC.md §11 (green/gold/orange/red)
- Revenue by Category: donut chart with legend showing slip_rental, fuel, maintenance, amenity, service, other
- Collection Rate Trend: area chart with teal fill (#1B6B93 at 10-15% opacity) and navy line
- Charts use ResponsiveContainer for responsive behavior
- Tooltips styled per DESIGN-SPEC.md §11 (card style, white bg, 12px border-radius, shadow)
- Chart animations: bars grow from bottom, lines trace left-to-right (600ms, ease-out, 100ms stagger)
- Chart color sequence: #1B6B93, #E8AA42, #0C2D48, #1B9C6B, #DC3545, #6B7A8D
- Two-column layout for charts (aging left, donut right), collection trend full-width below

### Outstanding Balance Alerts
- Section below charts showing top overdue accounts
- Table/card list: customer name, total overdue, days overdue (most), last payment date
- Sorted by total overdue descending (who owes the most)
- Secondary sort available: most days overdue
- Links to customer profile for quick action

### Reports Module
- Single /reports route with tab navigation between report types: Revenue by Category, Aging, Collections, Monthly Comparison
- Date range picker with presets: This Month, Last Month, This Quarter, YTD, Custom Range
- Each report rendered as a styled table with summary cards at the top
- Revenue by Category: table with category, invoice count, total, percentage of total; summary card with total revenue
- Aging Report: table with customer, invoice number, amount, days overdue, aging bucket; summary cards per bucket
- Collections Report: collected this month vs outstanding; table with customer, collected amount, remaining balance
- Monthly Comparison: current month vs last month vs same month last year; table + bar chart visualization
- Report data sourced from new DAL functions with date range parameters

### CSV Export
- Client-side CSV generation from the currently displayed report data
- Export button on each report tab
- CSV includes all visible columns plus date range in filename
- Use simple CSV string construction (no heavy library needed for tabular data)

### Claude's Discretion
- Exact Recharts component configuration and custom tooltip components
- Loading skeleton layout for dashboard (matching card/chart shapes)
- Exact responsive breakpoints for chart stacking
- Report table column widths and overflow handling
- Date range picker component choice (shadcn calendar-based or simple select)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Identity & Chart Styling
- `DESIGN-SPEC.md` §11 — Chart color sequence, aging bar colors, chart styling (grid lines, tooltips, area fills, bar radius), revenue dashboard specifics
- `DESIGN-SPEC.md` §7 — Dashboard screen visual direction (header, stat cards, charts layout, revenue number treatment)
- `DESIGN-SPEC.md` §3 — Display treatment for hero numbers (36px Inter 700, dollar sign subordinate, trend indicators)
- `DESIGN-SPEC.md` §6 — Data animations (counter roll-up 800ms, chart draw-in 600ms, aging bar growth 400ms)

### Business Requirements
- `BRIEF.md` — Revenue Dashboard feature spec (§1), Reports feature spec (§6)
- `.planning/REQUIREMENTS.md` — DASH-01 through DASH-10, RPT-01 through RPT-05

### Database & Data Layer
- `src/lib/db/schema.ts` — All table definitions, enums (invoiceStatus, chargeCategory, paymentMethod)
- `src/lib/dal/invoices.ts` — Invoice queries, computeInvoiceStatus, aging bucket logic
- `src/lib/dal/payments.ts` — Payment queries
- `src/lib/dal/customers.ts` — Customer queries
- `src/lib/dal/collections.ts` — Collections queries
- `src/lib/utils/aging.ts` — Aging bucket calculation utility

### Prior Phase Context
- `.planning/phases/01-foundation-auth/01-CONTEXT.md` — Design system, layout patterns
- `.planning/phases/02-billing-engine/02-CONTEXT.md` — DAL pattern, invoice status computation, aging buckets

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/(admin)/dashboard/page.tsx` — Dashboard page exists with hero header (background image + gradient overlay + greeting), needs KPI cards and charts added below
- `src/components/ui/card.tsx` — Card component for KPI cards, chart containers, report summary cards
- `src/components/ui/table.tsx` — Table component for reports and alert lists
- `src/components/ui/badge.tsx` — Status badges for aging buckets in reports
- `src/components/ui/tabs.tsx` — Tab component for report type navigation
- `src/lib/utils/aging.ts` — Aging bucket utility (getAgingBucket) already categorizes invoices
- `src/lib/formatting.ts` — Money formatting utility (cents to dollars)
- All DAL files under `src/lib/dal/` — Existing queries for invoices, payments, customers, collections

### Established Patterns
- DAL pattern: `src/lib/dal/<entity>.ts` with SQL aggregation functions
- Server components for data fetching, client components for interactivity
- Integer cents for money, format only in presentation layer
- shadcn/ui components styled with Tailwind CSS custom properties

### Integration Points
- Dashboard route already exists at `/dashboard` — extend existing page
- Reports route needs new `/reports` route added to admin layout
- Sidebar already has navigation items — may need "Reports" added
- Data comes from existing schema tables (invoices, payments, customers, lineItems, collectionNotes)

</code_context>

<specifics>
## Specific Ideas

- Dashboard hero header already exists — add KPI cards and charts below it
- Revenue number uses Harbor Gold (#E8AA42) per DESIGN-SPEC.md — the primary "wow" number
- Outstanding Balance card number turns red (#DC3545) when high, orange (#D4922A) when moderate
- Collection Rate shows circular progress arc in Success Green (#1B9C6B)
- Aging bar chart uses the exact green/gold/orange/red palette from DESIGN-SPEC.md §11
- Charts should have draw-in animations matching DESIGN-SPEC.md §6 motion spec

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-dashboard-reports*
*Context gathered: 2026-03-27*
