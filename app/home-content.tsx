import Link from "next/link";
import ScrollStories from "./scroll-stories";

type Locale = "tr" | "en";

const SITE = {
  github: "https://github.com/MGumrah",
  youtube: "https://www.youtube.com/@MGumrah",
  playStore: "https://play.google.com/store/apps/details?id=com.tekno.satis",
  appStore: "https://apps.apple.com/app/id6766247299"
};

const copy = {
  tr: {
    statusLive: "Tekno Satış · iOS ve Android'de canlı",
    nameLine1: "Mehmet",
    nameLine2: "Gümrah",
    lede: "B2B ekipleri için mobil ve masaüstü uygulamalar tasarlıyor ve geliştiriyorum. Şu an Tekno Satış'ın Windows sürümünü geliştiriyorum.",
    ctaApps: "Uygulamalar",
    introLabel: "Tanıtım",
    nowLocation: "Konum",
    nowLocationValue: "Denizli, Türkiye",
    nowFocus: "Odak",
    nowFocusValue: "Android + iOS + Windows",
    nowStack: "Yığın",
    nowStackValue: "Swift · Kotlin · .NET · React",
    nowStatus: "Durum",
    nowStatusValue: "İşbirliklerine açık",
    featIndex: "01 — Yayında",
    featTitle: "Yayındaki",
    featTitleIt: "uygulama",
    sectionLabel: "Yayındaki uygulama",
    cardEyebrow: "Tek uygulama, üç platform",
    cardBody:
      "B2B satış ekipleri için müşteri hesapları, fatura takibi, tahsilat raporları ve ürün kataloglarını tek bir yerde toplayan; mobil ve masaüstünde çalışan uygulama.",
    detailCta: "Detaylara bak",
    privacyCta: "Gizlilik",
    supportCta: "Destek",
    platformAndroidLive: "Android · Yayında",
    platformIosLive: "iOS · Yayında",
    platformWindowsDev: "Windows · Yakında",
    previewLabel: "Önizleme",
    previewPlatforms: "iOS · Android",
    previewAlt: "Tekno Satış uygulaması — iPhone önizleme",
    platformsLabel: "Desteklenen platformlar",
    appName: "Tekno Satış",
    chapter2Index: "/02",
    chapter2Title: "Tasarım ve geliştirme tek elden",
    chapter2Body:
      "Arayüz, mimari ve dağıtım — uçtan uca tek başıma yapıyorum. Bu yüzden detaylar tutarlı, kararlar hızlı.",
    chapter3Index: "/03",
    chapter3Title: "Üç platform, tek deneyim",
    chapter3Body:
      "Aynı veri, aynı akış; iOS ve Android'de yayında, Windows yolda. Her platforma özgün, ama tutarlı."
  },
  en: {
    statusLive: "Tekno Sales · live on iOS and Android",
    nameLine1: "Mehmet",
    nameLine2: "Gümrah",
    lede: "I design and build mobile and desktop apps for B2B teams. Currently shipping the Windows build of Tekno Sales.",
    ctaApps: "Apps",
    introLabel: "Intro",
    nowLocation: "Location",
    nowLocationValue: "Denizli, Türkiye",
    nowFocus: "Focus",
    nowFocusValue: "Android + iOS + Windows",
    nowStack: "Stack",
    nowStackValue: "Swift · Kotlin · .NET · React",
    nowStatus: "Status",
    nowStatusValue: "Open to collaboration",
    featIndex: "01 — Shipping",
    featTitle: "Currently",
    featTitleIt: "shipping",
    sectionLabel: "Shipping app",
    cardEyebrow: "One app, three platforms",
    cardBody:
      "A mobile and desktop app that brings customer accounts, invoice tracking, collection reports, and product catalogs together for B2B sales teams.",
    detailCta: "View details",
    privacyCta: "Privacy",
    supportCta: "Support",
    platformAndroidLive: "Android · Live",
    platformIosLive: "iOS · Live",
    platformWindowsDev: "Windows · Soon",
    previewLabel: "Preview",
    previewPlatforms: "iOS · Android",
    previewAlt: "Tekno Sales app — iPhone preview",
    platformsLabel: "Supported platforms",
    appName: "Tekno Sales",
    chapter2Index: "/02",
    chapter2Title: "Designed and built end-to-end",
    chapter2Body:
      "Interface, architecture, and shipping — done by one person. The details stay consistent and decisions move fast.",
    chapter3Index: "/03",
    chapter3Title: "Three platforms, one experience",
    chapter3Body:
      "Same data, same flow; live on iOS and Android, Windows on the way. Native to each, but consistent throughout."
  }
};

