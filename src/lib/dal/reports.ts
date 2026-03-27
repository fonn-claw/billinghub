import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// ── Types ──────────────────────────────────────────────────────────

export type RevenueByCategoryReportRow = {
  category: string;
  invoiceCount: number;
  totalCents: number;
  percentage: number;
};

export type RevenueByCategoryReport = {
  rows: RevenueByCategoryReportRow[];
  grandTotalCents: number;
};

export type AgingReportRow = {
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  invoiceId: string;
  amountCents: number;
  paidCents: number;
  balanceCents: number;
  dueDate: string;
  daysOverdue: number;
  agingBucket: string;
};

export type CollectionsReportRow = {
  customerId: string;
  customerName: string;
  collectedCents: number;
  outstandingCents: number;
};

export type CollectionsReport = {
  collectedCents: number;
  outstandingCents: number;
  rows: CollectionsReportRow[];
};

export type MonthData = {
  month: string;
  totalRevenueCents: number;
  invoiceCount: number;
  paymentsCents: number;
  collectionRate: number;
};

export type MonthlyComparisonReport = {
  currentMonth: MonthData;
  lastMonth: MonthData;
  sameMonthLastYear: MonthData;
};

// ── Revenue by Category Report ─────────────────────────────────────

export async function getRevenueByCategoryReport(
  startDate: string,
  endDate: string
): Promise<RevenueByCategoryReport> {
  const result = await db.execute<{
    category: string;
    invoice_count: string;
    total_cents: string;
    percentage: string;
  }>(sql`
    WITH category_totals AS (
      SELECT
        li.category,
        COUNT(DISTINCT i.id)::int AS invoice_count,
        COALESCE(SUM(li.amount_cents), 0)::bigint AS total_cents
      FROM line_items li
      JOIN invoices i ON i.id = li.invoice_id
      WHERE i.status != 'draft'
        AND i.issue_date >= ${startDate}::date
        AND i.issue_date <= ${endDate}::date
      GROUP BY li.category
    )
    SELECT
      category,
      invoice_count,
      total_cents,
      COALESCE(
        ROUND(total_cents::numeric / NULLIF(SUM(total_cents) OVER (), 0) * 100, 1),
        0
      ) AS percentage
    FROM category_totals
    ORDER BY total_cents DESC
  `);

  const mapped = result.rows.map((r) => ({
    category: r.category,
    invoiceCount: Number(r.invoice_count),
    totalCents: Number(r.total_cents),
    percentage: Number(r.percentage),
  }));

  const grandTotalCents = mapped.reduce((sum, r) => sum + r.totalCents, 0);

  return { rows: mapped, grandTotalCents };
}

// ── Aging Report ───────────────────────────────────────────────────

export async function getAgingReport(
  startDate: string,
  endDate: string
): Promise<AgingReportRow[]> {
  const result = await db.execute<{
    customer_id: string;
    customer_name: string;
    invoice_number: string;
    invoice_id: string;
    amount_cents: string;
    paid_cents: string;
    balance_cents: string;
    due_date: string;
    days_overdue: string;
    aging_bucket: string;
  }>(sql`
    SELECT
      c.id AS customer_id,
      c.name AS customer_name,
      i.invoice_number,
      i.id AS invoice_id,
      i.total_cents::bigint AS amount_cents,
      COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0)::bigint AS paid_cents,
      (i.total_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0))::bigint AS balance_cents,
      i.due_date,
      (current_date - i.due_date::date)::int AS days_overdue,
      CASE
        WHEN current_date - i.due_date::date BETWEEN 1 AND 30 THEN 'current'
        WHEN current_date - i.due_date::date BETWEEN 31 AND 60 THEN '30day'
        WHEN current_date - i.due_date::date BETWEEN 61 AND 90 THEN '60day'
        WHEN current_date - i.due_date::date > 90 THEN '90plus'
      END AS aging_bucket
    FROM invoices i
    JOIN customers c ON c.id = i.customer_id
    WHERE i.status NOT IN ('draft', 'paid')
      AND i.due_date::date < current_date
      AND i.issue_date >= ${startDate}::date
      AND i.issue_date <= ${endDate}::date
    ORDER BY days_overdue DESC
  `);

  return result.rows.map((r) => ({
    customerId: r.customer_id,
    customerName: r.customer_name,
    invoiceNumber: r.invoice_number,
    invoiceId: r.invoice_id,
    amountCents: Number(r.amount_cents),
    paidCents: Number(r.paid_cents),
    balanceCents: Number(r.balance_cents),
    dueDate: r.due_date,
    daysOverdue: Number(r.days_overdue),
    agingBucket: r.aging_bucket,
  }));
}

// ── Collections Report ─────────────────────────────────────────────

