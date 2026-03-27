import { db } from "@/lib/db";
import { customers, invoices, payments, collectionNotes, users } from "@/lib/db/schema";
import { eq, and, sql, ne, lt, inArray } from "drizzle-orm";
import { getAgingBucket, type AgingBucket } from "@/lib/utils/aging";

export interface CollectionRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  dock: string | null;
  slipNumber: string | null;
  totalOverdueCents: number;
  maxDaysOverdue: number;
  lastReminderDate: string | null;
  lastNoteDate: Date | null;
  lastNotePreview: string | null;
  agingBucket: AgingBucket | null;
}

export interface OverdueCustomerRow {
  id: string;
  name: string;
  totalOverdueCents: number;
  maxDaysOverdue: number;
}

export interface CollectionNoteRow {
  id: string;
  note: string;
  noteType: string;
  promisedDate: string | null;
  promisedAmountCents: number | null;
  createdByName: string | null;
  createdAt: Date;
}

export async function getCollections(): Promise<CollectionRow[]> {
  const flaggedCustomers = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      dock: customers.dock,
      slipNumber: customers.slipNumber,
      lastReminderDate: customers.lastReminderDate,
      totalOverdueCents: sql<number>`coalesce((
        select sum(i.total_cents) - coalesce((
          select sum(p.amount_cents) from payments p
          join invoices i2 on i2.id = p.invoice_id
          where i2.customer_id = customers.id
            and i2.due_date < current_date
            and i2.status not in ('draft', 'paid')
        ), 0)
        from invoices i
        where i.customer_id = customers.id
          and i.due_date < current_date
          and i.status not in ('draft', 'paid')
      ), 0)`.as("total_overdue_cents"),
      maxDaysOverdue: sql<number>`coalesce((
        select max(current_date - i.due_date::date)
        from invoices i
        where i.customer_id = customers.id
          and i.due_date < current_date
          and i.status not in ('draft', 'paid')
      ), 0)`.as("max_days_overdue"),
      lastNoteDate: sql<Date | null>`(
        select max(cn.created_at)
        from collection_notes cn
        where cn.customer_id = customers.id
      )`.as("last_note_date"),
      lastNotePreview: sql<string | null>`(
        select left(cn.note, 80)
        from collection_notes cn
        where cn.customer_id = customers.id
        order by cn.created_at desc
        limit 1
      )`.as("last_note_preview"),
    })
    .from(customers)
    .where(eq(customers.isCollectionsFlagged, true))
    .orderBy(sql`total_overdue_cents desc`);

  return flaggedCustomers.map((c) => ({
    ...c,
    totalOverdueCents: Number(c.totalOverdueCents),
    maxDaysOverdue: Number(c.maxDaysOverdue),
    agingBucket: c.maxDaysOverdue > 0
      ? getAgingBucket(
          new Date(Date.now() - Number(c.maxDaysOverdue) * 86400000),
          new Date()
        )
      : null,
  }));
}

export async function getOverdueCustomers(): Promise<OverdueCustomerRow[]> {
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      totalOverdueCents: sql<number>`coalesce((
        select sum(i.total_cents) - coalesce((
          select sum(p.amount_cents) from payments p
          join invoices i2 on i2.id = p.invoice_id
          where i2.customer_id = customers.id
            and i2.due_date < current_date
            and i2.status not in ('draft', 'paid')
        ), 0)
        from invoices i
        where i.customer_id = customers.id
          and i.due_date < current_date
          and i.status not in ('draft', 'paid')
      ), 0)`.as("total_overdue_cents"),
      maxDaysOverdue: sql<number>`coalesce((
        select max(current_date - i.due_date::date)
        from invoices i
        where i.customer_id = customers.id
          and i.due_date < current_date
          and i.status not in ('draft', 'paid')
      ), 0)`.as("max_days_overdue"),
    })
    .from(customers)
    .where(eq(customers.isCollectionsFlagged, false))
    .orderBy(sql`total_overdue_cents desc`);

  return rows
    .filter((r) => Number(r.totalOverdueCents) > 0)
    .map((r) => ({
      ...r,
      totalOverdueCents: Number(r.totalOverdueCents),
      maxDaysOverdue: Number(r.maxDaysOverdue),
    }));
}

export async function getCollectionNotes(customerId: string): Promise<CollectionNoteRow[]> {
  const notes = await db
    .select({
      id: collectionNotes.id,
      note: collectionNotes.note,
      noteType: collectionNotes.noteType,
      promisedDate: collectionNotes.promisedDate,
      promisedAmountCents: collectionNotes.promisedAmountCents,
      createdByName: users.name,
      createdAt: collectionNotes.createdAt,
    })
    .from(collectionNotes)
    .leftJoin(users, eq(collectionNotes.createdBy, users.id))
    .where(eq(collectionNotes.customerId, customerId))
    .orderBy(sql`${collectionNotes.createdAt} desc`);

  return notes;
}
