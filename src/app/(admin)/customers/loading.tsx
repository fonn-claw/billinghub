export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      {/* Header row skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-10 w-full max-w-sm animate-pulse rounded-lg bg-muted" />

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Table header */}
        <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3">
          {[140, 160, 80, 60, 80, 100].map((w, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-muted-foreground/20"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            {[140, 160, 80, 60, 80, 100].map((w, j) => (
              <div
                key={j}
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
