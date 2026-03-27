import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: "Inter",
    fontSize: 11,
    color: "#0C2D48",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 400,
    fontFamily: "DM Serif Display",
    color: "#0C2D48",
  },
  accentLine: {
    height: 2,
    backgroundColor: "#E8AA42",
    marginBottom: 24,
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  label: {
    fontSize: 9,
    fontWeight: 600,
    color: "#6B7A8D",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    fontWeight: 400,
    color: "#0C2D48",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0C2D48",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#D4DAE3",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 10,
    fontWeight: 400,
    color: "#0C2D48",
  },
  totalSection: {
    alignItems: "flex-end",
    marginTop: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 400,
    color: "#6B7A8D",
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 500,
    color: "#0C2D48",
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    backgroundColor: "#0C2D48",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#FFFFFF",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
  },
  footerText: {
    fontSize: 10,
    fontWeight: 400,
    color: "#6B7A8D",
    textAlign: "center",
    marginTop: 8,
  },
});
