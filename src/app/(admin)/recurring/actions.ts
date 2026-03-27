"use server";

import { db } from "@/lib/db";
import { recurringTemplates, invoices, lineItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createRecurringTemplateSchema } from "@/lib/utils/validation";
import { getNextInvoiceNumber } from "@/lib/utils/invoice-number";
import { getTemplate, getDueTemplates, type TemplateLineItem } from "@/lib/dal/recurring";
import { addMonths, addYears, format } from "date-fns";

export type RecurringActionState = {
  error?: string;
  success?: boolean;
  invoiceId?: string;
  count?: number;
};

export async function createTemplate(
  _prevState: RecurringActionState | null,
  formData: FormData
): Promise<RecurringActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const raw = formData.get("data");
  if (typeof raw !== "string") {
    return { error: "Invalid form data" };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON data" };
  }

  const result = createRecurringTemplateSchema.safeParse(parsed);
  if (!result.success) {
    return {
      error: result.error.issues
        .map((e: { message: string }) => e.message)
        .join(", "),
    };
  }

  const data = result.data;

  await db.insert(recurringTemplates).values({
    customerId: data.customerId,
    name: data.name,
    frequency: data.frequency,
    nextInvoiceDate: data.nextInvoiceDate,
    lineItems: data.items.map((item) => ({
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    })),
  });

  revalidatePath("/recurring");
  redirect("/recurring");
}

export async function toggleTemplate(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return;
  }

  const templateId = formData.get("templateId");
  if (typeof templateId !== "string") return;

  const existing = await db
    .select({ active: recurringTemplates.active })
    .from(recurringTemplates)
    .where(eq(recurringTemplates.id, templateId))
    .limit(1);

  if (existing.length === 0) return;

  await db
    .update(recurringTemplates)
    .set({ active: !existing[0].active })
    .where(eq(recurringTemplates.id, templateId));

  revalidatePath("/recurring");
}

function advanceDate(dateStr: string, frequency: string): string {
  const d = new Date(dateStr + "T00:00:00");
  switch (frequency) {
    case "monthly":
      return format(addMonths(d, 1), "yyyy-MM-dd");
    case "quarterly":
      return format(addMonths(d, 3), "yyyy-MM-dd");
    case "annual":
      return format(addYears(d, 1), "yyyy-MM-dd");
    default:
      return format(addMonths(d, 1), "yyyy-MM-dd");
  }
}

async function generateInvoiceFromTemplate(
  templateId: string
): Promise<{ invoiceId: string } | { error: string }> {
  const template = await getTemplate(templateId);
  if (!template) return { error: "Template not found" };

  const items = template.lineItems as TemplateLineItem[];
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0
  );
  const taxRate = 0.085;
  const taxAmountCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxAmountCents;

  const invoiceNumber = await getNextInvoiceNumber();
  const issueDate = template.nextInvoiceDate;
  const dueDateObj = new Date(issueDate + "T00:00:00");
  dueDateObj.setDate(dueDateObj.getDate() + 30);
  const dueDate = format(dueDateObj, "yyyy-MM-dd");

  const [invoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      customerId: template.customerId,
      status: "draft",
      issueDate,
      dueDate,
      subtotalCents,
      taxRate,
      taxAmountCents,
      totalCents,
      recurringTemplateId: templateId,
    })
    .returning({ id: invoices.id });

  await db.insert(lineItems).values(
    items.map((item) => ({
      invoiceId: invoice.id,
      category: item.category as "slip_rental" | "fuel" | "maintenance" | "amenity" | "service" | "other",
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      amountCents: item.quantity * item.unitPriceCents,
    }))
  );

  // Advance nextInvoiceDate
  const nextDate = advanceDate(template.nextInvoiceDate, template.frequency);
  await db
    .update(recurringTemplates)
    .set({ nextInvoiceDate: nextDate })
    .where(eq(recurringTemplates.id, templateId));

  return { invoiceId: invoice.id };
}

export async function generateInvoice(
  _prevState: RecurringActionState | null,
  formData: FormData
): Promise<RecurringActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const templateId = formData.get("templateId");
  if (typeof templateId !== "string") {
    return { error: "Missing template ID" };
  }

  const result = await generateInvoiceFromTemplate(templateId);
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/recurring");
  revalidatePath("/invoices");

  return { success: true, invoiceId: result.invoiceId };
}

export async function bulkGenerate(
  _prevState: RecurringActionState | null,
  _formData: FormData
): Promise<RecurringActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const dueTemplates = await getDueTemplates();
  let count = 0;

  for (const template of dueTemplates) {
    const result = await generateInvoiceFromTemplate(template.id);
    if (!("error" in result)) {
      count++;
    }
  }

  revalidatePath("/recurring");
  revalidatePath("/invoices");

  return { success: true, count };
}
