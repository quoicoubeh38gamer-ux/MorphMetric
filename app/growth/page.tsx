"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Moon, Salad, Repeat, Info } from "lucide-react";
import type { GrowthInput, Profile } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { computeGrowthSupport, buildNutritionPlan } from "@/lib/ai/growth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EvidenceTag } from "@/components/ui/evidence-tag";
import { Button } from "@/components/ui/button";

export default function GrowthPage() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sleep, setSleep] = useState(8);
  const [activity, setActivity] = useState(45);
  const [nutrition, setNutrition] = useState(6);
  const [consistency, setConsistency] = useState(5);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = store.getProfile();
    setProfile(p);
    const g = store.getGrowth();
    if (g) {
      if (g.sleepHours !== null) setSleep(g.sleepHours);
      if (g.activityMinutes !== null) setActivity(g.activityMinutes);
      if (g.nutritionQuality !== null) setNutrition(g.nutritionQuality);
      if (g.consistency !== null) setConsistency(g.consistency);
    }
    setLoaded(true);
  }, []);

  const age = profile?.ageYears ?? null;

  const input: GrowthInput = {
    ageYears: age,
    sleepHours: sleep,
    activityMinutes: activity,
    nutritionQuality: nutrition,
    consistency,
  };

  const support = useMemo(() => computeGrowthSupport(input), [sleep, activity, nutrition, consistency, age]);
  const plan = useMemo(
    () => buildNutritionPlan(profile ?? { ageYears: age, sex: "unspecified", heightCm: null, parentAvgCm: null, goals: [] }),
    [profile, age],
  );

  function save() {
    store.setGrowth(input);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      <Badge tone="accent"><Activity className="h-3.5 w-3.5" /> Body &amp; Growth</Badge>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Growth Support</h1>
      <p className="mt-2 max-w-2xl text-muted">
        This section is fully separate from your face score. It describes habits
        associated with healthy development — it does not predict height.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Inputs */}
        <Card>
          <h2 className="font-display text-lg font-semibold">Your habits</h2>
          <p className="text-sm text-muted">Adjust to see your support score update live.</p>

          <div className="mt-6 space-y-6">
            <Slider label="Sleep" icon={Moon} value={sleep} min={4} max={12} step={0.5} unit="h" onChange={setSleep} />
            <Slider label="Activity" icon={Activity} value={activity} min={0} max={120} step={5} unit="min/day" onChange={setActivity} />
            <Slider label="Nutrition quality" icon={Salad} value={nutrition} min={0} max={10} step={1} unit="/10" onChange={setNutrition} />
            <Slider label="Consistency" icon={Repeat} value={consistency} min={0} max={10} step={1} unit="/10" onChange={setConsistency} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={save}>{saved ? "Saved ✓" : "Save"}</Button>
            {age !== null && age < 18 ? (
              <span className="text-xs text-accent">Under-18 mode: supportive, non-restrictive guidance.</span>
            ) : null}
          </div>
        </Card>

        {/* Support scores */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Growth Support</h2>
            <Badge tone="default">Trend: {support.trend}</Badge>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-mono text-4xl font-semibold tabular">{support.overall}</span>
            <span className="mb-1 text-sm text-muted">/ 10</span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { l: "Sleep", v: support.sleepScore, icon: Moon },
              { l: "Nutrition", v: support.nutritionScore, icon: Salad },
              { l: "Activity", v: support.activityScore, icon: Activity },
              { l: "Consistency", v: support.consistencyScore, icon: Repeat },
            ].map((r) => (
              <div key={r.l}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted"><r.icon className="h-4 w-4" /> {r.l}</span>
                  <span className="font-mono tabular">{r.v} / 10</span>
                </div>
                <Progress value={r.v} max={10} tone="accent" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-5">
            {support.notes.map((n) => (
              <div key={n.text} className="text-sm">
                <p className="flex items-start gap-2 text-muted">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" /> {n.text}
                </p>
                <div className="ml-6 mt-1.5">
                  <EvidenceTag tier={n.tier} sourceKey={n.sourceKey} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Nutrition plan */}
      <Card className="mt-5">
        <h2 className="font-display text-lg font-semibold">{plan.headline}</h2>
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> {plan.disclaimer}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Nutrient priorities</h3>
            <ul className="mt-3 space-y-2.5">
              {plan.priorities.map((p) => (
                <li key={p.nutrient} className="rounded-xl border border-border bg-background/40 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{p.nutrient}</span>
                    <EvidenceTag tier={p.tier} sourceKey={p.sourceKey} />
                  </div>
                  <p className="mt-1.5 text-xs leading-snug text-muted">{p.why}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">A day of real food</h3>
            <div className="mt-3 space-y-3">
              {plan.meals.map((m) => (
                <div key={m.name} className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="mt-1 text-sm text-muted">{m.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Slider({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-primary" /> {label}
        </span>
        <span className="font-mono text-sm tabular text-muted">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
      />
    </div>
  );
}
