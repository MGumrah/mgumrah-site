import { HalkaSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/halka/support",
  title: "Halka Support",
  description: "Support information and contact for the Halka game."
});

export default function EnglishHalkaSupportPage() {
  return <HalkaSupport locale="en" />;
}
