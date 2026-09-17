import type { GrowthInput, GrowthSupport, NutritionPlan, Profile } from "./types";
import { clamp } from "../utils/format";

const isMinor = (age: number | null): boolean => age !== null && age < 18;

function sleepScore(hours: number | null, age: number | null): number {
  if (hours === null) return 5;
  // Recommended bands (CDC): teens ~8–10h, adults ~7–9h.
  const low = isMinor(age) ? 8 : 7;
  const high = isMinor(age) ? 10 : 9;
  if (hours >= low && hours <= high) return 10;
  const off = hours < low ? low - hours : hours - high;
  return clamp(10 - off * 2.2, 0, 10);
}

function activityScore(minutes: number | null, age: number | null): number {
  if (minutes === null) return 5;
  // CDC: youth ~60 min/day; adults ~30 min/day moderate activity.
  const target = isMinor(age) ? 60 : 30;
  return clamp((minutes / target) * 10, 0, 10);
}

/** Turn self-reported habits into a Growth Support profile (0..10 per axis). */
export function computeGrowthSupport(input: GrowthInput): GrowthSupport {
  const sleep = Math.round(sleepScore(input.sleepHours, input.ageYears) * 10) / 10;
  const activity = Math.round(activityScore(input.activityMinutes, input.ageYears) * 10) / 10;
  const nutrition = Math.round(clamp(input.nutritionQuality ?? 6, 0, 10) * 10) / 10;
  const consistency = Math.round(clamp(input.consistency ?? 5, 0, 10) * 10) / 10;

  const overall = Math.round((sleep * 0.3 + nutrition * 0.3 + activity * 0.2 + consistency * 0.2) * 10) / 10;

  return {
    sleepScore: sleep,
    nutritionScore: nutrition,
    activityScore: activity,
    consistencyScore: consistency,
    overall,
    trend: "unknown",
    notes: [
      {
        text: "These indicators describe habits associated with healthy development. They do not predict how many centimeters you will gain.",
        tier: "evidence-backed",
        sourceKey: "aap_growth",
      },
      {
        text: "Consistent, sufficient sleep supports overall development.",
        tier: "evidence-backed",
        sourceKey: "cdc_sleep",
      },
      {
        text: "Regular physical activity is recommended for young people.",
        tier: "evidence-backed",
        sourceKey: "cdc_youth_activity",
      },
    ],
  };
}

/** Evidence-tagged nutrition plan using real foods; never a restrictive diet. */
export function buildNutritionPlan(profile: Profile): NutritionPlan {
  const minorMode = isMinor(profile.ageYears);
  return {
    headline: minorMode
      ? "A plan to support healthy development — real food, no restriction."
      : "A balanced plan built on whole foods.",
    disclaimer: minorMode
      ? "This plan supports healthy development. It is not a weight-loss or calorie-restriction plan, and it does not predict height. If you have any medical condition, talk to a healthcare professional."
      : "General guidance based on public-health recommendations. Not medical advice; adapt to your own needs and any medical conditions.",
    minorMode,
    priorities: [
      { nutrient: "Protein", why: "Supports growth and repair.", tier: "evidence-backed", sourceKey: "efsa_protein" },
      { nutrient: "Calcium", why: "Supports bone development.", tier: "evidence-backed", sourceKey: "nih_calcium" },
      { nutrient: "Vitamin D", why: "Works with calcium for bone health.", tier: "evidence-backed", sourceKey: "nih_vitamin_d" },
      { nutrient: "Iron", why: "Supports energy and oxygen transport.", tier: "evidence-backed", sourceKey: "nih_iron" },
      { nutrient: "Fruit & vegetables", why: "Micronutrients and fiber.", tier: "evidence-backed", sourceKey: "who_healthy_diet" },
      { nutrient: "Whole grains & starches", why: "Steady energy for active days.", tier: "evidence-backed", sourceKey: "who_healthy_diet" },
      { nutrient: "Healthy fats", why: "Support hormones and absorption.", tier: "evidence-backed", sourceKey: "who_healthy_diet" },
      { nutrient: "Hydration", why: "Supports focus and skin.", tier: "plausible" },
    ],
    meals: [
      { name: "Breakfast", items: ["Greek yogurt", "Oats", "Banana", "Nuts"] },
      { name: "Lunch", items: ["Chicken", "Rice", "Vegetables", "Olive oil", "Fruit"] },
      { name: "Dinner", items: ["Eggs / fish / meat / legumes", "Potatoes or rice", "Vegetables", "Dairy"] },
    ],
  };
}
