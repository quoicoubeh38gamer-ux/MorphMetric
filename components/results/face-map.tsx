"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { FeatureKey, FeatureScore } from "@/lib/ai/types";
import { bandLabel, scoreTone, TONE_FILL, TONE_TEXT } from "@/lib/utils/score";
import { score1 } from "@/lib/utils/format";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";

/**
 * Interactive face map.
 *
 * Six spatial regions drawn over an abstract aperture (never a real face),
 * plus the two non-spatial measurements — midline symmetry and surface — as
 * chips. Pointing at, tapping or tabbing to a region reveals what was actually
 * measured there. Hover is a convenience; focus and click are the real API so
 * it works on touch and with a keyboard.
 */

type Shape =
  | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { type: "path"; d: string };

interface Region {
  key: FeatureKey;
  label: string;
  /** A region can be a pair (eyes, brows) — all shapes share one hit target. */
  shapes: Shape[];
}

// Geometry is laid out against the head outline (cx 110, cy 132, rx 62, ry 80)
// so every region sits inside the aperture and in its anatomical position.
const REGIONS: Region[] = [
  {
    key: "proportions",
    label: "Forehead & thirds",
    shapes: [{ type: "ellipse", cx: 110, cy: 88, rx: 42, ry: 18 }],
  },
  {
    key: "brows",
    label: "Brows",
    shapes: [
      { type: "path", d: "M74 114 Q88 105 103 112" },
      { type: "path", d: "M117 112 Q132 105 146 114" },
    ],
  },
  {
    key: "eyes",
    label: "Eye area",
    shapes: [
      { type: "path", d: "M74 127 Q88 118 102 127 Q88 135 74 127 Z" },
      { type: "path", d: "M118 127 Q132 118 146 127 Q132 135 118 127 Z" },
    ],
  },
  {
    key: "nose",
    label: "Nose",
    shapes: [{ type: "path", d: "M110 131 L101 160 Q110 166 119 160 Z" }],
  },
  {
    key: "lips",
    label: "Lips",
    shapes: [{ type: "path", d: "M90 180 Q110 172 130 180 Q110 192 90 180 Z" }],
  },
  {
    key: "jaw",
    label: "Jaw & chin",
    shapes: [
      { type: "path", d: "M52 152 Q56 198 110 211 Q164 198 168 152 L154 150 Q150 186 110 197 Q70 186 66 150 Z" },
    ],
  },
];

const EXTRA_KEYS: FeatureKey[] = ["symmetry", "skin"];

