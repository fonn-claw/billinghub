import { differenceInDays } from "date-fns";

export type AgingBucket = "current" | "30day" | "60day" | "90plus";

export function getAgingBucket(dueDate: string | Date, asOf: Date = new Date()): AgingBucket | null {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const daysOverdue = differenceInDays(asOf, due);
  if (daysOverdue <= 0) return null; // not overdue
  if (daysOverdue <= 30) return "current";
  if (daysOverdue <= 60) return "30day";
  if (daysOverdue <= 90) return "60day";
  return "90plus";
}

export const agingColors: Record<AgingBucket, string> = {
  current: "text-green-600",
  "30day": "text-yellow-600",
  "60day": "text-orange-500",
  "90plus": "text-red-600",
};

export const agingBadgeColors: Record<AgingBucket, string> = {
  current: "bg-green-100 text-green-700 border-green-200",
  "30day": "bg-amber-100 text-amber-700 border-amber-200",
  "60day": "bg-orange-100 text-orange-700 border-orange-200",
  "90plus": "bg-red-100 text-red-700 border-red-200",
};

export const agingLabels: Record<AgingBucket, string> = {
  current: "Current (1-30 days)",
  "30day": "30 Day (31-60)",
  "60day": "60 Day (61-90)",
  "90plus": "90+ Days",
};
