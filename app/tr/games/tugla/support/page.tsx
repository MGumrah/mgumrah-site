import { TuglaSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/tugla/support",
  title: "Brick Ricochet Destek",
  description: "Brick Ricochet oyunu için destek bilgileri, sık sorulan sorular ve iletişim."
});

export default function TurkishTuglaSupportPage() {
  return <TuglaSupport locale="tr" />;
}
