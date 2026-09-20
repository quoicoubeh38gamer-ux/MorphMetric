/**
 * Free-tier scan allowance.
 *
 * Two layers, deliberately:
 *  - The server refuses an analysis without a session once accounts are live
 *    (see app/api/analyze/route.ts). That is the real gate.
 *  - The browser tracks usage so the paywall appears before the request is
 *    made, which is UX, not enforcement — localStorage is user-editable.
 *
 * A quota that cannot be tampered with needs the per-user counter to live in
 * the database, which requires DATABASE_URL to be set. Until then the client
 * count is a speed bump, and this file is the single place that changes.
 */
export const FREE_SCAN_LIMIT = 2;

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  exhausted: boolean;
}

export function quotaFrom(used: number, limit = FREE_SCAN_LIMIT): QuotaState {
  const remaining = Math.max(0, limit - used);
  return { used, limit, remaining, exhausted: remaining === 0 };
}
