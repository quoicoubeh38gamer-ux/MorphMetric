import type { Confidence, FeatureKey } from "./types";

export interface FeatureMeta {
  label: string;
  category: string;
  weight: number; // contribution to the overall morph score
  baseConfidence: Confidence; // how reliably a 2D photo estimates this
  center: number; // score center (0..20) — bands stay in a healthy, non-harsh range
  spread: number; // score spread around the center
  whyItMatters: string;
  canInfluence: string[];
  cannotReliablyChange: string[];
}

/**
 * Per-feature metadata + copy.
 *
 * Copy is deliberately neutral and improvement-oriented. Confidence baselines
 * reflect that some features (jaw, nose depth, cheekbone) cannot be measured
 * reliably from a single 2D image — the UI surfaces that uncertainty.
 */
export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  symmetry: {
    label: "Facial symmetry",
    category: "Structure",
    weight: 1.2,
    baseConfidence: "high",
    center: 15.4,
    spread: 4.2,
    whyItMatters:
      "Left–right balance is one of the most visible aspects of a face in photos.",
    canInfluence: ["photo angle", "head tilt", "lighting", "grooming"],
    cannotReliablyChange: ["underlying bone structure"],
  },
  proportions: {
    label: "Facial proportions",
    category: "Structure",
    weight: 1.1,
    baseConfidence: "medium",
    center: 14.6,
    spread: 4.0,
    whyItMatters:
      "The balance of the facial thirds and fifths shapes overall harmony.",
    canInfluence: ["hairstyle & framing", "grooming", "photo angle"],
    cannotReliablyChange: ["skull proportions"],
  },
  eyes: {
    label: "Eye area",
    category: "Features",
    weight: 1.0,
    baseConfidence: "high",
    center: 15.2,
    spread: 3.8,
    whyItMatters: "The eye area draws attention first and reads clearly in 2D.",
    canInfluence: ["sleep quality", "hydration", "brow grooming"],
    cannotReliablyChange: ["eye socket shape"],
  },
  brows: {
    label: "Eyebrows",
    category: "Features",
    weight: 0.8,
    baseConfidence: "high",
    center: 14.0,
    spread: 4.4,
    whyItMatters: "Brow shape frames the eyes and is highly controllable.",
    canInfluence: ["shaping", "grooming", "trimming"],
    cannotReliablyChange: ["natural hair density"],
  },
  nose: {
    label: "Nose",
    category: "Features",
    weight: 0.9,
    baseConfidence: "medium",
    center: 14.7,
    spread: 3.6,
    whyItMatters: "Nose proportions read differently depending on angle.",
    canInfluence: ["photo angle", "lighting"],
    cannotReliablyChange: ["nasal bone & cartilage structure"],
  },
  lips: {
    label: "Lips",
    category: "Features",
    weight: 0.8,
    baseConfidence: "high",
    center: 14.4,
    spread: 3.8,
    whyItMatters: "Lip balance contributes to the lower-third harmony.",
    canInfluence: ["hydration", "lip care"],
    cannotReliablyChange: ["natural lip volume"],
  },
  jaw: {
    label: "Jaw / lower face",
    category: "Structure",
    weight: 1.0,
    baseConfidence: "low",
    center: 13.9,
    spread: 3.4,
    whyItMatters:
      "Lower-face presentation affects perceived structure — but 2D photos estimate it poorly.",
    canInfluence: ["posture", "photo angle", "body-fat over time", "grooming"],
    cannotReliablyChange: ["jaw bone structure"],
  },
  skin: {
    label: "Skin",
    category: "Surface",
    weight: 1.0,
    baseConfidence: "high",
    center: 15.6,
    spread: 4.0,
    whyItMatters: "Skin evenness is one of the most controllable visible factors.",
    canInfluence: ["basic skincare routine", "sun protection", "sleep", "hydration"],
    cannotReliablyChange: ["genetic skin type"],
  },
};

/** Neutral, non-shaming summary keyed to the score band. */
export function summaryFor(key: FeatureKey, score: number): string {
  const meta = FEATURE_META[key];
  const noun = meta.label.toLowerCase();
  if (score >= 15.5) {
    return `Your ${noun} appears well balanced in this image and reads as a current strength.`;
  }
  if (score >= 13.5) {
    return `Your ${noun} appears relatively balanced in this image.`;
  }
  return `Your ${noun} currently contributes a bit less to the overall balance in this image — an area you can work on.`;
}
