import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, authEnabled } from "@/lib/auth/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function notConfigured() {
  return NextResponse.json(
    { error: "Accounts aren't enabled yet. Connect a database (DATABASE_URL) to activate sign-up and login." },
    { status: 503 },
  );
}

export async function GET(req: Request): Promise<Response> {
  if (!authEnabled) return notConfigured();
  return toNextJsHandler(getAuth()).GET(req);
}

export async function POST(req: Request): Promise<Response> {
  if (!authEnabled) return notConfigured();
  return toNextJsHandler(getAuth()).POST(req);
}
