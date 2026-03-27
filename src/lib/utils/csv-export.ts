/**
 * Generates a CSV file from tabular data and triggers browser download.
 *
 * @param data - Array of row objects
 * @param columns - Column definitions with key (data field) and label (header)
 * @param filename - Download filename (should end with .csv)
 */
export function exportToCSV(
  data: Record<string, string | number>[],
  columns: { key: string; label: string }[],
  filename: string
): void {
  // Build header row
  const header = columns.map((col) => escapeCSVValue(col.label)).join(",");

  // Build data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        return escapeCSVValue(value != null ? String(value) : "");
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  // Create blob and trigger download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a CSV value: wraps in quotes if it contains commas, quotes, or newlines.
 * Double quotes within the value are escaped as "".
 */
function escapeCSVValue(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
