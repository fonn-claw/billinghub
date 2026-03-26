# Architecture Patterns

**Domain:** Marina multi-revenue invoicing and collections platform
**Researched:** 2026-03-26
**Confidence:** MEDIUM (based on established patterns for billing systems and Next.js App Router; no live source verification available)

## Recommended Architecture

**Pattern: Next.js App Router with Server Components + Server Actions, sidebar shell layout, role-gated route groups**

This is a data-heavy internal tool with three distinct user personas (manager, clerk, customer). The architecture should prioritize:
1. Fast data loading via Server Components (dashboards are read-heavy)
2. Secure mutations via Server Actions (invoice creation, payment recording)
3. Clean separation between admin and customer portal experiences
4. PDF generation as a dedicated concern (isolated from UI rendering)

### High-Level Structure

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │   Auth Layer  │  │         Route Groups              │ │
│  │  (middleware) │  │                                    │ │
│  │              │  │  (admin)/ ─── Dashboard             │ │
│  │  Session +   │  │            ├── Invoices (CRUD)      │ │
│  │  Role Check  │  │            ├── Payments             │ │
│  │              │  │            ├── Customers             │ │
│  │              │  │            ├── Reports               │ │
│  │              │  │            └── Settings              │ │
│  │              │  │                                      │ │
│  │              │  │  (portal)/ ── My Account             │ │
│  │              │  │            ├── My Invoices           │ │
│  │              │  │            └── My Statements         │ │
│  │              │  │                                      │ │
│  │              │  │  (auth)/  ── Login                   │ │
│  └──────────────┘  └──────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Data Access Layer (DAL)                 │  │
│  │  Drizzle ORM queries + business logic functions     │  │
│  │  (src/lib/dal/)                                     │  │
│  └─────────────────────┬──────────────────────────────┘  │
│                        │                                  │
│                        ▼                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │           Neon Postgres (DATABASE_URL)              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Auth Middleware** | Session validation, role-based route protection, redirect unauthenticated users | Cookie store, Database (session lookup) |
| **Admin Layout** | Sidebar navigation shell, breadcrumbs, user context for manager/clerk roles | Auth context, child route pages |
| **Portal Layout** | Simplified top-bar navigation for customer self-service | Auth context, child route pages |
| **Dashboard Module** | Revenue KPIs, aging chart, revenue breakdown, collection trends, cash flow forecast | DAL (read-only queries, aggregations) |
| **Invoice Module** | CRUD for invoices, line item management, recurring templates, PDF generation trigger | DAL (invoices, line_items, customers), PDF Service |
| **Payment Module** | Record payments, partial payments, payment plans, payment history | DAL (payments, invoices — updates balance/status) |
| **Customer Module** | Customer profiles, vessels, slip assignments, account balances, statement generation | DAL (customers, invoices, payments), PDF Service |
| **Collections Module** | Aging buckets, flags, notes, reminder tracking | DAL (invoices with aging calculations, collection_notes) |
| **Reports Module** | Revenue reports, aging detail, collections summary, CSV export | DAL (aggregation queries), CSV generation utility |
| **PDF Service** | Invoice and statement PDF generation using @react-pdf/renderer | Receives data objects, returns PDF buffers/components |
| **Data Access Layer (DAL)** | All Drizzle queries, business logic (tax calc, aging categorization, balance computation) | Neon Postgres via Drizzle |
| **Seed Script** | Demo data population (25 customers, 150+ invoices, payments, realistic aging) | Database directly via Drizzle |

### Data Flow

#### Read Path (Server Components — dominant pattern)

```
Browser Request
  → Next.js Middleware (auth check)
  → Server Component (page.tsx)
  → DAL function (e.g., getRevenueStats())
  → Drizzle query → Neon Postgres
  → Data returned to Server Component
  → HTML streamed to browser (with Suspense boundaries for loading states)
```

#### Write Path (Server Actions)

```
User submits form / clicks action button
  → Server Action (e.g., createInvoice())
  → Validate input (zod schema)
  → DAL function (insert/update)
  → Drizzle mutation → Neon Postgres
  → revalidatePath() to refresh stale data
  → Response to client (redirect or success state)
```

