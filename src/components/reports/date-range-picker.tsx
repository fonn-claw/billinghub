"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  startOfYear,
  format,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

type Preset = "this-month" | "last-month" | "this-quarter" | "ytd" | "custom";

const presets: { key: Preset; label: string }[] = [
  { key: "this-month", label: "This Month" },
  { key: "last-month", label: "Last Month" },
  { key: "this-quarter", label: "This Quarter" },
  { key: "ytd", label: "YTD" },
  { key: "custom", label: "Custom Range" },
];

function getPresetDates(preset: Preset): { start: string; end: string } | null {
  const today = new Date();
  switch (preset) {
    case "this-month":
      return {
        start: format(startOfMonth(today), "yyyy-MM-dd"),
        end: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "last-month": {
      const lastMonth = subMonths(today, 1);
      return {
        start: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        end: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      };
    }
    case "this-quarter":
      return {
        start: format(startOfQuarter(today), "yyyy-MM-dd"),
        end: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "ytd":
      return {
        start: format(startOfYear(today), "yyyy-MM-dd"),
        end: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "custom":
      return null;
  }
}

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<Preset>("this-month");

  const handlePresetClick = (preset: Preset) => {
    setActivePreset(preset);
    const dates = getPresetDates(preset);
    if (dates) {
      onChange(dates.start, dates.end);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar size={16} className="text-muted-foreground" />
      {presets.map((p) => (
        <Button
          key={p.key}
          variant={activePreset === p.key ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(p.key)}
          className="h-8 text-xs"
        >
          {p.label}
        </Button>
      ))}
      {activePreset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          />
        </div>
      )}
    </div>
  );
}
