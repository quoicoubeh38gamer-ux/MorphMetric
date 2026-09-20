import { FEATURE_KEYS, type EvidenceTier, type FeatureKey } from "@/lib/ai/types";
import { FEATURE_META } from "@/lib/ai/features";
import { EVIDENCE_SOURCES } from "@/lib/ai/evidence";

/**
 * The Learn library.
 *
 * Two kinds of article live here. Region guides are generated from the same
 * FEATURE_META the analysis engine scores against — so the article and the
 * report can never drift apart or contradict each other. Method guides are
 * written by hand and explain how the product actually works.
 *
 * Nothing here is filler: every claim is either a measurement the engine takes,
 * a lever tagged with its evidence tier, or something we explicitly label as
 * unsupported.
 */

export type LearnCategory = "Facial regions" | "How it works" | "Using it well";

export interface LearnPoint {
  text: string;
  tier?: EvidenceTier;
  source?: { org: string; title: string; url: string };
}

export type LearnSection =
  | { kind: "prose"; heading: string; paragraphs: string[] }
  | { kind: "list"; heading: string; intro?: string; points: LearnPoint[] }
  | { kind: "measures"; heading: string; intro?: string; rows: { label: string; reference: string }[] }
  | { kind: "note"; heading: string; body: string };

export interface LearnArticle {
  slug: string;
  title: string;
  kicker: string;
  category: LearnCategory;
  readMinutes: number;
  featureKey?: FeatureKey;
  sections: LearnSection[];
}

/* -------------------------------------------------------------------------
   What the engine actually measures, per region. These mirror the reference
   values in lib/ai/features.ts — if one changes, change both.
------------------------------------------------------------------------- */
const MEASURES: Record<FeatureKey, { label: string; reference: string }[]> = {
  symmetry: [{ label: "Midline balance", reference: "under 3% drift" }],
  proportions: [
    { label: "Facial thirds", reference: "33 / 33 / 33" },
    { label: "Width-to-height (fWHR)", reference: "1.8 – 2.0" },
  ],
  eyes: [
    { label: "Canthal tilt", reference: "+3° to +8°" },
    { label: "Eye spacing (interocular)", reference: "about 1.0× one eye-width" },
  ],
  brows: [{ label: "Brow framing", reference: "even, defined, matched left to right" }],
  nose: [
    { label: "Nasal base width", reference: "about 25% of face width" },
    { label: "Nasal length", reference: "about 33% of face height" },
  ],
  lips: [
    { label: "Mouth width", reference: "about 46% of face width" },
    { label: "Upper : lower lip", reference: "about 1 : 1.6" },
  ],
  jaw: [
    { label: "Bigonial (jaw-angle) width", reference: "about 75% of face width" },
    { label: "Lower-third height", reference: "about 33% of face height" },
  ],
  skin: [{ label: "Evenness & clarity", reference: "a surface reading, heavily lighting-dependent" }],
};

const SLUG: Record<FeatureKey, string> = {
  symmetry: "facial-symmetry",
  proportions: "facial-proportions",
  eyes: "eye-area",
  brows: "eyebrows",
  nose: "nose",
  lips: "lips-and-mouth",
  jaw: "jawline-and-chin",
  skin: "skin",
};

const sourceFor = (key?: string) => {
  if (!key) return undefined;
  const s = EVIDENCE_SOURCES[key];
  return s ? { org: s.org, title: s.title, url: s.url } : undefined;
};