#### PDF Generation Path

```
User clicks "Download PDF" or "Generate Statement"
  → API Route (GET /api/invoices/[id]/pdf or /api/statements/[customerId])
  → DAL fetches invoice/statement data
  → @react-pdf/renderer renders React components to PDF buffer
  → Response with Content-Type: application/pdf
```

PDF generation uses API Routes (not Server Actions) because it returns binary data, not a form response. The PDF templates are React components using @react-pdf/renderer that match the design spec styling.

## Database Schema Architecture

The schema follows a standard invoicing pattern with these core entities:

```
users ──────────────────────┐
  id, email, password_hash, │
  name, role, created_at    │
                             │
customers ◄─────────────────┘ (user_id nullable — linked for portal login)
  id, name, email, phone,
  address, slip_number,
  dock, vessel_name,
  vessel_length, status,
  notes, created_at
        │
        │ 1:N
        ▼
invoices
  id, invoice_number,
  customer_id, status,        ◄── enum: draft, sent, paid, partial, overdue, collections
  issue_date, due_date,
  subtotal, tax_rate,
  tax_amount, total,
  amount_paid, balance_due,
  recurring_template_id,
  notes, created_at
        │
        │ 1:N                    1:N
        ├──────────────┐         │
        ▼              ▼         ▼
  line_items       payments    collection_notes
    id,              id,          id,
    invoice_id,      invoice_id,  invoice_id,
    category,        amount,      note,
    description,     method,      created_by,
    quantity,        reference,    created_at
    unit_price,      date,
    amount           created_at

recurring_templates
  id, customer_id,
  line_items (jsonb),
  frequency, next_date,
  active, created_at
```

**Key design decisions:**

- **Denormalized totals on invoices**: `subtotal`, `tax_amount`, `total`, `amount_paid`, `balance_due` are stored directly (not computed on read). Updated via triggers or application logic when payments are recorded. This makes dashboard aggregations fast.
- **Category enum on line_items**: `slip_rental`, `fuel`, `maintenance`, `amenity`, `service`, `other` -- enables revenue-by-category reporting without joins.
- **Invoice status as enum**: Business logic updates status based on `balance_due` and `due_date` (paid when balance=0, overdue when past due, partial when 0 < amount_paid < total).
- **Aging is computed, not stored**: Aging buckets (current/30/60/90+) are calculated from `due_date` vs current date. No need to store -- Postgres date math handles this efficiently.
- **Recurring templates store line items as JSONB**: Simpler than a separate template_line_items table. Templates are copied into real invoices + line_items when generated.

## Patterns to Follow

### Pattern 1: Data Access Layer (DAL) Separation

**What:** All database queries live in `src/lib/dal/` organized by domain (invoices.ts, payments.ts, customers.ts, dashboard.ts). Server Components and Server Actions import from DAL, never use Drizzle directly.

**Why:** Prevents query duplication, centralizes business logic, makes it easy to add caching or authorization checks in one place.

**Example:**
```typescript
// src/lib/dal/dashboard.ts
export async function getRevenueStats() {
  const [revenue, aging, byCategory] = await Promise.all([
    db.select({ ... }).from(invoices).where(...),
    db.select({ ... }).from(invoices).where(...).groupBy(...),
    db.select({ ... }).from(lineItems).groupBy(lineItems.category),
  ]);
  return { revenue, aging, byCategory };
}

// src/app/(admin)/dashboard/page.tsx
export default async function DashboardPage() {
  const stats = await getRevenueStats();
  return <RevenueDashboard stats={stats} />;
}
```

### Pattern 2: Route Groups for Layout Separation

**What:** Use Next.js route groups `(admin)`, `(portal)`, `(auth)` to provide completely different layouts without URL path impact.

**Why:** Admin users get a sidebar shell. Customer portal users get a simplified top-bar. Login gets a split-screen layout. All from the same Next.js app.

