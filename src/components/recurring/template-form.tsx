"use client";

import { useActionState, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { RecurringActionState } from "@/app/(admin)/recurring/actions";

type CustomerOption = {
  id: string;
  name: string;
  dock: string | null;
  slipNumber: string | null;
};

const EMPTY_ITEM: LineItemData = {
  category: "slip_rental",
  description: "",
  quantity: 1,
  unitPriceCents: 0,
};

export function TemplateForm({
  customers,
  action,
}: {
  customers: CustomerOption[];
  action: (
    prevState: RecurringActionState | null,
    formData: FormData
  ) => Promise<RecurringActionState>;
}) {
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [frequency, setFrequency] = useState<string>("monthly");
  const [nextInvoiceDate, setNextInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<LineItemData[]>([{ ...EMPTY_ITEM }]);

  const [state, formAction, pending] = useActionState(action, null);

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0
  );

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
    fd.set(
      "data",
      JSON.stringify({
        name,
        customerId,
        frequency,
        nextInvoiceDate,
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

      {/* Template Details */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold">Template Details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Template Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Slip Rental - Dock A"
            />
          </div>

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
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(val) => {
                if (val) setFrequency(val);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Next Invoice Date</Label>
            <Input
              type="date"
              value={nextInvoiceDate}
              onChange={(e) => setNextInvoiceDate(e.target.value)}
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

        <div className="mt-4 flex justify-end">
          <div className="w-64 rounded-lg bg-[#F6F8FB] p-4 dark:bg-[#0E1824]">
            <div className="flex justify-between text-sm font-semibold">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotalCents)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
