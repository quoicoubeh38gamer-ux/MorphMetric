import { chromium, devices } from "playwright-core";

/**
 * Route audit.
 *
 * Point it at a running server (`npm run build && npm start`, then
 * `node scripts/audit.mjs`). Two passes:
 *
 *   1. every route anonymous — console errors, failed requests, dead links;
 *   2. the data-bearing routes with a real report seeded into localStorage,
 *      at desktop and phone width — horizontal overflow, and any "NaN" /
 *      "undefined" / "[object Object]" that reached the screen.
 *
 * Pass two is the one that matters: an anonymous crawl only ever sees the
 * empty state, which is not where the bugs are.
 *
 * Exits non-zero on failure, so it can gate a release.
 */
const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const CHROME = "/opt/pw-browsers/chromium";

const ROUTES = [
  "/", "/scan", "/plan", "/growth", "/login", "/signup", "/report", "/results",
  "/privacy", "/terms", "/legal", "/forgot-password", "/reset-password",
  "/learn", "/learn/how-scoring-works", "/learn/photo-guide", "/learn/evidence-tiers",
  "/learn/what-this-is-not", "/learn/privacy-by-design", "/learn/facial-symmetry",
  "/learn/facial-proportions", "/learn/eye-area", "/learn/eyebrows", "/learn/nose",
  "/learn/lips-and-mouth", "/learn/jawline-and-chin", "/learn/skin",
  "/dashboard", "/dashboard/measurements", "/dashboard/insights", "/dashboard/history",
  "/dashboard/progress", "/dashboard/style", "/dashboard/settings",
];

const SEEDED_ROUTES = [
  "/results", "/report", "/dashboard", "/dashboard/measurements", "/dashboard/insights",
  "/dashboard/history", "/dashboard/progress", "/dashboard/style", "/dashboard/settings", "/plan",
];

let failures = 0;
const browser = await chromium.launch({ executablePath: CHROME });

/* ---------------------------------------------------------------- pass one */
console.log("=== pass one: anonymous crawl ===");
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const links = new Set();

  for (const r of ROUTES) {
    const errs = [];
    const failed = [];
    const onConsole = (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 180)); };
    const onPageErr = (e) => errs.push("UNCAUGHT: " + String(e).slice(0, 180));
    const onFailed = (req) => {
      // Next aborts in-flight RSC prefetches on navigation — expected.
      if (req.url().includes("_rsc=") && (req.failure()?.errorText ?? "").includes("ERR_ABORTED")) return;
      failed.push(`${req.method()} ${req.url().replace(BASE, "")} :: ${req.failure()?.errorText}`);
    };
    const onResp = (res) => {
      if (res.url().startsWith(BASE) && res.status() >= 400) {
        failed.push(`${res.status()} ${res.url().replace(BASE, "")}`);
      }
    };
    page.on("console", onConsole); page.on("pageerror", onPageErr);
    page.on("requestfailed", onFailed); page.on("response", onResp);

    const res = await page.goto(BASE + r, { waitUntil: "networkidle" }).catch(() => null);
    await page.waitForTimeout(400);
    for (const h of await page.evaluate(() =>
      [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))) {
      if (h?.startsWith("/")) links.add(h);
    }

    page.off("console", onConsole); page.off("pageerror", onPageErr);
    page.off("requestfailed", onFailed); page.off("response", onResp);

    const bad = errs.length + failed.length;
    if (bad) failures += 1;
    console.log(`${bad ? "FAIL" : "ok  "} ${String(res?.status() ?? "ERR").padEnd(4)} ${r}`);
    errs.forEach((e) => console.log("      console: " + e));
    failed.forEach((f) => console.log("      net:     " + f));
  }

  const known = new Set(ROUTES);
  const dead = [...links].filter((h) => !h.startsWith("/#") && !known.has(h.split("#")[0]));
  if (dead.length) { failures += dead.length; console.log("DEAD LINKS: " + dead.join(", ")); }
  else console.log(`all ${links.size} internal links resolve`);
  await ctx.close();
}

