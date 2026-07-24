import { TeknoPortalDetail } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal",
  title: "Tekno Portal",
  description: "Tekno Portal — iOS, Android ve Windows için B2B müşteri portalı uygulaması. Uygulama detayları."
});

export default function TurkishTeknoPortalPage() {
  return <TeknoPortalDetail locale="tr" />;
}
