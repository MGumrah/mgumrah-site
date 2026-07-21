import Link from "next/link";
import { ArrowIcon } from "./icons";
import { StoreBadge } from "./store-badges";
import { InstallButton } from "./install-button";
import { links } from "./site-config";
import type { Locale } from "./locale";

const copy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbPrivacy: "Gizlilik",
    crumbSupport: "Destek",
    crumbDownload: "İndir",
    appsTitle: "Uygulamalar",
    appsIntro: "Geliştirdiğim mobil ve masaüstü uygulamalar, destek sayfaları ve resmi dokümantasyon bağlantıları.",
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
      "iOS sürümü App Store, Android sürümü Google Play, Windows sürümü ise Microsoft Store üzerinde yayında. Windows için siteden doğrudan kurulum dosyası da indirilebilir.",

    installNeutral: "Yükle",
    installHint: "Cihazınıza uygun mağazaya yönlendirilirsiniz.",
    allOptionsCta: "Tüm indirme seçenekleri",

    downloadTitle: "Tekno Satış'ı",
    downloadTitleIt: "indir",
    downloadIntro:
      "Tek uygulama, üç platform. Yukarıdaki butonla cihazınıza uygun mağazaya gidebilir ya da aşağıdan istediğiniz kurulum yolunu seçebilirsiniz.",
    storesSection: "Mağazalar",
    storeIosMeta: "iPhone · iPad",
    storeAndroidMeta: "Android",
    storeWindowsMeta: "Windows 10 / 11 · Önerilen",
    storeDirectMeta: "Windows · Setup.exe",
    storeDirectCta: "Setup.exe indir",
    trademarks:
      "Apple ve Apple logosu, Apple Inc.'in ABD ve diğer ülkelerde tescilli ticari markalarıdır. App Store, Apple Inc.'in hizmet markasıdır. Google Play ve Google Play logosu, Google LLC'nin ticari markalarıdır. Microsoft ve Microsoft Store, Microsoft şirketler grubunun ticari markalarıdır.",

    windowsSectionLabel: "Windows kurulum detayları",
    windowsTitle: "Windows Kurulum Detayları",
    windowsBody:
      "Windows için iki yol var: Microsoft Store üzerinden kurulum (önerilir — güncellemeleri Store yönetir) veya siteden indirilen Setup.exe. İkisi de aynı uygulamayı kurar.",
    windowsReqsTitle: "Sistem Gereksinimleri",
    windowsReqsBody: "Windows 10 veya 11 (64-bit).",
    windowsInstallTitle: "Kurulum (Setup.exe)",
    windowsInstallBody:
      "Setup.exe'yi indirip çift tıklayın. Yönetici izni istemez; %LOCALAPPDATA%\\TeknoSales altına kurulur, masaüstüne ve başlat menüsüne kısayol ekler.",
    windowsUpdatesTitle: "Güncellemeler",
    windowsUpdatesBody:
      "Microsoft Store sürümü güncellemelerini Store üzerinden alır. Setup.exe sürümü ise açılışta yeni sürüm denetler ve yalnızca değişen küçük bir delta paketini indirir.",
    windowsSmartScreenTitle: "İlk Açılış Uyarısı (yalnızca Setup.exe)",
    windowsSmartScreenBody:
      "Siteden indirilen kurulumda Windows SmartScreen \"Bilinmeyen yayıncı\" uyarısı gösterebilir; \"Daha fazla bilgi → Yine de çalıştır\" ile devam edebilirsiniz. Microsoft Store üzerinden kurduğunuzda bu uyarı çıkmaz.",
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
    crumbDownload: "Download",
    appsTitle: "Apps",
    appsIntro: "Mobile and desktop apps, support pages, and official documentation links that I maintain.",
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
      "The iOS version is live on the App Store, the Android version on Google Play, and the Windows version on the Microsoft Store. A direct installer for Windows is also available from this site.",

    installNeutral: "Install",
    installHint: "You'll be sent to the store that matches your device.",
    allOptionsCta: "All download options",

    downloadTitle: "Download",
    downloadTitleIt: "Tekno Sales",
    downloadIntro:
      "One app, three platforms. Use the button above to jump straight to the store for your device, or pick an install route below.",
    storesSection: "Stores",
    storeIosMeta: "iPhone · iPad",
    storeAndroidMeta: "Android",
    storeWindowsMeta: "Windows 10 / 11 · Recommended",
    storeDirectMeta: "Windows · Setup.exe",
    storeDirectCta: "Download Setup.exe",
    trademarks:
      "Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC. Microsoft and Microsoft Store are trademarks of the Microsoft group of companies.",

    windowsSectionLabel: "Windows install details",
    windowsTitle: "Windows Install Details",
    windowsBody:
      "There are two routes on Windows: install from the Microsoft Store (recommended — the Store handles updates), or download Setup.exe from this site. Both install the same app.",
    windowsReqsTitle: "System Requirements",
    windowsReqsBody: "Windows 10 or 11 (64-bit).",
    windowsInstallTitle: "Installation (Setup.exe)",
    windowsInstallBody:
      "Download Setup.exe and double-click to run. No administrator rights required; the app installs under %LOCALAPPDATA%\\TeknoSales and adds shortcuts to the desktop and Start menu.",
    windowsUpdatesTitle: "Updates",
    windowsUpdatesBody:
      "The Microsoft Store version updates through the Store. The Setup.exe version checks for new versions on launch and downloads only a small delta package with the changed files.",
    windowsSmartScreenTitle: "First Launch Warning (Setup.exe only)",
    windowsSmartScreenBody:
      "The installer downloaded from this site may trigger a Windows SmartScreen \"Unknown publisher\" warning; continue with \"More info → Run anyway\". Installing from the Microsoft Store does not show this warning.",
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

