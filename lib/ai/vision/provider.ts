import type { QualitySummary, VisionResult } from "../types";

/**
 * A VisionProvider turns image-derived input into per-feature signals (0..1).
 *
 * The MVP provider consumes a compact, privacy-preserving fingerprint computed
 * on the client (the raw photo never has to leave the browser in the DB-less
 * MVP). A production provider — MediaPipe FaceMesh in the browser, or a cloud
 * vision API — implements the same interface and returns the same shape, so
 * nothing downstream (analysis, scoring, recommendations) changes.
 */
export interface VisionProviderInput {
  /** Normalized image sample values (0..1) — a stable, low-dimensional digest. */
  fingerprint: number[];
  quality: QualitySummary;
}

export interface VisionProvider {
  readonly id: string;
  analyze(input: VisionProviderInput): VisionResult;
}
