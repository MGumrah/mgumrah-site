import { TeknoPortalSupport } from "../../../../apps-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal/support",
  title: "Tekno Portal Destek",
  description: "Tekno Portal B2B müşteri uygulaması destek bilgileri.",
  image: TEKNO_PORTAL_CARD
});

export default function TurkishTeknoPortalSupportPage() {
  return <TeknoPortalSupport locale="tr" />;
}
