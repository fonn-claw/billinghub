# Phase 02: Billing Engine - Research

**Researched:** 2026-03-27
**Domain:** Multi-revenue invoicing, payment tracking, recurring billing, collections workflow
**Confidence:** HIGH

## Summary

Phase 2 builds the core billing engine: customer CRUD, invoice creation with multi-revenue line items, payment recording (full and partial), recurring invoice templates, and collections workflow. The database schema is already in place from Phase 1 seed work, but several schema gaps exist that must be addressed before building the UI. The existing codebase provides a solid foundation with iron-session auth, Drizzle ORM, shadcn/ui components, and established patterns for server actions and route groups.

The primary challenge is the volume of interconnected CRUD operations -- 28 requirements across 5 domains (customers, invoices, recurring, payments, collections). The schema needs amendments for customer communication logs, collection flags, and reminder tracking before building UI. All monetary values are already stored as integer cents with the `formatCurrency` utility in place.

**Primary recommendation:** Fix schema gaps first (add customerNotes table, collection fields on customers, promise-to-pay fields on collectionNotes), then build Customer CRUD as the foundation, followed by Invoice CRUD, Payments, Recurring Templates, and Collections -- each building on the previous.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Customer list as searchable/filterable table using shadcn Table
- Customer profile page with tabs: Overview, Invoices, Payments, Notes
- Create customer via modal dialog; edit customer on dedicated page
- Balance summary: current charges, pending, overdue, credits -- all calculated from invoice/payment data
- Communication log as timeline-style entries with timestamp and author (CUST-05)
- Vessel details: name, type (sailboat/powerboat/catamaran), length in feet
- Slip assignment: dock letter (A-E) + slip number
- Single-page invoice form with customer selector, dates, and dynamic line item rows
- Line items: add/remove rows, category dropdown, description, quantity, unit price, auto-calculated amount
- Subtotal auto-calculated; single tax rate field (default 8.5%); total = subtotal + tax
- Save as "draft" by default; explicit "Mark as Sent" button
- Invoice numbering: auto-increment INV-XXXXX from max existing
- Edit allowed only for draft invoices (INV-08)
- Invoice detail: header, line items table, payment history, status badge, action buttons
- Status auto-updates server-side: overdue/paid/partial
- Invoice list: table with status filter tabs (All, Draft, Sent, Paid, Overdue, Partial)
- Aging buckets: current (0-30), 30-day (31-60), 60-day (61-90), 90+ day
- Recurring template: customer, line items, frequency (monthly/quarterly/annual), next invoice date
- Template list with active/inactive toggle
- "Generate Invoice" creates draft from template; bulk generate for all due templates
- After generation, advance next_invoice_date
- Payment via modal from invoice detail; amount pre-filled with remaining balance
- Invoice status auto-updates on payment insert (server-side)
- Payment history on invoice detail with running balance and progress bar
- All payments list: filterable table
- Per-customer payment history on profile Payments tab
- Collections auto-aging based on days past due
- Collections flag toggle on customer profile or bulk from overdue view
- Collection notes: threaded per-customer with timestamps and author
- Reminder tracking: last reminder date, manually updated
- Promise to pay: collection note type with promised date and amount
- Collections view: flagged customers with total overdue, days overdue, last note, last reminder

