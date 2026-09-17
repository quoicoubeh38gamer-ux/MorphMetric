import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/validation/analyze";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { getVisionProvider } from "@/lib/ai/vision";
import { buildFaceReport } from "@/lib/ai/report";

// Scoring must never run on the client. This route is the trust boundary:
// validate → rate-limit → run the vision provider → build the report.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const key = clientKey(req.headers);
  const limit = Number(process.env.RATE_LIMIT_PER_MINUTE ?? "12");
  const rl = rateLimit(`analyze:${key}`, Number.isFinite(limit) ? limit : 12);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": "30" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { profile, quality, fingerprint } = parsed.data;
  if (!quality.ok) {
    return NextResponse.json(
      { error: "Better image needed.", quality },
      { status: 400 },
    );
  }

  const vision = getVisionProvider().analyze({ fingerprint, quality });
  const report = buildFaceReport(profile, vision, quality);

  return NextResponse.json({ report });
}
