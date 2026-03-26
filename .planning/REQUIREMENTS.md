# Requirements: BillingHub

**Defined:** 2026-03-26
**Core Value:** Marina operators can create unified invoices combining multiple revenue streams and track collections with aging visibility

## v1 Requirements

### Authentication & Authorization

- [ ] **AUTH-01**: User can log in with email and password
- [ ] **AUTH-02**: User session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Manager role has full access to all features and reports
- [ ] **AUTH-05**: Billing clerk role can manage invoices, payments, and customers but not settings
- [ ] **AUTH-06**: Customer role can only view own invoices and account information
- [ ] **AUTH-07**: Unauthenticated users are redirected to login page
- [ ] **AUTH-08**: Role enforcement at route/middleware level, not just UI hiding

### Customer Accounts

- [ ] **CUST-01**: User can create customer with contact info, vessel details, and slip assignment
- [ ] **CUST-02**: User can view list of all customers with search and filtering
- [ ] **CUST-03**: User can view customer profile with balance summary (current, pending, overdue, credits)
- [ ] **CUST-04**: User can edit customer information
- [ ] **CUST-05**: User can add billing-related notes to customer communication log
- [ ] **CUST-06**: Customer profile shows payment history and invoice history

### Invoicing

- [ ] **INV-01**: User can create invoice with multiple line items combining different revenue types (slip rental, fuel, maintenance, amenities, services)
- [ ] **INV-02**: Each line item has category, description, quantity, rate, and auto-calculated amount
- [ ] **INV-03**: Invoice calculates subtotal, tax, and total automatically
- [ ] **INV-04**: User can save invoice as draft or mark as sent
- [ ] **INV-05**: User can view list of all invoices with status filtering (draft, sent, paid, overdue, partial)
- [ ] **INV-06**: User can view invoice detail with line items, payment history, and status
- [ ] **INV-07**: Invoice status auto-updates based on payments and due date (overdue after due date, paid when fully paid, partial when partially paid)
- [ ] **INV-08**: User can edit draft invoices
- [ ] **INV-09**: Invoices auto-categorize into aging buckets (current, 30-day, 60-day, 90+ day)

### Recurring Invoices

- [ ] **REC-01**: User can create recurring invoice template with line items, customer, and schedule (monthly/quarterly/annual)
- [ ] **REC-02**: User can generate invoices from recurring templates
- [ ] **REC-03**: User can view and manage recurring templates

### Payments

- [ ] **PAY-01**: User can record payment against an invoice (cash, check, credit card, bank transfer)
- [ ] **PAY-02**: User can record partial payments (payment plans)
- [ ] **PAY-03**: Payment history shows per invoice and per customer
- [ ] **PAY-04**: User can view list of all payments with filtering
- [ ] **PAY-05**: Invoice balance updates automatically when payment is recorded

### Collections

- [ ] **COLL-01**: Invoices auto-categorize into 30/60/90+ day aging buckets
- [ ] **COLL-02**: User can flag accounts for collections
- [ ] **COLL-03**: User can add collection notes with timestamps
- [ ] **COLL-04**: User can track payment reminder status (when last reminder was sent)
- [ ] **COLL-05**: User can record promises to pay

### Dashboard

- [ ] **DASH-01**: Dashboard shows total revenue (current month and YTD)
- [ ] **DASH-02**: Dashboard shows outstanding balance total
- [ ] **DASH-03**: Dashboard shows collection rate percentage
- [ ] **DASH-04**: Dashboard shows cash flow forecast (expected payments this month)
- [ ] **DASH-05**: Dashboard shows accounts receivable aging as horizontal bar chart (current/30/60/90+)
- [ ] **DASH-06**: Dashboard shows revenue breakdown by category as donut chart
- [ ] **DASH-07**: Dashboard shows collection rate trend over time as area chart
- [ ] **DASH-08**: Dashboard shows outstanding balance alerts (who owes most, most overdue)
- [ ] **DASH-09**: Revenue numbers animate with counter roll-up on load
- [ ] **DASH-10**: Dashboard header uses hero image with gradient overlay per DESIGN-SPEC.md

### Reports

- [ ] **RPT-01**: Revenue by category report (slip, fuel, maintenance, amenity, service)
- [ ] **RPT-02**: Aging report showing every overdue invoice with customer, amount, days overdue
- [ ] **RPT-03**: Collections report (collected this month vs outstanding)
- [ ] **RPT-04**: Monthly comparison report (current vs last month vs same month last year)
- [ ] **RPT-05**: User can export any report to CSV

### PDF Generation

- [ ] **PDF-01**: User can download invoice as PDF with marina branding per DESIGN-SPEC.md
- [ ] **PDF-02**: User can generate monthly/quarterly account statement PDF per customer
- [ ] **PDF-03**: PDF includes wave pattern footer decoration and proper styling

### Customer Portal

- [ ] **PORT-01**: Customer can view their account summary (balance, next due date, last payment)
- [ ] **PORT-02**: Customer can view their invoice history
- [ ] **PORT-03**: Customer can download invoice PDFs
- [ ] **PORT-04**: Portal shows simplified navigation (top bar, no sidebar)
- [ ] **PORT-05**: "Pay Now" button displayed as coming soon (disabled with tooltip)

### Design System

