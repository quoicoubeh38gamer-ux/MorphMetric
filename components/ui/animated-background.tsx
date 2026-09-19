"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Site-wide backdrop.
 *
 * Three very large, very low-alpha washes that drift slowly, over a fine
 * silver dot field and a layer of grain. The intent is depth, not decoration:
 * at any given moment you should not be able to point at a "gradient", only
 * notice that the page has air in it. Static under prefers-reduced-motion.
 */
export function AnimatedBackground() {
  const reduce = useReducedMotion();
  const drift = (d: number) => ({ duration: d, repeat: Infinity, ease: "easeInOut" as const });

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden grain" aria-hidden>
      <div className="absolute inset-0 bg-dots opacity-70" />

      <motion.div
        className="absolute -top-56 left-[4%] h-[52rem] w-[52rem] rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, hsl(var(--tint-blue) / 0.13), transparent 62%)" }}
        animate={reduce ? undefined : { x: [0, 70, -30, 0], y: [0, 40, -20, 0] }}
        transition={reduce ? undefined : drift(44)}
      />
      <motion.div
        className="absolute top-1/3 right-[-4%] h-[46rem] w-[46rem] rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, hsl(var(--tint-lavender) / 0.12), transparent 62%)" }}
        animate={reduce ? undefined : { x: [0, -60, 20, 0], y: [0, -30, 30, 0] }}
        transition={reduce ? undefined : drift(52)}
      />
      <motion.div
        className="absolute bottom-[-18rem] left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, hsl(var(--tint-silver) / 0.12), transparent 66%)" }}
        animate={reduce ? undefined : { x: [0, 50, -50, 0] }}
        transition={reduce ? undefined : drift(60)}
      />
    </div>
  );
}
