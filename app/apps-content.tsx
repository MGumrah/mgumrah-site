import Link from "next/link";

type Locale = "tr" | "en";

const SITE = {
  domain: "mgumrah.com",
  email: "support@mgumrah.com",
  playStore: "https://play.google.com/store/apps/details?id=com.tekno.satis",
  appStore: "https://apps.apple.com/app/id6766247299"
};

const windowsDownloadUrl = "https://mgumrah.com/teknosales/releases/TeknoSales-win-Setup.exe";

const copy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbPrivacy: "Gizlilik",
    crumbSupport: "Destek",
    appsTitle: "Uygulamalar",
    appsIntro: "Geliştirdiğim mobil uygulamalar, destek sayfaları ve resmi dokümantasyon bağlantıları.",
    appsListLabel: "Uygulama listesi",
    cardEyebrow: "Tek uygulama, üç platform",
    appName: "Tekno Satış",
    cardBody:
      "B2B satış ekipleri için müşteri hesapları, fatura takibi, tahsilat raporları ve ürün kataloglarını tek bir yerde toplayan; mobil ve masaüstünde çalışan uygulama.",
    detailCta: "Detaylara bak",
    privacyCta: "Gizlilik",
    supportCta: "Destek",
    platformAndroidLive: "Android · Yayında",
    platformIosLive: "iOS · Yayında",
    platformWindowsLive: "Windows · Yayında",
    platformsLabel: "Desteklenen platformlar",
    previewLabel: "Önizleme",
    previewPlatforms: "iOS · Android",
    previewAlt: "Tekno Satış uygulaması — iPhone önizleme",
    detailTitle: "Tekno Satış",
    detailIntro:
      "B2B satış operasyonlarında müşteri hesapları, finansal hareketler, tahsilat raporları ve ürün katalogları için geliştirilen tek mobil uygulama. iOS tarafında Tekno Sales, Türkçe kullanımda Tekno Satış adıyla yer alır.",
    detailSection: "Uygulama detayları",
    detailBody:
      "Tekno Satış; yetkili satış ekiplerinin cari hesapları, fatura bilgilerini, ödeme hareketlerini, tahsilat raporlarını ve ürün kataloglarını mobil cihazlardan görüntüleyebilmesi için geliştirilmiştir.",
    platforms: "Platformlar",
    appNameLabel: "Uygulama Adı",
    usage: "Kullanım Alanı",
    status: "Durum",
    platformValue: "iOS, Android ve Windows (x64)",
    usageValue: "B2B satış, tahsilat, fatura ve katalog süreçleri",
    statusValue:
      "iOS sürümü App Store, Android sürümü Google Play üzerinde yayında. Windows masaüstü sürümü aşağıdaki bölümden indirilebilir.",
    windowsSectionLabel: "Tekno Satış Windows masaüstü sürümü",
    windowsTitle: "Windows Masaüstü Sürümü",
    windowsBody:
      "Tekno Satış'ın Windows masaüstü sürümü; cari hesaplar, fatura takibi, tahsilat raporları ve ürün kataloglarını masaüstünden incelemenizi sağlar. Yeni sürümler arka planda iner, onayınızla uygulanır.",
    windowsDownload: "Tekno Satış'ı İndir (Windows)",
    windowsReqsTitle: "Sistem Gereksinimleri",
    windowsReqsBody: "Windows 10 veya 11 (64-bit).",
    windowsInstallTitle: "Kurulum",
    windowsInstallBody:
      "Setup.exe'yi indirip çift tıklayın. Yönetici izni istemez; %LOCALAPPDATA%\\TeknoSales altına kurulur, masaüstüne ve başlat menüsüne kısayol ekler.",
    windowsUpdatesTitle: "Güncellemeler",
    windowsUpdatesBody:
      "Uygulama açıldığında yeni sürümleri otomatik kontrol eder. Yalnızca değişen küçük bir delta paketi indirilir.",
    windowsSmartScreenTitle: "İlk Açılış Uyarısı",
    windowsSmartScreenBody:
      "Windows SmartScreen \"Bilinmeyen yayıncı\" uyarısı gösterebilir. \"Daha fazla bilgi → Yine de çalıştır\" adımlarıyla devam edebilirsiniz. Kod imzalama sertifikası eklendiğinde bu uyarı kaybolacak.",
    supportTitle: "Destek",
    supportTitleIt: "Kanalları",
    supportIntro:
      "Tekno Satış uygulamasıyla ilgili destek talepleri, hesap erişimi ve teknik sorunlar için aşağıdaki kanalları kullanabilirsiniz.",
    supportSectionLabel: "Destek kanalları",
    supportCompany: "Firma Desteği",
    supportCompanyName: "Tekno İklimlendirme",
    supportCompanyText:
      "Hesap, yetki, müşteri verisi, fatura ve tahsilat süreçleri için destek e-postasını kullanabilirsiniz.",
    supportTechnical: "Teknik Geliştirici",
    supportTechnicalName: "Mehmet Gümrah",
    supportTechnicalText:
      "Uygulama yayını ve teknik sayfalar Mehmet Gümrah tarafından yönetilmektedir.",
    supportResponse: "Yanıt Süresi",
    supportResponseHeading: "Yanıt süresi",
    supportResponseText:
      "Destek talepleri iş günleri içinde, genellikle aynı gün değerlendirilir.",
    supportPrivacyText:
      "Veri toplama, saklama ve kullanım politikası için gizlilik sayfasına bakın."
  },
  en: {
    crumbHome: "Home",
    crumbApps: "Apps",
    crumbPrivacy: "Privacy",
    crumbSupport: "Support",
    appsTitle: "Apps",
    appsIntro: "Mobile apps, support pages, and official documentation links that I maintain.",
    appsListLabel: "App list",
    cardEyebrow: "One app, three platforms",
    appName: "Tekno Sales",
    cardBody:
      "A mobile and desktop app that brings customer accounts, invoice tracking, collection reports, and product catalogs together for B2B sales teams.",
    detailCta: "View details",
    privacyCta: "Privacy",
    supportCta: "Support",
    platformAndroidLive: "Android · Live",
    platformIosLive: "iOS · Live",
    platformWindowsLive: "Windows · Live",
    platformsLabel: "Supported platforms",
    previewLabel: "Preview",
    previewPlatforms: "iOS · Android",
    previewAlt: "Tekno Sales app — iPhone preview",
    detailTitle: "Tekno Sales",
    detailIntro:
      "A single mobile app for B2B sales operations, customer accounts, financial activity, collection reports, and product catalogs. It appears as Tekno Sales in English and Tekno Satış in Turkish.",
    detailSection: "App details",
    detailBody:
      "Tekno Sales is built for authorized sales teams to review customer accounts, invoices, payment activity, collection reports, and product catalogs from mobile devices.",
    platforms: "Platforms",
    appNameLabel: "App Name",
    usage: "Use Case",
    status: "Status",
    platformValue: "iOS, Android, and Windows (x64)",
    usageValue: "B2B sales, collections, invoices, and catalog workflows",
    statusValue:
      "The iOS version is live on the App Store and the Android version is live on Google Play. The Windows desktop version can be downloaded from the section below.",
    windowsSectionLabel: "Tekno Sales Windows desktop version",
    windowsTitle: "Windows Desktop Version",
    windowsBody:
      "The Tekno Sales Windows desktop version lets you review customer accounts, invoice tracking, collection reports, and product catalogs from your desktop. New releases download in the background and apply after your confirmation.",
    windowsDownload: "Download Tekno Sales for Windows",
    windowsReqsTitle: "System Requirements",
    windowsReqsBody: "Windows 10 or 11 (64-bit).",
    windowsInstallTitle: "Installation",
    windowsInstallBody:
      "Download Setup.exe and double-click to run. No administrator rights required; the app installs under %LOCALAPPDATA%\\TeknoSales and adds shortcuts to the desktop and Start menu.",
    windowsUpdatesTitle: "Updates",
    windowsUpdatesBody:
      "The app checks for new versions on launch. Only a small delta package with the changed files is downloaded.",
    windowsSmartScreenTitle: "First Launch Warning",
    windowsSmartScreenBody:
      "Windows SmartScreen may show an \"Unknown publisher\" warning. You can continue with \"More info → Run anyway\". This warning will disappear once a code signing certificate is in place.",
    supportTitle: "Support",
    supportTitleIt: "Channels",
    supportIntro:
      "For support requests, account access, and technical issues related to the Tekno Sales app, please use the channels below.",
    supportSectionLabel: "Support channels",
    supportCompany: "Company Support",
    supportCompanyName: "Tekno İklimlendirme",
    supportCompanyText:
      "For account, authorization, customer data, invoice, and collection workflows, use the support email address.",
    supportTechnical: "Technical Developer",
    supportTechnicalName: "Mehmet Gümrah",
    supportTechnicalText:
      "App publishing and technical pages are maintained by Mehmet Gümrah.",
    supportResponse: "Response Time",
    supportResponseHeading: "Response time",
    supportResponseText:
      "Support requests are reviewed during business days, usually within the same day.",
    supportPrivacyText:
      "See the privacy page for data collection, storage, and usage policy."
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

export function AppsIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <span>{t.crumbApps}</span>
        </div>
        <h1>{t.appsTitle}</h1>
        <p className="meta">{t.appsIntro}</p>
      </header>

      <section className="feat-grid" aria-label={t.appsListLabel}>
        <article className="feat-card">
          <div className="app-tile">
            <img
              className="app-tile-icon lg"
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
            <a className="platform-chip live" href={windowsDownloadUrl} download>
              {t.platformWindowsLive}
            </a>
          </div>
          <div className="actions-row">
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
      </section>
    </main>
  );
}

