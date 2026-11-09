import type { Metadata } from "next";
import { PortalRedirect } from "../portal-redirect";
import { SITE_URL, TEKNO_PORTAL_CARD } from "../site-metadata";

/**
 * Repeated into the preview tags below rather than left to the page title: the
 * site's title template signs every title with the owner's name, which belongs
 * on a portfolio page and not on the link a customer is handed in WhatsApp.
 */
const SHARE_TITLE = "Tekno Portal İndir";

export const metadata: Metadata = {
  title: SHARE_TITLE,
  description: "Tekno Portal'ı cihazınıza kurun — App Store, Google Play veya Microsoft Store.",
  // A hop, not a page: the download page is the one that should rank, and a
  // page that sends its visitors away is worth nothing in an index anyway.
  robots: { index: false, follow: true },
  // Self-referencing on purpose. Pointing the canonical at the download page
  // while this page says noindex hands Google two contradictory instructions,
  // and the way it resolves them is to carry the noindex over to the canonical
  // target — which would drop the download page out of the index with it.
  alternates: { canonical: "/portal/" },
  // This is the address that actually gets pasted into WhatsApp, so the card
  // it draws matters more here than anywhere else on the site.
  openGraph: {
    title: SHARE_TITLE,
    siteName: TEKNO_PORTAL_CARD.siteName,
    images: [
      {
        url: `${SITE_URL}${TEKNO_PORTAL_CARD.url}`,
        width: 1200,
        height: 630,
        alt: TEKNO_PORTAL_CARD.alt
      }
    ]
  },
  twitter: { card: "summary_large_image", title: SHARE_TITLE, images: [`${SITE_URL}${TEKNO_PORTAL_CARD.url}`] }
};

/**
 * mgumrah.com/portal — the address customers are given. It opens the store for
 * whichever device tapped it; everything that makes that happen lives in the
 * client component, which has to run in the browser to see the platform.
 */
export default function PortalShortLinkPage() {
  return <PortalRedirect />;
}
