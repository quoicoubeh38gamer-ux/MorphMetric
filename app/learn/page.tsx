import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { LEARN_CATEGORIES, articlesIn } from "@/lib/learn";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Plain-language guides to facial anatomy, what MorphMetric measures in each region, how the score is calculated, and which improvement claims actually hold up.",
  alternates: { canonical: "/learn" },
};

const BLURB: Record<string, string> = {
  "How it works": "The method, stated plainly — including its limits.",
  "Facial regions": "One guide per region we score, built from the same data the analysis uses.",
  "Using it well": "Getting a reading you can trust, and knowing where your data goes.",
};

export default function LearnIndexPage() {
  return (
    <div className="container max-w-5xl py-14 sm:py-20">
      <Reveal>
        <span className="inline-flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          Library
        </span>
        <h1 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Learn what the numbers mean
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
          Every region guide is generated from the same anatomy metadata the analysis engine scores
          against — so nothing here can contradict your report. Each improvement lever carries its
          evidence tier, and the claims that do not hold up are named rather than quietly omitted.
        </p>
      </Reveal>

      <div className="mt-14 space-y-14">
        {LEARN_CATEGORIES.map((category, ci) => {
          const items = articlesIn(category);
          if (!items.length) return null;
          return (
            <Reveal key={category} delay={0.05 * (ci + 1)}>
              <section>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-3">
                  <h2 className="font-display text-2xl tracking-tight">{category}</h2>
                  <p className="text-sm text-muted">{BLURB[category]}</p>
                </div>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {items.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/learn/${a.slug}`}
                        className="focus-ring card-base group flex h-full flex-col p-5 transition-colors hover:border-foreground/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg tracking-tight">{a.title}</h3>
                          <ArrowUpRight
                            className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{a.kicker}</p>
                        <span className="mt-4 text-xs text-muted-foreground">
                          {a.readMinutes} min read
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.25}>
        <div className="card-base mt-16 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-xl tracking-tight">See it on your own face</h2>
            <p className="mt-1.5 text-sm text-muted">
              The photo is processed in your browser. Only the numbers are scored.
            </p>
          </div>
          <ButtonLink href="/scan" className="w-full shrink-0 sm:w-auto">
            Run an analysis
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