export function TeknoSalesDetail({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <span>{t.appName}</span>
        </div>

        <div className="app-hero">
          <img
            className="app-tile-icon lg"
            src="/images/teknosales-icon.png"
            alt={`${t.appName} app logo`}
          />
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
          <a className="btn primary" href={SITE.appStore} target="_blank" rel="noreferrer">
            App Store <ArrowIcon />
          </a>
          <a className="btn primary" href={SITE.playStore} target="_blank" rel="noreferrer">
            Google Play <ArrowIcon />
          </a>
          <a className="btn" href={windowsDownloadUrl} download>
            {locale === "tr" ? "Windows İndir" : "Windows Download"} <ArrowIcon />
          </a>
          <Link className="btn" href={`/${locale}/apps/teknosales/privacy/`}>
            {t.privacyCta}
          </Link>
          <Link className="btn" href={`/${locale}/apps/teknosales/support/`}>
            {t.supportCta}
          </Link>
        </div>
      </header>

      <section className="doc-section" aria-label={t.detailSection}>
        <h2>{t.detailSection}</h2>
        <p>{t.detailBody}</p>

        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          <div className="feature-cell">
            <div className="label">{t.platforms}</div>
            <div className="value">{t.platformValue}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.appNameLabel}</div>
            <div className="value">
              TR: Tekno Satış
              <br />
              EN: Tekno Sales
            </div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.usage}</div>
            <div className="value">{t.usageValue}</div>
          </div>
          <div className="feature-cell live">
            <div className="label">{t.status}</div>
            <div className="value">{t.statusValue}</div>
          </div>
        </div>
      </section>

      <section className="doc-section" aria-label={t.windowsSectionLabel}>
        <h2>{t.windowsTitle}</h2>
        <p>{t.windowsBody}</p>
        <div className="actions-row" style={{ marginTop: "0.5rem" }}>
          <a className="btn primary" href={windowsDownloadUrl} download>
            {t.windowsDownload} <ArrowIcon />
          </a>
        </div>

        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          <div className="feature-cell">
            <div className="label">{t.windowsReqsTitle}</div>
            <div className="value">{t.windowsReqsBody}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.windowsInstallTitle}</div>
            <div className="value">{t.windowsInstallBody}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.windowsUpdatesTitle}</div>
            <div className="value">{t.windowsUpdatesBody}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.windowsSmartScreenTitle}</div>
            <div className="value">{t.windowsSmartScreenBody}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function TeknoSalesSupport({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/teknosales/`}>{t.appName}</Link>
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
          <span className="label">{t.supportCompany}</span>
          <h3>{t.supportCompanyName}</h3>
          <p>{t.supportCompanyText}</p>
          <a className="link" href="mailto:info@teknoiklimlendirme.com">
            info@teknoiklimlendirme.com
          </a>
          <a className="link" href="https://teknoiklimlendirme.com" target="_blank" rel="noreferrer">
            teknoiklimlendirme.com
          </a>
        </div>

        <div className="channel-card">
          <span className="label">{t.supportTechnical}</span>
          <h3>{t.supportTechnicalName}</h3>
          <p>{t.supportTechnicalText}</p>
          <a className="link" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          <a className="link" href={`https://${SITE.domain}`} target="_blank" rel="noreferrer">
            {SITE.domain}
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
          <Link className="link" href={`/${locale}/apps/teknosales/privacy/`}>
            {t.privacyCta} →
          </Link>
        </div>
      </section>
    </main>
  );
}
