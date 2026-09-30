import Link from "next/link";
import type { Locale } from "./locale";

const copy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbGames: "Oyunlar",
    gamesTitle: "Oyunlar",
    gamesIntro: "Geliştirdiğim oyunlar burada toplanacak.",
    gamesListLabel: "Oyun listesi",
    cardEyebrow: "Yeni bölüm",
    cardName: "İlk oyun yolda",
    cardBody: "Bu sayfa hazır; oyunlar hazır oldukça buraya eklenecek.",
    soon: "Yakında"
  },
  en: {
    crumbHome: "Home",
    crumbGames: "Games",
    gamesTitle: "Games",
    gamesIntro: "The games I build will live here.",
    gamesListLabel: "Game list",
    cardEyebrow: "New section",
    cardName: "First game on the way",
    cardBody: "This page is ready; games will be added here as they are finished.",
    soon: "Coming soon"
  }
};

export function GamesIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <span>{t.crumbGames}</span>
        </div>
        <h1>{t.gamesTitle}</h1>
        <p className="meta">{t.gamesIntro}</p>
      </header>

      <section className="feat-grid" aria-label={t.gamesListLabel}>
        <article className="feat-card">
          <div className="site-tile">
            <div className="app-meta">
              <span className="sub">{t.cardEyebrow}</span>
              <span className="name">{t.cardName}</span>
            </div>
          </div>
          <p>{t.cardBody}</p>
          <div className="platform-row">
            <span className="platform-chip">{t.soon}</span>
          </div>
        </article>
      </section>
    </main>
  );
}
