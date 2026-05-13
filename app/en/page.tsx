import HomeContent from "../home-content";
import { buildMetadata } from "../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/",
  title: "Mehmet Gümrah",
  description: "Mehmet Gümrah personal website and app documentation hub."
});

export default function EnglishHomePage() {
  return <HomeContent locale="en" />;
}
