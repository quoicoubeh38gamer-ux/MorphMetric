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
  revokeConsent: () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(K.consent);
    } catch {
      /* ignore */
    }
  },

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
    if (typeof window === "undefined") return;
    try {
      for (const key of [K.report, K.reports, K.history]) window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
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
    if (typeof window === "undefined") return;
    try {
      for (const key of Object.values(K)) window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