/** One guide per scored region, built from the engine's own metadata. */
function regionArticle(key: FeatureKey): LearnArticle {
  const meta = FEATURE_META[key];
  return {
    slug: SLUG[key],
    title: meta.label,
    kicker: meta.whyItMatters,
    category: "Facial regions",
    readMinutes: 4,
    featureKey: key,
    sections: [
      {
        kind: "prose",
        heading: "The anatomy",
        paragraphs: [meta.anatomy],
      },
      {
        kind: "prose",
        heading: "What the score is reading",
        paragraphs: [meta.detail],
      },
      {
        kind: "measures",
        heading: "The measurements",
        intro:
          "These are the exact quantities the engine extracts from your landmark mesh, and the reference range each one is compared against.",
        rows: MEASURES[key],
      },
      {
        kind: "list",
        heading: "What genuinely helps",
        intro:
          "Each lever carries its evidence tier. 'Evidence-backed' means a recognised public-health or scientific body supports it; 'plausible' means it is reasonable and low-risk but not proven for this specific outcome.",
        points: meta.improve.map((i) => ({
          text: i.text,
          tier: i.tier,
          source: sourceFor(i.sourceKey),
        })),
      },
      {
        kind: "list",
        heading: "What is structural",
        intro: "No app, habit or exercise changes these. Knowing which is which is the point.",
        points: meta.fixed.map((text) => ({ text })),
      },
      ...(meta.myths.length
        ? [
            {
              kind: "list" as const,
              heading: "Claims that do not hold up",
              intro:
                "Popular in looksmaxxing communities, unsupported by evidence — and in some cases actively harmful.",
              points: meta.myths.map((text) => ({ text, tier: "unsupported" as EvidenceTier })),
            },
          ]
        : []),
    ],
  };
}

