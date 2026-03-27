import { db } from "@/lib/db";
import { customers, invoices, payments } from "@/lib/db/schema";
import { eq, sql, and, ne } from "drizzle-orm";

export async function getCustomerByUserId(userId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .limit(1);
  return customer ?? null;
}

export async function getPortalSummary(customerId: string) {
  // Current balance: total charged - total paid
  const [balanceResult] = await db
    .select({
      totalCharged: sql<number>`coalesce(sum(${invoices.totalCents}), 0)`,
      totalPaid: sql<number>`coalesce((
        select sum(p.amount_cents) from payments p
        join invoices i on i.id = p.invoice_id
        where i.customer_id = ${customerId}
      ), 0)`,
    })
    .from(invoices)
    .where(and(eq(invoices.customerId, customerId), ne(invoices.status, "draft")));

  const totalCharged = Number(balanceResult?.totalCharged ?? 0);
  const totalPaid = Number(balanceResult?.totalPaid ?? 0);
  const currentBalance = totalCharged - totalPaid;

  // Overdue amount
  const [overdueResult] = await db
    .select({
      overdueTotal: sql<number>`coalesce(sum(${invoices.totalCents}), 0)`,
      overduePaid: sql<number>`coalesce((
        select sum(p.amount_cents) from payments p
        join invoices i2 on i2.id = p.invoice_id
        where i2.customer_id = ${customerId}
          and i2.due_date < current_date
          and i2.status not in ('draft', 'paid')
      ), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.customerId, customerId),
        sql`${invoices.status} not in ('draft', 'paid')`,
        sql`${invoices.dueDate} < current_date`
      )
    );

  const overdueTotal = Number(overdueResult?.overdueTotal ?? 0);
  const overduePaid = Number(overdueResult?.overduePaid ?? 0);
  const overdueAmount = overdueTotal - overduePaid;

  // Next due date: earliest unpaid non-draft invoice due date >= today
  const [nextDueResult] = await db
    .select({
      nextDueDate: sql<string | null>`min(${invoices.dueDate})`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.customerId, customerId),
        sql`${invoices.status} not in ('draft', 'paid')`,
        sql`${invoices.dueDate} >= current_date`
      )
    );

  // Last payment date
  const [lastPaymentResult] = await db
    .select({
      lastPaymentDate: sql<string | null>`max(${payments.paymentDate})`,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .where(eq(invoices.customerId, customerId));

  // Invoice count (non-draft)
  const [countResult] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(invoices)
    .where(and(eq(invoices.customerId, customerId), ne(invoices.status, "draft")));

  return {
    currentBalance,
    overdueAmount,
    nextDueDate: nextDueResult?.nextDueDate ?? null,
    lastPaymentDate: lastPaymentResult?.lastPaymentDate ?? null,
    invoiceCount: Number(countResult?.count ?? 0),
  };
}
