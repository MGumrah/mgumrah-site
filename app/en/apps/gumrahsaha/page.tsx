import { GumrahSahaDetail } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/gumrahsaha",
  title: "Gümrah Saha",
  description: "Gümrah Saha — a multi-tenant iOS app for field sales teams. App details."
});

export default function EnglishGumrahSahaPage() {
  return <GumrahSahaDetail locale="en" />;
}
