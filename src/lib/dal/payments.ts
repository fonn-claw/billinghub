import { db } from "@/lib/db";
import { payments, invoices, customers } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export type PaymentRow = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  amountCents: number;
  method: string;
  reference: string | null;
  paymentDate: string;
  notes: string | null;
};

export async function getPayments(method?: string): Promise<PaymentRow[]> {
  const rows = await db
    .select({
      id: payments.id,
      invoiceId: payments.invoiceId,
      invoiceNumber: invoices.invoiceNumber,
      customerName: customers.name,
      customerId: invoices.customerId,
      amountCents: payments.amountCents,
      method: payments.method,
      reference: payments.reference,
      paymentDate: payments.paymentDate,
      notes: payments.notes,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .orderBy(desc(payments.paymentDate));

  const filtered = method
    ? rows.filter((r) => r.method === method)
    : rows;

  return filtered;
}

export type InvoicePaymentRow = {
  id: string;
  amountCents: number;
  method: string;
  reference: string | null;
  paymentDate: string;
  notes: string | null;
  runningBalance: number;
};

export async function getInvoicePayments(
  invoiceId: string
): Promise<InvoicePaymentRow[]> {
  const invoice = await db
    .select({ totalCents: invoices.totalCents })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (invoice.length === 0) return [];

  const totalCents = invoice[0].totalCents;

  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(payments.paymentDate);

  let cumulativePaid = 0;
  return rows.map((row) => {
    cumulativePaid += row.amountCents;
    return {
      id: row.id,
      amountCents: row.amountCents,
      method: row.method,
      reference: row.reference,
      paymentDate: row.paymentDate,
      notes: row.notes,
      runningBalance: totalCents - cumulativePaid,
    };
  });
}
