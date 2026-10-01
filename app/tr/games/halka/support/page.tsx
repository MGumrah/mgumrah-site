import { HalkaSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/halka/support",
  title: "Halka Destek",
  description: "Halka oyunu için destek bilgileri ve iletişim."
});

export default function TurkishHalkaSupportPage() {
  return <HalkaSupport locale="tr" />;
}
