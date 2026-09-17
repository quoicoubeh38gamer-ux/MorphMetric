"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Camera, CheckCircle2, Lock, RefreshCw, ScanFace, Upload } from "lucide-react";
import type { Profile, Sex } from "@/lib/ai/types";
import { processImage, validateFile, type ProcessedImage } from "@/lib/image/client";
import { store } from "@/lib/store";
import { CAPTURE_GUIDELINES, GOAL_OPTIONS, SEX_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Step = "profile" | "capture" | "scanning";

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
  const [step, setStep] = useState<Step>("profile");

  // profile
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("unspecified");
  const [height, setHeight] = useState("");
  const [parents, setParents] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  // capture
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
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
    try {
      const result = await processImage(file);
      setProcessed(result);
    } catch (e) {
      setFileError(e instanceof Error ? e.message : "Could not process that image.");
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    setProcessed(null);
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
            fingerprint: processed.fingerprint,
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
      store.addXp(50);
      router.push("/results");
    } catch (e) {
      clearInterval(timer);
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
      setStep("capture");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepDots step={step} />

      <AnimatePresence mode="wait">
        {step === "profile" && (
          <motion.div key="profile" {...fade}>
            <div className="card-base p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold">A few basics</h2>
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

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep("capture")}>Continue</Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "capture" && (
          <motion.div key="capture" {...fade}>
            <div className="card-base p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold">Face scan</h2>

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
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={processing}
                    className="focus-ring flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center transition-colors hover:border-primary/50 disabled:opacity-60"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                      {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                    </span>
                    <span className="text-sm text-foreground">
                      {processing ? "Checking image…" : "Take or upload a photo"}
                    </span>
                    <span className="text-xs text-muted">JPG, PNG or WebP · up to 8 MB</span>
                  </button>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                    <Camera className="h-3.5 w-3.5" /> On mobile you can capture directly from your camera.
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={processed.previewDataUrl}
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
                        <p className="mt-2 text-sm text-muted">
                          Looks good. You can run the analysis.
                        </p>
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
                <Button onClick={analyze} disabled={!processed || !processed.quality.ok}>
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
              <h2 className="mt-8 font-display text-2xl font-semibold">Analyzing</h2>
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
  const steps: Step[] = ["profile", "capture", "scanning"];
  const labels: Record<Step, string> = { profile: "Profile", capture: "Scan", scanning: "Analysis" };
  const activeIndex = steps.indexOf(step);
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
              i <= activeIndex ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted",
            )}
          >
            <span className="font-mono">{i + 1}</span> {labels[s]}
          </div>
          {i < steps.length - 1 ? <span className="h-px w-4 bg-border" /> : null}
        </div>
      ))}
    </div>
  );
}
