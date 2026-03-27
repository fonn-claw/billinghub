"use server";

import { db } from "@/lib/db";
import { invoices, lineItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createInvoiceSchema } from "@/lib/utils/validation";
import { getNextInvoiceNumber } from "@/lib/utils/invoice-number";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createInvoice(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
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

  const result = createInvoiceSchema.safeParse(parsed);
  if (!result.success) {
    return { error: result.error.issues.map((e: { message: string }) => e.message).join(", ") };
  }

  const data = result.data;
  const subtotalCents = data.items.reduce(
    (sum: number, item: { quantity: number; unitPriceCents: number }) => sum + item.quantity * item.unitPriceCents,
    0
  );
  const taxAmountCents = Math.round(subtotalCents * data.taxRate);
  const totalCents = subtotalCents + taxAmountCents;
  const invoiceNumber = await getNextInvoiceNumber();

  const [invoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      customerId: data.customerId,
      status: "draft",
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotalCents,
      taxRate: data.taxRate,
      taxAmountCents,
      totalCents,
      notes: data.notes || null,
    })
    .returning({ id: invoices.id });

  await db.insert(lineItems).values(
    data.items.map((item) => ({
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

export async function updateInvoice(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const invoiceId = formData.get("invoiceId");
  if (typeof invoiceId !== "string") {
    return { error: "Missing invoice ID" };
  }

  const existing = await db
    .select({ status: invoices.status, customerId: invoices.customerId })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (existing.length === 0) {
    return { error: "Invoice not found" };
  }

  if (existing[0].status !== "draft") {
    return { error: "Only draft invoices can be edited" };
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

  const result = createInvoiceSchema.safeParse(parsed);
  if (!result.success) {
    return { error: result.error.issues.map((e: { message: string }) => e.message).join(", ") };
  }

  const data = result.data;
  const subtotalCents = data.items.reduce(
    (sum: number, item: { quantity: number; unitPriceCents: number }) => sum + item.quantity * item.unitPriceCents,
    0
  );
  const taxAmountCents = Math.round(subtotalCents * data.taxRate);
  const totalCents = subtotalCents + taxAmountCents;

  await db
    .update(invoices)
    .set({
      customerId: data.customerId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotalCents,
      taxRate: data.taxRate,
      taxAmountCents,
      totalCents,
      notes: data.notes || null,
    })
    .where(eq(invoices.id, invoiceId));

  await db.delete(lineItems).where(eq(lineItems.invoiceId, invoiceId));

  await db.insert(lineItems).values(
    data.items.map((item) => ({
      invoiceId,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      amountCents: item.quantity * item.unitPriceCents,
    }))
  );

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/customers/${data.customerId}`);
  redirect(`/invoices/${invoiceId}`);
}

export async function markAsSent(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const invoiceId = formData.get("invoiceId");
  if (typeof invoiceId !== "string") {
    return { error: "Missing invoice ID" };
  }

  const existing = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (existing.length === 0) {
    return { error: "Invoice not found" };
  }

  if (existing[0].status !== "draft") {
    return { error: "Only draft invoices can be marked as sent" };
  }

  await db
    .update(invoices)
    .set({ status: "sent" })
    .where(eq(invoices.id, invoiceId));

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

export async function deleteInvoice(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const invoiceId = formData.get("invoiceId");
  if (typeof invoiceId !== "string") {
    return { error: "Missing invoice ID" };
  }

  const existing = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (existing.length === 0) {
    return { error: "Invoice not found" };
  }

  if (existing[0].status !== "draft") {
    return { error: "Only draft invoices can be deleted" };
  }

  await db.delete(invoices).where(eq(invoices.id, invoiceId));

  revalidatePath("/invoices");
  redirect("/invoices");
}
