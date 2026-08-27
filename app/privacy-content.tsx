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

/**
 * One entry per policy document, not per app: an app may need a second policy
 * that is true of one build and not the others. `routes` below is what keeps
 * such an entry pointing at its parent app rather than at a page of its own.
 */
export type PrivacyApp = "teknosales" | "teknoportal" | "teknoportal-microsoft-store" | "tomar";

type PrivacyCopy = {
  name: string;
  intro: string;
  lastUpdated: string;
  /** Replaces the generic "Privacy Policy" H1 when a document must name itself. */
  heading?: string;
  /** Replaces the final breadcrumb, for the same reason. */
  crumb?: string;
};

/**
 * Which app page a document sits under and which segment it occupies there.
 * Everything defaults to `<app slug>/privacy`; the Microsoft Store edition is a
 * second Tekno Portal policy rather than a second app, so it keeps the Tekno
 * Portal breadcrumb and takes its own segment beside the general one.
 */
const routes: Record<PrivacyApp, { app: string; segment: string }> = {
  teknosales: { app: "teknosales", segment: "privacy" },
  teknoportal: { app: "teknoportal", segment: "privacy" },
  "teknoportal-microsoft-store": { app: "teknoportal", segment: "privacy-microsoft-store" },
  tomar: { app: "tomar", segment: "privacy" }
};

const apps: Record<PrivacyApp, Record<Locale, PrivacyCopy>> = {
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
  teknoportal: {
    tr: {
      name: "Tekno Portal",
      intro:
        "Tekno Portal B2B müşteri uygulaması için geçerlidir. iOS, Android ve Windows sürümleri aynı veri işleme prensiplerini kullanır. Uygulama yalnızca Tekno İklimlendirme müşterilerinin kendi hesap verilerine erişmesi için tasarlanmıştır.",
      lastUpdated: "Yürürlük tarihi: 17 Ağustos 2026"
    },
    en: {
      name: "Tekno Portal",
      intro:
        "Applies to the Tekno Portal B2B customer application. The iOS, Android, and Windows versions follow the same data processing principles. The app is designed solely for Tekno İklimlendirme customers to access their own account data.",
      lastUpdated: "Effective date: 17 August 2026"
    }
  },
  "teknoportal-microsoft-store": {
    tr: {
      name: "Tekno Portal",
      heading: "Microsoft Store Sürümü Gizlilik Politikası",
      crumb: "Gizlilik (Microsoft Store)",
      intro:
        "Yalnızca Tekno Portal’ın Microsoft Store’dan kurulan Windows sürümü için geçerlidir. Bu sürümde kart ile ödeme ve IBAN girişi bulunmaz. iOS, Android ve şirket tarafından doğrudan dağıtılan Windows sürümleri için genel gizlilik politikası geçerlidir.",
      lastUpdated: "Yürürlük tarihi: 27 Ağustos 2026"
    },
    en: {
      name: "Tekno Portal",
      heading: "Microsoft Store Edition Privacy Policy",
      crumb: "Privacy (Microsoft Store)",
      intro:
        "Applies only to the Windows version of Tekno Portal installed from the Microsoft Store. That version has no card payment and no IBAN entry. The general privacy policy applies to the iOS and Android versions and to the Windows version distributed directly by the company.",
      lastUpdated: "Effective date: 27 August 2026"
    }
  },
  tomar: {
    tr: {
      name: "Tomar",
      intro:
        "Tomar masaüstü PDF görüntüleyici ve düzenleyici (Windows) için geçerlidir; Microsoft Store’da “Tomar PDF” adıyla yayımlanır. Tomar hiçbir kişisel veri toplamaz; belgeleriniz yalnızca kendi cihazınızda işlenir.",
      lastUpdated: "Yürürlük tarihi: 22 Temmuz 2026"
    },
    en: {
      name: "Tomar",
      intro:
        "Applies to the Tomar desktop PDF viewer and editor for Windows, published on the Microsoft Store as “Tomar PDF”. Tomar collects no personal data; your documents are processed only on your own device.",
      lastUpdated: "Effective date: 22 July 2026"
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
  const route = routes[app];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/${route.app}/`}>{a.name}</Link>
          <span>/</span>
          <span>{a.crumb ?? t.crumbPrivacy}</span>
        </div>
        <p className="kicker">
          <span className="dot" />
          {a.name}
        </p>
        <h1>{a.heading ?? t.heading}</h1>
        <p className="meta">{a.intro}</p>
        <p className="meta subtle">{a.lastUpdated}</p>
        <div className="actions-row" aria-label={t.langAria}>
          <Link className={locale === "tr" ? "btn primary" : "btn"} href={`/tr/apps/${route.app}/${route.segment}/`}>
            Türkçe
          </Link>
          <Link className={locale === "en" ? "btn primary" : "btn"} href={`/en/apps/${route.app}/${route.segment}/`}>
            English
          </Link>
        </div>
      </header>

      <article className="doc-section">{children}</article>
    </main>
  );
}
