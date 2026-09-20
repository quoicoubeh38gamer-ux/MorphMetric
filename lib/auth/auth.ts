import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { passwordResetMail, sendMail } from "@/lib/email/send";

/**
 * Auth is feature-flagged on DATABASE_URL. Without a database the app runs
 * fully in its client-persisted mode and account actions return a friendly
 * "not configured" response instead of crashing.
 *
 * The Better Auth instance is created lazily (on first request), never at
 * module load / build time — so `next build` never constructs it.
 */
export const authEnabled = Boolean(process.env.DATABASE_URL);

/**
 * Origins Better Auth will accept requests from. On Vercel the accessed host
 * varies (per-deployment, branch alias, production alias), so we derive them
 * from the env vars Vercel injects at runtime. This is what fixes the
 * "Invalid origin" error on sign-up/login.
 */
function trustedOrigins(): string[] {
  const set = new Set<string>();
  const add = (u?: string | null) => {
    if (!u) return;
    set.add(u.startsWith("http") ? u : `https://${u}`);
  };
  add(process.env.APP_URL);
  add(process.env.BETTER_AUTH_URL);
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_BRANCH_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  set.add("http://localhost:3000");
  set.add("https://*.vercel.app"); // covers preview/branch aliases
  return [...set];
}

function baseURL(): string | undefined {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return undefined;
}

function buildAuth() {
  const isProd = process.env.NODE_ENV === "production";
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
      // Without this, Better Auth refuses the reset flow outright and logs
      // "Reset password isn't enabled" — a user who forgets their password is
      // locked out permanently, with no way back in.
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async ({ user, url }) => {
        await sendMail(passwordResetMail(user.email, url));
      },
    },
    secret: process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    baseURL: baseURL(),
    trustedOrigins: trustedOrigins(),
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    // Brute-force protection on the auth endpoints. Tighter than the default:
    // ten attempts a minute is generous for a human and hostile to a script.
    rateLimit: { enabled: true, window: 60, max: 10 },
    advanced: {
      useSecureCookies: isProd,
      // The session cookie must be unreadable from JavaScript (blunts XSS
      // session theft) and must not ride along on cross-site requests (CSRF).
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
      },
    },
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
