import type { EvidenceSource } from "./types";

/**
 * Evidence database.
 *
 * Recommendations reference these by key. The point of the layer is that the
 * recommendation/LLM side can never "invent" a source — it can only cite one of
 * these, each tagged with an evidence tier. URLs point at recognized public
 * health / scientific organizations.
 */
export const EVIDENCE_SOURCES: Record<string, EvidenceSource> = {
  who_healthy_diet: {
    key: "who_healthy_diet",
    org: "WHO",
    title: "Healthy diet — fact sheet",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    tier: "evidence-backed",
  },
  cdc_sleep: {
    key: "cdc_sleep",
    org: "CDC",
    title: "How much sleep do I need?",
    url: "https://www.cdc.gov/sleep/about/index.html",
    tier: "evidence-backed",
  },
  cdc_youth_activity: {
    key: "cdc_youth_activity",
    org: "CDC",
    title: "Physical activity for children and adolescents",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/children.html",
    tier: "evidence-backed",
  },
  nhs_skincare: {
    key: "nhs_skincare",
    org: "NHS",
    title: "Skin health and acne",
    url: "https://www.nhs.uk/conditions/acne/",
    tier: "evidence-backed",
  },
  nhs_sunscreen: {
    key: "nhs_sunscreen",
    org: "NHS",
    title: "Sunscreen and sun safety",
    url: "https://www.nhs.uk/live-well/seasonal-health/sunscreen-and-sun-safety/",
    tier: "evidence-backed",
  },
  nih_vitamin_d: {
    key: "nih_vitamin_d",
    org: "NIH (ODS)",
    title: "Vitamin D — fact sheet",
    url: "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/",
    tier: "evidence-backed",
  },
  nih_calcium: {
    key: "nih_calcium",
    org: "NIH (ODS)",
    title: "Calcium — fact sheet",
    url: "https://ods.od.nih.gov/factsheets/Calcium-Consumer/",
    tier: "evidence-backed",
  },
  nih_iron: {
    key: "nih_iron",
    org: "NIH (ODS)",
    title: "Iron — fact sheet",
    url: "https://ods.od.nih.gov/factsheets/Iron-Consumer/",
    tier: "evidence-backed",
  },
  efsa_protein: {
    key: "efsa_protein",
    org: "EFSA",
    title: "Dietary reference values for protein",
    url: "https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values",
    tier: "evidence-backed",
  },
  anses_nutrition: {
    key: "anses_nutrition",
    org: "ANSES",
    title: "Nutritional reference values",
    url: "https://www.anses.fr/en",
    tier: "evidence-backed",
  },
  aap_growth: {
    key: "aap_growth",
    org: "AAP (HealthyChildren)",
    title: "Growth and development in adolescence",
    url: "https://www.healthychildren.org/English/ages-stages/teen/Pages/default.aspx",
    tier: "evidence-backed",
  },
  posture_general: {
    key: "posture_general",
    org: "NHS",
    title: "Common posture mistakes and fixes",
    url: "https://www.nhs.uk/live-well/exercise/how-to-sit-correctly/",
    tier: "plausible",
  },
  nhs_orthodontics: {
    key: "nhs_orthodontics",
    org: "NHS",
    title: "Orthodontics (structural jaw/teeth changes)",
    url: "https://www.nhs.uk/conditions/orthodontics/",
    tier: "evidence-backed",
  },
};

export function getEvidence(key?: string): EvidenceSource | null {
  if (!key) return null;
  return EVIDENCE_SOURCES[key] ?? null;
}

export const EVIDENCE_TIER_LABEL: Record<string, string> = {
  "evidence-backed": "Evidence-backed",
  plausible: "Plausible / limited evidence",
  unsupported: "Unsupported",
};
