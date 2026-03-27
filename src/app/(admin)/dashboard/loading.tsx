export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Hero header skeleton */}
      <div className="animate-pulse rounded-xl bg-muted" style={{ minHeight: 200 }} />

      {/* KPI cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-muted p-6">
            <div className="mb-3 h-3 w-24 rounded bg-muted-foreground/20" />
            <div className="h-8 w-32 rounded bg-muted-foreground/20" />
            <div className="mt-3 h-10 w-full rounded bg-muted-foreground/10" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-pulse rounded-xl bg-muted" style={{ height: 300 }} />
        <div className="animate-pulse rounded-xl bg-muted" style={{ height: 300 }} />
      </div>

      {/* Trend chart skeleton */}
      <div className="animate-pulse rounded-xl bg-muted" style={{ height: 250 }} />

      {/* Alerts table skeleton */}
      <div className="animate-pulse rounded-xl bg-muted" style={{ height: 200 }} />
    </div>
  );
}
