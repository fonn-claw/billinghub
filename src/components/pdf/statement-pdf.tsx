import { Document, Page, View, Text } from "@react-pdf/renderer";
import "./pdf-fonts";
import { pdfStyles as s } from "./pdf-styles";
import { WavePatternPDF } from "./wave-pattern";

export type StatementProps = {
  customerName: string;
  customerEmail: string | null;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  openingBalanceCents: number;
  transactions: Array<{
    date: string;
    description: string;
    chargeCents: number;
    paymentCents: number;
  }>;
  closingBalanceCents: number;
};

function fmtMoney(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function StatementPDF(props: StatementProps) {
  const {
    customerName,
    customerEmail,
    periodLabel,
    periodStart,
    periodEnd,
    openingBalanceCents,
    transactions,
    closingBalanceCents,
  } = props;

  const totalCharges = transactions.reduce((sum, t) => sum + t.chargeCents, 0);
  const totalPayments = transactions.reduce((sum, t) => sum + t.paymentCents, 0);

  // Compute running balances
  let runningBalance = openingBalanceCents;
  const rows = transactions.map((t) => {
    runningBalance = runningBalance + t.chargeCents - t.paymentCents;
    return { ...t, runningBalanceCents: runningBalance };
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={{ fontSize: 18, fontWeight: 700, fontFamily: "Inter", color: "#0C2D48" }}>
            BillingHub
          </Text>
          <Text style={s.headerTitle}>ACCOUNT STATEMENT</Text>
        </View>

        {/* Accent line */}
        <View style={s.accentLine} />

        {/* Period info */}
        <View style={s.twoCol}>
          <View style={{ width: "50%" }}>
            <Text style={s.label}>Customer</Text>
            <Text style={s.value}>{customerName}</Text>
            {customerEmail && (
              <Text style={{ ...s.value, fontSize: 10, color: "#6B7A8D" }}>
                {customerEmail}
              </Text>
            )}
          </View>
          <View style={{ width: "40%", alignItems: "flex-end" }}>
            <View style={{ marginBottom: 6 }}>
              <Text style={s.label}>Statement Period</Text>
              <Text style={{ ...s.value, textAlign: "right" }}>{periodLabel}</Text>
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={s.label}>From</Text>
              <Text style={{ ...s.value, textAlign: "right" }}>{fmtDate(periodStart)}</Text>
            </View>
            <View>
              <Text style={s.label}>To</Text>
              <Text style={{ ...s.value, textAlign: "right" }}>{fmtDate(periodEnd)}</Text>
            </View>
          </View>
        </View>

        {/* Summary box */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            backgroundColor: "#F4F6F8",
            borderRadius: 6,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ width: "25%" }}>
            <Text style={s.label}>Opening Balance</Text>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#0C2D48" }}>
              {fmtMoney(openingBalanceCents)}
            </Text>
          </View>
          <View style={{ width: "25%" }}>
            <Text style={s.label}>Total Charges</Text>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#0C2D48" }}>
              {fmtMoney(totalCharges)}
            </Text>
          </View>
          <View style={{ width: "25%" }}>
            <Text style={s.label}>Total Payments</Text>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#0C2D48" }}>
              {fmtMoney(totalPayments)}
            </Text>
          </View>
          <View style={{ width: "25%" }}>
            <Text style={s.label}>Closing Balance</Text>
            <Text style={{ fontSize: 14, fontWeight: 700, color: "#0C2D48" }}>
              {fmtMoney(closingBalanceCents)}
            </Text>
          </View>
        </View>

        {/* Transaction table */}
        <View style={s.tableHeader}>
          <Text style={{ ...s.tableHeaderText, width: "20%" }}>Date</Text>
          <Text style={{ ...s.tableHeaderText, width: "40%" }}>Description</Text>
          <Text style={{ ...s.tableHeaderText, width: "13%", textAlign: "right" }}>Charges</Text>
          <Text style={{ ...s.tableHeaderText, width: "13%", textAlign: "right" }}>Payments</Text>
          <Text style={{ ...s.tableHeaderText, width: "14%", textAlign: "right" }}>Balance</Text>
        </View>

        {/* Opening balance row */}
        <View style={{ ...s.tableRow, backgroundColor: "#F4F6F8" }}>
          <Text style={{ ...s.tableCell, width: "20%" }}></Text>
          <Text style={{ ...s.tableCell, width: "40%", fontWeight: 500 }}>Opening Balance</Text>
          <Text style={{ ...s.tableCell, width: "13%", textAlign: "right" }}></Text>
          <Text style={{ ...s.tableCell, width: "13%", textAlign: "right" }}></Text>
          <Text style={{ ...s.tableCell, width: "14%", textAlign: "right", fontWeight: 500 }}>
            {fmtMoney(openingBalanceCents)}
          </Text>
        </View>

        {rows.map((row, idx) => (
          <View key={idx} style={s.tableRow}>
            <Text style={{ ...s.tableCell, width: "20%" }}>{fmtDate(row.date)}</Text>
            <Text style={{ ...s.tableCell, width: "40%" }}>{row.description}</Text>
            <Text style={{ ...s.tableCell, width: "13%", textAlign: "right" }}>
              {row.chargeCents > 0 ? fmtMoney(row.chargeCents) : ""}
            </Text>
            <Text style={{ ...s.tableCell, width: "13%", textAlign: "right" }}>
              {row.paymentCents > 0 ? fmtMoney(row.paymentCents) : ""}
            </Text>
            <Text style={{ ...s.tableCell, width: "14%", textAlign: "right" }}>
              {fmtMoney(row.runningBalanceCents)}
            </Text>
          </View>
        ))}

        {/* Closing balance */}
        <View style={s.totalSection}>
          <View style={s.grandTotalRow}>
            <Text style={s.grandTotalLabel}>Closing Balance</Text>
            <Text style={s.grandTotalValue}>{fmtMoney(closingBalanceCents)}</Text>
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
