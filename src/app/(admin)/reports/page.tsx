import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  getRevenueByCategoryReport,
  getAgingReport,
  getCollectionsReport,
  getMonthlyComparisonReport,
} from "@/lib/dal/reports";
import { ReportTabs } from "@/components/reports/report-tabs";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const startDate = params.startDate ?? format(startOfMonth(now), "yyyy-MM-dd");
  const endDate = params.endDate ?? format(endOfMonth(now), "yyyy-MM-dd");

  const [revenue, aging, collections, monthly] = await Promise.all([
    getRevenueByCategoryReport(startDate, endDate),
    getAgingReport(startDate, endDate),
    getCollectionsReport(startDate, endDate),
    getMonthlyComparisonReport(startDate),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Analyze revenue, aging, and collection metrics
        </p>
      </div>

      <ReportTabs
        revenue={revenue}
        aging={aging}
        collections={collections}
        monthly={monthly}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
