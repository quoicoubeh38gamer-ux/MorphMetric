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

### To do
- Connect Postgres (e.g. Vercel Storage) + set AUTH_SECRET/APP_URL → test the
  live sign-up/login flow (not testable from the build container).
- Stripe checkout + webhook to flip plan → Pro (architecture already in place).
- Move scan/report persistence server-side per user once accounts are live.
- On-device landmark accuracy tuning validated with real photos on the live site.
