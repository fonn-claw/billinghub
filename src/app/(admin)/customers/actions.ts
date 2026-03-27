"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { customers, customerNotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { createCustomerSchema } from "@/lib/utils/validation";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  customerId?: string;
} | null;

export async function createCustomer(
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

  const result = createCustomerSchema.safeParse(parsed);
  if (!result.success) {
    return {
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = result.data;

  const [customer] = await db
    .insert(customers)
    .values({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      vesselName: data.vesselName || null,
      vesselType: data.vesselType || null,
      vesselLength: data.vesselLength ?? null,
      dock: data.dock || null,
      slipNumber: data.slipNumber || null,
      notes: data.notes || null,
    })
    .returning({ id: customers.id });

  revalidatePath("/customers");
  return { success: true, customerId: customer.id };
}

export async function updateCustomer(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session.userId || !["manager", "billing_clerk"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const customerId = formData.get("customerId") as string;
  if (!customerId) return { error: "Customer ID required" };

  const raw = formData.get("data") as string;
  if (!raw) return { error: "Invalid form data" };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid form data" };
  }

  const result = createCustomerSchema.safeParse(parsed);
  if (!result.success) {
    return {
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = result.data;

  await db
    .update(customers)
    .set({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      vesselName: data.vesselName || null,
      vesselType: data.vesselType || null,
      vesselLength: data.vesselLength ?? null,
      dock: data.dock || null,
      slipNumber: data.slipNumber || null,
      notes: data.notes || null,
    })
    .where(eq(customers.id, customerId));

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true, customerId };
}

export async function addCustomerNote(
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

  const { customerId, note } = parsed as { customerId: string; note: string };
  if (!customerId || !note?.trim()) {
    return { error: "Customer ID and note are required" };
  }

  await db.insert(customerNotes).values({
    customerId,
    note: note.trim(),
    createdBy: session.userId,
  });

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
