type Locale = "tr" | "en";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tekno.satis";

const copy = {
  tr: {
    appsEyebrow: "Uygulamalar",
    appsTitle: "Apps",
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
    platformValue: "iOS ve Android",
    usageValue: "B2B satış, tahsilat, fatura ve katalog süreçleri",
    statusValue: "Android sürümü Google Play üzerinde yayında. iOS mağaza bağlantısı hazır olduğunda bu sayfaya eklenecek.",
    supportTitle: "Tekno Satış Destek",
    supportIntro:
      "Tekno Satış uygulamasıyla ilgili destek talepleri, hesap erişimi ve teknik sorunlar için aşağıdaki kanalları kullanabilirsiniz.",
    supportContactTitle: "Destek Kanalları",
    supportCompany: "Firma Desteği",
    supportCompanyText: "Hesap, yetki, müşteri verisi, fatura ve tahsilat süreçleri için destek e-postasını kullanabilirsiniz.",
    supportTechnical: "Teknik Geliştirici",
    supportTechnicalText: "Uygulama yayını ve teknik sayfalar Mehmet Gümrah tarafından yönetilmektedir.",
    supportResponse: "Yanıt Süresi",
    supportResponseText: "Destek talepleri iş günleri içinde değerlendirilir."
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
    platformValue: "iOS and Android",
    usageValue: "B2B sales, collections, invoices, and catalog workflows",
    statusValue: "The Android version is live on Google Play. The iOS store link will be added when it is ready.",
    supportTitle: "Tekno Sales Support",
    supportIntro:
      "For support requests, account access, and technical issues related to the Tekno Sales app, please use the channels below.",
    supportContactTitle: "Support Channels",
    supportCompany: "Company Support",
    supportCompanyText: "For account, authorization, customer data, invoice, and collection workflows, use the support email address.",
    supportTechnical: "Technical Developer",
    supportTechnicalText: "App publishing and technical pages are maintained by Mehmet Gümrah.",
    supportResponse: "Response Time",
    supportResponseText: "Support requests are reviewed during business days."
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
            </div>
          </div>
          <div>
            <p className="eyebrow">{t.cardEyebrow}</p>
            <h2>{t.name}</h2>
            <p>{t.cardBody}</p>
          </div>
          <div className="actions">
            <a className="button primary" href={`/${locale}/apps/teknosales/`}>
              {t.details}
            </a>
            <a className="button" href={`/${locale}/apps/teknosales/privacy/`}>
              {t.privacy}
            </a>
            <a className="button" href={`/${locale}/apps/teknosales/support/`}>
              {t.support}
            </a>
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
          <a className="button primary" href="/tr/apps/teknosales/privacy/">
            {t.trPrivacy}
          </a>
          <a className="button" href="/en/apps/teknosales/privacy/">
            {t.enPrivacy}
          </a>
          <a className="button" href={`/${locale}/apps/teknosales/support/`}>
            {t.support}
          </a>
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
              support@mgumrah.com
              <br />
              info@teknoiklimlendirme.com
              <br />
              www.teknoiklimlendirme.com
            </p>
          </div>
          <div>
            <strong>{t.supportTechnical}</strong>
            <p>{t.supportTechnicalText}</p>
            <p>mgumrah.com</p>
          </div>
          <div>
            <strong>{t.supportResponse}</strong>
            <p>{t.supportResponseText}</p>
          </div>
          <div>
            <strong>{t.privacy}</strong>
            <p>
              <a href={`/${locale}/apps/teknosales/privacy/`}>{t.privacy}</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
