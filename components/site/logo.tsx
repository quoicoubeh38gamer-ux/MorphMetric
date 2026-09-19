import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Wordmark + monogram. The mark is a measured aperture: two arcs and a centre
 * point, drawn in ink. No gradient, no glow — it has to survive being printed
 * at 12px on a receipt.
 */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("focus-ring group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label="MorphMetric — home"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-[0.6rem] bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M12 2.6c3.1 2.4 4.9 5.6 4.9 9.4S15.1 19 12 21.4C8.9 19 7.1 15.8 7.1 12S8.9 5 12 2.6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M3.4 12h17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span className="font-display text-xl tracking-tight">MorphMetric</span>
    </Link>
  );
}
