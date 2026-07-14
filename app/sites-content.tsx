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

export function SitesIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];

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

        <aside className="preview-card" aria-hidden="true">
          <div className="grid-bg" />
          <div className="preview-card-inner">
            <img
              className="site-img"
              src="/images/sevcanhome-preview.png"
              alt={t.previewAlt}
              width={1040}
              height={650}
              loading="lazy"
              decoding="async"
            />
            <div className="preview-meta">
              <span>{t.previewLabel}</span>
              <span>{t.previewPlatforms}</span>
            </div>
          </div>
        </aside>
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

        <aside className="preview-card" aria-hidden="true" style={{ marginTop: "1.5rem" }}>
          <div className="grid-bg" />
          <div className="preview-card-inner">
            <img
              className="site-img"
              src="/images/sevcanhome-preview.png"
              alt={t.previewAlt}
              width={1040}
              height={650}
              loading="lazy"
              decoding="async"
            />
            <div className="preview-meta">
              <span>{t.previewLabel}</span>
              <span>{t.previewPlatforms}</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
