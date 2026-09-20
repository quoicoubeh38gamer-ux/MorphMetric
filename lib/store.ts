// Client-side persistence for the DB-less MVP.
//
// Latest report, profile, check-ins, scan history and glow-up plan progress live
// in localStorage. All reads/writes are wrapped so the app renders correctly
// when storage is unavailable. `clearAll` powers "Delete my data".

import type { FaceReport, GrowthInput, Profile } from "./ai/types";

const NS = "mm:";
const K = {
  report: `${NS}report`,
  profile: `${NS}profile`,
  growth: `${NS}growth`,
  checkins: `${NS}checkins`,
  xp: `${NS}xp`,
  history: `${NS}history`,
  plan: `${NS}plan`,
  reports: `${NS}reports`,
  consent: `${NS}consent`,
  settings: `${NS}settings`,
  styleTried: `${NS}styleTried`,
  scanCount: `${NS}scanCount`,
} as const;

/** How many full reports we keep. Bounded so localStorage never fills up. */
const MAX_REPORTS = 12;

/** The consent version. Bump when what we process materially changes. */
export const CONSENT_VERSION = "2026-09-1";

export interface ConsentRecord {
  version: string;
  acceptedAt: string; // ISO
}

export interface Settings {
  /** When false, nothing is written to history — analyses stay ephemeral. */
  saveHistory: boolean;
}

export const DEFAULT_SETTINGS: Settings = { saveHistory: true };

/**
 * In-memory mirror of every write.
 *
 * localStorage is not guaranteed: iOS Safari private browsing gives it a zero
 * quota, "block site data" makes every access throw, and a full origin throws
 * QuotaExceededError. Without this mirror a failed write was silent, so a user
 * could sit through a full analysis and land on an empty results page — the
 * report had been written to nothing.
 *
 * The mirror is a fallback, never a shadow copy: `remove` clears both, so
 * "delete my data" really deletes, and a working localStorage always wins.
 */
const memory = new Map<string, unknown>();

/** Whether the last write reached real storage. Drives the honest UI notice. */
let persistent = true;

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    // Storage works but the key is absent — which is also what happens when a
    // write failed on quota, so the mirror is the only place it can be.
    return memory.has(key) ? (memory.get(key) as T) : null;
  } catch {
    // Storage threw: it is unavailable, so the mirror is the source of truth.
    return memory.has(key) ? (memory.get(key) as T) : null;
  }
}

/** Returns false when the value only made it to memory, not to disk. */
function write(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    persistent = false;
    return false;
  }
}

/** Remove from both layers — a half-removal would resurrect deleted data. */
function remove(key: string): void {
  if (typeof window === "undefined") return;
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* already gone as far as the user is concerned */
  }
}

export interface CheckIn {
  date: string; // ISO
  sleepHours: number | null;
  hydration: boolean;
  meals: boolean;
  activity: boolean;
}

export interface ScanSnapshot {
  id: string;
  createdAt: string;
  morphScore: number;
  potentialScore: number;
  provider: string;
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

  // Scan history (most-recent first) for progress tracking.
  getHistory: () => read<ScanSnapshot[]>(K.history) ?? [],
  addSnapshot: (s: ScanSnapshot) => {
    const list = read<ScanSnapshot[]>(K.history) ?? [];
    list.unshift(s);
    write(K.history, list.slice(0, 40));
  },

  // Full reports, newest first — powers History and side-by-side comparison.
  getReports: () => read<FaceReport[]>(K.reports) ?? [],
  addReport: (r: FaceReport) => {
    const list = read<FaceReport[]>(K.reports) ?? [];
    write(K.reports, [r, ...list.filter((x) => x.id !== r.id)].slice(0, MAX_REPORTS));
  },
  getReportById: (id: string) => (read<FaceReport[]>(K.reports) ?? []).find((r) => r.id === id) ?? null,
  removeReport: (id: string) => {
    const list = read<FaceReport[]>(K.reports) ?? [];
    write(K.reports, list.filter((r) => r.id !== id));
  },

  // Scans consumed against the free allowance. UX-level only — the database
  // owns the authoritative count once accounts are live.
  getScanCount: () => read<number>(K.scanCount) ?? 0,
  incrementScanCount: () => write(K.scanCount, (read<number>(K.scanCount) ?? 0) + 1),

  // Explicit consent — nothing is processed before this exists.
  getConsent: () => read<ConsentRecord>(K.consent),
  setConsent: () => write(K.consent, { version: CONSENT_VERSION, acceptedAt: new Date().toISOString() }),
  hasValidConsent: () => read<ConsentRecord>(K.consent)?.version === CONSENT_VERSION,
  revokeConsent: () => remove(K.consent),

  getSettings: (): Settings => ({ ...DEFAULT_SETTINGS, ...(read<Partial<Settings>>(K.settings) ?? {}) }),
  setSettings: (s: Partial<Settings>) => {
    const current = { ...DEFAULT_SETTINGS, ...(read<Partial<Settings>>(K.settings) ?? {}) };
    write(K.settings, { ...current, ...s });
  },

  // Style Lab: ideas the user marked as tried.
  getStyleTried: () => read<Record<string, boolean>>(K.styleTried) ?? {},
  toggleStyleTried: (id: string) => {
    const t = read<Record<string, boolean>>(K.styleTried) ?? {};
    t[id] = !t[id];
    write(K.styleTried, t);
    return t;
  },

  /** Wipe every stored analysis but keep consent + settings. */
  clearAnalyses: () => {
    for (const key of [K.report, K.reports, K.history]) remove(key);
  },

  // Glow-up plan task completion (taskId -> done).
  getPlanProgress: () => read<Record<string, boolean>>(K.plan) ?? {},
  setPlanTask: (id: string, done: boolean) => {
    const p = read<Record<string, boolean>>(K.plan) ?? {};
    p[id] = done;
    write(K.plan, p);
  },

  /** Delete my data: wipe every MorphMetric key from this browser. */
  clearAll: () => {
    for (const key of Object.values(K)) remove(key);
  },

  /**
   * False once a write has failed to reach real storage. The session still
   * works from the mirror, but nothing survives a reload — the UI says so
   * rather than letting the user believe their history is being kept.
   */
  isPersistent: () => persistent,
};
