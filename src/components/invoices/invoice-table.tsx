"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatting";
import { agingBadgeColors, agingLabels, type AgingBucket } from "@/lib/utils/aging";
import { MoreHorizontal, Eye, Pencil, Trash2, Search } from "lucide-react";
import type { InvoiceRow } from "@/lib/dal/invoices";
import { deleteInvoice } from "@/app/(admin)/invoices/actions";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "partial", label: "Partial" },
];

export function InvoiceTable({
  invoices,
  activeTab,
}: {
  invoices: InvoiceRow[];
  activeTab: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function handleTabChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.delete("search");
    router.push(`/invoices?${params.toString()}`);
  }

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/invoices?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Tabs
          value={activeTab}
          onValueChange={(val) => handleTabChange(val || null)}
        >
          <TabsList variant="line">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9"
          />
        </form>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-16">
          <img
            src="/assets/empty-invoices.svg"
            alt=""
            className="mb-6 h-40 w-50 opacity-80"
          />
          <h3 className="font-heading text-xl text-foreground">
            Create your first invoice
          </h3>
          <p className="mt-2 max-w-[360px] text-center text-sm text-muted-foreground">
            Start billing your marina customers by creating an invoice with
            multiple revenue line items.
          </p>
          <Link href="/invoices/new">
            <Button className="mt-6">New Invoice</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                >
                  <TableCell className="font-medium">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/customers/${inv.customerId}`}
                      className="text-[#1B6B93] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {inv.customerName}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.issueDate}</TableCell>
                  <TableCell>{inv.dueDate}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(inv.totalCents)}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      inv.status === "overdue" || inv.status === "collections"
                        ? "text-red-600 font-medium"
                        : ""
                    }`}
                  >
                    {formatCurrency(inv.balanceCents)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>
                    {inv.agingBucket && (
                      <Badge
                        variant="outline"
                        className={agingBadgeColors[inv.agingBucket as AgingBucket]}
                      >
                        {agingLabels[inv.agingBucket as AgingBucket]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        render={
                          <Button variant="ghost" size="icon-sm" />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/invoices/${inv.id}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {inv.status === "draft" && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/invoices/${inv.id}/edit`);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    "Are you sure you want to delete this invoice?"
                                  )
                                ) {
                                  const fd = new FormData();
                                  fd.set("invoiceId", inv.id);
                                  deleteInvoice(fd);
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
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
  );
}
