# CLAUDE.md — MorphMetric

Source of truth for the project. Read it before any change; update the
**Journal** after every validated step.

---

## 1. Product vision

**MorphMetric** is a premium SaaS for **personal morphology & growth insights**.
The user imports (or takes) a photo, gets a clear visual analysis of estimable
facial features, sees their strengths and a few prioritized areas to optimize,
and receives an evidence-tagged plan focused on what they can actually control.
A separate **Body & Growth** section covers height, habits, sleep, nutrition and
activity.

The feeling to deliver: *"I just ran a scan and now I have a personalized plan."*
Not: *"another AI app that throws a score at me."*

**Positioning:** *Understand your features. Improve what you can control.*
Minimalist + futuristic + scientific + premium + lightly gaming. Inspiration:
Apple Health, Whoop, Linear, Nothing, Arc, modern medical dashboards — **copy no
brand**. Avoid every low-end "looksmaxxing" code (skulls, flames, "sigma",
aggressive copy, fake before/after, unrealistic promises, pseudo-science).

---

## 2. Non-negotiable safety & anti-bullshit policy

This is the spine of the product. It is enforced in copy **and** in code
(`lib/ai/evidence.ts`, `recommendation-engine.ts`, the confidence system).

1. **No body-shaming.** Never "ugly", "bad face", "low value", "subhuman",
   "inferior". Only: *strength*, *area to optimize*, *feature currently limiting
   the balance*, *potential improvement area*.
2. **The score is internal.** "Morphology Score X/20" is an app metric, never an
   objective truth about beauty or a person's worth. Always shown with that
   disclaimer.
3. **Show uncertainty.** A 2D photo can't measure 3D anatomy reliably. Every
   feature carries a **confidence** (High / Medium / Low). If something can't be
   determined from an image, say so.
4. **Evidence tiers.** Every meaningful recommendation is tagged
   `Evidence-backed` / `Plausible (limited evidence)` / `Unsupported`. Never turn
   a hypothesis into a fact. Prefer WHO, CDC, NHS, ANSES, EFSA, NIH, AAP,
   recognized universities, peer-reviewed work.
5. **No harmful growth/diet advice.** Never promise "gain 10 cm" / "grow taller
   fast" / "unlock growth plates". For minors: no aggressive calorie
   restriction, prolonged fasting, food-group elimination, calorie obsession, or
   rapid weight loss. Goal = *support healthy development* with real foods.
6. **Age-aware framing.** When the profile age is under 18, the aesthetic score
   is de-emphasized and health/growth guidance is foregrounded.

If a recommendation could harm an adolescent → do not recommend it.

---

## 3. Stack (imposed)

- Next.js (App Router) · TypeScript (strict) · Tailwind CSS
- Framer Motion (animations) · lucide-react (icons)
- Prisma + PostgreSQL · zod (validation)
- Modern secure auth + private object storage (planned)
- AI abstraction layer so the vision/analysis model can be swapped without
  rewriting the app.

---

## 4. Architecture — the AI is layered

```
IMAGE
  ↓  quality check          (client canvas: resolution, brightness, blur)
  ↓  validation             (server: MIME, size, dimensions — lib/image)
FACE LANDMARK DETECTION     (lib/ai/vision — pluggable provider)
  ↓
MEASUREMENTS                (proportions, ratios)
  ↓
FEATURE ANALYSIS + SCORING  (lib/ai/analysis-engine)
  ↓
EVIDENCE DATABASE           (lib/ai/evidence)
  ↓
RECOMMENDATION ENGINE       (lib/ai/recommendation-engine)
  ↓
PERSONALIZED REPORT         (lib/ai/report)
```

**Provider abstraction.** `lib/ai/vision` exposes a `VisionProvider` interface.
The MVP ships a **deterministic heuristic provider** (stable pseudo-measurements
derived from the image, clearly labelled). A real provider (MediaPipe FaceMesh
client-side, or a cloud vision API) implements the same interface and drops in
via `VISION_PROVIDER` — no other code changes. The LLM/vision layer must never
invent medical facts; those come from the evidence database.

**Never trust the frontend.** Scoring, validation and evidence resolution run
server-side (`app/api/analyze`). The client only renders and persists the
returned report.

---

## 5. MVP scope (this build)

