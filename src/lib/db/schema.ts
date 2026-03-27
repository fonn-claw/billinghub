import { pgTable, pgEnum, text, integer, timestamp, boolean, uuid, jsonb, date, real } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["manager", "billing_clerk", "customer"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "partial", "overdue", "collections"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "check", "credit_card", "bank_transfer"]);
export const chargeCategoryEnum = pgEnum("charge_category", ["slip_rental", "fuel", "maintenance", "amenity", "service", "other"]);
export const recurringFrequencyEnum = pgEnum("recurring_frequency", ["monthly", "quarterly", "annual"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  slipNumber: text("slip_number"),
  dock: text("dock"),
  vesselName: text("vessel_name"),
  vesselType: text("vessel_type"),
  vesselLength: integer("vessel_length"),
  notes: text("notes"),
  isCollectionsFlagged: boolean("is_collections_flagged").default(false).notNull(),
  lastReminderDate: date("last_reminder_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerNotes = pgTable("customer_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  note: text("note").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: text("invoice_number").unique().notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotalCents: integer("subtotal_cents").default(0).notNull(),
  taxRate: real("tax_rate").default(0).notNull(),
  taxAmountCents: integer("tax_amount_cents").default(0).notNull(),
  totalCents: integer("total_cents").default(0).notNull(),
  notes: text("notes"),
  recurringTemplateId: uuid("recurring_template_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lineItems = pgTable("line_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  category: chargeCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  amountCents: integer("amount_cents").notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  amountCents: integer("amount_cents").notNull(),
  method: paymentMethodEnum("method").notNull(),
  reference: text("reference"),
  paymentDate: date("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collectionNotes = pgTable("collection_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  noteType: text("note_type").default("note").notNull(),
  note: text("note").notNull(),
  promisedDate: date("promised_date"),
  promisedAmountCents: integer("promised_amount_cents"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recurringTemplates = pgTable("recurring_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  lineItems: jsonb("line_items").notNull(),
  frequency: recurringFrequencyEnum("frequency").notNull(),
  nextInvoiceDate: date("next_invoice_date").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
