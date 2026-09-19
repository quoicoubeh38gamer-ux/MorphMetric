import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Auth is feature-flagged on DATABASE_URL. Without a database the app runs
 * fully in its client-persisted mode and account actions return a friendly
 * "not configured" response instead of crashing.
 *
 * The Better Auth instance is created lazily (on first request), never at
 * module load / build time — so `next build` never constructs it and can't fail
 * or emit warnings when secrets/DB aren't set yet.
 */
export const authEnabled = Boolean(process.env.DATABASE_URL);

function buildAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
    secret: process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.APP_URL ?? process.env.BETTER_AUTH_URL,
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  });
}

type AuthInstance = ReturnType<typeof buildAuth>;
let cached: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!cached) cached = buildAuth();
  return cached;
}

/** Server-side current session (or null). Safe to call when auth is disabled. */
export async function getSession() {
  if (!authEnabled) return null;
  try {
    return await getAuth().api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}
