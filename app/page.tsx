import Link from "next/link";
import {
  ArrowRight,
  Check,
  Fingerprint,
  Gauge,
  Layers,
  Lock,
  ScanLine,
  ShieldCheck,
  Sparkle,
  Trash2,
} from "lucide-react";
import { Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Faq, type FaqItem } from "@/components/ui/faq";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Aurora } from "@/components/ui/aurora";
import { PLAN_META, PLAN_ORDER } from "@/lib/subscription";
import { siteUrl } from "@/lib/site-url";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MorphMetric",
  url: siteUrl(),
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "Assisted visual analysis of facial proportions and measurements, with evidence-tagged guidance on what you can control.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

const STEPS = [
  {
    icon: Fingerprint,
    title: "Profile",
    body: "Age and a couple of optional details. Nothing more than the analysis actually uses.",
  },
  {
    icon: ScanLine,
    title: "Capture",
    body: "Take or upload a photo. Lighting, sharpness and framing are checked on your device first.",
  },
  {
    icon: Layers,
    title: "Measure",
    body: "A 468-point mesh extracts real geometry — proportions, angles and ratios, each with a confidence level.",
  },
  {
    icon: Gauge,
    title: "Understand",
    body: "Every measurement is compared to a neutral reference range, with what you can and cannot influence made explicit.",
  },
];

const REGIONS = [
  {
    group: "Face structure",
    items: ["Facial thirds", "Width-to-height (fWHR)", "Midline symmetry indicators", "Landmark relationships"],
  },
  {
    group: "Eye area",
    items: ["Canthal tilt", "Eye spacing", "Brow positioning", "Eye-area symmetry indicators"],
  },
  {
    group: "Nose",
    items: ["Nasal base width", "Nose-to-face proportion", "Bridge characteristics", "Projection (estimated)"],
  },
  {
    group: "Lips & mouth",
    items: ["Mouth width", "Upper / lower relationship", "Width vs facial landmarks", "Vermilion fullness (estimated)"],
  },
  {
    group: "Jaw & chin",
    items: ["Bigonial width", "Lower-third height", "Jaw contour indicators", "Left / right symmetry"],
  },
  {
    group: "Overall",
    items: ["Harmony metrics", "Proportion index", "Per-region confidence", "Comparison to reference ranges"],
  },
];

