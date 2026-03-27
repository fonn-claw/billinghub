# Requirements: BillingHub

**Defined:** 2026-03-26
**Core Value:** Marina operators can create unified invoices combining multiple revenue streams and track collections with aging visibility

## v1 Requirements

### Authentication & Authorization

- [x] **AUTH-01**: User can log in with email and password
- [x] **AUTH-02**: User session persists across browser refresh
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: Manager role has full access to all features and reports
- [x] **AUTH-05**: Billing clerk role can manage invoices, payments, and customers but not settings
- [x] **AUTH-06**: Customer role can only view own invoices and account information
- [x] **AUTH-07**: Unauthenticated users are redirected to login page
- [x] **AUTH-08**: Role enforcement at route/middleware level, not just UI hiding

### Customer Accounts

- [x] **CUST-01**: User can create customer with contact info, vessel details, and slip assignment
- [x] **CUST-02**: User can view list of all customers with search and filtering
- [x] **CUST-03**: User can view customer profile with balance summary (current, pending, overdue, credits)
- [x] **CUST-04**: User can edit customer information
- [x] **CUST-05**: User can add billing-related notes to customer communication log
- [x] **CUST-06**: Customer profile shows payment history and invoice history

### Invoicing

- [x] **INV-01**: User can create invoice with multiple line items combining different revenue types (slip rental, fuel, maintenance, amenities, services)
- [x] **INV-02**: Each line item has category, description, quantity, rate, and auto-calculated amount
- [x] **INV-03**: Invoice calculates subtotal, tax, and total automatically
- [x] **INV-04**: User can save invoice as draft or mark as sent
- [x] **INV-05**: User can view list of all invoices with status filtering (draft, sent, paid, overdue, partial)
- [x] **INV-06**: User can view invoice detail with line items, payment history, and status
- [x] **INV-07**: Invoice status auto-updates based on payments and due date (overdue after due date, paid when fully paid, partial when partially paid)
- [x] **INV-08**: User can edit draft invoices
- [x] **INV-09**: Invoices auto-categorize into aging buckets (current, 30-day, 60-day, 90+ day)

### Recurring Invoices

- [x] **REC-01**: User can create recurring invoice template with line items, customer, and schedule (monthly/quarterly/annual)
- [x] **REC-02**: User can generate invoices from recurring templates
- [x] **REC-03**: User can view and manage recurring templates

### Payments

- [x] **PAY-01**: User can record payment against an invoice (cash, check, credit card, bank transfer)
- [x] **PAY-02**: User can record partial payments (payment plans)
- [x] **PAY-03**: Payment history shows per invoice and per customer
- [x] **PAY-04**: User can view list of all payments with filtering
- [x] **PAY-05**: Invoice balance updates automatically when payment is recorded

### Collections

- [x] **COLL-01**: Invoices auto-categorize into 30/60/90+ day aging buckets
- [x] **COLL-02**: User can flag accounts for collections
- [x] **COLL-03**: User can add collection notes with timestamps
- [x] **COLL-04**: User can track payment reminder status (when last reminder was sent)
- [x] **COLL-05**: User can record promises to pay

### Dashboard

- [x] **DASH-01**: Dashboard shows total revenue (current month and YTD)
- [x] **DASH-02**: Dashboard shows outstanding balance total
- [x] **DASH-03**: Dashboard shows collection rate percentage
- [x] **DASH-04**: Dashboard shows cash flow forecast (expected payments this month)
- [x] **DASH-05**: Dashboard shows accounts receivable aging as horizontal bar chart (current/30/60/90+)
- [x] **DASH-06**: Dashboard shows revenue breakdown by category as donut chart
- [x] **DASH-07**: Dashboard shows collection rate trend over time as area chart
- [x] **DASH-08**: Dashboard shows outstanding balance alerts (who owes most, most overdue)
- [x] **DASH-09**: Revenue numbers animate with counter roll-up on load
- [x] **DASH-10**: Dashboard header uses hero image with gradient overlay per DESIGN-SPEC.md

### Reports

- [x] **RPT-01**: Revenue by category report (slip, fuel, maintenance, amenity, service)
- [x] **RPT-02**: Aging report showing every overdue invoice with customer, amount, days overdue
- [x] **RPT-03**: Collections report (collected this month vs outstanding)
- [x] **RPT-04**: Monthly comparison report (current vs last month vs same month last year)
- [x] **RPT-05**: User can export any report to CSV

### PDF Generation

- [x] **PDF-01**: User can download invoice as PDF with marina branding per DESIGN-SPEC.md
- [x] **PDF-02**: User can generate monthly/quarterly account statement PDF per customer
- [x] **PDF-03**: PDF includes wave pattern footer decoration and proper styling

### Customer Portal

- [x] **PORT-01**: Customer can view their account summary (balance, next due date, last payment)
- [x] **PORT-02**: Customer can view their invoice history
- [x] **PORT-03**: Customer can download invoice PDFs
- [x] **PORT-04**: Portal shows simplified navigation (top bar, no sidebar)
- [x] **PORT-05**: "Pay Now" button displayed as coming soon (disabled with tooltip)

### Design System

