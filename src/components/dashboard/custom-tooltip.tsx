"use client";

import { formatCurrency } from "@/lib/formatting";

type TooltipPayloadEntry = {
  color?: string;
  name?: string;
  value?: number;
  dataKey?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  formatValue?: (v: number) => string;
};

export function CustomTooltip({
  active,
  payload,
  label,
  formatValue,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const fmt = formatValue ?? ((v: number) => formatCurrency(v));

  return (
    <div
      className="rounded-xl border border-border bg-white px-3 py-2 shadow-md dark:bg-card"
      style={{ borderRadius: 12 }}
    >
      {label && (
        <p
          className="mb-1 text-sm font-semibold"
          style={{ color: "#0C2D48", fontSize: 14 }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color ?? "#1B6B93" }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium" style={{ color: "#0C2D48" }}>
            {fmt(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}
