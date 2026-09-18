import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Auth is feature-flagged on DATABASE_URL. Without a database the app runs
 * fully in its client-persisted mode and account actions return a friendly
 * "not configured" response instead of crashing.
 */
export const authEnabled = Boolean(process.env.DATABASE_URL);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  secret: process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.APP_URL ?? process.env.BETTER_AUTH_URL,
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
});

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

/** Server-side current session (or null). Safe to call when auth is disabled. */
export async function getSession() {
  if (!authEnabled) return null;
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}
