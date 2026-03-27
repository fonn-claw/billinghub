"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, DollarSign, GitCompare } from "lucide-react";
import { DateRangePicker } from "./date-range-picker";
import { RevenueCategoryReport } from "./revenue-category-report";
import { AgingReport } from "./aging-report";
import { CollectionsReport } from "./collections-report";
import { MonthlyComparisonReport } from "./monthly-comparison-report";
import type { RevenueByCategoryReport } from "@/lib/dal/reports";
import type { AgingReportRow, CollectionsReport as CollectionsReportData, MonthlyComparisonReport as MonthlyComparisonData } from "@/lib/dal/reports";

interface ReportTabsProps {
  revenue: RevenueByCategoryReport;
  aging: AgingReportRow[];
  collections: CollectionsReportData;
  monthly: MonthlyComparisonData;
  startDate: string;
  endDate: string;
}

export function ReportTabs({
  revenue,
  aging,
  collections,
  monthly,
  startDate,
  endDate,
}: ReportTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", start);
    params.set("endDate", end);
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
      />

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="gap-2">
            <BarChart3 size={14} />
            <span className="hidden sm:inline">Revenue by Category</span>
            <span className="sm:hidden">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="aging" className="gap-2">
            <Clock size={14} />
            <span className="hidden sm:inline">Aging</span>
            <span className="sm:hidden">Aging</span>
          </TabsTrigger>
          <TabsTrigger value="collections" className="gap-2">
            <DollarSign size={14} />
            <span className="hidden sm:inline">Collections</span>
            <span className="sm:hidden">Collections</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <GitCompare size={14} />
            <span className="hidden sm:inline">Monthly Comparison</span>
            <span className="sm:hidden">Monthly</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueCategoryReport
            data={revenue}
            startDate={startDate}
            endDate={endDate}
          />
        </TabsContent>

        <TabsContent value="aging">
          <AgingReport data={aging} startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="collections">
          <CollectionsReport
            data={collections}
            startDate={startDate}
            endDate={endDate}
          />
        </TabsContent>

        <TabsContent value="monthly">
          <MonthlyComparisonReport data={monthly} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
