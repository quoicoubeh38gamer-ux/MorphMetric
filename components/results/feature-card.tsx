import { CheckCircle2, Lock, Ban } from "lucide-react";
import type { FeatureScore } from "@/lib/ai/types";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { EvidenceTag } from "@/components/ui/evidence-tag";
import { score1 } from "@/lib/utils/format";

function scoreTone(score: number): "accent" | "primary" | "warning" | "danger" {
  if (score >= 15.5) return "accent";
  if (score >= 12.5) return "primary";
  if (score >= 9) return "warning";
  return "danger";
}

export function FeatureCard({ feature }: { feature: FeatureScore }) {
  const tone = scoreTone(feature.score);
  const toneText =
    tone === "accent" ? "text-accent" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : "text-primary";

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{feature.label}</h3>
          <span className="text-xs uppercase tracking-wider text-muted">{feature.category}</span>
        </div>
        <div className="text-right">
          <div className={`font-mono text-xl tabular ${toneText}`}>
            {score1(feature.score)}
            <span className="text-sm text-muted"> / 20</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Progress value={feature.score} tone={tone === "accent" ? "accent" : "primary"} />
      </div>
      <div className="mt-3">
        <ConfidenceBadge confidence={feature.confidence} />
      </div>

      <p className="mt-4 text-sm text-muted">{feature.summary}</p>

      <div className="mt-4 rounded-xl border border-border bg-background/40 p-3">
        <p className="text-xs font-medium text-foreground">Why it matters</p>
        <p className="mt-1 text-xs text-muted">{feature.whyItMatters}</p>
      </div>

      {/* What genuinely helps */}
      <div className="mt-4">
        <p className="text-xs font-medium text-accent">What genuinely helps</p>
        <ul className="mt-2 space-y-2.5">
          {feature.improve.map((imp) => (
            <li key={imp.text} className="text-xs">
              <span className="flex items-start gap-2 text-muted">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <span>{imp.text}</span>
              </span>
              <span className="ml-5 mt-1 inline-block">
                <EvidenceTag tier={imp.tier} sourceKey={imp.sourceKey} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* What's fixed */}
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> What&apos;s structural (can&apos;t change from a photo)
        </p>
        <ul className="mt-1.5 space-y-1">
          {feature.fixed.map((x) => (
            <li key={x} className="text-xs text-muted">− {x}</li>
          ))}
        </ul>
      </div>

      {/* Myths to skip */}
      {feature.myths.length > 0 ? (
        <div className="mt-4 rounded-xl border border-danger/25 bg-danger/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-danger">
            <Ban className="h-3.5 w-3.5" /> Skip the myths
          </p>
          <ul className="mt-1.5 space-y-1">
            {feature.myths.map((m) => (
              <li key={m} className="text-xs text-muted">{m}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
