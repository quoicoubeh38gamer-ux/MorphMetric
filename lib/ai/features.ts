import type {
  Confidence,
  FaceMetricsRaw,
  FeatureImprovement,
  FeatureKey,
  SubMetric,
} from "./types";

export interface FeatureMeta {
  label: string;
  category: string;
  weight: number; // contribution to the overall morph score
  baseConfidence: Confidence; // how reliably a 2D photo estimates this
  center: number; // heuristic-fallback score center (no real landmarks)
  spread: number; // heuristic-fallback spread
  whyItMatters: string;
  anatomy: string; // the underlying anatomy, in plain terms
  detail: string; // a deeper, honest explanation of what drives the score
  improve: FeatureImprovement[]; // what genuinely helps, evidence-tagged
  fixed: string[]; // structure a photo/app can't change
  myths: string[]; // popular but unsupported claims — flagged honestly
}

/**
 * Per-feature metadata + honest, specific, anatomy-grounded content.
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
    whyItMatters: "Left–right balance is one of the most visible things in a photo and anchors first impressions.",
    anatomy:
      "Symmetry compares paired structures across the facial midline: the two orbits (eye sockets), zygomatic bones (cheekbones), the nasal axis, and the mandible (jaw). Perfect symmetry doesn't exist — everyone is slightly asymmetric.",
    detail:
      "We mirror your 468-point mesh across the vertical midline and measure how far matching landmarks drift apart. Small deviations (under ~3%) are completely normal and barely perceptible. Larger ones are often exaggerated by head tilt and side lighting rather than true bone asymmetry — which is why presentation matters so much here.",
    improve: [
      { text: "Shoot straight-on with soft, even lighting — side light exaggerates asymmetry.", tier: "plausible" },
      { text: "Level your head and fix posture; a tilted head reads as less symmetric.", tier: "plausible", sourceKey: "posture_general" },
      { text: "Keep your styling even on both sides (hairline, brows, beard).", tier: "plausible" },
      { text: "Sleep on your back if you can — chronic one-side pressure can add mild puffiness asymmetry.", tier: "plausible", sourceKey: "cdc_sleep" },
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
    whyItMatters: "The balance of the facial thirds and width-to-height shapes overall harmony more than any single feature.",
    anatomy:
      "The classic canon divides the face into equal vertical thirds — hairline→brow, brow→nose-base, nose-base→chin — and reads horizontal balance through the fWHR (bizygomatic width ÷ upper-face height).",
    detail:
      "Proportion is about relationships, not any one measurement. A longer lower third, a wide fWHR or a tall forehead all shift how 'balanced' a face reads. Most of this is skeletal and genetic — but framing (hair, facial hair, camera height) genuinely changes the perceived ratios, which is the lever you actually own.",
    improve: [
      { text: "Hairstyle & framing that balances forehead vs jaw — the biggest lever you actually control.", tier: "plausible" },
      { text: "Shape stubble/beard to balance the lower third (if applicable).", tier: "plausible" },
      { text: "Camera at eye level, slight distance — avoids the wide-angle distortion that skews proportions.", tier: "plausible" },
      { text: "Lower body-fat (healthily) refines mid-face fullness and sharpens perceived proportions.", tier: "evidence-backed", sourceKey: "who_healthy_diet" },
    ],
    fixed: ["Skull and facial-thirds ratios are largely genetic and set after growth."],
    myths: ["'Mewing' to change adult facial thirds — not supported by evidence."],
  },
  eyes: {
    label: "Eye area",
    category: "Features",
    weight: 1.0,
    baseConfidence: "high",
    center: 13.5,
    spread: 5.5,
    whyItMatters: "The eye area draws attention first and reads clearly in 2D — canthal tilt and spacing especially.",
    anatomy:
      "The eye region is framed by the orbital bones, the medial and lateral canthi (inner/outer corners), the upper-eyelid platform and the periorbital skin. Canthal tilt is the angle from the inner corner up to the outer corner.",
    detail:
      "We read two geometric signals: canthal tilt (a slight upward tilt of +3–8° is what people call 'hunter eyes') and eye spacing (the canon is roughly one eye-width apart). The bone frame is fixed, but the periorbital skin — dark circles, puffiness, hollowing — is strongly habit-driven and is where real, visible change happens.",
    improve: [
      { text: "Consistent 7–9h sleep reduces under-eye puffiness and darkness for many people.", tier: "evidence-backed", sourceKey: "cdc_sleep" },
      { text: "Hydrate and manage allergies — they worsen under-eye shadows.", tier: "plausible" },
      { text: "Daily SPF around the eyes slows crepey skin and pigmentation.", tier: "evidence-backed", sourceKey: "nhs_sunscreen" },
      { text: "Shape your brows to frame the eyes and open the upper-eyelid area.", tier: "plausible" },
    ],
    fixed: ["Eye socket shape, canthal tilt and eye spacing are structural."],
    myths: ["Eye 'exercises' to change eye shape or lift the canthal tilt — no evidence."],
  },
  brows: {
    label: "Eyebrows",
    category: "Features",
    weight: 0.8,
    baseConfidence: "high",
    center: 12.5,
    spread: 6,
    whyItMatters: "Brow shape frames the eyes and is one of the highest-return, most controllable features on the whole face.",
    anatomy:
      "Brows sit on the supraorbital ridge (brow bone). Their arch, thickness and the space between them frame the orbit. Hair density and growth direction are genetic; shape and upkeep are not.",
    detail:
      "Unlike bone, brows are almost entirely in your control. Shape, tidy strays, brush the hairs up and fill sparse gaps and you meaningfully change how the eyes and upper face read — with no permanent commitment. This is one of the fastest visible wins in the whole app.",
    improve: [
      { text: "Shape and trim your brows to frame the eyes — high return, fully in your control.", tier: "plausible" },
      { text: "Lightly fill sparse spots if you want more definition.", tier: "plausible" },
      { text: "Brush brows up and set them with a clear gel.", tier: "plausible" },
      { text: "Leave a little more natural thickness — over-plucking ages the eye area.", tier: "plausible" },
    ],
    fixed: ["Natural hair density, growth direction and brow-bone position."],
    myths: ["Shaving to make brows 'grow back thicker' — it doesn't change density."],
  },
  nose: {
    label: "Nose",
    category: "Features",
    weight: 0.9,
    baseConfidence: "medium",
    center: 12.5,
    spread: 5,
    whyItMatters: "The nose sits at the center of the face, so its width and projection strongly affect balance.",
    anatomy:
      "The upper nose is bone (nasal bones); the lower two-thirds — bridge, tip and nostrils (alae) — are cartilage. We can read alar (nostril) width in 2D, but bridge height and tip projection are depth features a flat photo estimates poorly.",
    detail:
      "We measure nasal base width against face width (the canon puts it near the inter-eye distance). Projection, a dorsal hump or tip shape need depth or profile views we don't assume from one frontal photo — so we flag them as estimated rather than pretending to score them precisely. Angle and lighting change how the nose reads dramatically.",
    improve: [
      { text: "Camera angle & height change how the nose reads — raise the camera slightly.", tier: "plausible" },
      { text: "Soft, even, front lighting reduces harsh shadows across the bridge.", tier: "plausible" },
      { text: "A balancing hairstyle/beard shifts attention across the whole face.", tier: "plausible" },
    ],
    fixed: ["Nasal bone & cartilage structure — only rhinoplasty changes it, a medical decision."],
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
    whyItMatters: "Mouth width and lip balance drive lower-third harmony and how expressions read.",
    anatomy:
      "The lips are the vermilion (the reddish border), framed by the corners (commissures) and the philtrum above. Width is the corner-to-corner span; fullness is the vertical vermilion height of the upper and lower lip.",
    detail:
      "We read mouth width against face width (the canon is roughly 1.5× the inter-eye distance). Vermilion fullness is hard to judge reliably from one flat image, so it's flagged as estimated. Volume is genetic — but hydration, sun protection and texture care make a real, visible difference to how healthy the lips look.",
    improve: [
      { text: "Hydrate and use a daily lip balm with SPF.", tier: "evidence-backed", sourceKey: "nhs_sunscreen" },
      { text: "Gentle exfoliation for smoother texture.", tier: "plausible" },
      { text: "Treat mouth-breathing / chronic dryness at the source.", tier: "plausible" },
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
    whyItMatters: "Lower-face definition strongly affects perceived structure — but a single 2D photo estimates it poorly.",
    anatomy:
      "The lower face is the mandible: the bigonial width (distance across the jaw angles / gonions), the gonial angle, ramus height and the chin (mentum). Over it sits the buccal fat and submental (under-chin) soft tissue that body-fat and puffiness change.",
    detail:
      "We read bigonial width vs face width and lower-third height. Two things drive how the jaw looks: the bone (fixed after growth) and the soft tissue over it (very much not). Lower body-fat, better sleep and less puffiness sharpen the jaw meaningfully; the only reliable way to change the bone itself is orthodontic / maxillofacial care — a medical route, not an app one.",
    improve: [
      { text: "Lower overall body-fat through healthy habits — the single biggest REAL change to lower-face definition.", tier: "evidence-backed", sourceKey: "who_healthy_diet" },
      { text: "Reduce puffiness: consistent sleep, hydration, less excess salt and alcohol.", tier: "evidence-backed", sourceKey: "cdc_sleep" },
      { text: "Posture (chin up and slightly forward) and better photo angles.", tier: "plausible", sourceKey: "posture_general" },
      { text: "The only reliable STRUCTURAL change is orthodontic/maxillofacial care — a medical decision, not an app one.", tier: "evidence-backed", sourceKey: "nhs_orthodontics" },
    ],
    fixed: ["Jaw bone size, gonial angle and chin projection are set after growth — exercises can't change bone."],
    myths: [
      "'Mewing' (tongue posture) to grow or reshape the adult jaw — not supported by evidence.",
      "'Bone smashing' — dangerous, no evidence; can cause fractures and nerve damage.",
      "Jaw-exerciser / 'jawzrsize' gadgets that claim to 'grow bone' — they work the muscle at most, and can strain the jaw joint.",
    ],
  },
  skin: {
    label: "Skin",
    category: "Surface",
    weight: 1.0,
    baseConfidence: "high",
    center: 13.5,
    spread: 5.5,
    whyItMatters: "Skin evenness is one of the most controllable and highest-impact visible factors at any age.",
    anatomy:
      "Skin is a surface, not geometry: tone evenness, texture, pores, blemishes and under-eye area. It's read from color and light rather than landmarks, so photo lighting influences it heavily.",
    detail:
      "This is where consistent habits pay off the most. A simple routine — gentle cleanser, moisturizer, daily SPF — plus sleep and hydration improves evenness for most people within weeks. Persistent acne is very treatable; a professional beats any gadget or 'detox'.",
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

/**
 * Describes where a measurement sits relative to its reference range. Framed as
 * an observation about this image, never as a judgement about the person.
 */
