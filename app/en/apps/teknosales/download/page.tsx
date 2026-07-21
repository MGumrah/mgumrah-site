import { TeknoSalesDownload } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknosales/download",
  title: "Download Tekno Sales",
  description:
    "Install Tekno Sales from the App Store, Google Play, or the Microsoft Store, or download the direct Windows installer."
});

export default function EnglishTeknoSalesDownloadPage() {
  return <TeknoSalesDownload locale="en" />;
}
