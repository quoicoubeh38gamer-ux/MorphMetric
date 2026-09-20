"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AuthButtons } from "./auth-buttons";
import { ButtonLink } from "../ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // pt-safe: installed to the home screen there is no browser chrome, so the
  // header would sit under the status bar unless it pays the inset back.
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 glass pt-safe">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-colors",
                isActive(link.href)
                  ? "bg-card text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <AuthButtons />
          <ThemeToggle />
          <div className="hidden sm:block">
            <ButtonLink href="/scan" size="sm">
              Analyze My Face
            </ButtonLink>
          </div>
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-border/70 bg-background lg:hidden">
          <div className="container flex max-h-[calc(100dvh-5rem)] flex-col gap-1 overflow-y-auto py-4 pb-safe">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center rounded-xl px-4 py-3 text-sm",
                  isActive(link.href) ? "bg-card text-foreground" : "text-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-xl px-4 py-3 text-sm text-muted"
            >
              Log in
            </Link>
            <ButtonLink href="/scan" className="mt-1 w-full">
              Analyze My Face
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