export function summaryFor(key: FeatureKey, score: number): string {
  const noun = FEATURE_META[key].label.toLowerCase();
  if (score >= 15.5)
    return `In this image, your ${noun} measures within the reference range across the characteristics we can assess.`;
  if (score >= 12.5)
    return `In this image, your ${noun} measures close to the reference range.`;
  if (score >= 9)
    return `In this image, one or more ${noun} measurements sit outside the reference range — a useful place to focus what you can influence.`;
  return `In this image, several ${noun} measurements sit well outside the reference range. Note that reference ranges are a coordinate system, not a target everyone should meet.`;
}

// --- Precise per-region sub-scores -----------------------------------------

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const near = (v: number, ideal: number, tol: number) => clamp01(1 - Math.abs(v - ideal) / tol);
const band = (v: number, lo: number, hi: number, tol: number) =>
  v >= lo && v <= hi ? 1 : clamp01(1 - (v < lo ? lo - v : v - hi) / tol);
const sc = (prox: number) => Math.round((2 + prox * 18) * 10) / 10;
const pc = (n: number) => `${Math.round(n * 100)}%`;

/**
 * Build the precise sub-metric breakdown for a feature. Where real 468-point
 * geometry exists (`m`), each dimension gets a measured value + precise score;
 * dimensions that a single 2D photo can't judge (depth, fullness, surface) are
 * returned as estimated (measured:false) and inherit the feature score.
 */
