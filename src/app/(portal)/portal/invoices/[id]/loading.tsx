export default function PortalInvoiceLoading() {
  return (
    <div className="space-y-6">
      {/* Back link skeleton */}
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />

      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>

      {/* Date info skeleton */}
      <div className="flex gap-6">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      </div>

      {/* Line items table skeleton */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-3 p-4">
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-4 flex-1 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className="h-5 flex-1 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary skeleton */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Button skeletons */}
      <div className="flex gap-4">
        <div className="h-10 w-36 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 w-28 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
