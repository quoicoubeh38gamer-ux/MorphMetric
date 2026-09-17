import type { FaceReport, Profile, QualitySummary, RankedFeature, VisionResult } from "./types";
import { computeMorphScore, overallConfidence, scoreFeatures } from "./analysis-engine";
import { buildRoadmap } from "./recommendation-engine";

function shortId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/**
 * Orchestrate the full report: vision signals → features → score → strengths,
 * focus areas and roadmap. This is the single entry point the API route calls.
 */
export function buildFaceReport(
  profile: Profile,
  vision: VisionResult,
  quality: QualitySummary,
): FaceReport {
  const features = scoreFeatures(vision);
  const morphScore = computeMorphScore(features);
  const confidenceOverall = overallConfidence(features, quality);

  const byScoreDesc = [...features].sort((a, b) => b.score - a.score);
  const toRanked = (list: typeof features): RankedFeature[] =>
    list.map((f) => ({ key: f.key, label: f.label, score: f.score }));

  const strengths = toRanked(byScoreDesc.slice(0, 3));
  const focusAreas = toRanked([...byScoreDesc].reverse().slice(0, 3));
  const roadmap = buildRoadmap(features, profile);

  return {
    id: shortId(),
    provider: vision.provider,
    createdAt: new Date().toISOString(),
    morphScore,
    confidenceOverall,
    ageAware: profile.ageYears !== null && profile.ageYears < 18,
    quality,
    features,
    strengths,
    focusAreas,
    roadmap,
  };
}