### Claude's Discretion
- Exact form validation patterns and error messages
- Loading states and optimistic updates
- Server action vs API route decisions
- Exact column widths and responsive table behavior
- Empty state illustrations (use existing assets from public/assets/)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CUST-01 | Create customer with contact, vessel, slip | Schema exists. Need customerNotes table for CUST-05. Modal dialog pattern with server action. |
| CUST-02 | View customer list with search/filter | shadcn Table + server-side filtering. Search on name/email, filter by dock. |
| CUST-03 | View customer profile with balance summary | Tabbed layout. Balance derived from invoices/payments via DAL aggregation query. |
| CUST-04 | Edit customer information | Dedicated edit page. Server action for update. |
| CUST-05 | Add billing notes to communication log | **Schema gap**: Need new `customerNotes` table (id, customerId, note, createdBy, createdAt). Current `customers.notes` is text blob. |
| CUST-06 | Customer profile shows payment/invoice history | Tabs on customer profile page. DAL queries filtered by customerId. |
| INV-01 | Create invoice with multi-revenue line items | Dynamic form with line item rows. Server action creates invoice + line items in transaction. |
| INV-02 | Line items: category, description, qty, rate, amount | Category enum exists in schema. Amount = qty * unitPriceCents. |
| INV-03 | Auto-calculate subtotal, tax, total | Server-side: sum line items for subtotal, apply taxRate, compute total. All in cents. |
| INV-04 | Save as draft or mark as sent | Status enum has draft/sent. Default to draft, button to update status. |
| INV-05 | Invoice list with status filtering | Status filter tabs. Server-side filtering with search params. |
| INV-06 | Invoice detail with line items, payments, status | Detail page with DAL query joining invoice + lineItems + payments. |
| INV-07 | Status auto-updates from payments/due date | Server-side logic: on payment insert, recalculate status. Aging check on read. |
| INV-08 | Edit draft invoices | Only allow edit when status=draft. Server action validates status before update. |
| INV-09 | Auto-categorize into aging buckets | Pure function: getAgingBucket(dueDate, today). Used in list and detail views. |
| REC-01 | Create recurring template with line items, schedule | Template form. lineItems stored as JSONB. Frequency enum exists. |
| REC-02 | Generate invoices from templates | Server action: create invoice from template data, advance nextInvoiceDate. Transaction. |
| REC-03 | View and manage templates | List with active toggle (switch component). |
| PAY-01 | Record payment (cash, check, CC, bank transfer) | Modal dialog from invoice detail. Payment method enum exists. |
| PAY-02 | Partial payments | Amount field pre-filled with balance. Validation: amount <= remaining balance. |
| PAY-03 | Payment history per invoice and per customer | Invoice detail shows payments. Customer profile Payments tab. |
| PAY-04 | All payments list with filtering | Payments page with table, filter by method/date range. |
| PAY-05 | Invoice balance auto-updates on payment | Derived: totalCents - SUM(payments.amountCents). Status update in same transaction. |
| COLL-01 | Auto-categorize into 30/60/90+ aging | Same aging function as INV-09. Applied to collections view. |
| COLL-02 | Flag accounts for collections | **Schema gap**: Need `isCollectionsFlagged` boolean on customers table. |
| COLL-03 | Add collection notes with timestamps | **Schema gap**: collectionNotes links to invoiceId but CONTEXT says per-customer. Need customerId on collectionNotes. |
| COLL-04 | Track payment reminder status | **Schema gap**: Need `lastReminderDate` on customers table. |
| COLL-05 | Record promises to pay | **Schema gap**: Need `type` field on collectionNotes (note/promise_to_pay) plus `promisedDate` and `promisedAmountCents` nullable fields. |
</phase_requirements>

## Schema Gaps (MUST Address First)

The Phase 1 schema covers the core entities but is missing several fields required by the CONTEXT.md decisions. These must be added via migration before building the UI.

### New Table: `customerNotes`

