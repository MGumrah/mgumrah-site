import { TeknoPortalDownload } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal/download",
  title: "Download Tekno Portal",
  description:
    "Install Tekno Portal on your iPhone, Android, or Windows device. Short address: mgumrah.com/portal"
});

export default function EnglishTeknoPortalDownloadPage() {
  return <TeknoPortalDownload locale="en" />;
}
