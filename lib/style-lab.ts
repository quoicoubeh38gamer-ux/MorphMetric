import type { FaceMetricsRaw, FaceReport } from "./ai/types";

/**
 * Style Lab.
 *
 * This is guidance, not a render: we do not paste hair onto your photo, because
 * a fake preview would be the least honest thing in the product. Instead each
 * idea is derived from a measurement you can check yourself, framed as
 * something to try. Nothing here treats a natural feature as a defect.
 */
export type StyleCategory = "Hair" | "Facial hair" | "Glasses" | "Lighting" | "Photography";

export interface StyleIdea {
  id: string;
  category: StyleCategory;
  title: string;
  /** The measurement this came from — always shown, so it is never arbitrary. */
  why: string;
  how: string;
  /** True when it applies to everyone rather than being measurement-driven. */
  universal?: boolean;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

function fromMetrics(m: FaceMetricsRaw): StyleIdea[] {
  const out: StyleIdea[] = [];

  // --- width-to-height -----------------------------------------------------
  if (m.fwhr > 2.0) {
    out.push({
      id: "hair-height",
      category: "Hair",
      title: "Try height on top, tighter at the sides",
      why: `Your width-to-height measured ${m.fwhr.toFixed(2)} against a reference of 1.8–2.0 — a comparatively wide read.`,
      how: "Shapes with vertical lift and less bulk above the ears lengthen the frame. Ask for weight removed from the sides rather than adding product on top.",
    });
    out.push({
      id: "glasses-narrow",
      category: "Glasses",
      title: "Frames no wider than your face",
      why: `With a fWHR of ${m.fwhr.toFixed(2)}, frames that extend past the cheekbones add to the widest measurement.`,
      how: "Look for rectangular or soft-square frames whose outer edge lines up with the edge of your face, not beyond it.",
    });
  } else if (m.fwhr < 1.8) {
    out.push({
      id: "hair-width",
      category: "Hair",
      title: "Try width at the sides rather than height",
      why: `Your width-to-height measured ${m.fwhr.toFixed(2)} against a reference of 1.8–2.0 — a comparatively narrow read.`,
      how: "Shapes that keep some volume around the temples balance the frame. Very tall, flat-sided cuts will push it further.",
    });
    out.push({
      id: "glasses-wide",
      category: "Glasses",
      title: "Slightly wider, horizontal frames",
      why: `A fWHR of ${m.fwhr.toFixed(2)} means horizontal lines read well against your proportions.`,
      how: "Wayfarer-style or wider rectangular frames add a horizontal accent across the mid-face.",
    });
  }

  // --- vertical thirds -----------------------------------------------------
  if (m.thirdsUpper > 0.36) {
    out.push({
      id: "hair-fringe",
      category: "Hair",
      title: "A textured fringe is worth testing",
      why: `Your upper third measured ${pct(m.thirdsUpper)} of face height against a reference of ~33%.`,
      how: "Bringing hair forward shortens the visible forehead and evens the three bands. Textured beats a blunt straight line for most people.",
    });
  }
  if (m.thirdsLower > 0.36) {
    out.push({
      id: "beard-short",
      category: "Facial hair",
      title: "Keep length off the chin (if you grow facial hair)",
      why: `Your lower third measured ${pct(m.thirdsLower)} against a reference of ~33% — the longest of your three bands.`,
      how: "Stubble or a short, squared-off shape keeps the band where it is. Length below the chin extends it further.",
    });
  } else if (m.thirdsLower < 0.30) {
    out.push({
      id: "beard-length",
      category: "Facial hair",
      title: "A little length at the chin (if you grow facial hair)",
      why: `Your lower third measured ${pct(m.thirdsLower)} against a reference of ~33% — the shortest of your three bands.`,
      how: "A slightly fuller chin and a clean, higher cheek line lengthens the lower band without widening it.",
    });
  }

  // --- jaw -----------------------------------------------------------------
  if (m.jawWidthRatio < 0.70) {
    out.push({
      id: "beard-angle",
      category: "Facial hair",
      title: "Define the jaw angle rather than the chin",
      why: `Your bigonial width measured ${pct(m.jawWidthRatio)} of face width against a reference of ~75%.`,
      how: "Keeping stubble denser toward the jaw angles and cleaner under the chin emphasises the corner of the jaw. Posture — chin slightly forward and down — does more than any product.",
    });
  } else if (m.jawWidthRatio > 0.82) {
    out.push({
      id: "hair-tight-sides",
      category: "Hair",
      title: "Balance a strong jaw with a softer top",
      why: `Your bigonial width measured ${pct(m.jawWidthRatio)} of face width against a reference of ~75% — a wide, defined read.`,
      how: "Softer, less severe shapes up top stop the overall silhouette reading as purely rectangular. This is a balance choice, not a correction.",
    });
  }

  // --- eye spacing ---------------------------------------------------------
  if (m.interocularRatio > 1.12) {
    out.push({
      id: "glasses-bridge-bold",
      category: "Glasses",
      title: "Frames with a visible bridge",
      why: `Your eye spacing measured ${m.interocularRatio.toFixed(2)}× one eye-width against a reference of ~1.0×.`,
      how: "A darker or double bridge draws the eye toward the centre. A clear or very thin bridge does the opposite.",
    });
  } else if (m.interocularRatio < 0.9) {
    out.push({
      id: "glasses-bridge-clear",
      category: "Glasses",
      title: "Clear or thin bridge, wider frame",
      why: `Your eye spacing measured ${m.interocularRatio.toFixed(2)}× one eye-width against a reference of ~1.0×.`,
      how: "Keeping the centre of the frame visually light opens the space between the eyes.",
    });
  }

  // --- symmetry presentation ----------------------------------------------
  if (m.symmetryDevPct > 3) {
    out.push({
      id: "light-flat",
      category: "Lighting",
      title: "Use flat, frontal light",
      why: `Your midline deviation measured ${m.symmetryDevPct.toFixed(1)}% against a reference of under 3%.`,
      how: "Side light casts a shadow down one half and exaggerates any difference. A large, soft source directly in front — a window you face, not one beside you — flattens it out.",
    });
  }

  return out;
}

const UNIVERSAL: StyleIdea[] = [
  {
    id: "photo-distance",
    category: "Photography",
    title: "Step back and zoom in",
    why: "Close-range lenses enlarge whatever is nearest the camera — usually the nose — by a large margin.",
    how: "Stand two to three metres away and zoom, or use the 2× lens. This single change alters how a face reads more than most styling decisions.",
    universal: true,
  },
  {
    id: "photo-height",
    category: "Photography",
    title: "Camera at or just above eye level",
    why: "Camera height changes the apparent length of the lower third and the jaw line.",
    how: "Below eye level lengthens the jaw and nostrils; far above shrinks the lower face. Eye level is the neutral, honest baseline — use it for your tracking photos so scans stay comparable.",
    universal: true,
  },
  {
    id: "light-window",
    category: "Lighting",
    title: "Face a window, an hour after sunrise or before sunset",
    why: "Soft, slightly-above-eye-level light gives natural definition without harsh shadow.",
    how: "Overhead midday light drops shadows into the eye sockets and under the nose. Direct flash flattens texture and colour entirely.",
    universal: true,
  },
  {
    id: "photo-expression",
    category: "Photography",
    title: "Test neutral against a slight smile",
    why: "Expression changes mouth width, eye aperture and cheek position — all things this app measures.",
    how: "Take one of each in the same light and compare. Keep whichever you prefer, but use the same one every time you re-scan so your history tracks you and not your mood.",
    universal: true,
  },
];

export function buildStyleIdeas(report: FaceReport | null): StyleIdea[] {
  const measured = report?.metricsRaw ? fromMetrics(report.metricsRaw) : [];
  return [...measured, ...UNIVERSAL];
}

export const STYLE_CATEGORIES: StyleCategory[] = [
  "Hair",
  "Facial hair",
  "Glasses",
  "Lighting",
  "Photography",
];
