import type { Metadata } from "next";
import type { Locale } from "./locale";

export const SITE_URL = "https://mgumrah.com";
export const SITE_NAME = "Mehmet Gümrah";

export type { Locale };

/**
 * Tekno Portal's own share card, drawn by app/portal/og.png/route.tsx. Every
 * Tekno Portal page points at it so a pasted link previews as the app and not
 * as the personal site it happens to be hosted on.
 */
export const TEKNO_PORTAL_CARD = { url: "/portal/og.png", alt: "Tekno Portal" };

type BuildArgs = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /**
   * Share card for this page, when the personal one is the wrong face to put
   * on it — an app's pages should preview as that app.
   */
  image?: { url: string; alt: string };
};

export function buildMetadata({ locale, path, title, description, image }: BuildArgs): Metadata {
  const normalized = path === "/" ? "/" : `${path.replace(/\/$/, "")}/`;
  const trUrl = normalized === "/" ? "/tr/" : `/tr${normalized}`;
  const enUrl = normalized === "/" ? "/en/" : `/en${normalized}`;
  const canonical = locale === "tr" ? trUrl : enUrl;
  const isHome = path === "/";
  const card = image ?? { url: "/opengraph-image", alt: SITE_NAME };

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
          url: `${SITE_URL}${card.url}`,
          width: 1200,
          height: 630,
          alt: card.alt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}${card.url}`]
    }
  };
}
