"use client";

import { useActionState, useState, type ReactNode } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  recordPayment,
  type PaymentActionState,
} from "@/app/(admin)/payments/actions";
import { CreditCard } from "lucide-react";

export function RecordPaymentDialog({
  invoiceId,
  invoiceNumber,
  balanceCents,
  trigger,
}: {
  invoiceId: string;
  invoiceNumber: string;
  balanceCents: number;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((balanceCents / 100).toFixed(2));
  const [method, setMethod] = useState<string>("bank_transfer");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const wrappedAction = async (
    prevState: PaymentActionState | null,
    formData: FormData
  ): Promise<PaymentActionState> => {
    const result = await recordPayment(prevState, formData);
    if (result.success) {
      setOpen(false);
      // Reset form
      setAmount((balanceCents / 100).toFixed(2));
      setMethod("bank_transfer");
      setReference("");
      setNotes("");
    }
    return result;
  };

  const [state, formAction, pending] = useActionState(wrappedAction, null);

  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const isValidAmount = amountCents > 0 && amountCents <= balanceCents;

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set(
      "data",
      JSON.stringify({
        invoiceId,
        amountCents,
        method,
        reference,
        paymentDate,
        notes,
      })
    );
    return fd;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            <span />
          ) : (
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )
        }
      >
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form
          action={() => {
            const fd = buildFormData();
            formAction(fd);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={(balanceCents / 100).toFixed(2)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {!isValidAmount && amount !== "" && (
              <p className="text-xs text-red-500">
                Amount must be between $0.01 and $
                {(balanceCents / 100).toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={(val) => { if (val) setMethod(val); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reference (optional)</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Check #, CC last 4, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending || !isValidAmount}>
              {pending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
