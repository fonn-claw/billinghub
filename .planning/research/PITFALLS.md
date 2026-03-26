# Pitfalls Research

**Domain:** Marina multi-revenue billing/invoicing platform
**Researched:** 2026-03-26
**Confidence:** MEDIUM (based on training data -- no web search available for verification)

## Critical Pitfalls

### Pitfall 1: Floating-Point Money Arithmetic

**What goes wrong:**
Using JavaScript `number` (IEEE 754 float) for monetary calculations produces rounding errors. `0.1 + 0.2 = 0.30000000000000004`. Line items multiply quantity by rate, then sum with tax -- each step compounds errors. Invoices show totals that are off by a penny, or worse, payment balances never reach zero because `$150.00 - $149.99 - $0.01 = 5.551115123e-17` instead of `0`.

**Why it happens:**
JavaScript has no native decimal type. Developers store prices as floats in the database (`real` or `double precision`), do arithmetic with `*` and `+`, and only format with `.toFixed(2)` at display time. The damage is already done in the database.

**How to avoid:**
- Store all monetary values as **integer cents** in the database (`numeric` or `integer` columns, not `real`/`double`). A value of `$150.00` is stored as `15000`.
- In Drizzle schema, use `integer('amount_cents')` or `numeric('amount', { precision: 10, scale: 2 })`. The `numeric` Postgres type is arbitrary-precision and safe.
- Do all arithmetic in cents. Only divide by 100 for display.
- Round tax calculations explicitly: `Math.round(subtotalCents * taxRate)` -- never let fractional cents accumulate.
- Validate that line item amounts sum to the invoice total on both create and update.

**Warning signs:**
- Seeing `real` or `doublePrecision` in Drizzle schema for amount columns
- Using `parseFloat` on monetary strings
- Customer balances that never reach exactly zero after full payment
- Off-by-one-cent discrepancies in reports vs. invoice totals

**Phase to address:**
Database schema design (Phase 1). This must be correct from the start -- retrofitting cents-based storage is a full data migration.

---

### Pitfall 2: Aging Bucket Calculation Drift

**What goes wrong:**
Aging reports (30/60/90+ day buckets) are calculated relative to "today." If aging is computed at query time using `NOW()` or `new Date()`, the same invoice can appear in different buckets depending on when you look, which makes reports non-reproducible. Worse, if the seed data uses hardcoded dates far in the past, ALL demo invoices end up in the 90+ bucket, making the aging chart a single red bar -- terrible for a demo.

**Why it happens:**
Developers think of aging as a simple date diff: `daysSinceDue = today - dueDate`. They forget that "today" moves, and that demo data needs relative dates that produce a realistic distribution right now.

**How to avoid:**
- Seed data must use **relative dates** anchored to the current date at seed time: `new Date()` minus N days, not hardcoded `"2025-09-15"`.
- For the aging calculation, use a single consistent "as of" date per report run, not per-row `NOW()`.
- Aging bucket assignment should be a pure function: `getAgingBucket(dueDate, asOfDate)` -- testable, reproducible.
- Build the seed script to produce the exact distribution specified in the brief: 60% paid on time, 20% paid late, 15% currently overdue, 5% in collections, distributed across 30/60/90+ buckets.

**Warning signs:**
- Demo dashboard shows all overdue invoices in a single aging bucket
- Aging report totals don't match accounts receivable total
- Rerunning the seed script months later produces a broken demo

**Phase to address:**
Data modeling / seed script phase. The seed script is as important as the schema for a demo app.

---

### Pitfall 3: @react-pdf/renderer SSR Crash in Next.js App Router

**What goes wrong:**
`@react-pdf/renderer` uses browser APIs internally and does not work in Node.js server components. Importing it in a server component or calling `renderToStream`/`renderToBuffer` in an API route can fail with errors about missing `document`, `window`, or canvas dependencies. The library is designed for client-side rendering by default. In Next.js App Router (React Server Components), any component importing from `@react-pdf/renderer` must be a client component or used carefully in route handlers.

**Why it happens:**
Developers assume PDF generation is a server-side task (which it logically should be), import `@react-pdf/renderer` in a route handler or server component, and hit Node.js compatibility issues. The library's `renderToStream` API does work server-side in some configurations, but requires specific setup.

**How to avoid:**
- Use `@react-pdf/renderer`'s `renderToBuffer` or `renderToStream` in a Next.js **API route handler** (`app/api/invoices/[id]/pdf/route.ts`). These work in Node.js but may need the `yoga-layout` package.
- Alternatively, use client-side PDF generation with `<PDFDownloadLink>` in a `'use client'` component -- simpler but means PDFs are generated in the browser.
- Test PDF generation early in development, not as the last feature. It touches fonts, images, and layout -- all potential failure points.
- Have a fallback: if `@react-pdf/renderer` causes issues, `jspdf` + `html2canvas` or a simple HTML-to-PDF approach via a print stylesheet can work for a demo.

