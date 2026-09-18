"use client";

import { motion } from "framer-motion";
import type { FeatureKey, RankedFeature } from "@/lib/ai/types";

const SHORT: Record<FeatureKey, string> = {
  symmetry: "Symmetry",
  proportions: "Proportions",
  eyes: "Eyes",
  brows: "Brows",
  nose: "Nose",
  lips: "Lips",
  jaw: "Jaw",
  skin: "Skin",
};

/**
 * Single-series radar of the eight feature scores — a profile "shape".
 * One hue (no legend needed for a single series); labels use text tokens, grid
 * is recessive, and the polygon draws in on mount.
 */
export function RadarChart({
  features,
  max = 20,
  size = 320,
}: {
  features: RankedFeature[];
  max?: number;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 52;
  const n = features.length || 1;
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const pointAt = (i: number, r: number): [number, number] => {
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const valuePoints = features
    .map((f, i) => pointAt(i, R * Math.max(0.04, Math.min(1, f.score / max))))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label="Feature profile radar">
      {/* recessive grid rings */}
      {rings.map((t) => (
        <polygon
          key={t}
          points={features
            .map((_, i) => pointAt(i, R * t))
            .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
            .join(" ")}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          opacity={0.7}
        />
      ))}

      {/* spokes */}
      {features.map((_, i) => {
        const [x, y] = pointAt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={1} opacity={0.5} />;
      })}

      {/* value polygon (draws in) */}
      <motion.polygon
        points={valuePoints}
        fill="hsl(var(--primary) / 0.18)"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* vertex markers */}
      {features.map((f, i) => {
        const [x, y] = pointAt(i, R * Math.max(0.04, Math.min(1, f.score / max)));
        return <circle key={f.key} cx={x} cy={y} r={3.5} fill="hsl(var(--accent))" stroke="hsl(var(--card))" strokeWidth={1.5} />;
      })}

      {/* axis labels (text tokens, not the series color) */}
      {features.map((f, i) => {
        const [x, y] = pointAt(i, R + 22);
        const a = angleFor(i);
        const cos = Math.cos(a);
        const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        return (
          <text
            key={`l-${f.key}`}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-muted"
            style={{ fontSize: 11 }}
          >
            {SHORT[f.key]}
          </text>
        );
      })}
    </svg>
  );
}
