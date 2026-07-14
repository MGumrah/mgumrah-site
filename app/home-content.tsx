import Link from "next/link";
import { ArrowIcon, GithubIcon, YoutubeIcon } from "./icons";
import { links } from "./site-config";
import type { Locale } from "./locale";

const copy = {
  tr: {
    statusLive: "Tekno Satış · iOS, Android ve Windows'ta canlı",
    nameLine1: "Mehmet",
    nameLine2: "Gümrah",
    lede: "B2B ekipleri için mobil ve masaüstü uygulamalar tasarlıyor ve geliştiriyorum. Tekno Satış iOS, Android ve Windows'ta yayında.",
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
    platformWindowsLive: "Windows · Yayında",
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
      "Aynı veri, aynı akış; iOS, Android ve Windows'ta yayında. Her platforma özgün, ama tutarlı."
  },
  en: {
    statusLive: "Tekno Sales · live on iOS, Android, and Windows",
    nameLine1: "Mehmet",
    nameLine2: "Gümrah",
    lede: "I design and build mobile and desktop apps for B2B teams. Tekno Sales is live on iOS, Android, and Windows.",
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
    platformWindowsLive: "Windows · Live",
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
      "Same data, same flow; live on iOS, Android, and Windows. Native to each, but consistent throughout."
  }
};

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
          <a className="btn" href={links.github} target="_blank" rel="noreferrer">
            <GithubIcon size={16} /> GitHub
          </a>
          <a className="btn" href={links.youtube} target="_blank" rel="noreferrer">
            <YoutubeIcon size={16} /> YouTube
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
            <article className="feat-card">
              <span className="corner">/01</span>
              <div className="app-tile">
                <img
                  className="app-tile-icon"
                  src="/images/teknosales-icon.png"
                  alt={`${t.appName} app logo`}
                  width={256}
                  height={256}
                />
                <div className="app-meta">
                  <span className="sub">{t.cardEyebrow}</span>
                  <span className="name">{t.appName}</span>
                </div>
              </div>
              <p>{t.cardBody}</p>
              <div className="platform-row" aria-label={t.platformsLabel}>
                <a className="platform-chip live" href={links.playStore} target="_blank" rel="noreferrer">
                  {t.platformAndroidLive}
                </a>
                <a className="platform-chip live" href={links.appStore} target="_blank" rel="noreferrer">
                  {t.platformIosLive}
                </a>
                <a className="platform-chip live" href={links.windowsDownload} download>
                  {t.platformWindowsLive}
                </a>
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

            <article className="story-chapter">
              <span className="corner">{t.chapter2Index}</span>
              <h3>{t.chapter2Title}</h3>
              <p>{t.chapter2Body}</p>
            </article>

            <article className="story-chapter">
              <span className="corner">{t.chapter3Index}</span>
              <h3>{t.chapter3Title}</h3>
              <p>{t.chapter3Body}</p>
            </article>
          </div>

          <div className="story-pin">
            <aside className="preview-card" aria-hidden="true">
              <div className="grid-bg" />
              <div className="preview-card-inner">
                <img
                  className="phone-img is-light"
                  src="/images/teknosales-device.png"
                  alt={t.previewAlt}
                  width={720}
                  height={960}
                  loading="lazy"
                  decoding="async"
                />
                <img
                  className="phone-img is-dark"
                  src="/images/teknosales-device-dark.png"
                  alt={t.previewAlt}
                  width={720}
                  height={960}
                  loading="lazy"
                  decoding="async"
                />
                <div className="preview-meta">
                  <span>{t.previewLabel}</span>
                  <span>{t.previewPlatforms}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
