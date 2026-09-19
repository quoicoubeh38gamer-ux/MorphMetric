"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Flame, Moon, Salad, Sparkles, Trophy, Droplets, CheckCircle2, Circle } from "lucide-react";
import type { FaceReport, GrowthInput } from "@/lib/ai/types";
import { store, type CheckIn, type ScanSnapshot } from "@/lib/store";
import { Sparkline } from "@/components/ui/sparkline";
import { computeGrowthSupport } from "@/lib/ai/growth";
import { computeStreak, levelFromXp } from "@/lib/gamification";
import { greeting, score1 } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/ui/count-up";
import { Burst } from "@/components/ui/burst";
import { ButtonLink, Button } from "@/components/ui/button";

const MISSIONS = [
  { key: "sleep", label: "Sleep 8h+", icon: Moon },
  { key: "nutrition", label: "Complete nutrition check-in", icon: Salad },
  { key: "activity", label: "30 min activity", icon: Activity },
] as const;

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [report, setReport] = useState<FaceReport | null>(null);
  const [growthInput, setGrowthInput] = useState<GrowthInput | null>(null);
  const [xp, setXp] = useState(0);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [history, setHistory] = useState<ScanSnapshot[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    setReport(store.getReport());
    setGrowthInput(store.getGrowth());
    setXp(store.getXp());
    setCheckins(store.getCheckins());
    setHistory(store.getHistory());
    setLoaded(true);
  }, []);

  const chrono = useMemo(() => [...history].reverse().map((s) => s.morphScore), [history]);
  const latest = history[0];
  const prev = history[1];
  const delta = latest && prev ? Math.round((latest.morphScore - prev.morphScore) * 10) / 10 : null;

  const level = useMemo(() => levelFromXp(xp), [xp]);
  const streak = useMemo(() => computeStreak(checkins), [checkins]);
  const growth = useMemo(() => (growthInput ? computeGrowthSupport(growthInput) : null), [growthInput]);

  function toggle(key: string) {
    setDone((d) => ({ ...d, [key]: !d[key] }));
  }

  function logCheckin() {
    const c: CheckIn = {
      date: new Date().toISOString(),
      sleepHours: null,
      hydration: true,
      meals: Boolean(done.nutrition),
      activity: Boolean(done.activity),
    };
    store.addCheckin(c);
    store.addXp(15);
    setCheckins(store.getCheckins());
    setXp(store.getXp());
    setLogged(true);
  }

  if (!loaded) {
    return (
      <div className="container py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">{greeting()}.</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight">Your dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="primary"><Trophy className="h-3.5 w-3.5" /> Level {level.level}</Badge>
          <Badge tone="accent">
            <Sparkles className="h-3.5 w-3.5" /> <CountUp value={xp} decimals={0} duration={0.9} /> XP
          </Badge>
          <Badge tone="warning">
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Flame className="h-3.5 w-3.5" />
            </motion.span>
            {streak} day{streak === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {/* Level progress */}
      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>Level {level.level}</span>
          <span>{level.toNext} XP to level {level.level + 1}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${level.pct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Morph score */}
        <Card className="lg:col-span-1">
          <p className="text-sm text-muted">Your MorphMetric</p>
          {report ? (
            <>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-mono text-4xl font-semibold tabular">{score1(report.morphScore)}</span>
                <span className="mb-1 text-sm text-muted">/ 20</span>
              </div>
              <div className="mt-4 space-y-2">
                {report.strengths.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{s.label}</span>
                    <span className="font-mono text-accent tabular">{score1(s.score)}</span>
                  </div>
                ))}
              </div>
              <Link href="/results" className="mt-4 inline-block text-sm text-primary hover:underline">
                View full analysis →
              </Link>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted">No scan yet.</p>
              <ButtonLink href="/scan" size="sm" className="mt-4">Start your analysis</ButtonLink>
            </div>
          )}
        </Card>

        {/* Focus */}
        <Card className="lg:col-span-1">
          <p className="text-sm text-muted">Focus</p>
          {report ? (
            <ul className="mt-3 space-y-2.5">
              {report.focusAreas.map((f) => (
                <li key={f.key} className="flex items-center justify-between text-sm">
                  <span>{f.label}</span>
                  <span className="font-mono text-primary tabular">{score1(f.score)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Run a scan to see your focus areas.</p>
          )}
        </Card>

        {/* Growth support */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Growth Support</p>
            <Link href="/growth" className="text-xs text-primary hover:underline">Open</Link>
          </div>
          {growth ? (
            <>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-mono text-4xl font-semibold tabular">{growth.overall}</span>
                <span className="mb-1 text-sm text-muted">/ 10</span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {[
                  { l: "Sleep", v: growth.sleepScore, icon: Moon },
                  { l: "Nutrition", v: growth.nutritionScore, icon: Salad },
                  { l: "Activity", v: growth.activityScore, icon: Activity },
                ].map((r) => (
                  <div key={r.l} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted"><r.icon className="h-4 w-4" /> {r.l}</span>
                    <span className="font-mono tabular">{r.v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted">Set up Body &amp; Growth to see your support score.</p>
              <ButtonLink href="/growth" size="sm" variant="secondary" className="mt-4">Set up</ButtonLink>
            </div>
          )}
        </Card>
      </div>

      {/* Progress over time */}
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg">Your progress</h2>
            <p className="text-sm text-muted">Morphology score across your scans.</p>
          </div>
          <Link href="/plan" className="text-xs text-primary hover:underline">Open plan →</Link>
        </div>
        {history.length >= 2 && latest ? (
          <>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-mono text-3xl font-semibold tabular">{score1(latest.morphScore)}</span>
              {delta !== null ? (
                <span className={`mb-1 text-sm ${delta >= 0 ? "text-accent" : "text-danger"}`}>
                  {delta >= 0 ? "↑ +" : "↓ "}
                  {score1(Math.abs(delta))} vs last scan
                </span>
              ) : null}
            </div>
            <Sparkline values={chrono} className="mt-3 h-16 w-full" />
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Run at least two scans to see your trend.{" "}
            <Link href="/scan" className="text-primary hover:underline">Scan now →</Link>
          </p>
        )}
      </Card>

      {/* Today's missions */}
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg">Today&apos;s missions</h2>
            <p className="text-sm text-muted">Small, consistent wins. +15 XP for logging your check-in.</p>
          </div>
          <Droplets className="h-5 w-5 text-accent" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {MISSIONS.map((m) => {
            const isDone = Boolean(done[m.key]);
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => toggle(m.key)}
                className={
                  "flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors " +
                  (isDone ? "border-accent/50 bg-accent/10" : "border-border hover:border-primary/40")
                }
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-muted" />
                )}
                <span className="flex items-center gap-2 text-sm">
                  <m.icon className="h-4 w-4 text-muted" /> {m.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative mt-5 flex items-center gap-3">
          {logged ? <Burst /> : null}
          <Button onClick={logCheckin} disabled={logged}>
            {logged ? "Logged ✓" : "Log check-in"}
          </Button>
          {logged ? (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-accent"
            >
              +15 XP · streak updated 🔥
            </motion.span>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
