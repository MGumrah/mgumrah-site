import { TeknoPortalDownload } from "../../../../apps-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal/download",
  title: "Tekno Portal İndir",
  description:
    "Tekno Portal'ı iPhone, Android veya Windows cihazınıza kurun. Kısa adres: mgumrah.com/portal",
  image: TEKNO_PORTAL_CARD
});

export default function TurkishTeknoPortalDownloadPage() {
  return <TeknoPortalDownload locale="tr" />;
}
