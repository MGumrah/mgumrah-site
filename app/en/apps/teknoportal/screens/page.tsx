import { AppScreens } from "../../../../screens-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal/screens",
  title: "Tekno Portal Screen Tour",
  description: "Every screen in Tekno Portal: what it is for, with screenshots.",
  image: TEKNO_PORTAL_CARD
});

export default function EnglishTeknoPortalScreensPage() {
  return <AppScreens locale="en" slug="teknoportal" />;
}
