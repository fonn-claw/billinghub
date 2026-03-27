"use client";

import type { CollectionsReport as CollectionsReportData } from "@/lib/dal/reports";
import { ReportTable } from "./report-table";
import { formatCurrency } from "@/lib/formatting";
import { Badge } from "@/components/ui/badge";

interface CollectionsReportProps {
  data: CollectionsReportData;
  startDate: string;
  endDate: string;
}

export function CollectionsReport({
  data,
  startDate,
  endDate,
}: CollectionsReportProps) {
  const total = data.collectedCents + data.outstandingCents;
  const collectionRate = total > 0 ? ((data.collectedCents / total) * 100).toFixed(1) : "0.0";

  return (
    <ReportTable
      title="Collections Report"
      exportFilename={`collections-report-${startDate}-to-${endDate}.csv`}
      summaryCards={[
        {
          label: "Collected",
          value: formatCurrency(data.collectedCents),
          className: "text-green-600",
        },
        {
          label: "Outstanding",
          value: formatCurrency(data.outstandingCents),
          className: "text-red-600",
        },
        {
          label: "Net Collection Rate",
          value: `${collectionRate}%`,
        },
      ]}
      columns={[
        { key: "customerName", label: "Customer Name" },
        {
          key: "collectedCents",
          label: "Collected",
          align: "right",
          format: (v: number) => formatCurrency(v),
          render: (v: number) => (
            <span className={v > 0 ? "text-green-600" : ""}>{formatCurrency(v)}</span>
          ),
        },
        {
          key: "outstandingCents",
          label: "Outstanding",
          align: "right",
          format: (v: number) => formatCurrency(v),
          render: (v: number) => (
            <span className={v > 0 ? "text-red-600" : ""}>{formatCurrency(v)}</span>
          ),
        },
        {
          key: "_status",
          label: "Balance Status",
          render: (v: string) => {
            const colors =
              v === "Paid"
                ? "bg-green-100 text-green-700 border-green-200"
                : v === "Partial"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-red-100 text-red-700 border-red-200";
            return (
              <Badge variant="outline" className={colors}>
                {v}
              </Badge>
            );
          },
        },
      ]}
      data={data.rows.map((row) => ({
        ...row,
        _status:
          row.outstandingCents === 0
            ? "Paid"
            : row.collectedCents > 0 && row.outstandingCents > 0
              ? "Partial"
              : "Unpaid",
      }))}
    />
  );
}