export async function getCollectionsReport(
  startDate: string,
  endDate: string
): Promise<CollectionsReport> {
  // Get totals
  const totalsResult = await db.execute<{
    collected_cents: string;
    outstanding_cents: string;
  }>(sql`
    SELECT
      COALESCE((
        SELECT SUM(p.amount_cents)
        FROM payments p
        WHERE p.payment_date >= ${startDate}::date
          AND p.payment_date <= ${endDate}::date
      ), 0)::bigint AS collected_cents,
      COALESCE((
        SELECT SUM(i.total_cents) - COALESCE(SUM(pay.paid), 0)
        FROM invoices i
        LEFT JOIN (
          SELECT invoice_id, SUM(amount_cents) AS paid
          FROM payments GROUP BY invoice_id
        ) pay ON pay.invoice_id = i.id
        WHERE i.status NOT IN ('draft', 'paid')
      ), 0)::bigint AS outstanding_cents
  `);

  const totals = totalsResult.rows[0];

  // Get per-customer breakdown
  const custResult = await db.execute<{
    customer_id: string;
    customer_name: string;
    collected_cents: string;
    outstanding_cents: string;
  }>(sql`
    SELECT
      c.id AS customer_id,
      c.name AS customer_name,
      COALESCE((
        SELECT SUM(p.amount_cents)
        FROM payments p
        JOIN invoices i ON i.id = p.invoice_id
        WHERE i.customer_id = c.id
          AND p.payment_date >= ${startDate}::date
          AND p.payment_date <= ${endDate}::date
      ), 0)::bigint AS collected_cents,
      COALESCE((
        SELECT SUM(i.total_cents) - COALESCE((
          SELECT SUM(p2.amount_cents)
          FROM payments p2
          WHERE p2.invoice_id = i.id
        ), 0)
        FROM invoices i
        WHERE i.customer_id = c.id
          AND i.status NOT IN ('draft', 'paid')
      ), 0)::bigint AS outstanding_cents
    FROM customers c
    HAVING COALESCE((
      SELECT SUM(p.amount_cents)
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      WHERE i.customer_id = c.id
        AND p.payment_date >= ${startDate}::date
        AND p.payment_date <= ${endDate}::date
    ), 0) > 0
    OR COALESCE((
      SELECT SUM(i.total_cents) - COALESCE((
        SELECT SUM(p2.amount_cents)
        FROM payments p2
        WHERE p2.invoice_id = i.id
      ), 0)
      FROM invoices i
      WHERE i.customer_id = c.id
        AND i.status NOT IN ('draft', 'paid')
    ), 0) > 0
    ORDER BY outstanding_cents DESC
  `);

  return {
    collectedCents: Number(totals.collected_cents),
    outstandingCents: Number(totals.outstanding_cents),
    rows: custResult.rows.map((r) => ({
      customerId: r.customer_id,
      customerName: r.customer_name,
      collectedCents: Number(r.collected_cents),
      outstandingCents: Number(r.outstanding_cents),
    })),
  };
}

// ── Monthly Comparison Report ──────────────────────────────────────

export async function getMonthlyComparisonReport(
  referenceDate: string
): Promise<MonthlyComparisonReport> {
  const result = await db.execute<{
    period: string;
    month_label: string;
    total_revenue_cents: string;
    invoice_count: string;
    payments_cents: string;
    collection_rate: string;
  }>(sql`
    WITH ref AS (
      SELECT ${referenceDate}::date AS ref_date
    ),
    periods AS (
      SELECT
        'currentMonth' AS period,
        date_trunc('month', ref.ref_date)::date AS month_start,
        (date_trunc('month', ref.ref_date) + interval '1 month' - interval '1 day')::date AS month_end
      FROM ref
      UNION ALL
      SELECT
        'lastMonth',
        (date_trunc('month', ref.ref_date) - interval '1 month')::date,
        (date_trunc('month', ref.ref_date) - interval '1 day')::date
      FROM ref
      UNION ALL
      SELECT
        'sameMonthLastYear',
        (date_trunc('month', ref.ref_date) - interval '1 year')::date,
        (date_trunc('month', ref.ref_date) - interval '1 year' + interval '1 month' - interval '1 day')::date
      FROM ref
    )
    SELECT
      p.period,
      to_char(p.month_start, 'YYYY-MM') AS month_label,
      COALESCE((
        SELECT SUM(i.total_cents)
        FROM invoices i
        WHERE i.status != 'draft'
          AND i.issue_date >= p.month_start
          AND i.issue_date <= p.month_end
      ), 0)::bigint AS total_revenue_cents,
      COALESCE((
        SELECT COUNT(*)
        FROM invoices i
        WHERE i.status != 'draft'
          AND i.issue_date >= p.month_start
          AND i.issue_date <= p.month_end
      ), 0)::int AS invoice_count,
      COALESCE((
        SELECT SUM(pay.amount_cents)
        FROM payments pay
        WHERE pay.payment_date >= p.month_start
          AND pay.payment_date <= p.month_end
      ), 0)::bigint AS payments_cents,
      COALESCE(
        CASE WHEN COALESCE((
          SELECT SUM(i.total_cents)
          FROM invoices i
          WHERE i.status != 'draft'
            AND i.issue_date >= p.month_start
            AND i.issue_date <= p.month_end
        ), 0) > 0
        THEN (
          COALESCE((
            SELECT SUM(pay.amount_cents)
            FROM payments pay
            WHERE pay.payment_date >= p.month_start
              AND pay.payment_date <= p.month_end
          ), 0)::numeric
          / NULLIF((
            SELECT SUM(i.total_cents)
            FROM invoices i
            WHERE i.status != 'draft'
              AND i.issue_date >= p.month_start
              AND i.issue_date <= p.month_end
          ), 0)::numeric
          * 100
        ) ELSE 0 END
      , 0) AS collection_rate
    FROM periods p
    ORDER BY p.month_start DESC
  `);

  const rows = result.rows;
  const toMonthData = (period: string): MonthData => {
    const row = rows.find((r) => r.period === period);
    if (!row) {
      return { month: "", totalRevenueCents: 0, invoiceCount: 0, paymentsCents: 0, collectionRate: 0 };
    }
    return {
      month: row.month_label,
      totalRevenueCents: Number(row.total_revenue_cents),
      invoiceCount: Number(row.invoice_count),
      paymentsCents: Number(row.payments_cents),
      collectionRate: Number(Number(row.collection_rate).toFixed(1)),
    };
  };

  return {
    currentMonth: toMonthData("currentMonth"),
    lastMonth: toMonthData("lastMonth"),
    sameMonthLastYear: toMonthData("sameMonthLastYear"),
  };
}
