import { SevcanHomeDetail } from "../../../sites-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/sites/sevcanhome",
  title: "Sevcan Home",
  description: "Sevcan Home — Next.js e-commerce site for home textiles."
});

export default function EnglishSevcanHomePage() {
  return <SevcanHomeDetail locale="en" />;
}
