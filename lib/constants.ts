import type { Sex } from "./ai/types";

export const APP_NAME = "MorphMetric";
export const APP_TAGLINE = "Understand your features. Improve what you can control.";

export const MAX_UPLOAD_MB = 8;
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "unspecified", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export const GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: "skin", label: "Better skin" },
  { value: "grooming", label: "Styling & self-care" },
  { value: "presentation", label: "Photo & presentation" },
  { value: "sleep", label: "Sleep & recovery" },
  { value: "nutrition", label: "Nutrition" },
  { value: "fitness", label: "Fitness & activity" },
  { value: "confidence", label: "Confidence" },
];

export const CAPTURE_GUIDELINES = [
  "Face straight to camera",
  "Neutral expression",
  "Good, even lighting",
  "Remove glasses & hats",
  "Plain background if possible",
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plan", label: "Plan" },
  { href: "/growth", label: "Body & Growth" },
  { href: "/privacy", label: "Privacy" },
] as const;
