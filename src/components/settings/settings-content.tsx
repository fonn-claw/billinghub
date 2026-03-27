"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Receipt, Bell } from "lucide-react";

export function SettingsContent() {
  return (
    <div className="grid gap-6">
      {/* Marina Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#1B6B93]" />
            <CardTitle>Marina Profile</CardTitle>
          </div>
          <CardDescription>
            Basic information displayed on invoices and statements
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="marina-name">Marina Name</Label>
            <Input id="marina-name" defaultValue="Sunset Harbor Marina" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marina-email">Contact Email</Label>
            <Input id="marina-email" defaultValue="billing@sunsetharbor.com" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marina-phone">Phone</Label>
            <Input id="marina-phone" defaultValue="(555) 234-5678" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marina-address">Address</Label>
            <Input id="marina-address" defaultValue="100 Harbor Way, Sunset Bay, FL 33701" readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Billing Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#1B6B93]" />
            <CardTitle>Billing Preferences</CardTitle>
          </div>
          <CardDescription>
            Default tax rate and payment terms for new invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
            <Input id="tax-rate" type="number" defaultValue="7.5" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-terms">Payment Terms (days)</Label>
            <Input id="payment-terms" type="number" defaultValue="30" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-prefix">Invoice Number Prefix</Label>
            <Input id="invoice-prefix" defaultValue="INV-" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="late-fee">Late Fee (%)</Label>
            <Input id="late-fee" type="number" defaultValue="1.5" readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#1B6B93]" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure reminder and alert settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Auto-Reminder Before Due (days)</Label>
              <Input id="reminder-days" type="number" defaultValue="7" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overdue-alert">Overdue Alert Threshold (days)</Label>
              <Input id="overdue-alert" type="number" defaultValue="30" readOnly />
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Settings are read-only in this demo. In a production environment, these would be editable and persisted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
