import { db } from "@/lib/db";
import { customers, customerNotes, invoices, payments, users } from "@/lib/db/schema";
import { eq, ilike, or, sql, and, ne, lt } from "drizzle-orm";

export async function getCustomers(search?: string, dock?: string) {
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.email, `%${search}%`)
      )
    );
  }
  if (dock) {
    conditions.push(eq(customers.dock, dock));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      dock: customers.dock,
      slipNumber: customers.slipNumber,
      vesselName: customers.vesselName,
      isCollectionsFlagged: customers.isCollectionsFlagged,
      outstandingBalance: sql<number>`
        coalesce((
          select sum(i.total_cents) from invoices i
          where i.customer_id = ${customers.id} and i.status != 'draft'
        ), 0) -
        coalesce((
          select sum(p.amount_cents) from payments p
          join invoices i on i.id = p.invoice_id
          where i.customer_id = ${customers.id}
        ), 0)
      `.as("outstanding_balance"),
    })
    .from(customers)
    .where(where)
    .orderBy(customers.name);

  return rows;
}

export async function getCustomer(id: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return customer ?? null;
}

export async function getCustomerBalance(customerId: string) {
  const [result] = await db
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

  const totalCharged = Number(result?.totalCharged ?? 0);
  const totalPaid = Number(result?.totalPaid ?? 0);

  // Calculate overdue amount
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
        lt(invoices.dueDate, sql`current_date`)
      )
    );

  const overdueTotal = Number(overdueResult?.overdueTotal ?? 0);
  const overduePaid = Number(overdueResult?.overduePaid ?? 0);

  return {
    totalCharged,
    totalPaid,
    currentBalance: totalCharged - totalPaid,
    overdueAmount: overdueTotal - overduePaid,
  };
}

export async function getCustomerNotes(customerId: string) {
  const notes = await db
    .select({
      id: customerNotes.id,
      note: customerNotes.note,
      createdAt: customerNotes.createdAt,
      createdByName: users.name,
    })
    .from(customerNotes)
    .leftJoin(users, eq(customerNotes.createdBy, users.id))
    .where(eq(customerNotes.customerId, customerId))
    .orderBy(sql`${customerNotes.createdAt} desc`);

  return notes;
}

export async function getCustomerInvoices(customerId: string) {
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      totalCents: invoices.totalCents,
      paidCents: sql<number>`coalesce((
        select sum(p.amount_cents) from payments p where p.invoice_id = ${invoices.id}
      ), 0)`,
    })
    .from(invoices)
    .where(eq(invoices.customerId, customerId))
    .orderBy(sql`${invoices.issueDate} desc`);

  return rows.map((row) => ({
    ...row,
    paidCents: Number(row.paidCents),
    balanceCents: Number(row.totalCents) - Number(row.paidCents),
  }));
}

export async function getCustomerPayments(customerId: string) {
  const rows = await db
    .select({
      id: payments.id,
      amountCents: payments.amountCents,
      method: payments.method,
      reference: payments.reference,
      paymentDate: payments.paymentDate,
      invoiceNumber: invoices.invoiceNumber,
      invoiceId: invoices.id,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .where(eq(invoices.customerId, customerId))
    .orderBy(sql`${payments.paymentDate} desc`);

  return rows;
}
