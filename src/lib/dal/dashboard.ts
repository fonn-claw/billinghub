import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// ── Types ──────────────────────────────────────────────────────────

export type DashboardKPIs = {
  currentMonthRevenue: number;
  ytdRevenue: number;
  outstandingBalance: number;
  collectionRate: number;
  expectedThisMonth: number;
  previousMonthRevenue: number;
  previousCollectionRate: number;
};

export type AgingDataRow = {
  bucket: string;
  totalCents: number;
  count: number;
};

export type RevenueByCategoryRow = {
  category: string;
  totalCents: number;
};

export type CollectionTrendRow = {
  month: string;
  collectionRate: number;
};

export type TopOverdueCustomerRow = {
  customerId: string;
  customerName: string;
  totalOverdueCents: number;
  oldestDaysOverdue: number;
  lastPaymentDate: string | null;
};

export type SparklineData = {
  revenueByMonth: { value: number }[];
  outstandingByMonth: { value: number }[];
  collectionRateByMonth: { value: number }[];
  expectedByMonth: { value: number }[];
};

// ── Dashboard KPIs ─────────────────────────────────────────────────

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const result = await db.execute<{
    current_month_revenue: string;
    ytd_revenue: string;
    outstanding_balance: string;
    collection_rate: string;
    expected_this_month: string;
    previous_month_revenue: string;
    previous_collection_rate: string;
  }>(sql`
    SELECT
      -- Current month revenue (non-draft invoices issued this month)
      COALESCE(SUM(CASE
        WHEN i.status != 'draft'
          AND i.issue_date >= date_trunc('month', current_date)
        THEN i.total_cents ELSE 0
      END), 0)::bigint AS current_month_revenue,

      -- YTD revenue
      COALESCE(SUM(CASE
        WHEN i.status != 'draft'
          AND i.issue_date >= date_trunc('year', current_date)
        THEN i.total_cents ELSE 0
      END), 0)::bigint AS ytd_revenue,

      -- Outstanding balance: unpaid invoice totals minus their payments
      COALESCE((
        SELECT SUM(inv.total_cents) - COALESCE(SUM(pay.paid), 0)
        FROM invoices inv
        LEFT JOIN (
          SELECT invoice_id, SUM(amount_cents) AS paid
          FROM payments GROUP BY invoice_id
        ) pay ON pay.invoice_id = inv.id
        WHERE inv.status NOT IN ('draft', 'paid')
      ), 0)::bigint AS outstanding_balance,

      -- Collection rate (amount-based): total payments / total non-draft invoices * 100
      COALESCE(
        CASE WHEN SUM(CASE WHEN i.status != 'draft' THEN i.total_cents ELSE 0 END) > 0
        THEN (
          COALESCE((SELECT SUM(amount_cents) FROM payments), 0)::numeric
          / SUM(CASE WHEN i.status != 'draft' THEN i.total_cents ELSE 0 END)::numeric
          * 100
        ) ELSE 0 END
      , 0) AS collection_rate,

      -- Expected this month: unpaid invoices due this month
      COALESCE((
        SELECT SUM(inv.total_cents) - COALESCE(SUM(pay.paid), 0)
        FROM invoices inv
        LEFT JOIN (
          SELECT invoice_id, SUM(amount_cents) AS paid
          FROM payments GROUP BY invoice_id
        ) pay ON pay.invoice_id = inv.id
        WHERE inv.status NOT IN ('draft', 'paid')
          AND inv.due_date >= date_trunc('month', current_date)
          AND inv.due_date < date_trunc('month', current_date) + interval '1 month'
      ), 0)::bigint AS expected_this_month,

      -- Previous month revenue
      COALESCE(SUM(CASE
        WHEN i.status != 'draft'
          AND i.issue_date >= date_trunc('month', current_date) - interval '1 month'
          AND i.issue_date < date_trunc('month', current_date)
        THEN i.total_cents ELSE 0
      END), 0)::bigint AS previous_month_revenue,

      -- Previous month collection rate
      COALESCE(
        CASE WHEN SUM(CASE
          WHEN i.status != 'draft'
            AND i.issue_date >= date_trunc('month', current_date) - interval '1 month'
            AND i.issue_date < date_trunc('month', current_date)
          THEN i.total_cents ELSE 0 END) > 0
        THEN (
          COALESCE((
            SELECT SUM(amount_cents) FROM payments
            WHERE payment_date >= date_trunc('month', current_date) - interval '1 month'
              AND payment_date < date_trunc('month', current_date)
          ), 0)::numeric
          / NULLIF(SUM(CASE
            WHEN i.status != 'draft'
              AND i.issue_date >= date_trunc('month', current_date) - interval '1 month'
              AND i.issue_date < date_trunc('month', current_date)
            THEN i.total_cents ELSE 0 END), 0)::numeric
          * 100
        ) ELSE 0 END
      , 0) AS previous_collection_rate

    FROM invoices i
  `);

  const row = result.rows[0];

  return {
    currentMonthRevenue: Number(row.current_month_revenue),
    ytdRevenue: Number(row.ytd_revenue),
    outstandingBalance: Number(row.outstanding_balance),
    collectionRate: Number(Number(row.collection_rate).toFixed(1)),
    expectedThisMonth: Number(row.expected_this_month),
    previousMonthRevenue: Number(row.previous_month_revenue),
    previousCollectionRate: Number(Number(row.previous_collection_rate).toFixed(1)),
  };
}

