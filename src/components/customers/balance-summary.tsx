import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatting";

interface BalanceSummaryProps {
  totalCharged: number;
  totalPaid: number;
  currentBalance: number;
  overdueAmount: number;
}

export function BalanceSummary({
  totalCharged,
  totalPaid,
  currentBalance,
  overdueAmount,
}: BalanceSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card size="sm">
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Charged
          </p>
          <p className="text-xl font-bold tabular-nums mt-1">
            {formatCurrency(totalCharged)}
          </p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Paid
          </p>
          <p className="text-xl font-bold tabular-nums mt-1 text-[#1B9C6B]">
            {formatCurrency(totalPaid)}
          </p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Current Balance
          </p>
          <p className="text-xl font-bold tabular-nums mt-1 text-[#1B6B93]">
            {formatCurrency(currentBalance)}
          </p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Overdue
          </p>
          <p
            className={`text-xl font-bold tabular-nums mt-1 ${
              overdueAmount > 0 ? "text-[#DC3545]" : "text-muted-foreground"
            }`}
          >
            {formatCurrency(overdueAmount)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
