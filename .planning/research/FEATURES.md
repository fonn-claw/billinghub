# Feature Research

**Domain:** Marina multi-revenue billing and invoicing platform
**Researched:** 2026-03-26
**Confidence:** MEDIUM (based on training data knowledge of Dockwa, MarinaOffice, Molo, Harbour Assist, and general invoicing platforms like FreshBooks, Xero, Wave; no live web search available)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Invoice CRUD with line items | Core billing function -- every billing tool has this | MEDIUM | Multiple charge types per invoice, quantity/rate/amount, descriptions. Must support marina-specific categories (slip, fuel, maintenance, amenities, services). |
| Customer account management | Cannot bill without knowing who to bill | LOW | Contact info, vessel details, slip assignment. Marina-specific: vessel name/type/length drives slip pricing. |
| Payment recording | Billing without payment tracking is just an invoice generator | LOW | Cash, check, card, bank transfer. Record date, amount, method, reference number. |
| Invoice status tracking | Users need to know what's paid, pending, overdue at a glance | LOW | Status badges: draft, sent, paid, overdue, partial. Auto-transition based on payment and due date. |
| Accounts receivable aging | Standard financial visibility -- every AR system has 30/60/90+ buckets | MEDIUM | Auto-categorize overdue invoices. Visual aging chart is expected, not optional. Marina operators specifically cite this as their biggest gap with spreadsheets. |
| Tax calculation | Legal requirement for most jurisdictions | LOW | Configurable tax rate per line item or per invoice. Some marina services are tax-exempt (slip rental in some states), others are not (fuel, services). |
| PDF invoice generation | Customers expect printable/downloadable invoices | MEDIUM | Professional layout with marina branding, line item detail, totals. Must look legitimate -- marina customers are often affluent boat owners with high expectations. |
| Search and filtering | Any list-based interface requires finding things quickly | LOW | Filter invoices by status, date range, customer. Search customers by name, vessel, slip. |
| Role-based access control | Marina has manager, office staff, and customers with different needs | MEDIUM | Three roles minimum: manager (full access), billing clerk (operational), customer (self-service view only). |
| Revenue reporting | Managers need to know how the business is performing | MEDIUM | Revenue by category, by time period, collection rates. Export to CSV for accountants. |
| Responsive design | Office desktop + dock tablet are both real use cases | MEDIUM | Marina operators work from office desktops AND walk the docks with tablets. Must function on both. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Unified multi-revenue invoicing | THE core differentiator -- one invoice combining slip rental + fuel + maintenance + amenities + services. Existing tools force separate billing per revenue stream. | HIGH | This is why BillingHub exists. Marina operators currently use 3-5 systems. Combining all charges on one bill is the killer feature. Complexity is in the data model (charge categories, recurring vs one-off, different rate structures). |
| Revenue dashboard with KPI cards | Most marina tools bury financial data in reports. A real-time visual dashboard with aging, revenue breakdown, collection rate, and cash flow forecast is uncommon. | HIGH | Hero feature per brief. Counter animations, sparklines, trend indicators. Visual impact matters for the LinkedIn showcase. |
| Recurring invoice templates + auto-generation | Slip rental is inherently recurring (monthly/quarterly/annual). Automating invoice creation from templates eliminates the biggest manual task. | HIGH | Must handle different billing cycles per customer. Template stores line items, customer, schedule. Cron-style generation or manual "generate all" button for demo. |
| Collections workflow | Beyond simple aging -- flag accounts, add notes, track promises to pay, record last reminder date. Most marina software treats collections as "look at the aging report." | MEDIUM | Structured workflow: flag for collections, add notes with timestamps, track contact attempts, record promise-to-pay dates. This turns passive aging into active collections. |
| Partial payment / payment plans | Marina customers with large quarterly bills often need payment plans. Most simple billing tools only support full payment. | MEDIUM | Record partial amounts, track remaining balance, show payment history on invoice. Three demo customers with active payment plans per brief. |
| Customer self-service portal | Boaters can see their own invoices, balance, and payment history. Reduces phone calls to the marina office. | MEDIUM | Separate simplified UI (no sidebar, top bar only). Account summary, invoice list, PDF download. "Pay Now" as coming-soon placeholder. Distinct from admin views. |
| Cash flow forecast | Predict expected payments this month based on due dates and historical payment patterns. Rare in marina tools, common in enterprise AR. | MEDIUM | Based on outstanding invoices with due dates. Simple version: sum of invoices due this month. Enhanced: factor in historical on-time payment rate per customer. |
| Statement generation (PDF) | Monthly/quarterly account statements showing all activity. Beyond individual invoices -- this is a customer-level summary. | MEDIUM | Different from invoice PDF. Shows: opening balance, charges, payments, closing balance for a period. Professional format with marina branding. |
| Dark mode | Not common in marina software. Signals modern, well-designed product. Important for LinkedIn showcase visual impact. | LOW | Fully themed dark mode per DESIGN-SPEC.md. All surfaces, charts, badges, PDFs should look correct. Controlled by user preference toggle. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Online payment processing (Stripe/PayPal) | Customers want to pay online | Massive scope: PCI compliance, payment gateway integration, refund handling, failed payment retry, fee management. Out of scope per brief. | Show "Pay Now" button as coming-soon placeholder. Record payments manually. This is a demo app. |
| Email delivery of invoices/reminders | Automate sending invoices and payment reminders | Email deliverability is a project unto itself: SMTP config, bounce handling, spam avoidance, template management, tracking. | Track reminder status (when was last reminder "sent") without actually sending. Status tracking without delivery infrastructure. |
| Multi-marina support | Some operators manage multiple marinas | Multiplies every data model with tenant isolation, complicates auth, breaks single-marina mental model. Massive complexity for no demo value. | Single marina instance. Data model can be extended later but UI assumes one marina. |
| QuickBooks / accounting integration | Marina already uses QB for general accounting | API integration requires OAuth, mapping chart of accounts, sync logic, error handling. Fragile and time-consuming. | CSV export covers the "get data to my accountant" use case. |
| Real-time notifications / websockets | "Alert me when a payment comes in" | Over-engineering for a demo. Adds infrastructure complexity (WebSocket server, connection management). | Page refreshes and dashboard polling are sufficient. Activity feed on dashboard covers recent events. |
| Inventory management (fuel, parts) | Marina sells fuel and parts -- track inventory | Inventory is an entirely separate domain (stock levels, purchase orders, suppliers, cost tracking). Unrelated to billing. | Accept fuel charges as line items with quantity and rate. Don't track fuel inventory levels. |
| Boat slip reservation / scheduling | "We need to manage slip availability too" | Slip management is a separate product (see SlipSync in the same FonnIT universe). Combining them creates scope explosion. | Reference slip assignments on customer profiles. Don't manage slip availability, waitlists, or reservations. |
| Custom invoice numbering schemes | "We use INV-2026-001 format" | Over-engineering for demo. Multiple format options, sequence management, prefix/suffix config. | Auto-increment integer IDs, formatted as INV-XXXXX. Simple, predictable, sufficient. |

