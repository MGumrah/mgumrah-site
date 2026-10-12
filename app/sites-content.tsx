import Link from "next/link";
import { ArrowIcon } from "./icons";
import { links } from "./site-config";
import type { Locale } from "./locale";

const copy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbSites: "Web Siteleri",
    sitesTitle: "Web Siteleri",
    sitesIntro: "Geliştirip yayına aldığım web siteleri ve canlı bağlantıları.",
    sitesListLabel: "Web sitesi listesi",
    cardEyebrow: "E-ticaret · Ev tekstili",
    siteName: "Sevcan Home",
    cardBody:
      "Nevresim, çarşaf takımı ve banyo/mutfak ürünleri için Next.js + Tailwind ile geliştirdiğim e-ticaret sitesi. Ürün katalogları, sepet ve ödeme akışı dahil.",
    detailCta: "Detaylara bak",
    visitCta: "Siteyi Aç",
    repoCta: "GitHub",
    platformWebLive: "Web · Yayında",
    platformsLabel: "Yayın durumu",
    previewLabel: "Önizleme",
    previewPlatforms: "sevcanhome.com",
    previewAlt: "Sevcan Home sitesi — anasayfa önizleme",
    detailTitle: "Sevcan Home",
    detailIntro:
      "Ev tekstili e-ticareti için Next.js ve Tailwind ile uçtan uca geliştirdiğim site. Ürün listeleme, kategori sayfaları, sepet ve ödeme akışı tek elden.",
    detailSection: "Site detayları",
    detailBody:
      "Sevcan Home; nevresim, çarşaf takımı ve banyo/mutfak ürünleri sunan bir e-ticaret sitesi. Müşteriler kategorilere göz atabilir, ürün detaylarını inceleyebilir ve localStorage tabanlı sepet üzerinden siparişi tamamlayabilir.",
    techStack: "Teknolojiler",
    techStackValue: "Next.js 16 · TypeScript · Tailwind CSS · Cloudflare Workers",
    features: "Özellikler",
    featuresValue: "Ürün katalogları, sepet, ödeme akışı, iletişim sayfası",
    status: "Durum",
    statusValue: "Canlı yayında — sevcanhome.com adresinden erişilebilir."
  },
  en: {
    crumbHome: "Home",
    crumbSites: "Websites",
    sitesTitle: "Websites",
    sitesIntro: "Websites I built and shipped, with their live links.",
    sitesListLabel: "Website list",
    cardEyebrow: "E-commerce · Home textiles",
    siteName: "Sevcan Home",
    cardBody:
      "An e-commerce site built end-to-end with Next.js and Tailwind for bedding, sheet sets, and bath/kitchen products. Product catalogs, cart, and checkout flow included.",
    detailCta: "View details",
    visitCta: "Visit site",
    repoCta: "GitHub",
    platformWebLive: "Web · Live",
    platformsLabel: "Live status",
    previewLabel: "Preview",
    previewPlatforms: "sevcanhome.com",
    previewAlt: "Sevcan Home website — homepage preview",
    detailTitle: "Sevcan Home",
    detailIntro:
      "An end-to-end e-commerce site I built with Next.js and Tailwind for a home-textiles brand. Product listings, category pages, cart, and checkout — all delivered solo.",
    detailSection: "Site details",
    detailBody:
      "Sevcan Home is an e-commerce site for bedding, sheet sets, and bath/kitchen products. Customers can browse categories, review product details, and complete orders through a localStorage-backed cart.",
    techStack: "Tech stack",
    techStackValue: "Next.js 16 · TypeScript · Tailwind CSS · Cloudflare Workers",
    features: "Features",
    featuresValue: "Product catalogs, cart, checkout flow, contact page",
    status: "Status",
    statusValue: "Live at sevcanhome.com."
  }
};

/**
 * mgumrah.com — this site itself, listed as one of the shipped websites.
 * Kept in its own copy table so the Sevcan Home strings above stay untouched.
 */
