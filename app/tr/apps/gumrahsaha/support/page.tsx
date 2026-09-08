import { GumrahSahaSupport } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/gumrahsaha/support",
  title: "Gümrah Saha Destek",
  description: "Gümrah Saha saha satış uygulaması destek bilgileri."
});

export default function TurkishGumrahSahaSupportPage() {
  return <GumrahSahaSupport locale="tr" />;
}
