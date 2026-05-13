import { TeknoSalesDetail } from "../../apps-content";
import { buildMetadata } from "../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknosales",
  title: "Tekno Satış",
  description: "Tekno Satış iOS ve Android uygulama detayları."
});

export default function TeknoSalesPage() {
  return <TeknoSalesDetail locale="tr" />;
}
