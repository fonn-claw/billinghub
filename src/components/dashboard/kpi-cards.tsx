"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/dashboard/counter-animation";
import { Sparkline } from "@/components/dashboard/sparkline";
import type { DashboardKPIs, SparklineData } from "@/lib/dal/dashboard";

type KPICardsProps = {
  kpis: DashboardKPIs;
  sparklines: SparklineData;
};

function TrendIndicator({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) return null;
  const pctChange = ((current - previous) / previous) * 100;
  const isPositive = pctChange >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? "#1B9C6B" : "#DC3545";

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <Icon className="h-3.5 w-3.5" />
      {isPositive ? "+" : ""}
      {pctChange.toFixed(1)}%
    </span>
  );
}

function getOutstandingColor(cents: number): string {
  if (cents > 5000000) return "#DC3545";
  if (cents > 2000000) return "#D4922A";
  return "#0C2D48";
}

export function KPICards({ kpis, sparklines }: KPICardsProps) {
  const cards = [
    {
      label: "Revenue (This Month)",
      value: kpis.currentMonthRevenue,
      format: "currency" as const,
      color: "#E8AA42",
      sparkData: sparklines.revenueByMonth,
      sparkColor: "#E8AA42",
      trend: { current: kpis.currentMonthRevenue, previous: kpis.previousMonthRevenue },
    },
    {
      label: "Outstanding Balance",
      value: kpis.outstandingBalance,
      format: "currency" as const,
      color: getOutstandingColor(kpis.outstandingBalance),
      sparkData: sparklines.outstandingByMonth,
      sparkColor: "#1B6B93",
      trend: null,
    },
    {
      label: "Collection Rate",
      value: kpis.collectionRate,
      format: "percentage" as const,
      color: "#1B9C6B",
      sparkData: sparklines.collectionRateByMonth,
      sparkColor: "#1B9C6B",
      trend: { current: kpis.collectionRate, previous: kpis.previousCollectionRate },
    },
    {
      label: "Expected This Month",
      value: kpis.expectedThisMonth,
      format: "currency" as const,
      color: "#0C2D48",
      sparkData: sparklines.expectedByMonth,
      sparkColor: "#1B6B93",
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <AnimatedNumber
                value={card.value}
                format={card.format}
                className="text-2xl font-bold"
                style={{ color: card.color }}
              />
              {card.trend && (
                <TrendIndicator
                  current={card.trend.current}
                  previous={card.trend.previous}
                />
              )}
            </div>
            <div className="absolute bottom-0 right-4">
              <Sparkline
                data={card.sparkData}
                color={card.sparkColor}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
