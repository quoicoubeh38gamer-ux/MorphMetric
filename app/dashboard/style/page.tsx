"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Info } from "lucide-react";
import type { FaceReport } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { buildStyleIdeas, STYLE_CATEGORIES, type StyleCategory } from "@/lib/style-lab";
import { PageHeader } from "@/components/dashboard/page-header";
import { Loading } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function StyleLabPage() {
  const [report, setReport] = useState<FaceReport | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tried, setTried] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<StyleCategory | "All">("All");

  useEffect(() => {
    setReport(store.getReport());
    setTried(store.getStyleTried());
    setLoaded(true);
  }, []);

  const ideas = useMemo(() => buildStyleIdeas(report), [report]);
  const shown = filter === "All" ? ideas : ideas.filter((i) => i.category === filter);
  const measuredCount = ideas.filter((i) => !i.universal).length;

  if (!loaded) return <Loading />;

  return (
    <>
      <PageHeader
        title="Style Lab"
        description="Things worth trying, each one derived from a measurement in your scan. We do not paste hair onto your photo — a fake preview would be the least honest thing we could build."
      />

      <div className="card-base mt-8 flex items-start gap-3 p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-muted">
          {report?.metricsRaw
            ? `${measuredCount} ${measuredCount === 1 ? "idea is" : "ideas are"} tailored to your measurements; the rest apply to everyone. None of this treats a natural feature as a defect — it is about what balances your own proportions.`
            : "Run a scan with a clear, front-facing photo and this page adds ideas tailored to your own measurements. Until then, here are the ones that apply to everyone."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...STYLE_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              "focus-ring rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors",
              filter === c
                ? "border-foreground/20 bg-card text-foreground"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {shown.map((idea) => {
          const on = Boolean(tried[idea.id]);
          return (
            <article key={idea.id} className="card-base flex flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="default">{idea.category}</Badge>
                {idea.universal ? (
                  <span className="text-[11px] text-muted-foreground">applies to everyone</span>
                ) : (
                  <span className="text-[11px] text-accent">from your measurements</span>
                )}
              </div>
              <h2 className="mt-4 font-display text-xl tracking-tight">{idea.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{idea.how}</p>
              <p className="mt-4 rounded-xl border border-border bg-background/50 p-3.5 text-xs leading-relaxed text-muted">
                {idea.why}
              </p>
              <button
                type="button"
                onClick={() => setTried(store.toggleStyleTried(idea.id))}
                aria-pressed={on}
                className={cn(
                  "focus-ring mt-5 inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors",
                  on
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-border text-muted hover:border-foreground/20 hover:text-foreground",
                )}
              >
                {on ? <Check className="h-3.5 w-3.5 text-accent" /> : null}
                {on ? "Tried this" : "Mark as tried"}
              </button>
            </article>
          );
        })}
      </div>

      {!report ? (
        <div className="mt-8 text-center">
          <ButtonLink href="/scan">Analyze My Face</ButtonLink>
        </div>
      ) : null}
    </>
  );
}
