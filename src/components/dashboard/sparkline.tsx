"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

type SparklineProps = {
  data: { value: number }[];
  color?: string;
  width?: number;
  height?: number;
};

export function Sparkline({
  data,
  color = "#1B6B93",
  width = 100,
  height = 40,
}: SparklineProps) {
  if (!data.length) return null;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