## Feature Dependencies

```
[Auth & Roles]
    └──requires──> [Database Schema + User Model]

[Customer Accounts]
    └──requires──> [Database Schema]
    └──enhances──> [Invoice Creation] (customer selector)

[Invoice CRUD]
    └──requires──> [Customer Accounts] (must bill someone)
    └──requires──> [Database Schema]
    └──enhances──> [Revenue Dashboard] (data source)

[Payment Recording]
    └──requires──> [Invoice CRUD] (payments apply to invoices)
    └──enhances──> [Invoice Status] (auto-updates to paid/partial)

[Partial Payments]
    └──requires──> [Payment Recording]
    └──enhances──> [Collections Workflow]

[Recurring Templates]
    └──requires──> [Invoice CRUD]
    └──requires──> [Customer Accounts]

[PDF Generation]
    └──requires──> [Invoice CRUD] (invoice data)
    └──requires──> [Customer Accounts] (bill-to info)

[Statement PDF]
    └──requires──> [PDF Generation] (shared rendering infrastructure)
    └──requires──> [Payment Recording] (payment history)

[Revenue Dashboard]
    └──requires──> [Invoice CRUD] (invoice data)
    └──requires──> [Payment Recording] (payment data)
    └──enhances──> [Collections Workflow] (aging visibility)

[Collections Workflow]
    └──requires──> [Invoice CRUD] (overdue invoices)
    └──requires──> [Payment Recording] (payment status)
    └──enhances──> [Customer Accounts] (flags, notes)

[Customer Portal]
    └──requires──> [Auth & Roles] (customer role)
    └──requires──> [Invoice CRUD] (view invoices)
    └──requires──> [PDF Generation] (download invoices)

[Reports]
    └──requires──> [Invoice CRUD]
    └──requires──> [Payment Recording]
    └──enhances──> [Revenue Dashboard] (detailed breakdowns)

[Aging Buckets]
    └──requires──> [Invoice CRUD] (due dates, status)
    └──enhances──> [Revenue Dashboard] (aging chart)
    └──enhances──> [Collections Workflow] (prioritization)

[Search & Filtering]
    └──enhances──> [Invoice List]
    └──enhances──> [Customer List]
    └──enhances──> [Payment List]
```

### Dependency Notes

- **Invoice CRUD requires Customer Accounts:** Every invoice must reference a customer. Customer model must exist first.
- **Payment Recording requires Invoice CRUD:** Payments are applied to specific invoices. Invoice must exist before payment.
- **Revenue Dashboard requires both Invoices and Payments:** Dashboard aggregates data from both. Must be built after core billing flow works.
- **Customer Portal requires Auth + Invoices + PDF:** Portal is a read-only view requiring all underlying data and auth to be in place.
- **Collections Workflow requires Aging Buckets:** Collections prioritization depends on knowing which invoices are overdue and by how much.
- **Statement PDF requires PDF infrastructure + Payment history:** Statements summarize charges and payments over a period. Both must exist.

## MVP Definition

### Launch With (v1)

