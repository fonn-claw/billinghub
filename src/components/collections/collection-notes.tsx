"use client";

import { useActionState } from "react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare, HandCoins } from "lucide-react";
import { useFormStatus } from "react-dom";
import {
  addCollectionNote,
  type ActionState,
} from "@/app/(admin)/collections/actions";
import { formatCurrency } from "@/lib/formatting";
import { format, isPast, parseISO } from "date-fns";
import type { CollectionNoteRow } from "@/lib/dal/collections";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
      {label}
    </Button>
  );
}

export function CollectionNotes({
  notes,
  customerId,
}: {
  notes: CollectionNoteRow[];
  customerId: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    addCollectionNote,
    null
  );
  const [noteType, setNoteType] = useState<"note" | "promise_to_pay">("note");
  const [noteText, setNoteText] = useState("");
  const [promisedDate, setPromisedDate] = useState("");
  const [promisedAmount, setPromisedAmount] = useState("");

  useEffect(() => {
    if (state?.success) {
      setNoteText("");
      setPromisedDate("");
      setPromisedAmount("");
      setNoteType("note");
    }
  }, [state]);

  const formData = {
    customerId,
    noteType,
    note: noteText,
    promisedDate: noteType === "promise_to_pay" ? promisedDate : "",
    promisedAmountCents:
      noteType === "promise_to_pay" && promisedAmount
        ? Math.round(parseFloat(promisedAmount) * 100)
        : null,
  };

  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <form action={formAction} className="space-y-3">
        <input
          type="hidden"
          name="data"
          value={JSON.stringify(formData)}
        />

        {/* Note Type Toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
          <button
            type="button"
            onClick={() => setNoteType("note")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              noteType === "note"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Note
          </button>
          <button
            type="button"
            onClick={() => setNoteType("promise_to_pay")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              noteType === "promise_to_pay"
                ? "bg-[#E8AA42]/10 text-[#E8AA42] shadow-sm border border-[#E8AA42]/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HandCoins className="inline mr-1 h-3 w-3" />
            Promise to Pay
          </button>
        </div>

        <Textarea
          placeholder={
            noteType === "note"
              ? "Add a collection note..."
              : "Record promise details..."
          }
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
        />

        {noteType === "promise_to_pay" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="promisedDate" className="text-xs">
                Promised Date
              </Label>
              <Input
                id="promisedDate"
                type="date"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promisedAmount" className="text-xs">
                Promised Amount ($)
              </Label>
              <Input
                id="promisedAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={promisedAmount}
                onChange={(e) => setPromisedAmount(e.target.value)}
              />
            </div>
          </div>
        )}

        {state?.error && (
          <p className="text-xs text-red-500">{state.error}</p>
        )}

        <div className="flex justify-end">
          <SubmitButton
            label={noteType === "note" ? "Add Note" : "Record Promise"}
          />
        </div>
      </form>

      {/* Notes Timeline */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No collection notes yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const isPromise = note.noteType === "promise_to_pay";
            const isPromiseOverdue =
              isPromise &&
              note.promisedDate &&
              isPast(parseISO(note.promisedDate));

            return (
              <div
                key={note.id}
                className={`relative pl-6 pb-4 border-l-2 last:pb-0 ${
                  isPromise ? "border-[#E8AA42]/50" : "border-muted"
                }`}
              >
                <div
                  className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${
                    isPromise ? "bg-[#E8AA42]" : "bg-[#1B6B93]"
                  }`}
                />
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">
                    {note.createdByName ?? "System"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(
                      new Date(note.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                  {isPromise && (
                    <Badge
                      variant="outline"
                      className="bg-[#E8AA42]/10 text-[#E8AA42] border-[#E8AA42]/30 text-[10px]"
                    >
                      Promise to Pay
                    </Badge>
                  )}
                  {isPromiseOverdue && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-600 border-red-300 text-[10px]"
                    >
                      OVERDUE
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.note}
                </p>
                {isPromise && (
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    {note.promisedDate && (
                      <span>
                        Promised Date:{" "}
                        <span className="font-medium text-foreground">
                          {format(parseISO(note.promisedDate), "MMM d, yyyy")}
                        </span>
                      </span>
                    )}
                    {note.promisedAmountCents != null && (
                      <span>
                        Promised Amount:{" "}
                        <span className="font-medium text-foreground">
                          {formatCurrency(note.promisedAmountCents)}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
