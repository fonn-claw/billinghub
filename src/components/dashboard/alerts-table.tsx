import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatting";
import { getAgingBucket, agingBadgeColors, agingLabels } from "@/lib/utils/aging";
import type { TopOverdueCustomerRow } from "@/lib/dal/dashboard";

type AlertsTableProps = {
  customers: TopOverdueCustomerRow[];
};

function AgingBadge({ daysOverdue }: { daysOverdue: number }) {
  // Convert days to a rough bucket
  let bucket: "current" | "30day" | "60day" | "90plus";
  if (daysOverdue <= 30) bucket = "current";
  else if (daysOverdue <= 60) bucket = "30day";
  else if (daysOverdue <= 90) bucket = "60day";
  else bucket = "90plus";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${agingBadgeColors[bucket]}`}
    >
      {agingLabels[bucket]}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No payments";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AlertsTable({ customers }: AlertsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding Balance Alerts</CardTitle>
        <CardDescription>
          Customers with highest overdue balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No outstanding balances -- great job!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead className="text-right">Total Overdue</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Last Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.customerId}>
                  <TableCell>
                    <Link
                      href={`/customers/${c.customerId}`}
                      className="font-medium text-[#1B6B93] hover:underline"
                    >
                      {c.customerName}
                    </Link>
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    style={{ color: "#DC3545" }}
                  >
                    {formatCurrency(c.totalOverdueCents)}
                  </TableCell>
                  <TableCell>
                    <AgingBadge daysOverdue={c.oldestDaysOverdue} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.lastPaymentDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
