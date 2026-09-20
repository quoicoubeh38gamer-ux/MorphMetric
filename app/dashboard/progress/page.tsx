"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Trophy, TrendingUp, CalendarCheck } from "lucide-react";
import type { FaceReport, GrowthInput } from "@/lib/ai/types";
import { store, type CheckIn, type ScanSnapshot } from "@/lib/store";
import { buildGlowUpPlan } from "@/lib/ai/plan";
import { computeStreak, levelFromXp } from "@/lib/gamification";
import { score1 } from "@/lib/utils/format";
import { Sparkline } from "@/components/ui/sparkline";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/page-header";
import { Loading } from "@/components/dashboard/empty-state";
import { ButtonLink } from "@/components/ui/button";

export default function ProgressPage() {
  const [loaded, setLoaded] = useState(false);
  const [xp, setXp] = useState(0);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [history, setHistory] = useState<ScanSnapshot[]>([]);
  const [report, setReport] = useState<FaceReport | null>(null);
  const [growth, setGrowth] = useState<GrowthInput | null>(null);
  const [planDone, setPlanDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setXp(store.getXp());
    setCheckins(store.getCheckins());
    setHistory(store.getHistory());
    setReport(store.getReport());
    setGrowth(store.getGrowth());
    setPlanDone(store.getPlanProgress());
    setLoaded(true);
  }, []);

  const level = useMemo(() => levelFromXp(xp), [xp]);
  const streak = useMemo(() => computeStreak(checkins), [checkins]);
  const chrono = useMemo(() => [...history].reverse().map((s) => s.morphScore), [history]);
  const weeks = useMemo(() => buildGlowUpPlan(report, growth), [report, growth]);
  const planTotal = weeks.reduce((n, w) => n + w.tasks.length, 0);
  const planCompleted = Object.values(planDone).filter(Boolean).length;
  const planPct = planTotal > 0 ? Math.round((planCompleted / planTotal) * 100) : 0;

  const first = chrono[0];
  const last = chrono[chrono.length - 1];
  const trend = first !== undefined && last !== undefined ? Math.round((last - first) * 10) / 10 : null;

  if (!loaded) return <Loading />;

  return (
    <>
      <PageHeader
        title="Progress"
        description="Consistency is the only thing here that compounds. These track habits and your own scans — never a comparison with anyone else."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Trophy, label: "Level", value: String(level.level), sub: `${level.intoLevel} / 200 XP` },
          { icon: Flame, label: "Check-in streak", value: `${streak}`, sub: streak === 1 ? "day" : "days" },
          { icon: CalendarCheck, label: "Scans saved", value: String(history.length), sub: "in this browser" },
        ].map((s) => (
          <div key={s.label} className="card-base p-5">
            <s.icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
            <p className="mt-4 font-mono text-3xl tabular tracking-tight">{s.value}</p>
            <p className="mt-1 text-sm">{s.label}</p>
            <p className="mt-0.5 text-xs text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl tracking-tight">Level {level.level}</h2>
            <span className="font-mono text-xs text-muted">{level.toNext} XP to next</span>
          </div>
          <div className="mt-4">
            <Progress value={level.pct} max={100} tone="accent" />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            XP comes from scanning and from checking off plan tasks — actions you control. It is
            deliberately not tied to any measurement going up.
          </p>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl tracking-tight">Plan completion</h2>
            <span className="font-mono text-xs text-muted">
              {planCompleted}/{planTotal} · {planPct}%
            </span>
          </div>
          <div className="mt-4">
            <Progress value={planPct} max={100} tone="accent" />
          </div>
          <ButtonLink href="/plan" variant="secondary" size="sm" className="mt-5">
            Open the 4-week plan
          </ButtonLink>
        </div>
      </section>

      <section className="card-base mt-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl tracking-tight">Index over time</h2>
          {trend !== null && chrono.length > 1 ? (
            <span
              className={`inline-flex items-center gap-1.5 font-mono text-xs tabular ${
                trend >= 0 ? "text-accent" : "text-danger"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(1)} since your first scan
            </span>
          ) : null}
        </div>
        {chrono.length > 1 ? (
          <>
            <Sparkline values={chrono} className="mt-4 h-16 w-full" />
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
              <span>{first !== undefined ? score1(first) : ""}</span>
              <span>{last !== undefined ? score1(last) : ""}</span>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Run at least two scans to see a trend. Shoot them the same way so the line tracks you
            and not your lighting.
          </p>
        )}
      </section>
    </>
  );
}
