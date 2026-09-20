import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/validation/analyze";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { apiError, internalError } from "@/lib/security/errors";
import { authEnabled, getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { FREE_SCAN_LIMIT } from "@/lib/quota";
import { getVisionProvider } from "@/lib/ai/vision";
import { visionFromLandmarkSignals } from "@/lib/ai/measurements";
import { buildFaceReport } from "@/lib/ai/report";
import type { VisionResult } from "@/lib/ai/types";

// Scoring must never run on the client. This route is the trust boundary:
// validate → rate-limit → run the vision provider → build the report.
//
// Note there is deliberately no raw image in this payload: the browser derives
// bounded numeric signals locally, so the server never receives or stores a
// face photo. That also means there is no per-analysis resource to enumerate.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Bound the body so a huge payload can't be used as a DoS vector before zod
// ever runs. The real request is a few hundred bytes of numbers.
const MAX_BODY_BYTES = 32 * 1024;

export async function POST(req: Request): Promise<Response> {
  try {
    const declaredLength = Number(req.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return apiError({ status: 413, code: "payload_too_large", message: "Request body is too large." });
    }

    const key = clientKey(req.headers);
    const limit = Number(process.env.RATE_LIMIT_PER_MINUTE ?? "12");
    const rl = rateLimit(`analyze:${key}`, Number.isFinite(limit) ? limit : 12);
    if (!rl.ok) {
      return apiError({
        status: 429,
        code: "rate_limited",
        message: "Too many requests. Please wait a moment and try again.",
        headers: { "Retry-After": "30" },
      });
    }

    // An analysis belongs to an account. Once accounts are configured this is
    // the authoritative gate — the client-side paywall is only UX.
    let userId: string | null = null;
    if (authEnabled) {
      const session = await getSession();
      if (!session?.user) {
        return apiError({
          status: 401,
          code: "auth_required",
          message: "Create a free account to run an analysis.",
        });
      }
      userId = session.user.id;

      // Free-tier allowance, counted in the database against this user — the
      // browser counter is only there to show the paywall before the request.
      // A database fault fails open rather than taking the product down; the
      // failure is logged so it cannot pass unnoticed.
      try {
        const [used, subscription] = await Promise.all([
          prisma.scan.count({ where: { userId } }),
          prisma.subscription.findUnique({
            where: { userId },
            select: { plan: true, status: true },
          }),
        ]);
        const paid =
          subscription?.status === "ACTIVE" &&
          (subscription.plan === "PRO" || subscription.plan === "PREMIUM");
        if (!paid && used >= FREE_SCAN_LIMIT) {
          return apiError({
            status: 402,
            code: "quota_exceeded",
            message: `You've used your ${FREE_SCAN_LIMIT} free analyses. Upgrade for unlimited scans.`,
          });
        }
      } catch (error) {
        console.error("[analyze] quota check unavailable — allowing this run", error);
      }
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return apiError({ status: 413, code: "payload_too_large", message: "Request body is too large." });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return apiError({ status: 400, code: "invalid_json", message: "Invalid request body." });
    }

    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      // The detailed issue list stays server-side: it describes our schema.
      return apiError({
        status: 422,
        code: "invalid_request",
        message: "Some values in that request were not valid.",
        logContext: parsed.error.flatten(),
      });
    }

    const { profile, quality, vision } = parsed.data;
    if (!quality.ok) {
      return NextResponse.json(
        { error: "Better image needed.", code: "low_quality", quality },
        { status: 400 },
      );
    }

    // Real landmarks (MediaPipe, client) vs. heuristic fallback — either way the
    // server owns the scoring, breakdown, recommendations and XP.
    const visionResult: VisionResult =
      vision.mode === "landmarks"
        ? visionFromLandmarkSignals(vision.signals, quality)
        : getVisionProvider().analyze({ fingerprint: vision.fingerprint, quality });

    const report = buildFaceReport(
      profile,
      visionResult,
      quality,
      vision.mode === "landmarks" ? vision.metrics : undefined,
    );

    // Record the scan against the account. Never let a write failure lose an
    // analysis the user already waited for.
    if (userId) {
      try {
        await prisma.scan.create({
          data: { userId, status: "COMPLETE", qualityScore: quality.score },
        });
      } catch (error) {
        console.error("[analyze] could not record scan", error);
      }
    }

    return NextResponse.json(
      { report },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return internalError(error);
  }
}
