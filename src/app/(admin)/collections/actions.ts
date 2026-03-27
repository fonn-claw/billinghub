"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { customers, invoices, collectionNotes } from "@/lib/db/schema";
import { eq, and, sql, inArray, lt, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { collectionNoteSchema } from "@/lib/utils/validation";
import { format } from "date-fns";

export type ActionState = {
  success?: boolean;
  error?: string;
} | null;

export async function toggleCollectionsFlag(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return;
  }

  const customerId = formData.get("customerId") as string;
  if (!customerId) return;

  // Get current flag status
  const [customer] = await db
    .select({ isCollectionsFlagged: customers.isCollectionsFlagged })
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customer) return;

  const newFlag = !customer.isCollectionsFlagged;

  await db
    .update(customers)
    .set({ isCollectionsFlagged: newFlag })
    .where(eq(customers.id, customerId));

  // If flagging ON, update overdue invoices to 'collections' status
  if (newFlag) {
    await db
      .update(invoices)
      .set({ status: "collections" })
      .where(
        and(
          eq(invoices.customerId, customerId),
          lt(invoices.dueDate, sql`current_date`),
          sql`${invoices.status} not in ('draft', 'paid')`
        )
      );
  }

  revalidatePath("/collections");
  revalidatePath(`/customers/${customerId}`);
}

export async function bulkFlag(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return;
  }

  const raw = formData.get("customerIds") as string;
  if (!raw) return;

  let customerIds: string[];
  try {
    customerIds = JSON.parse(raw);
  } catch {
    return;
  }

  if (!Array.isArray(customerIds) || customerIds.length === 0) return;

  await db
    .update(customers)
    .set({ isCollectionsFlagged: true })
    .where(inArray(customers.id, customerIds));

  // Update overdue invoices for all flagged customers
  for (const customerId of customerIds) {
    await db
      .update(invoices)
      .set({ status: "collections" })
      .where(
        and(
          eq(invoices.customerId, customerId),
          lt(invoices.dueDate, sql`current_date`),
          sql`${invoices.status} not in ('draft', 'paid')`
        )
      );
  }

  revalidatePath("/collections");
}

export async function addCollectionNote(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const raw = formData.get("data") as string;
  if (!raw) return { error: "Invalid form data" };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid form data" };
  }

  const result = collectionNoteSchema.safeParse(parsed);
  if (!result.success) {
    return { error: "Validation failed" };
  }

  const data = result.data;

  // If promise_to_pay, require promisedDate and promisedAmountCents
  if (data.noteType === "promise_to_pay") {
    if (!data.promisedDate || !data.promisedAmountCents) {
      return { error: "Promise to pay requires a date and amount" };
    }
  }

  await db.insert(collectionNotes).values({
    customerId: data.customerId,
    noteType: data.noteType,
    note: data.note.trim(),
    promisedDate: data.promisedDate || null,
    promisedAmountCents: data.promisedAmountCents ?? null,
    createdBy: session.userId,
  });

  revalidatePath("/collections");
  revalidatePath(`/customers/${data.customerId}`);
  return { success: true };
}

export async function updateReminderDate(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return;
  }

  const customerId = formData.get("customerId") as string;
  if (!customerId) return;

  await db
    .update(customers)
    .set({ lastReminderDate: format(new Date(), "yyyy-MM-dd") })
    .where(eq(customers.id, customerId));

  revalidatePath("/collections");
  revalidatePath(`/customers/${customerId}`);
}
