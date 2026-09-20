// Plan / feature-gating architecture.
//
// Payments (Stripe) are deferred, but the gating is wired now so flipping a
// user to PRO/PREMIUM later unlocks everything with no UI rework. Gating is
// declarative: a feature is a key here, never an inline plan check in a
// component.

export type Plan = "free" | "pro" | "premium";

export interface PlanFeatures {
  /** Full per-region measurement breakdown on the results page. */
  detailedMeasurements: boolean;
  /** The prioritized action roadmap. */
  fullRoadmap: boolean;
  /** Body & Growth dashboard. */
  growthDashboard: boolean;
  /** Interactive face map with per-region measurement cards. */
  interactiveFaceMap: boolean;
  /** Saved analyses + history. */
  analysisHistory: boolean;
  /** Compare two of your own analyses side by side. */
  comparisons: boolean;
  /** Weekly recap and next best action. */
  weeklyReport: boolean;
  /** Advanced insight modules. */
  advancedInsights: boolean;
  /** Style Lab experimentation tools. */
  styleLab: boolean;
  /** Export a premium PDF report. */
  pdfExport: boolean;
}

export interface PlanMeta {
  id: Plan;
  name: string;
  tagline: string;
  priceEur: number;
  /** Analyses allowed per month; null = unlimited. */
  monthlyAnalyses: number | null;
  /** Scans kept in history; null = unlimited. */
  historyLimit: number | null;
  highlight?: boolean;
}

export const PLAN_META: Record<Plan, PlanMeta> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "A real result to start from.",
    priceEur: 0,
    monthlyAnalyses: 3,
    historyLimit: 3,
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "The full measurement set and your progression.",
    priceEur: 9,
    monthlyAnalyses: null,
    historyLimit: null,
    highlight: true,
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "Everything, plus deeper reports and exports.",
    priceEur: 19,
    monthlyAnalyses: null,
    historyLimit: null,
  },
};

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    detailedMeasurements: false,
    fullRoadmap: true,
    growthDashboard: true,
    interactiveFaceMap: true,
    analysisHistory: true,
    comparisons: false,
    weeklyReport: false,
    advancedInsights: false,
    styleLab: false,
    pdfExport: false,
  },
  pro: {
    detailedMeasurements: true,
    fullRoadmap: true,
    growthDashboard: true,
    interactiveFaceMap: true,
    analysisHistory: true,
    comparisons: true,
    weeklyReport: true,
    advancedInsights: true,
    styleLab: true,
    pdfExport: false,
  },
  premium: {
    detailedMeasurements: true,
    fullRoadmap: true,
    growthDashboard: true,
    interactiveFaceMap: true,
    analysisHistory: true,
    comparisons: true,
    weeklyReport: true,
    advancedInsights: true,
    styleLab: true,
    pdfExport: true,
  },
};

export const PLAN_ORDER: Plan[] = ["free", "pro", "premium"];

export function isPaid(plan: Plan): boolean {
  return plan !== "free";
}

export function can(plan: Plan, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan][feature];
}

/** The cheapest plan that unlocks a feature — drives upgrade prompts. */
export function requiredPlan(feature: keyof PlanFeatures): Plan {
  return PLAN_ORDER.find((p) => PLAN_FEATURES[p][feature]) ?? "premium";
}

/**
 * Billing is not live yet. The landing page says so, and until Stripe is wired
 * every tier is unlocked rather than dangling features nobody can buy. Flip
 * this to `true` the day checkout ships and `currentPlan()` starts honouring
 * the stored plan instead.
 */
export const BILLING_LIVE = false;

export function currentPlan(stored?: Plan | null): Plan {
  if (!BILLING_LIVE) return "premium";
  return stored ?? "free";
}
