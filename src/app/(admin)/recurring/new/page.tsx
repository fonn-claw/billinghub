import { getCustomerSelectList } from "@/lib/dal/invoices";
import { TemplateForm } from "@/components/recurring/template-form";
import { createTemplate } from "@/app/(admin)/recurring/actions";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function NewTemplatePage() {
  const customers = await getCustomerSelectList();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/recurring" className="hover:text-foreground">
          Recurring
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Template</span>
      </nav>

      <h1
        className="font-heading text-3xl"
        style={{ letterSpacing: "-0.02em" }}
      >
        New Recurring Template
      </h1>

      <TemplateForm customers={customers} action={createTemplate} />
    </div>
  );
}
