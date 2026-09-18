"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const N = 20;
const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))"];

/**
 * One-shot celebratory particle burst (reward feedback). Fires on mount; remount
 * with a changing `key` to replay. Renders nothing under reduced-motion.
 */
export function Burst({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible", className)} aria-hidden>
      {Array.from({ length: N }).map((_, i) => {
        const angle = (i / N) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 50 + Math.random() * 90;
        const color = COLORS[i % COLORS.length] ?? "hsl(var(--primary))";
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.9 + Math.random() * 0.5, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
