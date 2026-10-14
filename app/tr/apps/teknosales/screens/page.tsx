import { AppScreens } from "../../../../screens-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknosales/screens",
  title: "Tekno Satış Ekran Turu",
  description: "Tekno Satış uygulamasının menüsündeki her ekran: ne işe yaradığı ve ekran görüntüleri."
});

export default function TurkishTeknoSalesScreensPage() {
  return <AppScreens locale="tr" slug="teknosales" />;
}