```typescript
export const customerNotes = pgTable("customer_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  note: text("note").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Why**: CUST-05 requires a communication log with timestamps and author. The existing `customers.notes` text field cannot support this.

### Amendments to `customers` Table

```typescript
// Add these columns:
isCollectionsFlagged: boolean("is_collections_flagged").default(false).notNull(),
lastReminderDate: date("last_reminder_date"),
```

**Why**: COLL-02 needs a flag, COLL-04 needs reminder tracking.

### Amendments to `collectionNotes` Table

```typescript
// Change invoiceId to optional, add customerId:
customerId: uuid("customer_id").references(() => customers.id).notNull(),
invoiceId: uuid("invoice_id").references(() => invoices.id), // make optional
noteType: text("note_type").default("note").notNull(), // "note" | "promise_to_pay"
promisedDate: date("promised_date"),
promisedAmountCents: integer("promised_amount_cents"),
```

**Why**: CONTEXT.md says collection notes are "threaded per-customer," and COLL-05 needs promise-to-pay with date and amount.

## Standard Stack

All libraries are already installed from Phase 1. No new dependencies needed for Phase 2.

### Core (Already Installed)

| Library | Version | Purpose | Phase 2 Usage |
|---------|---------|---------|---------------|
| drizzle-orm | 0.45.1 | ORM | All CRUD operations, joins, aggregations |
| zod | 4.3.6 | Validation | Form validation for all server actions |
| date-fns | 4.1.0 | Date utilities | Aging calculations, date formatting, recurring date advancement |
| iron-session | 8.0.4 | Auth sessions | Session checks in all server actions |
| lucide-react | 1.7.0 | Icons | Table actions, form fields, status indicators |

### shadcn Components Needed (Some Missing)

| Component | Status | Phase 2 Usage |
|-----------|--------|---------------|
| table | Installed | All list views |
| card | Installed | Profile sections, summary cards |
| badge | Installed | Invoice status display |
| button | Installed | All forms and actions |
| input | Installed | Form fields |
| label | Installed | Form labels |
| dropdown-menu | Installed | Row action menus |
| sheet | Installed | Slide-over panels |
| tooltip | Installed | Icon-only actions |
| dialog | **NEEDS INSTALL** | Create customer modal, record payment modal |
| select | **NEEDS INSTALL** | Category dropdown, customer selector, frequency picker |
| tabs | **NEEDS INSTALL** | Customer profile tabs, invoice status filter tabs |
| textarea | **NEEDS INSTALL** | Notes fields, collection notes |
| switch | **NEEDS INSTALL** | Recurring template active/inactive toggle |
| popover | **NEEDS INSTALL** | Date picker trigger |
| calendar | **NEEDS INSTALL** | Date selection for invoice dates, payment dates |
| progress | **NEEDS INSTALL** | Partial payment progress bar |

**Installation:**
```bash
npx shadcn@latest add dialog select tabs textarea switch popover calendar progress
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
  app/(admin)/
    customers/
      page.tsx              # Customer list with search/filter
      new/page.tsx           # NOT used -- create via modal dialog
      [id]/
        page.tsx             # Customer profile with tabs
        edit/page.tsx        # Edit customer form
      actions.ts             # Server actions: create, update, addNote
    invoices/
      page.tsx               # Invoice list with status filter tabs
      new/page.tsx           # Create invoice form
      [id]/
        page.tsx             # Invoice detail
        edit/page.tsx        # Edit draft invoice
      actions.ts             # Server actions: create, update, markSent, delete
    payments/
      page.tsx               # All payments list
      actions.ts             # Server actions: recordPayment
    recurring/
      page.tsx               # Recurring templates list
      new/page.tsx           # Create template
      actions.ts             # Server actions: create, toggle, generate, bulkGenerate
    collections/
      page.tsx               # Collections view (flagged customers)
      actions.ts             # Server actions: flag, addNote, updateReminder
  components/
    customers/
      customer-table.tsx     # Client: searchable table
      customer-form.tsx      # Client: create/edit form
      create-customer-dialog.tsx  # Client: modal wrapper
      customer-profile.tsx   # Client: tabbed profile
      balance-summary.tsx    # Server: computed balance card
      customer-notes.tsx     # Client: timeline notes
    invoices/
      invoice-table.tsx      # Client: filterable table
      invoice-form.tsx       # Client: form with dynamic line items
      line-item-row.tsx      # Client: single line item row
      invoice-detail.tsx     # Mixed: detail view
      status-badge.tsx       # Server: colored badge by status
    payments/
      payment-table.tsx      # Client: filterable table
      record-payment-dialog.tsx  # Client: modal payment form
      payment-progress.tsx   # Client: progress bar
    recurring/
      template-table.tsx     # Client: templates list
      template-form.tsx      # Client: template creation
    collections/
      collections-table.tsx  # Client: flagged customers
      collection-notes.tsx   # Client: threaded notes
  lib/
    dal/
      customers.ts           # getCustomers, getCustomer, getCustomerBalance
      invoices.ts            # getInvoices, getInvoice, getNextInvoiceNumber
      payments.ts            # getPayments, getInvoicePayments
      recurring.ts           # getTemplates, generateFromTemplate
      collections.ts         # getCollections, getCollectionNotes
    utils/
      aging.ts               # getAgingBucket, getAgingLabel, getAgingColor
      invoice-number.ts      # generateNextInvoiceNumber
      validation.ts          # Zod schemas for all forms
```

### Pattern 1: Server Actions with Zod Validation

**What:** All mutations use server actions with Zod schema validation and `useActionState` for form state.
**When to use:** Every form submission in Phase 2.

```typescript
// src/app/(admin)/invoices/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { invoices, lineItems } from "@/lib/db/schema";

const lineItemSchema = z.object({
  category: z.enum(["slip_rental", "fuel", "maintenance", "amenity", "service", "other"]),
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int().min(0),
});

const createInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  issueDate: z.string(),
  dueDate: z.string(),
  taxRate: z.number().min(0).max(1),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1),
});

