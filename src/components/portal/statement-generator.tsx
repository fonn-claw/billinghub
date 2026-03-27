"use client";

import { useState, useMemo } from "react";
import { StatementDownloadButton } from "./statement-download-button";
import type { StatementProps } from "@/components/pdf/statement-pdf";

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
};

type Payment = {
  id: string;
  amountCents: number;
  method: string;
  reference: string | null;
  paymentDate: string;
  invoiceNumber: string;
  invoiceId: string;
};

type PeriodOption = "this-month" | "last-month" | "this-quarter" | "last-quarter";

function getPeriodDates(period: PeriodOption): { start: string; end: string; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  switch (period) {
    case "this-month": {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      const label = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return { start: fmt(start), end: fmt(end), label };
    }
    case "last-month": {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      const label = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return { start: fmt(start), end: fmt(end), label };
    }
    case "this-quarter": {
      const qStart = Math.floor(month / 3) * 3;
      const start = new Date(year, qStart, 1);
      const end = new Date(year, qStart + 3, 0);
      const q = Math.floor(qStart / 3) + 1;
      return { start: fmt(start), end: fmt(end), label: `Q${q} ${year}` };
    }
    case "last-quarter": {
      const qStart = Math.floor(month / 3) * 3 - 3;
      const qYear = qStart < 0 ? year - 1 : year;
      const qStartAdj = qStart < 0 ? qStart + 12 : qStart;
      const start = new Date(qYear, qStartAdj, 1);
      const end = new Date(qYear, qStartAdj + 3, 0);
      const q = Math.floor(qStartAdj / 3) + 1;
      return { start: fmt(start), end: fmt(end), label: `Q${q} ${qYear}` };
    }
  }
}

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

function methodLabel(method: string): string {
  return method
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface StatementGeneratorProps {
  customerName: string;
  customerEmail: string | null;
  invoices: Invoice[];
  payments: Payment[];
}

export function StatementGenerator({
  customerName,
  customerEmail,
  invoices,
  payments,
}: StatementGeneratorProps) {
  const [period, setPeriod] = useState<PeriodOption>("this-month");

  const statementData = useMemo((): StatementProps => {
    const { start, end, label } = getPeriodDates(period);

    // Filter invoices and payments within the period
    const periodInvoices = invoices.filter(
      (inv) => inv.issueDate >= start && inv.issueDate <= end && inv.status !== "draft"
    );
    const periodPayments = payments.filter(
      (p) => p.paymentDate >= start && p.paymentDate <= end
    );

    // Opening balance = all charges before period start minus all payments before period start
    const priorCharges = invoices
      .filter((inv) => inv.issueDate < start && inv.status !== "draft")
      .reduce((sum, inv) => sum + inv.totalCents, 0);
    const priorPayments = payments
      .filter((p) => p.paymentDate < start)
      .reduce((sum, p) => sum + p.amountCents, 0);
    const openingBalanceCents = priorCharges - priorPayments;

    // Build transactions sorted by date
    const transactions: StatementProps["transactions"] = [];

    for (const inv of periodInvoices) {
      transactions.push({
        date: inv.issueDate,
        description: `Invoice #${inv.invoiceNumber}`,
        chargeCents: inv.totalCents,
        paymentCents: 0,
      });
    }

    for (const p of periodPayments) {
      transactions.push({
        date: p.paymentDate,
        description: `Payment - ${methodLabel(p.method)}`,
        chargeCents: 0,
        paymentCents: p.amountCents,
      });
    }

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    const periodChargesTotal = periodInvoices.reduce((sum, inv) => sum + inv.totalCents, 0);
    const periodPaymentsTotal = periodPayments.reduce((sum, p) => sum + p.amountCents, 0);
    const closingBalanceCents = openingBalanceCents + periodChargesTotal - periodPaymentsTotal;

    return {
      customerName,
      customerEmail,
      periodLabel: label,
      periodStart: start,
      periodEnd: end,
      openingBalanceCents,
      transactions,
      closingBalanceCents,
    };
  }, [period, customerName, customerEmail, invoices, payments]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-xl text-foreground">Account Statement</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Generate a PDF statement for a selected period.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="statement-period"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Period
          </label>
          <select
            id="statement-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodOption)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="last-quarter">Last Quarter</option>
          </select>
        </div>
        <StatementDownloadButton statementData={statementData} />
      </div>
    </div>
  );
}
