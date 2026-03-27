import { subMonths, subDays, addMonths, addDays, format } from "date-fns";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  customers,
  invoices,
  lineItems,
  payments,
  collectionNotes,
  recurringTemplates,
} from "./schema";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = new Date();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateFmt(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

let invoiceCounter = 0;
function nextInvoiceNumber(): string {
  invoiceCounter += 1;
  return `INV-${String(invoiceCounter).padStart(5, "0")}`;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const CUSTOMER_DATA = [
  { name: "James Cooper", vessel: "Sea Breeze", type: "Sailboat", length: 38, dock: "A", slip: "A01", email: "jcooper@email.com", phone: "555-0101", linkBoater: true },
  { name: "Robert Chen", vessel: "Windward Spirit", type: "Powerboat", length: 42, dock: "A", slip: "A02", email: "rchen@email.com", phone: "555-0102" },
  { name: "Maria Santos", vessel: "Blue Horizon", type: "Catamaran", length: 45, dock: "A", slip: "A03", email: "msantos@email.com", phone: "555-0103" },
  { name: "William Drake", vessel: "Pacific Dream", type: "Yacht", length: 55, dock: "A", slip: "A04", email: "wdrake@email.com", phone: "555-0104" },
  { name: "Elena Vasquez", vessel: "Silver Wake", type: "Sailboat", length: 36, dock: "A", slip: "A05", email: "evasquez@email.com", phone: "555-0105" },
  { name: "Thomas Blackwell", vessel: "Compass Rose", type: "Powerboat", length: 48, dock: "B", slip: "B01", email: "tblackwell@email.com", phone: "555-0201" },
  { name: "Sarah Kim", vessel: "Tide Runner", type: "Fishing Boat", length: 28, dock: "B", slip: "B02", email: "skim@email.com", phone: "555-0202" },
  { name: "David Hartwell", vessel: "Harbor Light", type: "Sailboat", length: 34, dock: "B", slip: "B03", email: "dhartwell@email.com", phone: "555-0203" },
  { name: "Jennifer Marsh", vessel: "Ocean Pearl", type: "Catamaran", length: 40, dock: "B", slip: "B04", email: "jmarsh@email.com", phone: "555-0204" },
  { name: "Michael O'Brien", vessel: "Sunset Chaser", type: "Powerboat", length: 32, dock: "B", slip: "B05", email: "mobrien@email.com", phone: "555-0205" },
  { name: "Patricia Wells", vessel: "Starboard", type: "Sailboat", length: 30, dock: "C", slip: "C01", email: "pwells@email.com", phone: "555-0301" },
  { name: "Anthony Romano", vessel: "Neptune's Call", type: "Yacht", length: 60, dock: "C", slip: "C02", email: "aromano@email.com", phone: "555-0302" },
  { name: "Lisa Chang", vessel: "Wave Dancer", type: "Sailboat", length: 35, dock: "C", slip: "C03", email: "lchang@email.com", phone: "555-0303" },
  { name: "George Palmer", vessel: "Anchor Point", type: "Powerboat", length: 44, dock: "C", slip: "C04", email: "gpalmer@email.com", phone: "555-0304" },
  { name: "Diana Cruz", vessel: "Bay Runner", type: "Fishing Boat", length: 26, dock: "C", slip: "C05", email: "dcruz@email.com", phone: "555-0305" },
  { name: "Richard Stone", vessel: "Coral Reef", type: "Powerboat", length: 38, dock: "D", slip: "D01", email: "rstone@email.com", phone: "555-0401" },
  { name: "Karen Whitfield", vessel: "Deep Blue", type: "Sailboat", length: 42, dock: "D", slip: "D02", email: "kwhitfield@email.com", phone: "555-0402" },
  { name: "Steven Park", vessel: "Emerald Tide", type: "Catamaran", length: 46, dock: "D", slip: "D03", email: "spark@email.com", phone: "555-0403" },
  { name: "Michelle Torres", vessel: "Fair Wind", type: "Sailboat", length: 33, dock: "D", slip: "D04", email: "mtorres@email.com", phone: "555-0404" },
  { name: "Daniel Reed", vessel: "Golden Eagle", type: "Powerboat", length: 50, dock: "D", slip: "D05", email: "dreed@email.com", phone: "555-0405" },
  { name: "Catherine Burke", vessel: "Island Time", type: "Sailboat", length: 29, dock: "E", slip: "E01", email: "cburke@email.com", phone: "555-0501" },
  { name: "Andrew Walsh", vessel: "Knot Working", type: "Powerboat", length: 36, dock: "E", slip: "E02", email: "awalsh@email.com", phone: "555-0502" },
  { name: "Nicole Foster", vessel: "Lazy Days", type: "Catamaran", length: 44, dock: "E", slip: "E03", email: "nfoster@email.com", phone: "555-0503" },
  { name: "Brian Hayes", vessel: "Meridian", type: "Yacht", length: 65, dock: "E", slip: "E04", email: "bhayes@email.com", phone: "555-0504" },
  { name: "Amanda Sutton", vessel: "North Star", type: "Fishing Boat", length: 24, dock: "E", slip: "E05", email: "asutton@email.com", phone: "555-0505" },
];

function slipRate(length: number): number {
  if (length >= 40) return 85000;
  if (length >= 30) return 65000;
  return 45000;
}

const PAYMENT_METHODS: ("cash" | "check" | "credit_card" | "bank_transfer")[] = ["check", "check", "check", "check", "credit_card", "credit_card", "credit_card", "bank_transfer", "bank_transfer", "cash"];

const COLLECTION_NOTE_TEXTS = [
  "Left voicemail regarding outstanding balance",
  "Spoke with customer, promised payment by end of month",
  "Sent written notice via certified mail",
  "Customer requested payment plan - reviewing account",
  "Follow-up call - no answer, left message",
  "Email reminder sent regarding overdue invoice",
  "Customer acknowledged debt, will pay next week",
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Clearing existing data...");

  // Truncation order respects foreign keys
  await db.delete(collectionNotes);
  await db.delete(payments);
  await db.delete(lineItems);
  await db.delete(invoices);
  await db.delete(recurringTemplates);
  await db.delete(customers);
  await db.delete(users);

  // -----------------------------------------------------------------------
  // 1. Users
  // -----------------------------------------------------------------------
  console.log("Seeding users...");
  const hash = await bcrypt.hash("demo1234", 10);

  const insertedUsers = await db
    .insert(users)
    .values([
      { email: "manager@billinghub.app", passwordHash: hash, name: "Harbor Master", role: "manager" as const },
      { email: "billing@billinghub.app", passwordHash: hash, name: "Sarah Mitchell", role: "billing_clerk" as const },
      { email: "boater@billinghub.app", passwordHash: hash, name: "James Cooper", role: "customer" as const },
    ])
    .returning();

  const managerUser = insertedUsers[0];
  const boaterUser = insertedUsers[2];
  console.log(`  Users: ${insertedUsers.length} created`);

  // -----------------------------------------------------------------------
  // 2. Customers
  // -----------------------------------------------------------------------
  console.log("Seeding customers...");

  const customerValues = CUSTOMER_DATA.map((c) => ({
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: `${randomInt(100, 9999)} Marina Way, Sunset Harbor, CA`,
    slipNumber: c.slip,
    dock: c.dock,
    vesselName: c.vessel,
    vesselType: c.type,
    vesselLength: c.length,
    userId: c.linkBoater ? boaterUser.id : null,
  }));

  const insertedCustomers = await db.insert(customers).values(customerValues).returning();
  console.log(`  Customers: ${insertedCustomers.length} created`);

  // -----------------------------------------------------------------------
  // 3. Invoices, line items, payments, collection notes
  // -----------------------------------------------------------------------
  console.log("Seeding invoices...");

  // First 15 customers are long-term slip holders
  const longTermCustomers = insertedCustomers.slice(0, 15);
  const otherCustomers = insertedCustomers.slice(15);

  // Track all invoices for later status assignment
  interface InvoiceRecord {
    id: string;
    customerId: string;
    totalCents: number;
    dueDate: Date;
    issueDate: Date;
  }

  const allInvoiceRecords: InvoiceRecord[] = [];
  let totalLineItems = 0;

  // Helper to create an invoice with line items
  async function createInvoice(
    customerId: string,
    customerData: (typeof CUSTOMER_DATA)[0],
    issueDate: Date,
    includeSlipRental: boolean
  ): Promise<InvoiceRecord> {
    const dueDate = addDays(issueDate, 30);
    const invNumber = nextInvoiceNumber();

    // Build line items
    const items: Array<{
      category: "slip_rental" | "fuel" | "maintenance" | "amenity" | "service";
      description: string;
      quantity: number;
      unitPriceCents: number;
    }> = [];

    if (includeSlipRental) {
      items.push({
        category: "slip_rental",
        description: `Monthly Slip Rental - Dock ${customerData.dock} Slip ${customerData.slip}`,
        quantity: 1,
        unitPriceCents: slipRate(customerData.length),
      });
    }

    // Random secondary charges
    if (Math.random() < 0.3) {
      items.push({
        category: "fuel",
        description: `Fuel Purchase - ${randomInt(20, 100)} gallons diesel`,
        quantity: 1,
        unitPriceCents: randomInt(5000, 25000),
      });
    }
    if (Math.random() < 0.3) {
      items.push({
        category: "maintenance",
        description: pick(["Hull inspection", "Engine service", "Electrical repair", "Plumbing maintenance", "Deck cleaning"]),
        quantity: 1,
        unitPriceCents: randomInt(15000, 75000),
      });
    }
    if (Math.random() < 0.3) {
      const amenity = pick([
        { desc: "Pump-out service", price: 3500 },
        { desc: "Laundry facility", price: 1500 },
        { desc: "Wi-Fi Premium monthly", price: 4500 },
        { desc: "Shower facility", price: 2000 },
      ]);
      items.push({
        category: "amenity",
        description: amenity.desc,
        quantity: 1,
        unitPriceCents: amenity.price,
      });
    }
    if (Math.random() < 0.2) {
      const service = pick([
        { desc: "Bottom cleaning", price: 35000 },
        { desc: "Winterization service", price: 45000 },
        { desc: "Detailing - full boat", price: 55000 },
        { desc: "Canvas repair", price: 22000 },
      ]);
      items.push({
        category: "service",
        description: service.desc,
        quantity: 1,
        unitPriceCents: service.price,
      });
    }

    // If no slip rental and no secondary items were added, add at least one
    if (items.length === 0) {
      items.push({
        category: "fuel",
        description: `Fuel Purchase - ${randomInt(10, 50)} gallons diesel`,
        quantity: 1,
        unitPriceCents: randomInt(5000, 15000),
      });
    }

    const subtotalCents = items.reduce((sum, it) => sum + it.quantity * it.unitPriceCents, 0);
    const taxRate = 0.075;
    const taxAmountCents = Math.round(subtotalCents * taxRate);
    const totalCents = subtotalCents + taxAmountCents;

    const [inv] = await db
      .insert(invoices)
      .values({
        invoiceNumber: invNumber,
        customerId,
        status: "draft", // will update later
        issueDate: dateFmt(issueDate),
        dueDate: dateFmt(dueDate),
        subtotalCents,
        taxRate,
        taxAmountCents,
        totalCents,
      })
      .returning();

    // Insert line items
    const lineItemValues = items.map((it) => ({
      invoiceId: inv.id,
      category: it.category,
      description: it.description,
      quantity: it.quantity,
      unitPriceCents: it.unitPriceCents,
      amountCents: it.quantity * it.unitPriceCents,
    }));
    await db.insert(lineItems).values(lineItemValues);
    totalLineItems += lineItemValues.length;

    return { id: inv.id, customerId, totalCents, dueDate, issueDate };
  }

  // Generate monthly invoices for 15 long-term holders (6 months each = 90)
  for (let ci = 0; ci < longTermCustomers.length; ci++) {
    const cust = longTermCustomers[ci];
    const cd = CUSTOMER_DATA[ci];
    for (let m = 5; m >= 0; m--) {
      const issueDate = subMonths(now, m);
      const rec = await createInvoice(cust.id, cd, issueDate, true);
      allInvoiceRecords.push(rec);
    }
  }

  // Generate 2-4 invoices for remaining 10 customers
  for (let ci = 0; ci < otherCustomers.length; ci++) {
    const cust = otherCustomers[ci];
    const cd = CUSTOMER_DATA[15 + ci];
    const count = randomInt(2, 4);
    for (let j = 0; j < count; j++) {
      const monthsAgo = randomInt(0, 5);
      const dayOffset = randomInt(0, 20);
      const issueDate = subDays(subMonths(now, monthsAgo), dayOffset);
      const rec = await createInvoice(cust.id, cd, issueDate, j === 0); // first one has slip rental
      allInvoiceRecords.push(rec);
    }
  }

  // Add 20-30 extra fuel/maintenance/amenity invoices across random customers
  const extraCount = randomInt(25, 35);
  for (let i = 0; i < extraCount; i++) {
    const idx = randomInt(0, insertedCustomers.length - 1);
    const cust = insertedCustomers[idx];
    const cd = CUSTOMER_DATA[idx];
    const monthsAgo = randomInt(0, 5);
    const issueDate = subDays(subMonths(now, monthsAgo), randomInt(0, 25));
    const rec = await createInvoice(cust.id, cd, issueDate, false);
    allInvoiceRecords.push(rec);
  }

  console.log(`  Invoices: ${allInvoiceRecords.length} created with ${totalLineItems} line items`);

  // -----------------------------------------------------------------------
  // 4. Apply status distribution and create payments
  // -----------------------------------------------------------------------
  console.log("Applying status distribution and seeding payments...");

  // Sort by due date so aging makes sense
  allInvoiceRecords.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const total = allInvoiceRecords.length;
  const paidOnTimeCount = Math.round(total * 0.6);
  const paidLateCount = Math.round(total * 0.2);
  const overdueCount = Math.round(total * 0.15);
  const collectionsCount = total - paidOnTimeCount - paidLateCount - overdueCount;

  // Shuffle for distribution
  const shuffled = [...allInvoiceRecords].sort(() => Math.random() - 0.5);

  const paidOnTime = shuffled.slice(0, paidOnTimeCount);
  const paidLate = shuffled.slice(paidOnTimeCount, paidOnTimeCount + paidLateCount);
  const overdueInvoices = shuffled.slice(paidOnTimeCount + paidLateCount, paidOnTimeCount + paidLateCount + overdueCount);
  const collectionsInvoices = shuffled.slice(paidOnTimeCount + paidLateCount + overdueCount);

  let paymentCount = 0;

  // Paid on time: full payment within 15 days of due date
  for (const inv of paidOnTime) {
    const payDate = subDays(inv.dueDate, randomInt(0, 15));
    await db.update(invoices).set({ status: "paid" }).where(sql`${invoices.id} = ${inv.id}`);
    await db.insert(payments).values({
      invoiceId: inv.id,
      amountCents: inv.totalCents,
      method: pick(PAYMENT_METHODS),
      reference: `PAY-${String(++paymentCount).padStart(5, "0")}`,
      paymentDate: dateFmt(payDate),
    });
  }

  // Paid late: full payment 5-30 days after due date
  for (const inv of paidLate) {
    const payDate = addDays(inv.dueDate, randomInt(5, 30));
    await db.update(invoices).set({ status: "paid" }).where(sql`${invoices.id} = ${inv.id}`);
    await db.insert(payments).values({
      invoiceId: inv.id,
      amountCents: inv.totalCents,
      method: pick(PAYMENT_METHODS),
      reference: `PAY-${String(++paymentCount).padStart(5, "0")}`,
      paymentDate: dateFmt(payDate),
    });
  }

  // Overdue invoices: distribute aging buckets
  const overdue30Count = Math.round(overdueInvoices.length * 0.53); // ~8% of total
  const overdue60Count = Math.round(overdueInvoices.length * 0.27); // ~4% of total
  // Remaining are 90+ day

  for (let i = 0; i < overdueInvoices.length; i++) {
    const inv = overdueInvoices[i];
    let newDueDate: Date;
    if (i < overdue30Count) {
      // 30-day bucket: due 31-60 days ago
      newDueDate = subDays(now, randomInt(31, 60));
    } else if (i < overdue30Count + overdue60Count) {
      // 60-day bucket: due 61-90 days ago
      newDueDate = subDays(now, randomInt(61, 90));
    } else {
      // 90+ day bucket
      newDueDate = subDays(now, randomInt(91, 150));
    }
    const newIssueDate = subDays(newDueDate, 30);
    await db
      .update(invoices)
      .set({
        status: "overdue",
        issueDate: dateFmt(newIssueDate),
        dueDate: dateFmt(newDueDate),
      })
      .where(sql`${invoices.id} = ${inv.id}`);
    inv.dueDate = newDueDate;
    inv.issueDate = newIssueDate;
  }

  // Collections invoices: due 90+ days ago, add collection notes
  let collectionNoteCount = 0;
  for (const inv of collectionsInvoices) {
    const newDueDate = subDays(now, randomInt(91, 180));
    const newIssueDate = subDays(newDueDate, 30);
    await db
      .update(invoices)
      .set({
        status: "collections",
        issueDate: dateFmt(newIssueDate),
        dueDate: dateFmt(newDueDate),
      })
      .where(sql`${invoices.id} = ${inv.id}`);

    // Add 1-2 collection notes
    const noteCount = randomInt(1, 2);
    for (let n = 0; n < noteCount; n++) {
      const noteDate = new Date(
        newDueDate.getTime() + Math.random() * (now.getTime() - newDueDate.getTime())
      );
      await db.insert(collectionNotes).values({
        invoiceId: inv.id,
        note: pick(COLLECTION_NOTE_TEXTS),
        createdBy: managerUser.id,
        createdAt: noteDate,
      });
      collectionNoteCount++;
    }
  }

  console.log(`  Payments: ${paymentCount} created`);
  console.log(`  Collection notes: ${collectionNoteCount} created`);

  // -----------------------------------------------------------------------
  // 5. Partial payments (3 customers from overdue set)
  // -----------------------------------------------------------------------
  console.log("Seeding partial payments...");

  // Find 3 distinct customers from overdue invoices
  const partialCandidates = overdueInvoices.filter(
    (inv, idx, arr) => arr.findIndex((x) => x.customerId === inv.customerId) === idx
  );
  const partialCustomerInvoices = partialCandidates.slice(0, 3);

  for (const inv of partialCustomerInvoices) {
    // Change status to partial
    await db.update(invoices).set({ status: "partial" }).where(sql`${invoices.id} = ${inv.id}`);

    // Create 1-2 partial payments totaling 30-50% of invoice
    const partialPercent = 0.3 + Math.random() * 0.2;
    const partialTotal = Math.round(inv.totalCents * partialPercent);
    const paymentParts = randomInt(1, 2);

    if (paymentParts === 1) {
      await db.insert(payments).values({
        invoiceId: inv.id,
        amountCents: partialTotal,
        method: pick(PAYMENT_METHODS),
        reference: `PAY-${String(++paymentCount).padStart(5, "0")}`,
        paymentDate: dateFmt(addDays(inv.dueDate, randomInt(5, 20))),
        notes: "Partial payment - payment plan",
      });
    } else {
      const first = Math.round(partialTotal * 0.6);
      const second = partialTotal - first;
      await db.insert(payments).values({
        invoiceId: inv.id,
        amountCents: first,
        method: pick(PAYMENT_METHODS),
        reference: `PAY-${String(++paymentCount).padStart(5, "0")}`,
        paymentDate: dateFmt(addDays(inv.dueDate, randomInt(5, 15))),
        notes: "Partial payment 1 of 2 - payment plan",
      });
      await db.insert(payments).values({
        invoiceId: inv.id,
        amountCents: second,
        method: pick(PAYMENT_METHODS),
        reference: `PAY-${String(++paymentCount).padStart(5, "0")}`,
        paymentDate: dateFmt(addDays(inv.dueDate, randomInt(20, 40))),
        notes: "Partial payment 2 of 2 - payment plan",
      });
    }
  }
  console.log(`  Partial payments: ${partialCustomerInvoices.length} customers with payment plans`);

  // -----------------------------------------------------------------------
  // 6. Recurring templates for 15 long-term holders
  // -----------------------------------------------------------------------
  console.log("Seeding recurring templates...");

  const nextMonth = addMonths(now, 1);
  const firstOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);

  const templateValues = longTermCustomers.map((cust, i) => {
    const cd = CUSTOMER_DATA[i];
    return {
      customerId: cust.id,
      name: `Monthly Slip Rental - ${cust.name}`,
      lineItems: JSON.stringify([
        {
          category: "slip_rental",
          description: `Monthly Slip Rental - Dock ${cd.dock} Slip ${cd.slip}`,
          quantity: 1,
          unitPriceCents: slipRate(cd.length),
        },
      ]),
      frequency: "monthly" as const,
      nextInvoiceDate: dateFmt(firstOfNextMonth),
      active: true,
    };
  });

  await db.insert(recurringTemplates).values(templateValues);
  console.log(`  Recurring templates: ${templateValues.length} created`);

  // -----------------------------------------------------------------------
  // Done
  // -----------------------------------------------------------------------
  console.log("\nSeed complete!");
  console.log(`  Summary: ${insertedUsers.length} users, ${insertedCustomers.length} customers, ${allInvoiceRecords.length} invoices, ${totalLineItems} line items, ${paymentCount} payments, ${collectionNoteCount} collection notes, ${templateValues.length} recurring templates`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