// ── Aging Data ─────────────────────────────────────────────────────

export async function getAgingData(): Promise<AgingDataRow[]> {
  const result = await db.execute<{
    bucket: string;
    total_cents: string;
    count: string;
  }>(sql`
    SELECT
      CASE
        WHEN current_date - due_date::date BETWEEN 1 AND 30 THEN 'current'
        WHEN current_date - due_date::date BETWEEN 31 AND 60 THEN '30day'
        WHEN current_date - due_date::date BETWEEN 61 AND 90 THEN '60day'
        WHEN current_date - due_date::date > 90 THEN '90plus'
      END AS bucket,
      COALESCE(SUM(total_cents), 0)::bigint AS total_cents,
      COUNT(*)::int AS count
    FROM invoices
    WHERE status NOT IN ('draft', 'paid')
      AND due_date::date < current_date
    GROUP BY bucket
    HAVING CASE
      WHEN current_date - due_date::date BETWEEN 1 AND 30 THEN 'current'
      WHEN current_date - due_date::date BETWEEN 31 AND 60 THEN '30day'
      WHEN current_date - due_date::date BETWEEN 61 AND 90 THEN '60day'
      WHEN current_date - due_date::date > 90 THEN '90plus'
    END IS NOT NULL
    ORDER BY
      CASE
        WHEN CASE
          WHEN current_date - due_date::date BETWEEN 1 AND 30 THEN 'current'
          WHEN current_date - due_date::date BETWEEN 31 AND 60 THEN '30day'
          WHEN current_date - due_date::date BETWEEN 61 AND 90 THEN '60day'
          WHEN current_date - due_date::date > 90 THEN '90plus'
        END = 'current' THEN 1
        WHEN CASE
          WHEN current_date - due_date::date BETWEEN 1 AND 30 THEN 'current'
          WHEN current_date - due_date::date BETWEEN 31 AND 60 THEN '30day'
          WHEN current_date - due_date::date BETWEEN 61 AND 90 THEN '60day'
          WHEN current_date - due_date::date > 90 THEN '90plus'
        END = '30day' THEN 2
        WHEN CASE
          WHEN current_date - due_date::date BETWEEN 1 AND 30 THEN 'current'
          WHEN current_date - due_date::date BETWEEN 31 AND 60 THEN '30day'
          WHEN current_date - due_date::date BETWEEN 61 AND 90 THEN '60day'
          WHEN current_date - due_date::date > 90 THEN '90plus'
        END = '60day' THEN 3
        ELSE 4
      END
  `);

  return result.rows.map((r) => ({
    bucket: r.bucket,
    totalCents: Number(r.total_cents),
    count: Number(r.count),
  }));
}

// ── Revenue by Category ────────────────────────────────────────────

export async function getRevenueByCategory(): Promise<RevenueByCategoryRow[]> {
  const result = await db.execute<{
    category: string;
    total_cents: string;
  }>(sql`
    SELECT
      li.category,
      COALESCE(SUM(li.amount_cents), 0)::bigint AS total_cents
    FROM line_items li
    JOIN invoices i ON i.id = li.invoice_id
    WHERE i.status != 'draft'
    GROUP BY li.category
    ORDER BY total_cents DESC
  `);

  return result.rows.map((r) => ({
    category: r.category,
    totalCents: Number(r.total_cents),
  }));
}

// ── Collection Trend (last 6 months) ──────────────────────────────