- [ ] **UI-01**: App follows DESIGN-SPEC.md color palette (Deep Navy, Ocean Teal, Harbor Gold)
- [ ] **UI-02**: Typography uses DM Serif Display for headings, Inter for body per type scale
- [ ] **UI-03**: Components styled per DESIGN-SPEC.md (cards, buttons, inputs, tables, badges, sidebar)
- [ ] **UI-04**: Dark mode with proper color mapping per DESIGN-SPEC.md
- [ ] **UI-05**: Page transitions with fade-in slide-up animation
- [ ] **UI-06**: Micro-interactions on cards, buttons, sidebar items, table rows per spec
- [ ] **UI-07**: Chart animations (counter roll-up, draw-in, bar growth) per spec
- [ ] **UI-08**: Skeleton loading states matching content layout
- [ ] **UI-09**: Wave contour pattern used as signature background element
- [ ] **UI-10**: Pre-generated assets (logo, hero images, empty states) integrated
- [ ] **UI-11**: Responsive design (1400px+, 1200px, 768px, 640px breakpoints)
- [ ] **UI-12**: Login screen with split layout, hero image, and wave pattern per spec

### Demo Data

- [ ] **SEED-01**: Seed script creates "Sunset Harbor Marina" with 25 customer accounts
- [ ] **SEED-02**: Seed creates 150+ historical invoices going back 6 months with realistic distribution (60% paid on time, 20% paid late, 15% overdue, 5% in collections)
- [ ] **SEED-03**: Seed creates 3 demo login accounts (manager, billing clerk, customer)
- [ ] **SEED-04**: Seed includes fuel charges, maintenance charges, amenity fees mixed across invoices
- [ ] **SEED-05**: Seed creates 3 customers with payment plans (partial payments)
- [ ] **SEED-06**: Seed creates recurring monthly invoices for 15 long-term slip holders
- [ ] **SEED-07**: Seed uses relative dates so aging distribution remains realistic regardless of run date

## v2 Requirements

### Notifications

- **NOTF-01**: In-app notification center for payment alerts
- **NOTF-02**: Email notification integration for invoice delivery

### Advanced Reporting

- **ARPT-01**: Revenue by dock / slip size breakdown
- **ARPT-02**: Customer payment reliability scoring

## Out of Scope

| Feature | Reason |
|---------|--------|
| Online payment processing (Stripe/PayPal) | Massive scope: PCI compliance, gateway integration, refund handling. Demo shows "Pay Now" as coming soon. |
| Email delivery of invoices/reminders | Email deliverability is its own project. Track reminder status without sending. |
| Multi-marina support | Multiplies data model complexity, breaks single-marina mental model. No demo value. |
| QuickBooks / accounting integration | API integration requires OAuth, chart mapping, sync logic. CSV export covers the use case. |
| Real-time notifications / websockets | Over-engineering for demo. Dashboard refresh is sufficient. |
| Inventory management (fuel, parts) | Separate domain. Accept fuel as line items, don't track inventory levels. |
| Slip reservation / scheduling | Separate product (SlipSync). Reference slip assignments only. |
| Custom invoice numbering schemes | Auto-increment INV-XXXXX is sufficient for demo. |
| Mobile native app | Responsive web covers tablet use case. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 1 | Pending |
| AUTH-08 | Phase 1 | Pending |
| CUST-01 | Phase 2 | Pending |
| CUST-02 | Phase 2 | Pending |
| CUST-03 | Phase 2 | Pending |
| CUST-04 | Phase 2 | Pending |
| CUST-05 | Phase 2 | Pending |
| CUST-06 | Phase 2 | Pending |
| INV-01 | Phase 2 | Pending |
| INV-02 | Phase 2 | Pending |
| INV-03 | Phase 2 | Pending |
| INV-04 | Phase 2 | Pending |
| INV-05 | Phase 2 | Pending |
| INV-06 | Phase 2 | Pending |
| INV-07 | Phase 2 | Pending |
| INV-08 | Phase 2 | Pending |
| INV-09 | Phase 2 | Pending |
| REC-01 | Phase 2 | Pending |
| REC-02 | Phase 2 | Pending |
| REC-03 | Phase 2 | Pending |
| PAY-01 | Phase 2 | Pending |
| PAY-02 | Phase 2 | Pending |
| PAY-03 | Phase 2 | Pending |
| PAY-04 | Phase 2 | Pending |
| PAY-05 | Phase 2 | Pending |
| COLL-01 | Phase 2 | Pending |
| COLL-02 | Phase 2 | Pending |
| COLL-03 | Phase 2 | Pending |
| COLL-04 | Phase 2 | Pending |
| COLL-05 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| DASH-06 | Phase 3 | Pending |
| DASH-07 | Phase 3 | Pending |
| DASH-08 | Phase 3 | Pending |
| DASH-09 | Phase 3 | Pending |
| DASH-10 | Phase 3 | Pending |
| RPT-01 | Phase 3 | Pending |
| RPT-02 | Phase 3 | Pending |
| RPT-03 | Phase 3 | Pending |
| RPT-04 | Phase 3 | Pending |
| RPT-05 | Phase 3 | Pending |
| PDF-01 | Phase 4 | Pending |
| PDF-02 | Phase 4 | Pending |
| PDF-03 | Phase 4 | Pending |
| PORT-01 | Phase 4 | Pending |
| PORT-02 | Phase 4 | Pending |
| PORT-03 | Phase 4 | Pending |
| PORT-04 | Phase 4 | Pending |
| PORT-05 | Phase 4 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 4 | Pending |
| UI-07 | Phase 4 | Pending |
| UI-08 | Phase 4 | Pending |
| UI-09 | Phase 1 | Pending |
| UI-10 | Phase 1 | Pending |
| UI-11 | Phase 1 | Pending |
| UI-12 | Phase 1 | Pending |
| SEED-01 | Phase 1 | Pending |
| SEED-02 | Phase 1 | Pending |
| SEED-03 | Phase 1 | Pending |
| SEED-04 | Phase 1 | Pending |
| SEED-05 | Phase 1 | Pending |
| SEED-06 | Phase 1 | Pending |
| SEED-07 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 61 total
- Mapped to phases: 61
- Unmapped: 0

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after roadmap creation*
