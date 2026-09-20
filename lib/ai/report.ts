import type {
  Comparison,
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
// (styling, skin, sleep, framing). Structure is never assumed to change.
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

// NaN-safe: Math.max(0, NaN) is NaN, so a plain clamp forwards a bad value
// instead of stopping it. A single non-finite landmark would otherwise reach
// the UI as "NaN" and serialise to null, failing the server's schema.
const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);
const near = (v: number, ideal: number, tol: number) => clamp01(1 - Math.abs(v - ideal) / tol);
const band = (v: number, lo: number, hi: number, tol: number) =>
  v >= lo && v <= hi ? 1 : clamp01(1 - (v < lo ? lo - v : v - hi) / tol);

/**
 * "You vs balanced" comparison rows + an overall harmony (0..100). "Balanced"
 * is a neutral reference, explicitly not a claim of objective beauty.
 */
function buildComparisons(m?: FaceMetricsRaw): { comparisons: Comparison[]; harmony: number } {
  if (!m) return { comparisons: [], harmony: 0 };
  const pc = (n: number) => `${Math.round(n * 100)}%`;
  const thirdsDev = Math.max(
    Math.abs(m.thirdsUpper - 1 / 3),
    Math.abs(m.thirdsMid - 1 / 3),
    Math.abs(m.thirdsLower - 1 / 3),
  );
  const rows: Comparison[] = [
    { key: "thirds", label: "Facial thirds", you: `${pc(m.thirdsUpper)}/${pc(m.thirdsMid)}/${pc(m.thirdsLower)}`, ideal: "33/33/33", proximity: clamp01(1 - thirdsDev / 0.12) },
    { key: "fwhr", label: "Width-to-height", you: m.fwhr.toFixed(2), ideal: "1.8–2.0", proximity: band(m.fwhr, 1.8, 2.0, 0.5) },
    { key: "canthal", label: "Canthal tilt", you: `${m.canthalTiltDeg > 0 ? "+" : ""}${m.canthalTiltDeg.toFixed(1)}°`, ideal: "+3–8°", proximity: band(m.canthalTiltDeg, 3, 8, 6) },
    { key: "interocular", label: "Eye spacing", you: `${m.interocularRatio.toFixed(2)}×`, ideal: "~1.0×", proximity: near(m.interocularRatio, 1.0, 0.35) },
    { key: "jaw", label: "Jaw width", you: pc(m.jawWidthRatio), ideal: "~75%", proximity: near(m.jawWidthRatio, 0.75, 0.18) },
    { key: "nose", label: "Nose width", you: pc(m.noseWidthRatio), ideal: "~25%", proximity: near(m.noseWidthRatio, 0.25, 0.12) },
    { key: "mouth", label: "Mouth width", you: pc(m.mouthWidthRatio), ideal: "~46%", proximity: near(m.mouthWidthRatio, 0.46, 0.14) },
    { key: "symmetry", label: "Symmetry", you: `${m.symmetryDevPct.toFixed(1)}%`, ideal: "<3%", proximity: clamp01(1 - m.symmetryDevPct / 6) },
  ];
  const harmony = Math.round((rows.reduce((s, r) => s + r.proximity, 0) / rows.length) * 100);
  return { comparisons: rows, harmony };
}

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
  const features = scoreFeatures(vision, metricsRaw);
  const morphScore = computeMorphScore(features);
  const confidenceOverall = overallConfidence(features, quality);

  const headroom = features.reduce(
    (sum, f) => sum + Math.max(0, CONTROLLABLE_CEILING[f.key] - f.score),
    0,
  );
  const potentialScore = Math.round(clamp(morphScore + Math.min(4.5, headroom * 0.22), morphScore, 20) * 10) / 10;

  const { comparisons, harmony } = buildComparisons(metricsRaw);

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
      "Reachable by improving what you control (styling, skin, sleep, framing). Bone structure is not included.",
    confidenceOverall,
    ageAware: profile.ageYears !== null && profile.ageYears < 18,
    quality,
    features,
    metrics: formatMetrics(metricsRaw),
    metricsRaw: vision.landmarksDetected ? metricsRaw : undefined,
    harmonyScore: harmony,
    comparisons,
    strengths: toRanked(byScoreDesc.slice(0, 3)),
    focusAreas: toRanked([...byScoreDesc].reverse().slice(0, 3)),
    roadmap: buildRoadmap(features, profile),
  };
}
