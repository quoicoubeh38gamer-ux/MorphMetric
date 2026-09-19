import type { Metadata } from "next";
import { Lock, ShieldCheck, Timer, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DeleteDataButton } from "@/components/privacy/delete-data-button";

export const metadata: Metadata = {
  title: "Privacy & data",
  description: "How MorphMetric handles your photo and data.",
};

const POINTS = [
  {
    icon: Lock,
    title: "On-device processing (MVP)",
    body: "In this preview, your photo is read and re-encoded in your browser. EXIF/GPS metadata is stripped and only anonymous measurements — never the raw image — are sent for scoring.",
  },
  {
    icon: EyeOff,
    title: "No silent storage",
    body: "The MVP does not upload or store your photo on a server. Your latest report and profile live in your own browser and are yours to clear at any time.",
  },
  {
    icon: Timer,
    title: "Minimal retention (production)",
    body: "When private-storage upload is enabled, images are kept only for a short, configurable window, accessed via short-lived signed URLs, then deleted.",
  },
  {
    icon: ShieldCheck,
    title: "Security by default",
    body: "Server-side validation, MIME + size checks, rate limiting and hardening headers. API keys are never exposed to the frontend.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Privacy &amp; data</h1>
      <p className="mt-3 text-muted">
        Face photos are sensitive data, and MorphMetric treats them that way.
        Here&apos;s exactly how your information is handled.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {POINTS.map((p) => (
          <Card key={p.title}>
            <p.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-medium">{p.title}</h2>
            <p className="mt-1.5 text-sm text-muted">{p.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-lg">Your control</h2>
        <p className="mt-2 text-sm text-muted">
          You can delete everything MorphMetric has stored in this browser at any
          time. This removes your saved report, profile, check-ins and progress.
        </p>
        <div className="mt-5">
          <DeleteDataButton />
        </div>
      </Card>

      <p className="mt-8 text-xs text-muted">
        MorphMetric is a demo product. Guidance is educational and not medical
        advice. The morphology score is an internal metric and not a measure of a
        person&apos;s worth.
      </p>
    </div>
  );
}
