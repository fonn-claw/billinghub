import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If already logged in, redirect based on role
  if (session.userId) {
    if (session.role === "customer") {
      redirect("/portal");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
