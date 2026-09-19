"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/**
 * Site-wide celestial backdrop behind all content.
 *  - Soft drifting light-clouds (gold / violet / sky) at very low alpha.
 *  - Slow-rotating "god-rays" cone from above.
 *  - A field of floating, twinkling light motes.
 * Big blur + low alpha keep text perfectly legible. Fixed + -z-10 so it sits
 * behind content. Fully static under prefers-reduced-motion.
 */
export function AnimatedBackground() {
  const reduce = useReducedMotion();
  const t = (d: number) => ({ duration: d, repeat: Infinity, ease: "easeInOut" as const });

  // Deterministic mote field (no hydration mismatch — values are fixed).
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const r = seed / 233280;
        const r2 = ((i * 4099 + 7919) % 233280) / 233280;
        return {
          left: `${(r * 100).toFixed(2)}%`,
          top: `${(r2 * 100).toFixed(2)}%`,
          size: 3 + Math.round(r * 6),
          delay: +(r2 * 5).toFixed(2),
          dur: 5 + Math.round(r * 8),
          hue: i % 3 === 0 ? "gold" : i % 3 === 1 ? "violet" : "sky",
        };
      }),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-dots opacity-40" />

      {/* God-rays fanning down from the top — slow rotation. */}
      <motion.div
        className="absolute left-1/2 top-[-30%] h-[80rem] w-[80rem] -translate-x-1/2 opacity-[0.5]"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 0%, transparent 0deg, hsl(var(--halo-gold) / 0.16) 12deg, transparent 24deg, hsl(var(--halo-gold) / 0.12) 40deg, transparent 56deg, hsl(var(--halo-violet) / 0.12) 78deg, transparent 96deg, hsl(var(--halo-gold) / 0.14) 120deg, transparent 140deg)",
          maskImage: "radial-gradient(closest-side, black, transparent 78%)",
          WebkitMaskImage: "radial-gradient(closest-side, black, transparent 78%)",
        }}
        animate={reduce ? undefined : { rotate: [0, 360] }}
        transition={reduce ? undefined : { duration: 140, repeat: Infinity, ease: "linear" }}
      />

      {/* Drifting light-clouds. */}
      <motion.div
        className="absolute -top-48 left-[6%] h-[46rem] w-[46rem] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, hsl(var(--halo-gold) / 0.22), transparent 60%)" }}
        animate={reduce ? undefined : { x: [0, 90, -40, 0], y: [0, 50, -30, 0] }}
        transition={reduce ? undefined : t(30)}
      />
      <motion.div
        className="absolute top-1/3 right-[2%] h-[42rem] w-[42rem] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, hsl(var(--halo-violet) / 0.2), transparent 60%)" }}
        animate={reduce ? undefined : { x: [0, -80, 30, 0], y: [0, -40, 40, 0] }}
        transition={reduce ? undefined : t(34)}
      />
      <motion.div
        className="absolute bottom-[-14rem] left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, hsl(var(--halo-sky) / 0.18), transparent 65%)" }}
        animate={reduce ? undefined : { x: [0, 70, -70, 0] }}
        transition={reduce ? undefined : t(38)}
      />

      {/* Floating, twinkling light motes. */}
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            background: `hsl(var(--halo-${m.hue}))`,
            boxShadow: `0 0 ${m.size * 2}px hsl(var(--halo-${m.hue}) / 0.8)`,
          }}
          animate={
            reduce
              ? undefined
              : { y: [0, -26, 0], opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.2, 0.8] }
          }
          transition={
            reduce ? undefined : { duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
    </div>
  );
}