- [x] **UI-01**: App follows DESIGN-SPEC.md color palette (Deep Navy, Ocean Teal, Harbor Gold)
- [x] **UI-02**: Typography uses DM Serif Display for headings, Inter for body per type scale
- [x] **UI-03**: Components styled per DESIGN-SPEC.md (cards, buttons, inputs, tables, badges, sidebar)
- [x] **UI-04**: Dark mode with proper color mapping per DESIGN-SPEC.md
- [x] **UI-05**: Page transitions with fade-in slide-up animation
- [x] **UI-06**: Micro-interactions on cards, buttons, sidebar items, table rows per spec
- [x] **UI-07**: Chart animations (counter roll-up, draw-in, bar growth) per spec
- [x] **UI-08**: Skeleton loading states matching content layout
- [x] **UI-09**: Wave contour pattern used as signature background element
- [x] **UI-10**: Pre-generated assets (logo, hero images, empty states) integrated
- [x] **UI-11**: Responsive design (1400px+, 1200px, 768px, 640px breakpoints)
- [x] **UI-12**: Login screen with split layout, hero image, and wave pattern per spec

### Demo Data

- [x] **SEED-01**: Seed script creates "Sunset Harbor Marina" with 25 customer accounts
- [x] **SEED-02**: Seed creates 150+ historical invoices going back 6 months with realistic distribution (60% paid on time, 20% paid late, 15% overdue, 5% in collections)
- [x] **SEED-03**: Seed creates 3 demo login accounts (manager, billing clerk, customer)
- [x] **SEED-04**: Seed includes fuel charges, maintenance charges, amenity fees mixed across invoices
- [x] **SEED-05**: Seed creates 3 customers with payment plans (partial payments)
- [x] **SEED-06**: Seed creates recurring monthly invoices for 15 long-term slip holders
- [x] **SEED-07**: Seed uses relative dates so aging distribution remains realistic regardless of run date

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
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Pending |
| AUTH-08 | Phase 1 | Pending |
| CUST-01 | Phase 2 | Complete |
| CUST-02 | Phase 2 | Complete |
| CUST-03 | Phase 2 | Complete |
| CUST-04 | Phase 2 | Complete |
| CUST-05 | Phase 2 | Complete |
| CUST-06 | Phase 2 | Complete |
| INV-01 | Phase 2 | Complete |
| INV-02 | Phase 2 | Complete |
| INV-03 | Phase 2 | Complete |
| INV-04 | Phase 2 | Complete |
| INV-05 | Phase 2 | Complete |
| INV-06 | Phase 2 | Complete |
| INV-07 | Phase 2 | Complete |
| INV-08 | Phase 2 | Complete |
| INV-09 | Phase 2 | Complete |
| REC-01 | Phase 2 | Complete |
| REC-02 | Phase 2 | Complete |
| REC-03 | Phase 2 | Complete |
| PAY-01 | Phase 2 | Complete |
| PAY-02 | Phase 2 | Complete |
| PAY-03 | Phase 2 | Complete |
| PAY-04 | Phase 2 | Complete |
| PAY-05 | Phase 2 | Complete |
| COLL-01 | Phase 2 | Complete |
| COLL-02 | Phase 2 | Complete |
| COLL-03 | Phase 2 | Complete |
| COLL-04 | Phase 2 | Complete |
| COLL-05 | Phase 2 | Complete |
| DASH-01 | Phase 3 | Complete |
| DASH-02 | Phase 3 | Complete |
| DASH-03 | Phase 3 | Complete |
| DASH-04 | Phase 3 | Complete |
| DASH-05 | Phase 3 | Complete |
| DASH-06 | Phase 3 | Complete |
| DASH-07 | Phase 3 | Complete |
| DASH-08 | Phase 3 | Complete |
| DASH-09 | Phase 3 | Complete |
| DASH-10 | Phase 3 | Complete |
| RPT-01 | Phase 3 | Complete |
| RPT-02 | Phase 3 | Complete |
| RPT-03 | Phase 3 | Complete |
| RPT-04 | Phase 3 | Complete |
| RPT-05 | Phase 3 | Complete |
| PDF-01 | Phase 4 | Complete |
| PDF-02 | Phase 4 | Complete |
| PDF-03 | Phase 4 | Complete |
| PORT-01 | Phase 4 | Complete |
| PORT-02 | Phase 4 | Complete |
| PORT-03 | Phase 4 | Complete |
| PORT-04 | Phase 4 | Complete |
| PORT-05 | Phase 4 | Complete |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 4 | Complete |
| UI-05 | Phase 4 | Complete |
| UI-06 | Phase 4 | Complete |
| UI-07 | Phase 4 | Complete |
| UI-08 | Phase 4 | Complete |
| UI-09 | Phase 1 | Complete |
| UI-10 | Phase 1 | Complete |
| UI-11 | Phase 1 | Complete |
| UI-12 | Phase 1 | Complete |
| SEED-01 | Phase 1 | Complete |
| SEED-02 | Phase 1 | Complete |
| SEED-03 | Phase 1 | Pending |
| SEED-04 | Phase 1 | Complete |
| SEED-05 | Phase 1 | Complete |
| SEED-06 | Phase 1 | Complete |
| SEED-07 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 61 total
- Mapped to phases: 61
- Unmapped: 0

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after roadmap creation*