`Landing → Profile → Scan/Upload → Analysis → Results → Recommendations →
Dashboard`, plus the separate **Body & Growth** section, the security
fundamentals, and the layered AI. Each screen is understandable in < 5 seconds;
if a screen has too much, remove.

**Two deliberate MVP constraints (documented, not hidden):**
- Runs **DB-less**: analysis is stateless server-side; the latest report and the
  profile/check-ins live in the browser (localStorage) via `lib/store.ts`. The
  Prisma schema is the forward-looking target.
- Vision is the **heuristic provider** (real image *quality* checks; the
  landmark *measurements* are the pluggable, clearly-labelled part).

---

## 6. Security (priority)

Server-side validation, MIME allowlist + size + dimension limits, in-memory rate
limiting, no API keys on the frontend, security headers (see `next.config.mjs`),
EXIF stripping (client re-encode before upload), minimal image retention, and a
**Delete my data** control. Face photos are sensitive data and are treated as
such throughout.

---

## 7. Roadmap

| Phase | Content |
|---|---|
| 1 — Foundation | Next.js, TS strict, Tailwind design system, Prisma schema, AI layer skeleton |
| 2 — Core scan loop | Landing, profile, upload + quality check, scan animation, analysis API |
| 3 — Results | Score header, breakdown, strengths, focus areas, roadmap, feature cards |
| 4 — Body & Growth | Growth support scores, nutrition plan, evidence tags, disclaimers |
| 5 — Dashboard & progression | Dashboard, daily missions, check-in, weekly report, XP/badges |
| 6 — Persistence & Auth | Postgres wiring, secure auth, private storage, retention jobs |
| 7 — Real vision | MediaPipe / cloud provider behind the same interface |
| 8 — Monetization | Free vs Pro gating, Stripe |
| 9 — Polish | Motion, a11y, performance, SEO, security review |

---

## 8. Work protocol

1. Analyze current state · 2. Explain the change · 3. Plan · 4. Implement
cleanly · 5. Verify it builds · 6. Check the UI when relevant · 7. Update this
file. Never rewrite a working feature arbitrarily.

---

## 9. Journal

### State
- Phase **1–5 MVP** built as a runnable, DB-less foundation.

### Implemented
- Foundation: Next.js App Router, TS strict (+`noUncheckedIndexedAccess`),
  Tailwind token-based design system (dark-first + light), fonts, theme toggle.
- AI layer (`lib/ai`): types, `VisionProvider` interface + deterministic
  heuristic provider, analysis/scoring engine, evidence database, recommendation
  engine, report orchestrator, growth engine.
- **Real vision model**: MediaPipe FaceLandmarker (468 points) runs in-browser
  (`lib/ai/vision/landmarks.ts`) — real geometry → per-feature balance signals +
  skin evenness from pixels + a mesh overlay in the scan UI. Signals POST to
  `/api/analyze` (mode `landmarks`); the server maps them to scores/recos and
  sets confidence (`lib/ai/measurements.ts`). Heuristic (`fingerprint`) is the
  graceful fallback when no face is detected or the model can't load.
- Security: server-side `analyze` route with zod validation, MIME/size/dimension
  limits, in-memory rate limiting, hardening headers, EXIF-stripping upload,
  Delete-my-data.
- Screens: landing (hero, how-it-works, paths, labs→analysis, gamification,
  pricing, fictional testimonials marked as placeholders), scan flow
  (profile → guidelines → upload/quality → scanning), results, dashboard,
  Body & Growth, privacy.

### Decisions
- DB-less MVP with client persistence (see §5). Prisma schema kept as the target
  shape.
- Vision runs on-device (MediaPipe, zero inference cost, privacy-first);
  scoring/recommendations stay server-authoritative. Balance signals are
  proportion heuristics with confidence levels — never a beauty claim.
- Age-aware framing (<18 de-emphasizes the aesthetic score).
- Product stance: honest, evidence-tagged, no false/impossible promises, no
  body-shaming — enforced in copy and code (protects against refunds, payment-
  processor bans, store rejection and false-advertising liability).

- **Auth (email + password)**: Better Auth + Prisma (`lib/auth/*`, `app/api/auth/[...all]`,
  `/login`, `/signup`, navbar account state). Feature-flagged on DATABASE_URL —
  the app runs fully without a DB; accounts activate when one is connected.
  Build applies migrations only when DATABASE_URL is set (`scripts/predeploy.mjs`);
  baseline migration committed under `prisma/migrations/0_init`.