This is a demo/showcase app, so "MVP" means "minimum to demonstrate the value proposition convincingly."

- [ ] Auth with three roles (manager, billing clerk, customer) -- gates everything
- [ ] Customer account management with vessel/slip data -- foundation for billing
- [ ] Multi-revenue invoice creation with line items -- the core differentiator
- [ ] Invoice listing with status filtering and aging -- operational view
- [ ] Payment recording with partial payment support -- close the billing loop
- [ ] Revenue dashboard with KPIs, aging chart, revenue breakdown -- hero feature, visual showcase
- [ ] PDF invoice generation -- professional output
- [ ] Seed data (25 customers, 150+ invoices, realistic aging) -- makes the demo convincing

### Add After Validation (v1.x)

- [ ] Recurring invoice templates and auto-generation -- high value but complex scheduling logic
- [ ] Collections workflow (flags, notes, promise-to-pay tracking) -- enhances aging from passive to active
- [ ] Customer self-service portal -- separate UI surface, depends on everything else
- [ ] Statement PDF generation -- requires PDF infra + payment history both working
- [ ] Cash flow forecast on dashboard -- requires payment pattern analysis

### Future Consideration (v2+)

- [ ] Reports with CSV export -- valuable but not demo-critical
- [ ] Dark mode -- visual polish, can be layered on after light mode works
- [ ] Email reminder status tracking -- thin feature, low demo impact
- [ ] Revenue by dock/slip size breakdown -- niche reporting

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Auth & roles | HIGH | MEDIUM | P1 |
| Customer accounts | HIGH | LOW | P1 |
| Invoice CRUD with multi-revenue line items | HIGH | HIGH | P1 |
| Invoice list with status/aging | HIGH | LOW | P1 |
| Payment recording + partial payments | HIGH | MEDIUM | P1 |
| Revenue dashboard (KPIs, charts) | HIGH | HIGH | P1 |
| PDF invoice generation | HIGH | MEDIUM | P1 |
| Seed data script | HIGH | MEDIUM | P1 |
| Recurring invoice templates | MEDIUM | HIGH | P2 |
| Collections workflow | MEDIUM | MEDIUM | P2 |
| Customer portal | MEDIUM | MEDIUM | P2 |
| Statement PDF | MEDIUM | MEDIUM | P2 |
| Cash flow forecast | MEDIUM | MEDIUM | P2 |
| Reports + CSV export | MEDIUM | MEDIUM | P2 |
| Dark mode | MEDIUM | LOW | P2 |
| Search & advanced filtering | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch -- core billing flow + hero dashboard + demo data
- P2: Should have -- enriches the demo, builds out the full feature set
- P3: Nice to have -- polish and convenience

## Competitor Feature Analysis

| Feature | Dockwa | MarinaOffice | Molo | General Invoicing (FreshBooks/Xero) | BillingHub Approach |
|---------|--------|--------------|------|-------------------------------------|---------------------|
| Slip billing | Yes (core) | Yes (core) | Yes (core) | No (not marina-aware) | Yes -- as one of many revenue streams on unified invoice |
| Fuel billing | Separate module | Integrated | Via POS | No | Line item on same invoice as slip rental |
| Maintenance charges | Limited | Yes | Yes | Manual entry | Categorized line items with type-specific fields |
| Unified invoice (all revenue streams) | No -- separate modules | Partial | No | N/A (not domain-specific) | YES -- this is the differentiator. One invoice, all charges. |
| AR aging visualization | Basic report | Report-based | Limited | Yes (Xero is good) | Visual dashboard with aging bar chart, not buried in reports |
| Collections workflow | No | Basic flags | No | Xero has basic reminders | Structured: flags, notes, promise-to-pay, contact tracking |
| Customer self-service | Reservation portal only | No | Mobile app | Client portals (limited) | Dedicated portal: view invoices, download PDFs, account summary |
| Recurring billing | Yes (slip contracts) | Yes | Yes | Yes (strong) | Templates with auto-generation for any charge type |
| PDF invoices | Yes | Yes | Yes | Yes (strong) | Marina-branded with nautical design elements |
| Revenue dashboard | Basic | Report-heavy | Analytics add-on | Basic in free tiers | Hero feature: KPI cards, sparklines, aging chart, revenue donut, trends |
| Payment plans | No | No | No | No (partial payments only) | Yes -- structured partial payment support |
| Dark mode | No | No | No | No | Yes -- full dark mode as design differentiator |

## Sources

- Training data knowledge of marina management software landscape (Dockwa, MarinaOffice/IRM, Molo, Harbour Assist, Marinacloud)
- Training data knowledge of general invoicing platforms (FreshBooks, Xero, Wave, QuickBooks)
- BRIEF.md market research section (15-25% revenue overdue, 3-5 separate systems)
- Note: Web search was unavailable. Confidence is MEDIUM -- feature landscape is based on training data which may be 6-18 months stale. Core billing/invoicing patterns are stable and unlikely to have shifted significantly.

---
*Feature research for: Marina multi-revenue billing and invoicing platform*
*Researched: 2026-03-26*
