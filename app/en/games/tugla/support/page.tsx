import { TuglaSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/tugla/support",
  title: "Brick Ricochet Support",
  description: "Support information, frequently asked questions and contact for the Brick Ricochet game."
});

export default function EnglishTuglaSupportPage() {
  return <TuglaSupport locale="en" />;
}