- **Plan gating** (`lib/subscription.ts`, `ProGate`): Free/Pro architecture wired
  (advanced-insights section gated on results). Stripe deferred.
- **Dopamine/design pass**: results reward burst + standout-feature callout;
  dashboard animated gradient level bar, XP count-up, pulsing streak, check-in
  burst + floating XP.

### Design system rebuild + security hardening (current)
- **Art direction reset**: the gold/violet "celestial" pass was replaced by a
  restrained system — off-white, deep black, silver, and three pearlescent
  tints (blue, lavender, silver) used only for washes and data-viz. Primary is
  ink in light / off-white in dark. Depth now comes from elevation, hairlines
  and film grain rather than gradients. Tokens: `--tint-*` (see globals.css).
- **Type**: Manrope for interface, Instrument Serif (single 400 weight) for
  headlines. A codemod strips `font-semibold/bold` from any `font-display`
  class string so the serif is never faux-bolded.
- **Landing rebuilt**: new hero ("Understand Your Face. Understand Your
  Features." / "Analyze My Face"), how-it-works, per-region measurement map,
  evidence tiers, privacy section, 3-tier pricing, testimonials (labelled
  placeholders), FAQ (native `<details>`), final CTA.
- **Interactive face map** (`components/results/face-map.tsx`): six spatial
  regions + two non-spatial chips; hover, tap and keyboard focus all select.
  Panel shows the region's measured sub-metrics vs reference, and the anatomy.
- **"How is this calculated?"** modal (`components/ui/modal.tsx` — Escape,
  backdrop, focus restore) replaces the inline methodology block.
- **Vocabulary**: measurements are framed against *reference ranges*, never as
  verdicts ("In this image, X measures close to the reference range"). The word
  "grooming" is gone from the product entirely.
- **Plans**: Free / Pro / Premium in `lib/subscription.ts` with a declarative
  feature matrix + `requiredPlan()`; Prisma `Plan` enum gained PREMIUM.

### Security audit (findings fixed)
- Rate-limit key was attacker-controlled (`x-forwarded-for` spoof) → now
  prefers platform headers; bucket map is swept and capped (was unbounded).
- WebP magic-byte check accepted any RIFF container (a .wav passed) → now also
  verifies the `WEBP` form type, and rejects a declared type that disagrees
  with the real bytes.
- `/api/analyze` leaked zod schema internals on 422 → unified `apiError`
  (`lib/security/errors.ts`): user-safe message + request id to the client,
  diagnostics to the server log only. Body size bounded before parsing.
- `.gitignore` missed `.env.production` → now `.env*` with `!.env.example`.
- CSP gained `frame-src 'none'`, `manifest-src`, `media-src`; added
  Cross-Origin-Resource-Policy.
- Prisma: unique indexes on Stripe ids (safe webhook lookup), index on
  `Scan.deleteAt` for retention sweeps.
- Noted as accepted/by-design: no analysis is stored server-side (localStorage
  only), so there is no per-analysis object to enumerate — the IDOR surface
  does not exist yet. CSP still needs `'unsafe-inline'` for Next's hydration
  bootstrap until a nonce middleware lands.

### Dashboard, onboarding, Coach, Style Lab, history & report (current)
- **Dashboard shell** (`app/dashboard/layout.tsx` + `components/dashboard/sidebar.tsx`):
  seven sections — Overview, Measurements, Insights, History, Progress, Style,
  Settings. Sticky rail from `lg`, a horizontally scrollable pill row below it
  (not a hamburger: seven flat destinations beat a drawer you must open first).
  The nav needs `min-w-0` — as a grid item it defaults to `min-width:auto` and
  otherwise stretches the whole page on mobile.
- **Onboarding**: Welcome → Consent → Profile → Capture → Analysis. Consent is a
  real gate with an explicit checkbox, stored with a version
  (`CONSENT_VERSION`) so it can be re-asked when what we process changes, and
  revocable from Settings.
- **History + comparison** (`/dashboard/history`): full reports are now kept
  (capped at 12) alongside the lightweight snapshots. Pick any two to get
  overall/ceiling/harmony deltas and a per-region before→after table, ordered
  oldest → newest so a positive delta always means "moved up".
- **Coach** (`lib/ai/coach.ts`, `/dashboard/insights`): explains the report from
  its own numbers. Deliberately deterministic — no model call, no external
  request — so an explanation can never drift from the data or invent a claim.
  Rendered as a chat with suggested questions.
- **Style Lab** (`lib/style-lab.ts`, `/dashboard/style`): ideas derived from the
  user's measured ratios (fWHR, thirds, jaw width, eye spacing, symmetry) plus
  universal lighting/photography ones. No virtual try-on: a fake preview would
  be the least honest thing in the product. `metricsRaw` is now carried on the
  report so features can reason on numbers.
- **Report / PDF** (`/report`): a real printable document + `@media print` rules;
  the browser's own "Save as PDF" gives selectable text and keeps generation on
  the device. Site chrome is `print:hidden`.
- **Settings** (`/dashboard/settings`): consent status + withdraw, a
  save-history switch (off = analyses stay ephemeral), delete-analyses and
  delete-everything, both two-step.
- Copy fix: summaries are phrased "measurements for your X" so singular and
  plural region labels both read correctly.


### Build note: npm `allowScripts`
npm 11+ blocks dependency install scripts by default, so Vercel logs warned
about Prisma's three packages and `unrs-resolver`. Verified with npm 12 that
this is a warning only — `npm ci` and `npm run build` both exit 0 without it.
Approved them anyway in `package.json > allowScripts` so the build log stays
readable. Entries are intentionally unpinned (`true`, not `pkg@version`), since
pinned entries break on every dependency bump.


### Scoring recalibration + scan gating (current)
- **The compressed scale was a real bug.** Every feature was a weighted average
  of 2–3 sub-signals, and averaging independent components collapses variance
  toward the middle. Tolerances were also enormous (`band(noseWidth, .25, .12)`
  accepted 13–37% of face width — every human nose). Signals clustered at
  0.55–0.75, and `3 + s*17` mapped that to 12.4–15.8.
- **Fix**: sub-signals are now normalised *deviations* from a reference,
  combined by quadratic mean so the worst component dominates instead of being
  diluted; tolerances tightened to realistic anthropometric spreads; output
  widened to `2 + s*18`. Monte-Carlo over 20k simulated faces: the index moved
  from min 13.3 / median 16.1 / max 18.7 with 0% under 10, to min 7.6 /
  median 12.2 / max 16.9 with 6.5% under 10.
- **Reframing, not a beauty score.** The index measures conformance to
  proportion canons. Striking faces routinely deviate — that is often what
  makes them distinctive rather than generic — so the methodology dialog now
  answers the "a model scored mid-range" objection directly. No geometric
  measurement can rank attractiveness; there is no ground truth for it in a
  face, and we do not claim one.
- **Scan gating**: `/api/analyze` requires a session once `authEnabled`
  (real server-side gate). `/api/health` exposes an `auth` boolean so the
  browser can tell "signed out" from "accounts not configured" and not lock
  everyone out. Client shows an account wall and a quota wall
  (`lib/quota.ts`, FREE_SCAN_LIMIT = 2). The client counter is UX only — a
  tamper-proof quota needs the per-user counter in the database.


### Hardening once accounts went live
- **Server-side quota**: `/api/analyze` counts `Scan` rows for the session user
  and refuses past `FREE_SCAN_LIMIT` unless the subscription is ACTIVE and
  PRO/PREMIUM. A database fault fails *open* and logs — a quota is not worth
  taking the product down for. The browser counter is UX only.
- **Session cookies**: httpOnly (blunts XSS session theft), sameSite lax
  (CSRF), secure in production. Auth rate limit tightened 20 -> 10 per minute.
- **API exposure**: every `/api/*` response carries
  `Cache-Control: no-store, private`, `X-Robots-Tag: noindex`, `Vary: Cookie`.
  `robots.ts` already disallows `/api/`. `productionBrowserSourceMaps: false`
  so original sources never ship.
- Verified on a running build: headers present, `x-powered-by` absent, zero
  `.map` files emitted.


### CSP nonce middleware (closes the last known gap)
- `middleware.ts` mints a fresh nonce per request, sets it on both the request
  (so Next stamps its own inline bootstrap scripts) and the response CSP.
  `'unsafe-inline'` is gone from `script-src`. The static CSP was removed from
  `next.config.mjs` — two CSP headers get intersected by the browser, so
  leaving it would have broken every page.
- **Deliberately no `'strict-dynamic'`**: it makes the browser ignore the host
  allowlist, and the vision model loads its WASM runtime from jsdelivr. Keeping
  the allowlist means face detection behaves exactly as before.
- `style-src` keeps `'unsafe-inline'`: next/font and inline style attributes
  need it, and injected CSS cannot execute code the way injected script can.
- **Cost, accepted knowingly**: a per-request nonce cannot live in a
  pre-rendered HTML file, so every page is now `ƒ` (server-rendered) where many
  were `○` (static). That means a function invocation per page view. Reverting
  is a matter of deleting `middleware.ts` and restoring the static CSP.
- Verified on a running build: single CSP header, nonce unique per request and
  matching the one stamped in the HTML, zero CSP violations in a real browser
  across /, /scan, /dashboard, /results, /report, /signup.


### Mobile & PWA pass
- `viewport` export in `app/layout.tsx`: `width=device-width`, `viewportFit:
  "cover"`, light/dark `themeColor`. `appleWebApp` set so an installed icon
  gets the right title and status bar.
- `app/manifest.ts` + icons (`public/icons/icon-192|512`, `maskable-512`,
  `app/apple-icon.png`, `app/icon.svg`) — the site installs to a home screen.
  Icons are generated from the logo monogram; the maskable variant keeps the
  mark inside the middle 80% because Android crops to a circle.
- **iOS zoom fix**: Safari zooms the page on focus for any field under 16px and
  never zooms back. Every text input is now `text-base` below `sm:` and
  `sm:text-sm` above it. This is invisible in a desktop simulator — do not
  "tidy" it back to `text-sm`.
- Safe areas: `.container` pads with `max(design, env(safe-area-inset-*))`, the
  sticky header takes `pt-safe`, the footer `pb-safe`. Utilities `.pt-safe`,
  `.pb-safe`, `.mb-safe`, `.min-h-screen-safe` are in `globals.css`.
- Touch targets: buttons are `h-10/h-11` below `sm:` and return to `h-8/h-10`
  above it; dashboard pills and nav sheet rows are `min-h-11`. Range inputs got
  a hand-drawn 1.3rem thumb — the browser default is ~10px.
- `html, body { overflow-x: clip }` as a net (not `hidden`, which would break
  the sticky header).
- Navbar: with seven routes the inline row no longer fits at `md`, so it starts
  at `lg` and the sheet covers everything below.
- Verified with Playwright at iPhone 13 size across 16 routes: 0px horizontal
  overflow, 0 zoom-triggering inputs.

### Learn library (`/learn`)
- `lib/learn.ts` is the content layer. Region guides are **generated from
  `FEATURE_META`** — the same metadata the scoring engine uses — so an article
  and a report can never contradict each other. Add a facial region and its
  guide appears automatically.
- Four hand-written method guides: `how-scoring-works`, `photo-guide`,
  `evidence-tiers`, `what-this-is-not`, plus `privacy-by-design`.
- `what-this-is-not` states on the record why there is no beauty/hotness score:
  no ground truth exists, so such a number is a bias presented as a
  measurement, and a large share of this audience is under 18.
- Every article route is in `sitemap.ts` and prerendered (SSG). Report feature
  cards deep-link into the matching guide via `learnPathFor()`.

### The mark (logo)
- A monogram **M**, drawn as one continuous stroke of constant weight: the legs
  splay outward like a facial contour and the centre vertex descends deep
  enough that it reads M, not W, at 16px. Perfectly symmetric about its
  vertical axis — the first thing the product measures.
- Chosen by rendering eight concepts at 128/44/24/16px and rejecting the ones
  that read as something else at icon size: three dots in a circle read as a
  power socket, `<|>` as code brackets, an M in a teardrop as a map pin. The
  depth of the centre vertex was then tuned over two more passes.
- **Single source of truth**: `MARK_PATH` in `components/site/logo.tsx`.
  `scripts/gen-icons.mjs` regenerates every raster from the same path — re-run
  it after any change to the mark.
- `MARK_VIEWBOX = "7 7.65 34 34"` crops tight to the ink bounds (the path is
  drawn on a 48-unit grid but only occupies x 8.5–39.5, y 13.3–36). Rendering
  the raw `0 0 48 48` box leaves the M floating with a third of the plate
  empty. The icon generator places that cropped box at 62.5% of the plate to
  keep the same optical margin the component gets.
- Theme handling needs no second artwork: the plate is `bg-primary` and the
  glyph `text-primary-foreground`, so it is ink-on-light and off-white-on-dark
  automatically.
- `LogoMark` (mark only, `sm|md|lg`) and `Logo` (lockup, `showWordmark`) are
  both exported.
- `app/opengraph-image.tsx` was still on the pre-redesign purple palette and
  has been rebuilt on the mark and the angelic palette. **Satori rejects the
  `background` shorthand when it carries a gradient and a colour together** —
  use `backgroundColor` + `backgroundImage` separately, or the route 500s at
  request time while the build still passes.

### Bug sweep (audit pass)
Findings, each verified before and after the fix.

- **Lint was never running.** ESLint 9 needs a flat config and there was none,
  so `next lint` reported nothing on an empty rule set. `eslint.config.mjs`
  added (`next/core-web-vitals`, with `react-hooks/exhaustive-deps` raised to
  error). `npm run lint` now exits 0 on a real rule set.
- **Stale-closure hazard in `app/growth/page.tsx`**: `useMemo` listed the five
  primitives instead of the `input` object it actually reads. Correct today,
  silently wrong the moment a sixth field joins `GrowthInput`. The object is
  memoised and depended on directly.
- **Every page logged a failed request.** With no `DATABASE_URL`, the client's
  `get-session` call got a 503 on every page load. "Am I signed in?" has a
  correct answer when accounts are off — no — so that read now returns 200 with
  a null session. Sign-in/up/out still get the 503 and the explanation, because
  those genuinely cannot proceed.
- **Silent data loss after a full analysis.** `localStorage` writes were
  wrapped in an empty catch, so on iOS private browsing, blocked site data or a
  full origin the report vanished and the user landed on an empty results page
  after a 30-second scan. `lib/store.ts` now mirrors every write in memory, so
  the session still works, and `/results` says plainly that nothing will
  survive a reload. **`remove()` clears both layers** — a half-removal would
  have resurrected data the user asked to delete.
- **Clamps forwarded NaN.** `Math.max(0, NaN)` is `NaN`: `clamp01`/`clampN`
  passed bad values straight through to the UI (rendered as "NaN") and to JSON
  (`null`, so the server rejected the whole request with a generic error). Both
  are now finite-checked, and `detectFace` rejects a mesh containing non-finite
  coordinates outright — an unreadable photo should say so, not score noise.
- **JSON-LD breakout.** `JSON.stringify` does not escape `</script>`. Content
  is ours today; `<` is now escaped so it cannot become an injection later.

Checked and found already sound: every divisor in the landmark maths is floored
at `1e-4`; the analyze route rejects NaN, Infinity, out-of-range, missing
fields, unknown vision modes, oversized bodies (413) and wrong methods (405),
leaks no schema internals, and rate-limits at 12/min; both `target="_blank"`
links carry `rel="noopener noreferrer"`; no stray `console.log`; all 30
internal links resolve.

### Audit tooling
`npm run audit` (against a running `npm start`) crawls every route anonymously
for console errors, failed requests and dead links, then re-crawls the
data-bearing routes with a real report seeded into localStorage, at desktop and
phone width, failing on horizontal overflow or any "NaN"/"undefined"/
"[object Object]" that reached the screen. **Pass two is the one that finds
things** — an anonymous crawl only ever sees the empty state. Exits non-zero,
so it can gate a release.

`npm run icons` regenerates every raster from `MARK_PATH`.

### Still to do (next batch)
- Stripe checkout + webhook (blocked on the owner's banking details). Gating is
  declarative in `lib/subscription.ts`; `BILLING_LIVE=false` unlocks every tier
  until checkout exists, so nothing dangles that cannot be bought.
- Move persistence server-side with ownership checks once accounts are live.
  Until then there is no per-analysis object to enumerate, so no IDOR surface.
- CSP still needs `'unsafe-inline'` for Next's hydration bootstrap until a
  nonce middleware lands.
- Landmark accuracy tuning validated against real photos on the live site.

### To do
- Connect Postgres (e.g. Vercel Storage) + set AUTH_SECRET/APP_URL → test the
  live sign-up/login flow (not testable from the build container).
- Stripe checkout + webhook to flip plan → Pro (architecture already in place).
- Move scan/report persistence server-side per user once accounts are live.
- On-device landmark accuracy tuning validated with real photos on the live site.
