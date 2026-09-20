import { NextResponse } from "next/server";
import { authEnabled, getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { apiError, internalError } from "@/lib/security/errors";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Account deletion — GDPR art. 17, the right to erasure.
 *
 * Every model that references User cascades on delete, so removing the user
 * row removes sessions, OAuth accounts, profile, scans, analyses, check-ins,
 * XP, badges and subscription with it. That is checked by the schema, not by
 * a list maintained here: a model added later inherits the behaviour instead
 * of being quietly forgotten.
 *
 * DELETE is idempotent by design — a second call on an already-deleted account
 * reports success rather than an error, because the state the caller asked for
 * is the state that exists.
 */
export async function DELETE(req: Request): Promise<Response> {
  try {
    if (!authEnabled) {
      return apiError({
        status: 503,
        code: "auth_disabled",
        message: "Accounts aren't enabled on this deployment.",
      });
    }

    // Deletion is destructive and unauthenticated calls must not be able to
    // probe which accounts exist, so it is rate limited like a login.
    const rl = rateLimit(`account-delete:${clientKey(req.headers)}`, 5);
    if (!rl.ok) {
      return apiError({
        status: 429,
        code: "rate_limited",
        message: "Too many requests. Please wait a moment.",
        headers: { "Retry-After": "60" },
      });
    }

    const session = await getSession();
    if (!session?.user) {
      return apiError({ status: 401, code: "auth_required", message: "Sign in first." });
    }

    const userId = session.user.id;
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      // P2025 — the row is already gone. The caller wanted it gone; it is.
      const code = (error as { code?: string } | null)?.code;
      if (code !== "P2025") throw error;
    }

    // Clear the session cookie so the browser does not keep presenting a
    // token for a user that no longer exists.
    const res = NextResponse.json(
      { deleted: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    for (const name of ["better-auth.session_token", "__Secure-better-auth.session_token"]) {
      res.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
    return res;
  } catch (error) {
    return internalError(error);
  }
}
