import { GezegenSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/gezegen/support",
  title: "Gezegen Destek",
  description: "Gezegen: Planet Merge oyunu için destek bilgileri, sık sorulan sorular ve iletişim."
});

export default function TurkishGezegenSupportPage() {
  return <GezegenSupport locale="tr" />;
}
