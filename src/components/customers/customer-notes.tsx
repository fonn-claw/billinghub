"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { addCustomerNote, type ActionState } from "@/app/(admin)/customers/actions";
import { format } from "date-fns";

function SubmitNoteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
      Add Note
    </Button>
  );
}

interface NoteItem {
  id: string;
  note: string;
  createdAt: Date;
  createdByName: string | null;
}

export function CustomerNotes({
  notes,
  customerId,
}: {
  notes: NoteItem[];
  customerId: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    addCustomerNote,
    null
  );
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (state?.success) {
      setNoteText("");
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-3">
        <input
          type="hidden"
          name="data"
          value={JSON.stringify({ customerId, note: noteText })}
        />
        <Textarea
          placeholder="Add a billing note or communication record..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
        />
        {state?.error && (
          <p className="text-xs text-red-500">{state.error}</p>
        )}
        <div className="flex justify-end">
          <SubmitNoteButton />
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No notes yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="relative pl-6 pb-4 border-l-2 border-muted last:pb-0"
            >
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#1B6B93]" />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-foreground">
                  {note.createdByName ?? "System"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {note.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
