import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function getNextInvoiceNumber(): Promise<string> {
  const result = await db
    .select({ maxNum: sql<string>`MAX(${invoices.invoiceNumber})` })
    .from(invoices);
  const current = result[0]?.maxNum;
  if (!current) return "INV-00001";
  const num = parseInt(current.replace("INV-", ""), 10);
  return `INV-${String(num + 1).padStart(5, "0")}`;
}
