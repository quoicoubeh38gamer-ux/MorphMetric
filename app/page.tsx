import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Eye,
  Flame,
  Ruler,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCog,
} from "lucide-react";
import { Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Aurora } from "@/components/ui/aurora";
import { FEATURE_KEYS } from "@/lib/ai/types";
import { FEATURE_META } from "@/lib/ai/features";

const TRUST = [
  { icon: BadgeCheck, label: "Confidence-scored" },
  { icon: ShieldCheck, label: "Evidence-tagged" },
  { icon: Camera, label: "Privacy-first" },
];

const STEPS = [
  { icon: UserCog, title: "Profile", body: "Share only what's needed — age, goals, a couple of optional details." },
  { icon: ScanFace, title: "Scan", body: "Take or upload a photo. We check quality on your device before analyzing." },
  { icon: Sparkles, title: "Analysis", body: "A clear, visual breakdown of estimable features — each with a confidence level." },
  { icon: Ruler, title: "Roadmap", body: "Three focused, evidence-tagged actions on what you can actually control." },
];

const FEATURE_ICON = [Ruler, ScanFace, Eye, Sparkles, ScanFace, Sparkles, Ruler, ShieldCheck];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <Section className="relative overflow-hidden pt-14 sm:pt-20">
        <Aurora />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <Badge tone="primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered morphology & growth
            </Badge>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Understand your morphology.{" "}
              <span className="text-gradient">Build your potential.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              MorphMetric uses AI-powered visual analysis and evidence-based
              guidance to help you understand your features, habits and
              growth-related factors — then focus on what you can control.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/scan" size="lg">
                Start your analysis
              </ButtonLink>
              <ButtonLink href="#how" size="lg" variant="secondary">
                See how it works
              </ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-sm text-muted">
                  <t.icon className="h-4 w-4 text-accent" /> {t.label}
                </div>
              ))}
            </div>
          </div>
          <div className="animate-fade-in">
            <HeroVisual />
          </div>
        </div>
      </Section>

      {/* Reassurance strip */}
      <div className="border-y border-border bg-card/40">
        <div className="container flex flex-col items-start gap-3 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="text-foreground">The score is an internal metric</span> — not a
            measure of attractiveness or a person&apos;s worth.
          </p>
          <p>Every estimate shows a confidence level. Nothing uncertain is presented as fact.</p>
        </div>
      </div>

      {/* How it works */}
      <Section id="how">
        <SectionHeading
          eyebrow="How it works"
          title="From photo to a plan in four steps"
          description="Scan. Understand. Improve. No 30-tip overload — a short, prioritized path."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.07}>
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* What we analyze */}
      <Section className="pt-0">
        <SectionHeading
          eyebrow="Face analysis"
          title="What we analyze — and how sure we are"
          description="A 2D photo can't measure 3D anatomy reliably. So each feature carries a confidence level, and structure you can't change is labelled as such."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((key, i) => {
            const meta = FEATURE_META[key];
            const Icon = FEATURE_ICON[i] ?? ScanFace;
            return (
              <Reveal key={key} delay={i * 0.04}>
                <Card className="h-full">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-muted">{meta.category}</span>
                  </div>
                  <h3 className="mt-4 font-medium">{meta.label}</h3>
                  <p className="mt-1 text-sm text-muted">Baseline confidence: {meta.baseConfidence}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Two engines: face vs body/growth */}
      <Section className="pt-0">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full">
              <Badge tone="primary"><ScanFace className="h-3.5 w-3.5" /> Face</Badge>
              <h3 className="mt-4 font-display text-2xl font-semibold">Your MorphMetric</h3>
              <p className="mt-3 text-muted">
                A decomposed morphology score, three strengths, three areas to
                optimize, and a focused roadmap — all oriented toward improvement,
                never insecurity.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Decomposed 0–20 score", "Per-feature confidence", "Controllable vs fixed, made explicit"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-muted">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card className="h-full">
              <Badge tone="accent"><Activity className="h-3.5 w-3.5" /> Body &amp; Growth</Badge>
              <h3 className="mt-4 font-display text-2xl font-semibold">Growth Support</h3>
              <p className="mt-3 text-muted">
                A separate section for sleep, nutrition, activity and consistency —
                habits associated with healthy development. No promises to
                &ldquo;grow taller fast&rdquo;. Ever.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Sleep · Nutrition · Activity · Consistency", "Real-food nutrition guidance", "Evidence-tagged, never restrictive"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-muted">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Evidence */}
      <Section id="evidence" className="pt-0">
        <SectionHeading
          eyebrow="Anti-bullshit policy"
          title="Evidence, tiered — not hype"
          description="Every meaningful recommendation is tagged by how strong the evidence is. We never turn a hypothesis into a fact."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { tone: "accent" as const, title: "Evidence-backed", body: "Well established by recognized health bodies (WHO, CDC, NHS, NIH, EFSA, AAP…)." },
            { tone: "warning" as const, title: "Plausible / limited", body: "Some support, but not conclusive. We say so, out loud." },
            { tone: "danger" as const, title: "Unsupported", body: "Not sufficiently demonstrated. We won't recommend it as fact." },
          ].map((e) => (
            <Card key={e.title}>
              <Badge tone={e.tone}>{e.title}</Badge>
              <p className="mt-3 text-sm text-muted">{e.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Gamification */}
      <Section className="pt-0">
        <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Progression</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                Light, premium gamification
              </h2>
              <p className="mt-4 text-muted">
                Daily check-ins, weekly reports, a gentle XP system and badges for
                consistency — designed to build habits, never to gamify weight or
                restriction.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Consistency", "Sleep", "Nutrition", "Skincare", "Training"].map((b) => (
                  <Badge key={b} tone="default"><Trophy className="h-3.5 w-3.5 text-warning" /> {b}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Trophy, k: "Level", v: "12" },
                { icon: Sparkles, k: "Morph Points", v: "1,420" },
                { icon: Flame, k: "Streak", v: "8d" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-border bg-background/60 p-4 text-center">
                  <s.icon className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-2 font-mono text-xl">{s.v}</div>
                  <div className="text-xs text-muted">{s.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials — fictional */}
      <Section className="pt-0">
        <SectionHeading eyebrow="Testimonials" title="What early users say" />
        <p className="mt-3 text-xs text-muted">
          Placeholder — fictional testimonials for development only.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { q: "Finally an app that tells me what I can actually change instead of just a number.", a: "Dev placeholder · Léa" },
            { q: "The confidence levels made me trust it more, not less.", a: "Dev placeholder · Marco" },
            { q: "The growth section is genuinely just good, non-scary health advice.", a: "Dev placeholder · Sam" },
          ].map((t) => (
            <Card key={t.a}>
              <p className="text-sm">&ldquo;{t.q}&rdquo;</p>
              <p className="mt-4 text-xs text-muted">{t.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" className="pt-0">
        <SectionHeading
          eyebrow="Pricing"
          title="See your result. Upgrade for depth."
          description="The paywall sells the depth of the analysis — it never hides that a result exists."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="font-display text-xl font-semibold">Free</h3>
            <p className="mt-1 text-sm text-muted">Get a real result to start from.</p>
            <p className="mt-5 font-mono text-3xl">€0</p>
            <ul className="mt-5 space-y-2 text-sm">
              {["Basic scan & quality check", "Core feature analysis", "Limited recommendations", "Dashboard"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-muted">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {f}
                </li>
              ))}
            </ul>
            <ButtonLink href="/scan" variant="secondary" className="mt-7 w-full">Start free</ButtonLink>
          </Card>
          <Card className="relative border-primary/40 shadow-glow">
            <Badge tone="primary" className="absolute right-6 top-6">Most depth</Badge>
            <h3 className="font-display text-xl font-semibold">Pro</h3>
            <p className="mt-1 text-sm text-muted">The full analysis and progression.</p>
            <p className="mt-5 font-mono text-3xl">€9<span className="text-base text-muted">/mo</span></p>
            <ul className="mt-5 space-y-2 text-sm">
              {["Detailed analysis & explanations", "Personalized roadmap", "Growth dashboard & weekly reports", "Progress tracking"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {f}
                </li>
              ))}
            </ul>
            <ButtonLink href="/scan" className="mt-7 w-full">Start your analysis</ButtonLink>
            <p className="mt-3 text-center text-xs text-muted">Billing (Stripe) is deferred — not required for the MVP.</p>
          </Card>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-grid-fade p-10 text-center sm:p-16">
          <Aurora />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Your face isn&apos;t a mystery. Your habits aren&apos;t either.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Scan. Understand. Improve — with data-driven, evidence-tagged guidance.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/scan" size="lg">Start your analysis</ButtonLink>
            </div>
            <p className="mt-4 text-xs text-muted">
              By continuing you agree your photo is handled per our{" "}
              <Link href="/privacy" className="underline underline-offset-2">privacy approach</Link>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
