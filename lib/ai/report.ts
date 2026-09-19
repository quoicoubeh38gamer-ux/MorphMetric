import type {
  FaceMetric,
  FaceMetricsRaw,
  FaceReport,
  FeatureKey,
  Profile,
  QualitySummary,
  RankedFeature,
  VisionResult,
} from "./types";
import { computeMorphScore, overallConfidence, scoreFeatures } from "./analysis-engine";
import { buildRoadmap } from "./recommendation-engine";
import { clamp } from "../utils/format";

function shortId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// Realistic ceilings reachable by improving CONTROLLABLE presentation factors
// (grooming, skin, sleep, framing). Structure is never assumed to change.
const CONTROLLABLE_CEILING: Record<FeatureKey, number> = {
  skin: 18,
  brows: 17,
  eyes: 16.5,
  lips: 16,
  proportions: 16,
  symmetry: 15.5,
  nose: 15,
  jaw: 14.5,
};

function formatMetrics(m?: FaceMetricsRaw): FaceMetric[] {
  if (!m) return [];
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return [
    { key: "thirds", label: "Facial thirds", value: `${pct(m.thirdsUpper)} · ${pct(m.thirdsMid)} · ${pct(m.thirdsLower)}`, hint: "Upper · middle · lower — balanced ≈ 33/33/33" },
    { key: "fwhr", label: "Width-to-height (fWHR)", value: m.fwhr.toFixed(2), hint: "Face width ÷ upper-face height" },
    { key: "canthal", label: "Canthal tilt", value: `${m.canthalTiltDeg > 0 ? "+" : ""}${m.canthalTiltDeg.toFixed(1)}°`, hint: "Outer-eye tilt (positive = upward)" },
    { key: "interocular", label: "Eye spacing", value: `${m.interocularRatio.toFixed(2)}×`, hint: "Inter-eye distance vs eye width (≈1.0)" },
    { key: "jaw", label: "Jaw width", value: pct(m.jawWidthRatio), hint: "Gonial width vs face width" },
    { key: "nose", label: "Nose width", value: pct(m.noseWidthRatio), hint: "Alar width vs face width (≈25%)" },
    { key: "mouth", label: "Mouth width", value: pct(m.mouthWidthRatio), hint: "Vs face width (≈46%)" },
    { key: "symdev", label: "Symmetry deviation", value: `${m.symmetryDevPct.toFixed(1)}%`, hint: "Lower = more symmetric" },
  ];
}

/**
 * Orchestrate the full report: vision signals → features → score, plus detailed
 * metrics, a controllable-only "presentation potential", strengths, focus areas
 * and roadmap. Single entry point for the API route.
 */
export function buildFaceReport(
  profile: Profile,
  vision: VisionResult,
  quality: QualitySummary,
  metricsRaw?: FaceMetricsRaw,
): FaceReport {
  const features = scoreFeatures(vision);
  const morphScore = computeMorphScore(features);
  const confidenceOverall = overallConfidence(features, quality);

  const headroom = features.reduce(
    (sum, f) => sum + Math.max(0, CONTROLLABLE_CEILING[f.key] - f.score),
    0,
  );
  const potentialScore = Math.round(clamp(morphScore + Math.min(4.5, headroom * 0.22), morphScore, 20) * 10) / 10;

  const byScoreDesc = [...features].sort((a, b) => b.score - a.score);
  const toRanked = (list: typeof features): RankedFeature[] =>
    list.map((f) => ({ key: f.key, label: f.label, score: f.score }));

  return {
    id: shortId(),
    provider: vision.provider,
    createdAt: new Date().toISOString(),
    morphScore,
    potentialScore,
    potentialNote:
      "Reachable by improving what you control (grooming, skin, sleep, framing). Bone structure is not included.",
    confidenceOverall,
    ageAware: profile.ageYears !== null && profile.ageYears < 18,
    quality,
    features,
    metrics: formatMetrics(metricsRaw),
    strengths: toRanked(byScoreDesc.slice(0, 3)),
    focusAreas: toRanked([...byScoreDesc].reverse().slice(0, 3)),
    roadmap: buildRoadmap(features, profile),
  };
}
