import { GamesIndex } from "../../games-content";
import { buildMetadata } from "../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games",
  title: "Games",
  description: "Games built by Mehmet Gümrah."
});

export default function EnglishGamesPage() {
  return <GamesIndex locale="en" />;
}
