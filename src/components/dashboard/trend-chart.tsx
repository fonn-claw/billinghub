"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTooltip } from "./custom-tooltip";

type TrendChartProps = {
  data: { month: string; collectionRate: number }[];
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(value: string): string {
  // value is "YYYY-MM"
  const parts = value.split("-");
  const monthIdx = parseInt(parts[1], 10) - 1;
  return MONTH_NAMES[monthIdx] ?? value;
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#EEF1F6"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#6B7A8D" }}
                tickFormatter={formatMonth}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#6B7A8D" }}
                tickFormatter={(v: number) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    formatValue={(v) => `${v.toFixed(1)}%`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="collectionRate"
                name="Collection Rate"
                stroke="#0C2D48"
                fill="#1B6B93"
                fillOpacity={0.12}
                strokeWidth={2}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
