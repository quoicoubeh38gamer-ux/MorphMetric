"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

/**
 * Soft animated gradient blobs for hero / CTA backdrops. Purely decorative
 * (aria-hidden, pointer-events-none) and static when reduced-motion is on.
 */
export function Aurora({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const transition = { duration: 20, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <motion.div
        className="absolute -left-24 -top-32 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.20), transparent 62%)" }}
        animate={reduce ? undefined : { x: [0, 60, -20, 0], y: [0, -30, 25, 0] }}
        transition={reduce ? undefined : transition}
      />
      <motion.div
        className="absolute -right-20 top-10 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.16), transparent 62%)" }}
        animate={reduce ? undefined : { x: [0, -50, 30, 0], y: [0, 40, -20, 0] }}
        transition={reduce ? undefined : transition}
      />
      <motion.div
        className="absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 65%)" }}
        animate={reduce ? undefined : { x: [0, 40, -40, 0], y: [0, -20, 10, 0] }}
        transition={reduce ? undefined : transition}
      />
    </div>
  );
}
