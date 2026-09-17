"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fade + rise on mount. We animate on mount (not whileInView) so content is
 * never gated behind an IntersectionObserver — if the entrance never plays, the
 * element still ends fully visible. Reduced-motion is respected by Framer Motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
