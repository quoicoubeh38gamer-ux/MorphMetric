import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { LEARN_ARTICLES } from "@/lib/learn";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const routes = ["", "/scan", "/plan", "/growth", "/learn", "/privacy", "/login", "/signup"];

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
