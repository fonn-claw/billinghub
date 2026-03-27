# Phase 2: Billing Engine - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Customer accounts CRUD, multi-revenue invoicing with line items, payment recording (full and partial), recurring invoice templates, and collections workflow with aging categorization. This phase delivers the core billing functionality that all staff roles use daily.

</domain>

<decisions>
## Implementation Decisions

### Customer Management
- Customer list as a searchable/filterable table using shadcn Table component
- Customer profile page with tabs: Overview (balance summary, vessel, slip), Invoices, Payments, Notes
- Create customer via modal dialog (keeps list context); edit customer on dedicated page with more space
- Balance summary shows: current charges, pending, overdue, credits — all calculated from invoice/payment data
- Communication log as timeline-style entries with timestamp and author (CUST-05)
- Vessel details: name, type (sailboat/powerboat/catamaran), length in feet
- Slip assignment: dock letter (A-E) + slip number

### Invoice Creation Flow
- Single-page invoice form with customer selector, dates, and dynamic line item rows
- Line items: add/remove rows, category dropdown (slip_rental/fuel/maintenance/amenity/service/other), description, quantity, unit price, auto-calculated amount
- Subtotal auto-calculated from line items; single tax rate field (default 8.5%) applied to subtotal; total = subtotal + tax
- Save as "draft" by default; explicit "Mark as Sent" button changes status
- Invoice numbering: auto-increment INV-XXXXX starting from max existing number
- Edit allowed only for draft invoices (INV-08)
- Invoice detail page shows: header info, line items table, payment history, status badge, action buttons
- Status auto-updates server-side: overdue if past due date and unpaid, paid when payments >= total, partial when payments > 0 but < total

### Invoice List & Filtering
- Table view with columns: invoice number, customer, date, due date, total, status, balance due
- Status filter tabs: All, Draft, Sent, Paid, Overdue, Partial
- Auto-categorize into aging buckets: current (0-30 days), 30-day (31-60), 60-day (61-90), 90+ day (INV-09)
- Search by invoice number or customer name

### Recurring Invoices
- Template creation form: select customer, define line items, set frequency (monthly/quarterly/annual), set next invoice date
- Template list with active/inactive toggle
- "Generate Invoice" button on template creates new draft invoice with template line items
- Bulk generate: process all templates where next_invoice_date <= today
- After generation, advance next_invoice_date by frequency period

### Payment Recording
- Record payment via modal dialog from invoice detail page (keeps invoice context visible)
- Fields: amount, method (cash/check/credit_card/bank_transfer), reference number, date, notes
- Amount pre-filled with remaining balance; user can adjust for partial payment
- Invoice status auto-updates on payment insert (server-side logic)
- Payment history displayed as list on invoice detail with running balance
- Progress bar showing paid vs total for partial payments
- All payments list: filterable table with customer, invoice number, amount, method, date columns
- Per-customer payment history accessible from customer profile Payments tab

### Collections Workflow
- Invoices auto-categorize into aging buckets based on days past due date
- Collections flag: toggle on customer profile or bulk-flag from an overdue invoices view
- Collection notes: threaded per-customer notes with timestamps and author
- Reminder tracking: last reminder date field, manually updated (email delivery is out of scope)
- Promise to pay: captured as a collection note type with promised date and amount fields
- Collections view: table of flagged customers showing total overdue, days overdue, last note, last reminder

### Claude's Discretion
- Exact form validation patterns and error messages
- Loading states and optimistic updates
- Server action vs API route decisions
- Exact column widths and responsive table behavior
- Empty state illustrations (use existing assets from public/assets/)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Identity
- `DESIGN-SPEC.md` — Complete visual identity: colors, typography, component styles, layout, motion, dark mode, chart styling
- `BRIEF.md` — Business context, feature requirements, demo data specifications

### Database Schema
- `src/lib/db/schema.ts` — All table definitions (customers, invoices, lineItems, payments, collectionNotes, recurringTemplates), enums (userRole, invoiceStatus, paymentMethod, chargeCategory, recurringFrequency)

### Research
- `.planning/research/STACK.md` — Verified library versions and rationale
- `.planning/research/PITFALLS.md` — Money storage (integer cents), aging date calculations
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow

### Prior Phase
- `.planning/phases/01-foundation-auth/01-CONTEXT.md` — Auth decisions, layout patterns, design system initialization

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/table.tsx` — shadcn Table for all list views (customers, invoices, payments)
- `src/components/ui/card.tsx` — Card component for profile sections, summary cards
- `src/components/ui/badge.tsx` — Badge for invoice status display
- `src/components/ui/button.tsx` — Styled buttons per DESIGN-SPEC.md
- `src/components/ui/input.tsx`, `label.tsx` — Form inputs
- `src/components/ui/dropdown-menu.tsx` — For actions menus on table rows
- `src/components/ui/sheet.tsx` — Slide-over panels (alternative to modals)
- `src/components/ui/tooltip.tsx` — For icon-only actions
- `src/components/layout/sidebar.tsx` — Admin sidebar already includes nav items for customers, invoices, payments
- `src/components/layout/breadcrumbs.tsx` — Dynamic breadcrumbs from route segments
- `src/lib/formatting.ts` — Money formatting utility (cents to dollars)
- `public/assets/empty-invoices.svg`, `empty-payments.svg`, `empty-customers.svg` — Empty state illustrations

### Established Patterns
- Route groups: `(admin)` for staff, `(portal)` for customer
- Server actions in `src/lib/auth/actions.ts` — pattern for form submissions
- iron-session for auth — session available in server components and actions
- Integer cents for all monetary values — format only in UI
- Tailwind v4 with CSS custom properties for design tokens

### Integration Points
- Sidebar nav needs routes: /customers, /invoices, /payments, /collections, /recurring
- Customer profile links from invoice and payment views
- Invoice detail links from customer profile and payment views
- All routes protected by middleware role checks (manager + billing_clerk for admin routes)

</code_context>

<specifics>
## Specific Ideas

- Invoice status badges should use color-coded variants: draft (gray), sent (blue/ocean-teal), paid (green), partial (harbor-gold), overdue (red), collections (dark red)
- Customer balance summary card should prominently display overdue amount in red when > 0
- Line item rows should have smooth add/remove animations
- Aging bucket colors: current (green), 30-day (yellow/harbor-gold), 60-day (orange), 90+ (red)
- Empty states use the pre-generated SVG illustrations with friendly messages

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-billing-engine*
*Context gathered: 2026-03-27*
