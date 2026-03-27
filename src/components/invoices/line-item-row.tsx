"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

export type LineItemData = {
  category: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
};

const CATEGORIES = [
  { value: "slip_rental", label: "Slip Rental" },
  { value: "fuel", label: "Fuel" },
  { value: "maintenance", label: "Maintenance" },
  { value: "amenity", label: "Amenity" },
  { value: "service", label: "Service" },
  { value: "other", label: "Other" },
];

export function LineItemRow({
  index,
  item,
  onUpdate,
  onRemove,
  canRemove,
}: {
  index: number;
  item: LineItemData;
  onUpdate: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const amountCents = item.quantity * item.unitPriceCents;

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="p-2">
        <Select
          value={item.category}
          onValueChange={(val) => {
            if (val) onUpdate(index, "category", val);
          }}
        >
          <SelectTrigger className="w-full min-w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Input
          value={item.description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          placeholder="Description"
          className="min-w-[200px]"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          value={item.quantity}
          min={1}
          onChange={(e) =>
            onUpdate(index, "quantity", Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-20"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          value={(item.unitPriceCents / 100).toFixed(2)}
          min={0}
          step="0.01"
          onChange={(e) =>
            onUpdate(
              index,
              "unitPriceCents",
              Math.round(parseFloat(e.target.value || "0") * 100)
            )
          }
          className="w-28"
        />
      </td>
      <td className="p-2 text-right tabular-nums font-medium">
        {formatCurrency(amountCents)}
      </td>
      <td className="p-2">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  );
}
