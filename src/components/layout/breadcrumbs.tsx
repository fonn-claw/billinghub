"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function prettifySegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1 text-[13px]" style={{ fontWeight: 400 }}>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          return (
            <li key={href} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-[#6B7A8D]">/</span>
              )}
              {isLast ? (
                <span className="font-medium text-deep-navy dark:text-foreground">
                  {prettifySegment(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-[#6B7A8D] transition-colors hover:text-foreground"
                >
                  {prettifySegment(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
