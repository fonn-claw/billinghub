"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/invoice-pdf";
import type { InvoiceDetail } from "@/lib/dal/invoices";

export function InvoicePDFLink({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} />}
      fileName={`invoice-${invoice.invoiceNumber}.pdf`}
    >
      {({ loading }) => (
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-btn-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
          disabled={loading}
        >
          {loading ? "Preparing PDF..." : "Download PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
