import type { Controllability, EvidenceTier, FeatureKey, FeatureScore, Profile, Recommendation } from "./types";

interface RecoTemplate {
  domain: string;
  title: string;
  body: string;
  controllability: Controllability;
  tier: EvidenceTier;
  sourceKey?: string;
}

/**
 * Maps each feature to the most impactful *controllable* action.
 *
 * Every template only recommends things the user can actually influence, tagged
 * with an evidence tier and (where relevant) a source. Nothing here promises to
 * change bone structure.
 */
const RECO_TEMPLATES: Record<FeatureKey, RecoTemplate> = {
  proportions: {
    domain: "Hair",
    title: "Try a hairstyle that complements your face proportions",
    body: "Framing changes perceived facial thirds more than almost anything else you control. A cut that balances your forehead and jaw can shift overall harmony.",
    controllability: "controllable",
    tier: "plausible",
  },
  skin: {
    domain: "Skin",
    title: "Build a consistent basic skincare routine",
    body: "A simple, consistent routine — gentle cleanser, moisturizer, daily SPF — is one of the highest-return, best-evidenced things you can do for visible skin.",
    controllability: "controllable",
    tier: "evidence-backed",
    sourceKey: "nhs_skincare",
  },
  eyes: {
    domain: "Rest",
    title: "Protect the eye area with better sleep",
    body: "Consistent, sufficient sleep reduces under-eye puffiness and darkness for many people. It is controllable and well-evidenced for overall health.",
    controllability: "partial",
    tier: "evidence-backed",
    sourceKey: "cdc_sleep",
  },
  brows: {
    domain: "Grooming",
    title: "Shape and groom your eyebrows",
    body: "Light, consistent brow grooming frames the eyes and is fully within your control — no permanent change to natural density required.",
    controllability: "controllable",
    tier: "plausible",
  },
  jaw: {
    domain: "Presentation",
    title: "Improve posture and photo angles",
    body: "Posture and camera angle change how the lower face presents in photos. The underlying jaw structure is fixed, but presentation is not.",
    controllability: "partial",
    tier: "plausible",
    sourceKey: "posture_general",
  },
  symmetry: {
    domain: "Photography",
    title: "Use straight-on angles and even lighting",
    body: "Head tilt and side lighting exaggerate asymmetry. A straight-to-camera angle with soft, even light presents balance more faithfully.",
    controllability: "controllable",
    tier: "plausible",
  },
  nose: {
    domain: "Photography",
    title: "Adjust angle and lighting for the nose",
    body: "Nose proportions read very differently by angle. Slightly raising the camera and softening light usually presents it more naturally. Structure itself is fixed.",
    controllability: "controllable",
    tier: "plausible",
  },
  lips: {
    domain: "Care",
    title: "Keep lips hydrated and cared for",
    body: "Hydration and basic lip care improve appearance and are fully controllable. Natural lip volume is not something to chase.",
    controllability: "controllable",
    tier: "plausible",
  },
};

/**
 * Build the roadmap: at most three prioritized, distinct-domain actions,
 * anchored on the lowest-scoring features (the biggest controllable upside).
 */
export function buildRoadmap(features: FeatureScore[], _profile: Profile): Recommendation[] {
  const ordered = [...features].sort((a, b) => a.score - b.score);
  const seenDomains = new Set<string>();
  const out: Recommendation[] = [];

  for (const f of ordered) {
    if (out.length >= 3) break;
    const tpl = RECO_TEMPLATES[f.key];
    if (seenDomains.has(tpl.domain)) continue;
    seenDomains.add(tpl.domain);
    out.push({
      id: `${f.key}-${out.length + 1}`,
      order: out.length + 1,
      domain: tpl.domain,
      title: tpl.title,
      body: tpl.body,
      controllability: tpl.controllability,
      tier: tpl.tier,
      sourceKey: tpl.sourceKey,
    });
  }

  // Guarantee a strong evidence-backed anchor is present.
  if (!out.some((r) => r.tier === "evidence-backed") && out.length > 0) {
    const skin = RECO_TEMPLATES.skin;
    out[out.length - 1] = {
      id: "skin-anchor",
      order: out.length,
      domain: skin.domain,
      title: skin.title,
      body: skin.body,
      controllability: skin.controllability,
      tier: skin.tier,
      sourceKey: skin.sourceKey,
    };
  }

  return out;
}
