import { MgumrahDetail } from "../../../sites-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/sites/mgumrah",
  title: "mgumrah.com",
  description: "mgumrah.com — Next.js ve Tailwind ile geliştirdiğim çift dilli kişisel site."
});

export default function TurkishMgumrahPage() {
  return <MgumrahDetail locale="tr" />;
}
