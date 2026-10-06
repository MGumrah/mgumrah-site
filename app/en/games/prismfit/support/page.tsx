import { PrismFitSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/prismfit/support",
  title: "Prism Fit Support",
  description: "Support information, frequently asked questions and contact for the Prism Fit game."
});

export default function EnglishPrismFitSupportPage() {
  return <PrismFitSupport locale="en" />;
}
