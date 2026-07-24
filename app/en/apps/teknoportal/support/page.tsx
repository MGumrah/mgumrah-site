import { TeknoPortalSupport } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal/support",
  title: "Tekno Portal Support",
  description: "Support information for the Tekno Portal B2B customer app."
});

export default function EnglishTeknoPortalSupportPage() {
  return <TeknoPortalSupport locale="en" />;
}
