import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  vesselName: z.string().max(100).optional().or(z.literal("")),
  vesselType: z.enum(["sailboat", "powerboat", "catamaran"]).optional(),
  vesselLength: z.number().int().min(1).max(200).optional().nullable(),
  dock: z.string().max(1).optional().or(z.literal("")),
  slipNumber: z.string().max(10).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const lineItemSchema = z.object({
  category: z.enum(["slip_rental", "fuel", "maintenance", "amenity", "service", "other"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPriceCents: z.number().int().min(0, "Price must be non-negative"),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid("Select a customer"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.number().min(0).max(1),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amountCents: z.number().int().min(1, "Amount must be greater than 0"),
  method: z.enum(["cash", "check", "credit_card", "bank_transfer"]),
  reference: z.string().optional().or(z.literal("")),
  paymentDate: z.string().min(1, "Payment date is required"),
  notes: z.string().optional().or(z.literal("")),
});

export const createRecurringTemplateSchema = z.object({
  customerId: z.string().uuid("Select a customer"),
  name: z.string().min(1, "Template name is required").max(100),
  frequency: z.enum(["monthly", "quarterly", "annual"]),
  nextInvoiceDate: z.string().min(1, "Next invoice date is required"),
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

export const collectionNoteSchema = z.object({
  customerId: z.string().uuid(),
  noteType: z.enum(["note", "promise_to_pay"]),
  note: z.string().min(1, "Note is required"),
  promisedDate: z.string().optional().or(z.literal("")),
  promisedAmountCents: z.number().int().min(0).optional().nullable(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateRecurringTemplateInput = z.infer<typeof createRecurringTemplateSchema>;
export type CollectionNoteInput = z.infer<typeof collectionNoteSchema>;
