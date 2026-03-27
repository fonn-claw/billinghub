"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTooltip } from "./custom-tooltip";
import { formatCurrency } from "@/lib/formatting";
import { agingLabels, type AgingBucket } from "@/lib/utils/aging";

type AgingChartProps = {
  data: { bucket: string; totalCents: number; count: number }[];
};

const bucketColors: Record<string, string> = {
  current: "#1B9C6B",
  "30day": "#E8AA42",
  "60day": "#D4922A",
  "90plus": "#DC3545",
};

const bucketOrder: AgingBucket[] = ["current", "30day", "60day", "90plus"];

export function AgingChart({ data }: AgingChartProps) {
  // Ensure all buckets are present and in order
  const chartData = bucketOrder.map((bucket) => {
    const found = data.find((d) => d.bucket === bucket);
    return {
      bucket,
      label: agingLabels[bucket],
      totalCents: found?.totalCents ?? 0,
      count: found?.count ?? 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts Receivable Aging</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#EEF1F6"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#6B7A8D" }}
                tickFormatter={(v: number) => formatCurrency(v)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6B7A8D" }}
                width={120}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={
                  <CustomTooltip formatValue={(v) => formatCurrency(v)} />
                }
              />
              <Bar
                dataKey="totalCents"
                name="Amount"
                animationDuration={600}
                animationEasing="ease-out"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.bucket}
                    fill={bucketColors[entry.bucket] ?? "#6B7A8D"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
