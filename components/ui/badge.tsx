import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "default" | "primary" | "accent" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  default: "border-border bg-card text-muted",
  primary: "border-primary/30 bg-primary/10 text-primary",
  accent: "border-accent/30 bg-accent/10 text-accent",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export function Badge({
  tone = "default",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
