"use client";

import { motion } from "framer-motion";
import { Sparkles } from "@/components/ui/sparkles";

// Abstract, radiant scan panel — deliberately NOT a real face. A stylized bust
// crowned with a halo, framed by wings of light, with analysis nodes,
// proportion guides and a sweeping scan of gold.
const NODES = [
  { x: 100, y: 74 },
  { x: 78, y: 96 },
  { x: 122, y: 96 },
  { x: 100, y: 118 },
  { x: 100, y: 140 },
  { x: 100, y: 162 },
];

export function HeroVisual() {
  return (
    <motion.div
      className="divine-card relative aspect-square w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-halo"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-aura opacity-90" />
      <div className="absolute inset-0 bg-dots opacity-50" />
      <Sparkles count={16} />

      {/* sweeping scan line — a ribbon of gold */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-24 animate-scan-sweep bg-gradient-to-b from-transparent via-halo-gold/40 to-transparent" />

      <svg viewBox="0 0 200 210" className="absolute inset-0 h-full w-full p-8">
        <defs>
          <radialGradient id="hero-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--halo-gold))" stopOpacity="0.55" />
            <stop offset="70%" stopColor="hsl(var(--halo-gold))" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(var(--halo-gold))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-wing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--halo-violet))" />
            <stop offset="100%" stopColor="hsl(var(--halo-sky))" />
          </linearGradient>
        </defs>

        {/* radiant halo behind the head */}
        <circle cx="100" cy="70" r="46" fill="url(#hero-halo)" className="animate-halo-breathe" style={{ transformOrigin: "100px 70px" }} />
        <motion.circle
          cx="100"
          cy="70"
          r="30"
          fill="none"
          stroke="hsl(var(--halo-gold))"
          strokeWidth="1.5"
          strokeOpacity="0.8"
          strokeDasharray="2 5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 70px" }}
        />

        {/* wings of light */}
        {[-1, 1].map((s) => (
          <motion.path
            key={s}
            d={
              s === -1
                ? "M60 120 C24 108 20 150 40 176 C36 150 52 138 66 150 C56 134 60 126 60 120Z"
                : "M140 120 C176 108 180 150 160 176 C164 150 148 138 134 150 C144 134 140 126 140 120Z"
            }
            fill="url(#hero-wing)"
            fillOpacity="0.16"
            stroke="url(#hero-wing)"
            strokeOpacity="0.4"
            strokeWidth="1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        ))}

        {/* proportion guides */}
        <line x1="100" y1="40" x2="100" y2="184" stroke="hsl(var(--halo-gold))" strokeOpacity="0.3" strokeDasharray="3 4" />
        {[74, 118, 162].map((y) => (
          <line key={y} x1="52" y1={y} x2="148" y2={y} stroke="hsl(var(--foreground))" strokeOpacity="0.08" />
        ))}

        {/* abstract bust */}
        <motion.ellipse
          cx="100"
          cy="112"
          rx="44"
          ry="56"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        <path d="M66 184 Q100 152 134 184" fill="none" stroke="hsl(var(--foreground))" strokeOpacity="0.22" strokeWidth="1.5" />

        {/* nodes */}
        {NODES.map((n, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.16, type: "spring", stiffness: 200, damping: 14 }}
          >
            <circle cx={n.x} cy={n.y} r="6" fill="hsl(var(--halo-gold))" fillOpacity="0.22" className="animate-pulse-ring" style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
            <circle cx={n.x} cy={n.y} r="2.6" fill="hsl(var(--halo-gold))" />
          </motion.g>
        ))}
      </svg>

      {/* floating stat chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="absolute left-5 top-5 rounded-2xl border border-halo-gold/30 bg-background/80 px-3 py-2 text-xs shadow-glow backdrop-blur"
      >
        <div className="tabular font-mono text-sm text-primary">15.8</div>
        <div className="text-muted">Symmetry</div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35 }}
        className="absolute bottom-5 right-5 rounded-2xl border border-accent/30 bg-background/80 px-3 py-2 text-xs shadow-celestial backdrop-blur"
      >
        <div className="font-mono text-sm text-accent">High</div>
        <div className="text-muted">Confidence</div>
      </motion.div>
    </motion.div>
  );
}