const mgumrahCopy = {
  tr: {
    cardEyebrow: "Kişisel site · Portfolyo",
    siteName: "mgumrah.com",
    cardBody:
      "Uygulama ve web sitesi portföyümü, gizlilik/destek sayfalarını ve iletişim bağlantılarını tek çatı altında toplayan, Next.js ve Tailwind ile geliştirdiğim çift dilli (TR/EN) kişisel site.",
    detailTitle: "mgumrah.com",
    detailIntro:
      "Geliştirdiğim uygulama ve web sitelerini, bunların gizlilik/destek sayfalarını ve iletişim bağlantılarımı tek yerde toplayan, Next.js ve Tailwind ile uçtan uca geliştirdiğim kişisel site.",
    detailBody:
      "mgumrah.com; Tekno Satış ve Tomar gibi uygulamaları, Sevcan Home gibi web sitelerini, App Store/Google Play bağlantılarını ve gizlilik/destek dokümantasyonunu tek bir çatı altında sunar. Türkçe ve İngilizce olarak yayında, Cloudflare Workers üzerinden sunuluyor.",
    featuresValue: "Çift dilli içerik (TR/EN), uygulama ve site portföyü, gizlilik/destek sayfaları, SEO/sitemap",
    statusValue: "Canlı yayında — mgumrah.com adresinden erişilebilir."
  },
  en: {
    cardEyebrow: "Personal site · Portfolio",
    siteName: "mgumrah.com",
    cardBody:
      "My bilingual (TR/EN) personal site, built with Next.js and Tailwind, bringing my app and website portfolio, privacy/support pages, and contact links together in one place.",
    detailTitle: "mgumrah.com",
    detailIntro:
      "A bilingual personal site I built end-to-end with Next.js and Tailwind, bringing together the apps and websites I've shipped, their privacy/support pages, and my contact links.",
    detailBody:
      "mgumrah.com showcases apps like Tekno Sales and Tomar, websites like Sevcan Home, links to the App Store/Google Play, and privacy/support documentation, all in one place. It's live in Turkish and English, served from Cloudflare Workers.",
    featuresValue: "Bilingual content (TR/EN), app and site portfolio, privacy/support pages, SEO/sitemap",
    statusValue: "Live at mgumrah.com."
  }
};

/**
 * balim.cafe — the public site and QR menu of a family café in Denizli.
 * Own copy table like mgumrah.com above; the repo is private, so the cards carry
 * no GitHub button. The tech stack is its own string because this site has no
 * Tailwind (the shared `techStackValue` names it).
 */
const balimCopy = {
  tr: {
    cardEyebrow: "Kafe · Denizli",
    siteName: "Balım Kafe",
    cardBody:
      "Denizli'deki Balım Kafe için hazırladığım tanıtım sitesi ve QR menü. Adres, harita, iletişim ve çalışma saatleri tek sayfada; menü ve metinler kod değiştirmeden güncellenir.",
    detailTitle: "Balım Kafe",
    detailIntro:
      "Denizli'de evde yapılmış tadı sunan küçük bir kafe için Next.js ile uçtan uca geliştirdiğim tanıtım sitesi ve masalardaki QR kodla açılan menü.",
    detailBody:
      "Balım Kafe'nin herkese açık sitesi: kafenin hikâyesi, adres ve harita, telefon / WhatsApp / Instagram bağlantıları, çalışma saatleri ve kategorilere ayrılmış menü. Tüm yazılar iki JSON dosyasından gelir, kod değiştirmeden güncellenir. Açılıştan önce site \"çok yakında\" kipinde yayınlanır; menü ve saatler açılışta tek bayrakla görünür. Açık/kapalı durumu çalışma saatlerinden hesaplanır ve Google'a işletme bilgisi yapılandırılmış veriyle bildirilir.",
    techStackValue: "Next.js 16 · TypeScript · Cloudflare Workers",
    featuresValue: "QR menü, açık/kapalı göstergesi, harita ve yol tarifi, açık/koyu tema, işletme için yapılandırılmış veri",
    statusValue: "Canlı yayında — balim.cafe adresinden erişilebilir.",
    previewAlt: "Balım Kafe sitesi — anasayfa önizleme"
  },
  en: {
    cardEyebrow: "Café · Denizli",
    siteName: "Balım Kafe",
    cardBody:
      "The website and QR menu I built for Balım Kafe in Denizli. Address, map, contact and opening hours on one page; the menu and texts update without touching code.",
    detailTitle: "Balım Kafe",
    detailIntro:
      "An end-to-end Next.js website and table-QR menu for a small home-style café in Denizli.",
    detailBody:
      "The café's public site: its story, address and map, phone / WhatsApp / Instagram links, opening hours and a menu split into categories. All text comes from two JSON files, so it updates without code changes. Before the opening the site runs in a \"coming soon\" mode, and the menu and hours appear with a single flag. The open/closed badge is computed from the opening hours, and the business details are passed to Google as structured data.",
    techStackValue: "Next.js 16 · TypeScript · Cloudflare Workers",
    featuresValue: "QR menu, open/closed badge, map and directions, light/dark theme, structured data for the business",
    statusValue: "Live at balim.cafe.",
    previewAlt: "Balım Kafe website — homepage preview"
  }
};

/**
 * Site screenshots ship as a light/dark pair — `<base>.png` and
 * `<base>-dark.png` — and CSS shows whichever matches the active theme, the
 * same way .phone-img works for the app mockups. Shared by the index and both
 * detail pages so the pairing lives in one place.
 */
