import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { LEARN_ARTICLES } from "@/lib/learn";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  // The password-reset pages are deliberately absent: they are noindex and
  // only reachable from an emailed link.
  const routes = [
    "", "/scan", "/plan", "/growth", "/learn",
    "/privacy", "/terms", "/legal",
    "/login", "/signup",
  ];

  // Every guide is its own indexable page — this is the content surface that
  // brings people in, so it belongs in the sitemap rather than behind the app.
  const articles = LEARN_ARTICLES.map((a) => `/learn/${a.slug}`);

  return [...routes, ...articles].map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : r.startsWith("/learn/") ? 0.6 : 0.7,
  }));
}
