import Link from "next/link";

type Locale = "tr" | "en";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tekno.satis";
const windowsDownloadUrl = "https://mgumrah.com/teknosales/releases/TeknoSales-win-Setup.exe";

const copy = {
  tr: {
    appsEyebrow: "Uygulamalar",
    appsTitle: "Uygulamalar",
    appsIntro: "Geliştirdiğim mobil uygulamalar, destek sayfaları ve resmi dokümantasyon bağlantıları.",
    cardEyebrow: "Tek Uygulama, İki Platform",
    name: "Tekno Satış",
    cardBody:
      "B2B satış ekipleri için müşteri hesapları, fatura takibi, tahsilat raporları ve ürün kataloglarını tek yerde toplayan mobil uygulama.",
    details: "Detaylar",
    privacy: "Gizlilik",
    support: "Destek",
    detailTitle: "Tekno Satış",
    detailIntro:
      "B2B satış operasyonlarında müşteri hesapları, finansal hareketler, tahsilat raporları ve ürün katalogları için geliştirilen tek mobil uygulama. iOS tarafında Tekno Sales, Türkçe kullanımda Tekno Satış adıyla yer alır.",
    trPrivacy: "Türkçe Gizlilik",
    enPrivacy: "English Privacy",
    detailSection: "Uygulama Detayları",
    detailBody:
      "Tekno Satış; yetkili satış ekiplerinin cari hesapları, fatura bilgilerini, ödeme hareketlerini, tahsilat raporlarını ve ürün kataloglarını mobil cihazlardan görüntüleyebilmesi için geliştirilmiştir.",
    platforms: "Platformlar",
    appName: "Uygulama Adı",
    usage: "Kullanım Alanı",
    status: "Durum",
    platformValue: "iOS, Android ve Windows",
    usageValue: "B2B satış, tahsilat, fatura ve katalog süreçleri",
    statusValue: "Android sürümü Google Play üzerinde yayında. Windows masaüstü sürümü aşağıdaki bölümden indirilebilir. iOS mağaza bağlantısı hazır olduğunda buraya eklenecek.",
    supportTitle: "Tekno Satış Destek",
    supportIntro:
      "Tekno Satış uygulamasıyla ilgili destek talepleri, hesap erişimi ve teknik sorunlar için aşağıdaki kanalları kullanabilirsiniz.",
    supportContactTitle: "Destek Kanalları",
    supportCompany: "Firma Desteği",
    supportCompanyText: "Hesap, yetki, müşteri verisi, fatura ve tahsilat süreçleri için destek e-postasını kullanabilirsiniz.",
    supportTechnical: "Teknik Geliştirici",
    supportTechnicalText: "Uygulama yayını ve teknik sayfalar Mehmet Gümrah tarafından yönetilmektedir.",
    supportResponse: "Yanıt Süresi",
    supportResponseText: "Destek talepleri iş günleri içinde değerlendirilir.",
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
      "Windows SmartScreen \"Bilinmeyen yayıncı\" uyarısı gösterebilir. \"Daha fazla bilgi → Yine de çalıştır\" adımlarıyla devam edebilirsiniz. Kod imzalama sertifikası eklendiğinde bu uyarı kaybolacak."
  },
  en: {
    appsEyebrow: "Applications",
    appsTitle: "Apps",
    appsIntro: "Mobile apps, support pages, and official documentation links that I maintain.",
    cardEyebrow: "One App, Two Platforms",
    name: "Tekno Sales",
    cardBody:
      "A mobile app that brings customer accounts, invoice tracking, collection reports, and product catalogs together for B2B sales teams.",
    details: "Details",
    privacy: "Privacy",
    support: "Support",
    detailTitle: "Tekno Sales",
    detailIntro:
      "A single mobile app for B2B sales operations, customer accounts, financial activity, collection reports, and product catalogs. It appears as Tekno Sales in English and Tekno Satış in Turkish.",
    trPrivacy: "Türkçe Privacy",
    enPrivacy: "English Privacy",
    detailSection: "App Details",
    detailBody:
      "Tekno Sales is built for authorized sales teams to review customer accounts, invoices, payment activity, collection reports, and product catalogs from mobile devices.",
    platforms: "Platforms",
    appName: "App Name",
    usage: "Use Case",
    status: "Status",
    platformValue: "iOS, Android, and Windows",
    usageValue: "B2B sales, collections, invoices, and catalog workflows",
    statusValue: "The Android version is live on Google Play. The Windows desktop version can be downloaded from the section below. The iOS store link will be added when it is ready.",
    supportTitle: "Tekno Sales Support",
    supportIntro:
      "For support requests, account access, and technical issues related to the Tekno Sales app, please use the channels below.",
    supportContactTitle: "Support Channels",
    supportCompany: "Company Support",
    supportCompanyText: "For account, authorization, customer data, invoice, and collection workflows, use the support email address.",
    supportTechnical: "Technical Developer",
    supportTechnicalText: "App publishing and technical pages are maintained by Mehmet Gümrah.",
    supportResponse: "Response Time",
    supportResponseText: "Support requests are reviewed during business days.",
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
      "Windows SmartScreen may show an \"Unknown publisher\" warning. You can continue with \"More info → Run anyway\". This warning will disappear once a code signing certificate is in place."
  }
};

