import { getCustomerSelectList } from "@/lib/dal/invoices";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { createInvoice } from "@/app/(admin)/invoices/actions";

export default async function NewInvoicePage() {
  const customers = await getCustomerSelectList();

  return (
    <div className="space-y-6">
      <h1
        className="font-heading text-3xl"
        style={{ letterSpacing: "-0.02em" }}
      >
        New Invoice
      </h1>
      <InvoiceForm
        customers={customers}
        action={createInvoice}
        submitLabel="Save as Draft"
      />
    </div>
  );
}
