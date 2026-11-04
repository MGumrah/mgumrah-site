import { Arena2dSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/arena2d/support",
  title: "ARENA 2D Support",
  description: "Support information, frequently asked questions and contact for the ARENA 2D game."
});

export default function EnglishArena2dSupportPage() {
  return <Arena2dSupport locale="en" />;
}
