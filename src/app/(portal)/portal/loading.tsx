export default function PortalLoading() {
  return (
    <div className="space-y-6">
      {/* Heading skeleton */}
      <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />

      {/* Account Summary skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-muted p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/10" />
              <div className="mt-3 h-7 w-28 animate-pulse rounded bg-muted-foreground/10" />
            </div>
          ))}
        </div>
        <div className="mt-4 h-5 w-72 animate-pulse rounded bg-muted" />
      </div>

      {/* Pay Now button skeleton */}
      <div className="h-12 w-32 animate-pulse rounded-xl bg-muted" />

      {/* Invoice History skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-4 space-y-3">
            {/* Table header */}
            <div className="flex gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 flex-1 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-5 flex-1 animate-pulse rounded bg-muted"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
