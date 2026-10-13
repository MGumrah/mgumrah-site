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
    ctaSites: "Web Siteleri",
    introLabel: "Tanıtım",
    nowLocation: "Konum",
    nowLocationValue: "Denizli, Türkiye",
    nowFocus: "Odak",
    nowFocusValue: "Android + iOS + Windows",
    nowStack: "Yığın",
    nowStackValue: "Swift · Kotlin · .NET · React",
    nowStatus: "Durum",
    nowStatusValue: "İşbirliklerine açık"
  },
  en: {
    statusLive: "Tekno Sales · live on iOS, Android, and Windows",
    nameLine1: "Mehmet",
    nameLine2: "Gümrah",
    lede: "I design and build mobile and desktop apps for B2B teams. Tekno Sales is live on iOS, Android, and Windows.",
    ctaApps: "Apps",
    ctaSites: "Websites",
    introLabel: "Intro",
    nowLocation: "Location",
    nowLocationValue: "Denizli, Türkiye",
    nowFocus: "Focus",
    nowFocusValue: "Android + iOS + Windows",
    nowStack: "Stack",
    nowStackValue: "Swift · Kotlin · .NET · React",
    nowStatus: "Status",
    nowStatusValue: "Open to collaboration"
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
          <Link className="btn primary" href={`/${locale}/sites/`}>
            {t.ctaSites}
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
    </>
  );
}
