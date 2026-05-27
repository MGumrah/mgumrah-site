import { SevcanHomeDetail } from "../../../sites-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/sites/sevcanhome",
  title: "Sevcan Home",
  description: "Sevcan Home e-ticaret sitesi — Next.js ile geliştirilen ev tekstili e-ticaret platformu."
});

export default function TurkishSevcanHomePage() {
  return <SevcanHomeDetail locale="tr" />;
}
