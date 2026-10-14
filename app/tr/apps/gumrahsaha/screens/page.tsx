import { AppScreens } from "../../../../screens-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/gumrahsaha/screens",
  title: "Gümrah Saha Ekran Turu",
  description: "Gümrah Saha uygulamasının ekranları: ne işe yaradıkları ve ekran görüntüleri."
});

export default function TurkishGumrahSahaScreensPage() {
  return <AppScreens locale="tr" slug="gumrahsaha" />;
}
