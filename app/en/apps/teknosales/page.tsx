import { TeknoSalesDetail } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknosales",
  title: "Tekno Sales",
  description: "Tekno Sales iOS and Android app details."
});

export default function EnglishTeknoSalesPage() {
  return <TeknoSalesDetail locale="en" />;
}