/**
 * Tomar — a Windows desktop PDF viewer/editor (currently in development).
 * Kept in its own copy table so the TeknoSales strings above stay untouched.
 */
const tomarCopy = {
  tr: {
    appName: "Tomar",
    cardEyebrow: "Windows masaüstü · PDF düzenleyici",
    cardBody:
      "Sık kullanılan PDF işlerini tek pencerede toplayan hafif bir masaüstü düzenleyici: metin arama, kalem/vurgu, sayfa düzenleme, birleştirme/bölme, resme aktarma ve yazdırma. Verileriniz cihazınızda kalır.",
    platformDev: "Windows · Geliştiriliyor",
    platformsLabel: "Desteklenen platformlar",
    previewLabel: "Önizleme",
    previewMeta: "PDF · Windows",
    previewAlt: "Tomar uygulama simgesi",
    detailCta: "Detaylara bak",
    privacyCta: "Gizlilik",
    supportCta: "Destek",
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbSupport: "Destek",
    detailIntro:
      "Tomar; Adobe Acrobat'a hafif bir alternatif olarak sık kullanılan PDF işlerini tek bir masaüstü penceresinde toplayan, açık kaynak bir PDF motoruyla yazılmış bir görüntüleyici ve düzenleyicidir. Şu anda geliştirme aşamasındadır.",
    detailSection: "Uygulama detayları",
    detailBody:
      "Tomar, PySide6 arayüzü ve pypdfium2 + pikepdf + ReportLab tabanlı bir motorla yazılmış bir masaüstü PDF uygulamasıdır. PDF ve görüntü dosyalarını açar, sayfaları düzenler, işaretler, birleştirir/böler ve dışa aktarır — tümü tamamen çevrimdışı, cihazınızda.",
    platforms: "Platform",
    platformValue: "Windows 10 / 11 (64-bit)",
    appNameLabel: "Uygulama Adı",
    tech: "Teknoloji",
    techValue: "Python · PySide6 · pypdfium2 · pikepdf · ReportLab",
    status: "Durum",
    statusValue:
      "Geliştiriliyor — herkese açık sürüm hazırlanıyor. Yayınlandığında Windows indirme bağlantısı bu sayfaya eklenecek.",
    featuresSection: "Öne çıkan özellikler",
    features: [
      { label: "Metin arama (Ctrl+F)", value: "Tüm sayfalarda büyük/küçük harf duyarsız arama; eşleşmeler vurgulanır ve aralarında gezinilir." },
      { label: "Kalem & Vurgu", value: "Serbest-el vurgu ve kalem; renk, kalınlık ve tür seçimi. Çizimler düzenlenebilir kalır." },
      { label: "Sekmeli çoklu PDF", value: "Birden çok PDF aynı anda açık; her sekme kendi sayfası, zoom'u ve geçmişiyle bağımsız bir belge." },
      { label: "Birleştir & Böl", value: "Birden çok PDF'i tek dosyada birleştir; sayfa ayıkla ya da her sayfayı ayrı dosyaya böl." },
      { label: "İçerik ekleme", value: "Belgenin üstüne metin ve resim katmanı ekle; taşınabilir ve düzenlenebilir, yalnızca kaydederken işlenir." },
      { label: "Resme aktarma & Yazdırma", value: "Sayfaları PNG/JPG olarak dışa aktar (96–300 DPI); önizlemeli yazdırma ve sayfa aralığı seçimi." }
    ],
    privacySection: "Gizlilik",
    privacyBody:
      "Tomar tamamen çevrimdışı çalışır: PDF'leriniz internete yüklenmez, uygulamada reklam, izleme, analitik veya telemetri yoktur. Yalnızca isteğe bağlı güncelleme denetimi, yeni sürüm olup olmadığını kontrol etmek için bağlanır.",
    privacyLink: "Gizlilik politikası",
    // support page
    supportTitle: "Destek",
    supportTitleIt: "Kanalları",
    supportIntro:
      "Tomar ile ilgili hata bildirimi, öneri ve teknik sorularınız için aşağıdaki kanalları kullanabilirsiniz.",
    supportSectionLabel: "Destek kanalları",
    supportDeveloper: "Geliştirici",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Tomar, Mehmet Gümrah tarafından geliştirilip yayınlanmaktadır. Hata bildirimi ve önerilerinizi e-posta ile iletebilirsiniz.",
    supportResponse: "Yanıt Süresi",
    supportResponseHeading: "Yanıt süresi",
    supportResponseText: "Talepler iş günleri içinde, genellikle aynı gün değerlendirilir.",
    supportPrivacyText: "Veri toplama ve kullanım politikası için gizlilik sayfasına bakın."
  },
  en: {
    appName: "Tomar",
    cardEyebrow: "Windows desktop · PDF editor",
    cardBody:
      "A lightweight desktop editor that brings everyday PDF tasks into one window: text search, pen/highlight, page editing, merge/split, export to image, and printing. Your data stays on your device.",
    platformDev: "Windows · In development",
    platformsLabel: "Supported platforms",
    previewLabel: "Preview",
    previewMeta: "PDF · Windows",
    previewAlt: "Tomar app icon",
    detailCta: "View details",
    privacyCta: "Privacy",
    supportCta: "Support",
    crumbHome: "Home",
    crumbApps: "Apps",
    crumbSupport: "Support",
    detailIntro:
      "Tomar is a desktop PDF viewer and editor — a lightweight alternative to Adobe Acrobat that gathers everyday PDF tasks into one window, built on an open-source PDF engine. It is currently in development.",
    detailSection: "App details",
    detailBody:
      "Tomar is a desktop PDF app built with a PySide6 interface and a pypdfium2 + pikepdf + ReportLab engine. It opens PDF and image files, edits pages, marks them up, merges/splits and exports them — all fully offline, on your device.",
    platforms: "Platform",
    platformValue: "Windows 10 / 11 (64-bit)",
    appNameLabel: "App Name",
    tech: "Technology",
    techValue: "Python · PySide6 · pypdfium2 · pikepdf · ReportLab",
    status: "Status",
    statusValue:
      "In development — a public release is being prepared. A Windows download link will be added to this page once it ships.",
    featuresSection: "Key features",
    features: [
      { label: "Text search (Ctrl+F)", value: "Case-insensitive search across every page; matches are highlighted and you can step through them." },
      { label: "Pen & Highlight", value: "Free-hand highlight and pen with color, thickness and type. Strokes stay editable." },
      { label: "Tabbed multi-PDF", value: "Several PDFs open at once; each tab is an independent document with its own page, zoom and history." },
      { label: "Merge & Split", value: "Merge multiple PDFs into one file; extract a page or split every page into a separate file." },
      { label: "Add content", value: "Layer text and images over the document; movable and editable, applied only when you save." },
      { label: "Export to image & Print", value: "Export pages as PNG/JPG (96–300 DPI); print with preview and page-range selection." }
    ],
    privacySection: "Privacy",
    privacyBody:
      "Tomar works entirely offline: your PDFs are never uploaded, and there are no ads, tracking, analytics or telemetry. Only the optional update check connects out, to see whether a newer version is available.",
    privacyLink: "Privacy policy",
    // support page
    supportTitle: "Support",
    supportTitleIt: "Channels",
    supportIntro:
      "For bug reports, suggestions, and technical questions about Tomar, please use the channels below.",
    supportSectionLabel: "Support channels",
    supportDeveloper: "Developer",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Tomar is developed and published by Mehmet Gümrah. You can send bug reports and suggestions by email.",
    supportResponse: "Response Time",
    supportResponseHeading: "Response time",
    supportResponseText: "Requests are reviewed during business days, usually within the same day.",
    supportPrivacyText: "See the privacy page for the data collection and usage policy."
  }
};

