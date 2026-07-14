import { TomarDetail } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/tomar",
  title: "Tomar",
  description: "Tomar — a desktop PDF viewer and editor for Windows. App details."
});

export default function EnglishTomarPage() {
  return <TomarDetail locale="en" />;
}
