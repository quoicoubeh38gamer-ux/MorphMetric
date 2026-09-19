"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, CheckCircle2, Circle, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import type { FaceReport, GrowthInput, Profile } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { buildGlowUpPlan } from "@/lib/ai/plan";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EvidenceTag } from "@/components/ui/evidence-tag";
import { ButtonLink } from "@/components/ui/button";

export default function PlanPage() {
  const [loaded, setLoaded] = useState(false);
  const [report, setReport] = useState<FaceReport | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [growth, setGrowth] = useState<GrowthInput | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setReport(store.getReport());
    setProfile(store.getProfile());
    setGrowth(store.getGrowth());
    setDone(store.getPlanProgress());
    setLoaded(true);
  }, []);

  const weeks = useMemo(() => buildGlowUpPlan(report, growth), [report, growth]);
  const total = useMemo(() => weeks.reduce((n, w) => n + w.tasks.length, 0), [weeks]);
  const completed = useMemo(() => Object.values(done).filter(Boolean).length, [done]);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const minor = profile?.ageYears != null && profile.ageYears < 18;

  function toggle(id: string) {
    const next = !done[id];
    setDone((d) => ({ ...d, [id]: next }));
    store.setPlanTask(id, next);
    if (next) store.addXp(10);
  }

  if (!loaded) {
    return (
      <div className="container py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <Badge tone="primary"><CalendarRange className="h-3.5 w-3.5" /> Glow-up plan</Badge>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Your 4-week glow-up</h1>
      <p className="mt-2 max-w-2xl text-muted">
        A focused, week-by-week plan built only from things you control. Check items off to earn XP.
      </p>

      {minor ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>Under 18: this plan is health-first — habits and grooming, nothing extreme.</span>
        </div>
      ) : null}

      {/* progress header */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            <span className="font-medium">Plan progress</span>
          </div>
          <span className="font-mono text-sm tabular text-muted">
            {completed}/{total} · {pct}%
          </span>
        </div>
        <div className="mt-3">
          <Progress value={pct} max={100} tone="accent" />
        </div>
        {!report ? (
          <p className="mt-4 text-sm text-muted">
            Tip: run a scan first so future versions can tailor this to your focus areas.{" "}
            <ButtonLink href="/scan" size="sm" variant="secondary" className="mt-2">Start a scan</ButtonLink>
          </p>
        ) : null}
      </Card>

      {/* weeks */}
      <div className="mt-6 space-y-5">
        {weeks.map((wk) => {
          const wkDone = wk.tasks.filter((t) => done[t.id]).length;
          return (
            <Card key={wk.week}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 font-mono text-sm text-primary">
                      W{wk.week}
                    </span>
                    <h2 className="font-display text-lg font-semibold">{wk.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted">{wk.focus}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted">{wkDone}/{wk.tasks.length}</span>
              </div>

              <ul className="mt-4 space-y-2.5">
                {wk.tasks.map((task) => {
                  const isDone = Boolean(done[task.id]);
                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => toggle(task.id)}
                        className={
                          "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors " +
                          (isDone ? "border-accent/50 bg-accent/10" : "border-border hover:border-primary/40")
                        }
                      >
                        {isDone ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                        ) : (
                          <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                        )}
                        <span className="flex-1">
                          <span className={"text-sm " + (isDone ? "text-muted line-through" : "")}>{task.text}</span>
                          {task.tier ? (
                            <span className="mt-1.5 block">
                              <EvidenceTag tier={task.tier} sourceKey={task.sourceKey} />
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs text-muted">+10 XP</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted">
        <Sparkles className="h-4 w-4 text-primary" />
        Finish a week, then re-scan to see your progress on the dashboard.
      </div>
    </div>
  );
}
