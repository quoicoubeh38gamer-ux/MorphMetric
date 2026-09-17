import type { Confidence } from "@/lib/ai/types";
import { Badge } from "./badge";

const map: Record<Confidence, { tone: "success" | "warning" | "danger"; label: string }> = {
  high: { tone: "success", label: "High" },
  medium: { tone: "warning", label: "Medium" },
  low: { tone: "danger", label: "Low" },
};

/** Confidence in a feature estimate — makes 2D-photo uncertainty visible. */
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { tone, label } = map[confidence];
  return (
    <Badge tone={tone}>
      <span className="opacity-70">Confidence</span> {label}
    </Badge>
  );
}
