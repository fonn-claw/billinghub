import { db } from "@/lib/db";
import { invoices, lineItems, payments, customers } from "@/lib/db/schema";
import { eq, sql, ilike, or, desc } from "drizzle-orm";
import { getAgingBucket, type AgingBucket } from "@/lib/utils/aging";

export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  status: string;
  agingBucket: AgingBucket | null;
};

export type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotalCents: number;
  taxRate: number;
  taxAmountCents: number;
  totalCents: number;
  notes: string | null;
  createdAt: Date;
  lineItems: {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    amountCents: number;
  }[];
  payments: {
    id: string;
    amountCents: number;
    method: string;
    reference: string | null;
    paymentDate: string;
    notes: string | null;
    createdAt: Date;
  }[];
  paidCents: number;
  balanceCents: number;
  computedStatus: string;
  agingBucket: AgingBucket | null;
};

export function computeInvoiceStatus(
  currentStatus: string,
  totalCents: number,
  paidCents: number,
  dueDate: string,
  today: Date = new Date()
): string {
  if (currentStatus === "draft") return "draft";
  if (currentStatus === "collections") return "collections";
  if (paidCents >= totalCents) return "paid";
  if (paidCents > 0) return "partial";
  if (new Date(dueDate) < today) return "overdue";
  return "sent";
}

export async function getInvoices(
  status?: string,
  search?: string
): Promise<InvoiceRow[]> {
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerName: customers.name,
      customerId: invoices.customerId,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      totalCents: invoices.totalCents,
      dbStatus: invoices.status,
      paidCents: sql<number>`COALESCE(SUM(${payments.amountCents}), 0)`.as(
        "paid_cents"
      ),
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(payments, eq(invoices.id, payments.invoiceId))
    .where(
      search
        ? or(
            ilike(invoices.invoiceNumber, `%${search}%`),
            ilike(customers.name, `%${search}%`)
          )
        : undefined
    )
    .groupBy(
      invoices.id,
      invoices.invoiceNumber,
      customers.name,
      invoices.customerId,
      invoices.issueDate,
      invoices.dueDate,
      invoices.totalCents,
      invoices.status
    )
    .orderBy(desc(invoices.issueDate));

  const results: InvoiceRow[] = rows.map((row) => {
    const paidCents = Number(row.paidCents);
    const effectiveStatus = computeInvoiceStatus(
      row.dbStatus,
      row.totalCents,
      paidCents,
      row.dueDate
    );
    return {
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      customerName: row.customerName ?? "Unknown",
      customerId: row.customerId,
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      totalCents: row.totalCents,
      paidCents,
      balanceCents: row.totalCents - paidCents,
      status: effectiveStatus,
      agingBucket:
        effectiveStatus !== "draft" && effectiveStatus !== "paid"
          ? getAgingBucket(row.dueDate)
          : null,
    };
  });

  if (status) {
    return results.filter((r) => r.status === status);
  }

  return results;
}

export async function getInvoiceWithDetails(
  id: string
): Promise<InvoiceDetail | null> {
  const invoiceRows = await db
    .select()
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.id, id))
    .limit(1);

  if (invoiceRows.length === 0) return null;

  const row = invoiceRows[0];
  const inv = row.invoices;
  const cust = row.customers;

  const items = await db
    .select()
    .from(lineItems)
    .where(eq(lineItems.invoiceId, id));

  const paymentRows = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, id))
    .orderBy(desc(payments.paymentDate));

  const paidCents = paymentRows.reduce((sum, p) => sum + p.amountCents, 0);
  const computedStatus = computeInvoiceStatus(
    inv.status,
    inv.totalCents,
    paidCents,
    inv.dueDate
  );

  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerId: inv.customerId,
    customerName: cust?.name ?? "Unknown",
    customerEmail: cust?.email ?? null,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    subtotalCents: inv.subtotalCents,
    taxRate: inv.taxRate,
    taxAmountCents: inv.taxAmountCents,
    totalCents: inv.totalCents,
    notes: inv.notes,
    createdAt: inv.createdAt,
    lineItems: items.map((item) => ({
      id: item.id,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      amountCents: item.amountCents,
    })),
    payments: paymentRows.map((p) => ({
      id: p.id,
      amountCents: p.amountCents,
      method: p.method,
      reference: p.reference,
      paymentDate: p.paymentDate,
      notes: p.notes,
      createdAt: p.createdAt,
    })),
    paidCents,
    balanceCents: inv.totalCents - paidCents,
    computedStatus,
    agingBucket:
      computedStatus !== "draft" && computedStatus !== "paid"
        ? getAgingBucket(inv.dueDate)
        : null,
  };
}

export async function getCustomerSelectList(): Promise<
  { id: string; name: string; dock: string | null; slipNumber: string | null }[]
> {
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      dock: customers.dock,
      slipNumber: customers.slipNumber,
    })
    .from(customers)
    .orderBy(customers.name);

  return rows;
}
