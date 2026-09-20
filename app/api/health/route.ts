import { NextResponse } from "next/server";
import { authEnabled } from "@/lib/auth/auth";

export const runtime = "nodejs";

/**
 * Liveness plus the one capability flag the client needs: whether accounts are
 * configured. Without it the browser cannot tell "signed out" apart from
 * "accounts not set up yet", and would lock everyone out of scanning.
 * Deliberately a boolean — it reveals no configuration detail.
 */
export function GET(): Response {
  return NextResponse.json(
    { status: "ok", service: "morphmetric", auth: authEnabled },
    { headers: { "Cache-Control": "no-store" } },
  );
}
