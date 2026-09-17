/** Round to one decimal for score display (e.g. 14.8). */
export function score1(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

/** Clamp a number into [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Time-of-day greeting for the dashboard. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
