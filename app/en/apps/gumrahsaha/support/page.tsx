import { GumrahSahaSupport } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/gumrahsaha/support",
  title: "Gümrah Saha Support",
  description: "Support information for the Gümrah Saha field sales application."
});

export default function EnglishGumrahSahaSupportPage() {
  return <GumrahSahaSupport locale="en" />;
}
