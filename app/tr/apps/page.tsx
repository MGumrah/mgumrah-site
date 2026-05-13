import { AppsIndex } from "../../apps-content";
import { buildMetadata } from "../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps",
  title: "Uygulamalar",
  description: "Mehmet Gümrah tarafından geliştirilen uygulamalar."
});

export default function TurkishAppsPage() {
  return <AppsIndex locale="tr" />;
}
