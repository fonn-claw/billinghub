import { getCustomers } from "@/lib/dal/customers";
import { CustomerTable } from "@/components/customers/customer-table";
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; dock?: string }>;
}) {
  const params = await searchParams;
  const customers = await getCustomers(params.search, params.dock);

  const docks = [...new Set(customers.map((c) => c.dock).filter(Boolean))] as string[];
  docks.sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer accounts, vessels, and slip assignments
          </p>
        </div>
        <CreateCustomerDialog />
      </div>
      <CustomerTable customers={customers} docks={docks} />
    </div>
  );
}
