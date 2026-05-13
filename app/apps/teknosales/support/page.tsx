import { TeknoSalesSupport } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknosales/support",
  title: "Tekno Satış Destek",
  description: "Tekno Satış uygulaması destek bilgileri."
});

export default function TeknoSalesSupportPage() {
  return <TeknoSalesSupport locale="tr" />;
}
