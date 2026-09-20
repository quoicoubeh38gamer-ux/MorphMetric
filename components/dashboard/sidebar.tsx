"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  History,
  LayoutGrid,
  Lightbulb,
  Ruler,
  Settings,
  Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/measurements", label: "Measurements", icon: Ruler },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/progress", label: "Progress", icon: Gauge },
  { href: "/dashboard/style", label: "Style", icon: Shirt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Section navigation. A sticky rail from `lg` up; below that a horizontally
 * scrollable pill row — deliberately not a hamburger, because seven flat
 * destinations are faster to reach than a drawer you have to open first.
 */
export function DashboardNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <nav aria-label="Dashboard sections" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      {/* mobile / tablet */}
      <ul className="-mx-5 flex max-w-[100vw] gap-1.5 overflow-x-auto px-5 pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "focus-ring flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.8125rem] transition-colors",
                isActive(item.href)
                  ? "border-foreground/20 bg-card text-foreground"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* desktop rail */}
      <ul className="hidden gap-0.5 lg:grid">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "focus-ring group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted hover:bg-surface hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-4 w-4", isActive(item.href) ? "text-accent" : "text-muted-foreground")}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
