"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * A scatter of tiny twinkling star sparkles over the parent (which must be
 * `relative`). Decorative only. Deterministic positions to avoid hydration
 * mismatch; frozen under reduced-motion.
 */
export function Sparkles({
  count = 14,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = ((i * 2654435761) % 1000) / 1000;
        const b = ((i * 40503 + 12345) % 1000) / 1000;
        const c = ((i * 97 + 13) % 100) / 100;
        return {
          left: `${(a * 100).toFixed(2)}%`,
          top: `${(b * 100).toFixed(2)}%`,
          size: 6 + Math.round(c * 10),
          delay: +(c * 2.4).toFixed(2),
          dur: 1.6 + c * 1.8,
          hue: i % 3 === 0 ? "violet" : i % 4 === 0 ? "sky" : "gold",
        };
      }),
    [count],
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {stars.map((s, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, position: "absolute" }}
          fill={`hsl(var(--halo-${s.hue}))`}
          initial={{ opacity: 0, scale: 0 }}
          animate={reduce ? { opacity: 0.7, scale: 1 } : { opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 45, 90] }}
          transition={reduce ? { duration: 0.4 } : { duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M12 0c.6 5.4 2.9 8.2 8.2 8.8-5.3.6-7.6 3.4-8.2 8.8-.6-5.4-2.9-8.2-8.2-8.8C9.1 8.2 11.4 5.4 12 0Z" />
        </motion.svg>
      ))}
    </div>
  );
}
