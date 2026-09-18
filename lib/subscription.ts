// Plan / feature-gating architecture. Payments (Stripe) are deferred, but the
// gating is wired now so turning a user PRO later unlocks everything.

export type Plan = "free" | "pro";

export interface PlanFeatures {
  detailedFeatureCards: boolean;
  fullRoadmap: boolean;
  growthDashboard: boolean;
  weeklyReport: boolean;
  advancedInsights: boolean;
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    detailedFeatureCards: true,
    fullRoadmap: true,
    growthDashboard: true,
    weeklyReport: false,
    advancedInsights: false,
  },
  pro: {
    detailedFeatureCards: true,
    fullRoadmap: true,
    growthDashboard: true,
    weeklyReport: true,
    advancedInsights: true,
  },
};

export function isPro(plan: Plan): boolean {
  return plan === "pro";
}

export function can(plan: Plan, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan][feature];
}
