import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  const session = await getSession();

  if (session.role !== "manager") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage marina profile, tax rates, and billing preferences
        </p>
      </div>
      <SettingsContent />
    </div>
  );
}
