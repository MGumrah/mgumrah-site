import { PrismFitSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/prismfit/support",
  title: "Prism Fit Destek",
  description: "Prism Fit oyunu için destek bilgileri, sık sorulan sorular ve iletişim."
});

export default function TurkishPrismFitSupportPage() {
  return <PrismFitSupport locale="tr" />;
}
