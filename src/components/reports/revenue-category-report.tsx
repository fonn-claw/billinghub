"use client";

import type { RevenueByCategoryReport } from "@/lib/dal/reports";
import { ReportTable } from "./report-table";
import { formatCurrency } from "@/lib/formatting";

const categoryLabels: Record<string, string> = {
  slip_rental: "Slip Rental",
  fuel: "Fuel",
  maintenance: "Maintenance",
  amenity: "Amenity",
  service: "Service",
  other: "Other",
};

interface RevenueCategoryReportProps {
  data: RevenueByCategoryReport;
  startDate: string;
  endDate: string;
}

export function RevenueCategoryReport({
  data,
  startDate,
  endDate,
}: RevenueCategoryReportProps) {
  const topCategory = data.rows.length > 0 ? data.rows[0] : null;

  return (
    <ReportTable
      title="Revenue by Category"
      exportFilename={`revenue-by-category-${startDate}-to-${endDate}.csv`}
      summaryCards={[
        { label: "Total Revenue", value: formatCurrency(data.grandTotalCents) },
        { label: "Categories", value: String(data.rows.length) },
        {
          label: "Top Category",
          value: topCategory
            ? categoryLabels[topCategory.category] ?? topCategory.category
            : "N/A",
        },
      ]}
      columns={[
        {
          key: "category",
          label: "Category",
          format: (v: string) => categoryLabels[v] ?? v,
        },
        { key: "invoiceCount", label: "Invoice Count", align: "right" },
        {
          key: "totalCents",
          label: "Total",
          align: "right",
          format: (v: number) => formatCurrency(v),
        },
        {
          key: "percentage",
          label: "% of Total",
          align: "right",
          format: (v: number) => `${v.toFixed(1)}%`,
        },
      ]}
      data={data.rows}
    />
  );
}
