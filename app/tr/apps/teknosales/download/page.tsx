import { TeknoSalesDownload } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknosales/download",
  title: "Tekno Satış İndir",
  description:
    "Tekno Satış'ı App Store, Google Play veya Microsoft Store üzerinden kurun; Windows için doğrudan kurulum dosyasını indirin."
});

export default function TurkishTeknoSalesDownloadPage() {
  return <TeknoSalesDownload locale="tr" />;
}
