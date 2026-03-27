"use client";

import { Button } from "@/components/ui/button";
import {
  toggleCollectionsFlag,
  updateReminderDate,
} from "@/app/(admin)/collections/actions";
import { Bell, FlagOff } from "lucide-react";
import { format } from "date-fns";

export function CollectionsSection({
  customerId,
  lastReminderDate,
}: {
  customerId: string;
  lastReminderDate: string | null;
}) {
  return (
    <div className="space-y-4">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Last Reminder Sent</dt>
          <dd className="font-medium">
            {lastReminderDate
              ? format(new Date(lastReminderDate), "MMM d, yyyy")
              : "Never sent"}
          </dd>
        </div>
      </dl>
      <div className="flex gap-2">
        <form
          action={async (fd: FormData) => {
            fd.set("customerId", customerId);
            await updateReminderDate(fd);
          }}
        >
          <input type="hidden" name="customerId" value={customerId} />
          <Button type="submit" variant="outline" size="sm">
            <Bell className="mr-1 h-3 w-3" />
            Mark Reminder Sent
          </Button>
        </form>
        <form
          action={async (fd: FormData) => {
            fd.set("customerId", customerId);
            await toggleCollectionsFlag(fd);
          }}
        >
          <input type="hidden" name="customerId" value={customerId} />
          <Button type="submit" variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
            <FlagOff className="mr-1 h-3 w-3" />
            Remove from Collections
          </Button>
        </form>
      </div>
    </div>
  );
}
