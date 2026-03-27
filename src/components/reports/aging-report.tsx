"use client";

import type { AgingReportRow } from "@/lib/dal/reports";
import { ReportTable } from "./report-table";
import { formatCurrency } from "@/lib/formatting";
import { agingLabels, agingBadgeColors, type AgingBucket } from "@/lib/utils/aging";
import { Badge } from "@/components/ui/badge";
import { format as formatDate } from "date-fns";

interface AgingReportProps {
  data: AgingReportRow[];
  startDate: string;
  endDate: string;
}

export function AgingReport({ data, startDate, endDate }: AgingReportProps) {
  const bucketSummary = (bucket: AgingBucket) => {
    const rows = data.filter((r) => r.agingBucket === bucket);
    return {
      count: rows.length,
      total: rows.reduce((sum, r) => sum + r.balanceCents, 0),
    };
  };

  const totalOverdue = data.reduce((sum, r) => sum + r.balanceCents, 0);

  const buckets: AgingBucket[] = ["current", "30day", "60day", "90plus"];
  const summaryCards = [
    ...buckets.map((b) => {
      const s = bucketSummary(b);
      return {
        label: `${agingLabels[b]} (${s.count})`,
        value: formatCurrency(s.total),
      };
    }),
    {
      label: "Total Overdue",
      value: formatCurrency(totalOverdue),
      className: "text-red-600",
    },
  ];

  return (
    <ReportTable
      title="Aging Report"
      exportFilename={`aging-report-${startDate}-to-${endDate}.csv`}
      summaryCards={summaryCards}
      columns={[
        { key: "customerName", label: "Customer Name" },
        { key: "invoiceNumber", label: "Invoice #" },
        {
          key: "amountCents",
          label: "Invoice Amount",
          align: "right",
          format: (v: number) => formatCurrency(v),
        },
        {
          key: "paidCents",
          label: "Paid",
          align: "right",
          format: (v: number) => formatCurrency(v),
        },
        {
          key: "balanceCents",
          label: "Balance Due",
          align: "right",
          format: (v: number) => formatCurrency(v),
          render: (v: number) => (
            <span className="text-red-600 font-medium">{formatCurrency(v)}</span>
          ),
        },
        {
          key: "dueDate",
          label: "Due Date",
          format: (v: string) => {
            try {
              return formatDate(new Date(v), "MMM d, yyyy");
            } catch {
              return v;
            }
          },
        },
        { key: "daysOverdue", label: "Days Overdue", align: "right" },
        {
          key: "agingBucket",
          label: "Aging Bucket",
          format: (v: string) => agingLabels[v as AgingBucket] ?? v,
          render: (v: string) => {
            const bucket = v as AgingBucket;
            const colors = agingBadgeColors[bucket] ?? "";
            return (
              <Badge variant="outline" className={colors}>
                {agingLabels[bucket] ?? v}
              </Badge>
            );
          },
        },
      ]}
      data={data}
    />
  );
}
