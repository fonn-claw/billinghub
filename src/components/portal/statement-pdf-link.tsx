"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { StatementPDF } from "@/components/pdf/statement-pdf";
import type { StatementProps } from "@/components/pdf/statement-pdf";

export function StatementPDFLink({ statementData }: { statementData: StatementProps }) {
  return (
    <PDFDownloadLink
      document={<StatementPDF {...statementData} />}
      fileName={`statement-${statementData.periodLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`}
    >
      {({ loading }) => (
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted"
          disabled={loading}
        >
          {loading ? "Generating..." : "Download Statement"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