**Example:**
```
src/app/
  (auth)/
    login/page.tsx         → Split-screen login layout
    layout.tsx             → Minimal layout, no nav
  (admin)/
    layout.tsx             → Sidebar + breadcrumbs shell
    dashboard/page.tsx
    invoices/
      page.tsx             → Invoice list
      new/page.tsx         → Create invoice form
      [id]/page.tsx        → Invoice detail
    payments/page.tsx
    customers/
      page.tsx
      [id]/page.tsx
    reports/page.tsx
  (portal)/
    layout.tsx             → Top-bar simplified layout
    account/page.tsx       → Account summary
    invoices/page.tsx      → Customer's invoices
    invoices/[id]/page.tsx → Invoice detail + PDF download
```

### Pattern 3: Server Actions for All Mutations

**What:** Use Server Actions (not API routes) for form submissions and data mutations. Use `"use server"` directive in dedicated action files.

**Why:** Type-safe, progressive enhancement, automatic revalidation, no manual fetch/API setup.

**Example:**
```typescript
// src/app/(admin)/invoices/actions.ts
"use server";

import { createInvoiceInDb } from "@/lib/dal/invoices";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInvoice(formData: FormData) {
  const session = await getSession();
  if (!session || !["manager", "billing_clerk"].includes(session.role)) {
    throw new Error("Unauthorized");
  }
  // validate with zod, insert via DAL
  const invoice = await createInvoiceInDb(validated);
  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}
```

### Pattern 4: Suspense Boundaries for Dashboard Loading

**What:** Wrap each dashboard section in its own Suspense boundary with skeleton loaders. Each section fetches independently.

**Why:** The dashboard has 4+ independent data sections (KPIs, aging chart, revenue breakdown, trends). Streaming them independently means faster perceived performance -- users see KPI cards while charts are still loading.

**Example:**
```typescript
// Dashboard page
export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>
      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<ChartSkeleton />}>
          <AgingChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueByCategoryChart />
        </Suspense>
      </div>
    </>
  );
}
```

### Pattern 5: Centralized Auth with Middleware + Helpers

**What:** Middleware checks session cookie on every request, redirects unauthenticated users. A `getSession()` helper is used in Server Components and Server Actions for role checks.

**Why:** Single auth boundary. No per-page auth boilerplate. Role checks happen at the action/query level, not the route level (middleware handles auth, DAL handles authorization).

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Data Fetching for Primary Data

**What:** Using `useEffect` + `fetch` to load invoice lists, dashboard data, etc.
**Why bad:** Adds loading spinners, exposes API endpoints, loses Server Component benefits (streaming, SEO, zero JS bundle for data).
**Instead:** Use async Server Components. Reserve client components for interactivity (forms, modals, charts with animations).

### Anti-Pattern 2: Fat API Routes

**What:** Building REST API routes for every CRUD operation.
**Why bad:** Unnecessary abstraction layer. Server Actions are simpler, type-safe, and handle revalidation automatically. API routes add endpoint management, manual error handling, and client-side fetch logic.
**Instead:** Server Actions for mutations. API routes ONLY for non-HTML responses (PDF download, CSV export).

### Anti-Pattern 3: Computing Aggregations on Every Dashboard Load

**What:** Running expensive aggregate queries (SUM, GROUP BY across all invoices) on every page load.
**Why bad:** Gets slow as data grows. With 150+ demo invoices it's fine, but the pattern doesn't scale.
**Instead:** For this demo scale, direct queries are acceptable. If scaling: use materialized views or cache dashboard stats with `unstable_cache` / ISR. At demo scale (150 invoices), this is a non-issue -- flag it as a future concern, don't over-engineer.

### Anti-Pattern 4: Shared Layout State via Context for Server Data

**What:** Wrapping the entire app in React Context providers to share user/session data.
**Why bad:** Forces the layout to become a Client Component, losing Server Component benefits.
**Instead:** Pass session data from the server layout to client components as props. Use `getSession()` in each Server Component that needs it -- the function result is automatically deduped by React.

### Anti-Pattern 5: Single Monolithic Seed Script