export async function createInvoice(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  // Parse JSON body from formData
  const raw = JSON.parse(formData.get("data") as string);
  const result = createInvoiceSchema.safeParse(raw);
  if (!result.success) {
    return { error: "Invalid invoice data", fieldErrors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const subtotalCents = data.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
  const taxAmountCents = Math.round(subtotalCents * data.taxRate);
  const totalCents = subtotalCents + taxAmountCents;

  // Generate invoice number
  const invoiceNumber = await getNextInvoiceNumber();

  // Insert invoice + line items in a conceptual batch
  const [invoice] = await db.insert(invoices).values({
    invoiceNumber,
    customerId: data.customerId,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    subtotalCents,
    taxRate: data.taxRate,
    taxAmountCents,
    totalCents,
    notes: data.notes,
  }).returning();

  await db.insert(lineItems).values(
    data.items.map(item => ({
      invoiceId: invoice.id,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      amountCents: item.quantity * item.unitPriceCents,
    }))
  );

  revalidatePath("/invoices");
  revalidatePath(`/customers/${data.customerId}`);
  redirect(`/invoices/${invoice.id}`);
}
```

### Pattern 2: Dynamic Line Item Form

**What:** Client component with add/remove line item rows, auto-calculated amounts.
**When to use:** Invoice creation and editing, recurring template creation.

```typescript
// Key state management pattern for line items
const [items, setItems] = useState<LineItem[]>([emptyLineItem()]);

const updateItem = (index: number, field: string, value: unknown) => {
  setItems(prev => prev.map((item, i) =>
    i === index
      ? { ...item, [field]: value, amountCents: field === "quantity" || field === "unitPriceCents"
          ? (field === "quantity" ? (value as number) : item.quantity) *
            (field === "unitPriceCents" ? (value as number) : item.unitPriceCents)
          : item.amountCents }
      : item
  ));
};

const addItem = () => setItems(prev => [...prev, emptyLineItem()]);
const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

// Compute totals
const subtotalCents = items.reduce((sum, item) => sum + item.amountCents, 0);
const taxAmountCents = Math.round(subtotalCents * taxRate);
const totalCents = subtotalCents + taxAmountCents;
```

### Pattern 3: Derived Invoice Status

**What:** Invoice status is computed server-side based on payments and due date, never set manually by the user (except draft -> sent).
**When to use:** Every payment recording and every invoice read.

```typescript
// src/lib/dal/invoices.ts
export function computeInvoiceStatus(
  currentStatus: string,
  totalCents: number,
  paidCents: number,
  dueDate: string,
  today: Date = new Date()
): "draft" | "sent" | "paid" | "partial" | "overdue" | "collections" {
  if (currentStatus === "draft") return "draft";
  if (currentStatus === "collections") return "collections"; // manually set, sticky
  if (paidCents >= totalCents) return "paid";
  if (paidCents > 0) return "partial";
  const due = new Date(dueDate);
  if (due < today) return "overdue";
  return "sent";
}
```

### Pattern 4: Balance Derivation

**What:** Invoice balance = totalCents - SUM(payments.amountCents). Never store as mutable field.
**When to use:** Invoice detail, customer profile, collections view.

```typescript
// DAL query pattern for invoice with balance
import { sql, eq } from "drizzle-orm";

export async function getInvoiceWithBalance(invoiceId: string) {
  const result = await db
    .select({
      invoice: invoices,
      paidCents: sql<number>`COALESCE(SUM(${payments.amountCents}), 0)`.as("paid_cents"),
    })
    .from(invoices)
    .leftJoin(payments, eq(payments.invoiceId, invoices.id))
    .where(eq(invoices.id, invoiceId))
    .groupBy(invoices.id);

  if (!result[0]) return null;
  const { invoice, paidCents } = result[0];
  return {
    ...invoice,
    paidCents,
    balanceCents: invoice.totalCents - paidCents,
  };
}
```

### Anti-Patterns to Avoid

- **Storing `amountPaid` or `balanceDue` on invoices table:** Derive from payments. The schema correctly does not have these columns.
- **Client-side invoice number generation:** Always generate on server to avoid race conditions. Query MAX(invoice_number) in the server action.
- **Using `parseFloat` for monetary input:** Parse user input as dollars, multiply by 100, round to integer cents. `Math.round(parseFloat(value) * 100)`.
- **Manual status management:** Never let the UI set status to "paid"/"partial"/"overdue" directly. Compute from payment state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date picker | Custom date input | shadcn calendar + popover | Browser date inputs are inconsistent; shadcn calendar matches the design system |
| Form validation | Manual if/else checks | Zod schemas | Type-safe, composable, detailed field errors |
| Status badge colors | Inline conditional styles | Badge component with variant mapping | Consistent styling, follows DESIGN-SPEC |
| Aging bucket calc | Inline date diffs | Pure utility function | Testable, reusable across views |
| Currency input | Raw number input | Formatted input that stores cents | Users think in dollars, system stores cents -- need conversion layer |
| Search/filter state | useState + manual URL | Search params in URL | Shareable, back-button friendly, server-side filtering |

## Common Pitfalls

### Pitfall 1: Neon HTTP Driver Cannot Do Transactions
**What goes wrong:** The existing `db/index.ts` uses `neon()` HTTP driver via `drizzle-orm/neon-http`. The HTTP driver does NOT support `db.transaction()`. Invoice creation needs to insert invoice + line items atomically. Payment recording needs to insert payment + update status atomically.
**Why it happens:** Neon HTTP mode sends individual SQL statements over HTTP. Each is its own transaction. There is no persistent connection to wrap in BEGIN/COMMIT.
**How to avoid:** For operations that need atomicity:
1. Use batch inserts where possible (insert invoice, then insert line items -- if line items fail, the invoice is just an empty draft).
2. For critical atomicity (payment + status update), switch to the WebSocket driver for that operation, or accept eventual consistency (update status after payment insert with revalidation).
3. Alternatively, use a single SQL statement with CTEs for atomic operations.
4. The pragmatic approach for a demo: insert sequentially and rely on the fact that partial failure leaves data in a recoverable state (empty invoice = delete it; payment without status update = recalculate on next read).
**Warning signs:** Runtime error "transactions are not supported" when calling `db.transaction()`.

### Pitfall 2: Invoice Number Race Condition
**What goes wrong:** Two users create invoices simultaneously. Both query MAX(invoice_number) and get INV-00150. Both create INV-00151. The second insert fails on the unique constraint.
**How to avoid:** Use a database sequence or handle the unique constraint violation with a retry. For a demo with 1-2 concurrent users, this is extremely unlikely but the unique constraint on `invoice_number` will catch it. Add error handling in the server action.

### Pitfall 3: Aging Bucket on Draft Invoices
**What goes wrong:** Draft invoices have a due date but shouldn't appear in aging reports. An overdue draft makes no sense -- it was never sent.
**How to avoid:** Aging calculations should only apply to invoices with status != "draft". Filter drafts out before computing aging buckets.

### Pitfall 4: Currency Input Dollar-to-Cents Conversion
**What goes wrong:** User types "150.00" in the unit price field. Naive `parseFloat("150.00") * 100` works for most values but `parseFloat("19.99") * 100 = 1998.9999999999998`.
**How to avoid:** Always `Math.round(parseFloat(value) * 100)` when converting user input to cents. Better: parse the string manually: split on ".", handle the decimal part explicitly.

### Pitfall 5: Recurring Template Line Items JSONB Shape
**What goes wrong:** The `recurringTemplates.lineItems` column is JSONB. If the shape doesn't match what the invoice creation flow expects, generated invoices have broken line items.
**How to avoid:** Define a TypeScript type for the JSONB shape and validate with Zod on both write and read. Use the same `lineItemSchema` for both invoice creation and template creation.

## Code Examples

### Aging Bucket Utility

```typescript
// src/lib/utils/aging.ts
import { differenceInDays } from "date-fns";

export type AgingBucket = "current" | "30day" | "60day" | "90plus";

export function getAgingBucket(dueDate: string | Date, asOf: Date = new Date()): AgingBucket {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const daysOverdue = differenceInDays(asOf, due);
  if (daysOverdue <= 0) return "current";
  if (daysOverdue <= 30) return "current"; // 1-30 days = current bucket per CONTEXT
  if (daysOverdue <= 60) return "30day";
  if (daysOverdue <= 90) return "60day";
  return "90plus";
}

// Wait -- CONTEXT says: current (0-30 days), 30-day (31-60), 60-day (61-90), 90+ day
// So "current" means 0-30 days past due, NOT "not yet due"
// Invoices not yet due are simply "not overdue" and don't appear in aging

export function getAgingBucketCorrected(dueDate: string | Date, asOf: Date = new Date()): AgingBucket | null {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const daysOverdue = differenceInDays(asOf, due);
  if (daysOverdue <= 0) return null; // not overdue
  if (daysOverdue <= 30) return "current";
  if (daysOverdue <= 60) return "30day";
  if (daysOverdue <= 90) return "60day";
  return "90plus";
}

export const agingColors: Record<AgingBucket, string> = {
  current: "text-green-600",
  "30day": "text-yellow-600", // harbor-gold
  "60day": "text-orange-500",
  "90plus": "text-red-600",
};

export const agingLabels: Record<AgingBucket, string> = {
  current: "Current (1-30 days)",
  "30day": "30 Day (31-60)",
  "60day": "60 Day (61-90)",
  "90plus": "90+ Days",
};
```

### Invoice Status Badge

```typescript
// src/components/invoices/status-badge.tsx
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-200" },
  sent: { label: "Sent", className: "bg-blue-100 text-blue-700 border-blue-200" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700 border-green-200" },
  partial: { label: "Partial", className: "bg-amber-100 text-amber-700 border-amber-200" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700 border-red-200" },
  collections: { label: "Collections", className: "bg-red-200 text-red-900 border-red-300" },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
```

### Customer Balance Aggregation Query

```typescript
// src/lib/dal/customers.ts
import { db } from "@/lib/db";
import { customers, invoices, payments } from "@/lib/db/schema";
import { eq, sql, and, ne, inArray } from "drizzle-orm";

export async function getCustomerBalance(customerId: string) {
  const result = await db
    .select({
      totalCharged: sql<number>`COALESCE(SUM(${invoices.totalCents}), 0)`,
      totalPaid: sql<number>`COALESCE(SUM(
        (SELECT COALESCE(SUM(${payments.amountCents}), 0)
         FROM ${payments} WHERE ${payments.invoiceId} = ${invoices.id})
      ), 0)`,
      overdueAmount: sql<number>`COALESCE(SUM(
        CASE WHEN ${invoices.dueDate} < CURRENT_DATE
             AND ${invoices.status} NOT IN ('draft', 'paid')
        THEN ${invoices.totalCents} - COALESCE(
          (SELECT SUM(${payments.amountCents}) FROM ${payments} WHERE ${payments.invoiceId} = ${invoices.id}), 0
        ) ELSE 0 END
      ), 0)`,
    })
    .from(invoices)
    .where(and(
      eq(invoices.customerId, customerId),
      ne(invoices.status, "draft"),
    ));

  const row = result[0];
  return {
    totalCharged: row?.totalCharged ?? 0,
    totalPaid: row?.totalPaid ?? 0,
    currentBalance: (row?.totalCharged ?? 0) - (row?.totalPaid ?? 0),
    overdueAmount: row?.overdueAmount ?? 0,
  };
}
```

### Recurring Invoice Generation

```typescript
// src/lib/dal/recurring.ts
import { addMonths, addYears } from "date-fns";

function advanceDate(date: string, frequency: "monthly" | "quarterly" | "annual"): string {
  const d = new Date(date);
  switch (frequency) {
    case "monthly": return format(addMonths(d, 1), "yyyy-MM-dd");
    case "quarterly": return format(addMonths(d, 3), "yyyy-MM-dd");
    case "annual": return format(addYears(d, 1), "yyyy-MM-dd");
  }
}
```

### Next Invoice Number

```typescript
// src/lib/dal/invoices.ts
export async function getNextInvoiceNumber(): Promise<string> {
  const result = await db
    .select({ maxNum: sql<string>`MAX(${invoices.invoiceNumber})` })
    .from(invoices);

  const current = result[0]?.maxNum;
  if (!current) return "INV-00001";

  const num = parseInt(current.replace("INV-", ""), 10);
  return `INV-${String(num + 1).padStart(5, "0")}`;
}
```

## Sidebar Navigation Update

The sidebar currently has: Dashboard, Invoices, Payments, Customers, Reports, Settings.

Phase 2 needs to add: **Recurring** and **Collections** to the navigation. These should be added to the `allNavItems` array in `sidebar-client.tsx`:

```typescript
// Add to allNavItems in sidebar-client.tsx
import { RefreshCw, AlertTriangle } from "lucide-react";

{ label: "Recurring", href: "/recurring", icon: <RefreshCw size={20} strokeWidth={1.5} />, group: "main" },
{ label: "Collections", href: "/collections", icon: <AlertTriangle size={20} strokeWidth={1.5} />, group: "main" },
```

## State of the Art

| Concern | Approach for This Project | Why |
|---------|--------------------------|-----|
| Server actions form state | `useActionState` (React 19) | Replaces deprecated `useFormState`. Works with `(prevState, formData)` signature already established in auth. |
| Data revalidation | `revalidatePath()` after mutations | Simple, reliable. No need for `revalidateTag` at demo scale. |
| URL-based filtering | `searchParams` in server components | Next.js 15 App Router pattern. Shareable URLs. |
| Money handling | Integer cents everywhere | Established in schema. `formatCurrency` utility exists. |
| Form data to server | `FormData` with JSON string in hidden field | Complex forms (line items) don't map cleanly to flat FormData. Serialize as JSON. |

## Open Questions

1. **Neon HTTP driver + transactions**
   - What we know: The HTTP driver cannot do transactions. Invoice + line items insertion is two separate INSERT statements.
   - What's unclear: Whether a line items INSERT failure after invoice INSERT leaves orphan data.
   - Recommendation: Accept the risk for a demo. Add error handling. An empty invoice is recoverable (delete it). If needed, use SQL CTEs to combine into a single statement.

2. **Customer selector performance**
   - What we know: 25 demo customers, so a simple select dropdown works fine.
   - What's unclear: Whether shadcn Select supports search/autocomplete out of the box.
   - Recommendation: Use a simple Select for 25 customers. If search is needed, use shadcn Combobox (popover + command).

3. **Tax rate storage**
   - What we know: Schema uses `real` for `taxRate` which is a float. This is acceptable since tax rate is a percentage (0.085), not a monetary value. The result of `Math.round(subtotalCents * taxRate)` is always rounded to integer cents.
   - Recommendation: Keep as-is. The float precision issue only matters for stored monetary values, not for a rate multiplier.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CUST-01 | Create customer with all fields | manual | Build and verify form submission | N/A |
| INV-01 | Create multi-revenue invoice | manual | Build and verify | N/A |
| INV-03 | Auto-calculate totals | manual | Verify subtotal + tax = total in UI | N/A |
| INV-07 | Status auto-update from payments | manual | Record payment, check status change | N/A |
| PAY-02 | Partial payments | manual | Record partial, verify balance and status | N/A |
| PAY-05 | Balance auto-update | manual | Record payment, verify invoice balance | N/A |
| COLL-01 | Aging categorization | manual | Check overdue invoices appear in correct buckets | N/A |
| REC-02 | Generate from template | manual | Create template, generate, verify invoice created | N/A |

### Sampling Rate
- **Per task commit:** Manual verification of CRUD operations
- **Per wave merge:** Full walkthrough of all flows
- **Phase gate:** Complete flow test: create customer -> create invoice -> record payment -> verify status

### Wave 0 Gaps
- No test framework installed -- testing is manual for this demo project
- Validation relies on build success (`next build`) and manual UI verification

## Sources

### Primary (HIGH confidence)
- `src/lib/db/schema.ts` -- Existing schema definitions, verified by reading source
- `src/lib/auth/session.ts` -- Session pattern, verified by reading source
- `src/lib/auth/actions.ts` -- Server action pattern with `useActionState`, verified
- `src/lib/formatting.ts` -- Currency formatting utility, verified
- `src/components/layout/sidebar-client.tsx` -- Navigation structure, verified
- `package.json` -- All installed dependencies and versions, verified

### Secondary (MEDIUM confidence)
- `.planning/research/PITFALLS.md` -- Money handling, aging, partial payments pitfalls
- `.planning/research/ARCHITECTURE.md` -- DAL pattern, route structure, data flow
- `.planning/research/STACK.md` -- Library versions and rationale
- Drizzle ORM neon-http driver transaction limitation -- based on training data, consistent with known Neon HTTP behavior

### Tertiary (LOW confidence)
- shadcn Combobox availability for customer selector search -- needs verification during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in Phase 1
- Architecture: HIGH -- patterns established in Phase 1 (server actions, route groups, session management)
- Schema gaps: HIGH -- identified by comparing schema.ts against CONTEXT.md requirements
- Pitfalls: MEDIUM -- transaction limitation based on training data knowledge of Neon HTTP driver
- Code examples: MEDIUM -- patterns are standard but exact Drizzle API details should be verified

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable domain, no fast-moving dependencies)