function SitePreview({
  base,
  alt,
  label,
  meta,
  style
}: {
  base: string;
  alt: string;
  label: string;
  meta: string;
  style?: React.CSSProperties;
}) {
  return (
    <aside className="preview-card" aria-hidden="true" style={style}>
      <div className="grid-bg" />
      <div className="preview-card-inner">
        <img
          className="site-img is-light"
          src={`${base}.png`}
          alt={alt}
          width={1040}
          height={650}
          loading="lazy"
          decoding="async"
        />
        <img
          className="site-img is-dark"
          src={`${base}-dark.png`}
          alt={alt}
          width={1040}
          height={650}
          loading="lazy"
          decoding="async"
        />
        <div className="preview-meta">
          <span>{label}</span>
          {/* A domain, not Turkish text: without lang="en" the uppercase style turns balim.cafe into BALİM.CAFE. */}
          <span lang="en">{meta}</span>
        </div>
      </div>
    </aside>
  );
}

export function SitesIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const mt = mgumrahCopy[locale];
  const bt = balimCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <span>{t.crumbSites}</span>
        </div>
        <h1>{t.sitesTitle}</h1>
        <p className="meta">{t.sitesIntro}</p>
      </header>

      <section className="feat-grid" aria-label={t.sitesListLabel}>
        <article className="feat-card">
          <div className="site-tile">
            <div className="app-meta">
              <span className="sub">{t.cardEyebrow}</span>
              <span className="name">{t.siteName}</span>
            </div>
          </div>
          <p>{t.cardBody}</p>
          <div className="platform-row" aria-label={t.platformsLabel}>
            <a className="platform-chip live" href={links.sevcanhomeLive} target="_blank" rel="noreferrer">
              {t.platformWebLive}
            </a>
          </div>
          <div className="actions-row">
            <Link className="btn primary" href={`/${locale}/sites/sevcanhome/`}>
              {t.detailCta} <ArrowIcon />
            </Link>
            <a className="btn" href={links.sevcanhomeLive} target="_blank" rel="noreferrer">
              {t.visitCta} <ArrowIcon />
            </a>
            <a className="btn" href={links.sevcanhomeRepo} target="_blank" rel="noreferrer">
              {t.repoCta} <ArrowIcon />
            </a>
          </div>
        </article>

        <SitePreview
          base="/images/sevcanhome-preview"
          alt={t.previewAlt}
          label={t.previewLabel}
          meta={t.previewPlatforms}
        />
      </section>

      <section
        className="feat-grid"
        aria-label={mt.siteName}
        style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}
      >
        <article className="feat-card">
          <div className="site-tile">
            <div className="app-meta">
              <span className="sub">{mt.cardEyebrow}</span>
              <span className="name">{mt.siteName}</span>
            </div>
          </div>
          <p>{mt.cardBody}</p>
          <div className="platform-row" aria-label={t.platformsLabel}>
            <a className="platform-chip live" href={links.mgumrahLive} target="_blank" rel="noreferrer">
              {t.platformWebLive}
            </a>
          </div>
          <div className="actions-row">
            <Link className="btn primary" href={`/${locale}/sites/mgumrah/`}>
              {t.detailCta} <ArrowIcon />
            </Link>
            <a className="btn" href={links.mgumrahLive} target="_blank" rel="noreferrer">
              {t.visitCta} <ArrowIcon />
            </a>
            <a className="btn" href={links.mgumrahRepo} target="_blank" rel="noreferrer">
              {t.repoCta} <ArrowIcon />
            </a>
          </div>
        </article>

        <SitePreview
          base="/images/mgumrah-preview"
          alt={locale === "tr" ? "mgumrah.com sitesi — anasayfa önizleme" : "mgumrah.com website — homepage preview"}
          label={t.previewLabel}
          meta="mgumrah.com"
        />
      </section>

      <section
        className="feat-grid"
        aria-label={bt.siteName}
        style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}
      >
        <article className="feat-card">
          <div className="site-tile">
            <div className="app-meta">
              <span className="sub">{bt.cardEyebrow}</span>
              <span className="name">{bt.siteName}</span>
            </div>
          </div>
          <p>{bt.cardBody}</p>
          <div className="platform-row" aria-label={t.platformsLabel}>
            <a className="platform-chip live" href={links.balimLive} target="_blank" rel="noreferrer">
              {t.platformWebLive}
            </a>
          </div>
          <div className="actions-row">
            <Link className="btn primary" href={`/${locale}/sites/balim/`}>
              {t.detailCta} <ArrowIcon />
            </Link>
            <a className="btn" href={links.balimLive} target="_blank" rel="noreferrer">
              {t.visitCta} <ArrowIcon />
            </a>
          </div>
        </article>

        <SitePreview
          base="/images/balim-preview"
          alt={bt.previewAlt}
          label={t.previewLabel}
          meta="balim.cafe"
        />
      </section>
    </main>
  );
}

