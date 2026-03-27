"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
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
import { Loader2 } from "lucide-react";
import type { CreateCustomerInput } from "@/lib/utils/validation";
import type { ActionState } from "@/app/(admin)/customers/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

interface CustomerFormProps {
  defaultValues?: Partial<CreateCustomerInput>;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  onSuccess?: (customerId?: string) => void;
  extraFields?: React.ReactNode;
}

export function CustomerForm({
  defaultValues,
  action,
  submitLabel,
  onSuccess,
  extraFields,
}: CustomerFormProps) {
  const [state, formAction] = useActionState(action, null);
  const [formValues, setFormValues] = useState<Partial<CreateCustomerInput>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    vesselName: "",
    vesselType: undefined,
    vesselLength: null,
    dock: "",
    slipNumber: "",
    notes: "",
    ...defaultValues,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess(state.customerId);
    }
  }, [state, onSuccess]);

  function handleChange(field: keyof CreateCustomerInput, value: string | number | null | undefined) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  function getFieldError(field: string): string | undefined {
    return state?.fieldErrors?.[field]?.[0];
  }

  return (
    <form action={formAction} ref={formRef} className="space-y-4">
      <input type="hidden" name="data" value={JSON.stringify(formValues)} />
      {extraFields}

      {state?.error && !state.fieldErrors && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formValues.name ?? ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Customer name"
          required
        />
        {getFieldError("name") && (
          <p className="text-xs text-red-500">{getFieldError("name")}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formValues.email ?? ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="email@example.com"
          />
          {getFieldError("email") && (
            <p className="text-xs text-red-500">{getFieldError("email")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formValues.phone ?? ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formValues.address ?? ""}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vesselName">Vessel Name</Label>
          <Input
            id="vesselName"
            value={formValues.vesselName ?? ""}
            onChange={(e) => handleChange("vesselName", e.target.value)}
            placeholder="S/V Sea Breeze"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vesselType">Vessel Type</Label>
          <Select
            value={formValues.vesselType ?? ""}
            onValueChange={(val) =>
              handleChange("vesselType", (val as string) || undefined)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sailboat">Sailboat</SelectItem>
              <SelectItem value="powerboat">Powerboat</SelectItem>
              <SelectItem value="catamaran">Catamaran</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vesselLength">Length (ft)</Label>
          <Input
            id="vesselLength"
            type="number"
            value={formValues.vesselLength ?? ""}
            onChange={(e) =>
              handleChange(
                "vesselLength",
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            placeholder="32"
            min={1}
            max={200}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dock">Dock</Label>
          <Select
            value={formValues.dock ?? ""}
            onValueChange={(val) => handleChange("dock", val as string)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Dock A</SelectItem>
              <SelectItem value="B">Dock B</SelectItem>
              <SelectItem value="C">Dock C</SelectItem>
              <SelectItem value="D">Dock D</SelectItem>
              <SelectItem value="E">Dock E</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="slipNumber">Slip #</Label>
          <Input
            id="slipNumber"
            value={formValues.slipNumber ?? ""}
            onChange={(e) => handleChange("slipNumber", e.target.value)}
            placeholder="A-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formValues.notes ?? ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="General notes about this customer"
          rows={3}
        />
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
