import * as React from "react";
import { cn } from "@/lib/utils/cn";

/** Consistent vertical rhythm + max width for page sections. */
export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("container py-16 sm:py-24", className)} {...props} />;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{children}</span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-muted">{description}</p> : null}
    </div>
  );
}
