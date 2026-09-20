import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, authEnabled } from "@/lib/auth/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A request that only asks "am I signed in?" has a correct answer even when
 * accounts are not configured: no. Answering 503 instead made every page in
 * the product log a failed request, which buries real errors in the console
 * and reads as an outage when it is just an unconfigured environment.
 *
 * Anything that tries to *do* something (sign in, sign up, sign out) still
 * gets the 503 and the explanation, because those genuinely cannot proceed.
 */
function isSessionRead(req: Request): boolean {
  const { pathname } = new URL(req.url);
  return req.method === "GET" && pathname.endsWith("/get-session");
}

function notConfigured() {
  return NextResponse.json(
    { error: "Accounts aren't enabled yet. Connect a database (DATABASE_URL) to activate sign-up and login." },
    { status: 503 },
  );
}

export async function GET(req: Request): Promise<Response> {
  if (!authEnabled) {
    return isSessionRead(req)
      ? NextResponse.json(null, { headers: { "Cache-Control": "no-store" } })
      : notConfigured();
  }
  return toNextJsHandler(getAuth()).GET(req);
}

export async function POST(req: Request): Promise<Response> {
  if (!authEnabled) return notConfigured();
  return toNextJsHandler(getAuth()).POST(req);
}
