import { GumrahSahaDetail } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/gumrahsaha",
  title: "Gümrah Saha",
  description:
    "Gümrah Saha — saha satış ekipleri için çok firmalı iOS uygulaması. Uygulama detayları."
});

export default function TurkishGumrahSahaPage() {
  return <GumrahSahaDetail locale="tr" />;
}