/* -------------------------------------------------------------------------
   Method guides — how the product works, written plainly.
------------------------------------------------------------------------- */
const METHOD_ARTICLES: LearnArticle[] = [
  {
    slug: "how-scoring-works",
    title: "How the score is calculated",
    kicker:
      "A deviation model, not a beauty ranking: every region is measured against a reference range and penalised by how far it sits from it.",
    category: "How it works",
    readMinutes: 6,
    sections: [
      {
        kind: "prose",
        heading: "Measurement, not opinion",
        paragraphs: [
          "Your browser places a 468-point mesh on your face and reduces it to a few dozen ratios — distances, angles and proportions, all normalised against your own face width so camera distance cannot skew them. Those numbers are what gets scored. The photo itself never leaves your device.",
          "Each ratio is compared against a published reference range drawn from facial-anatomy literature. The engine measures the deviation: how far your value sits from that range, expressed as a fraction of the tolerance. A value inside the range scores near the top; one at twice the tolerance scores near the bottom.",
        ],
      },
      {
        kind: "prose",
        heading: "Why the weakest measurement matters most",
        paragraphs: [
          "Within a region, deviations are combined with a quadratic mean rather than a simple average. That is deliberate: averaging lets a strong measurement hide a weak one, so a face with one genuinely off-reference ratio would score the same as a uniformly average face. The quadratic mean lets the largest deviation dominate, which is much closer to how a face is actually read.",
          "The consequence is that scores spread out instead of clustering in the middle. A face that sits inside the reference range on every measurement scores high. One that is close on most and far on one does not get to average its way back up.",
        ],
      },
      {
        kind: "note",
        heading: "Why a striking face can land mid-range",
        body:
          "The reference ranges describe statistical averages from anatomy literature — not attractiveness. Plenty of faces that read as striking do so precisely because something deviates: unusually wide-set eyes, a strong nose, a long lower third. Those deviations cost points in a proportion model while being the exact reason the face is memorable. A mid-range score means 'further from the anatomical average', not 'worse looking'.",
      },
      {
        kind: "list",
        heading: "What the score cannot do",
        points: [
          { text: "It cannot rank you against other people. There is no ranking, no percentile against real users, and none is planned." },
          { text: "It cannot measure attractiveness. No ground truth for that exists, and any product claiming otherwise is asserting its own bias as fact." },
          { text: "It cannot read depth from a flat photo. Projection, chin position and cheekbone height are estimated from a 2D image and flagged with lower confidence for that reason." },
          { text: "It cannot see anything your photo does not show. Lighting, lens and angle move the numbers — which is why quality gating runs before scoring." },
        ],
      },
      {
        kind: "prose",
        heading: "Where the scoring runs",
        paragraphs: [
          "Landmark detection runs on your device. Scoring runs on our server, from the numbers alone — never from the browser's own verdict. That split is a security decision: if the client computed the score, anyone could edit it. The server is the only thing that decides what a result says.",
        ],
      },
    ],
  },
  {
    slug: "photo-guide",
    title: "Taking a photo that measures well",
    kicker:
      "Most low scores that surprise people are a lighting or angle problem, not a face problem. Five minutes here changes the reading more than any habit.",
    category: "Using it well",
    readMinutes: 4,
    sections: [
      {
        kind: "prose",
        heading: "Why it matters this much",
        paragraphs: [
          "Every measurement is a ratio between landmarks. Tilt your head ten degrees and the mesh still fits your face perfectly — but the symmetry comparison now includes the tilt, and the lower third gets foreshortened. The engine gates on photo quality before scoring for exactly this reason, but gating catches only the worst cases.",
        ],
      },
      {
        kind: "list",
        heading: "The five that matter",
        points: [
          { text: "Face the camera straight on. Both ears equally visible, chin level, eyes on the lens.", tier: "plausible" },
          { text: "Soft, even, front-facing light. A window at midday is ideal. Overhead light carves shadows under the eyes and jaw; side light manufactures asymmetry that is not there." },
          { text: "Hold the phone at eye level, at arm's length. Held low it widens the jaw and shortens the forehead; held close, the lens distorts the nose outward." },
          { text: "Neutral expression, mouth closed, relaxed. A smile changes mouth width, lip height and the lower third all at once." },
          { text: "Hair off the forehead, glasses off. The hairline anchors the upper third; frames sit on top of the eye landmarks." },
        ],
      },
      {
        kind: "note",
        heading: "If you want to track progress",
        body:
          "Keep the conditions identical between scans: same room, same time of day, same distance, same expression. A change in lighting alone can move a region score by more than any real change over a month. Comparison is only meaningful when the photo is the constant.",
      },
    ],
  },
  {
    slug: "evidence-tiers",
    title: "How we label evidence",
    kicker:
      "Every recommendation carries a tier, and every evidence-backed claim cites a named public-health source. Here is the full list.",
    category: "How it works",
    readMinutes: 3,
    sections: [
      {
        kind: "list",
        heading: "The three tiers",
        points: [
          {
            text: "Evidence-backed — supported by a recognised public-health or scientific body, cited by name and linked. These are the recommendations worth building a habit around.",
            tier: "evidence-backed",
          },
          {
            text: "Plausible — reasonable, low-risk and widely practised, but without direct evidence for this specific outcome. Framing, styling and presentation advice mostly sits here.",
            tier: "plausible",
          },
          {
            text: "Unsupported — popular claims with no evidence behind them, and sometimes a real injury risk. We list them so you can stop paying for them.",
            tier: "unsupported",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Why sources are a closed list",
        paragraphs: [
          "Recommendations cannot invent a citation. They can only reference a key in a fixed registry of sources, each one already tagged with its tier. If a claim has no key, it cannot be presented as evidence-backed — the system has no mechanism to do so.",
        ],
      },
      {
        kind: "list",
        heading: "Every source we cite",
        points: Object.values(EVIDENCE_SOURCES).map((s) => ({
          text: `${s.org} — ${s.title}`,
          tier: s.tier,
          source: { org: s.org, title: s.title, url: s.url },
        })),
      },
    ],
  },
  {
    slug: "what-this-is-not",
    title: "What MorphMetric is not",
    kicker:
      "The honest limits of the product, stated up front — including the things we have been asked for and deliberately refused to build.",
    category: "How it works",
    readMinutes: 4,
    sections: [
      {
        kind: "list",
        heading: "Not these things",
        points: [
          { text: "Not a beauty score. The number describes distance from anatomical reference ranges. It is not a verdict on how you look, and it is not comparable between two different people." },
          { text: "Not a leaderboard. We do not rank users against each other, publish percentiles, or expose anyone's results to anyone else." },
          { text: "Not medical advice. Nothing here diagnoses, treats or screens for anything. For skin, growth, sleep or nutrition concerns, a clinician is the right call." },
          { text: "Not a surgery planner. The tool has no opinion on procedures and will not recommend one." },
          { text: "Not a photo archive. Your image is processed in your browser and never uploaded. What reaches the server is a short list of numbers." },
        ],
      },
      {
        kind: "prose",
        heading: "On the thing people ask for most",
        paragraphs: [
          "The most common request is a harsher score — one that tells people plainly that they are unattractive. We do not build it, and the reason is not squeamishness.",
          "There is no ground truth to train it against. Attractiveness ratings vary enormously by culture, era, and individual, and any model claiming to output one is really outputting the bias of whoever assembled its training labels, dressed as a measurement. Presenting that as objective is a lie about what the software knows.",
          "There is also a duty-of-care problem. A meaningful share of this audience is under eighteen, and a number telling a teenager they are ugly is not feedback — it does measurable harm and there is no version of it that is careful enough.",
        ],
      },
      {
        kind: "note",
        heading: "What you get instead",
        body:
          "Precise, named measurements with their reference ranges, an honest split between what is structural and what you can influence, and levers tagged by how good the evidence actually is. That is more useful than a verdict, and it is something the software can genuinely stand behind.",
      },
    ],
  },
  {
    slug: "privacy-by-design",
    title: "Where your data goes",
    kicker:
      "Your photo never leaves your device. This explains what does, where it is stored, and how to delete all of it.",
    category: "Using it well",
    readMinutes: 3,
    sections: [
      {
        kind: "prose",
        heading: "The photo stays local",
        paragraphs: [
          "Landmark detection runs entirely in your browser. The model loads, your image is processed on your own hardware, and the image itself is discarded when you leave the page. There is no upload step, no storage bucket, and no copy on our servers — which also means there is no photo of you for us to lose in a breach.",
        ],
      },
      {
        kind: "list",
        heading: "What actually leaves your device",
        points: [
          { text: "A few dozen normalised ratios and angles — numbers like 0.47 and +4.2°. They cannot be reversed into a picture of your face." },
          { text: "A quality reading for the photo, so the server can reject an unusable capture before scoring it." },
          { text: "The profile details you chose to enter, such as age range and goals." },
        ],
      },
      {
        kind: "list",
        heading: "What we keep",
        points: [
          { text: "Your account, and a count of the analyses you have run — that is what the free allowance is measured against." },
          { text: "Your reports, stored in your own browser, not on our servers. Clearing them in Settings removes them for good." },
          { text: "No analytics profile, no advertising identifiers, no third-party trackers on the analysis flow." },
        ],
      },
      {
        kind: "note",
        heading: "Deleting everything",
        body:
          "Settings → Data & privacy clears every stored report and your consent record from this device immediately. Deleting your account removes the scan counter with it. Neither action needs to reach support first.",
      },
    ],
  },
];

export const LEARN_ARTICLES: LearnArticle[] = [
  ...METHOD_ARTICLES,
  ...FEATURE_KEYS.map(regionArticle),
];

export const LEARN_CATEGORIES: LearnCategory[] = [
  "How it works",
  "Facial regions",
  "Using it well",
];

export function articleBySlug(slug: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((a) => a.slug === slug);
}

export function articlesIn(category: LearnCategory): LearnArticle[] {
  return LEARN_ARTICLES.filter((a) => a.category === category);
}

/** The guide that explains a given scored region — used to link from a report. */
export function learnPathFor(key: FeatureKey): string {
  return `/learn/${SLUG[key]}`;
}