**Warning signs:**
- Build errors mentioning `canvas`, `yoga-layout`, or `document is not defined`
- PDF route handler works in dev but crashes in production build
- Fonts not rendering in generated PDFs (missing font registration)

**Phase to address:**
Should be prototyped in the invoicing phase, not deferred to "polish." PDF generation has enough sharp edges that discovering issues late is costly.

---

### Pitfall 4: Partial Payment Balance Tracking Goes Wrong

**What goes wrong:**
When invoices support partial payments, the "amount remaining" calculation becomes a source of bugs. Common failures: applying a payment to the wrong invoice, balance going negative, payment plans where the final payment doesn't exactly zero out the balance (ties back to Pitfall 1), and the customer portal showing a different balance than the admin view.

**Why it happens:**
Developers model payments as a flat `paid: boolean` on invoices, then bolt on partial payment support later. The data model doesn't properly link payments to invoices, or it links them but doesn't maintain a computed balance that stays consistent.

**How to avoid:**
- Model payments as a separate `payments` table with `invoice_id`, `amount_cents`, `payment_date`, `method`, and `notes`.
- Invoice balance = `total_cents - SUM(payments.amount_cents)`. Never store balance as a mutable field -- derive it.
- Add a database constraint or application check: `SUM(payments) <= invoice.total_cents` (prevent overpayment).
- Invoice status is derived from balance: `balance === 0 ? 'paid' : balance === total ? 'unpaid' : 'partial'`.
- For payment plans, store the plan schedule separately but apply individual payments through the same mechanism.

**Warning signs:**
- An `amount_paid` column on the invoices table (mutable derived data)
- Status field manually set instead of computed from payment state
- Customer portal balance doesn't match admin view

**Phase to address:**
Database schema / payment tracking phase. The payments data model must be right before building payment recording UI.

---

### Pitfall 5: Recurring Invoice Generation Creates Duplicates or Gaps

