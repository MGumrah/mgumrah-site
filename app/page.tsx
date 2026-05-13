import HomeContent from "./home-content";
import LocaleRedirect from "./locale-redirect";
import { buildMetadata } from "./site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/",
  title: "Mehmet Gümrah",
  description: "Mehmet Gümrah kişisel website ve uygulama dokümantasyon merkezi."
});

export default function HomePage() {
  return (
    <>
      <LocaleRedirect />
      <HomeContent locale="tr" />
    </>
  );
}
