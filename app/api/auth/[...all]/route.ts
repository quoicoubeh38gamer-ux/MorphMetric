import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, authEnabled } from "@/lib/auth/auth";
import { checkAge } from "@/lib/auth/age-gate";
import { LEGAL } from "@/lib/legal";

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

function isSignUp(req: Request): boolean {
  const { pathname } = new URL(req.url);
  return req.method === "POST" && pathname.endsWith("/sign-up/email");
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
  // The age gate sits in front of Better Auth rather than inside the form: a
  // check the browser performs is a suggestion, since anyone can POST straight
  // to this endpoint. We read the body, validate here, then hand Better Auth a
  // request rebuilt *without* the birth date — it is used and discarded, never
  // stored (GDPR art. 5(1)(c)).
  if (isSignUp(req)) {
    const raw = await req.text();

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const verdict = checkAge(body.birthDate);
    if (!verdict.ok) {
      return NextResponse.json(
        { error: verdict.message, code: `age_${verdict.code}`, minimumAge: LEGAL.minimumAge },
        { status: 403 },
      );
    }

    if (!authEnabled) return notConfigured();

    delete body.birthDate;
    const forwarded = JSON.stringify(body);

    // The original Content-Length describes the body we just shortened, and a
    // stale one makes the forwarded request unparseable. Drop it and let the
    // runtime recompute.
    const headers = new Headers(req.headers);
    headers.delete("content-length");

    return toNextJsHandler(getAuth()).POST(
      new Request(req.url, { method: "POST", headers, body: forwarded }),
    );
  }

  if (!authEnabled) return notConfigured();
  return toNextJsHandler(getAuth()).POST(req);
}
