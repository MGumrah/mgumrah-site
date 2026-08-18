import { TeknoPortalDetail } from "../../../apps-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal",
  title: "Tekno Portal",
  description: "Tekno Portal — a B2B customer portal app for iOS, Android, and Windows. App details.",
  image: TEKNO_PORTAL_CARD
});

export default function EnglishTeknoPortalPage() {
  return <TeknoPortalDetail locale="en" />;
}
