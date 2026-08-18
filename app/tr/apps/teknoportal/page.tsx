import { TeknoPortalDetail } from "../../../apps-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal",
  title: "Tekno Portal",
  description: "Tekno Portal — iOS, Android ve Windows için B2B müşteri portalı uygulaması. Uygulama detayları.",
  image: TEKNO_PORTAL_CARD
});

export default function TurkishTeknoPortalPage() {
  return <TeknoPortalDetail locale="tr" />;
}
