export default function InvoicesLoading() {
  return (
    <div className="space-y-6">
      {/* Header row skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-full bg-muted"
            style={{ width: 72 + i * 8 }}
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Table header */}
        <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3">
          {[120, 80, 80, 80, 80, 80, 64].map((w, i) => (
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
            {[120, 80, 80, 80, 80, 80, 64].map((w, j) => (
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
