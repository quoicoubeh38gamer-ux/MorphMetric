"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";
import type { FaceReport } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { score1 } from "@/lib/utils/format";
import { scoreTone, TONE_TEXT } from "@/lib/utils/score";
import { PageHeader } from "@/components/dashboard/page-header";
import { Loading, NoAnalysis } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Delta({ value }: { value: number }) {
  if (Math.abs(value) < 0.05) return <span className="font-mono text-xs text-muted">—</span>;
  const up = value > 0;
  return (
    <span className={`font-mono text-xs tabular ${up ? "text-accent" : "text-danger"}`}>
      {up ? "+" : ""}
      {value.toFixed(1)}
    </span>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [reports, setReports] = useState<FaceReport[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setReports(store.getReports());
    setLoaded(true);
  }, []);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-2)));
  }

  function remove(id: string) {
    store.removeReport(id);
    setReports(store.getReports());
    setSelected((s) => s.filter((x) => x !== id));
  }

  function open(r: FaceReport) {
    store.setReport(r);
    router.push("/results");
  }

  // Compare oldest → newest so a positive delta always means "moved up".
  const pair = useMemo(() => {
    if (selected.length !== 2) return null;
    const picked = reports.filter((r) => selected.includes(r.id));
    if (picked.length !== 2) return null;
    const [a, b] = [...picked].sort(
      (x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
    );
    return a && b ? { a, b } : null;
  }, [selected, reports]);

  if (!loaded) return <Loading />;
  if (reports.length === 0) {
    return (
      <>
        <PageHeader title="History" description="Every analysis you have saved." />
        <NoAnalysis what="your history" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="History"
        description="Your saved analyses. Pick any two to compare them side by side."
      />

      <ul className="mt-8 space-y-2.5">
        {reports.map((r, i) => {
          const isOn = selected.includes(r.id);
          return (
            <li
              key={r.id}
              className={`card-base flex flex-wrap items-center gap-4 p-4 ${isOn ? "border-foreground/25" : ""}`}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(r.id)}
                  aria-label={`Select analysis from ${fmtDate(r.createdAt)} to compare`}
                  className="h-4 w-4 accent-[hsl(var(--accent))]"
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {String(reports.length - i).padStart(2, "0")}
                </span>
              </label>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{fmtDate(r.createdAt)}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {r.provider.startsWith("mediapipe") ? "468-point scan" : "Basic scan"} ·{" "}
                  {r.confidenceOverall} confidence
                </p>
              </div>

              <div className="text-right">
                <div className={`font-mono text-lg tabular ${TONE_TEXT[scoreTone(r.morphScore)]}`}>
                  {score1(r.morphScore)}
                  <span className="text-xs text-muted"> / 20</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => open(r)}>
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  aria-label="Delete this analysis"
                  className="focus-ring grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {selected.length === 1 ? (
        <p className="mt-6 text-center text-sm text-muted">Select one more analysis to compare.</p>
      ) : null}

      {pair ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-tight">Comparison</h2>
          <p className="mt-1 text-sm text-muted">
            {fmtDate(pair.a.createdAt)} → {fmtDate(pair.b.createdAt)}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { l: "Overall index", a: pair.a.morphScore, b: pair.b.morphScore },
              { l: "Presentation ceiling", a: pair.a.potentialScore, b: pair.b.potentialScore },
              { l: "Harmony", a: pair.a.harmonyScore, b: pair.b.harmonyScore, suffix: "/100" },
            ].map((row) => (
              <div key={row.l} className="card-base p-5">
                <p className="text-xs text-muted">{row.l}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-sm tabular text-muted">{score1(row.a)}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-2xl tabular">{score1(row.b)}</span>
                  <span className="text-xs text-muted">{row.suffix ?? "/ 20"}</span>
                </div>
                <div className="mt-2">
                  <Delta value={Math.round((row.b - row.a) * 10) / 10} />
                </div>
              </div>
            ))}
          </div>

          <div className="card-base mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <caption className="sr-only">Per-region comparison between two analyses</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="px-5 py-3 text-xs font-medium text-muted">Region</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-muted">Before</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-muted">After</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-muted">Change</th>
                </tr>
              </thead>
              <tbody>
                {pair.b.features.map((f) => {
                  const before = pair.a.features.find((x) => x.key === f.key);
                  const d = before ? Math.round((f.score - before.score) * 10) / 10 : 0;
                  return (
                    <tr key={f.key} className="border-b border-border last:border-0">
                      <th scope="row" className="px-5 py-3 text-left font-normal">{f.label}</th>
                      <td className="px-3 py-3 text-right font-mono text-xs tabular text-muted">
                        {before ? score1(before.score) : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs tabular">{score1(f.score)}</td>
                      <td className="px-5 py-3 text-right"><Delta value={d} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            Lighting, camera distance and expression move these numbers too. For a comparison that
            reflects you rather than your setup, shoot both scans the same way — eye level, soft
            frontal light, neutral expression.
          </p>
          <div className="mt-4">
            <Badge tone="default">Comparing {selected.length} of 2 selected</Badge>
          </div>
        </section>
      ) : null}
    </>
  );
}
