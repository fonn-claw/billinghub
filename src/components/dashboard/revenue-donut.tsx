"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTooltip } from "./custom-tooltip";
import { formatCurrency } from "@/lib/formatting";

type RevenueDonutProps = {
  data: { category: string; totalCents: number }[];
};

const COLORS = ["#1B6B93", "#E8AA42", "#0C2D48", "#1B9C6B", "#DC3545", "#6B7A8D"];

const categoryLabels: Record<string, string> = {
  slip_rental: "Slip Rental",
  fuel: "Fuel",
  maintenance: "Maintenance",
  amenity: "Amenity",
  service: "Service",
  other: "Other",
};

export function RevenueDonut({ data }: RevenueDonutProps) {
  const chartData = data.map((d) => ({
    name: categoryLabels[d.category] ?? d.category,
    value: d.totalCents,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                cornerRadius={4}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <CustomTooltip formatValue={(v) => formatCurrency(v)} />
                }
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