const PLAN_LINES: Record<string, string[]> = {
  free: [
    "3 analyses per month",
    "Core measurements & overall index",
    "Interactive face map",
    "Prioritized action roadmap",
    "Body & Growth dashboard",
  ],
  pro: [
    "Unlimited analyses",
    "Full per-region measurement set",
    "Analysis history & comparisons",
    "Weekly report & next best action",
    "Style Lab experimentation",
  ],
  premium: [
    "Everything in Pro",
    "Advanced reports & deeper analysis",
    "PDF report export",
    "Priority access to new modules",
    "Extended history retention",
  ],
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is this a medical or diagnostic tool?",
    a: "No. MorphMetric produces descriptive visual measurements — proportions, angles and ratios — and compares them to neutral reference ranges. It is not a diagnosis, not medical advice, and not an assessment of a person's worth or attractiveness. If something about your health concerns you, speak to a qualified professional.",
  },
  {
    q: "Does my photo leave my device?",
    a: "No. The vision model runs in your browser. Your photo is re-encoded locally (which also strips EXIF and GPS metadata), and only bounded numeric measurements are sent to the server for scoring. We never receive, transmit or store the image itself.",
  },
  {
    q: "How accurate can a single 2D photo be?",
    a: "Honestly: it depends on the measurement. Flat geometry — thirds, spacing, tilt, widths — is measurable and we score it precisely. Depth-dependent characteristics like nose projection or the underlying jaw bone are not reliably readable from one frontal image, so we label them as estimated instead of inventing a number. Every region carries its own confidence level.",
  },
  {
    q: "Can an app change my bone structure?",
    a: "No, and we will not pretend otherwise. After growth completes, facial bone is fixed. Exercises, tongue posture and impact 'techniques' have no evidence behind them and some carry real injury risk — we flag those explicitly. What genuinely moves is presentation: skin, sleep, body composition, styling, posture, lighting and angles.",
  },
  {
    q: "What do the scores actually mean?",
    a: "They are internal, relative metrics of how close a measurement sits to a neutral reference range — a baseline to improve from and compare against your own later scans. They are not an objective ranking of people, and we show the methodology and its limits directly in the product.",
  },
  {
    q: "Can I delete everything?",
    a: "Yes, at any time and in one click. Your analyses live in your own browser storage by default, and the privacy page has a permanent delete control that clears all of it.",
  },
];

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <Section className="relative overflow-hidden pt-16 sm:pt-24">
        <Aurora />
        <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <Badge tone="default">
              <Sparkle className="h-3 w-3" /> Assisted facial measurement
            </Badge>
            <h1 className="mt-6 font-display text-[2.75rem] leading-[1.04] tracking-tightest sm:text-6xl">
              Understand Your Face.
              <br />
              <span className="text-gradient">Understand Your Features.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              MorphMetric uses AI-assisted visual analysis to measure the proportions,
              angles and ratios of your face — then turns them into clear, personalized
              information about what you can actually influence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/scan" size="lg">
                Analyze My Face <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#analysis" size="lg" variant="secondary">
                Explore the Analysis
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-7">
              {[
                { k: "468", v: "landmark points" },
                { k: "20+", v: "measurements" },
                { k: "0", v: "photos uploaded" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="tabular font-mono text-2xl tracking-tight">{s.k}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-fade-in">
            <HeroVisual />
          </div>
        </div>
      </Section>

      {/* Positioning strip */}
      <div className="border-y border-border bg-surface/50">
        <div className="container flex flex-col gap-3 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="text-foreground">Measurements, not verdicts.</span> Every value is
            compared to a neutral reference range.
          </p>
          <p>Each estimate carries a confidence level. Nothing uncertain is presented as fact.</p>
        </div>
      </div>

      {/* How it works */}
      <Section id="how">
        <SectionHeading
          eyebrow="How it works"
          title="From a photo to a precise measurement set"
          description="Four steps. No thirty-tip overload — a short, prioritized path from capture to what to do next."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-card p-7">
              <div className="flex items-center justify-between">
                <s.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-xl tracking-tight">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* What we measure */}
      <Section id="analysis" className="pt-0">
        <SectionHeading
          eyebrow="The analysis"
          title="Every region, measured and explained"
          description="Each region is broken into the specific characteristics that drive it, with the anatomy behind the measurement and an honest note on what a flat photo cannot judge."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <Reveal key={r.group} delay={i * 0.05}>
              <Card className="h-full p-7">
                <h3 className="font-display text-xl tracking-tight">{r.group}</h3>
                <ul className="mt-5 space-y-2.5">
                  {r.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-sm text-muted">
                      <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Evidence */}
      <Section id="evidence" className="pt-0">
        <SectionHeading
          eyebrow="Evidence policy"
          title="Tiered evidence, never hype"
          description="Every meaningful recommendation is tagged by how strong the evidence behind it is. We never turn a hypothesis into a fact, and we name the popular techniques that do not work."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              tone: "success" as const,
              title: "Evidence-backed",
              body: "Well established by recognized health bodies — WHO, CDC, NHS, NIH, EFSA, AAP.",
            },
            {
              tone: "warning" as const,
              title: "Plausible / limited",
              body: "Some support, but not conclusive. We say so out loud rather than rounding it up.",
            },
            {
              tone: "danger" as const,
              title: "Unsupported",
              body: "Not demonstrated, and sometimes harmful. Flagged so you can skip it entirely.",
            },
          ].map((e) => (
            <Card key={e.title} className="p-7">
              <Badge tone={e.tone}>{e.title}</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{e.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Privacy & security */}
      <Section id="privacy-promise" className="pt-0">
        <div className="ring-pearl grain relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-14">
          <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>Privacy &amp; security</Eyebrow>
              <h2 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
                Your face never leaves your device.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted">
                A face photo is among the most sensitive data a person can hand over. So we
                designed the product not to need it. The model runs in your browser and only
                bounded numbers are sent for scoring.
              </p>
              <ButtonLink href="/privacy" variant="secondary" className="mt-7">
                Read the privacy approach
              </ButtonLink>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              {[
                { icon: Lock, t: "On-device analysis", d: "The vision model runs locally. No image upload, no server-side copy." },
                { icon: Trash2, t: "One-click deletion", d: "Permanently clear every analysis and setting whenever you want." },
                { icon: ShieldCheck, t: "Metadata stripped", d: "Photos are re-encoded locally, removing EXIF and GPS before anything else happens." },
                { icon: Fingerprint, t: "Explicit consent", d: "Nothing is processed until you agree, and never reused for another purpose." },
              ].map((f) => (
                <li key={f.t} className="bg-card p-6">
                  <f.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <p className="mt-4 text-sm font-medium">{f.t}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{f.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" className="pt-0">
        <SectionHeading
          eyebrow="Pricing"
          title="See your result. Pay for the depth."
          description="Every plan gives you a real analysis. Paid tiers unlock the full measurement set, history and tooling — they never hide that a result exists."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLAN_META[id];
            const highlighted = Boolean(plan.highlight);
            return (
              <Card
                key={id}
                className={
                  highlighted
                    ? "ring-pearl relative flex h-full flex-col p-8 shadow-lift"
                    : "relative flex h-full flex-col p-8"
                }
              >
                {highlighted ? (
                  <Badge tone="accent" className="absolute right-7 top-7">
                    Most popular
                  </Badge>
                ) : null}
                <h3 className="font-display text-2xl tracking-tight">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{plan.tagline}</p>
                <p className="mt-7 flex items-baseline gap-1">
                  <span className="tabular font-mono text-4xl tracking-tight">€{plan.priceEur}</span>
                  <span className="text-sm text-muted">/mo</span>
                </p>
                <ul className="mt-7 flex-1 space-y-3">
                  {(PLAN_LINES[id] ?? []).map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                      <span className={highlighted ? "" : "text-muted"}>{line}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href="/scan"
                  variant={highlighted ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  {id === "free" ? "Start free" : `Choose ${plan.name}`}
                </ButtonLink>
              </Card>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Billing is not live yet — paid tiers are unlocked manually while payments are being set up.
        </p>
      </Section>

      {/* Testimonials — clearly labelled placeholders */}
      <Section className="pt-0">
        <SectionHeading eyebrow="Testimonials" title="What early users say" />
        <p className="mt-4 text-xs text-muted">
          Placeholder content — fictional quotes used during development, not real customers.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { q: "It told me which measurements it could not judge from my photo. That is when I started trusting the ones it could.", a: "Placeholder · Léa" },
            { q: "The first tool that separated what is bone from what is habit, without selling me a jaw gadget.", a: "Placeholder · Marco" },
            { q: "I came for a score and stayed for the routine. The evidence tags are the whole product.", a: "Placeholder · Sam" },
          ].map((t) => (
            <Card key={t.a} className="flex h-full flex-col p-7">
              <p className="flex-1 text-[0.9375rem] leading-relaxed">&ldquo;{t.q}&rdquo;</p>
              <p className="mt-6 text-xs text-muted-foreground">{t.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="FAQ" title="Straight answers" />
          <div className="lg:pt-4">
            <Faq items={FAQ_ITEMS} />
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="pt-0">
        <div className="ring-pearl grain relative overflow-hidden rounded-3xl border border-border bg-grid-fade p-12 text-center sm:p-20">
          <Aurora />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-4xl leading-[1.06] tracking-tight sm:text-5xl">
              Your face isn&apos;t a mystery. Neither are your habits.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted">
              Measure it once, understand what moves, and track it properly.
            </p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/scan" size="lg">
                Analyze My Face <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <p className="mt-5 text-xs text-muted">
              Analysis runs on your device. Read the{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                privacy approach
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
