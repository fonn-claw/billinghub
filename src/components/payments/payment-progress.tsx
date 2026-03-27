"use client";

import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatting";

export function PaymentProgress({
  totalCents,
  paidCents,
}: {
  totalCents: number;
  paidCents: number;
}) {
  const percent =
    totalCents > 0 ? Math.min(100, Math.round((paidCents / totalCents) * 100)) : 0;
  const isPaid = paidCents >= totalCents;

  return (
    <div className="space-y-2">
      <Progress
        value={percent}
        className={isPaid ? "[&>[data-slot=progress-indicator]]:bg-green-500" : "[&>[data-slot=progress-indicator]]:bg-amber-500"}
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {formatCurrency(paidCents)} of {formatCurrency(totalCents)} paid
      </p>
    </div>
  );
}
