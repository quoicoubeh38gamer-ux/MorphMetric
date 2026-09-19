"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Gates DEPTH, never the core result. Free users see a blurred preview of an
 * advanced section with an upsell. Wired for when payments land — pass pro to
 * unlock.
 */
export function ProGate({
  pro = false,
  title = "Unlock with Pro",
  subtitle = "Deeper analysis, advanced insights and weekly reports.",
  children,
}: {
  pro?: boolean;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  if (pro) return <>{children}</>;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <div className="pointer-events-none select-none opacity-50 blur-[6px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 p-6 text-center backdrop-blur-sm">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary">
          <Lock className="h-5 w-5" />
        </span>
        <p className="font-display text-lg">{title}</p>
        <p className="max-w-xs text-sm text-muted">{subtitle}</p>
        <Link
          href="/#pricing"
          className="focus-ring mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" /> Go Pro
        </Link>
      </div>
    </div>
  );
}
