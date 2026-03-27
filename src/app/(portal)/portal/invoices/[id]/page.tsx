import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCustomerByUserId } from "@/lib/dal/portal";
import { getInvoiceWithDetails } from "@/lib/dal/invoices";
import { formatCurrency } from "@/lib/formatting";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PDFDownloadButton } from "@/components/portal/pdf-download-button";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusVariant(status: string) {
  switch (status) {
    case "paid":
      return "default" as const;
    case "overdue":
    case "collections":
      return "destructive" as const;
    case "partial":
      return "outline" as const;
    case "sent":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
}

function categoryLabel(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function PortalInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const customer = await getCustomerByUserId(session.userId);

  if (!customer) {
    notFound();
  }

  const invoice = await getInvoiceWithDetails(id);

  if (!invoice) {
    notFound();
  }

  // Security check: ensure customer owns this invoice
  if (invoice.customerId !== customer.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/portal"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Account
      </Link>

      {/* Invoice header */}
      <div className="flex flex-wrap items-center gap-4">
        <h1
          className="font-heading text-3xl text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Invoice #{invoice.invoiceNumber}
        </h1>
        <Badge variant={statusVariant(invoice.computedStatus)}>
          {invoice.computedStatus.charAt(0).toUpperCase() +
            invoice.computedStatus.slice(1)}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-6 text-[15px] text-muted-foreground">
        <span>
          Issued: <strong className="text-foreground">{formatDate(invoice.issueDate)}</strong>
        </span>
        <span>
          Due: <strong className="text-foreground">{formatDate(invoice.dueDate)}</strong>
        </span>
      </div>

      {/* Line items */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-[15px]">{item.description}</TableCell>
                <TableCell className="text-[15px]">
                  {categoryLabel(item.category)}
                </TableCell>
                <TableCell className="text-right text-[15px]">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-[15px]">
                  {formatCurrency(item.unitPriceCents)}
                </TableCell>
                <TableCell className="text-right text-[15px]">
                  {formatCurrency(item.amountCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-[15px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(invoice.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Tax ({(invoice.taxRate * 100).toFixed(1)}%)
            </span>
            <span>{formatCurrency(invoice.taxAmountCents)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-bold">
            <span>Total</span>
            <span>{formatCurrency(invoice.totalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span className="text-green-600">
              {formatCurrency(invoice.paidCents)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-bold text-lg">
            <span>Balance Due</span>
            <span
              className={
                invoice.balanceCents > 0 ? "text-destructive" : "text-foreground"
              }
            >
              {formatCurrency(invoice.balanceCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment history */}
      {invoice.payments.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-xl text-foreground">
            Payment History
          </h2>
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((pmt) => (
                  <TableRow key={pmt.id}>
                    <TableCell className="text-[15px]">
                      {formatDate(pmt.paymentDate)}
                    </TableCell>
                    <TableCell className="text-[15px] capitalize">
                      {pmt.method.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-[15px] text-muted-foreground">
                      {pmt.reference ?? "-"}
                    </TableCell>
                    <TableCell className="text-right text-[15px]">
                      {formatCurrency(pmt.amountCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <PDFDownloadButton invoice={invoice} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="inline-flex cursor-not-allowed items-center rounded-xl bg-[#E8AA42] px-6 py-3 font-semibold text-white opacity-60"
              disabled
            >
              Pay Now
            </TooltipTrigger>
            <TooltipContent>
              Coming Soon — Online payments will be available in a future update
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
