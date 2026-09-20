import type { FaceReport } from "./types";
import { score1 } from "../utils/format";
import { bandLabel } from "../utils/score";

/**
 * The Coach explains a report using only that report's own numbers.
 *
 * This is deliberately deterministic — there is no language model behind it and
 * no external call. Every sentence is derived from measurements the user can
 * see elsewhere in the product, so the explanation can never drift from the
 * data or invent a claim.
 */
export interface CoachTopic {
  id: string;
  question: string;
  paragraphs: string[];
}

const pct = (n: number) => `${Math.round(n)}%`;

export function buildCoachTopics(report: FaceReport): CoachTopic[] {
  const sorted = [...report.features].sort((a, b) => a.score - b.score);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const topics: CoachTopic[] = [];

  topics.push({
    id: "overall",
    question: "What does my overall index actually mean?",
    paragraphs: [
      `Your index is ${score1(report.morphScore)} / 20. It is a weighted average of ${report.features.length} regions, where each region scores how close its measurements sit to a neutral reference range — not how "good" it looks.`,
      `Overall confidence for this scan is ${report.confidenceOverall}. That reflects both how measurable each region is from a flat photo and the quality of the image you gave us${report.quality.issues.length > 0 ? ` (we flagged: ${report.quality.issues.join(" ")})` : ""}.`,
      "Treat it as a baseline. The number that matters is the one you compare against your own next scan — not against another person.",
    ],
  });

  if (lowest) {
    const measured = (lowest.subMetrics ?? []).filter((s) => s.measured);
    const detail = measured.length
      ? measured
          .map((s) => `${s.label} measured ${s.value} against a reference of ${s.ideal} (${score1(s.score)} / 20)`)
          .join("; ")
      : "this region has no directly measurable sub-values from a single frontal photo";
    topics.push({
      id: "lowest",
      question: `Why did my ${lowest.label.toLowerCase()} score lowest?`,
      paragraphs: [
        `${lowest.label} scored ${score1(lowest.score)} / 20 — ${bandLabel(lowest.score).toLowerCase()}.`,
        `Here is what drove it: ${detail}.`,
        lowest.detail,
        lowest.fixed.length > 0
          ? `Be clear about the ceiling: ${lowest.fixed.join(" ")} Nothing in this app changes that, and anything claiming otherwise is selling you something.`
          : "",
      ].filter(Boolean),
    });
  }

  if (highest) {
    topics.push({
      id: "highest",
      question: "What is already working for me?",
      paragraphs: [
        `${highest.label} is your closest to reference at ${score1(highest.score)} / 20.`,
        highest.whyItMatters,
        "When you are deciding what to lead with in photos, this is the region to frame and light well rather than the one to fix.",
      ],
    });
  }

  const first = report.roadmap[0];
  if (first) {
    topics.push({
      id: "next",
      question: "What is the single highest-return thing I can do?",
      paragraphs: [
        `${first.title}.`,
        first.body,
        `Evidence level: ${first.tier.replace("-", " ")}. We rank actions by what you can actually control, so this is ahead of anything structural.`,
      ],
    });
  }

  topics.push({
    id: "reliability",
    question: "How much should I trust these numbers?",
    paragraphs: [
      report.provider.startsWith("mediapipe")
        ? "This scan used real landmark geometry — 468 points mapped on your device — so the flat measurements (thirds, spacing, tilt, widths) are genuine measurements rather than guesses."
        : "No face was detected in this photo, so this scan fell back to a basic estimate. Re-run it with a clear, front-facing, well-lit photo to get real measurements.",
      "Anything depth-dependent — nose projection, the bridge, the underlying jaw bone — is labelled estimated. A single flat image genuinely cannot measure those, and we would rather say so than print a confident number.",
      report.harmonyScore > 0
        ? `Your harmony figure of ${report.harmonyScore}/100 is the average closeness of ${report.comparisons.length} measured ratios to their reference ranges. It moves when your measurements move, which makes it useful for tracking.`
        : "Harmony needs real landmark geometry, so it is not available for this scan.",
    ],
  });

  const allMyths = report.features.flatMap((f) => f.myths);
  if (allMyths.length > 0) {
    topics.push({
      id: "myths",
      question: "What should I ignore completely?",
      paragraphs: [
        "These come up constantly in looksmaxxing communities and none of them are supported:",
        ...allMyths.slice(0, 6).map((m) => `• ${m}`),
        "Skipping these is not us being cautious — it is the difference between spending a year on habits that compound and a year on something with a real injury risk.",
      ],
    });
  }

  if (report.potentialScore > report.morphScore) {
    topics.push({
      id: "potential",
      question: "How much can I realistically improve?",
      paragraphs: [
        `Your presentation ceiling is about ${score1(report.potentialScore)} / 20, up from ${score1(report.morphScore)}.`,
        report.potentialNote,
        `That gap is roughly ${pct(((report.potentialScore - report.morphScore) / 20) * 100)} of the full scale, and it comes entirely from things you control — skin, sleep, body composition, styling, posture, lighting and angles.`,
      ],
    });
  }

  // One explain-this topic per region, so nothing is a black box.
  for (const f of report.features) {
    topics.push({
      id: `region-${f.key}`,
      question: `Explain my ${f.label.toLowerCase()}`,
      paragraphs: [
        `${score1(f.score)} / 20 — ${bandLabel(f.score).toLowerCase()}, measured with ${f.confidence} confidence.`,
        f.anatomy,
        f.detail,
        ...(f.subMetrics ?? []).map((s) =>
          s.measured
            ? `• ${s.label}: ${s.value} (reference ${s.ideal}) → ${score1(s.score)} / 20`
            : `• ${s.label}: not measurable from this photo — ${s.note}`,
        ),
      ],
    });
  }

  return topics;
}