export function SevcanHomeDetail({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/sites/`}>{t.crumbSites}</Link>
          <span>/</span>
          <span>{t.siteName}</span>
        </div>

        <div className="app-hero">
          <div className="meta-stack">
            <span className="kicker">
              <span className="dot" />
              {t.cardEyebrow}
            </span>
            <h1>{t.detailTitle}</h1>
          </div>
        </div>
        <p className="meta">{t.detailIntro}</p>

        <div className="actions-row">
          <a className="btn primary" href={links.sevcanhomeLive} target="_blank" rel="noreferrer">
            {t.visitCta} <ArrowIcon />
          </a>
          <a className="btn" href={links.sevcanhomeRepo} target="_blank" rel="noreferrer">
            {t.repoCta} <ArrowIcon />
          </a>
        </div>
      </header>

      <section className="doc-section" aria-label={t.detailSection}>
        <h2>{t.detailSection}</h2>
        <p>{t.detailBody}</p>

        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          <div className="feature-cell">
            <div className="label">{t.techStack}</div>
            <div className="value">{t.techStackValue}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.features}</div>
            <div className="value">{t.featuresValue}</div>
          </div>
          <div className="feature-cell live">
            <div className="label">{t.status}</div>
            <div className="value">{t.statusValue}</div>
          </div>
        </div>

        <SitePreview
          base="/images/sevcanhome-preview"
          alt={t.previewAlt}
          label={t.previewLabel}
          meta={t.previewPlatforms}
          style={{ marginTop: "1.5rem" }}
        />
      </section>
    </main>
  );
}

export function MgumrahDetail({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const mt = mgumrahCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/sites/`}>{t.crumbSites}</Link>
          <span>/</span>
          <span>{mt.siteName}</span>
        </div>

        <div className="app-hero">
          <div className="meta-stack">
            <span className="kicker">
              <span className="dot" />
              {mt.cardEyebrow}
            </span>
            <h1>{mt.detailTitle}</h1>
          </div>
        </div>
        <p className="meta">{mt.detailIntro}</p>

        <div className="actions-row">
          <a className="btn primary" href={links.mgumrahLive} target="_blank" rel="noreferrer">
            {t.visitCta} <ArrowIcon />
          </a>
          <a className="btn" href={links.mgumrahRepo} target="_blank" rel="noreferrer">
            {t.repoCta} <ArrowIcon />
          </a>
        </div>
      </header>

      <section className="doc-section" aria-label={t.detailSection}>
        <h2>{t.detailSection}</h2>
        <p>{mt.detailBody}</p>

        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          <div className="feature-cell">
            <div className="label">{t.techStack}</div>
            <div className="value">{t.techStackValue}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.features}</div>
            <div className="value">{mt.featuresValue}</div>
          </div>
          <div className="feature-cell live">
            <div className="label">{t.status}</div>
            <div className="value">{mt.statusValue}</div>
          </div>
        </div>

        <SitePreview
          base="/images/mgumrah-preview"
          alt={locale === "tr" ? "mgumrah.com sitesi — anasayfa önizleme" : "mgumrah.com website — homepage preview"}
          label={t.previewLabel}
          meta="mgumrah.com"
        />
      </section>
    </main>
  );
}

export function BalimDetail({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const bt = balimCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/sites/`}>{t.crumbSites}</Link>
          <span>/</span>
          <span>{bt.siteName}</span>
        </div>

        <div className="app-hero">
          <div className="meta-stack">
            <span className="kicker">
              <span className="dot" />
              {bt.cardEyebrow}
            </span>
            <h1>{bt.detailTitle}</h1>
          </div>
        </div>
        <p className="meta">{bt.detailIntro}</p>

        <div className="actions-row">
          <a className="btn primary" href={links.balimLive} target="_blank" rel="noreferrer">
            {t.visitCta} <ArrowIcon />
          </a>
        </div>
      </header>

      <section className="doc-section" aria-label={t.detailSection}>
        <h2>{t.detailSection}</h2>
        <p>{bt.detailBody}</p>

        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          <div className="feature-cell">
            <div className="label">{t.techStack}</div>
            <div className="value">{bt.techStackValue}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.features}</div>
            <div className="value">{bt.featuresValue}</div>
          </div>
          <div className="feature-cell live">
            <div className="label">{t.status}</div>
            <div className="value">{bt.statusValue}</div>
          </div>
        </div>

        <SitePreview
          base="/images/balim-preview"
          alt={bt.previewAlt}
          label={t.previewLabel}
          meta="balim.cafe"
        />
      </section>
    </main>
  );
}
