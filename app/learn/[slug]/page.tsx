import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LEARN_ARTICLES, articleBySlug, type LearnPoint, type LearnSection } from "@/lib/learn";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import type { EvidenceTier } from "@/lib/ai/types";

export function generateStaticParams() {
  return LEARN_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.title,
    description: article.kicker,
    alternates: { canonical: `/learn/${article.slug}` },
    openGraph: { title: article.title, description: article.kicker, type: "article" },
  };
}

const TIER_TONE: Record<EvidenceTier, "accent" | "warning" | "danger"> = {
  "evidence-backed": "accent",
  plausible: "warning",
  unsupported: "danger",
};
const TIER_LABEL: Record<EvidenceTier, string> = {
  "evidence-backed": "Evidence-backed",
  plausible: "Plausible",
  unsupported: "Unsupported",
};

function Point({ point }: { point: LearnPoint }) {
  return (
    <li className="border-t border-border py-4 first:border-t-0 first:pt-0">
      <p className="text-[0.9375rem] leading-relaxed text-foreground">{point.text}</p>
      {point.tier || point.source ? (
        <span className="mt-2.5 inline-flex flex-wrap items-center gap-2">
          {point.tier ? <Badge tone={TIER_TONE[point.tier]}>{TIER_LABEL[point.tier]}</Badge> : null}
          {point.source ? (
            <a
              href={point.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-foreground"
            >
              {point.source.org} — {point.source.title} ↗
            </a>
          ) : null}
        </span>
      ) : null}
    </li>
  );
}

function SectionBlock({ section }: { section: LearnSection }) {
  return (
    <section className="border-t border-border pt-10">
      <h2 className="font-display text-2xl tracking-tight">{section.heading}</h2>

      {section.kind === "prose" ? (
        <div className="mt-4 space-y-4">
          {section.paragraphs.map((p, i) => (
            <p key={i} className="text-[0.9375rem] leading-relaxed text-muted">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      {section.kind === "note" ? (
        <p className="mt-4 border-l-2 border-accent/50 bg-surface/60 px-5 py-4 text-[0.9375rem] leading-relaxed text-muted">
          {section.body}
        </p>
      ) : null}

      {section.kind === "list" ? (
        <>
          {section.intro ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">{section.intro}</p>
          ) : null}
          <ul className="mt-5">
            {section.points.map((p, i) => (
              <Point key={i} point={p} />
            ))}
          </ul>
        </>
      ) : null}

      {section.kind === "measures" ? (
        <>
          {section.intro ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">{section.intro}</p>
          ) : null}
          <dl className="mt-5 overflow-hidden rounded-xl border border-border">
            {section.rows.map((r) => (
              <div
                key={r.label}
                className="flex flex-col gap-1 border-t border-border p-4 first:border-t-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="text-[0.9375rem] text-foreground">{r.label}</dt>
                <dd className="tabular text-sm text-muted">{r.reference}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </section>
  );
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const others = LEARN_ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug,
  ).slice(0, 4);

  return (
    <div className="container max-w-3xl py-12 sm:py-16">
      <Link
        href="/learn"
        className="focus-ring inline-flex items-center gap-2 rounded-full text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All guides
      </Link>

      <Reveal>
        <header className="mt-6">
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {article.category} · {article.readMinutes} min read
          </span>
          <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">{article.kicker}</p>
        </header>
      </Reveal>

      <div className="mt-12 space-y-10">
        {article.sections.map((s, i) => (
          <SectionBlock key={`${s.kind}-${i}`} section={s} />
        ))}
      </div>

      {article.featureKey ? (
        <div className="card-base mt-14 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-muted">
            Your own measurements for this region, with your values next to each reference range.
          </p>
          <ButtonLink href="/scan" size="sm" className="w-full shrink-0 sm:w-auto">
            Measure mine
          </ButtonLink>
        </div>
      ) : null}

      {others.length ? (
        <nav className="mt-14 border-t border-border pt-8">
          <h2 className="text-sm font-medium tracking-tight">More in {article.category}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {others.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/learn/${a.slug}`}
                  className="focus-ring block rounded-xl border border-border p-4 text-sm transition-colors hover:border-foreground/20 hover:bg-surface"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
