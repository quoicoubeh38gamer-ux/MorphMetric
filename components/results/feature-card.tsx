import type { FeatureScore } from "@/lib/ai/types";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { score1 } from "@/lib/utils/format";

export function FeatureCard({ feature }: { feature: FeatureScore }) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{feature.label}</h3>
          <span className="text-xs uppercase tracking-wider text-muted">{feature.category}</span>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl tabular">
            {score1(feature.score)}
            <span className="text-sm text-muted"> / 20</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Progress value={feature.score} />
      </div>
      <div className="mt-3">
        <ConfidenceBadge confidence={feature.confidence} />
      </div>

      <p className="mt-4 text-sm text-muted">{feature.summary}</p>

      <div className="mt-4 rounded-xl border border-border bg-background/40 p-3">
        <p className="text-xs font-medium text-foreground">Why it matters</p>
        <p className="mt-1 text-xs text-muted">{feature.whyItMatters}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-accent">You can influence</p>
          <ul className="mt-1.5 space-y-1">
            {feature.canInfluence.map((x) => (
              <li key={x} className="text-xs text-muted">+ {x}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">You can&apos;t reliably change</p>
          <ul className="mt-1.5 space-y-1">
            {feature.cannotReliablyChange.map((x) => (
              <li key={x} className="text-xs text-muted">− {x}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
