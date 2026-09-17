"use client";

import { motion } from "framer-motion";

// Abstract, futuristic scan panel — deliberately NOT a real face. A stylized
// bust with analysis nodes, proportion guides and a sweeping scan line.
const NODES = [
  { x: 100, y: 74, label: "Symmetry" },
  { x: 78, y: 96, label: "Eyes" },
  { x: 122, y: 96, label: "" },
  { x: 100, y: 118, label: "Nose" },
  { x: 100, y: 140, label: "Lips" },
  { x: 100, y: 162, label: "Jaw" },
];

export function HeroVisual() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="absolute inset-0 bg-dots opacity-60" />
      <div className="absolute inset-0 bg-grid-fade" />

      {/* sweeping scan line */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-24 animate-scan-sweep bg-gradient-to-b from-transparent via-primary/25 to-transparent" />

      <svg viewBox="0 0 200 210" className="absolute inset-0 h-full w-full p-8">
        {/* proportion guides */}
        <line x1="100" y1="40" x2="100" y2="180" stroke="hsl(var(--primary))" strokeOpacity="0.25" strokeDasharray="3 4" />
        {[74, 118, 162].map((y) => (
          <line key={y} x1="46" y1={y} x2="154" y2={y} stroke="hsl(var(--foreground))" strokeOpacity="0.08" />
        ))}

        {/* abstract bust */}
        <motion.ellipse
          cx="100"
          cy="112"
          rx="46"
          ry="58"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        <path d="M64 182 Q100 150 136 182" fill="none" stroke="hsl(var(--foreground))" strokeOpacity="0.2" strokeWidth="1.5" />

        {/* nodes */}
        {NODES.map((n, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.18, type: "spring", stiffness: 200, damping: 14 }}
          >
            <circle cx={n.x} cy={n.y} r="5" fill="hsl(var(--primary))" fillOpacity="0.18" className="animate-pulse-ring" />
            <circle cx={n.x} cy={n.y} r="2.4" fill="hsl(var(--primary))" />
          </motion.g>
        ))}
      </svg>

      {/* floating stat chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="absolute left-5 top-5 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs backdrop-blur"
      >
        <div className="tabular font-mono text-sm text-foreground">15.8</div>
        <div className="text-muted">Symmetry</div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35 }}
        className="absolute bottom-5 right-5 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs backdrop-blur"
      >
        <div className="font-mono text-sm text-accent">High</div>
        <div className="text-muted">Confidence</div>
      </motion.div>
    </div>
  );
}
