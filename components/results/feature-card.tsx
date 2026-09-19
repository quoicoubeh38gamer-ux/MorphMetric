import { CheckCircle2, Lock, Ban, Ruler, Microscope } from "lucide-react";
import type { FeatureScore, SubMetric } from "@/lib/ai/types";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { EvidenceTag } from "@/components/ui/evidence-tag";
import { score1 } from "@/lib/utils/format";
import { scoreTone, TONE_TEXT, type ScoreTone } from "@/lib/utils/score";

const toneClass = (tone: ScoreTone): string => TONE_TEXT[tone];

function SubMetricRow({ sub }: { sub: SubMetric }) {
  const tone = scoreTone(sub.score);
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{sub.label}</span>
        {sub.measured ? (
          <span className={`font-mono text-xs tabular ${toneClass(tone)}`}>
            {score1(sub.score)}
            <span className="text-muted"> / 20</span>
          </span>
        ) : (
          <Badge tone="default" className="text-[10px]">Estimated</Badge>
        )}
      </div>

      {sub.measured ? (
        <div className="mt-2">
          <Progress value={sub.score} tone={tone === "accent" ? "accent" : "primary"} />
        </div>
      ) : null}

      {sub.measured ? (
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted">
          <span>
            you <span className="font-mono text-foreground">{sub.value}</span>
          </span>
          <span>
            reference <span className="font-mono">{sub.ideal}</span>
          </span>
        </div>
      ) : null}
      <p className="mt-1.5 text-[11px] leading-snug text-muted">{sub.note}</p>
    </div>
  );
}

export function FeatureCard({ feature }: { feature: FeatureScore }) {
  const tone = scoreTone(feature.score);

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">{feature.label}</h3>
          <span className="text-xs uppercase tracking-wider text-muted">{feature.category}</span>
        </div>
        <div className="text-right">
          <div className={`font-mono text-2xl tabular ${toneClass(tone)}`}>
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

      {/* Precise sub-scores */}
      {feature.subMetrics && feature.subMetrics.length > 0 ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Ruler className="h-3.5 w-3.5" /> Measured characteristics
          </p>
          <div className="mt-2 space-y-2">
            {feature.subMetrics.map((s) => (
              <SubMetricRow key={s.key} sub={s} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Anatomy */}
      {feature.anatomy ? (
        <div className="mt-4 rounded-xl border border-border bg-background/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Microscope className="h-3.5 w-3.5 text-accent" /> The anatomy
          </p>
          <p className="mt-1 text-xs text-muted">{feature.anatomy}</p>
        </div>
      ) : null}

      {/* Why it matters + deeper detail */}
      <div className="mt-4 rounded-xl border border-border bg-background/40 p-3">
        <p className="text-xs font-medium text-foreground">Why it matters</p>
        <p className="mt-1 text-xs text-muted">{feature.whyItMatters}</p>
        {feature.detail ? <p className="mt-2 text-xs text-muted">{feature.detail}</p> : null}
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
