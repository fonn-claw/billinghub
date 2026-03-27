"use client";

import { useActionState, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineItemRow, type LineItemData } from "@/components/invoices/line-item-row";
import { formatCurrency } from "@/lib/formatting";
import { Plus } from "lucide-react";
import type { ActionState } from "@/app/(admin)/invoices/actions";

type CustomerOption = {
  id: string;
  name: string;
  dock: string | null;
  slipNumber: string | null;
};

export type InvoiceFormData = {
  customerId: string;
  issueDate: string;
  dueDate: string;
  taxRate: number;
  notes: string;
  items: LineItemData[];
};

const EMPTY_ITEM: LineItemData = {
  category: "slip_rental",
  description: "",
  quantity: 1,
  unitPriceCents: 0,
};

function getDefaultDates() {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);
  return {
    issueDate: today.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
  };
}

export function InvoiceForm({
  customers,
  defaultValues,
  action,
  submitLabel,
  invoiceId,
}: {
  customers: CustomerOption[];
  defaultValues?: InvoiceFormData;
  action: (prevState: ActionState | null, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  invoiceId?: string;
}) {
  const defaults = getDefaultDates();

  const [customerId, setCustomerId] = useState(defaultValues?.customerId ?? "");
  const [issueDate, setIssueDate] = useState(defaultValues?.issueDate ?? defaults.issueDate);
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate ?? defaults.dueDate);
  const [taxRatePercent, setTaxRatePercent] = useState(
    defaultValues ? (defaultValues.taxRate * 100).toFixed(1) : "8.5"
  );
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [items, setItems] = useState<LineItemData[]>(
    defaultValues?.items?.length ? defaultValues.items : [{ ...EMPTY_ITEM }]
  );

  const [state, formAction, pending] = useActionState(action, null);

  const taxRate = parseFloat(taxRatePercent || "0") / 100;
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0
  );
  const taxAmountCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxAmountCents;

  const handleItemUpdate = useCallback(
    (index: number, field: string, value: string | number) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const handleItemRemove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }, []);

  function buildFormData(): FormData {
    const fd = new FormData();
    if (invoiceId) {
      fd.set("invoiceId", invoiceId);
    }
    fd.set(
      "data",
      JSON.stringify({
        customerId,
        issueDate,
        dueDate,
        taxRate,
        notes,
        items: items.map((item) => ({
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        })),
      })
    );
    return fd;
  }

  return (
    <form
      action={() => {
        const fd = buildFormData();
        formAction(fd);
      }}
      className="space-y-8"
    >
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Customer and dates */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold">Invoice Details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Customer</Label>
            <Select
              value={customerId}
              onValueChange={(val) => {
                if (val) setCustomerId(val);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.dock || c.slipNumber
                      ? ` (${[c.dock ? `Dock ${c.dock}` : "", c.slipNumber ? `Slip ${c.slipNumber}` : ""].filter(Boolean).join(", ")})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Issue Date</Label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Line Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-left">Unit Price</th>
                <th className="p-2 text-right">Amount</th>
                <th className="w-10 p-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <LineItemRow
                  key={i}
                  index={i}
                  item={item}
                  onUpdate={handleItemUpdate}
                  onRemove={handleItemRemove}
                  canRemove={items.length > 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax rate, notes, and totals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              value={taxRatePercent}
              min={0}
              max={100}
              step="0.1"
              onChange={(e) => setTaxRatePercent(e.target.value)}
              className="w-32"
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the invoice..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs rounded-xl border border-border bg-[#F6F8FB] p-6 dark:bg-[#0E1824]">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Tax ({taxRatePercent}%)
                </span>
                <span className="tabular-nums">{formatCurrency(taxAmountCents)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-2xl font-bold tabular-nums">
                    {formatCurrency(totalCents)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
