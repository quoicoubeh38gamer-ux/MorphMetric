// Client-side persistence for the DB-less MVP.
//
// The latest report, the profile and check-ins live in localStorage. All reads
// and writes are wrapped so the app renders correctly when storage is
// unavailable (private mode, blocked, thumbnailing). `clearAll` powers the
// "Delete my data" control.

import type { FaceReport, GrowthInput, Profile } from "./ai/types";

const NS = "mm:";
const K = {
  report: `${NS}report`,
  profile: `${NS}profile`,
  growth: `${NS}growth`,
  checkins: `${NS}checkins`,
  xp: `${NS}xp`,
} as const;

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export const store = {
  getReport: () => read<FaceReport>(K.report),
  setReport: (r: FaceReport) => write(K.report, r),

  getProfile: () => read<Profile>(K.profile),
  setProfile: (p: Profile) => write(K.profile, p),

  getGrowth: () => read<GrowthInput>(K.growth),
  setGrowth: (g: GrowthInput) => write(K.growth, g),

  getXp: () => read<number>(K.xp) ?? 0,
  addXp: (amount: number) => write(K.xp, (read<number>(K.xp) ?? 0) + amount),

  getCheckins: () => read<CheckIn[]>(K.checkins) ?? [],
  addCheckin: (c: CheckIn) => {
    const list = read<CheckIn[]>(K.checkins) ?? [];
    list.unshift(c);
    write(K.checkins, list.slice(0, 60));
  },

  /** Delete my data: wipe every MorphMetric key from this browser. */
  clearAll: () => {
    if (typeof window === "undefined") return;
    try {
      for (const key of Object.values(K)) window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export interface CheckIn {
  date: string; // ISO
  sleepHours: number | null;
  hydration: boolean;
  meals: boolean;
  activity: boolean;
}
