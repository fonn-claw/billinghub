# Phase 3: Dashboard & Reports - Research

**Researched:** 2026-03-27
**Domain:** Data visualization (Recharts), SQL aggregation, CSV export
**Confidence:** HIGH

## Summary

This phase extends the existing dashboard page with KPI stat cards, three chart types (horizontal bar, donut, area), and outstanding balance alerts, then adds a reports module with four report types and CSV export. The data layer requires new DAL functions performing SQL aggregations across the invoices, payments, lineItems, and customers tables. All chart rendering uses Recharts 3.x (current: 3.8.1), which is the only new dependency.

The existing codebase provides strong foundations: the dashboard page already has the hero header, the sidebar already includes a Reports nav link, aging bucket utilities exist, and the DAL pattern is well-established. The primary engineering work is (1) writing aggregation queries, (2) building Recharts chart components styled per DESIGN-SPEC.md, and (3) implementing the counter roll-up animation for KPI cards.

**Primary recommendation:** Build a dashboard DAL module with 5-6 focused SQL aggregation functions, create reusable chart wrapper components for consistent styling, and use client-side CSV generation from displayed report data.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- New `src/lib/dal/dashboard.ts` for aggregation queries (total revenue current month + YTD, outstanding balance, collection rate %, expected payments this month)
- All monetary aggregation done server-side in SQL for accuracy — never sum in JavaScript
- KPI cards as a 4-column grid per DESIGN-SPEC.md section 5 (stat cards layout)
- Counter roll-up animation on load: client component with useEffect-driven count-up from 0 (800ms, ease-out) per DASH-09
- Sparkline in each KPI card using Recharts mini line chart (no axes, just the trend line)
- Revenue number in Harbor Gold (#E8AA42), other stats in Deep Navy (#0C2D48)
- Trend indicators: green with + prefix for positive, red with - prefix for negative, percentage shown next to number
- Recharts library for all visualizations
- Accounts Receivable Aging: horizontal stacked bar chart with aging colors from DESIGN-SPEC.md section 11 (green/gold/orange/red)
- Revenue by Category: donut chart with legend showing slip_rental, fuel, maintenance, amenity, service, other
- Collection Rate Trend: area chart with teal fill (#1B6B93 at 10-15% opacity) and navy line
- Charts use ResponsiveContainer for responsive behavior
- Tooltips styled per DESIGN-SPEC.md section 11 (card style, white bg, 12px border-radius, shadow)
- Chart animations: bars grow from bottom, lines trace left-to-right (600ms, ease-out, 100ms stagger)
- Chart color sequence: #1B6B93, #E8AA42, #0C2D48, #1B9C6B, #DC3545, #6B7A8D
- Two-column layout for charts (aging left, donut right), collection trend full-width below
- Outstanding balance alerts as table/card list sorted by total overdue descending
- Single /reports route with tab navigation between report types
- Date range picker with presets: This Month, Last Month, This Quarter, YTD, Custom Range
- Client-side CSV generation from currently displayed report data
- CSV includes all visible columns plus date range in filename

### Claude's Discretion
- Exact Recharts component configuration and custom tooltip components
- Loading skeleton layout for dashboard (matching card/chart shapes)
- Exact responsive breakpoints for chart stacking
- Report table column widths and overflow handling
- Date range picker component choice (shadcn calendar-based or simple select)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | Dashboard shows total revenue (current month and YTD) | SQL SUM on invoices.totalCents with date filtering; dashboard DAL function |
| DASH-02 | Dashboard shows outstanding balance total | SQL SUM(totalCents) - SUM(payments.amountCents) for non-draft unpaid invoices |
| DASH-03 | Dashboard shows collection rate percentage | (paid invoices count / total non-draft invoices count) * 100, or amount-based |
| DASH-04 | Dashboard shows cash flow forecast (expected payments this month) | SUM of balanceCents for invoices with dueDate in current month |
| DASH-05 | Dashboard shows AR aging as horizontal bar chart | Recharts BarChart with layout="vertical", stacked bars per aging bucket |
| DASH-06 | Dashboard shows revenue breakdown by category as donut chart | Recharts PieChart with innerRadius for donut, data from lineItems GROUP BY category |
| DASH-07 | Dashboard shows collection rate trend over time as area chart | Recharts AreaChart, monthly data points over last 6 months |
| DASH-08 | Dashboard shows outstanding balance alerts | Query from existing getOverdueCustomers or similar, sorted by overdue amount |
| DASH-09 | Revenue numbers animate with counter roll-up on load | Client component with useEffect + requestAnimationFrame, 800ms ease-out |
| DASH-10 | Dashboard header uses hero image with gradient overlay | Already implemented in existing dashboard page |
| RPT-01 | Revenue by category report | SQL GROUP BY lineItems.category with date range filter |
| RPT-02 | Aging report (every overdue invoice with customer, amount, days overdue) | Query unpaid invoices where dueDate < today, join customers |
| RPT-03 | Collections report (collected this month vs outstanding) | SUM payments in date range vs SUM outstanding balances |
| RPT-04 | Monthly comparison report | Three parallel queries for current month, last month, same month last year |
| RPT-05 | Export any report to CSV | Client-side CSV string construction from table data |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.1 | All chart visualizations (bar, donut, area, sparklines) | Specified in tech stack; React-native charting with declarative API |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Date arithmetic for report ranges, month calculations | Date range presets, monthly grouping |
| lucide-react | 1.7.0 | Icons for trend arrows, report tabs | TrendingUp, TrendingDown, Download icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | @nivo/core | More opinionated styling but heavier bundle; recharts already decided |
| client-side CSV | papaparse | Overkill for simple tabular export; string construction is sufficient |
| custom date picker | react-day-picker (installed) | Already in deps via shadcn; use for custom date range selection |

**Installation:**
```bash
npm install recharts
```

**Note:** Recharts 3.x pulls in `@reduxjs/toolkit`, `react-redux`, `immer`, and `reselect` as dependencies. This is expected and adds ~80KB gzipped to the client bundle for chart pages only (tree-shaking applies).

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/dal/
│   ├── dashboard.ts          # NEW: All dashboard aggregation queries
│   └── reports.ts            # NEW: All report data queries with date range params
├── app/(admin)/
│   ├── dashboard/
│   │   └── page.tsx           # EXTEND: Add KPI cards + charts below hero header
│   └── reports/
│       └── page.tsx           # NEW: Reports page with tab navigation
├── components/
│   ├── dashboard/
│   │   ├── kpi-cards.tsx      # Client component: 4 stat cards with roll-up animation
│   │   ├── aging-chart.tsx    # Client component: horizontal stacked bar
│   │   ├── revenue-donut.tsx  # Client component: donut chart with legend
│   │   ├── trend-chart.tsx    # Client component: area chart for collection trend
│   │   ├── sparkline.tsx      # Client component: mini line chart for KPI cards
│   │   ├── alerts-table.tsx   # Server or client: overdue customer alerts
│   │   └── counter-animation.tsx  # Client component: animated number counter
│   └── reports/
│       ├── report-tabs.tsx    # Client component: tab navigation + date range picker
│       ├── report-table.tsx   # Reusable report table with export button
│       ├── csv-export.ts      # Utility: CSV string generation + download trigger
│       └── date-range-picker.tsx  # Date range selection with presets
```

### Pattern 1: Server Component Data Fetching + Client Chart Rendering
**What:** Dashboard page is a server component that fetches all data, then passes serialized data to client chart components.
**When to use:** Always for this phase — charts require client-side rendering but data comes from SQL.
**Example:**
```typescript
// src/app/(admin)/dashboard/page.tsx (server component)
import { getDashboardKPIs, getAgingData, getRevenueByCategory } from "@/lib/dal/dashboard";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { AgingChart } from "@/components/dashboard/aging-chart";

export default async function DashboardPage() {
  const [kpis, aging, revenue] = await Promise.all([
    getDashboardKPIs(),
    getAgingData(),
    getRevenueByCategory(),
  ]);

  return (
    <div className="space-y-8">
      {/* hero header ... */}
      <KPICards data={kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AgingChart data={aging} />
        <RevenueDonut data={revenue} />
      </div>
    </div>
  );
}
```

### Pattern 2: Counter Roll-Up Animation
**What:** Animated number that counts up from 0 to target value over 800ms with ease-out curve.
**When to use:** All KPI card numbers on dashboard (DASH-09).
**Example:**
```typescript
"use client";
import { useState, useEffect, useRef } from "react";

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}
```

### Pattern 3: Recharts 3.x Custom Tooltip
**What:** Styled tooltip matching DESIGN-SPEC.md (white bg, 12px border-radius, shadow).
**When to use:** All charts.
**Example:**
```typescript
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white p-3 shadow-md border border-border"
         style={{ borderRadius: 12 }}>
      <p className="text-sm font-medium text-[#0C2D48]">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}
```

### Pattern 4: Client-Side CSV Export
**What:** Generate CSV from displayed table data and trigger browser download.
**When to use:** All report exports (RPT-05).
**Example:**
```typescript
export function exportToCSV(
  data: Record<string, string | number>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const header = columns.map(c => c.label).join(",");
  const rows = data.map(row =>
    columns.map(c => {
      const val = String(row[c.key] ?? "");
      return val.includes(",") ? `"${val}"` : val;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Anti-Patterns to Avoid
- **Summing money in JavaScript:** All monetary totals MUST come from SQL SUM. Never reduce an array of cents on the client — floating point and pagination would cause errors.
- **Fetching all invoices for chart data:** Use SQL GROUP BY and aggregation, not fetch-all-then-filter. The DB has 150+ invoices; this matters for production patterns even if demo scale is small.
- **Recharts 2.x patterns:** Do not use `alwaysShow` (removed), do not rely on `activeIndex` prop (removed). The `accessibilityLayer` is now true by default in 3.x.
- **Heavy CSV libraries:** Don't install papaparse or csv-stringify for simple tabular export. String construction handles the use case.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Charting | Custom SVG/Canvas charts | Recharts 3.x | Responsive, animated, accessible by default |
| Date arithmetic | Manual month/year math | date-fns (startOfMonth, subMonths, format) | Timezone-safe, handles edge cases (Feb, leap years) |
| Number formatting | Manual toFixed/toLocaleString | Existing formatCurrency/formatCurrencyParts | Already handles cents-to-dollars conversion |
| Aging buckets | Manual date diff | Existing getAgingBucket utility | Already categorizes invoices, tested |

## Common Pitfalls

### Pitfall 1: Recharts ResponsiveContainer Height
**What goes wrong:** Chart renders with 0 height or doesn't appear.
**Why it happens:** ResponsiveContainer requires a parent with an explicit height. If the parent is flex/grid without a set height, the chart collapses.
**How to avoid:** Always wrap ResponsiveContainer in a div with explicit `style={{ height: 300 }}` or a Tailwind height class like `h-[300px]`.
**Warning signs:** Chart area appears but is blank or squished to 0px.

### Pitfall 2: Recharts 3.x Breaking Changes
**What goes wrong:** Code examples from 2.x tutorials fail silently or behave differently.
**Why it happens:** Recharts 3.x removed internal props like `alwaysShow`, changed state management, and made `accessibilityLayer` true by default.
**How to avoid:** Use only documented 3.x APIs. Do not pass `alwaysShow` to Reference components. The PieChart `innerRadius`/`outerRadius` API remains stable.
**Warning signs:** Console warnings about unknown props, tooltips not appearing.

### Pitfall 3: SQL Date Filtering with Postgres Date Type
**What goes wrong:** Date comparisons miss records or include wrong dates due to timezone mismatches.
**Why it happens:** Schema uses `date` type (no timezone) but JavaScript `new Date()` includes timezone. Comparing JS dates to Postgres date columns can shift by a day.
**How to avoid:** Use `sql\`current_date\`` for server-side date comparisons in Postgres. For date range parameters, pass ISO date strings and compare directly with the date column.
**Warning signs:** Reports show different counts than dashboard, off-by-one on month boundaries.

### Pitfall 4: Donut Chart Segment Spacing
**What goes wrong:** Donut chart segments appear connected without the 4px gap specified in DESIGN-SPEC.md.
**Why it happens:** Recharts Pie component does not have a native "gap" prop.
**How to avoid:** Use `paddingAngle={2}` on the Pie component to create visual separation between segments. Use `cornerRadius={4}` for rounded ends.
**Warning signs:** Chart looks like a solid ring instead of distinct segments.

### Pitfall 5: Counter Animation Flicker on Re-render
**What goes wrong:** Counter resets to 0 and re-animates when parent re-renders.
**Why it happens:** useEffect dependency array triggers on every render if target value is recalculated.
**How to avoid:** Memoize the target value or use a ref to track if animation has already completed. Only re-animate when value actually changes.

## Code Examples

### Dashboard KPI SQL Aggregation
```typescript
// src/lib/dal/dashboard.ts
import { db } from "@/lib/db";
import { invoices, payments, lineItems } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function getDashboardKPIs() {
  // All queries use SQL aggregation — no JS summing
  const [revenueResult] = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE
        WHEN i.issue_date >= date_trunc('month', current_date)
        THEN i.total_cents ELSE 0 END), 0) as current_month_revenue,
      COALESCE(SUM(CASE
        WHEN i.issue_date >= date_trunc('year', current_date)
        THEN i.total_cents ELSE 0 END), 0) as ytd_revenue,
      COALESCE(SUM(CASE
        WHEN i.status NOT IN ('draft', 'paid') AND i.due_date < current_date
        THEN i.total_cents - COALESCE((
          SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id
        ), 0) ELSE 0 END), 0) as outstanding_balance,
      COALESCE(SUM(CASE
        WHEN i.due_date >= date_trunc('month', current_date)
          AND i.due_date < date_trunc('month', current_date) + interval '1 month'
          AND i.status NOT IN ('draft', 'paid')
        THEN i.total_cents - COALESCE((
          SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id
        ), 0) ELSE 0 END), 0) as expected_this_month
    FROM invoices i
    WHERE i.status != 'draft'
  `);
  return revenueResult;
}
```

### Recharts Horizontal Stacked Bar (Aging Chart)
```typescript
"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const AGING_COLORS = {
  current: "#1B9C6B",
  "30day": "#E8AA42",
  "60day": "#D4922A",
  "90plus": "#DC3545",
};

export function AgingChart({ data }: { data: AgingData[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7A8D" }} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#6B7A8D" }} width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="current" stackId="a" fill={AGING_COLORS.current} radius={[0, 0, 0, 0]}
               animationDuration={600} animationEasing="ease-out" />
          <Bar dataKey="30day" stackId="a" fill={AGING_COLORS["30day"]} />
          <Bar dataKey="60day" stackId="a" fill={AGING_COLORS["60day"]} />
          <Bar dataKey="90plus" stackId="a" fill={AGING_COLORS["90plus"]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Recharts Donut Chart (Revenue by Category)
```typescript
"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CHART_COLORS = ["#1B6B93", "#E8AA42", "#0C2D48", "#1B9C6B", "#DC3545", "#6B7A8D"];

export function RevenueDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={70} outerRadius={110}
            paddingAngle={2}
            cornerRadius={4}
            dataKey="value"
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Sparkline for KPI Cards
```typescript
"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function Sparkline({ data, color = "#1B6B93" }: { data: { value: number }[]; color?: string }) {
  return (
    <div className="h-[40px] w-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts 2.x | Recharts 3.x (3.8.1) | 2024-2025 | New state management, `accessibilityLayer` default true, removed `alwaysShow` prop |
| React state for charts | Redux Toolkit internal (Recharts 3.x) | 2024 | No user impact — internal to Recharts |
| `react-smooth` animations | Built-in Recharts animations | Recharts 3.0 | Fewer dependencies, same API surface for `animationDuration`/`animationEasing` |

**Deprecated/outdated:**
- `alwaysShow` prop on Reference components: removed in Recharts 3.0
- `activeIndex` prop: removed in Recharts 3.0
- External `react-smooth` dependency: internalized in Recharts 3.0

## Open Questions

1. **Collection rate calculation method**
   - What we know: DASH-03 asks for "collection rate percentage"
   - What's unclear: Is this (total paid / total invoiced) by amount, or (paid invoices / total invoices) by count?
   - Recommendation: Use amount-based: `SUM(payments) / SUM(non-draft invoice totals) * 100`. This is more financially meaningful and standard in AR/collections.

2. **Sparkline data source for KPI cards**
   - What we know: Each KPI card should have a mini trend sparkline
   - What's unclear: The time period and granularity for sparklines
   - Recommendation: Use last 6 months, monthly data points. Simple enough to compute alongside the main KPIs.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Next.js build validation |
| Config file | next.config.ts |
| Quick run command | `npx next build --turbopack 2>&1 \| tail -5` |
| Full suite command | `npx next build --turbopack` |

### Phase Requirements Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Revenue KPIs display | smoke | `npx next build --turbopack` | N/A (build check) |
| DASH-02 | Outstanding balance shown | smoke | Build + manual visual | N/A |
| DASH-03 | Collection rate percentage | smoke | Build + manual visual | N/A |
| DASH-04 | Cash flow forecast | smoke | Build + manual visual | N/A |
| DASH-05 | AR aging bar chart | smoke | Build + manual visual | N/A |
| DASH-06 | Revenue donut chart | smoke | Build + manual visual | N/A |
| DASH-07 | Collection trend area chart | smoke | Build + manual visual | N/A |
| DASH-08 | Outstanding balance alerts | smoke | Build + manual visual | N/A |
| DASH-09 | Counter roll-up animation | manual-only | Visual verification | N/A |
| DASH-10 | Hero header | smoke | Already implemented | Already exists |
| RPT-01 | Revenue by category report | smoke | Build check + manual | N/A |
| RPT-02 | Aging report | smoke | Build check + manual | N/A |
| RPT-03 | Collections report | smoke | Build check + manual | N/A |
| RPT-04 | Monthly comparison | smoke | Build check + manual | N/A |
| RPT-05 | CSV export | manual-only | Click export, verify download | N/A |

### Sampling Rate
- **Per task commit:** `npx next build --turbopack 2>&1 | tail -5`
- **Per wave merge:** Full build
- **Phase gate:** Full build green + visual check of dashboard and reports pages

### Wave 0 Gaps
- [ ] `npm install recharts` — required before any chart components
- [ ] `src/lib/dal/dashboard.ts` — aggregation queries needed before dashboard UI
- [ ] `src/lib/dal/reports.ts` — report queries needed before reports UI

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/db/schema.ts`, `src/lib/dal/invoices.ts`, `src/lib/dal/payments.ts`, `src/lib/dal/collections.ts`, `src/lib/utils/aging.ts`
- DESIGN-SPEC.md sections 3, 5, 6, 7, 11 — chart colors, animation specs, layout
- `npm view recharts version` — confirmed 3.8.1 current

### Secondary (MEDIUM confidence)
- [Recharts 3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) — breaking changes from 2.x
- [Recharts GitHub releases](https://github.com/recharts/recharts/releases) — version history

### Tertiary (LOW confidence)
None — all findings verified against codebase or official sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — recharts is specified in constraints, version verified via npm
- Architecture: HIGH — extends well-established DAL + server/client component patterns from Phase 2
- Pitfalls: HIGH — based on known Recharts 3.x migration issues and direct codebase inspection

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable domain, Recharts 3.x is established)
