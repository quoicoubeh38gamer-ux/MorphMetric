import type { EvidenceTier, FaceReport, GrowthInput } from "./types";

export interface PlanTask {
  id: string;
  text: string;
  tier?: EvidenceTier;
  sourceKey?: string;
}

export interface PlanWeek {
  week: number;
  title: string;
  focus: string;
  tasks: PlanTask[];
}

/**
 * A 4-week, controllable-only glow-up plan. Every task is something the user
 * can actually do; evidence-tagged where relevant. No structural promises.
 */
export function buildGlowUpPlan(report: FaceReport | null, _growth?: GrowthInput | null): PlanWeek[] {
  const male = false; // could read profile.sex later; keep neutral by default
  void male;
  void report;

  const t = (id: string, text: string, tier?: EvidenceTier, sourceKey?: string): PlanTask => ({
    id,
    text,
    tier,
    sourceKey,
  });

  return [
    {
      week: 1,
      title: "Foundations",
      focus: "Lock in the basics that move everything else.",
      tasks: [
        t("w1-skin", "Start a simple skincare routine: gentle cleanser, moisturizer, SPF each morning.", "evidence-backed", "nhs_skincare"),
        t("w1-sleep", "Set a consistent 7–9h sleep window and keep it.", "evidence-backed", "cdc_sleep"),
        t("w1-water", "Drink water steadily through the day.", "plausible"),
        t("w1-photo", "Take a clean baseline photo: straight-on, soft even light.", "plausible"),
      ],
    },
    {
      week: 2,
      title: "Framing & styling",
      focus: "Highest-return, fully-in-your-control changes.",
      tasks: [
        t("w2-brows", "Shape and tidy your eyebrows to frame the eyes.", "plausible"),
        t("w2-hair", "Try a hairstyle that balances your face proportions.", "plausible"),
        t("w2-facialhair", "Clean up / define facial hair along the jawline (if applicable).", "plausible"),
        t("w2-spf", "Daily SPF — don't skip it, even indoors near windows.", "evidence-backed", "nhs_sunscreen"),
      ],
    },
    {
      week: 3,
      title: "Habits that compound",
      focus: "The stuff that changes the lower face and skin over time.",
      tasks: [
        t("w3-protein", "Protein + fruit/veg at each main meal.", "evidence-backed", "who_healthy_diet"),
        t("w3-activity", "30–60 min of activity most days.", "evidence-backed", "cdc_youth_activity"),
        t("w3-salt", "Cut excess salt & late-night snacks — reduces facial puffiness.", "plausible"),
        t("w3-sleep", "Keep the sleep window locked in.", "evidence-backed", "cdc_sleep"),
      ],
    },
    {
      week: 4,
      title: "Presentation & review",
      focus: "Present what you've built — then measure it.",
      tasks: [
        t("w4-posture", "Practice posture: chin up and slightly forward.", "plausible", "posture_general"),
        t("w4-angles", "Learn your best angles (camera at or just above eye level).", "plausible"),
        t("w4-rescan", "Re-scan and compare your progress.", "plausible"),
        t("w4-next", "Pick your #1 area and go deeper next month.", "plausible"),
      ],
    },
  ];
}
