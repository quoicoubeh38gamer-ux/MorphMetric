import { FEATURE_KEYS, type Confidence, type FeatureKey, type QualitySummary, type VisionResult } from "./types";

/**
 * Bridges real, client-computed landmark signals into the server scoring
 * pipeline. The client (MediaPipe FaceLandmarker) runs the vision model in the
 * browser and extracts per-feature "balance" signals from real geometry; the
 * server stays authoritative for the score, breakdown, recommendations and XP.
 *
 * Confidence reflects how reliably a single 2D image estimates each feature:
 * geometry that is genuinely 2D-measurable (symmetry, eye region, proportions,
 * lips) is High; depth-dependent structure (nose projection, jaw) is Medium;
 * skin depends on lighting so it stays Medium.
 */
const LANDMARK_CONFIDENCE: Record<FeatureKey, Confidence> = {
  symmetry: "high",
  proportions: "high",
  eyes: "high",
  brows: "high",
  nose: "medium",
  lips: "high",
  jaw: "medium",
  skin: "medium",
};

function downgrade(c: Confidence): Confidence {
  if (c === "high") return "medium";
  if (c === "medium") return "low";
  return "low";
}

export function visionFromLandmarkSignals(
  signals: Record<FeatureKey, number>,
  quality: QualitySummary,
): VisionResult {
  const confidence = {} as Record<FeatureKey, Confidence>;
  for (const key of FEATURE_KEYS) {
    const base = LANDMARK_CONFIDENCE[key];
    confidence[key] = quality.score < 0.62 ? downgrade(base) : base;
  }
  return {
    provider: "mediapipe@1",
    landmarksDetected: true,
    signals,
    confidence,
  };
}