export async function getCollectionTrend(): Promise<CollectionTrendRow[]> {
  const result = await db.execute<{
    month: string;
    collection_rate: string;
  }>(sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', current_date) - interval '5 months',
        date_trunc('month', current_date),
        interval '1 month'
      )::date AS month_start
    ),
    monthly_invoiced AS (
      SELECT
        date_trunc('month', issue_date)::date AS month_start,
        SUM(total_cents) AS invoiced
      FROM invoices
      WHERE status != 'draft'
        AND issue_date >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY date_trunc('month', issue_date)
    ),
    monthly_paid AS (
      SELECT
        date_trunc('month', payment_date)::date AS month_start,
        SUM(amount_cents) AS paid
      FROM payments
      WHERE payment_date >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY date_trunc('month', payment_date)
    )
    SELECT
      to_char(m.month_start, 'YYYY-MM') AS month,
      COALESCE(
        CASE WHEN COALESCE(mi.invoiced, 0) > 0
          THEN (COALESCE(mp.paid, 0)::numeric / mi.invoiced::numeric * 100)
          ELSE 0
        END
      , 0) AS collection_rate
    FROM months m
    LEFT JOIN monthly_invoiced mi ON mi.month_start = m.month_start
    LEFT JOIN monthly_paid mp ON mp.month_start = m.month_start
    ORDER BY m.month_start
  `);

  return result.rows.map((r) => ({
    month: r.month,
    collectionRate: Number(Number(r.collection_rate).toFixed(1)),
  }));
}

// ── Top Overdue Customers ──────────────────────────────────────────

export async function getTopOverdueCustomers(limit = 5): Promise<TopOverdueCustomerRow[]> {
  const result = await db.execute<{
    customer_id: string;
    customer_name: string;
    total_overdue_cents: string;
    oldest_days_overdue: string;
    last_payment_date: string | null;
  }>(sql`
    SELECT
      c.id AS customer_id,
      c.name AS customer_name,
      COALESCE(SUM(i.total_cents) - COALESCE(SUM(pay.paid), 0), 0)::bigint AS total_overdue_cents,
      COALESCE(MAX(current_date - i.due_date::date), 0)::int AS oldest_days_overdue,
      (
        SELECT MAX(p2.payment_date)
        FROM payments p2
        JOIN invoices i2 ON i2.id = p2.invoice_id
        WHERE i2.customer_id = c.id
      ) AS last_payment_date
    FROM invoices i
    JOIN customers c ON c.id = i.customer_id
    LEFT JOIN (
      SELECT invoice_id, SUM(amount_cents) AS paid
      FROM payments GROUP BY invoice_id
    ) pay ON pay.invoice_id = i.id
    WHERE i.status NOT IN ('draft', 'paid')
      AND i.due_date::date < current_date
    GROUP BY c.id, c.name
    HAVING COALESCE(SUM(i.total_cents) - COALESCE(SUM(pay.paid), 0), 0) > 0
    ORDER BY total_overdue_cents DESC
    LIMIT ${limit}
  `);

  return result.rows.map((r) => ({
    customerId: r.customer_id,
    customerName: r.customer_name,
    totalOverdueCents: Number(r.total_overdue_cents),
    oldestDaysOverdue: Number(r.oldest_days_overdue),
    lastPaymentDate: r.last_payment_date,
  }));
}

// ── Sparkline Data (6 months) ──────────────────────────────────────

export async function getSparklineData(): Promise<SparklineData> {
  const result = await db.execute<{
    month_start: string;
    revenue: string;
    outstanding: string;
    collection_rate: string;
    expected: string;
  }>(sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', current_date) - interval '5 months',
        date_trunc('month', current_date),
        interval '1 month'
      )::date AS month_start
    ),
    monthly_revenue AS (
      SELECT
        date_trunc('month', issue_date)::date AS month_start,
        SUM(total_cents) AS revenue
      FROM invoices WHERE status != 'draft'
        AND issue_date >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY date_trunc('month', issue_date)
    ),
    monthly_outstanding AS (
      SELECT
        date_trunc('month', due_date)::date AS month_start,
        SUM(total_cents) AS outstanding
      FROM invoices WHERE status NOT IN ('draft', 'paid')
        AND due_date >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY date_trunc('month', due_date)
    ),
    monthly_paid AS (
      SELECT
        date_trunc('month', payment_date)::date AS month_start,
        SUM(amount_cents) AS paid
      FROM payments
      WHERE payment_date >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY date_trunc('month', payment_date)
    ),
    monthly_expected AS (
      SELECT
        date_trunc('month', due_date)::date AS month_start,
        SUM(total_cents) AS expected
      FROM invoices
      WHERE status NOT IN ('draft', 'paid')
        AND due_date >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY date_trunc('month', due_date)
    )
    SELECT
      m.month_start::text,
      COALESCE(mr.revenue, 0)::bigint AS revenue,
      COALESCE(mo.outstanding, 0)::bigint AS outstanding,
      COALESCE(
        CASE WHEN COALESCE(mr.revenue, 0) > 0
          THEN (COALESCE(mp.paid, 0)::numeric / mr.revenue::numeric * 100)
          ELSE 0
        END
      , 0) AS collection_rate,
      COALESCE(me.expected, 0)::bigint AS expected
    FROM months m
    LEFT JOIN monthly_revenue mr ON mr.month_start = m.month_start
    LEFT JOIN monthly_outstanding mo ON mo.month_start = m.month_start
    LEFT JOIN monthly_paid mp ON mp.month_start = m.month_start
    LEFT JOIN monthly_expected me ON me.month_start = m.month_start
    ORDER BY m.month_start
  `);

  const rows = result.rows;
  return {
    revenueByMonth: rows.map((r) => ({ value: Number(r.revenue) })),
    outstandingByMonth: rows.map((r) => ({ value: Number(r.outstanding) })),
    collectionRateByMonth: rows.map((r) => ({ value: Number(Number(r.collection_rate).toFixed(1)) })),
    expectedByMonth: rows.map((r) => ({ value: Number(r.expected) })),
  };
}
