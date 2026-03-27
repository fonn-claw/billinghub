import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getInvoices } from "@/lib/dal/invoices";
import { InvoiceTable } from "@/components/invoices/invoice-table";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || undefined;
  const search = params.search || undefined;
  const invoiceList = await getInvoices(status, search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl" style={{ letterSpacing: "-0.02em" }}>
          Invoices
        </h1>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <InvoiceTable invoices={invoiceList} activeTab={status ?? ""} />
    </div>
  );
}
