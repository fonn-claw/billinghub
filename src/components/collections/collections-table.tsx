"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/formatting";
import { agingBadgeColors, agingLabels } from "@/lib/utils/aging";
import {
  toggleCollectionsFlag,
  bulkFlag,
  updateReminderDate,
} from "@/app/(admin)/collections/actions";
import {
  MoreHorizontal,
  MessageSquarePlus,
  Bell,
  FlagOff,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import type { CollectionRow, OverdueCustomerRow } from "@/lib/dal/collections";

export function CollectionsTable({
  collections,
  overdueCustomers,
  onOpenNotes,
}: {
  collections: CollectionRow[];
  overdueCustomers: OverdueCustomerRow[];
  onOpenNotes?: (customerId: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === overdueCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(overdueCustomers.map((c) => c.id)));
    }
  }

  async function handleBulkFlag() {
    if (selectedIds.size === 0) return;
    const fd = new FormData();
    fd.set("customerIds", JSON.stringify(Array.from(selectedIds)));
    await bulkFlag(fd);
    setSelectedIds(new Set());
  }

  return (
    <div className="space-y-8">
      {/* Flagged Collections Table */}
      <div>
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Flag className="mx-auto h-10 w-10 mb-3 text-muted-foreground opacity-40" />
            <h3 className="font-heading text-lg text-foreground mb-1">
              No accounts in collections
            </h3>
            <p className="text-sm text-muted-foreground max-w-[360px]">
              Flag overdue customer accounts below to start tracking collections.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dock/Slip</TableHead>
                  <TableHead className="text-right">Total Overdue</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Last Reminder</TableHead>
                  <TableHead>Last Note</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link
                        href={`/customers/${row.id}`}
                        className="font-medium text-[#1B6B93] hover:underline"
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.dock && row.slipNumber
                        ? `${row.dock}-${row.slipNumber}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-red-600">
                      {formatCurrency(row.totalOverdueCents)}
                    </TableCell>
                    <TableCell>
                      {row.agingBucket ? (
                        <Badge
                          variant="outline"
                          className={agingBadgeColors[row.agingBucket]}
                        >
                          {row.maxDaysOverdue}d
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.lastReminderDate
                        ? format(new Date(row.lastReminderDate), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {row.lastNotePreview ?? "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onOpenNotes && (
                            <DropdownMenuItem
                              onClick={() => onOpenNotes(row.id)}
                            >
                              <MessageSquarePlus className="mr-2 h-4 w-4" />
                              Add Note
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              const fd = new FormData();
                              fd.set("customerId", row.id);
                              updateReminderDate(fd);
                            }}
                          >
                            <Bell className="mr-2 h-4 w-4" />
                            Mark Reminder Sent
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const fd = new FormData();
                              fd.set("customerId", row.id);
                              toggleCollectionsFlag(fd);
                            }}
                          >
                            <FlagOff className="mr-2 h-4 w-4" />
                            Unflag
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Unflagged Overdue Customers */}
      {overdueCustomers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg tracking-tight">
              Unflagged Overdue Accounts
            </h3>
            {selectedIds.size > 0 && (
              <Button size="sm" onClick={handleBulkFlag}>
                <Flag className="mr-2 h-4 w-4" />
                Flag {selectedIds.size} Account{selectedIds.size > 1 ? "s" : ""}
              </Button>
            )}
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        selectedIds.size === overdueCustomers.length &&
                        overdueCustomers.length > 0
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total Overdue</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueCustomers.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onCheckedChange={() => toggleSelected(row.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/customers/${row.id}`}
                        className="font-medium text-[#1B6B93] hover:underline"
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-red-600">
                      {formatCurrency(row.totalOverdueCents)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.maxDaysOverdue}d
                    </TableCell>
                    <TableCell>
                      <form
                        action={async (fd: FormData) => {
                          fd.set("customerId", row.id);
                          await toggleCollectionsFlag(fd);
                        }}
                      >
                        <input type="hidden" name="customerId" value={row.id} />
                        <Button type="submit" variant="outline" size="sm">
                          <Flag className="mr-1 h-3 w-3" />
                          Flag
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
