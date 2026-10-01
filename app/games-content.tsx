import Link from "next/link";
import type { Locale } from "./locale";
import { links } from "./site-config";

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

const halkaCopy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbGames: "Oyunlar",
    gameName: "Halka",
    crumbSupport: "Destek",
    supportTitle: "Destek",
    supportTitleIt: "Kanalları",
    supportIntro: "Halka ile ilgili bir sorununuz, öneriniz ya da geri bildiriminiz varsa bize yazın.",
    supportSectionLabel: "Destek kanalları",
    supportDeveloper: "Geliştirici",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Yazarken cihaz modelinizi (iPhone/iPad), iOS sürümünüzü ve yaşadığınız sorunu kısaca belirtin; mümkünse ekran görüntüsü ekleyin.",
    supportResponse: "Yanıt Süresi",
    supportResponseHeading: "Yanıt süresi",
    supportResponseText: "Talepler iş günleri içinde, genellikle aynı gün değerlendirilir.",
    privacyCta: "Gizlilik",
    supportPrivacyText: "Halka kişisel veri toplamaz; ayrıntılar için gizlilik sayfasına bakın."
  },
  en: {
    crumbHome: "Home",
    crumbGames: "Games",
    gameName: "Halka",
    crumbSupport: "Support",
    supportTitle: "Support",
    supportTitleIt: "Channels",
    supportIntro: "If you have a problem, a suggestion or feedback about Halka, write to us.",
    supportSectionLabel: "Support channels",
    supportDeveloper: "Developer",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Please mention your device model (iPhone/iPad), your iOS version and a short description of the problem; add a screenshot if you can.",
    supportResponse: "Response Time",
    supportResponseHeading: "Response time",
    supportResponseText: "Requests are reviewed during business days, usually within the same day.",
    privacyCta: "Privacy",
    supportPrivacyText: "Halka collects no personal data; see the privacy page for details."
  }
};

/**
 * Support page for Halka, the address given to the App Store as the support URL. Mirrors the app support pages
 * (TomarSupport); the game has no page of its own yet, so its name in the breadcrumb is plain text.
 */
export function HalkaSupport({ locale }: { locale: Locale }) {
  const t = halkaCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/games/`}>{t.crumbGames}</Link>
          <span>/</span>
          <span>{t.gameName}</span>
          <span>/</span>
          <span>{t.crumbSupport}</span>
        </div>
        <h1>
          {t.supportTitle} <span className="it">{t.supportTitleIt}</span>
        </h1>
        <p className="meta">{t.supportIntro}</p>
      </header>

      <section className="feature-grid" aria-label={t.supportSectionLabel}>
        <div className="channel-card">
          <span className="label">{t.supportDeveloper}</span>
          <h3>{t.supportDeveloperName}</h3>
          <p>{t.supportDeveloperText}</p>
          <a className="link" href={`mailto:${links.email}`}>
            {links.email}
          </a>
          <a className="link" href={`https://${links.domain}`} target="_blank" rel="noreferrer">
            {links.domain}
          </a>
        </div>

        <div className="channel-card">
          <span className="label">{t.supportResponse}</span>
          <h3>{t.supportResponseHeading}</h3>
          <p>{t.supportResponseText}</p>
        </div>

        <div className="channel-card">
          <span className="label">{t.privacyCta}</span>
          <h3>{t.privacyCta}</h3>
          <p>{t.supportPrivacyText}</p>
          <Link className="link" href={`/${locale}/games/halka/privacy/`}>
            {t.privacyCta} →
          </Link>
        </div>
      </section>
    </main>
  );
}
