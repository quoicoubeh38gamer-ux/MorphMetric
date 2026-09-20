import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * The MorphMetric mark.
 *
 * A monogram M drawn as one continuous stroke of constant weight: the legs
 * splay outward like a facial contour, and the centre vertex descends deep
 * enough that it reads as M rather than W at 16px. It is perfectly symmetric
 * about its vertical axis — which is the one thing the product measures first.
 *
 * Rules it was drawn to satisfy: single stroke weight (no fills, matching the
 * hairline design system), legible at favicon size, and correct in both themes
 * without a second artwork — the plate is `bg-primary`, so it is ink on light
 * and off-white on dark.
 */
const MARK_PATH =
  "M10 34.5 11.6 15.8c.2-1.9 2.6-2.5 3.7-1L24 30.5l8.7-15.7c1.1-1.5 3.5-.9 3.7 1L38 34.5";

/**
 * The viewBox is cropped tight to the drawn mark (ink bounds x 8.5–39.5,
 * y 13.3–36 once the 3-unit stroke is counted, centred on 24 / 24.65) rather
 * than to the 48-unit grid it was drawn on. Without this the M floats in the
 * middle of its plate with a third of the plate empty around it.
 */
const MARK_VIEWBOX = "7 7.65 34 34";

type MarkSize = "sm" | "md" | "lg";

const PLATE: Record<MarkSize, string> = {
  sm: "h-7 w-7 rounded-[0.5rem]",
  md: "h-8 w-8 rounded-[0.6rem]",
  lg: "h-11 w-11 rounded-[0.85rem]",
};
const GLYPH: Record<MarkSize, string> = {
  sm: "h-[1.05rem] w-[1.05rem]",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

/** The mark on its own — for tight spaces, avatars and the app icon. */
export function LogoMark({
  size = "md",
  className,
}: {
  size?: MarkSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid place-items-center bg-primary text-primary-foreground",
        PLATE[size],
        className,
      )}
    >
      <svg viewBox={MARK_VIEWBOX} className={GLYPH[size]} fill="none" aria-hidden>
        <path
          d={MARK_PATH}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const WORDMARK: Record<MarkSize, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

/** Mark + wordmark. The default lockup, linked home. */
export function Logo({
  className,
  href = "/",
  size = "md",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  size?: MarkSize;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("focus-ring group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label="MorphMetric — home"
    >
      <LogoMark size={size} />
      {showWordmark ? (
        <span className={cn("font-display tracking-tight", WORDMARK[size])}>MorphMetric</span>
      ) : null}
    </Link>
  );
}
