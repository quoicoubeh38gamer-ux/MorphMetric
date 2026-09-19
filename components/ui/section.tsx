import * as React from "react";
import { cn } from "@/lib/utils/cn";

/** Consistent vertical rhythm + max width for page sections. */
export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("container py-20 sm:py-28", className)} {...props} />;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
      {children}
    </span>
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
      <h2 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">{title}</h2>
      {description ? <p className="mt-5 text-base leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
}
