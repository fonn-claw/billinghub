import Link from "next/link";
import { getTemplates, getDueTemplates } from "@/lib/dal/recurring";
import { TemplateTable } from "@/components/recurring/template-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus } from "lucide-react";

export default async function RecurringPage() {
  const templates = await getTemplates();
  const dueTemplates = await getDueTemplates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B6B93]/10">
            <RefreshCw className="h-5 w-5 text-[#1B6B93]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="font-heading text-3xl"
                style={{ letterSpacing: "-0.02em" }}
              >
                Recurring Templates
              </h1>
              {dueTemplates.length > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {dueTemplates.length} due
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {templates.length} template{templates.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Link href="/recurring/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      <TemplateTable templates={templates} dueCount={dueTemplates.length} />
    </div>
  );
}
