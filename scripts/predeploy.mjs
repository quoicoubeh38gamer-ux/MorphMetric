// Runs before `next build`. Applies Prisma migrations only when a database is
// configured, so the app still builds and deploys with no DATABASE_URL set
// (auth is simply inactive until a database is connected).
import { execSync } from "node:child_process";

const pooled = process.env.DATABASE_URL;

if (pooled) {
  // Hosted Postgres (Neon, Supabase, Vercel Postgres) hands out a *pooled*
  // connection string. Running migrations through a transaction pooler fails
  // with "prepared statement already exists", so prefer the direct/unpooled
  // URL when the provider gave us one. Runtime still uses the pooled URL.
  const direct =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    pooled;

  try {
    console.log(
      direct === pooled
        ? "[predeploy] DATABASE_URL found — applying migrations…"
        : "[predeploy] DATABASE_URL found — applying migrations over the direct connection…",
    );
    execSync("prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: direct },
    });
  } catch (err) {
    // Never fail the build on a migration hiccup; log and continue.
    console.error("[predeploy] migrate deploy failed (continuing):", err?.message ?? err);
  }
} else {
  console.log("[predeploy] No DATABASE_URL — skipping migrations (auth stays inactive).");
}
