# MorphMetric

**AI-powered personal morphology & growth insights.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fquoicoubeh38gamer-ux%2FMorphMetric)

> One-click deploy: click the button above (or import the repo at
> [vercel.com/new](https://vercel.com/new)). No environment variables are
> required for the MVP — it builds and runs out of the box.

MorphMetric helps you understand your facial features and growth-related habits,
then turns that into a small, evidence-tagged plan focused on what you can
actually control. It is a personal-optimization dashboard — **not** a beauty
score, and not a "looksmaxxing" gimmick.

> The morphology score is an **internal application metric**, not an objective
> measure of attractiveness or a person's value. Every feature comes with a
> confidence level, and every recommendation is tagged by how strong its
> evidence is.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** design system (dark-first, light theme included)
- **Framer Motion** for the scan / count-up / chart-build animations
- **Prisma** + **PostgreSQL** (schema defined; MVP runs DB-less)
- Pluggable **AI layer** (`lib/ai`): vision → measurements → analysis → scoring
  → evidence → recommendations

## MVP flow

```
Landing → Profile → Scan/Upload → Analysis → Results → Recommendations → Dashboard
                                       └── Body & Growth (separate from face score)
```

## Getting started

```bash
npm install
cp .env.example .env      # fill in values when wiring persistence
npm run dev               # http://localhost:3000
npm run build             # production build (type-checked)
```

The MVP is intentionally runnable **without a database**: analysis is computed
server-side and the latest report is persisted in the browser. See `CLAUDE.md`
for the full architecture, the safety/anti-bullshit policy, and the project
journal.

## Safety

- No body-shaming language. Ever. Only "strengths" and "areas to optimize".
- Nothing that can't be reasonably estimated from a 2D photo is presented as a
  hard fact — confidence levels make the uncertainty visible.
- Growth/nutrition guidance is oriented toward **healthy development**, never
  aggressive dieting, fasting, or promises to "grow taller fast".
- Face photos are treated as sensitive data: strict validation, minimal
  retention, and a "Delete my data" control.
