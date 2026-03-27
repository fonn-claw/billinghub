import { getCollections, getOverdueCustomers } from "@/lib/dal/collections";
import { CollectionsTable } from "@/components/collections/collections-table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default async function CollectionsPage() {
  const [collections, overdueCustomers] = await Promise.all([
    getCollections(),
    getOverdueCustomers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-3xl tracking-tight">Collections</h1>
        {collections.length > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">
            {collections.length} flagged
          </Badge>
        )}
      </div>

      {overdueCustomers.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            {overdueCustomers.length} customer{overdueCustomers.length > 1 ? "s" : ""}{" "}
            with overdue invoices {overdueCustomers.length > 1 ? "are" : "is"} not yet
            flagged for collections.
          </span>
        </div>
      )}

      <CollectionsTable
        collections={collections}
        overdueCustomers={overdueCustomers}
      />
    </div>
  );
}
