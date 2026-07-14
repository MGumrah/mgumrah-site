import { TomarSupport } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/tomar/support",
  title: "Tomar Destek",
  description: "Tomar masaüstü PDF uygulaması destek bilgileri."
});

export default function TurkishTomarSupportPage() {
  return <TomarSupport locale="tr" />;
}
