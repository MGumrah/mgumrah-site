import type { Metadata } from "next";
import { PortalRedirect } from "../portal-redirect";

export const metadata: Metadata = {
  title: "Tekno Portal İndir",
  description: "Tekno Portal'ı cihazınıza kurun — App Store, Google Play veya Microsoft Store.",
  // A hop, not a page: the download page is the one that should rank, and a
  // page that sends its visitors away is worth nothing in an index anyway.
  robots: { index: false, follow: true },
  alternates: { canonical: "/tr/apps/teknoportal/download/" }
};

/**
 * mgumrah.com/portal — the address customers are given. It opens the store for
 * whichever device tapped it; everything that makes that happen lives in the
 * client component, which has to run in the browser to see the platform.
 */
export default function PortalShortLinkPage() {
  return <PortalRedirect />;
}
