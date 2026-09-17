import type { CheckIn } from "./store";

const XP_PER_LEVEL = 200;

export interface LevelInfo {
  level: number;
  intoLevel: number; // xp accumulated within the current level
  toNext: number; // xp needed for the next level
  pct: number; // 0..100 progress to next level
}

export function levelFromXp(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    intoLevel,
    toNext: XP_PER_LEVEL - intoLevel,
    pct: Math.round((intoLevel / XP_PER_LEVEL) * 100),
  };
}

/** Consecutive-day streak ending today (or yesterday), from check-in dates. */
export function computeStreak(checkins: CheckIn[]): number {
  if (checkins.length === 0) return 0;
  const days = new Set(checkins.map((c) => c.date.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count from today or yesterday.
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
