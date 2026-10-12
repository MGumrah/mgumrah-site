import { BalimDetail } from "../../../sites-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/sites/balim",
  title: "Balım Kafe",
  description: "Balım Kafe — the website and QR menu I built for a café in Denizli."
});

export default function EnglishBalimPage() {
  return <BalimDetail locale="en" />;
}
