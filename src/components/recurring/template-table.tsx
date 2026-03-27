"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  toggleTemplate,
  generateInvoice,
  bulkGenerate,
  type RecurringActionState,
} from "@/app/(admin)/recurring/actions";
import { MoreHorizontal, Play, Zap } from "lucide-react";
import type { TemplateRow } from "@/lib/dal/recurring";

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

function TemplateActions({ template }: { template: TemplateRow }) {
  const [genState, genAction, genPending] = useActionState(generateInvoice, null);

  return (
    <div className="flex items-center gap-2">
      {genState?.success && (
        <span className="text-xs text-green-600">Invoice created</span>
      )}
      {genState?.error && (
        <span className="text-xs text-red-600">{genState.error}</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              const fd = new FormData();
              fd.set("templateId", template.id);
              genAction(fd);
            }}
            disabled={genPending}
          >
            <Play className="mr-2 h-4 w-4" />
            {genPending ? "Generating..." : "Generate Invoice"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const fd = new FormData();
              fd.set("templateId", template.id);
              toggleTemplate(fd);
            }}
          >
            {template.active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function TemplateTable({
  templates,
  dueCount,
}: {
  templates: TemplateRow[];
  dueCount: number;
}) {
  const [bulkState, bulkAction, bulkPending] = useActionState(bulkGenerate, null);

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12">
        <p className="mb-2 text-sm text-muted-foreground">
          No recurring templates yet
        </p>
        <Link href="/recurring/new">
          <Button variant="outline" size="sm">
            Create Your First Template
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dueCount > 0 && (
        <div className="flex items-center gap-3">
          <form
            action={() => {
              const fd = new FormData();
              bulkAction(fd);
            }}
          >
            <Button type="submit" disabled={bulkPending} variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              {bulkPending
                ? "Generating..."
                : `Bulk Generate (${dueCount} due)`}
            </Button>
          </form>
          {bulkState?.success && (
            <span className="text-sm text-green-600">
              {bulkState.count} invoice{bulkState.count !== 1 ? "s" : ""}{" "}
              generated
            </span>
          )}
          {bulkState?.error && (
            <span className="text-sm text-red-600">{bulkState.error}</span>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Invoice</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>
                  <Link
                    href={`/customers/${template.customerId}`}
                    className="text-[#1B6B93] hover:underline"
                  >
                    {template.customerName}
                  </Link>
                </TableCell>
                <TableCell>
                  {FREQUENCY_LABELS[template.frequency] ?? template.frequency}
                </TableCell>
                <TableCell>{template.nextInvoiceDate}</TableCell>
                <TableCell>
                  <form
                    action={(fd: FormData) => {
                      toggleTemplate(fd);
                    }}
                  >
                    <input
                      type="hidden"
                      name="templateId"
                      value={template.id}
                    />
                    <Switch
                      checked={template.active}
                      onCheckedChange={() => {
                        const fd = new FormData();
                        fd.set("templateId", template.id);
                        toggleTemplate(fd);
                      }}
                    />
                  </form>
                </TableCell>
                <TableCell className="text-right">
                  <TemplateActions template={template} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
