import { Document, Page, View, Text } from "@react-pdf/renderer";
import "./pdf-fonts";
import { pdfStyles as s } from "./pdf-styles";
import { WavePatternPDF } from "./wave-pattern";
import type { InvoiceDetail } from "@/lib/dal/invoices";

function fmtMoney(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function categoryLabel(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function InvoicePDF({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={{ fontSize: 18, fontWeight: 700, fontFamily: "Inter", color: "#0C2D48" }}>
            BillingHub
          </Text>
          <Text style={s.headerTitle}>INVOICE</Text>
        </View>

        {/* Accent line */}
        <View style={s.accentLine} />

        {/* Bill-to / Invoice details */}
        <View style={s.twoCol}>
          <View style={{ width: "50%" }}>
            <Text style={s.label}>Bill To</Text>
            <Text style={s.value}>{invoice.customerName}</Text>
            {invoice.customerEmail && (
              <Text style={{ ...s.value, fontSize: 10, color: "#6B7A8D" }}>
                {invoice.customerEmail}
              </Text>
            )}
          </View>
          <View style={{ width: "40%", alignItems: "flex-end" }}>
            <View style={{ marginBottom: 6 }}>
              <Text style={s.label}>Invoice Number</Text>
              <Text style={{ ...s.value, textAlign: "right" }}>
                {invoice.invoiceNumber}
              </Text>
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={s.label}>Issue Date</Text>
              <Text style={{ ...s.value, textAlign: "right" }}>
                {fmtDate(invoice.issueDate)}
              </Text>
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={s.label}>Due Date</Text>
              <Text style={{ ...s.value, textAlign: "right" }}>
                {fmtDate(invoice.dueDate)}
              </Text>
            </View>
            <View>
              <Text style={s.label}>Status</Text>
              <Text style={{ ...s.value, textAlign: "right", textTransform: "uppercase" }}>
                {invoice.computedStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Line items table */}
        <View style={s.tableHeader}>
          <Text style={{ ...s.tableHeaderText, width: "45%" }}>
            Description
          </Text>
          <Text style={{ ...s.tableHeaderText, width: "15%" }}>Category</Text>
          <Text style={{ ...s.tableHeaderText, width: "10%", textAlign: "right" }}>
            Qty
          </Text>
          <Text style={{ ...s.tableHeaderText, width: "15%", textAlign: "right" }}>
            Rate
          </Text>
          <Text style={{ ...s.tableHeaderText, width: "15%", textAlign: "right" }}>
            Amount
          </Text>
        </View>
        {invoice.lineItems.map((item) => (
          <View key={item.id} style={s.tableRow}>
            <Text style={{ ...s.tableCell, width: "45%" }}>
              {item.description}
            </Text>
            <Text style={{ ...s.tableCell, width: "15%", fontSize: 9 }}>
              {categoryLabel(item.category)}
            </Text>
            <Text style={{ ...s.tableCell, width: "10%", textAlign: "right" }}>
              {item.quantity}
            </Text>
            <Text style={{ ...s.tableCell, width: "15%", textAlign: "right" }}>
              {fmtMoney(item.unitPriceCents)}
            </Text>
            <Text style={{ ...s.tableCell, width: "15%", textAlign: "right" }}>
              {fmtMoney(item.amountCents)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>
              {fmtMoney(invoice.subtotalCents)}
            </Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>
              Tax ({(invoice.taxRate * 100).toFixed(1)}%)
            </Text>
            <Text style={s.totalValue}>
              {fmtMoney(invoice.taxAmountCents)}
            </Text>
          </View>
          <View style={s.grandTotalRow}>
            <Text style={s.grandTotalLabel}>Total</Text>
            <Text style={s.grandTotalValue}>
              {fmtMoney(invoice.totalCents)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <WavePatternPDF width={483} height={30} opacity={0.15} />
          <Text style={s.footerText}>
            Sunset Harbor Marina | info@sunsetharbor.com | (555) 123-4567
          </Text>
        </View>
      </Page>
    </Document>
  );
}
