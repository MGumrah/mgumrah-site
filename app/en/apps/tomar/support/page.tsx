import { TomarSupport } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/tomar/support",
  title: "Tomar Support",
  description: "Support information for the Tomar desktop PDF app."
});

export default function EnglishTomarSupportPage() {
  return <TomarSupport locale="en" />;
}
