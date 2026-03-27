"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import { formatCurrency } from "@/lib/formatting";
import { agingBadgeColors, agingLabels, type AgingBucket } from "@/lib/utils/aging";
import {
  markAsSent,
  deleteInvoice,
  type ActionState,
} from "@/app/(admin)/invoices/actions";
import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog";
import { Send, Pencil, Trash2 } from "lucide-react";
import type { InvoiceDetail as InvoiceDetailType } from "@/lib/dal/invoices";

const CATEGORY_LABELS: Record<string, string> = {
  slip_rental: "Slip Rental",
  fuel: "Fuel",
  maintenance: "Maintenance",
  amenity: "Amenity",
  service: "Service",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  slip_rental: "bg-blue-100 text-blue-700",
  fuel: "bg-amber-100 text-amber-700",
  maintenance: "bg-purple-100 text-purple-700",
  amenity: "bg-teal-100 text-teal-700",
  service: "bg-indigo-100 text-indigo-700",
  other: "bg-gray-100 text-gray-700",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  check: "Check",
  credit_card: "Credit Card",
  bank_transfer: "Bank Transfer",
};

export function InvoiceDetailView({
  invoice,
}: {
  invoice: InvoiceDetailType;
}) {
  const [sendState, sendAction, sendPending] = useActionState(markAsSent, null);
  const isDraft = invoice.computedStatus === "draft";
  const paymentPercent =
    invoice.totalCents > 0
      ? Math.min(100, Math.round((invoice.paidCents / invoice.totalCents) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1
            className="font-heading text-3xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {invoice.invoiceNumber}
          </h1>
          <InvoiceStatusBadge status={invoice.computedStatus} />
          {invoice.agingBucket && (
            <Badge
              variant="outline"
              className={agingBadgeColors[invoice.agingBucket as AgingBucket]}
            >
              {agingLabels[invoice.agingBucket as AgingBucket]}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {isDraft && (
            <>
              <form action={sendAction}>
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={sendPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sendPending ? "Sending..." : "Mark as Sent"}
                </Button>
              </form>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <DeleteInvoiceButton invoiceId={invoice.id} />
            </>
          )}
          {invoice.computedStatus !== "draft" && invoice.computedStatus !== "paid" && (
            <RecordPaymentDialog
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoiceNumber}
              balanceCents={invoice.balanceCents}
            />
          )}
        </div>
      </div>

      {sendState?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {sendState.error}
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Customer">
          <Link
            href={`/customers/${invoice.customerId}`}
            className="text-[#1B6B93] hover:underline"
          >
            {invoice.customerName}
          </Link>
        </InfoCard>
        <InfoCard label="Issue Date">{invoice.issueDate}</InfoCard>
        <InfoCard label="Due Date">{invoice.dueDate}</InfoCard>
        {invoice.notes && <InfoCard label="Notes">{invoice.notes}</InfoCard>}
      </div>

      {/* Line Items */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="text-base font-semibold">Line Items</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other}
                  >
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </Badge>
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.unitPriceCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatCurrency(item.amountCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-border p-4">
          <div className="flex flex-col items-end gap-2">
            <div className="flex w-64 justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.subtotalCents)}
              </span>
            </div>
            <div className="flex w-64 justify-between text-sm">
              <span className="text-muted-foreground">
                Tax ({(invoice.taxRate * 100).toFixed(1)}%)
              </span>
              <span className="tabular-nums">
                {formatCurrency(invoice.taxAmountCents)}
              </span>
            </div>
            <div className="flex w-64 justify-between border-t border-border pt-2">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(invoice.totalCents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="text-base font-semibold">Payment History</h3>
        </div>

        {invoice.payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <img
              src="/assets/empty-payments.svg"
              alt=""
              className="mb-4 h-24 w-32 opacity-60"
            />
            <p className="text-sm text-muted-foreground">
              No payments recorded yet
            </p>
          </div>
        ) : (
          <>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {paymentPercent}% paid
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(invoice.paidCents)} of{" "}
                  {formatCurrency(invoice.totalCents)}
                </span>
              </div>
              <Progress value={paymentPercent} />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  let running = invoice.totalCents;
                  return invoice.payments.map((payment) => {
                    running -= payment.amountCents;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.paymentDate}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatCurrency(payment.amountCents)}
                        </TableCell>
                        <TableCell>
                          {METHOD_LABELS[payment.method] ?? payment.method}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.reference || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </>
        )}

        {/* Balance Summary */}
        <div className="border-t border-border p-4">
          <div className="flex flex-col items-end gap-2">
            <div className="flex w-64 justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.totalCents)}
              </span>
            </div>
            <div className="flex w-64 justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="tabular-nums text-green-600">
                {formatCurrency(invoice.paidCents)}
              </span>
            </div>
            <div className="flex w-64 justify-between border-t border-border pt-2">
              <span className="font-semibold">Balance Due</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  invoice.computedStatus === "overdue" ||
                  invoice.computedStatus === "collections"
                    ? "text-red-600"
                    : ""
                }`}
              >
                {formatCurrency(invoice.balanceCents)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this invoice? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <form
            action={async (fd: FormData) => {
              await deleteInvoice(fd);
            }}
          >
            <input type="hidden" name="invoiceId" value={invoiceId} />
            <Button type="submit" variant="destructive">
              Delete Invoice
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
