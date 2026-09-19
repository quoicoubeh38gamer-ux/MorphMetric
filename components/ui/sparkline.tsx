"use client";

import { motion } from "framer-motion";

/** Minimal single-series line of score over time (chronological values). */
export function Sparkline({
  values,
  max = 20,
  className,
}: {
  values: number[];
  max?: number;
  className?: string;
}) {
  const w = 300;
  const h = 70;
  const pad = 8;
  if (values.length === 0) return null;

  const n = values.length;
  const pts = values.map((v, i) => {
    const x = n === 1 ? w / 2 : pad + (i / (n - 1)) * (w - 2 * pad);
    const y = pad + (1 - Math.min(1, Math.max(0, v / max))) * (h - 2 * pad);
    return [x, y] as [number, number];
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const firstX = pts[0]?.[0] ?? pad;
  const lastX = last?.[0] ?? w - pad;
  const area = `${firstX.toFixed(1)},${h - pad} ${line} ${lastX.toFixed(1)},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label="Score over time">
      <polygon points={area} fill="hsl(var(--primary) / 0.12)" />
      <motion.polyline
        points={line}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      {last ? (
        <circle cx={last[0]} cy={last[1]} r={3.5} fill="hsl(var(--accent))" stroke="hsl(var(--card))" strokeWidth={1.5} />
      ) : null}
    </svg>
  );
}