**What:** One giant seed function that creates all data in sequence.
**Why bad:** Hard to debug, fails entirely if one part errors, difficult to maintain as schema evolves.
**Instead:** Organize seed into stages: `seedUsers()` -> `seedCustomers()` -> `seedInvoices()` -> `seedPayments()`. Each function is independently testable and can be re-run.

## Component Interaction Map

```
┌─────────────┐
│   Login     │──── authenticates ────►┌─────────────┐
└─────────────┘                        │  Session DB  │
                                       └──────┬──────┘
                                              │
                        ┌─────────────────────┴───────────────────┐
                        │                                          │
                        ▼                                          ▼
              ┌─────────────────┐                       ┌──────────────────┐
              │  Admin Shell    │                       │  Portal Shell     │
              │  (sidebar nav)  │                       │  (top-bar nav)    │
              └────────┬────────┘                       └────────┬─────────┘
                       │                                         │
          ┌────────────┼────────────┐               ┌────────────┤
          ▼            ▼            ▼               ▼            ▼
    ┌───────────┐┌──────────┐┌──────────┐   ┌───────────┐┌──────────────┐
    │ Dashboard ││ Invoices ││ Customers│   │ My Account││ My Invoices  │
    │           ││          ││          │   │           ││              │
    │ reads:    ││ reads:   ││ reads:   │   │ reads:    ││ reads:       │
    │ all stats ││ invoices ││ customers│   │ own stats ││ own invoices │
    │           ││ line_item││ invoices │   │           ││              │
    │           ││ payments ││ payments │   │           ││              │
    └───────────┘└────┬─────┘└──────────┘   └───────────┘└──────┬───────┘
                      │                                          │
                      ▼                                          ▼
              ┌──────────────┐                           ┌──────────────┐
              │  PDF Service │                           │  PDF Service │
              │  (invoices,  │                           │  (invoices   │
              │   statements)│                           │   only)      │
              └──────────────┘                           └──────────────┘
```

## Suggested Build Order

Dependencies between components dictate build order. Each layer requires the previous to be functional.

### Layer 1: Foundation (no dependencies)
- Database schema + Drizzle config + migrations
- Auth system (session-based login, middleware, getSession helper)
- Base layouts: admin shell (sidebar), portal shell (top-bar), auth layout (split-screen)
- Design system setup: Tailwind config with design spec colors/fonts, shadcn/ui component overrides

**Rationale:** Everything else depends on having a database, auth, and layouts. These are pure infrastructure with no business logic dependencies.

### Layer 2: Core Data (depends on Layer 1)
- Customer CRUD (profiles, vessels, slip assignments)
- Invoice CRUD (create with line items, edit, status management)
- Seed script (customers + invoices with realistic data)

**Rationale:** Customers and invoices are the two central entities. Payments, collections, dashboard, and reports all depend on invoices existing. Seed data is needed to visually validate everything from this point forward.

### Layer 3: Financial Operations (depends on Layer 2)
- Payment recording (full and partial payments, payment methods)
- Invoice status updates (auto-calculate: paid/partial/overdue based on payments + due date)
- Recurring invoice templates and generation
- Collections workflow (flags, notes, aging categorization)

**Rationale:** Payments modify invoice state. Collections depend on having overdue invoices. Recurring templates create invoices. All need Layer 2 entities to exist.

### Layer 4: Reporting and Visualization (depends on Layers 2-3)
- Revenue dashboard (KPIs, aging chart, revenue by category, trends)
- Reports module (revenue, aging detail, collections, comparison)
- CSV export

**Rationale:** Dashboard and reports are read-only aggregations over invoices + payments. They need realistic data (from seed + payment recording) to be meaningful.

### Layer 5: Document Generation (depends on Layers 2-3)
- PDF invoice generation
- PDF statement generation
- API routes for PDF download

**Rationale:** PDF templates depend on invoice and customer data structures being finalized. Can be built in parallel with Layer 4.

### Layer 6: Customer Portal (depends on Layers 2-3, 5)
- Portal layout and navigation
- Account summary view
- Invoice list (own invoices only)
- PDF download from portal
- "Pay Now" placeholder

