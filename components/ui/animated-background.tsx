"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Site-wide animated gradient field behind all content. Big blur + low alpha so
 * text stays perfectly legible; constant slow drift gives the whole app life.
 * Fixed and -z-10 so it sits above the body background but behind content.
 * Fully static under prefers-reduced-motion.
 */
export function AnimatedBackground() {
  const reduce = useReducedMotion();
  const t = (d: number) => ({ duration: d, repeat: Infinity, ease: "easeInOut" as const });

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-dots opacity-40" />
      <motion.div
        className="absolute -top-48 left-[8%] h-[44rem] w-[44rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.16), transparent 60%)" }}
        animate={reduce ? undefined : { x: [0, 90, -40, 0], y: [0, 50, -30, 0] }}
        transition={reduce ? undefined : t(28)}
      />
      <motion.div
        className="absolute top-1/3 right-[4%] h-[40rem] w-[40rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.14), transparent 60%)" }}
        animate={reduce ? undefined : { x: [0, -80, 30, 0], y: [0, -40, 40, 0] }}
        transition={reduce ? undefined : t(32)}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.10), transparent 65%)" }}
        animate={reduce ? undefined : { x: [0, 70, -70, 0] }}
        transition={reduce ? undefined : t(36)}
      />
    </div>
  );
}