export function AppsIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const tt = tomarCopy[locale];

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
              width={256}
              height={256}
            />
            <div className="app-meta">
              <span className="sub">{t.cardEyebrow}</span>
              <span className="name">{t.appName}</span>
            </div>
          </div>
          <p>{t.cardBody}</p>
          {/* Status indicators, not links — every store link lives on the
              download page so the official badges are the only way in. */}
          <div className="platform-row" aria-label={t.platformsLabel}>
            <span className="platform-chip live">{t.platformAndroidLive}</span>
            <span className="platform-chip live">{t.platformIosLive}</span>
            <span className="platform-chip live">{t.platformWindowsLive}</span>
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
      </section>

      <section
        className="feat-grid"
        aria-label={tt.appName}
        style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}
      >
        <article className="feat-card">
          <div className="app-tile">
            <img
              className="app-tile-icon lg"
              src="/images/tomar-icon.png"
              alt={`${tt.appName} app logo`}
              width={256}
              height={256}
            />
            <div className="app-meta">
              <span className="sub">{tt.cardEyebrow}</span>
              <span className="name">{tt.appName}</span>
            </div>
          </div>
          <p>{tt.cardBody}</p>
          <div className="platform-row" aria-label={tt.platformsLabel}>
            <span className="platform-chip">{tt.platformDev}</span>
          </div>
          <div className="actions-row">
            <Link className="btn primary" href={`/${locale}/apps/tomar/`}>
              {tt.detailCta} <ArrowIcon />
            </Link>
            <Link className="btn" href={`/${locale}/apps/tomar/privacy/`}>
              {tt.privacyCta}
            </Link>
            <Link className="btn" href={`/${locale}/apps/tomar/support/`}>
              {tt.supportCta}
            </Link>
          </div>
        </article>

        <aside className="preview-card" aria-hidden="true">
          <div className="grid-bg" />
          <div className="preview-card-inner">
            <img
              src="/images/tomar-icon.png"
              alt={tt.previewAlt}
              width={256}
              height={256}
              loading="lazy"
              decoding="async"
              style={{
                width: "clamp(120px, 45%, 176px)",
                height: "auto",
                filter: "drop-shadow(0 24px 48px rgba(20, 8, 0, 0.18))"
              }}
            />
            <div className="preview-meta">
              <span>{tt.previewLabel}</span>
              <span>{tt.previewMeta}</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export function TeknoSalesDetail({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const downloadHref = `/${locale}/apps/teknosales/download/`;

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
            width={1024}
            height={1024}
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

        {/* The install CTA gets its own row: a store badge is taller than the
            secondary buttons and would otherwise unbalance the line. */}
        <div className="install-row">
          <InstallButton locale={locale} neutralLabel={t.installNeutral} fallbackHref={downloadHref} />
          <p className="install-hint">{t.installHint}</p>
        </div>

        <div className="actions-row">
          <Link className="btn" href={downloadHref}>
            {t.allOptionsCta}
          </Link>
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

    </main>
  );
}

