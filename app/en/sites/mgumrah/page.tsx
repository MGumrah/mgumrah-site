import { MgumrahDetail } from "../../../sites-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/sites/mgumrah",
  title: "mgumrah.com",
  description: "mgumrah.com — my bilingual personal site, built with Next.js and Tailwind."
});

export default function EnglishMgumrahPage() {
  return <MgumrahDetail locale="en" />;
}
