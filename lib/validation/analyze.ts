import { z } from "zod";

/**
 * Server-side validation for the analyze request.
 *
 * Two vision modes:
 *  - "landmarks": real MediaPipe geometry ran in the browser; the client sends
 *    bounded per-feature signals (never raw pixels).
 *  - "fingerprint": deterministic heuristic fallback when no face is detected.
 *
 * The frontend is never trusted to be well-formed — everything is bounded here,
 * and scoring/recommendations always run on the server.
 */
export const profileSchema = z.object({
  ageYears: z.number().int().min(5).max(100).nullable(),
  sex: z.enum(["male", "female", "unspecified"]).default("unspecified"),
  heightCm: z.number().min(80).max(260).nullable(),
  parentAvgCm: z.number().min(80).max(260).nullable(),
  goals: z.array(z.string().max(40)).max(8).default([]),
});

export const qualitySchema = z.object({
  ok: z.boolean(),
  score: z.number().min(0).max(1),
  issues: z.array(z.string().max(120)).max(12),
});

const unit = z.number().min(0).max(1);

export const signalsSchema = z.object({
  symmetry: unit,
  proportions: unit,
  eyes: unit,
  brows: unit,
  nose: unit,
  lips: unit,
  jaw: unit,
  skin: unit,
});

export const visionSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("landmarks"), signals: signalsSchema }),
  z.object({ mode: z.literal("fingerprint"), fingerprint: z.array(unit).min(1).max(64) }),
]);

export const analyzeRequestSchema = z.object({
  profile: profileSchema,
  quality: qualitySchema,
  vision: visionSchema,
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
