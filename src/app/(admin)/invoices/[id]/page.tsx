import { notFound } from "next/navigation";
import { getInvoiceWithDetails } from "@/lib/dal/invoices";
import { InvoiceDetailView } from "@/components/invoices/invoice-detail";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceWithDetails(id);

  if (!invoice) {
    notFound();
  }

  return <InvoiceDetailView invoice={invoice} />;
}
