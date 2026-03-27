"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "@/lib/auth/actions";

export function TopBarClient({ name }: { name: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      {/* Left: Logo + wordmark */}
      <div className="flex items-center gap-2">
        <Image src="/assets/logo.svg" alt="BillingHub" width={36} height={36} />
        <span className="font-heading text-lg text-foreground" style={{ fontWeight: 400 }}>
          BillingHub
        </span>
      </div>

      {/* Right: Name, theme toggle, logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">{name}</span>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {mounted && theme === "dark" ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
        </button>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