**What goes wrong:**
Auto-generating invoices from recurring schedules either creates duplicate invoices (if the generation runs twice) or misses periods (if it doesn't track what has been generated). A billing clerk opens the app on Monday and sees two March invoices for the same slip holder, or discovers that February's invoices were never generated.

**Why it happens:**
Recurring invoice generation is typically triggered by a cron job or manual "Generate" button. Without idempotency tracking, re-running the generation creates duplicates. Without a clear "last generated" watermark, gaps appear.

**How to avoid:**
- Store a `recurring_templates` table with `next_invoice_date` and `frequency` (monthly/quarterly/annual).
- When generating: check if an invoice already exists for that template + period (unique constraint on `template_id + billing_period`).
- After generation, advance `next_invoice_date` to the next period.
- For the demo, pre-generate all recurring invoices in the seed script rather than relying on runtime generation. Show the "Generate Next Month" button but have the data already seeded.
- Use a database transaction for the generate-and-advance operation to prevent race conditions.

**Warning signs:**
- No unique constraint preventing duplicate invoices for the same recurring period
- "Generate Invoices" button with no idempotency check
- Missing `billing_period` or `template_id` on generated invoices

**Phase to address:**
Invoicing phase, specifically when implementing recurring templates.

---

### Pitfall 6: Role-Based Access That Only Checks the UI

**What goes wrong:**
Authorization is implemented by hiding navigation items and buttons from unauthorized roles, but the API routes and server actions have no role checks. A customer can access manager reports by navigating directly to `/reports` or calling the API endpoint. In a demo context this might seem harmless, but it breaks the credibility of the role-based demo accounts.

**Why it happens:**
Developers implement auth as "show different nav items per role" and forget that Next.js App Router pages and API routes are independently accessible. The middleware checks if a user is logged in but not what role they have.

**How to avoid:**
- Implement authorization middleware that checks role on every protected route, not just authentication.
- Create a `requireRole('manager')` helper that throws a 403 or redirects. Use it in every page's server component and every API route handler.
- Customer role should only access `/portal/*` routes. Billing clerk should not access `/reports` or `/settings`.
- Test by logging in as each role and manually navigating to restricted URLs.

**Warning signs:**
- Auth middleware only checks `session.userId` existence, not `session.role`
- No 403 responses anywhere in the codebase
- Customer can see admin pages by typing the URL directly

**Phase to address:**
Auth phase. Role checks must be baked into the auth middleware from the start, not added per-page later.

---

### Pitfall 7: Dashboard Queries That Kill Performance

**What goes wrong:**
The revenue dashboard requires multiple aggregations: sum of revenue by category, aging bucket counts, collection rate trends, cash flow forecasts. Naive implementations run 6-8 separate unindexed queries on page load, each scanning the full invoices table. On Neon's serverless Postgres (which has connection cold-start latency), this creates a noticeable delay.

**Why it happens:**
Developers build each dashboard card independently, each with its own query. No indexes on `due_date`, `status`, `created_at`, or `customer_id`. Neon's serverless driver adds ~100-200ms cold start per connection, so 8 sequential queries can take 2+ seconds.

**How to avoid:**
- Consolidate dashboard data into fewer queries. One query can compute multiple aggregations using `CASE WHEN` and `FILTER` clauses.
- Add indexes on: `invoices(status)`, `invoices(due_date)`, `invoices(customer_id)`, `payments(invoice_id)`, `invoices(created_at)`.
- Use Neon's `@neondatabase/serverless` driver with connection pooling, not a new connection per query.
- For the demo, consider pre-computing dashboard stats in the seed script as a materialized view or summary table. The data is static anyway.
- Use `Promise.all` for independent queries instead of sequential `await`.

**Warning signs:**
- Dashboard takes 3+ seconds to load
- No database indexes beyond primary keys
- Each dashboard card component fetches its own data independently
- Seeing `SELECT * FROM invoices` without filters in dashboard queries

**Phase to address:**
Dashboard phase. Design the query strategy before building the UI cards.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing invoice status as mutable column instead of deriving from payments | Simpler queries, faster reads | Status can desync from actual payment state | Acceptable if you add a reconciliation check and treat it as a cache |
| Hardcoded tax rate instead of configurable | Faster to build | Can't demo different tax scenarios | Acceptable for single-marina demo |
| Client-side PDF generation instead of server-side | Avoids SSR issues with @react-pdf | PDFs generated in browser, not available for batch operations | Acceptable for demo -- users click "Download PDF" |
| Inline role checks instead of middleware | Quick to implement per-page | Inconsistent enforcement, easy to forget on new routes | Never -- use middleware from the start |
| `any` types on financial calculation functions | Faster TypeScript development | Silent arithmetic bugs on monetary values | Never for money-handling code |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Neon Postgres | Using standard `pg` driver without serverless adapter | Use `@neondatabase/serverless` with `drizzle-orm/neon-serverless` adapter. Standard `pg` works but doesn't handle Neon's WebSocket proxy efficiently on Vercel. |
| Drizzle ORM | Forgetting `drizzle-kit push` or `migrate` after schema changes, leading to runtime errors | Run migrations as part of the build/deploy process. For dev, use `drizzle-kit push` for rapid iteration. |
| @react-pdf/renderer | Not registering fonts before rendering | Call `Font.register()` with Google Font URLs at module scope. Unregistered fonts silently fall back to Helvetica. |
| Recharts | Using Recharts in server components (it requires DOM) | All Recharts components must be in `'use client'` files. Fetch data server-side, pass as props to client chart components. |
| shadcn/ui | Installing components but not customizing theme tokens | Override CSS variables in `globals.css` to match DESIGN-SPEC colors before building any components. Do this first. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries on invoice list (loading line items per invoice) | List page loads slowly, each row triggers a query | Use Drizzle `with` relations or join line items in the list query. Only load line items on detail view. | 50+ invoices |
| Unindexed date range queries for reports | Reports page timeout on "last 6 months" filter | Add composite index on `(created_at, status)` and `(due_date, status)` | 500+ invoices |
| Loading all invoices client-side for filtering | Initial page load transfers all data, browser becomes sluggish | Server-side filtering and pagination. Pass filter params as query strings. | 100+ invoices |
| PDF generation blocking the main thread | UI freezes while generating large invoice PDFs | Use Web Workers for client-side PDF or stream response for server-side | Invoices with 20+ line items |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Customer portal leaking other customers' invoices via predictable invoice IDs | Data breach -- customer sees another customer's billing | Always filter queries by `customer_id` from session, never trust invoice ID alone. Use `WHERE invoice.customer_id = session.customerId AND invoice.id = params.id`. |
| Exposing internal invoice numbers in URLs (sequential integers) | Enumeration attack -- iterate IDs to discover invoice count/data | Use UUIDs for public-facing IDs or add customer ownership check on every access |
| Session secret hardcoded or weak | Session hijacking | Generate a proper random secret (32+ chars). Store in env var. Never commit to git. |
| No CSRF protection on payment recording endpoints | Attacker could record fake payments | Next.js App Router server actions have built-in CSRF protection. If using API routes, add CSRF tokens. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Invoice creation form loses data on navigation | Billing clerk fills out 10 line items, accidentally clicks sidebar, loses everything | Auto-save draft on input change (debounced). Or confirm before navigating away with `beforeunload`. |
| Dashboard shows stale data after recording a payment | Manager records payment, goes to dashboard, numbers haven't updated | Revalidate dashboard data after payment mutations. Use `revalidatePath('/dashboard')` in the server action. |
| Aging chart not visually obvious which bucket is which | Manager glances at chart but can't tell 30 from 60 from 90 days | Use the specified aging colors (green/gold/orange/red) consistently. Add count labels on each bar segment. Include a legend. |
| Customer portal shows raw internal statuses | Boater sees "IN_COLLECTIONS" status on their invoice | Map internal statuses to customer-friendly labels: "IN_COLLECTIONS" -> "Past Due - Please Contact Us" |
| CSV export produces unusable format | Manager opens CSV in Excel, amounts are parsed as dates or text | Format amounts without currency symbols in CSV (just numbers). Use ISO date format. Include column headers. Test in Excel. |

## "Looks Done But Isn't" Checklist

- [ ] **Invoice totals:** Often missing tax calculation -- verify subtotal + tax = total, and tax is computed per line item or on subtotal consistently
- [ ] **Aging buckets:** Often missing the "current" bucket (not yet due) -- verify invoices due in the future appear as "Current" not "0 days overdue"
- [ ] **Payment recording:** Often missing validation that payment amount <= remaining balance -- verify you can't overpay an invoice
- [ ] **Customer portal:** Often missing ownership filtering -- verify a customer can ONLY see their own invoices (test by modifying URL params)
- [ ] **PDF download:** Often missing in production builds -- verify PDFs generate correctly in production mode (`next build && next start`), not just dev
- [ ] **Recurring templates:** Often missing the "what was already generated" tracking -- verify generating twice doesn't create duplicates
- [ ] **Dashboard numbers:** Often missing consistency -- verify that "Total Revenue" on dashboard equals the sum of all paid invoices in the invoices list
- [ ] **Date handling:** Often missing timezone consistency -- verify dates display correctly (Neon stores UTC, browser renders local time)
- [ ] **Seed script:** Often missing idempotency -- verify running seed twice doesn't create duplicate data (truncate tables first)
- [ ] **Dark mode:** Often missing on charts and PDFs -- verify Recharts and PDF output respect the current theme

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Float money storage | HIGH | Create migration to add `_cents` columns, write script to convert existing data, update all queries and display logic, drop old columns |
| Duplicate recurring invoices | MEDIUM | Write dedup script matching on template_id + billing_period, delete duplicates, add unique constraint |
| Missing role checks on routes | LOW | Add middleware guard, audit all routes in one pass, test with each role |
| Dashboard performance | LOW | Add indexes (minutes), consolidate queries (hours), results are immediate |
| PDF generation broken in prod | MEDIUM | Switch to client-side generation if server-side fails, or use print-to-PDF as fallback |
| Payment balance desync | HIGH | Recalculate all balances from payment records, update statuses, add derived-balance approach going forward |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Float money arithmetic | Schema / DB design | Grep for `real`, `doublePrecision`, `parseFloat` on money columns -- should find zero |
| Aging calculation drift | Seed data / data modeling | Run seed, check dashboard shows invoices across all aging buckets |
| @react-pdf SSR crash | Invoice feature phase (prototype early) | Run `next build` and hit PDF endpoint -- should return valid PDF |
| Partial payment balance bugs | Payment tracking phase | Record partial payment, verify balance updates, record rest, verify status = paid |
| Recurring invoice duplicates | Invoicing phase | Click "Generate" button twice -- should see same number of invoices |
| UI-only role checks | Auth phase | Log in as customer, navigate to /dashboard -- should get 403 or redirect |
| Dashboard query performance | Dashboard phase | Load dashboard, check network tab -- should complete in under 1 second |

## Sources

- Training data knowledge of JavaScript financial arithmetic pitfalls (IEEE 754)
- Training data knowledge of Next.js App Router SSR constraints with client-side libraries
- Training data knowledge of @react-pdf/renderer server-side rendering limitations
- Training data knowledge of Neon Postgres serverless connection behavior
- Training data knowledge of Drizzle ORM schema patterns
- Training data knowledge of billing/invoicing application design patterns

**Note:** Web search was unavailable during this research. All findings are based on training data (cutoff ~May 2025). Confidence is MEDIUM -- patterns are well-established but specific library version behaviors should be verified against current docs during implementation.

---
*Pitfalls research for: Marina multi-revenue billing/invoicing platform*
*Researched: 2026-03-26*
