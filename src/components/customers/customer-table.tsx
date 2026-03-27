"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, User, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";
import Image from "next/image";

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  dock: string | null;
  slipNumber: string | null;
  vesselName: string | null;
  isCollectionsFlagged: boolean;
  outstandingBalance: number;
}

export function CustomerTable({
  customers,
  docks,
}: {
  customers: CustomerRow[];
  docks: string[];
}) {
  const [search, setSearch] = useState("");
  const [dockFilter, setDockFilter] = useState("all");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesDock = dockFilter === "all" || c.dock === dockFilter;
    return matchesSearch && matchesDock;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={dockFilter} onValueChange={(val) => setDockFilter(val as string)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Docks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Docks</SelectItem>
            {docks.map((d) => (
              <SelectItem key={d} value={d}>
                Dock {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Image
            src="/assets/empty-customers.svg"
            alt=""
            width={200}
            height={160}
            className="mb-4 opacity-60"
          />
          <h3 className="font-heading text-lg text-foreground mb-1">
            No customers found
          </h3>
          <p className="text-sm text-muted-foreground max-w-[360px]">
            {search || dockFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first customer to get started."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Dock / Slip</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium text-foreground hover:text-[#1B6B93] transition-colors"
                    >
                      {customer.name}
                    </Link>
                    {customer.isCollectionsFlagged && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-red-200">
                        Collections
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    {customer.dock && customer.slipNumber
                      ? `${customer.dock}-${customer.slipNumber}`
                      : customer.dock ?? customer.slipNumber ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.vesselName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span
                      className={
                        Number(customer.outstandingBalance) > 0
                          ? "text-red-600 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {formatCurrency(Number(customer.outstandingBalance))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`/customers/${customer.id}`} />}
                        >
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={<Link href={`/customers/${customer.id}/edit`} />}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
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
  );
}
