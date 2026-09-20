import type { MetadataRoute } from "next";

/**
 * Web app manifest — this is what makes MorphMetric installable from the
 * browser's "Add to Home Screen". `display: "standalone"` drops the address
 * bar, which is why globals.css pays back the safe-area insets: in standalone
 * mode nothing else reserves room for the notch or the home indicator.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MorphMetric — Understand your morphology",
    short_name: "MorphMetric",
    description:
      "AI-powered visual analysis and evidence-based guidance to help you understand your features and focus on what you can control.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f9fafc",
    theme_color: "#f9fafc",
    categories: ["health", "lifestyle", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New analysis", short_name: "Scan", url: "/scan" },
      { name: "Dashboard", short_name: "Dashboard", url: "/dashboard" },
    ],
  };
}