/**
 * Download page — install routes only. The detail page links here, and the
 * smart install button falls back here whenever the platform can't be placed.
 */
export function TeknoSalesDownload({ locale }: { locale: Locale }) {
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
          <span>{t.crumbDownload}</span>
        </div>
        <h1>
          {t.downloadTitle} <span className="it">{t.downloadTitleIt}</span>
        </h1>
        <p className="meta">{t.downloadIntro}</p>

        <div className="install-row">
          {/* Falls back to the store list below when the platform is unknown. */}
          <InstallButton locale={locale} neutralLabel={t.installNeutral} fallbackHref="#stores" />
          <p className="install-hint">{t.installHint}</p>
        </div>
      </header>

      <section className="doc-section" id="stores" aria-label={t.storesSection}>
        <h2>{t.storesSection}</h2>
        <div className="store-grid">
          <div className="store-card">
            <a className="store-badge-link" href={links.appStore}>
              <StoreBadge platform="ios" locale={locale} />
            </a>
            <span className="store-meta">{t.storeIosMeta}</span>
          </div>

          <div className="store-card">
            <a className="store-badge-link" href={links.playStore}>
              <StoreBadge platform="android" locale={locale} />
            </a>
            <span className="store-meta">{t.storeAndroidMeta}</span>
          </div>

          <div className="store-card">
            <a className="store-badge-link" href={links.microsoftStore}>
              <StoreBadge platform="windows" locale={locale} />
            </a>
            <span className="store-meta">{t.storeWindowsMeta}</span>
          </div>

          {/* Not a store: a plain file download, so no badge and no borrowed mark. */}
          <div className="store-card">
            <a className="btn primary store-direct" href={links.windowsDownload} download>
              {t.storeDirectCta} <ArrowIcon />
            </a>
            <span className="store-meta">{t.storeDirectMeta}</span>
          </div>
        </div>
        <p className="legal-note">{t.trademarks}</p>
      </section>

      <section className="doc-section" aria-label={t.windowsSectionLabel}>
        <h2>{t.windowsTitle}</h2>
        <p>{t.windowsBody}</p>

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
          <a className="link" href={`mailto:${links.email}`}>
            {links.email}
          </a>
          <a className="link" href={`https://${links.domain}`} target="_blank" rel="noreferrer">
            {links.domain}
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

export function TomarDetail({ locale }: { locale: Locale }) {
  const t = tomarCopy[locale];

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
            src="/images/tomar-icon.png"
            alt={`${t.appName} app logo`}
            width={256}
            height={256}
          />
          <div className="meta-stack">
            <span className="kicker">
              <span className="dot" />
              {t.cardEyebrow}
            </span>
            <h1>{t.appName}</h1>
          </div>
        </div>
        <p className="meta">{t.detailIntro}</p>

        <div className="platform-row" aria-label={t.platformsLabel} style={{ marginTop: "1.25rem" }}>
          <span className="platform-chip">{t.platformDev}</span>
        </div>

        <div className="actions-row">
          <Link className="btn primary" href={`/${locale}/apps/tomar/privacy/`}>
            {t.privacyCta} <ArrowIcon />
          </Link>
          <Link className="btn" href={`/${locale}/apps/tomar/support/`}>
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
            <div className="value">{t.appName}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.tech}</div>
            <div className="value">{t.techValue}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.status}</div>
            <div className="value">{t.statusValue}</div>
          </div>
        </div>
      </section>

      <section className="doc-section" aria-label={t.featuresSection}>
        <h2>{t.featuresSection}</h2>
        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          {t.features.map((f) => (
            <div className="feature-cell" key={f.label}>
              <div className="label">{f.label}</div>
              <div className="value">{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="doc-section" aria-label={t.privacySection}>
        <h2>{t.privacySection}</h2>
        <p>{t.privacyBody}</p>
        <div className="actions-row" style={{ marginTop: "0.5rem" }}>
          <Link className="btn" href={`/${locale}/apps/tomar/privacy/`}>
            {t.privacyLink} <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

export function TomarSupport({ locale }: { locale: Locale }) {
  const t = tomarCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/tomar/`}>{t.appName}</Link>
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
          <span className="label">{t.supportDeveloper}</span>
          <h3>{t.supportDeveloperName}</h3>
          <p>{t.supportDeveloperText}</p>
          <a className="link" href={`mailto:${links.email}`}>
            {links.email}
          </a>
          <a className="link" href={`https://${links.domain}`} target="_blank" rel="noreferrer">
            {links.domain}
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
          <Link className="link" href={`/${locale}/apps/tomar/privacy/`}>
            {t.privacyCta} →
          </Link>
        </div>
      </section>
    </main>
  );
}
