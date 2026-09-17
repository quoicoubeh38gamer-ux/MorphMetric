"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

/** Animated number counter used for scores and stats. */
export function CountUp({
  value,
  decimals = 1,
  duration = 1.1,
  className,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
