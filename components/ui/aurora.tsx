"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

/**
 * Angelic halo blobs for hero / CTA backdrops — a soft wash of gold, violet and
 * sky light that slowly breathes. Purely decorative (aria-hidden,
 * pointer-events-none) and static when reduced-motion is on.
 */
export function Aurora({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const transition = { duration: 22, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <motion.div
        className="absolute -left-24 -top-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--halo-gold) / 0.32), transparent 62%)" }}
        animate={reduce ? undefined : { x: [0, 60, -20, 0], y: [0, -30, 25, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={reduce ? undefined : transition}
      />
      <motion.div
        className="absolute -right-20 top-6 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--halo-violet) / 0.28), transparent 62%)" }}
        animate={reduce ? undefined : { x: [0, -50, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={reduce ? undefined : transition}
      />
      <motion.div
        className="absolute bottom-[-9rem] left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--halo-sky) / 0.24), transparent 65%)" }}
        animate={reduce ? undefined : { x: [0, 40, -40, 0], y: [0, -20, 10, 0] }}
        transition={reduce ? undefined : transition}
      />
    </div>
  );
}
