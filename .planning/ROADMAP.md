# Roadmap: BillingHub

## Overview

BillingHub delivers a unified marina invoicing platform in four phases: foundation and auth, the core billing engine (customers, invoices, payments, collections), the hero revenue dashboard and reports, and finally the customer portal with PDF generation and visual polish. Each phase delivers a complete, verifiable capability that builds on the previous.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Auth** - Database schema, authentication, layouts, design system, and seed data
- [ ] **Phase 2: Billing Engine** - Customer accounts, multi-revenue invoicing, payments, recurring templates, and collections
- [ ] **Phase 3: Dashboard & Reports** - Revenue dashboard with charts and KPIs, reports module, CSV export
- [ ] **Phase 4: Portal, PDFs & Polish** - Customer self-service portal, PDF invoice/statement generation, dark mode, animations, responsive polish

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Users can log in with role-appropriate access to a styled application shell with realistic demo data
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, UI-01, UI-02, UI-03, UI-09, UI-10, UI-11, UI-12, SEED-01, SEED-02, SEED-03, SEED-04, SEED-05, SEED-06, SEED-07
**Success Criteria** (what must be TRUE):
  1. User can log in with any of the three demo accounts and sees role-appropriate navigation (manager sees full sidebar, clerk sees billing sidebar, customer sees portal top-bar)
  2. Unauthenticated users are redirected to a styled login page with split layout, hero image, and wave pattern
  3. Role enforcement works at the middleware level -- manually navigating to admin URLs as a customer returns forbidden
  4. The application shell displays the correct color palette, typography, logo, and wave pattern from DESIGN-SPEC.md
  5. Seed script populates 25 customers, 150+ invoices with realistic aging distribution, 3 demo accounts, and mixed revenue types
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Project setup, design tokens, Drizzle schema, iron-session auth with middleware
- [x] 01-02-PLAN.md — Application shell layouts (sidebar, top-bar, breadcrumbs) and styled login page
- [x] 01-03-PLAN.md — Comprehensive seed script (25 customers, 150+ invoices, aging distribution)

### Phase 2: Billing Engine
**Goal**: Staff can manage customers, create multi-revenue invoices, record payments, set up recurring billing, and work collections
**Depends on**: Phase 1
**Requirements**: CUST-01, CUST-02, CUST-03, CUST-04, CUST-05, CUST-06, INV-01, INV-02, INV-03, INV-04, INV-05, INV-06, INV-07, INV-08, INV-09, REC-01, REC-02, REC-03, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, COLL-01, COLL-02, COLL-03, COLL-04, COLL-05
**Success Criteria** (what must be TRUE):
  1. User can create a customer with contact info, vessel details, and slip assignment, then view their profile with balance summary and history
  2. User can create an invoice combining slip rental, fuel, maintenance, and amenity line items with auto-calculated subtotal, tax, and total
  3. User can record full or partial payments against an invoice and see the invoice status auto-update (draft, sent, paid, partial, overdue)
  4. User can create recurring invoice templates and generate invoices from them
  5. User can flag overdue accounts for collections, add collection notes, and track payment reminder status
**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md — Schema amendments, shared utilities (aging, validation, invoice number), shadcn components, sidebar nav
- [ ] 02-02-PLAN.md — Customer CRUD: list with search/filter, create dialog, profile with tabs, edit page, communication log
- [ ] 02-03-PLAN.md — Invoice CRUD: create with dynamic line items, list with status tabs, detail page, draft editing
- [ ] 02-04-PLAN.md — Payment recording with partial support and auto-status updates, recurring invoice templates with generation
- [ ] 02-05-PLAN.md — Collections workflow: flag accounts, collection notes, promise-to-pay, reminder tracking

### Phase 3: Dashboard & Reports
**Goal**: Manager can see a hero revenue dashboard with KPI cards, charts, and alerts, plus run and export reports
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10, RPT-01, RPT-02, RPT-03, RPT-04, RPT-05
**Success Criteria** (what must be TRUE):
  1. Dashboard displays revenue KPIs (current month, YTD, outstanding balance, collection rate) with counter roll-up animation
  2. Dashboard shows accounts receivable aging as a horizontal bar chart, revenue breakdown as a donut chart, and collection trends as an area chart
  3. Dashboard shows outstanding balance alerts identifying who owes the most and who is most overdue
  4. User can run revenue-by-category, aging, collections, and monthly comparison reports and export any report to CSV
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Portal, PDFs & Polish
**Goal**: Customers can self-serve their account via a portal, invoices and statements are downloadable as branded PDFs, and the app is visually showcase-ready
**Depends on**: Phase 3
**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PDF-01, PDF-02, PDF-03, UI-04, UI-05, UI-06, UI-07, UI-08
**Success Criteria** (what must be TRUE):
  1. Customer (boater@billinghub.app) can log in and view their account summary, invoice history, and download invoice PDFs from the portal
  2. Invoice PDF downloads with marina branding, line item detail, and wave pattern footer decoration
  3. Account statement PDFs can be generated per customer for monthly or quarterly periods
  4. App supports dark mode with proper color mapping, page transitions with fade-in slide-up, skeleton loading states, and chart animations per DESIGN-SPEC.md
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 3/3 | Complete | 2026-03-27 |
| 2. Billing Engine | 2/5 | In Progress|  |
| 3. Dashboard & Reports | 0/2 | Not started | - |
| 4. Portal, PDFs & Polish | 0/2 | Not started | - |
