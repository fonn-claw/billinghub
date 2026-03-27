import { notFound, redirect } from "next/navigation";
import { getInvoiceWithDetails, getCustomerSelectList } from "@/lib/dal/invoices";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { updateInvoice } from "@/app/(admin)/invoices/actions";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceWithDetails(id);

  if (!invoice) {
    notFound();
  }

  if (invoice.computedStatus !== "draft") {
    redirect(`/invoices/${id}`);
  }

  const customers = await getCustomerSelectList();

  const defaultValues = {
    customerId: invoice.customerId,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    taxRate: invoice.taxRate,
    notes: invoice.notes ?? "",
    items: invoice.lineItems.map((item) => ({
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    })),
  };

  return (
    <div className="space-y-6">
      <h1
        className="font-heading text-3xl"
        style={{ letterSpacing: "-0.02em" }}
      >
        Edit {invoice.invoiceNumber}
      </h1>
      <InvoiceForm
        customers={customers}
        defaultValues={defaultValues}
        action={updateInvoice}
        submitLabel="Save Changes"
        invoiceId={invoice.id}
      />
    </div>
  );
}
