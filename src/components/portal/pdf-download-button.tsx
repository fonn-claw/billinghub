"use client";

import dynamic from "next/dynamic";
import type { InvoiceDetail } from "@/lib/dal/invoices";

const InvoicePDFDownload = dynamic(
  () =>
    import("./invoice-pdf-link").then((mod) => mod.InvoicePDFLink),
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

export function PDFDownloadButton({ invoice }: { invoice: InvoiceDetail }) {
  return <InvoicePDFDownload invoice={invoice} />;
}
