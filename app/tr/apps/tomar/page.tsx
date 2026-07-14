import { TomarDetail } from "../../../apps-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/tomar",
  title: "Tomar",
  description: "Tomar — Windows için masaüstü PDF görüntüleyici ve düzenleyici. Uygulama detayları."
});

export default function TurkishTomarPage() {
  return <TomarDetail locale="tr" />;
}
