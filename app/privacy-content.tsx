import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "./locale";

/**
 * Shared skeleton for the app privacy pages — breadcrumb, kicker, heading,
 * language toggle and the doc-section wrapper. Each locale's legal prose is
 * passed as `children` so the (rarely changing, language-specific) policy text
 * stays in its own route file untouched. The `app` slug selects the header copy
 * and drives the breadcrumb / language-toggle links, so a single skeleton serves
 * every app's privacy page.
 */

export type PrivacyApp = "teknosales" | "tomar";

const apps: Record<PrivacyApp, Record<Locale, { name: string; intro: string; lastUpdated: string }>> = {
  teknosales: {
    tr: {
      name: "Tekno Satış",
      intro:
        "Tekno Satış B2B mobil uygulaması için geçerlidir. iOS ve Android sürümleri aynı veri işleme prensiplerini kullanır.",
      lastUpdated: "Son güncelleme: Haziran 2026"
    },
    en: {
      name: "Tekno Sales",
      intro:
        "Applies to the Tekno Satış B2B mobile application. The iOS and Android versions follow the same data processing principles.",
      lastUpdated: "Last updated: June 2026"
    }
  },
  tomar: {
    tr: {
      name: "Tomar",
      intro:
        "Tomar masaüstü PDF görüntüleyici ve düzenleyici (Windows) için geçerlidir. Tomar hiçbir kişisel veri toplamaz; belgeleriniz yalnızca kendi cihazınızda işlenir.",
      lastUpdated: "Yürürlük tarihi: 12 Temmuz 2026"
    },
    en: {
      name: "Tomar",
      intro:
        "Applies to the Tomar desktop PDF viewer and editor (Windows). Tomar collects no personal data; your documents are processed only on your own device.",
      lastUpdated: "Effective date: 12 July 2026"
    }
  }
};

const ui = {
  tr: {
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbPrivacy: "Gizlilik",
    heading: "Gizlilik Politikası",
    langAria: "Dil seçenekleri"
  },
  en: {
    crumbHome: "Home",
    crumbApps: "Apps",
    crumbPrivacy: "Privacy",
    heading: "Privacy Policy",
    langAria: "Language options"
  }
};

export default function PrivacyDocument({
  locale,
  app,
  children
}: {
  locale: Locale;
  app: PrivacyApp;
  children: ReactNode;
}) {
  const t = ui[locale];
  const a = apps[app][locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/${app}/`}>{a.name}</Link>
          <span>/</span>
          <span>{t.crumbPrivacy}</span>
        </div>
        <p className="kicker">
          <span className="dot" />
          {a.name}
        </p>
        <h1>{t.heading}</h1>
        <p className="meta">{a.intro}</p>
        <p className="meta subtle">{a.lastUpdated}</p>
        <div className="actions-row" aria-label={t.langAria}>
          <Link className={locale === "tr" ? "btn primary" : "btn"} href={`/tr/apps/${app}/privacy/`}>
            Türkçe
          </Link>
          <Link className={locale === "en" ? "btn primary" : "btn"} href={`/en/apps/${app}/privacy/`}>
            English
          </Link>
        </div>
      </header>

      <article className="doc-section">{children}</article>
    </main>
  );
}
