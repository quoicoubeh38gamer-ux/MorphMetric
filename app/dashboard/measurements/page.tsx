"use client";

import { useEffect, useState } from "react";
import type { FaceReport } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Loading, NoAnalysis } from "@/components/dashboard/empty-state";
import { FaceMap } from "@/components/results/face-map";
import { MethodologyDialog } from "@/components/results/methodology-dialog";
import { FeatureCard } from "@/components/results/feature-card";
import { Badge } from "@/components/ui/badge";

export default function MeasurementsPage() {
  const [report, setReport] = useState<FaceReport | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReport(store.getReport());
    setLoaded(true);
  }, []);

  if (!loaded) return <Loading />;
  if (!report) {
    return (
      <>
        <PageHeader title="Measurements" description="Every value we could read from your scan." />
        <NoAnalysis what="your measurement set" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Measurements"
        description="Every value read from your scan, with the reference range it is compared against."
        action={<MethodologyDialog />}
      />

      <section className="mt-8">
        <h2 className="font-display text-2xl tracking-tight">Face map</h2>
        <p className="mt-1 text-sm text-muted">Point at a region to see what was measured there.</p>
        <div className="mt-5">
          <FaceMap features={report.features} />
        </div>
      </section>

      {report.metrics.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-tight">Raw ratios</h2>
          <p className="mt-1 text-sm text-muted">
            Straight from your 468-point mesh. Reference values are a coordinate system, not a goal.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {report.metrics.map((m) => (
              <div key={m.key} className="card-base p-4">
                <div className="text-xs text-muted">{m.label}</div>
                <div className="mt-1.5 font-mono text-lg tabular">{m.value}</div>
                {m.hint ? <div className="mt-1.5 text-[11px] leading-snug text-muted">{m.hint}</div> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {report.comparisons.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl tracking-tight">Closeness to reference</h2>
            <Badge tone="accent">{report.harmonyScore}/100</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            How near each measured ratio sits to its neutral reference range.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {report.comparisons.map((c) => (
              <div key={c.key} className="card-base p-4">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{c.label}</span>
                  <span className="text-xs text-muted">
                    you <span className="font-mono text-foreground">{c.you}</span> · ref{" "}
                    <span className="font-mono">{c.ideal}</span>
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-700"
                    style={{ width: `${Math.round(c.proximity * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Region detail</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {report.features.map((f) => (
            <FeatureCard key={f.key} feature={f} />
          ))}
        </div>
      </section>
    </>
  );
}
