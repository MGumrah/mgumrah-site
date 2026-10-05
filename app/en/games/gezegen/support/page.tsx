import { GezegenSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/gezegen/support",
  title: "Gezegen Support",
  description: "Support information, frequently asked questions and contact for the Gezegen: Planet Merge game."
});

export default function EnglishGezegenSupportPage() {
  return <GezegenSupport locale="en" />;
}
