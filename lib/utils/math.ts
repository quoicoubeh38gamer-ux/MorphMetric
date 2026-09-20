/**
 * Numeric guards shared by the scoring pipeline.
 *
 * These are finite-checked on purpose. `Math.max(0, NaN)` is `NaN`, so a plain
 * clamp forwards a bad value instead of stopping it — and a single non-finite
 * landmark would then reach the UI as "NaN" and serialise to `null`, making
 * the server reject the whole request with a generic error.
 */

/** Clamp to 0..1, mapping any non-finite input to 0. */
export const clamp01 = (n: number): number =>
  Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;

/** Clamp to a range, with an explicit value for a non-finite input. */
export const clampN = (n: number, min: number, max: number, fallback = min): number =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
