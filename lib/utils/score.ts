/**
 * One definition of how a 0–20 measurement maps to a visual tone, shared by
 * every surface that renders a score. Kept out of components so the bands can
 * never drift between the breakdown, the feature cards and the face map.
 */
export type ScoreTone = "accent" | "primary" | "warning" | "danger";

export function scoreTone(score: number): ScoreTone {
  if (score >= 15.5) return "accent";
  if (score >= 12.5) return "primary";
  if (score >= 9) return "warning";
  return "danger";
}

export const TONE_TEXT: Record<ScoreTone, string> = {
  accent: "text-accent",
  primary: "text-foreground",
  warning: "text-warning",
  danger: "text-danger",
};

export const TONE_FILL: Record<ScoreTone, string> = {
  accent: "hsl(var(--accent))",
  primary: "hsl(var(--tint-blue))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--danger))",
};

/** Label for a measurement band — descriptive, never a verdict on a person. */
export function bandLabel(score: number): string {
  if (score >= 15.5) return "Within reference range";
  if (score >= 12.5) return "Close to reference range";
  if (score >= 9) return "Outside reference range";
  return "Well outside reference range";
}
