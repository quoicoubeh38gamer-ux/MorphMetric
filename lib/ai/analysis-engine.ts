import {
  FEATURE_KEYS,
  type Confidence,
  type FaceMetricsRaw,
  type FeatureScore,
  type QualitySummary,
  type VisionResult,
} from "./types";
import { FEATURE_META, buildSubMetrics, summaryFor } from "./features";
import { clamp } from "../utils/format";

/** Map per-feature signals (0..1) into scored, annotated features (0..20). */
export function scoreFeatures(vision: VisionResult, metricsRaw?: FaceMetricsRaw): FeatureScore[] {
  const real = vision.landmarksDetected;
  return FEATURE_KEYS.map((key) => {
    const meta = FEATURE_META[key];
    const signal = vision.signals[key];
    // Real landmark geometry drives the FULL honest range (a genuinely
    // off feature lands well below 10). The heuristic fallback (no real face)
    // stays moderate because there is no real signal to be harsh about.
    const raw = real ? 3 + signal * 17 : meta.center + (signal - 0.5) * meta.spread;
    const score = Math.round(clamp(raw, 2, 20) * 10) / 10;
    return {
      key,
      label: meta.label,
      category: meta.category,
      score,
      confidence: vision.confidence[key],
      summary: summaryFor(key, score),
      whyItMatters: meta.whyItMatters,
      anatomy: meta.anatomy,
      detail: meta.detail,
      subMetrics: buildSubMetrics(key, score, real ? metricsRaw : undefined),
      improve: meta.improve,
      fixed: meta.fixed,
      myths: meta.myths,
    };
  });
}

/** Weighted mean of the feature scores → the internal morphology score (0..20). */
export function computeMorphScore(features: FeatureScore[]): number {
  let total = 0;
  let weightSum = 0;
  for (const f of features) {
    const w = FEATURE_META[f.key].weight;
    total += f.score * w;
    weightSum += w;
  }
  const score = weightSum > 0 ? total / weightSum : 0;
  return Math.round(score * 10) / 10;
}

/** Overall confidence blends per-feature confidence with image quality. */
export function overallConfidence(features: FeatureScore[], quality: QualitySummary): Confidence {
  const weight: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };
  let sum = 0;
  for (const f of features) sum += weight[f.confidence];
  let avg = features.length > 0 ? sum / features.length : 2;
  if (quality.score < 0.62) avg -= 0.5;
  if (avg >= 2.5) return "high";
  if (avg >= 1.6) return "medium";
  return "low";
}
