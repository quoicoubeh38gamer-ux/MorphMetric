import { cn } from "@/lib/utils/cn";

/** Slim progress bar. `value`/`max` drive the fill width (animated via CSS). */
export function Progress({
  value,
  max = 20,
  className,
  tone = "primary",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "primary" | "accent";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-border/60", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          tone === "primary" ? "bg-primary" : "bg-accent",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
