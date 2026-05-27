import { SitesIndex } from "../../sites-content";
import { buildMetadata } from "../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/sites",
  title: "Web Siteleri",
  description: "Mehmet Gümrah tarafından geliştirilen web siteleri."
});

export default function TurkishSitesPage() {
  return <SitesIndex locale="tr" />;
}
