import type { Metadata } from "next";

export const SITE_URL = "https://mgumrah.com";
export const SITE_NAME = "Mehmet Gümrah";

export type Locale = "tr" | "en";

type BuildArgs = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
};

export function buildMetadata({ locale, path, title, description }: BuildArgs): Metadata {
  const normalized = path === "/" ? "/" : `${path.replace(/\/$/, "")}/`;
  const trUrl = normalized === "/" ? "/tr/" : `/tr${normalized}`;
  const enUrl = normalized === "/" ? "/en/" : `/en${normalized}`;
  const canonical = locale === "tr" ? trUrl : enUrl;
  const isHome = path === "/";

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: {
        tr: trUrl,
        en: enUrl,
        "x-default": trUrl
      }
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      locale: locale === "tr" ? "tr_TR" : "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: SITE_NAME
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`]
    }
  };
}
