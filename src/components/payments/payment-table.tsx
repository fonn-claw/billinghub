"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatting";
import type { PaymentRow } from "@/lib/dal/payments";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  check: "Check",
  credit_card: "Credit Card",
  bank_transfer: "Bank Transfer",
};

export function PaymentTable({ payments }: { payments: PaymentRow[] }) {
  const [methodFilter, setMethodFilter] = useState("all");

  const filtered =
    methodFilter === "all"
      ? payments
      : payments.filter((p) => p.method === methodFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={methodFilter} onValueChange={(val) => { if (val) setMethodFilter(val); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12">
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
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>
                    <Link
                      href={`/invoices/${payment.invoiceId}`}
                      className="text-[#1B6B93] hover:underline"
                    >
                      {payment.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/customers/${payment.customerId}`}
                      className="text-[#1B6B93] hover:underline"
                    >
                      {payment.customerName}
                    </Link>
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
