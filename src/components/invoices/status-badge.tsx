import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-200" },
  sent: { label: "Sent", className: "bg-blue-100 text-blue-700 border-blue-200" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700 border-green-200" },
  partial: { label: "Partial", className: "bg-amber-100 text-amber-700 border-amber-200" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700 border-red-200" },
  collections: { label: "Collections", className: "bg-red-200 text-red-900 border-red-300" },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
