import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCustomerByUserId, getPortalSummary } from "@/lib/dal/portal";
import { getCustomerInvoices } from "@/lib/dal/customers";
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
    case "draft":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
}

export default async function PortalHomePage() {
  const session = await getSession();
  const name = session.name ?? "Customer";

  const customer = await getCustomerByUserId(session.userId);

  if (!customer) {
    return (
      <div className="space-y-6">
        <h1
          className="font-heading text-3xl text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Welcome, {name}
        </h1>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-[15px] text-muted-foreground">
            No customer account linked to your login. Please contact the marina
            office for assistance.
          </p>
        </div>
      </div>
    );
  }

  const summary = await getPortalSummary(customer.id);
  const invoices = await getCustomerInvoices(customer.id);

  return (
    <div className="space-y-6">
      <h1
        className="font-heading text-3xl text-foreground"
        style={{ letterSpacing: "-0.02em" }}
      >
        Welcome, {name}
      </h1>

      {/* Account Summary */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-xl text-foreground">
          Account Summary
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {formatCurrency(summary.currentBalance)}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Overdue Amount
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                summary.overdueAmount > 0
                  ? "text-destructive"
                  : "text-foreground"
              }`}
            >
              {formatCurrency(summary.overdueAmount)}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Next Due Date
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {summary.nextDueDate
                ? formatDate(summary.nextDueDate)
                : "None upcoming"}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Last Payment
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {summary.lastPaymentDate
                ? formatDate(summary.lastPaymentDate)
                : "No payments yet"}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[15px] text-muted-foreground">
          View your invoices below or download PDF copies for your records.
        </p>
      </div>

      {/* Pay Now Button */}
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

      {/* Invoice History */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl text-foreground">
          Invoice History
        </h2>

        {invoices.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-[15px] text-muted-foreground">
              No invoices found.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link
                        href={`/portal/invoices/${inv.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-[15px]">
                      {formatDate(inv.issueDate)}
                    </TableCell>
                    <TableCell className="text-[15px]">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="text-right text-[15px]">
                      {formatCurrency(inv.totalCents)}
                    </TableCell>
                    <TableCell className="text-right text-[15px]">
                      {formatCurrency(inv.paidCents)}
                    </TableCell>
                    <TableCell className="text-right text-[15px]">
                      {formatCurrency(inv.balanceCents)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(inv.status)}>
                        {inv.status.charAt(0).toUpperCase() +
                          inv.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
