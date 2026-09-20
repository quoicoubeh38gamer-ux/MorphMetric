/**
 * Legal identity and policy constants.
 *
 * ── FILL THIS IN BEFORE LAUNCH ──────────────────────────────────────────────
 * Everything marked TODO is a real-world fact only the operator knows. The
 * legal pages read from here, so filling this file updates all of them at
 * once. Shipping with the placeholders still in place is a defect, not a
 * cosmetic detail: in France an incomplete "mentions légales" is a specific
 * offence (Loi pour la confiance dans l'économie numérique, art. 6-III), and
 * Stripe checks these pages before approving a merchant account.
 *
 * `npm run legal:check` fails while any TODO remains.
 * ────────────────────────────────────────────────────────────────────────────
 */

export const LEGAL = {
  /** Trading name shown to users. */
  productName: "MorphMetric",

  /** TODO: the person or company legally responsible for the service. */
  entityName: "TODO_LEGAL_ENTITY_NAME",

  /** TODO: "sole trader" / "SAS" / "SASU" / "auto-entrepreneur", etc. */
  entityForm: "TODO_LEGAL_FORM",

  /** TODO: company registration number (SIREN/SIRET in France). Leave "" if a private individual. */
  registrationNumber: "TODO_SIREN_OR_EMPTY",

  /** TODO: VAT number if registered, otherwise "". */
  vatNumber: "",

  /** TODO: the registered postal address. Required — a PO box is acceptable. */
  address: "TODO_POSTAL_ADDRESS",

  /** TODO: the country of establishment. Governs which law applies. */
  country: "France",

  /** TODO: publication director — usually the founder. */
  publicationDirector: "TODO_FULL_NAME",

  /** Contact addresses. TODO: these must be real, monitored mailboxes. */
  contactEmail: "TODO@example.com",
  privacyEmail: "TODO@example.com",

  /** Hosting provider. Vercel unless the deployment moves. */
  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, United States",
    url: "https://vercel.com",
  },

  /** Database host. Neon unless the deployment moves. */
  database: {
    name: "Neon Inc.",
    region: "EU (Frankfurt) — confirm the region chosen in the Neon dashboard",
  },

  /**
   * Minimum age for an account.
   *
   * 16 is not arbitrary. GDPR art. 8 sets the digital-consent age at 16 and
   * lets member states lower it to 13 (France chose 15). Setting the bar at 16
   * means the service never needs to collect or verify parental consent, which
   * is both safer for a young audience and far simpler to operate than the
   * alternative. COPPA (under 13, US) is covered by the same line.
   */
  minimumAge: 16,

  /** Last substantive change to the policies. Update when you edit them. */
  effectiveDate: "2026-09-20",

  /** How long an inactive account is kept before deletion. */
  inactivityRetentionMonths: 24,
} as const;

/** True while any placeholder is still unfilled — used by the launch check. */
export function legalPlaceholdersRemaining(): string[] {
  const missing: string[] = [];
  for (const [key, value] of Object.entries(LEGAL)) {
    if (typeof value === "string" && value.includes("TODO")) missing.push(key);
  }
  return missing;
}

/** Jurisdiction sentence, kept in one place so the pages cannot disagree. */
export const GOVERNING_LAW = `These terms are governed by the law of ${LEGAL.country}.`;
