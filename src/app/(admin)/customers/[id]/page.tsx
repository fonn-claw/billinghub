import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getCustomer,
  getCustomerBalance,
  getCustomerNotes,
  getCustomerInvoices,
  getCustomerPayments,
} from "@/lib/dal/customers";
import { getCollectionNotes } from "@/lib/dal/collections";
import { BalanceSummary } from "@/components/customers/balance-summary";
import { CustomerNotes } from "@/components/customers/customer-notes";
import { CollectionNotes } from "@/components/collections/collection-notes";
import { CollectionsSection } from "@/components/collections/collections-section";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import { formatCurrency } from "@/lib/formatting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Ship, MapPin, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, balance, notes, invoices, payments, collectionNotesList] = await Promise.all([
    getCustomer(id),
    getCustomerBalance(id),
    getCustomerNotes(id),
    getCustomerInvoices(id),
    getCustomerPayments(id),
    getCollectionNotes(id),
  ]);

  if (!customer) {
    notFound();
  }

  const paymentMethodLabels: Record<string, string> = {
    cash: "Cash",
    check: "Check",
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl tracking-tight">
              {customer.name}
            </h1>
            {customer.isCollectionsFlagged && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-600 border-red-300"
              >
                <AlertTriangle className="mr-1 h-3 w-3" />
                Collections
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {customer.email && <span>{customer.email}</span>}
            {customer.dock && customer.slipNumber && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Dock {customer.dock}, Slip {customer.slipNumber}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" render={<Link href={`/customers/${id}/edit`} />}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Vessel Info */}
      {customer.vesselName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Ship className="h-4 w-4" />
          <span className="font-medium text-foreground">
            {customer.vesselName}
          </span>
          {customer.vesselType && (
            <span className="capitalize">({customer.vesselType})</span>
          )}
          {customer.vesselLength && <span>{customer.vesselLength} ft</span>}
        </div>
      )}

      {/* Balance Summary */}
      <BalanceSummary {...balance} />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vessel Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vessel Name</dt>
                    <dd>{customer.vesselName ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="capitalize">
                      {customer.vesselType ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Length</dt>
                    <dd>
                      {customer.vesselLength
                        ? `${customer.vesselLength} ft`
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slip Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dock</dt>
                    <dd>{customer.dock ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Slip Number</dt>
                    <dd>{customer.slipNumber ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Address</dt>
                    <dd>{customer.address ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{customer.phone ?? "—"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {customer.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>General Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {customer.isCollectionsFlagged && (
              <Card className="md:col-span-2 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <CollectionsSection
                    customerId={id}
                    lastReminderDate={customer.lastReminderDate}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="pt-4">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Image
                src="/assets/empty-invoices.svg"
                alt=""
                width={200}
                height={160}
                className="mb-4 opacity-60"
              />
              <h3 className="font-heading text-lg text-foreground mb-1">
                No invoices yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-[360px]">
                Create an invoice to start tracking charges for this customer.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="cursor-pointer">
                      <TableCell>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-medium text-[#1B6B93] hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(inv.issueDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(inv.dueDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(inv.totalCents)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span
                          className={
                            inv.balanceCents > 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {formatCurrency(inv.balanceCents)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="pt-4">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Image
                src="/assets/empty-payments.svg"
                alt=""
                width={200}
                height={160}
                className="mb-4 opacity-60"
              />
              <h3 className="font-heading text-lg text-foreground mb-1">
                No payments recorded
              </h3>
              <p className="text-sm text-muted-foreground max-w-[360px]">
                Payments will appear here once recorded against invoices.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((pmt) => (
                    <TableRow key={pmt.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(pmt.paymentDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/invoices/${pmt.invoiceId}`}
                          className="font-medium text-[#1B6B93] hover:underline"
                        >
                          {pmt.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#1B9C6B] font-medium">
                        {formatCurrency(pmt.amountCents)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {paymentMethodLabels[pmt.method] ?? pmt.method}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pmt.reference ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="pt-4">
          <CustomerNotes notes={notes} customerId={id} />
          {customer.isCollectionsFlagged && collectionNotesList.length > 0 && (
            <div className="mt-8">
              <h3 className="font-heading text-lg tracking-tight mb-4">
                Collection Notes
              </h3>
              <CollectionNotes notes={collectionNotesList} customerId={id} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
