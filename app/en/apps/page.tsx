import { AppsIndex } from "../../apps-content";
import { buildMetadata } from "../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps",
  title: "Apps",
  description: "Mobile apps maintained by Mehmet Gümrah."
});

export default function EnglishAppsPage() {
  return <AppsIndex locale="en" />;
}
