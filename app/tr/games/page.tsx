import { GamesIndex } from "../../games-content";
import { buildMetadata } from "../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games",
  title: "Oyunlar",
  description: "Mehmet Gümrah tarafından geliştirilen oyunlar."
});

export default function TurkishGamesPage() {
  return <GamesIndex locale="tr" />;
}
