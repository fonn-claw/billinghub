import { db } from "@/lib/db";
import { recurringTemplates, customers } from "@/lib/db/schema";
import { eq, lte, and } from "drizzle-orm";

export type TemplateLineItem = {
  category: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
};

export type TemplateRow = {
  id: string;
  name: string;
  customerName: string;
  customerId: string;
  frequency: string;
  nextInvoiceDate: string;
  active: boolean;
  lineItems: TemplateLineItem[];
  createdAt: Date;
};

export async function getTemplates(): Promise<TemplateRow[]> {
  const rows = await db
    .select({
      id: recurringTemplates.id,
      name: recurringTemplates.name,
      customerName: customers.name,
      customerId: recurringTemplates.customerId,
      frequency: recurringTemplates.frequency,
      nextInvoiceDate: recurringTemplates.nextInvoiceDate,
      active: recurringTemplates.active,
      lineItems: recurringTemplates.lineItems,
      createdAt: recurringTemplates.createdAt,
    })
    .from(recurringTemplates)
    .innerJoin(customers, eq(recurringTemplates.customerId, customers.id))
    .orderBy(recurringTemplates.name);

  return rows.map((row) => ({
    ...row,
    lineItems: row.lineItems as TemplateLineItem[],
  }));
}

export async function getTemplate(
  id: string
): Promise<TemplateRow | null> {
  const rows = await db
    .select({
      id: recurringTemplates.id,
      name: recurringTemplates.name,
      customerName: customers.name,
      customerId: recurringTemplates.customerId,
      frequency: recurringTemplates.frequency,
      nextInvoiceDate: recurringTemplates.nextInvoiceDate,
      active: recurringTemplates.active,
      lineItems: recurringTemplates.lineItems,
      createdAt: recurringTemplates.createdAt,
    })
    .from(recurringTemplates)
    .innerJoin(customers, eq(recurringTemplates.customerId, customers.id))
    .where(eq(recurringTemplates.id, id))
    .limit(1);

  if (rows.length === 0) return null;

  return {
    ...rows[0],
    lineItems: rows[0].lineItems as TemplateLineItem[],
  };
}

export async function getDueTemplates(): Promise<TemplateRow[]> {
  const today = new Date().toISOString().split("T")[0];

  const rows = await db
    .select({
      id: recurringTemplates.id,
      name: recurringTemplates.name,
      customerName: customers.name,
      customerId: recurringTemplates.customerId,
      frequency: recurringTemplates.frequency,
      nextInvoiceDate: recurringTemplates.nextInvoiceDate,
      active: recurringTemplates.active,
      lineItems: recurringTemplates.lineItems,
      createdAt: recurringTemplates.createdAt,
    })
    .from(recurringTemplates)
    .innerJoin(customers, eq(recurringTemplates.customerId, customers.id))
    .where(
      and(
        eq(recurringTemplates.active, true),
        lte(recurringTemplates.nextInvoiceDate, today)
      )
    )
    .orderBy(recurringTemplates.name);

  return rows.map((row) => ({
    ...row,
    lineItems: row.lineItems as TemplateLineItem[],
  }));
}
