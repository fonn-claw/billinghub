"use client";

import type { MonthlyComparisonReport as MonthlyComparisonData } from "@/lib/dal/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";
import { exportToCSV } from "@/lib/utils/csv-export";

interface MonthlyComparisonReportProps {
  data: MonthlyComparisonData;
}

export function MonthlyComparisonReport({
  data,
}: MonthlyComparisonReportProps) {
  const { currentMonth, lastMonth, sameMonthLastYear } = data;

  const yoyChange =
    sameMonthLastYear.totalRevenueCents > 0
      ? (
          ((currentMonth.totalRevenueCents - sameMonthLastYear.totalRevenueCents) /
            sameMonthLastYear.totalRevenueCents) *
          100
        ).toFixed(1)
      : "N/A";

  const summaryCards = [
    {
      label: `Current Month (${currentMonth.month})`,
      value: formatCurrency(currentMonth.totalRevenueCents),
    },
    {
      label: `Last Month (${lastMonth.month})`,
      value: formatCurrency(lastMonth.totalRevenueCents),
    },
    {
      label: "Year-over-Year Change",
      value: yoyChange === "N/A" ? "N/A" : `${Number(yoyChange) >= 0 ? "+" : ""}${yoyChange}%`,
      className:
        yoyChange !== "N/A" && Number(yoyChange) >= 0
          ? "text-green-600"
          : "text-red-600",
    },
  ];

  const metrics = [
    {
      label: "Total Revenue",
      current: formatCurrency(currentMonth.totalRevenueCents),
      currentRaw: currentMonth.totalRevenueCents,
      last: formatCurrency(lastMonth.totalRevenueCents),
      lastRaw: lastMonth.totalRevenueCents,
      lastYear: formatCurrency(sameMonthLastYear.totalRevenueCents),
      lastYearRaw: sameMonthLastYear.totalRevenueCents,
    },
    {
      label: "Invoice Count",
      current: String(currentMonth.invoiceCount),
      currentRaw: currentMonth.invoiceCount,
      last: String(lastMonth.invoiceCount),
      lastRaw: lastMonth.invoiceCount,
      lastYear: String(sameMonthLastYear.invoiceCount),
      lastYearRaw: sameMonthLastYear.invoiceCount,
    },
    {
      label: "Payments Received",
      current: formatCurrency(currentMonth.paymentsCents),
      currentRaw: currentMonth.paymentsCents,
      last: formatCurrency(lastMonth.paymentsCents),
      lastRaw: lastMonth.paymentsCents,
      lastYear: formatCurrency(sameMonthLastYear.paymentsCents),
      lastYearRaw: sameMonthLastYear.paymentsCents,
    },
    {
      label: "Collection Rate",
      current: `${currentMonth.collectionRate}%`,
      currentRaw: currentMonth.collectionRate,
      last: `${lastMonth.collectionRate}%`,
      lastRaw: lastMonth.collectionRate,
      lastYear: `${sameMonthLastYear.collectionRate}%`,
      lastYearRaw: sameMonthLastYear.collectionRate,
    },
  ];

  const colorCompare = (current: number, comparison: number) => {
    if (current > comparison) return "text-green-600";
    if (current < comparison) return "text-red-600";
    return "";
  };

  const handleExport = () => {
    const exportData = metrics.map((m) => ({
      metric: m.label,
      currentMonth: m.current,
      lastMonth: m.last,
      sameMonthLastYear: m.lastYear,
    }));
    exportToCSV(
      exportData,
      [
        { key: "metric", label: "Metric" },
        { key: "currentMonth", label: `Current (${currentMonth.month})` },
        { key: "lastMonth", label: `Last (${lastMonth.month})` },
        { key: "sameMonthLastYear", label: `Last Year (${sameMonthLastYear.month})` },
      ],
      `monthly-comparison-${currentMonth.month}.csv`
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${card.className ?? ""}`}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header with export */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Monthly Comparison
        </h3>
        <Button variant="outline" size="sm" onClick={handleExport} className="h-8 gap-2">
          <Download size={14} />
          Export CSV
        </Button>
      </div>

      {/* Comparison table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">
                Current ({currentMonth.month})
              </TableHead>
              <TableHead className="text-right">
                Last ({lastMonth.month})
              </TableHead>
              <TableHead className="text-right">
                Last Year ({sameMonthLastYear.month})
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((m) => (
              <TableRow key={m.label}>
                <TableCell className="font-medium">{m.label}</TableCell>
                <TableCell className="text-right">{m.current}</TableCell>
                <TableCell
                  className={`text-right ${colorCompare(m.currentRaw, m.lastRaw)}`}
                >
                  {m.last}
                </TableCell>
                <TableCell
                  className={`text-right ${colorCompare(m.currentRaw, m.lastYearRaw)}`}
                >
                  {m.lastYear}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
