"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info, ScanFace, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import type { Controllability, FaceReport } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { score1 } from "@/lib/utils/format";
import { ScoreRing } from "@/components/ui/score-ring";
import { CountUp } from "@/components/ui/count-up";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { EvidenceTag } from "@/components/ui/evidence-tag";
import { ButtonLink, Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/results/feature-card";

const CONTROL_LABEL: Record<Controllability, string> = {
  controllable: "You control this",
  partial: "Partly in your control",
  fixed: "Structural — not chased here",
};

export default function ResultsPage() {
  const [report, setReport] = useState<FaceReport | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReport(store.getReport());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="container py-24 text-center text-muted">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-24">
        <Card className="mx-auto max-w-md text-center">
          <ScanFace className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-semibold">No analysis yet</h1>
          <p className="mt-2 text-sm text-muted">Run a scan to see your MorphMetric and roadmap.</p>
          <ButtonLink href="/scan" className="mt-6">Start your analysis</ButtonLink>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-12 sm:py-16">
      {/* Header / score */}
      <div className="animate-fade-up rounded-3xl border border-border bg-grid-fade p-6 sm:p-10">
        <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <ScoreRing value={report.morphScore} max={20} size={196}>
            <span className="text-xs uppercase tracking-widest text-muted">Your MorphMetric</span>
            <span className="mt-1 font-mono text-4xl font-semibold tabular">
              <CountUp value={report.morphScore} decimals={1} />
            </span>
            <span className="text-xs text-muted">/ 20</span>
          </ScoreRing>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary"><Sparkles className="h-3.5 w-3.5" /> Analysis complete</Badge>
              <ConfidenceBadge confidence={report.confidenceOverall} />
              <Badge tone="default">
                {report.provider.startsWith("mediapipe") ? "AI · 468-point scan" : "Basic scan"}
              </Badge>
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Your strengths, mapped
            </h1>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              This score is an internal application metric — not an objective measure of
              attractiveness or your worth. Treat it as a baseline to improve from.
            </p>

            {report.ageAware ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  Under-18 mode: the aesthetic score is intentionally de-emphasized. Focus on the
                  habits and{" "}
                  <Link href="/growth" className="underline underline-offset-2">Body &amp; Growth</Link>{" "}
                  guidance.
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {report.quality.issues.length > 0 ? (
          <p className="mt-6 flex items-center gap-2 text-xs text-muted">
            <TriangleAlert className="h-3.5 w-3.5 text-warning" />
            Image note: {report.quality.issues.join(" ")} Results may be less certain.
          </p>
        ) : null}
      </div>

      {/* Breakdown */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Score breakdown</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {report.features.map((f) => (
            <div key={f.key} className="card-base p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{f.label}</span>
                <span className="font-mono text-sm tabular">{score1(f.score)}</span>
              </div>
              <div className="mt-2.5">
                <Progress value={f.score} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strengths & focus */}
      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="font-display text-lg font-semibold">Your strengths</h2>
          </div>
          <ol className="mt-4 space-y-3">
            {report.strengths.map((s, i) => (
              <li key={s.key} className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  <span className="text-sm">{s.label}</span>
                </span>
                <span className="font-mono text-sm text-accent tabular">{score1(s.score)}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="font-display text-lg font-semibold">Areas to optimize</h2>
          </div>
          <ol className="mt-4 space-y-3">
            {report.focusAreas.map((s, i) => (
              <li key={s.key} className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  <span className="text-sm">{s.label}</span>
                </span>
                <span className="font-mono text-sm text-primary tabular">{score1(s.score)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Roadmap */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Your roadmap</h2>
        <p className="mt-1 text-sm text-muted">Three focused actions — no overload.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {report.roadmap.map((r) => (
            <Card key={r.id} className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl text-primary">0{r.order}</span>
                <Badge tone="default">{r.domain}</Badge>
              </div>
              <h3 className="mt-3 font-medium">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{r.body}</p>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted">{CONTROL_LABEL[r.controllability]}</p>
                <EvidenceTag tier={r.tier} sourceKey={r.sourceKey} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature detail */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Feature detail</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {report.features.map((f) => (
            <FeatureCard key={f.key} feature={f} />
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row">
        <div>
          <p className="font-medium">Keep going</p>
          <p className="text-sm text-muted">Track habits and see your Body &amp; Growth support.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard" variant="secondary">Dashboard</ButtonLink>
          <ButtonLink href="/growth">Body &amp; Growth</ButtonLink>
          <Button
            variant="ghost"
            onClick={() => {
              store.clearAll();
              setReport(null);
            }}
          >
            Delete my data
          </Button>
        </div>
      </section>
    </div>
  );
}
