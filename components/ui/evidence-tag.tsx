import type { EvidenceTier } from "@/lib/ai/types";
import { getEvidence } from "@/lib/ai/evidence";
import { Badge } from "./badge";

const map: Record<EvidenceTier, { tone: "accent" | "warning" | "danger"; label: string }> = {
  "evidence-backed": { tone: "accent", label: "Evidence-backed" },
  plausible: { tone: "warning", label: "Plausible / limited evidence" },
  unsupported: { tone: "danger", label: "Unsupported" },
};

/** Evidence tier for a recommendation, with an optional link to the source. */
export function EvidenceTag({ tier, sourceKey }: { tier: EvidenceTier; sourceKey?: string }) {
  const { tone, label } = map[tier];
  const source = getEvidence(sourceKey);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={tone}>{label}</Badge>
      {source ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-foreground"
        >
          Source: {source.org} ↗
        </a>
      ) : null}
    </span>
  );
}
