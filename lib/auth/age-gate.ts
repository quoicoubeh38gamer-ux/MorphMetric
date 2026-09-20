import { LEGAL } from "@/lib/legal";

/**
 * Server-side age gate for sign-up.
 *
 * The check lives in the auth route rather than in the form, because a check
 * the browser performs is a suggestion: anyone can POST directly to the
 * sign-up endpoint. The route reads the birth date out of the request body,
 * validates it here, and only forwards the request to Better Auth if it
 * passes — the date itself is then dropped and never written anywhere.
 *
 * Storing only the outcome is deliberate (GDPR art. 5(1)(c), data
 * minimisation): we need to know that someone was old enough, not when they
 * were born.
 */

export type AgeCheck =
  | { ok: true }
  | { ok: false; code: "missing" | "malformed" | "future" | "implausible" | "too_young"; message: string };

const MAX_PLAUSIBLE_AGE = 120;

/** Whole years elapsed, counting the birthday itself. */
export function ageInYears(birth: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
}

export function checkAge(raw: unknown, now: Date = new Date()): AgeCheck {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, code: "missing", message: "Enter your date of birth." };
  }

  // Accept only the ISO date the <input type="date"> produces. Date.parse is
  // lenient enough to turn nonsense into a valid date, which would let a
  // malformed value through as a real one.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!match) {
    return { ok: false, code: "malformed", message: "Enter your date of birth as YYYY-MM-DD." };
  }
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const birth = new Date(Date.UTC(year, month - 1, day));

  // Round-trip guards against 2026-02-31 silently becoming 2026-03-03.
  if (
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day
  ) {
    return { ok: false, code: "malformed", message: "That date does not exist." };
  }

  if (birth.getTime() > now.getTime()) {
    return { ok: false, code: "future", message: "That date is in the future." };
  }

  const age = ageInYears(birth, now);
  if (age > MAX_PLAUSIBLE_AGE) {
    return { ok: false, code: "implausible", message: "Please check that date." };
  }
  if (age < LEGAL.minimumAge) {
    return {
      ok: false,
      code: "too_young",
      message: `You need to be at least ${LEGAL.minimumAge} to create an account.`,
    };
  }
  return { ok: true };
}
