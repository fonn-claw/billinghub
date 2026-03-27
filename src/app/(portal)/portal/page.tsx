import { getSession } from "@/lib/auth/session";

export default async function PortalHomePage() {
  const session = await getSession();
  const name = session.name ?? "Customer";

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
        Welcome, {name}
      </h1>

      {/* Account summary placeholder */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-xl text-foreground">Account Summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground" style={{ fontSize: 15 }}>
              --
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Next Due Date
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground" style={{ fontSize: 15 }}>
              --
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Last Payment
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground" style={{ fontSize: 15 }}>
              --
            </p>
          </div>
        </div>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Your invoices and payment history will appear here.
        </p>
      </div>
    </div>
  );
}
