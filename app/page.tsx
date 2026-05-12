import HomeContent from "./home-content";
import LocaleRedirect from "./locale-redirect";

export default function HomePage() {
  return (
    <>
      <LocaleRedirect />
      <HomeContent locale="tr" />
    </>
  );
}
