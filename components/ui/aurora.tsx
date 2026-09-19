"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

/**
 * Localised light for hero / CTA surfaces. Same restraint as the global
 * backdrop, scoped to one section. Decorative only.
 */
export function Aurora({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const transition = { duration: 30, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <motion.div
        className="absolute -left-28 -top-36 h-[34rem] w-[34rem] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, hsl(var(--tint-blue) / 0.16), transparent 64%)" }}
        animate={reduce ? undefined : { x: [0, 44, -16, 0], y: [0, -22, 18, 0] }}
        transition={reduce ? undefined : transition}
      />
      <motion.div
        className="absolute -right-24 top-4 h-[30rem] w-[30rem] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, hsl(var(--tint-lavender) / 0.14), transparent 64%)" }}
        animate={reduce ? undefined : { x: [0, -36, 20, 0], y: [0, 26, -14, 0] }}
        transition={reduce ? undefined : transition}
      />
    </div>
  );
}