export function buildSubMetrics(
  key: FeatureKey,
  featureScore: number,
  m?: FaceMetricsRaw,
): SubMetric[] {
  const est = (k: string, label: string, note: string, ideal = "—"): SubMetric => ({
    key: k,
    label,
    value: "—",
    ideal,
    score: featureScore,
    note,
    measured: false,
  });

  if (!m) {
    // Heuristic fallback (no real face): expose the dimensions we look at.
    switch (key) {
      case "symmetry":
        return [est("sym", "Midline balance", "Balance of paired landmarks across the facial midline.", "<3%")];
      case "proportions":
        return [est("thirds", "Facial thirds", "Hairline→brow→nose→chin split into equal thirds.", "33/33/33")];
      case "eyes":
        return [est("tilt", "Canthal tilt", "Angle from inner to outer eye corner.", "+3–8°")];
      case "nose":
        return [est("nosew", "Nasal base width", "Nostril width vs face width.", "~25%")];
      case "lips":
        return [est("mouthw", "Mouth width", "Corner-to-corner width vs face width.", "~46%")];
      case "jaw":
        return [est("jaww", "Bigonial width", "Jaw-angle width vs face width.", "~75%")];
      default:
        return [];
    }
  }

  switch (key) {
    case "symmetry": {
      const prox = clamp01(1 - m.symmetryDevPct / 6);
      return [
        {
          key: "sym-dev",
          label: "Midline balance",
          value: `${m.symmetryDevPct.toFixed(1)}%`,
          ideal: "<3%",
          score: sc(prox),
          note: "How far paired landmarks (eyes, brows, mouth corners) drift from a perfect mirror across the midline.",
          measured: true,
        },
      ];
    }
    case "proportions": {
      const dev = Math.max(
        Math.abs(m.thirdsUpper - 1 / 3),
        Math.abs(m.thirdsMid - 1 / 3),
        Math.abs(m.thirdsLower - 1 / 3),
      );
      return [
        {
          key: "thirds",
          label: "Facial thirds",
          value: `${pc(m.thirdsUpper)} · ${pc(m.thirdsMid)} · ${pc(m.thirdsLower)}`,
          ideal: "33 / 33 / 33",
          score: sc(clamp01(1 - dev / 0.12)),
          note: "Hairline→brow, brow→nose-base, nose-base→chin. The canon splits these into equal thirds.",
          measured: true,
        },
        {
          key: "fwhr",
          label: "Width-to-height (fWHR)",
          value: m.fwhr.toFixed(2),
          ideal: "1.8–2.0",
          score: sc(band(m.fwhr, 1.8, 2.0, 0.5)),
          note: "Cheekbone-to-cheekbone width ÷ upper-face height.",
          measured: true,
        },
      ];
    }
    case "eyes":
      return [
        {
          key: "canthal",
          label: "Canthal tilt",
          value: `${m.canthalTiltDeg > 0 ? "+" : ""}${m.canthalTiltDeg.toFixed(1)}°`,
          ideal: "+3–8°",
          score: sc(band(m.canthalTiltDeg, 3, 8, 6)),
          note: "Angle from the inner corner up to the outer corner — a slight positive tilt is 'hunter eyes'.",
          measured: true,
        },
        {
          key: "interocular",
          label: "Eye spacing",
          value: `${m.interocularRatio.toFixed(2)}×`,
          ideal: "~1.0×",
          score: sc(near(m.interocularRatio, 1.0, 0.35)),
          note: "Gap between the eyes vs one eye-width. The canon is about one eye-width apart.",
          measured: true,
        },
      ];
    case "brows":
      return [
        est(
          "brow-frame",
          "Brow framing",
          "Arch, thickness and spacing over the brow bone. Shape is highly controllable; the bony ridge is structural.",
          "even & defined",
        ),
      ];
    case "nose":
      return [
        {
          key: "nose-width",
          label: "Nasal base width",
          value: pc(m.noseWidthRatio),
          ideal: "~25% of face",
          score: sc(near(m.noseWidthRatio, 0.25, 0.12)),
          note: "Width across the nostrils (alar base) vs face width; the canon ≈ the inter-eye distance.",
          measured: true,
        },
        est(
          "nose-proj",
          "Projection & bridge",
          "Dorsal hump and tip projection are depth features a single frontal photo can't measure reliably.",
        ),
      ];
    case "lips":
      return [
        {
          key: "mouth-width",
          label: "Mouth width",
          value: pc(m.mouthWidthRatio),
          ideal: "~46% (≈1.5× inter-eye)",
          score: sc(near(m.mouthWidthRatio, 0.46, 0.14)),
          note: "Corner-to-corner (commissure) width vs face width.",
          measured: true,
        },
        est(
          "lip-fullness",
          "Vermilion fullness",
          "Upper/lower lip volume — not reliably read from a single flat, front-lit image.",
        ),
      ];
    case "jaw":
      return [
        {
          key: "jaw-width",
          label: "Bigonial width",
          value: pc(m.jawWidthRatio),
          ideal: "~75% of face",
          score: sc(near(m.jawWidthRatio, 0.75, 0.18)),
          note: "Width across the jaw angles (gonions) vs face width; drives lower-face taper.",
          measured: true,
        },
        {
          key: "jaw-lower",
          label: "Lower-third height",
          value: pc(m.thirdsLower),
          ideal: "~33%",
          score: sc(near(m.thirdsLower, 1 / 3, 0.1)),
          note: "Nose-base to chin (mandibular height) as a share of face height.",
          measured: true,
        },
      ];
    case "skin":
      return [
        est(
          "skin-surface",
          "Evenness & clarity",
          "Skin is a surface property (tone, texture, blemishes), not geometry — and it depends heavily on photo lighting.",
          "even & clear",
        ),
      ];
    default:
      return [];
  }
}
