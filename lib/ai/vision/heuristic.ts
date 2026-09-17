import { FEATURE_KEYS, type Confidence, type FeatureKey, type VisionResult } from "../types";
import { FEATURE_META } from "../features";
import type { VisionProvider, VisionProviderInput } from "./provider";

/**
 * Deterministic heuristic vision provider (MVP / demo).
 *
 * IMPORTANT: this does NOT perform real facial landmark detection. It expands a
 * client-side image fingerprint into a stable set of per-feature signals so the
 * end-to-end product loop is fully functional and reproducible. Different images
 * produce different (but deterministic) results. Swap it for a real provider via
 * VISION_PROVIDER without touching the rest of the app.
 */

// mulberry32 — small deterministic PRNG.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(fingerprint: number[], salt: number): number {
  let h = 2166136261 ^ salt;
  for (const v of fingerprint) {
    const q = Math.round(v * 1000);
    h = Math.imul(h ^ q, 16777619);
  }
  return h >>> 0;
}

function downgrade(c: Confidence): Confidence {
  if (c === "high") return "medium";
  if (c === "medium") return "low";
  return "low";
}

export const heuristicVisionProvider: VisionProvider = {
  id: "heuristic@1",
  analyze({ fingerprint, quality }: VisionProviderInput): VisionResult {
    const safeFp = fingerprint.length > 0 ? fingerprint : [0.5];
    const signals = {} as Record<FeatureKey, number>;
    const confidence = {} as Record<FeatureKey, Confidence>;

    FEATURE_KEYS.forEach((key, index) => {
      const rng = mulberry32(seedFrom(safeFp, index * 2654435761));
      // Combine a deterministic random base with a local slice of the image
      // fingerprint so results vary per-image but stay reproducible.
      const base = rng();
      const slice = safeFp[(index * 3) % safeFp.length] ?? 0.5;
      const local = safeFp[(index * 5 + 1) % safeFp.length] ?? slice;
      const raw = 0.5 * base + 0.3 * slice + 0.2 * local;
      signals[key] = Math.min(1, Math.max(0, raw));

      // Confidence: baseline per feature, downgraded when the photo is weak.
      const meta = FEATURE_META[key];
      confidence[key] = quality.score < 0.62 ? downgrade(meta.baseConfidence) : meta.baseConfidence;
    });

    return {
      provider: this.id,
      landmarksDetected: false, // heuristic provider: no real landmarks
      signals,
      confidence,
    };
  },
};
