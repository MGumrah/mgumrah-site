import { TeknoPortalDownload } from "../../../../apps-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal/download",
  title: "Download Tekno Portal",
  description:
    "Install Tekno Portal on your iPhone, Android, or Windows device. Short address: mgumrah.com/portal",
  image: TEKNO_PORTAL_CARD
});

export default function EnglishTeknoPortalDownloadPage() {
  return <TeknoPortalDownload locale="en" />;
}
