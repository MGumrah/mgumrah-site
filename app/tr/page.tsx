import HomeContent from "../home-content";
import { buildMetadata } from "../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/",
  title: "Mehmet Gümrah",
  description: "Mehmet Gümrah kişisel website ve uygulama dokümantasyon merkezi."
});

export default function TurkishHomePage() {
  return <HomeContent locale="tr" />;
}
