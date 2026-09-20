import { chromium } from "playwright-core";

/**
 * Accessibility + contrast audit.
 *
 * Run against a live server (`npm start`, then `npm run a11y`). Checks, in
 * both themes: accessible names on every interactive element, alt text,
 * labelled form fields, heading order, duplicate ids, landmarks, and the
 * computed contrast of every text node against its real painted background
 * (WCAG AA — 4.5:1, or 3:1 for large text).
 *
 * Text drawn with background-clip (the gradient headline) reports a
 * transparent colour and is skipped rather than flagged.
 *
 * Exits non-zero on a finding, so it can gate a release.
 */
const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const ROUTES = ["/", "/scan", "/plan", "/growth", "/privacy", "/login", "/signup",
  "/learn", "/learn/how-scoring-works", "/learn/facial-symmetry", "/results", "/report",
  "/dashboard", "/dashboard/measurements", "/dashboard/insights", "/dashboard/history",
  "/dashboard/progress", "/dashboard/style", "/dashboard/settings"];

const CHECK = () => {
  const out = [];
  const add = (rule, detail) => out.push({ rule, detail: String(detail).slice(0, 140) });
  const name = (el) =>
    (el.getAttribute("aria-label") || el.getAttribute("title") ||
     (el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby"))?.textContent) ||
     el.textContent || "").trim();

  // --- accessible names -----------------------------------------------
  for (const el of document.querySelectorAll("a[href], button, [role=button]")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (!name(el) && !el.querySelector("img[alt]:not([alt=''])")) {
      add("no-accessible-name", el.outerHTML.slice(0, 120));
    }
  }
  // --- images ----------------------------------------------------------
  for (const img of document.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) add("img-missing-alt", img.outerHTML.slice(0, 120));
  }
  // --- form labelling ---------------------------------------------------
  for (const f of document.querySelectorAll("input, select, textarea")) {
    if (f.type === "hidden") continue;
    const labelled = f.labels?.length || f.getAttribute("aria-label") ||
      f.getAttribute("aria-labelledby") || f.closest("label");
    if (!labelled) add("field-unlabelled", f.outerHTML.slice(0, 120));
  }
  // --- headings ---------------------------------------------------------
  const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  const h1 = hs.filter((h) => h.tagName === "H1");
  if (h1.length === 0) add("no-h1", document.title);
  if (h1.length > 1) add("multiple-h1", h1.map((h) => h.textContent.trim().slice(0, 30)).join(" | "));
  let prev = 0;
  for (const h of hs) {
    const lvl = +h.tagName[1];
    if (prev && lvl > prev + 1) add("heading-skip", `h${prev} -> h${lvl}: ${h.textContent.trim().slice(0, 50)}`);
    prev = lvl;
  }
  // --- duplicate ids ----------------------------------------------------
  const ids = new Map();
  for (const el of document.querySelectorAll("[id]")) {
    ids.set(el.id, (ids.get(el.id) || 0) + 1);
  }
  for (const [id, n] of ids) if (n > 1) add("duplicate-id", `${id} x${n}`);

  // --- landmarks --------------------------------------------------------
  if (!document.querySelector("main")) add("no-main-landmark", "");
  if (document.documentElement.lang !== "en") add("html-lang", document.documentElement.lang);

  // --- contrast ---------------------------------------------------------
  const lum = (c) => {
    const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const p = parse(bg);
      const alpha = (bg.match(/rgba?\([^)]*,\s*([\d.]+)\)/) || [])[1];
      if (p.length === 3 && (alpha === undefined || +alpha > 0.85)) return p;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor);
  };
  const seen = new Set();
  for (const el of document.querySelectorAll("p,span,a,li,dd,dt,h1,h2,h3,h4,label,button,div")) {
    if (!el.firstChild || el.firstChild.nodeType !== 3) continue;
    const txt = el.textContent.trim();
    if (txt.length < 4) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || +cs.opacity < 0.5) continue;
    // Screen-reader-only text is clipped to 1px rather than hidden, so it is
    // still "visible" to getComputedStyle. It is never painted, so it has no
    // contrast requirement — measuring it against whatever sits behind the
    // clip produces noise, not findings.
    if (r.width <= 1 || r.height <= 1 || cs.clipPath !== "none" || cs.clip !== "auto") continue;
    // Gradient headlines paint through the background, so their colour is
    // transparent — there is no foreground to measure.
    if (cs.webkitTextFillColor === "rgba(0, 0, 0, 0)" || cs.color === "rgba(0, 0, 0, 0)") continue;
    const fg = parse(cs.color);
    const bg = bgOf(el);
    if (fg.length !== 3 || bg.length !== 3) continue;
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      const key = `${cs.color}|${cs.fontSize}`;
      if (seen.has(key)) continue;
      seen.add(key);
      add("contrast", `${ratio.toFixed(2)}:1 (need ${need}) ${Math.round(size)}px "${txt.slice(0, 40)}" color=${cs.color}`);
    }
  }
  return out;
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
let total = 0;
for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/");
  await page.evaluate((t) => localStorage.setItem("mm:theme", t), theme);
  console.log(`\n===== ${theme.toUpperCase()} =====`);
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const issues = await page.evaluate(CHECK);
    total += issues.length;
    if (issues.length) {
      console.log(`\n${r}`);
      const grouped = {};
      for (const i of issues) (grouped[i.rule] ??= []).push(i.detail);
      for (const [rule, ds] of Object.entries(grouped)) {
        console.log(`  ${rule} (${ds.length})`);
        ds.slice(0, 3).forEach((d) => console.log(`    ${d}`));
      }
    }
  }
  await ctx.close();
}
await browser.close();
console.log(total ? `\nA11Y FAILED — ${total} issue(s)` : "\nA11Y PASSED");
process.exit(total ? 1 : 0);