**Rationale:** The portal is a simplified view of data that already exists. It depends on invoices, payments, and PDF generation being functional. It's a separate layout with scoped-down data access.

### Layer 7: Polish (depends on all above)
- Dark mode implementation
- Motion/animation (counter roll-up, chart animations, skeleton loading)
- Responsive design (breakpoints, collapsed sidebar, mobile layout)
- Empty states with custom SVGs

**Rationale:** Visual polish should come last. Skeleton loading, animations, and responsive behavior require the actual components to exist first.

## Scalability Considerations

| Concern | Demo Scale (25 customers, 150 invoices) | Production Scale (500 customers) | Enterprise Scale (5000+ customers) |
|---------|----------------------------------------|----------------------------------|-------------------------------------|
| Dashboard queries | Direct SQL aggregations, instant | Add `unstable_cache` with 60s TTL | Materialized views, background refresh |
| Invoice list | Single query, no pagination needed | Server-side pagination (20/page) | Cursor-based pagination, search indexing |
| PDF generation | On-demand, synchronous | On-demand, acceptable latency | Queue-based generation, pre-generate on status change |
| Aging calculation | Compute from due_date in query | Same approach, add index on due_date | Background job to pre-compute aging buckets |
| Auth sessions | DB-stored sessions | Same, add session cleanup cron | Redis session store |

**For this demo:** Direct queries everywhere. The data volume (25 customers, 150 invoices) is trivially small for Postgres. Do not add caching, queues, or materialized views -- they add complexity without benefit at this scale.

## File Structure

```
src/
  app/
    (auth)/
      login/page.tsx
      layout.tsx
    (admin)/
      layout.tsx                 # Sidebar shell
      dashboard/page.tsx
      invoices/
        page.tsx                 # List with filters
        new/page.tsx             # Create form
        [id]/page.tsx            # Detail view
        actions.ts               # Server Actions
      payments/
        page.tsx
        actions.ts
      customers/
        page.tsx
        [id]/page.tsx
        actions.ts
      reports/page.tsx
    (portal)/
      layout.tsx                 # Top-bar shell
      account/page.tsx
      invoices/
        page.tsx
        [id]/page.tsx
    api/
      invoices/[id]/pdf/route.ts # PDF download endpoint
      statements/[customerId]/route.ts
      reports/export/route.ts    # CSV export
  components/
    ui/                          # shadcn/ui overrides
    layout/                      # Sidebar, TopBar, Breadcrumbs
    dashboard/                   # Chart components, stat cards
    invoices/                    # InvoiceForm, LineItemRow, InvoiceTable
    payments/                    # PaymentForm, PaymentHistory
    customers/                   # CustomerForm, CustomerCard
    pdf/                         # Invoice PDF template, Statement PDF template
  lib/
    dal/                         # Data Access Layer
      dashboard.ts
      invoices.ts
      payments.ts
      customers.ts
      collections.ts
      reports.ts
    db/
      schema.ts                  # Drizzle schema definitions
      index.ts                   # DB connection
      seed.ts                    # Demo data seeding
      migrations/                # Drizzle migrations
    auth/
      session.ts                 # Session management
      middleware.ts              # Auth helpers for middleware
    utils/
      formatting.ts              # Currency, date formatting
      aging.ts                   # Aging bucket calculations
      tax.ts                     # Tax calculation
      csv.ts                     # CSV export utility
```

## Sources

- Next.js App Router architecture patterns: Based on established patterns from Next.js documentation and community best practices (training data, MEDIUM confidence)
- Invoicing database schema design: Based on standard double-entry bookkeeping and invoicing system patterns (training data, HIGH confidence -- this is a well-established domain)
- @react-pdf/renderer for PDF generation: Established React-based PDF library (training data, MEDIUM confidence on current API)
- Drizzle ORM patterns: Based on Drizzle documentation patterns (training data, MEDIUM confidence)

**Note:** Web search was unavailable during research. All recommendations are based on training data knowledge of these well-established patterns. The invoicing domain and Next.js App Router architecture are mature enough that training data is reliable, but specific API details for libraries (Drizzle, @react-pdf/renderer) should be verified against current docs during implementation.
