import { getPayments } from "@/lib/dal/payments";
import { PaymentTable } from "@/components/payments/payment-table";
import { CreditCard } from "lucide-react";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const params = await searchParams;
  const payments = await getPayments(params.method);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B6B93]/10">
          <CreditCard className="h-5 w-5 text-[#1B6B93]" />
        </div>
        <div>
          <h1
            className="font-heading text-3xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      <PaymentTable payments={payments} />
    </div>
  );
}
