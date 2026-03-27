import { getSession } from "@/lib/auth/session";
import {
  getDashboardKPIs,
  getAgingData,
  getRevenueByCategory,
  getCollectionTrend,
  getTopOverdueCustomers,
  getSparklineData,
} from "@/lib/dal/dashboard";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { AgingChart } from "@/components/dashboard/aging-chart";
import { RevenueDonut } from "@/components/dashboard/revenue-donut";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { AlertsTable } from "@/components/dashboard/alerts-table";

export default async function DashboardPage() {
  const session = await getSession();
  const name = session.name ?? "Harbor Master";

  const greeting = getGreeting();

  const [kpis, aging, revenue, trend, overdue, sparklines] = await Promise.all([
    getDashboardKPIs(),
    getAgingData(),
    getRevenueByCategory(),
    getCollectionTrend(),
    getTopOverdueCustomers(),
    getSparklineData(),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero header with background image */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ minHeight: 200 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/assets/dashboard-header.png)" }}
        />
        <div className="absolute inset-0 bg-[rgba(12,45,72,0.85)]" />
        <div className="relative z-10 flex flex-col justify-center p-8" style={{ minHeight: 200 }}>
          <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Revenue Dashboard
          </h1>
          <p className="mt-1 text-lg text-white opacity-90" style={{ fontWeight: 400 }}>
            {greeting}, {name}
          </p>
          <p className="mt-1 text-sm text-[#A8C4D8]">
            Sunset Harbor Marina
          </p>
        </div>
      </div>

      {/* KPI stat cards */}
      <KPICards kpis={kpis} sparklines={sparklines} />

      {/* Charts: aging + donut side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AgingChart data={aging} />
        <RevenueDonut data={revenue} />
      </div>

      {/* Collection trend - full width */}
      <TrendChart data={trend} />

      {/* Outstanding balance alerts - full width */}
      <AlertsTable customers={overdue} />
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
