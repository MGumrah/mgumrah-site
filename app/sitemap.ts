import type { MetadataRoute } from "next";
import { SITE_URL } from "./site-metadata";

export const dynamic = "force-static";

const paths = [
  "/",
  "/apps/",
  "/apps/teknosales/",
  "/apps/teknosales/privacy/",
  "/apps/teknosales/support/",
  "/sites/",
  "/sites/sevcanhome/"
];

function url(locale: "tr" | "en", path: string) {
  return `${SITE_URL}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    for (const locale of ["tr", "en"] as const) {
      entries.push({
        url: url(locale, path),
        lastModified: now,
        changeFrequency: "monthly",
        priority: path === "/" ? 1 : 0.7,
        alternates: {
          languages: {
            tr: url("tr", path),
            en: url("en", path)
          }
        }
      });
    }
  }

  return entries;
}
