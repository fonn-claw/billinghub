"use client";

import dynamic from "next/dynamic";
import type { StatementProps } from "@/components/pdf/statement-pdf";

const StatementPDFDownload = dynamic(
  () =>
    import("./statement-pdf-link").then((mod) => mod.StatementPDFLink),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
      >
        Preparing PDF...
      </button>
    ),
  }
);

export function StatementDownloadButton({ statementData }: { statementData: StatementProps }) {
  return <StatementPDFDownload statementData={statementData} />;
}
