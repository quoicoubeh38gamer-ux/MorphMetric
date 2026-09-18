// Runs before `next build`. Applies Prisma migrations only when a database is
// configured, so the app still builds and deploys with no DATABASE_URL set
// (auth is simply inactive until a database is connected).
import { execSync } from "node:child_process";

if (process.env.DATABASE_URL) {
  try {
    console.log("[predeploy] DATABASE_URL found — applying migrations…");
    execSync("prisma migrate deploy", { stdio: "inherit" });
  } catch (err) {
    // Never fail the build on a migration hiccup; log and continue.
    console.error("[predeploy] migrate deploy failed (continuing):", err?.message ?? err);
  }
} else {
  console.log("[predeploy] No DATABASE_URL — skipping migrations (auth stays inactive).");
}
