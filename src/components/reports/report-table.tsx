"use client";

import type { ReactNode } from "react";
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
import { exportToCSV } from "@/lib/utils/csv-export";

export interface ReportColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: Record<string, unknown>) => ReactNode;
}

interface ReportTableProps {
  columns: ReportColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  exportFilename: string;
  title: string;
  summaryCards?: { label: string; value: string; className?: string }[];
}

export function ReportTable({
  columns,
  data,
  exportFilename,
  title,
  summaryCards,
}: ReportTableProps) {
  const handleExport = () => {
    const exportData = data.map((row) => {
      const obj: Record<string, string | number> = {};
      for (const col of columns) {
        const raw = row[col.key];
        obj[col.key] = col.format ? col.format(raw) : (raw ?? "").toString();
      }
      return obj;
    });
    exportToCSV(
      exportData,
      columns.map((c) => ({ key: c.key, label: c.label })),
      exportFilename
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {summaryCards && summaryCards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
      )}

      {/* Table header with export */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Button variant="outline" size="sm" onClick={handleExport} className="h-8 gap-2">
          <Download size={14} />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {data.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No data for selected period
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={col.align === "right" ? "text-right" : ""}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={col.align === "right" ? "text-right" : ""}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : col.format
                          ? col.format(row[col.key])
                          : String(row[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
