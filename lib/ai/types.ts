// Shared domain types for the MorphMetric AI layer.
// These mirror the Prisma schema so persistence stays aligned when it lands.

export type Confidence = "high" | "medium" | "low";
export type Controllability = "controllable" | "partial" | "fixed";
export type EvidenceTier = "evidence-backed" | "plausible" | "unsupported";
export type Sex = "male" | "female" | "unspecified";

/** The eight scored features (mirrors the product's score breakdown). */
export const FEATURE_KEYS = [
  "symmetry",
  "proportions",
  "eyes",
  "brows",
  "nose",
  "lips",
  "jaw",
  "skin",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

export interface Profile {
  ageYears: number | null;
  sex: Sex;
  heightCm: number | null;
  parentAvgCm: number | null;
  goals: string[];
}

/** Real, client-measured image quality (no landmark detection here). */
export interface QualitySummary {
  ok: boolean;
  score: number; // 0..1
  issues: string[];
}

/** Output of a VisionProvider: a normalized signal per feature. */
export interface VisionResult {
  provider: string; // e.g. "heuristic@1"
  landmarksDetected: boolean;
  signals: Record<FeatureKey, number>; // 0..1
  confidence: Record<FeatureKey, Confidence>;
}

export interface FeatureImprovement {
  text: string;
  tier: EvidenceTier;
  sourceKey?: string;
}

/** A precise, anatomy-grounded sub-score inside a facial feature. */
export interface SubMetric {
  key: string;
  label: string;
  value: string; // formatted measured value, or "—"
  ideal: string; // neutral reference range
  score: number; // 0..20, precise
  note: string; // what it measures, in plain anatomical terms
  measured: boolean; // true = from real 468-point geometry; false = estimated
}

export interface FeatureScore {
  key: FeatureKey;
  label: string;
  category: string;
  score: number; // 0..20
  confidence: Confidence;
  summary: string;
  whyItMatters: string;
  anatomy: string; // the anatomy behind the feature
  detail: string; // a deeper, honest explanation
  subMetrics: SubMetric[]; // precise per-dimension breakdown
  improve: FeatureImprovement[]; // what genuinely helps, evidence-tagged
  fixed: string[]; // what a photo/app can't change (structure)
  myths: string[]; // popular but unsupported claims — honestly flagged
}

export interface Recommendation {
  id: string;
  order: number;
  domain: string; // "Hair", "Skin", "Presentation", ...
  title: string;
  body: string;
  controllability: Controllability;
  tier: EvidenceTier;
  sourceKey?: string;
}

export interface RankedFeature {
  key: FeatureKey;
  label: string;
  score: number;
}

/** Real geometric sub-metrics from the 468-point mesh (formatted for display). */
export interface FaceMetric {
  key: string;
  label: string;
  value: string;
  hint?: string;
}

/** A "you vs balanced" comparison row for the harmony section. */
export interface Comparison {
  key: string;
  label: string;
  you: string;
  ideal: string;
  proximity: number; // 0..1 (1 = on the balanced target)
}

/** Raw numeric metrics the client sends from the landmark geometry. */
export interface FaceMetricsRaw {
  thirdsUpper: number;
  thirdsMid: number;
  thirdsLower: number;
  fwhr: number;
  interocularRatio: number;
  canthalTiltDeg: number;
  jawWidthRatio: number;
  noseWidthRatio: number;
  mouthWidthRatio: number;
  symmetryDevPct: number;
}

export interface FaceReport {
  id: string;
  provider: string;
  createdAt: string; // ISO
  morphScore: number; // 0..20
  potentialScore: number; // reachable via controllable factors only
  potentialNote: string;
  confidenceOverall: Confidence;
  ageAware: boolean; // true when age < 18 → de-emphasize the score
  quality: QualitySummary;
  features: FeatureScore[];
  metrics: FaceMetric[]; // detailed measurements (empty on heuristic fallback)
  metricsRaw?: FaceMetricsRaw; // the underlying numbers, when landmarks were used
  harmonyScore: number; // 0..100 closeness to balanced reference (0 when no metrics)
  comparisons: Comparison[]; // you vs balanced target (empty on heuristic fallback)
  strengths: RankedFeature[]; // top 3
  focusAreas: RankedFeature[]; // bottom 3 (controllable-leaning)
  roadmap: Recommendation[]; // max 3
}

// --- Growth ----------------------------------------------------------------

export type GrowthTrend = "steady" | "accelerating" | "plateauing" | "unknown";

export interface GrowthInput {
  ageYears: number | null;
  sleepHours: number | null;
  activityMinutes: number | null;
  nutritionQuality: number | null; // 0..10 self-report
  consistency: number | null; // 0..10
}

export interface GrowthSupport {
  sleepScore: number; // 0..10
  nutritionScore: number;
  activityScore: number;
  consistencyScore: number;
  overall: number; // 0..10
  trend: GrowthTrend;
  notes: { text: string; tier: EvidenceTier; sourceKey?: string }[];
}

export interface Meal {
  name: string;
  items: string[];
}

export interface NutritionPriority {
  nutrient: string;
  why: string;
  tier: EvidenceTier;
  sourceKey?: string;
}

export interface NutritionPlan {
  headline: string;
  disclaimer: string;
  minorMode: boolean;
  priorities: NutritionPriority[];
  meals: Meal[];
}

export interface EvidenceSource {
  key: string;
  org: string;
  title: string;
  url: string;
  tier: EvidenceTier;
}
