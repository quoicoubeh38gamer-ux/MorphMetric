"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Camera, CheckCircle2, EyeOff, Lock, RefreshCw, ScanFace, Server, Sparkle, Trash2, UserPlus, Upload } from "lucide-react";
import type { Profile, Sex } from "@/lib/ai/types";
import { processImage, validateFile, type ProcessedImage } from "@/lib/image/client";
import { detectFace, type FaceDetectResult } from "@/lib/ai/vision/landmarks";
import { CameraCapture } from "./camera-capture";
import { store } from "@/lib/store";
import { useSession } from "@/lib/auth/client";
import { FREE_SCAN_LIMIT, quotaFrom } from "@/lib/quota";
import { ButtonLink } from "@/components/ui/button";
import { CAPTURE_GUIDELINES, GOAL_OPTIONS, SEX_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Step = "welcome" | "consent" | "profile" | "capture" | "scanning";

const SCAN_MESSAGES = [
  "Checking image quality…",
  "Locating facial landmarks…",
  "Measuring proportions…",
  "Scoring features with confidence…",
  "Compiling evidence-tagged guidance…",
];

function toNum(v: string): number | null {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) ? n : null;
}

export function ScanFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [consentChecked, setConsentChecked] = useState(false);
  const { data: session } = useSession();
  // null = still asking the server whether accounts are configured.
  const [accountsEnabled, setAccountsEnabled] = useState<boolean | null>(null);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    if (store.hasValidConsent()) setStep("profile");
    setScanCount(store.getScanCount());
    // The server tells us whether accounts exist; without this the browser
    // can't distinguish "signed out" from "accounts not set up", and would
    // lock everyone out of scanning.
    fetch("/api/health")
      .then((r) => r.json())
      .then((d: { auth?: boolean }) => setAccountsEnabled(Boolean(d?.auth)))
      .catch(() => setAccountsEnabled(false));
  }, []);

  const quota = quotaFrom(scanCount);
  const needsAccount = accountsEnabled === true && !session?.user;

  // profile
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("unspecified");
  const [height, setHeight] = useState("");
  const [parents, setParents] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  // capture
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [face, setFace] = useState<FaceDetectResult | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [scanMsg, setScanMsg] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const profile: Profile = {
    ageYears: toNum(age),
    sex,
    heightCm: toNum(height),
    parentAvgCm: toNum(parents),
    goals,
  };

  function toggleGoal(v: string) {
    setGoals((g) => (g.includes(v) ? g.filter((x) => x !== v) : [...g, v]));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    setProcessed(null);
    const invalid = validateFile(file);
    if (invalid) {
      setFileError(invalid);
      return;
    }
    setProcessing(true);
    setFace(null);
    try {
      const result = await processImage(file);
      setProcessed(result);
      setProcessing(false);
      // Only run the real vision model on a good-quality photo.
      if (result.quality.ok) {
        setDetecting(true);
        const detection = await detectFace(file);
        setFace(detection);
        setDetecting(false);
      }
    } catch (e) {
      setFileError(e instanceof Error ? e.message : "Could not process that image.");
      setProcessing(false);
      setDetecting(false);
    }
  }

  function reset() {
    setProcessed(null);
    setFace(null);
    setDetecting(false);
    setCameraOpen(false);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyze() {
    if (!processed || !processed.quality.ok) return;
    setError(null);
    setStep("scanning");

    // Cycle the scan messages while we wait (min display time for the feel).
    let i = 0;
    const timer = setInterval(() => {
      i = Math.min(i + 1, SCAN_MESSAGES.length - 1);
      setScanMsg(i);
    }, 620);

    try {
      const [res] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            quality: processed.quality,
            vision:
              face?.detected && face.signals
                ? { mode: "landmarks", signals: face.signals, metrics: face.metrics }
                : { mode: "fingerprint", fingerprint: processed.fingerprint },
          }),
        }),
        new Promise((r) => setTimeout(r, 2600)),
      ]);
      clearInterval(timer);

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Analysis failed. Please try again.");
      }
      const data = (await res.json()) as { report: import("@/lib/ai/types").FaceReport };
      store.setProfile(profile);
      store.setReport(data.report);
      // History is opt-out: when it's off the analysis stays ephemeral.
      if (store.getSettings().saveHistory) {
        store.addReport(data.report);
        store.addSnapshot({
          id: data.report.id,
          createdAt: data.report.createdAt,
          morphScore: data.report.morphScore,
          potentialScore: data.report.potentialScore,
          provider: data.report.provider,
        });
      }
      store.incrementScanCount();
      store.addXp(50);
      router.push("/results");
    } catch (e) {
      clearInterval(timer);
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
      setStep("capture");
    }
  }

  if (accountsEnabled === null) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (needsAccount) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card-base p-7 text-center sm:p-9">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border text-muted">
            <UserPlus className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <h2 className="mt-6 font-display text-3xl tracking-tight">Create a free account</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            An analysis belongs to an account so your history, comparisons and progress are
            yours — and so you can delete all of it in one click. It takes an email and a
            password, nothing else.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/signup">Create my account</ButtonLink>
            <ButtonLink href="/login" variant="secondary">I already have one</ButtonLink>
          </div>
          <p className="mt-6 text-xs text-muted">
            {FREE_SCAN_LIMIT} analyses included, free.
          </p>
        </div>
      </div>
    );
  }

  if (quota.exhausted) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card-base p-7 text-center sm:p-9">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border text-accent">
            <Sparkle className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <h2 className="mt-6 font-display text-3xl tracking-tight">
            You&apos;ve used your free analyses
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            That&apos;s {quota.used} of {quota.limit}. Upgrade for unlimited scans, full history
            and side-by-side comparisons — tracking change over time is where the measurements
            actually become useful.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/#pricing">See the plans</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary">Back to dashboard</ButtonLink>
          </div>
          <p className="mt-6 text-xs text-muted">
            Your existing analyses stay available in History.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepDots step={step} />
      {quota.remaining <= 1 ? (
        <p className="mb-5 text-center text-xs text-muted">
          {quota.remaining} free {quota.remaining === 1 ? "analysis" : "analyses"} remaining
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" {...fade}>
            <div className="card-base p-6 sm:p-9">
              <h2 className="font-display text-3xl tracking-tight">Before we start</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                This takes about a minute. Here is exactly what happens — and what
                does not.
              </p>

              <ol className="mt-7 space-y-4">
                {[
                  { n: "01", t: "You tell us a couple of basics", d: "Age and optional context. Only what changes the analysis." },
                  { n: "02", t: "You take or upload one photo", d: "We check lighting, sharpness and framing before anything else." },
                  { n: "03", t: "The model runs on your device", d: "468 landmarks are extracted locally. The photo never leaves your browser." },
                  { n: "04", t: "You get measurements, not verdicts", d: "Each value compared to a reference range, with its confidence level." },
                ].map((s2) => (
                  <li key={s2.n} className="flex gap-4">
                    <span className="font-mono text-xs text-accent">{s2.n}</span>
                    <span>
                      <span className="block text-sm font-medium">{s2.t}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{s2.d}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep("consent")}>Continue</Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "consent" && (
          <motion.div key="consent" {...fade}>
            <div className="card-base p-6 sm:p-9">
              <h2 className="font-display text-3xl tracking-tight">Your consent</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A face photo is sensitive data. Nothing is processed until you agree,
                and you can withdraw this at any time in Settings.
              </p>

              <div className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
                {[
                  { icon: EyeOff, t: "No image upload", d: "Analysis runs in your browser. We never receive the photo." },
                  { icon: Server, t: "Only numbers leave", d: "Bounded measurements are sent for scoring. Nothing identifying." },
                  { icon: Trash2, t: "Delete any time", d: "One click wipes every analysis stored in this browser." },
                ].map((c) => (
                  <div key={c.t} className="bg-card p-5">
                    <c.icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
                    <p className="mt-3 text-sm font-medium">{c.t}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">{c.d}</p>
                  </div>
                ))}
              </div>

              <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background/50 p-4">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--accent))]"
                />
                <span className="text-sm leading-relaxed">
                  I agree to MorphMetric processing a photo of my face on my device to produce
                  descriptive measurements. I understand this is{" "}
                  <span className="text-foreground">not a medical assessment</span> and not a
                  judgement of appearance.
                </span>
              </label>

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep("welcome")}
                  className="text-sm text-muted hover:text-foreground"
                >
                  ← Back
                </button>
                <Button
                  disabled={!consentChecked}
                  onClick={() => {
                    store.setConsent();
                    setStep("profile");
                  }}
                >
                  Agree &amp; continue
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "profile" && (
          <motion.div key="profile" {...fade}>
            <div className="card-base p-6 sm:p-8">
              <h2 className="font-display text-2xl">A few basics</h2>
              <p className="mt-2 text-sm text-muted">
                We only ask for what genuinely improves your analysis. Everything here is optional.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Age" hint="Tailors framing & growth guidance">
                  <input
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 17"
                    className={inputCls}
                  />
                </Field>
                <Field label="Height (cm)" hint="Optional">
                  <input
                    inputMode="numeric"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className={inputCls}
                  />
                </Field>
                <Field label="Sex" hint="Only used where models differ">
                  <div className="flex gap-2">
                    {SEX_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setSex(o.value)}
                        className={cn(
                          "flex-1 rounded-xl border px-3 py-2 text-xs transition-colors",
                          sex === o.value
                            ? "border-primary/60 bg-primary/10 text-foreground"
                            : "border-border text-muted hover:text-foreground",
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Parents' avg height (cm)" hint="Optional context">
                  <input
                    inputMode="numeric"
                    value={parents}
                    onChange={(e) => setParents(e.target.value)}
                    placeholder="e.g. 172"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium">Your goals</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleGoal(g.value)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                        goals.includes(g.value)
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-border text-muted hover:text-foreground",
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {age !== "" && toNum(age) !== null && (toNum(age) as number) < 18 ? (
                <div className="mt-6 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    Under 18: we&apos;ll de-emphasize the aesthetic score and foreground healthy-development guidance.
                  </span>
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep("consent")}
                  className="text-sm text-muted hover:text-foreground"
                >
                  ← Back
                </button>
                <Button onClick={() => setStep("capture")}>Continue</Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "capture" && (
          <motion.div key="capture" {...fade}>
            <div className="card-base p-6 sm:p-8">
              <h2 className="font-display text-2xl">Face scan</h2>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-card/60 p-3 text-sm text-muted">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  Your photo is processed <span className="text-foreground">on your device</span> in this preview.
                  Only anonymous measurements are sent for scoring — the image itself is not uploaded or stored.
                </span>
              </div>

              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {CAPTURE_GUIDELINES.map((g) => (
                  <li key={g} className="flex items-center gap-2 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {g}
                  </li>
                ))}
              </ul>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />

              {!processed ? (
                cameraOpen ? (
                  <CameraCapture
                    onCapture={(f) => {
                      setCameraOpen(false);
                      onFile(f);
                    }}
                    onCancel={() => setCameraOpen(false)}
                  />
                ) : (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setCameraOpen(true)}
                      className="focus-ring flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center transition-colors hover:border-primary/50"
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                        <Camera className="h-5 w-5" />
                      </span>
                      <span className="text-sm text-foreground">Take a photo</span>
                      <span className="text-xs text-muted">Use your camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={processing}
                      className="focus-ring flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center transition-colors hover:border-primary/50 disabled:opacity-60"
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                        {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                      </span>
                      <span className="text-sm text-foreground">{processing ? "Checking image…" : "Upload a photo"}</span>
                      <span className="text-xs text-muted">JPG, PNG or WebP · up to 8 MB</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="mt-6">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={face?.meshPreviewDataUrl ?? processed.previewDataUrl}
                      alt="Your scan preview"
                      className="h-40 w-40 shrink-0 rounded-2xl border border-border object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Image quality</span>
                        <Badge tone={processed.quality.ok ? "success" : "warning"}>
                          {Math.round(processed.quality.score * 100)}%
                        </Badge>
                      </div>
                      {processed.quality.ok ? (
                        <div className="mt-2">
                          {detecting ? (
                            <span className="inline-flex items-center gap-2 text-sm text-muted">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading AI model &amp; detecting face…
                            </span>
                          ) : face?.detected ? (
                            <Badge tone="accent">
                              <ScanFace className="h-3.5 w-3.5" /> Face detected · {face.pointCount} points mapped
                            </Badge>
                          ) : face ? (
                            <p className="text-sm text-warning">
                              {face.error
                                ? "The face model couldn't load right now — we'll run a basic analysis."
                                : "No face detected — we'll run a basic analysis. For best results, use a clear, front-facing photo."}
                            </p>
                          ) : (
                            <p className="text-sm text-muted">Looks good. You can run the analysis.</p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 rounded-xl border border-warning/30 bg-warning/10 p-3">
                          <p className="flex items-center gap-2 text-sm font-medium text-warning">
                            <AlertTriangle className="h-4 w-4" /> Better image needed
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted">
                            {processed.quality.issues.map((iss) => (
                              <li key={iss}>• {iss}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={reset}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Choose another photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {fileError ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-danger">
                  <AlertTriangle className="h-4 w-4" /> {fileError}
                </p>
              ) : null}
              {error ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-danger">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </p>
              ) : null}

              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={() => setStep("profile")} className="text-sm text-muted hover:text-foreground">
                  ← Back
                </button>
                <Button onClick={analyze} disabled={!processed || !processed.quality.ok || detecting}>
                  <ScanFace className="h-4 w-4" /> Analyze
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "scanning" && (
          <motion.div key="scanning" {...fade}>
            <div className="card-base flex flex-col items-center p-10 text-center sm:p-14">
              <div className="relative grid h-28 w-28 place-items-center rounded-full border border-border">
                <div className="absolute inset-0 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                <ScanFace className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-8 font-display text-2xl">Analyzing</h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={scanMsg}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 text-sm text-muted"
                >
                  {SCAN_MESSAGES[scanMsg]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35 },
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary/60";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint ? <span className="ml-2 text-xs text-muted">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["welcome", "consent", "profile", "capture", "scanning"];
  const labels: Record<Step, string> = {
    welcome: "Start",
    consent: "Consent",
    profile: "Profile",
    capture: "Capture",
    scanning: "Analysis",
  };
  const activeIndex = steps.indexOf(step);
  return (
    <ol className="mb-9 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <li key={s} className="flex items-center gap-1.5">
            <span
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] transition-colors",
                current
                  ? "border-foreground/25 bg-card text-foreground"
                  : done
                    ? "border-border text-muted"
                    : "border-border text-muted-foreground",
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3 w-3 text-accent" />
              ) : (
                <span className="font-mono">{i + 1}</span>
              )}
              {labels[s]}
            </span>
            {i < steps.length - 1 ? <span className="h-px w-3 bg-border" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
