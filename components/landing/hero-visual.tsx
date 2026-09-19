"use client";

import { motion } from "framer-motion";

/**
 * The hero instrument.
 *
 * A deliberately abstract measurement aperture — never a real face. Thin
 * silver geometry, landmark nodes, the three horizontal reference lines the
 * product actually measures, and one slow sweep of light. Everything here is
 * drawn from the same vocabulary as the results page so the promise and the
 * product look like one system.
 */
const NODES = [
  { x: 100, y: 72 },
  { x: 79, y: 95 },
  { x: 121, y: 95 },
  { x: 100, y: 117 },
  { x: 100, y: 140 },
  { x: 100, y: 163 },
];

const GUIDES = [
  { y: 72, label: "brow" },
  { y: 117, label: "nose" },
  { y: 163, label: "chin" },
];

export function HeroVisual() {
  return (
    <div className="ring-pearl grain relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
      <div className="absolute inset-0 bg-dots opacity-80" />
      <div className="absolute inset-0 bg-grid-fade" />

      {/* one slow pass of light */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-28 animate-scan-sweep bg-gradient-to-b from-transparent via-accent/18 to-transparent" />

      <svg viewBox="0 0 200 210" className="absolute inset-0 h-full w-full p-10" role="img" aria-label="Abstract facial measurement diagram">
        {/* vertical midline */}
        <line
          x1="100"
          y1="38"
          x2="100"
          y2="186"
          stroke="hsl(var(--accent))"
          strokeOpacity="0.32"
          strokeWidth="0.75"
          strokeDasharray="2 5"
        />

        {/* horizontal reference lines */}
        {GUIDES.map((g, i) => (
          <motion.g
            key={g.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.16, duration: 0.7 }}
          >
            <line
              x1="44"
              y1={g.y}
              x2="156"
              y2={g.y}
              stroke="hsl(var(--foreground))"
              strokeOpacity="0.14"
              strokeWidth="0.75"
            />
            <text
              x="160"
              y={g.y + 2.5}
              className="font-mono"
              fontSize="6"
              fill="hsl(var(--muted-2))"
            >
              {g.label}
            </text>
          </motion.g>
        ))}

        {/* aperture */}
        <motion.ellipse
          cx="100"
          cy="112"
          rx="43"
          ry="55"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeOpacity="0.3"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.7, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx="100"
          cy="112"
          rx="52"
          ry="64"
          fill="none"
          stroke="hsl(var(--tint-silver))"
          strokeOpacity="0.28"
          strokeWidth="0.6"
          strokeDasharray="1 6"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 112px" }}
        />
        {/* landmark nodes */}
        {NODES.map((n, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.13, type: "spring", stiffness: 190, damping: 16 }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r="5"
              fill="hsl(var(--accent))"
              fillOpacity="0.16"
              className="animate-pulse-ring"
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            />
            <circle cx={n.x} cy={n.y} r="1.9" fill="hsl(var(--accent))" />
          </motion.g>
        ))}
      </svg>

      {/* measurement chips */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute left-5 top-5 rounded-xl border border-border bg-surface/85 px-3 py-2 backdrop-blur"
      >
        <div className="tabular font-mono text-sm">33 · 33 · 34</div>
        <div className="text-[11px] text-muted">facial thirds</div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.45, duration: 0.6 }}
        className="absolute bottom-5 right-5 rounded-xl border border-border bg-surface/85 px-3 py-2 backdrop-blur"
      >
        <div className="tabular font-mono text-sm">+4.2°</div>
        <div className="text-[11px] text-muted">canthal tilt</div>
      </motion.div>
    </div>
  );
}