function ArrowIcon() {
  return (
    <svg className="arrow" aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M5 11L11 5M11 5H6M11 5V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49v-1.73c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.78c0 .27.18.58.69.48A10.1 10.1 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
    </svg>
  );
}

export default function HomeContent({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <>
      <section className="hero container" aria-label={t.introLabel}>
        <p className="kicker">
          <span className="dot" />
          {t.statusLive}
        </p>
        <h1 className="display">
          <span className="br">{t.nameLine1}</span>
          <span className="br">{t.nameLine2}</span>
        </h1>
        <p className="lede">{t.lede}</p>
        <div className="hero-actions">
          <Link className="btn primary" href={`/${locale}/apps/`}>
            {t.ctaApps}
            <ArrowIcon />
          </Link>
          <a className="btn" href={SITE.github} target="_blank" rel="noreferrer">
            <GithubIcon /> GitHub
          </a>
          <a className="btn" href={SITE.youtube} target="_blank" rel="noreferrer">
            <YoutubeIcon /> YouTube
          </a>
        </div>
      </section>

      <div className="container">
        <div className="now-strip">
          <div className="now-cell">
            <span className="now-label">{t.nowLocation}</span>
            <span className="now-value">{t.nowLocationValue}</span>
          </div>
          <div className="now-cell">
            <span className="now-label">{t.nowFocus}</span>
            <span className="now-value">
              <span className="ship-dot" />
              {t.nowFocusValue}
            </span>
          </div>
          <div className="now-cell">
            <span className="now-label">{t.nowStack}</span>
            <span className="now-value">{t.nowStackValue}</span>
          </div>
          <div className="now-cell">
            <span className="now-label">{t.nowStatus}</span>
            <span className="now-value">{t.nowStatusValue}</span>
          </div>
        </div>
      </div>

      <section className="container section" aria-label={t.sectionLabel}>
        <div className="section-head">
          <h2>
            {t.featTitle} <span className="it">{t.featTitleIt}</span>
          </h2>
          <span className="index">{t.featIndex}</span>
        </div>

        <div className="story-stage">
          <div className="story-track">
            <article className="feat-card" data-story="1">
              <span className="corner">/01</span>
              <div className="app-tile">
                <img
                  className="app-tile-icon"
                  src="/images/teknosales-icon.png"
                  alt={`${t.appName} app logo`}
                />
                <div className="app-meta">
                  <span className="sub">{t.cardEyebrow}</span>
                  <span className="name">{t.appName}</span>
                </div>
              </div>
              <p>{t.cardBody}</p>
              <div className="platform-row" aria-label={t.platformsLabel}>
                <a className="platform-chip live" href={SITE.playStore} target="_blank" rel="noreferrer">
                  {t.platformAndroidLive}
                </a>
                <a className="platform-chip live" href={SITE.appStore} target="_blank" rel="noreferrer">
                  {t.platformIosLive}
                </a>
                <span className="platform-chip dev">{t.platformWindowsDev}</span>
              </div>
              <div className="hero-actions" style={{ marginTop: 0 }}>
                <Link className="btn primary" href={`/${locale}/apps/teknosales/`}>
                  {t.detailCta} <ArrowIcon />
                </Link>
                <Link className="btn" href={`/${locale}/apps/teknosales/privacy/`}>
                  {t.privacyCta}
                </Link>
                <Link className="btn" href={`/${locale}/apps/teknosales/support/`}>
                  {t.supportCta}
                </Link>
              </div>
            </article>

            <article className="story-chapter" data-story="2">
              <span className="corner">{t.chapter2Index}</span>
              <h3>{t.chapter2Title}</h3>
              <p>{t.chapter2Body}</p>
            </article>

            <article className="story-chapter" data-story="3">
              <span className="corner">{t.chapter3Index}</span>
              <h3>{t.chapter3Title}</h3>
              <p>{t.chapter3Body}</p>
            </article>
          </div>

          <div className="story-pin" data-story-pin data-active-story="1">
            <aside className="preview-card" aria-hidden="true">
              <div className="grid-bg" />
              <div className="preview-card-inner">
                <img
                  className="phone-img is-light"
                  src="/images/teknosales-device.png"
                  alt={t.previewAlt}
                />
                <img
                  className="phone-img is-dark"
                  src="/images/teknosales-device-dark.png"
                  alt={t.previewAlt}
                />
                <div className="preview-meta">
                  <span>{t.previewLabel}</span>
                  <span>{t.previewPlatforms}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <ScrollStories />
      </section>
    </>
  );
}
