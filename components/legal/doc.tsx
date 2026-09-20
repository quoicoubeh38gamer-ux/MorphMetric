import type { ReactNode } from "react";

/**
 * Shared layout for the legal documents. They are long-form text, so they get
 * a measure that stays readable, anchored headings so a clause can be linked
 * to directly, and a visible effective date — a policy without one is
 * worthless the moment it changes.
 */
export function LegalDoc({
  title,
  intro,
  effectiveDate,
  children,
}: {
  title: string;
  intro: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="container max-w-3xl py-14 sm:py-20">
      <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-5 text-base leading-relaxed text-muted">{intro}</p>
      <p className="mt-4 text-sm text-muted-foreground">
        In effect since{" "}
        <time dateTime={effectiveDate} className="tabular">
          {effectiveDate}
        </time>
        .
      </p>
      <div className="mt-12 space-y-10">{children}</div>
    </div>
  );
}

/** One numbered clause. The id makes it linkable. */
export function Clause({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-8">
      <h2 className="font-display text-2xl tracking-tight">
        <span className="mr-3 text-muted-foreground tabular">{n}.</span>
        <a href={`#${id}`} className="focus-ring rounded hover:underline">
          {title}
        </a>
      </h2>
      <div className="mt-4 space-y-4 text-[0.9375rem] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

/** A definition-style row, for the data tables in the privacy policy. */
export function Rows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="overflow-hidden rounded-xl border border-border">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex flex-col gap-1 border-t border-border p-4 first:border-t-0 sm:flex-row sm:gap-6"
        >
          <dt className="shrink-0 text-[0.9375rem] text-foreground sm:w-56">{r.label}</dt>
          <dd className="text-sm leading-relaxed text-muted">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Banner shown while lib/legal.ts still holds placeholders. It is deliberately
 * loud: a legal page that names "TODO_LEGAL_ENTITY_NAME" as the publisher is
 * worse than no page, and this must never quietly reach production.
 */
export function PlaceholderWarning({ missing }: { missing: string[] }) {
  if (!missing.length) return null;
  return (
    <div className="mb-10 rounded-xl border border-danger/40 bg-danger/5 p-5">
      <p className="text-sm font-medium text-danger">
        This document is not ready to publish.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {missing.length} placeholder{missing.length > 1 ? "s" : ""} in{" "}
        <code className="font-mono text-xs">lib/legal.ts</code> still need real values:{" "}
        <span className="font-mono text-xs">{missing.join(", ")}</span>. Until they are
        filled in, this page names no one and protects no one.
      </p>
    </div>
  );
}
