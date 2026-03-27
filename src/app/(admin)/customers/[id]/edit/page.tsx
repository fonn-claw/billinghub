import { notFound, redirect } from "next/navigation";
import { getCustomer } from "@/lib/dal/customers";
import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomer } from "@/app/(admin)/customers/actions";
import type { CreateCustomerInput } from "@/lib/utils/validation";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  const defaultValues: Partial<CreateCustomerInput> = {
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    vesselName: customer.vesselName ?? "",
    vesselType: (customer.vesselType as "sailboat" | "powerboat" | "catamaran") ?? undefined,
    vesselLength: customer.vesselLength ?? null,
    dock: customer.dock ?? "",
    slipNumber: customer.slipNumber ?? "",
    notes: customer.notes ?? "",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">
          Edit Customer
        </h1>
        <p className="text-muted-foreground mt-1">
          Update {customer.name}&apos;s information
        </p>
      </div>
      <CustomerForm
        defaultValues={defaultValues}
        action={updateCustomer}
        submitLabel="Save Changes"
        onSuccess={() => redirect(`/customers/${id}`)}
        extraFields={<input type="hidden" name="customerId" value={id} />}
      />
    </div>
  );
}
