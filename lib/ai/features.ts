import type { Confidence, FeatureImprovement, FeatureKey } from "./types";

export interface FeatureMeta {
  label: string;
  category: string;
  weight: number; // contribution to the overall morph score
  baseConfidence: Confidence; // how reliably a 2D photo estimates this
  center: number; // heuristic-fallback score center (no real landmarks)
  spread: number; // heuristic-fallback spread
  whyItMatters: string;
  improve: FeatureImprovement[]; // what genuinely helps, evidence-tagged
  fixed: string[]; // structure a photo/app can't change
  myths: string[]; // popular but unsupported claims — flagged honestly
}

/**
 * Per-feature metadata + honest, specific content.
 *
 * `improve` lists real, evidence-tagged levers. `fixed` is what's structural.
 * `myths` calls out popular looksmaxxing claims that lack evidence (or are
 * harmful) — this is deliberate: a credible tool tells you what actually works
 * and what to skip, instead of selling impossible "bone growth".
 */
export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  symmetry: {
    label: "Facial symmetry",
    category: "Structure",
    weight: 1.2,
    baseConfidence: "high",
    center: 13,
    spread: 6,
    whyItMatters: "Left–right balance is one of the most visible things in a photo.",
    improve: [
      { text: "Shoot straight-on with soft, even lighting — side light exaggerates asymmetry.", tier: "plausible" },
      { text: "Level your head and fix posture; a tilted head reads as less symmetric.", tier: "plausible", sourceKey: "posture_general" },
      { text: "Keep grooming even on both sides (hairline, brows, beard).", tier: "plausible" },
    ],
    fixed: ["Underlying bone asymmetry is set after you finish growing."],
    myths: [
      "'Bone smashing' / tapping your face to fix symmetry — no evidence and a real injury risk.",
      "Chewing hard on one side for hours to 'even out' the face — unsupported.",
    ],
  },
  proportions: {
    label: "Facial proportions",
    category: "Structure",
    weight: 1.1,
    baseConfidence: "medium",
    center: 12.5,
    spread: 6,
    whyItMatters: "The balance of the facial thirds and fifths shapes overall harmony.",
    improve: [
      { text: "Hairstyle & framing that balances forehead vs jaw — the biggest lever you actually control.", tier: "plausible" },
      { text: "Shape stubble/beard to balance the lower third (if applicable).", tier: "plausible" },
      { text: "Camera at eye level, slight distance — avoids the distortion that skews proportions.", tier: "plausible" },
    ],
    fixed: ["Skull and facial-thirds ratios are largely genetic."],
    myths: ["'Mewing' to change adult facial thirds — not supported by evidence."],
  },
  eyes: {
    label: "Eye area",
    category: "Features",
    weight: 1.0,
    baseConfidence: "high",
    center: 13.5,
    spread: 5.5,
    whyItMatters: "The eye area draws attention first and reads clearly in 2D.",
    improve: [
      { text: "Consistent 7–9h sleep reduces under-eye puffiness and darkness for many people.", tier: "evidence-backed", sourceKey: "cdc_sleep" },
      { text: "Hydrate and manage allergies — they worsen under-eye shadows.", tier: "plausible" },
      { text: "Groom and shape your brows to frame the eyes.", tier: "plausible" },
    ],
    fixed: ["Eye socket shape and eye spacing are structural."],
    myths: ["Eye 'exercises' to change eye shape — no evidence."],
  },
  brows: {
    label: "Eyebrows",
    category: "Features",
    weight: 0.8,
    baseConfidence: "high",
    center: 12.5,
    spread: 6,
    whyItMatters: "Brow shape frames the eyes and is one of the most controllable features.",
    improve: [
      { text: "Shape and trim your brows to frame the eyes — high return, fully in your control.", tier: "plausible" },
      { text: "Lightly fill sparse spots if you want more definition.", tier: "plausible" },
      { text: "Brush brows up and set them.", tier: "plausible" },
    ],
    fixed: ["Natural hair density and growth pattern."],
    myths: ["Shaving to make brows 'grow back thicker' — it doesn't change density."],
  },
  nose: {
    label: "Nose",
    category: "Features",
    weight: 0.9,
    baseConfidence: "medium",
    center: 12.5,
    spread: 5,
    whyItMatters: "Nose proportions read very differently depending on angle and lighting.",
    improve: [
      { text: "Camera angle & height change how the nose reads — raise the camera slightly.", tier: "plausible" },
      { text: "Soft, even lighting reduces harsh shadows across the nose.", tier: "plausible" },
    ],
    fixed: ["Nasal bone & cartilage structure."],
    myths: [
      "Nose 'exercises' or clips to reshape the nose — no evidence.",
      "Taping the nose to slim it — no lasting effect.",
    ],
  },
  lips: {
    label: "Lips",
    category: "Features",
    weight: 0.8,
    baseConfidence: "high",
    center: 12.5,
    spread: 5.5,
    whyItMatters: "Lip balance contributes to lower-third harmony.",
    improve: [
      { text: "Hydrate and use a daily lip balm with SPF.", tier: "evidence-backed", sourceKey: "nhs_sunscreen" },
      { text: "Gentle exfoliation for smoother texture.", tier: "plausible" },
    ],
    fixed: ["Natural lip volume and shape."],
    myths: ["Suction 'plumpers' — temporary swelling and injury risk, not real change."],
  },
  jaw: {
    label: "Jaw / lower face",
    category: "Structure",
    weight: 1.0,
    baseConfidence: "low",
    center: 12,
    spread: 6,
    whyItMatters: "Lower-face definition affects perceived structure — but a 2D photo estimates it poorly.",
    improve: [
      { text: "Lower overall body-fat through healthy habits — the single biggest REAL change to lower-face definition.", tier: "evidence-backed", sourceKey: "who_healthy_diet" },
      { text: "Reduce puffiness: consistent sleep, hydration, less excess salt.", tier: "evidence-backed", sourceKey: "cdc_sleep" },
      { text: "Posture (chin up and slightly forward) and better photo angles.", tier: "plausible", sourceKey: "posture_general" },
      { text: "The only reliable STRUCTURAL change is orthodontic/maxillofacial care — a medical decision, not an app one.", tier: "evidence-backed", sourceKey: "nhs_orthodontics" },
    ],
    fixed: ["Jaw bone size and shape are set after growth — exercises can't change bone."],
    myths: [
      "'Mewing' (tongue posture) to grow or reshape the adult jaw — not supported by evidence.",
      "'Bone smashing' — dangerous, no evidence; can cause fractures and nerve damage.",
      "Jaw-exerciser gadgets that claim to 'grow bone' — they work the muscle at most.",
    ],
  },
  skin: {
    label: "Skin",
    category: "Surface",
    weight: 1.0,
    baseConfidence: "high",
    center: 13.5,
    spread: 5.5,
    whyItMatters: "Skin evenness is one of the most controllable visible factors.",
    improve: [
      { text: "Simple daily routine: gentle cleanser, moisturizer, and SPF each morning.", tier: "evidence-backed", sourceKey: "nhs_skincare" },
      { text: "Daily sunscreen is the highest-return step for evenness and aging.", tier: "evidence-backed", sourceKey: "nhs_sunscreen" },
      { text: "Consistent sleep and hydration.", tier: "evidence-backed", sourceKey: "cdc_sleep" },
      { text: "See a professional for persistent acne — it's very treatable.", tier: "evidence-backed", sourceKey: "nhs_skincare" },
    ],
    fixed: ["Genetic skin type and pore size."],
    myths: [
      "'Detox' diets to clear skin — not evidence-based.",
      "Scrubbing hard to fix acne — it makes it worse.",
    ],
  },
};

/** Direct, honest, non-shaming summary keyed to the score band. */
export function summaryFor(key: FeatureKey, score: number): string {
  const noun = FEATURE_META[key].label.toLowerCase();
  if (score >= 15.5) return `Your ${noun} appears well balanced in this image and reads as a current strength.`;
  if (score >= 12.5) return `Your ${noun} appears relatively balanced in this image.`;
  if (score >= 9) return `Your ${noun} reads as somewhat off-balance in this image — a solid area to work on.`;
  return `Your ${noun} reads as clearly off-balance in this image — worth making a priority.`;
}
