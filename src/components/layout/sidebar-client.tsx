"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { logout } from "@/lib/auth/actions";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  group: "main" | "reports" | "settings";
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} strokeWidth={1.5} />, group: "main" },
  { label: "Invoices", href: "/invoices", icon: <FileText size={20} strokeWidth={1.5} />, group: "main" },
  { label: "Payments", href: "/payments", icon: <DollarSign size={20} strokeWidth={1.5} />, group: "main" },
  { label: "Customers", href: "/customers", icon: <Users size={20} strokeWidth={1.5} />, group: "main" },
  { label: "Reports", href: "/reports", icon: <BarChart3 size={20} strokeWidth={1.5} />, group: "reports" },
  { label: "Settings", href: "/settings", icon: <Settings size={20} strokeWidth={1.5} />, group: "settings" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function NavContent({
  role,
  name,
  collapsed,
  pathname,
  onNavClick,
}: {
  role: string;
  name: string;
  collapsed: boolean;
  pathname: string;
  onNavClick?: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = allNavItems.filter(
    (item) => item.group !== "settings" || role === "manager"
  );

  const mainItems = navItems.filter((i) => i.group === "main");
  const reportItems = navItems.filter((i) => i.group === "reports");
  const settingsItems = navItems.filter((i) => i.group === "settings");

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <Image src="/assets/logo.svg" alt="BillingHub" width={36} height={36} />
        {!collapsed && (
          <span className="font-heading text-lg text-white" style={{ fontWeight: 400 }}>
            BillingHub
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={`flex items-center gap-3 rounded-r-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
              isActive(item.href)
                ? "border-l-[3px] border-l-[#E8AA42] bg-[rgba(27,107,147,0.25)] text-white"
                : "border-l-[3px] border-l-transparent text-[#A8C4D8] hover:bg-[#0F3A5C]"
            }`}
            style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 500 }}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Reports divider + items */}
        {reportItems.length > 0 && (
          <>
            <div className="my-3 border-t border-[rgba(168,196,216,0.15)]" />
            {reportItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={`flex items-center gap-3 rounded-r-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive(item.href)
                    ? "border-l-[3px] border-l-[#E8AA42] bg-[rgba(27,107,147,0.25)] text-white"
                    : "border-l-[3px] border-l-transparent text-[#A8C4D8] hover:bg-[#0F3A5C]"
                }`}
                style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 500 }}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}

        {/* Settings divider + items (manager only) */}
        {settingsItems.length > 0 && (
          <>
            <div className="my-3 border-t border-[rgba(168,196,216,0.15)]" />
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={`flex items-center gap-3 rounded-r-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive(item.href)
                    ? "border-l-[3px] border-l-[#E8AA42] bg-[rgba(27,107,147,0.25)] text-white"
                    : "border-l-[3px] border-l-transparent text-[#A8C4D8] hover:bg-[#0F3A5C]"
                }`}
                style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 500 }}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[rgba(168,196,216,0.15)] px-3 py-4">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[#A8C4D8] transition-colors hover:bg-[#0F3A5C]"
        >
          {mounted && theme === "dark" ? (
            <Sun size={20} strokeWidth={1.5} />
          ) : (
            <Moon size={20} strokeWidth={1.5} />
          )}
          {!collapsed && (
            <span className="text-sm font-medium">
              {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B6B93] text-xs font-semibold text-white">
            {getInitials(name)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{name}</p>
              <p className="truncate text-xs capitalize text-[#A8C4D8]">
                {role.replace("_", " ")}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[#A8C4D8] transition-colors hover:bg-[#0F3A5C] hover:text-white"
          >
            <LogOut size={20} strokeWidth={1.5} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

export function SidebarClient({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);

    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsSmall(w >= 640 && w < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  // Mobile: overlay sheet
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setSheetOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar-bg p-2 text-white shadow-lg"
        >
          <Menu size={20} />
        </button>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="left" className="w-[260px] border-none bg-sidebar-bg p-0">
            <NavContent
              role={role}
              name={name}
              collapsed={false}
              pathname={pathname}
              onNavClick={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Small screens: auto-collapse to 72px
  const effectiveCollapsed = isSmall || collapsed;

  return (
    <aside
      className="sticky top-0 flex h-screen shrink-0 flex-col bg-sidebar-bg transition-all duration-200"
      style={{ width: effectiveCollapsed ? 72 : 260 }}
    >
      {/* Collapse toggle (only on non-small screens) */}
      {!isSmall && (
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(168,196,216,0.3)] bg-sidebar-bg text-[#A8C4D8] transition-colors hover:bg-[#0F3A5C]"
        >
          {collapsed ? <Menu size={12} /> : <X size={12} />}
        </button>
      )}
      <NavContent role={role} name={name} collapsed={effectiveCollapsed} pathname={pathname} />
    </aside>
  );
}
