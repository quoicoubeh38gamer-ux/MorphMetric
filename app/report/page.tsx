"use client";

import { useEffect, useState } from "react";
import { FileDown, Printer } from "lucide-react";
import type { FaceReport } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { score1 } from "@/lib/utils/format";
import { bandLabel } from "@/lib/utils/score";
import { Button, ButtonLink } from "@/components/ui/button";
import { Loading } from "@/components/dashboard/empty-state";

/**
 * Printable measurement report.
 *
 * Rendered as a real page rather than a generated binary: the browser's own
 * "Save as PDF" produces selectable text, correct fonts and no extra
 * dependency — and because the data never leaves the device, neither does the
 * report.
 */
export default function ReportPage() {
  const [report, setReport] = useState<FaceReport | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReport(store.getReport());
    setLoaded(true);
  }, []);

  if (!loaded) return <div className="container"><Loading /></div>;

  if (!report) {
    return (
      <div className="container max-w-2xl py-24 text-center">
        <h1 className="font-display text-3xl tracking-tight">No analysis to report</h1>
        <p className="mt-3 text-sm text-muted">Run a scan and your report is generated here.</p>
        <ButtonLink href="/scan" className="mt-7">Analyze My Face</ButtonLink>
      </div>
    );
  }

  const created = new Date(report.createdAt);

  return (
    <div className="container max-w-3xl py-10 print:max-w-none print:py-0">
      {/* toolbar — never printed */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Your report</h1>
          <p className="mt-1.5 text-sm text-muted">
            Print or save as PDF. Everything is generated locally from your stored analysis.
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/dashboard" variant="ghost" size="sm">Back</ButtonLink>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* the document */}
      <article className="report-sheet rounded-2xl border border-border bg-surface p-8 sm:p-10 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-6 border-b border-border pb-6">
          <div>
            <p className="font-display text-2xl tracking-tight">MorphMetric</p>
            <p className="mt-1 text-xs text-muted">Measurement report</p>
          </div>
          <div className="text-right text-xs text-muted">
            <p>{created.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="mt-1 font-mono">{report.id}</p>
          </div>
        </header>

        <section className="report-block grid grid-cols-2 gap-6 border-b border-border py-7 sm:grid-cols-4">
          {[
            { l: "Overall index", v: `${score1(report.morphScore)} / 20` },
            { l: "Presentation ceiling", v: `${score1(report.potentialScore)} / 20` },
            { l: "Harmony", v: report.harmonyScore > 0 ? `${report.harmonyScore} / 100` : "n/a" },
            { l: "Confidence", v: report.confidenceOverall },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-[11px] uppercase tracking-wider text-muted">{s.l}</p>
              <p className="mt-1.5 font-mono text-xl tabular">{s.v}</p>
            </div>
          ))}
        </section>

        {report.metrics.length > 0 ? (
          <section className="report-block border-b border-border py-7">
            <h2 className="font-display text-xl tracking-tight">Measured ratios</h2>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {report.metrics.map((m) => (
                  <tr key={m.key} className="border-b border-border/70 last:border-0">
                    <th scope="row" className="py-2.5 text-left font-normal">{m.label}</th>
                    <td className="py-2.5 text-right font-mono tabular">{m.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="report-block border-b border-border py-7">
          <h2 className="font-display text-xl tracking-tight">Region breakdown</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted">
                <th scope="col" className="py-2 font-normal">Region</th>
                <th scope="col" className="py-2 text-right font-normal">Score</th>
                <th scope="col" className="py-2 text-right font-normal">Confidence</th>
                <th scope="col" className="py-2 text-right font-normal">Band</th>
              </tr>
            </thead>
            <tbody>
              {report.features.map((f) => (
                <tr key={f.key} className="border-b border-border/70 last:border-0">
                  <th scope="row" className="py-2.5 text-left font-normal">{f.label}</th>
                  <td className="py-2.5 text-right font-mono tabular">{score1(f.score)}</td>
                  <td className="py-2.5 text-right text-muted">{f.confidence}</td>
                  <td className="py-2.5 text-right text-muted">{bandLabel(f.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {report.roadmap.length > 0 ? (
          <section className="report-block border-b border-border py-7">
            <h2 className="font-display text-xl tracking-tight">Prioritized actions</h2>
            <ol className="mt-4 space-y-4">
              {report.roadmap.map((r) => (
                <li key={r.id} className="flex gap-4">
                  <span className="font-mono text-xs text-muted">0{r.order}</span>
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{r.body}</p>
                    <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted">
                      {r.tier.replace("-", " ")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="report-block py-7">
          <h2 className="font-display text-xl tracking-tight">Method &amp; limits</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Measurements were extracted from a 468-point facial mesh computed on the device, then
            compared to neutral reference ranges drawn from classical proportion canons. Closeness
            to a reference range is expressed 0–20 and weighted into the overall index.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Depth-dependent characteristics — nose projection, the bridge, the underlying jaw bone —
            and surface properties such as skin cannot be judged reliably from a single flat,
            front-lit photograph. Those are reported as estimated and are never scored as if
            measured.
          </p>
          <p className="mt-5 text-xs leading-relaxed text-muted">
            This report is an internal, relative metric intended as a baseline to compare against
            your own later scans. It is not a diagnosis, not medical advice, and not a measure of
            attractiveness or of a person&apos;s worth. Structural characteristics are reported as
            measurements, never as defects to correct.
          </p>
        </section>

        <footer className="flex items-center justify-between border-t border-border pt-5 text-[11px] text-muted">
          <span>morphmetric — generated on this device</span>
          <span className="font-mono">{created.toISOString().slice(0, 16).replace("T", " ")}</span>
        </footer>
      </article>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted print:hidden">
        <FileDown className="h-3.5 w-3.5" />
        In the print dialog choose “Save as PDF” as the destination.
      </p>
    </div>
  );
}
