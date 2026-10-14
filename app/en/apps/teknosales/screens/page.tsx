import { AppScreens } from "../../../../screens-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknosales/screens",
  title: "Tekno Sales Screen Tour",
  description: "Every screen in the Tekno Sales menu: what it is for, with screenshots."
});

export default function EnglishTeknoSalesScreensPage() {
  return <AppScreens locale="en" slug="teknosales" />;
}
