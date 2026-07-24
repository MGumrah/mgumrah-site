import { TeknoPortalDetail } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal",
  title: "Tekno Portal",
  description: "Tekno Portal — a B2B customer portal app for iOS, Android, and Windows. App details."
});

export default function EnglishTeknoPortalPage() {
  return <TeknoPortalDetail locale="en" />;
}
