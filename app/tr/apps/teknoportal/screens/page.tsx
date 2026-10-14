import { AppScreens } from "../../../../screens-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal/screens",
  title: "Tekno Portal Ekran Turu",
  description: "Tekno Portal uygulamasındaki her ekran: ne işe yaradığı ve ekran görüntüleri."
});

export default function TurkishTeknoPortalScreensPage() {
  return <AppScreens locale="tr" slug="teknoportal" />;
}
