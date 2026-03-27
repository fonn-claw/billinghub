"use server";

import { db } from "@/lib/db";
import { payments, invoices } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { recordPaymentSchema } from "@/lib/utils/validation";
import { computeInvoiceStatus } from "@/lib/dal/invoices";

export type PaymentActionState = {
  error?: string;
  success?: boolean;
};

export async function recordPayment(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
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

  const result = recordPaymentSchema.safeParse(parsed);
  if (!result.success) {
    return {
      error: result.error.issues
        .map((e: { message: string }) => e.message)
        .join(", "),
    };
  }

  const data = result.data;

  // Get invoice details
  const invoiceRows = await db
    .select({
      id: invoices.id,
      status: invoices.status,
      totalCents: invoices.totalCents,
      dueDate: invoices.dueDate,
      customerId: invoices.customerId,
    })
    .from(invoices)
    .where(eq(invoices.id, data.invoiceId))
    .limit(1);

  if (invoiceRows.length === 0) {
    return { error: "Invoice not found" };
  }

  const invoice = invoiceRows[0];

  if (invoice.status === "draft") {
    return { error: "Cannot record payment on a draft invoice" };
  }

  // Get existing paid amount
  const paidResult = await db
    .select({
      paidCents: sql<number>`COALESCE(SUM(${payments.amountCents}), 0)`,
    })
    .from(payments)
    .where(eq(payments.invoiceId, data.invoiceId));

  const existingPaidCents = Number(paidResult[0]?.paidCents ?? 0);
  const remainingBalance = invoice.totalCents - existingPaidCents;

  if (data.amountCents > remainingBalance) {
    return {
      error: `Payment amount exceeds remaining balance of ${(remainingBalance / 100).toFixed(2)}`,
    };
  }

  // Insert payment
  await db.insert(payments).values({
    invoiceId: data.invoiceId,
    amountCents: data.amountCents,
    method: data.method,
    reference: data.reference || null,
    paymentDate: data.paymentDate,
    notes: data.notes || null,
  });

  // Compute and update invoice status
  const newPaidCents = existingPaidCents + data.amountCents;
  const newStatus = computeInvoiceStatus(
    invoice.status,
    invoice.totalCents,
    newPaidCents,
    invoice.dueDate
  );

  await db
    .update(invoices)
    .set({ status: newStatus as "draft" | "sent" | "paid" | "partial" | "overdue" | "collections" })
    .where(eq(invoices.id, data.invoiceId));

  revalidatePath("/payments");
  revalidatePath(`/invoices/${data.invoiceId}`);
  revalidatePath(`/customers/${invoice.customerId}`);

  return { success: true };
}
