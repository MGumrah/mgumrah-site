import { TeknoPortalSupport } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal/support",
  title: "Tekno Portal Destek",
  description: "Tekno Portal B2B müşteri uygulaması destek bilgileri."
});

export default function TurkishTeknoPortalSupportPage() {
  return <TeknoPortalSupport locale="tr" />;
}
