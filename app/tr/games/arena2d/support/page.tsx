import { Arena2dSupport } from "../../../../games-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/arena2d/support",
  title: "ARENA 2D Destek",
  description: "ARENA 2D oyunu için destek bilgileri, sık sorulan sorular ve iletişim."
});

export default function TurkishArena2dSupportPage() {
  return <Arena2dSupport locale="tr" />;
}
