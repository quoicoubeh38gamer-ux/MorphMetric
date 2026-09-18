import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth, authEnabled } from "@/lib/auth/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = toNextJsHandler(auth);

function notConfigured() {
  return NextResponse.json(
    { error: "Accounts aren't enabled yet. Connect a database (DATABASE_URL) to activate sign-up and login." },
    { status: 503 },
  );
}

export async function GET(req: Request): Promise<Response> {
  return authEnabled ? handlers.GET(req) : notConfigured();
}

export async function POST(req: Request): Promise<Response> {
  return authEnabled ? handlers.POST(req) : notConfigured();
}