/* ---------------------------------------------------------------- pass two */
console.log("\n=== pass two: seeded with a real report ===");
{
  const res = await fetch(BASE + "/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "198.51.100.5" },
    body: JSON.stringify({
      profile: { ageYears: 19, sex: "male", heightCm: 178, parentAvgCm: 176, goals: ["skin", "styling"] },
      quality: { ok: true, score: 0.92, issues: [] },
      vision: {
        mode: "landmarks",
        signals: { symmetry: .84, proportions: .55, eyes: .72, brows: .41, nose: .66, lips: .78, jaw: .38, skin: .61 },
        metrics: { thirdsUpper: .31, thirdsMid: .35, thirdsLower: .34, fwhr: 1.92, interocularRatio: 1.05,
                   canthalTiltDeg: 4.2, jawWidthRatio: .77, noseWidthRatio: .26, mouthWidthRatio: .45, symmetryDevPct: 2.1 },
      },
    }),
  });
  if (!res.ok) {
    console.error("could not seed a report:", res.status, (await res.text()).slice(0, 200));
    await browser.close();
    process.exit(1);
  }
  const { report } = await res.json();
  const older = { ...JSON.parse(JSON.stringify(report)),
    id: "older-seed",
    createdAt: new Date(Date.now() - 12 * 864e5).toISOString(),
    morphScore: Math.max(2, report.morphScore - 1.4) };
  console.log(`seed: ${report.id} score ${report.morphScore} · ${report.features?.length} features`);

  // Written the way lib/store.ts writes it, so the pages take their real path.
  const seed = ({ r, o }) => {
    const snap = (x) => ({ id: x.id, createdAt: x.createdAt, morphScore: x.morphScore,
                           potentialScore: x.potentialScore ?? x.morphScore, provider: x.provider ?? "mediapipe@1" });
    localStorage.setItem("mm:report", JSON.stringify(r));
    localStorage.setItem("mm:reports", JSON.stringify([r, o]));
    localStorage.setItem("mm:history", JSON.stringify([snap(o), snap(r)]));
    localStorage.setItem("mm:profile", JSON.stringify({ ageYears: 19, sex: "male", heightCm: 178, parentAvgCm: 176, goals: ["skin", "styling"] }));
    localStorage.setItem("mm:consent", JSON.stringify({ version: "2026-09-1", acceptedAt: new Date().toISOString() }));
    localStorage.setItem("mm:scanCount", "2");
  };

  for (const device of [null, devices["iPhone 13"]]) {
    const ctx = await browser.newContext(device ? { ...device } : { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/");
    await page.evaluate(seed, { r: report, o: older });
    console.log(`\n--- ${device ? "phone 390px" : "desktop 1280px"} ---`);

    for (const r of SEEDED_ROUTES) {
      const errs = [];
      const onC = (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 180)); };
      const onE = (e) => errs.push("UNCAUGHT: " + String(e).slice(0, 180));
      page.on("console", onC); page.on("pageerror", onE);
      await page.goto(BASE + r, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        junk: (document.body.innerText.match(/\bNaN\b|\bundefined\b|\[object Object\]|\bInfinity\b/g) || []).slice(0, 5),
        empty: document.body.innerText.trim().length < 200,
      }));
      page.off("console", onC); page.off("pageerror", onE);

      const bad = errs.length || m.overflow > 0 || m.junk.length || m.empty;
      if (bad) failures += 1;
      console.log(`${bad ? "FAIL" : "ok  "} ${r.padEnd(26)} overflow=${m.overflow}px junk=${JSON.stringify(m.junk)}${m.empty ? " EMPTY" : ""}`);
      errs.forEach((e) => console.log("      " + e));
    }
    await ctx.close();
  }
}

await browser.close();
console.log(failures ? `\nAUDIT FAILED — ${failures} problem(s)` : "\nAUDIT PASSED");
process.exit(failures ? 1 : 0);
