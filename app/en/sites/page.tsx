import { SitesIndex } from "../../sites-content";
import { buildMetadata } from "../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/sites",
  title: "Websites",
  description: "Websites built and shipped by Mehmet Gümrah."
});

export default function EnglishSitesPage() {
  return <SitesIndex locale="en" />;
}
