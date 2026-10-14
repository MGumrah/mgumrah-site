import { AppScreens } from "../../../../screens-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/gumrahsaha/screens",
  title: "Gümrah Saha Screen Tour",
  description: "The screens of Gümrah Saha: what each is for, with screenshots."
});

export default function EnglishGumrahSahaScreensPage() {
  return <AppScreens locale="en" slug="gumrahsaha" />;
}
