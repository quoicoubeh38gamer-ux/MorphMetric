import { z } from "zod";

/**
 * Server-side validation for the analyze request.
 *
 * The client sends a compact image fingerprint + measured quality, never raw
 * pixels in the MVP. Everything is bounded and sanitized here — the frontend is
 * never trusted to be well-formed.
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

export const analyzeRequestSchema = z.object({
  profile: profileSchema,
  quality: qualitySchema,
  fingerprint: z.array(z.number().min(0).max(1)).min(1).max(64),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