export function AppsIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">{t.appsEyebrow}</p>
        <h1>{t.appsTitle}</h1>
        <p className="meta">{t.appsIntro}</p>
      </header>

      <section className="app-grid" aria-label={locale === "tr" ? "Uygulama listesi" : "App list"}>
        <article className="app-card">
          <div className="app-card-top">
            <img className="app-icon" src="/images/teknosales-icon.png" alt={`${t.name} app logo`} />
            <div className="platform-badges" aria-label={locale === "tr" ? "Desteklenen platformlar" : "Supported platforms"}>
              <span>iOS</span>
              <a href={playStoreUrl}>Android</a>
              <a href={windowsDownloadUrl} download>Windows</a>
            </div>
          </div>
          <div>
            <p className="eyebrow">{t.cardEyebrow}</p>
            <h2>{t.name}</h2>
            <p>{t.cardBody}</p>
          </div>
          <div className="actions">
            <Link className="button primary" href={`/${locale}/apps/teknosales/`}>
              {t.details}
            </Link>
            <Link className="button" href={`/${locale}/apps/teknosales/privacy/`}>
              {t.privacy}
            </Link>
            <Link className="button" href={`/${locale}/apps/teknosales/support/`}>
              {t.support}
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}

export function TeknoSalesDetail({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="document">
      <header className="document-header">
        <div className="app-hero-top">
          <p className="eyebrow">{t.cardEyebrow}</p>
          <div className="platform-badges" aria-label={locale === "tr" ? "Desteklenen platformlar" : "Supported platforms"}>
            <span>iOS</span>
            <a href={playStoreUrl}>Android</a>
            <a href={windowsDownloadUrl} download>Windows</a>
          </div>
        </div>
        <div className="app-title-row">
          <img className="app-icon large" src="/images/teknosales-icon.png" alt={`${t.name} app logo`} />
          <div>
            <h1>{t.detailTitle}</h1>
          </div>
        </div>
        <p className="meta">{t.detailIntro}</p>
        <div className="language-links" aria-label={locale === "tr" ? "Gizlilik politikası bağlantıları" : "Privacy policy links"}>
          <Link className="button primary" href="/tr/apps/teknosales/privacy/">
            {t.trPrivacy}
          </Link>
          <Link className="button" href="/en/apps/teknosales/privacy/">
            {t.enPrivacy}
          </Link>
          <Link className="button" href={`/${locale}/apps/teknosales/support/`}>
            {t.support}
          </Link>
        </div>
      </header>

      <section className="app-detail-card" aria-label={locale === "tr" ? "Tekno Satış uygulama detayları" : "Tekno Sales app details"}>
        <div>
          <h2>{t.detailSection}</h2>
          <p>{t.detailBody}</p>
        </div>
        <div className="feature-grid">
          <div>
            <strong>{t.platforms}</strong>
            <p>{t.platformValue}</p>
          </div>
          <div>
            <strong>{t.appName}</strong>
            <p>
              TR: Tekno Satış
              <br />
              EN: Tekno Sales
            </p>
          </div>
          <div>
            <strong>{t.usage}</strong>
            <p>{t.usageValue}</p>
          </div>
          <div>
            <strong>{t.status}</strong>
            <p>{t.statusValue}</p>
          </div>
        </div>
      </section>

      <section className="app-detail-card" aria-label={t.windowsSectionLabel}>
        <div>
          <h2>{t.windowsTitle}</h2>
          <p>{t.windowsBody}</p>
          <div className="actions">
            <a className="button primary" href={windowsDownloadUrl} download>
              {t.windowsDownload}
            </a>
          </div>
        </div>
        <div className="feature-grid">
          <div>
            <strong>{t.windowsReqsTitle}</strong>
            <p>{t.windowsReqsBody}</p>
          </div>
          <div>
            <strong>{t.windowsInstallTitle}</strong>
            <p>{t.windowsInstallBody}</p>
          </div>
          <div>
            <strong>{t.windowsUpdatesTitle}</strong>
            <p>{t.windowsUpdatesBody}</p>
          </div>
          <div>
            <strong>{t.windowsSmartScreenTitle}</strong>
            <p>{t.windowsSmartScreenBody}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function TeknoSalesSupport({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">{t.name}</p>
        <h1>{t.supportTitle}</h1>
        <p className="meta">{t.supportIntro}</p>
      </header>

      <section className="app-detail-card" aria-label={locale === "tr" ? "Destek bilgileri" : "Support information"}>
        <div>
          <h2>{t.supportContactTitle}</h2>
        </div>
        <div className="feature-grid">
          <div>
            <strong>{t.supportCompany}</strong>
            <p>{t.supportCompanyText}</p>
            <p>
              <a href="mailto:info@teknoiklimlendirme.com">info@teknoiklimlendirme.com</a>
              <br />
              <a href="https://teknoiklimlendirme.com">teknoiklimlendirme.com</a>
            </p>
          </div>
          <div>
            <strong>{t.supportTechnical}</strong>
            <p>{t.supportTechnicalText}</p>
            <p>
              <a href="mailto:support@mgumrah.com">support@mgumrah.com</a>
              <br />
              <a href="https://mgumrah.com">mgumrah.com</a>
            </p>
          </div>
          <div>
            <strong>{t.supportResponse}</strong>
            <p>{t.supportResponseText}</p>
          </div>
          <div>
            <strong>{t.privacy}</strong>
            <p>
              <Link href={`/${locale}/apps/teknosales/privacy/`}>{t.privacy}</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