export function FaceMap({ features }: { features: FeatureScore[] }) {
  const byKey = useMemo(() => {
    const m = new Map<FeatureKey, FeatureScore>();
    for (const f of features) m.set(f.key, f);
    return m;
  }, [features]);

  // Open on the region with the most headroom — the most useful thing to see.
  const initial = useMemo(() => {
    const spatial = REGIONS.map((r) => byKey.get(r.key)).filter(Boolean) as FeatureScore[];
    const lowest = [...spatial].sort((a, b) => a.score - b.score)[0];
    return lowest?.key ?? "eyes";
  }, [byKey]);

  const [active, setActive] = useState<FeatureKey>(initial);
  const feature = byKey.get(active);
  const tone = feature ? scoreTone(feature.score) : "primary";
  const activeLabel =
    REGIONS.find((r) => r.key === active)?.label ?? feature?.label ?? "Measurement";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {/* Map */}
      <div className="card-base grain flex flex-col p-5">
        <svg
          viewBox="0 0 220 260"
          className="mx-auto h-auto w-full max-w-[19rem]"
          role="group"
          aria-label="Facial regions. Focus a region to see its measurements."
        >
          {/* aperture */}
          <ellipse
            cx="110"
            cy="132"
            rx="62"
            ry="80"
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
          <line
            x1="110"
            y1="46"
            x2="110"
            y2="222"
            stroke="hsl(var(--accent))"
            strokeOpacity="0.2"
            strokeWidth="0.75"
            strokeDasharray="2 6"
          />

          {REGIONS.map((r) => {
            const f = byKey.get(r.key);
            const isActive = active === r.key;
            const fill = f ? TONE_FILL[scoreTone(f.score)] : "hsl(var(--tint-silver))";
            const common = {
              fill,
              fillOpacity: isActive ? 0.24 : 0.07,
              stroke: fill,
              strokeOpacity: isActive ? 0.9 : 0.3,
              strokeWidth: isActive ? 1.4 : 0.9,
              style: { cursor: "pointer", transition: "fill-opacity .25s, stroke-opacity .25s" },
            };
            return (
              <g
                key={r.key}
                role="button"
                tabIndex={0}
                aria-label={`${r.label}${f ? `, ${score1(f.score)} out of 20` : ""}`}
                aria-pressed={isActive}
                onMouseEnter={() => setActive(r.key)}
                onFocus={() => setActive(r.key)}
                onClick={() => setActive(r.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(r.key);
                  }
                }}
                className="focus:outline-none [&:focus-visible>*]:stroke-[2]"
              >
                {r.shapes.map((sh, i) =>
                  sh.type === "ellipse" ? (
                    <ellipse key={i} cx={sh.cx} cy={sh.cy} rx={sh.rx} ry={sh.ry} {...common} />
                  ) : (
                    <path key={i} d={sh.d} {...common} strokeLinecap="round" strokeLinejoin="round" />
                  ),
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-border pt-4">
          {EXTRA_KEYS.map((k) => {
            const f = byKey.get(k);
            if (!f) return null;
            const on = active === k;
            return (
              <button
                key={k}
                type="button"
                onMouseEnter={() => setActive(k)}
                onFocus={() => setActive(k)}
                onClick={() => setActive(k)}
                aria-pressed={on}
                className={`focus-ring rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  on
                    ? "border-foreground/25 bg-card text-foreground"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {f.label}
                <span className="ml-1.5 font-mono tabular text-muted-foreground">{score1(f.score)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="card-base p-6 sm:p-7">
        {feature ? (
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl tracking-tight">{activeLabel}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {bandLabel(feature.score)}
                </p>
              </div>
              <div className="text-right">
                <div className={`font-mono text-3xl tabular ${TONE_TEXT[tone]}`}>
                  {score1(feature.score)}
                  <span className="text-sm text-muted"> / 20</span>
                </div>
                <div className="mt-2 flex justify-end">
                  <ConfidenceBadge confidence={feature.confidence} />
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted">{feature.summary}</p>

            {feature.subMetrics && feature.subMetrics.length > 0 ? (
              <dl className="mt-6 space-y-3">
                {feature.subMetrics.map((s) => (
                  <div key={s.key} className="rounded-xl border border-border bg-background/50 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium">{s.label}</dt>
                      <dd className="font-mono text-xs tabular">
                        {s.measured ? (
                          <span className={TONE_TEXT[scoreTone(s.score)]}>{score1(s.score)}<span className="text-muted"> / 20</span></span>
                        ) : (
                          <span className="text-muted-foreground">estimated</span>
                        )}
                      </dd>
                    </div>
                    {s.measured ? (
                      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted">
                        <span>
                          you <span className="font-mono text-foreground">{s.value}</span>
                        </span>
                        <span>
                          reference <span className="font-mono">{s.ideal}</span>
                        </span>
                      </div>
                    ) : null}
                    <p className="mt-2 text-[11px] leading-snug text-muted">{s.note}</p>
                  </div>
                ))}
              </dl>
            ) : null}

            {feature.anatomy ? (
              <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted">
                {feature.anatomy}
              </p>
            ) : null}
          </motion.div>
        ) : (
          <p className="text-sm text-muted">Select a region to see its measurements.</p>
        )}
      </div>
    </div>
  );
}
