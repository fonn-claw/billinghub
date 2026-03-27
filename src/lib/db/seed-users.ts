import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { users } from "./schema";

async function seedUsers() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const passwordHash = await bcrypt.hash("demo1234", 10);

  // Delete existing demo users first
  const { eq } = await import("drizzle-orm");
  await db.delete(users).where(eq(users.email, "manager@billinghub.app"));
  await db.delete(users).where(eq(users.email, "billing@billinghub.app"));
  await db.delete(users).where(eq(users.email, "boater@billinghub.app"));

  const inserted = await db.insert(users).values([
    { email: "manager@billinghub.app", passwordHash, name: "Harbor Master", role: "manager" as const },
    { email: "billing@billinghub.app", passwordHash, name: "Sarah Mitchell", role: "billing_clerk" as const },
    { email: "boater@billinghub.app", passwordHash, name: "James Cooper", role: "customer" as const },
  ]).returning();

  console.log("Seeded demo users:");
  for (const user of inserted) {
    console.log(`  - ${user.email} (${user.role})`);
  }
}

seedUsers().catch(console.error).then(() => process.exit(0));
