import Link from "next/link";
import { ArrowIcon } from "./icons";
import { StoreBadge } from "./store-badges";
import { InstallButton } from "./install-button";
import { links, portalLinks, portalBadgeless, portalAndroidTest, gumrahSahaLinks } from "./site-config";
import type { Locale } from "./locale";
import { AndroidTesterForm } from "./android-tester-form";
import { AndroidTesterJoin } from "./android-tester-join";

const copy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbPrivacy: "Gizlilik",
    crumbSupport: "Destek",
    crumbDownload: "İndir",
    appsTitle: "Uygulamalar",
    appsIntro: "Geliştirdiğim mobil, masaüstü ve web uygulamaları; destek sayfaları ve resmi dokümantasyon bağlantıları.",
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
    appsIntro: "Mobile, desktop, and web apps, support pages, and official documentation links that I maintain.",
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
 * Tekno Portal — the customer-facing sibling of TeknoSales (iOS, Android, Windows),
 * currently being submitted to the stores. Same backend, opposite identity: a staff
 * user sees every account they are assigned, a Portal user only ever sees their own.
 * Its own copy table for the same reason as Tomar's — the TeknoSales strings stay put.
 */
const portalCopy = {
  tr: {
    appName: "Tekno Portal",
    cardEyebrow: "Müşteri portalı · üç platform",
    cardBody:
      "Tekno İklimlendirme müşterilerinin kendi cari ekstresini, bakiyesini, faturalarını ve siparişlerini görebildiği; kart ile ödeme yapıp kendi kataloğundan sipariş verebildiği mobil ve masaüstü uygulama.",
    platformIos: "iOS · Yayında",
    platformAndroid: "Android · Kapalı test",
    platformWindows: "Windows · Yayında",
    platformsLabel: "Desteklenen platformlar",
    previewLabel: "Önizleme",
    previewMeta: "iOS · Android · Windows",
    previewAlt: "Tekno Portal uygulama simgesi",
    detailCta: "Detaylara bak",
    privacyCta: "Gizlilik",
    supportCta: "Destek",
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbSupport: "Destek",
    crumbDownload: "İndir",

    downloadCta: "İndir",
    installNeutral: "Yükle",
    installHint: "Cihazınıza uygun mağazaya yönlendirilirsiniz.",
    installIosHint: "iPhone ve iPad için App Store'da yayında.",
    allOptionsCta: "Tüm indirme seçenekleri",
    downloadTitle: "Tekno Portal'ı",
    downloadTitleIt: "indir",
    downloadIntro:
      "Aynı uygulama iPhone, Android ve Windows için ayrı ayrı yayınlanır. Yukarıdaki butonla cihazınıza uygun yola gidebilir ya da aşağıdan kendiniz seçebilirsiniz. Windows'ta önerilen yol mağaza değil, aşağıdaki kurulum dosyasıdır.",
    storesSection: "Kurulum seçenekleri",
    storeIosMeta: "iPhone · iPad",
    storeAndroidMeta: "Android · Kapalı test · e-posta ile katılım",
    /** Grup yolunda adres toplanmaz; ziyaretçi gruba kendi katılır. */
    storeAndroidMetaGrup: "Android · Kapalı test · gruba katılarak",
    storeWindowsMeta: "Windows 10 / 11 (64-bit) · Kart ile ödeme ve IBAN yok",
    storeDirectCta: "Setup.exe indir",
    storeDirectMeta: "Windows 10 / 11 (64-bit) · Tam sürüm · önerilen",
    storeStatusTitle: "Yayın durumu",
    storeStatusBody:
      "Tekno Portal App Store'da yayında; App Store bağlantısı uygulamanın kendi listelemesini açar. Android sürümü Google Play'de kapalı testte: uygulamayı yalnızca test listesindeki hesaplar kurabilir, o yüzden Android için önce e-posta adresi alıyoruz. Windows'ta iki sürüm var ve aynı değiller — Microsoft Store sürümünde kart ile ödeme ve IBAN alanları kapalı, çünkü Store bu işlemleri bireysel yayıncı hesabına açmıyor. Tam sürüm, buradan indirilen Setup.exe'dir. Bu sayfanın adresi (mgumrah.com/portal) değişmez.",
    accountTitle: "Hesap açılışı",
    accountBody:
      "Portal hesapları uygulama üzerinden oluşturulmaz. Kullanıcı adı ve şifreniz satış temsilciniz tarafından tanımlanır; uygulamayı kurduktan sonra bu bilgilerle giriş yaparsınız.",

    windowsSectionLabel: "Windows kurulumu",
    windowsEyebrow: "Windows · kurulum dosyası",
    windowsTitle: "Windows'a kurulum",
    windowsIntro:
      "Windows sürümünün tamamı — kart ile ödeme ve IBAN dahil — buradan indirilen kurulum dosyasında. Dosyayı indirin, çalıştırın, kurulum kendiliğinden tamamlanır. Yalnızca ilk çalıştırmada Windows'un bir güvenlik ekranı çıkar; aşağıdaki adımlarda hangi düğmeye basacağınız yazıyor.",
    windowsDownloadCta: "Setup.exe indir",
    windowsDownloadMeta: "TeknoPortal-win-Setup.exe · ~127 MB · Windows 10 / 11 (64-bit)",
    windowsWarnTitle: "İlk kurulumda “Bilinmeyen yayıncı” uyarısı çıkar — bu normaldir.",
    windowsWarnBody:
      "Kurulum dosyası henüz kod imzalama sertifikası taşımıyor. Sertifika alınana kadar Windows yayıncıyı tanımadığı için mavi bir uyarı ekranı gösterir. Dosyanın bozuk ya da zararlı olduğu anlamına gelmez; uyarıyı geçmek için aşağıdaki iki tıklama yeterli.",
    windowsStepsTitle: "Adım adım kurulum",
    windowsSteps: [
      {
        title: "1. Dosyayı indirin",
        body: "Yukarıdaki “Setup.exe indir” düğmesine basın. Tarayıcınız indirmeyi durdurup “bu dosya güvenli olmayabilir” derse, indirme satırındaki ‹ › ya da ⋮ menüsünden “Sakla” / “Yine de indir” seçeneğini işaretleyin."
      },
      {
        title: "2. Dosyaya çift tıklayın",
        body: "İndirilenler klasöründeki TeknoPortal-win-Setup.exe dosyasını açın."
      },
      {
        title: "3. Mavi ekranda “Daha fazla bilgi” yazısına basın",
        body: "“Windows bilgisayarınızı korudu” başlıklı mavi pencere açılırsa, metnin altındaki küçük “Daha fazla bilgi” bağlantısına tıklayın. Bu bir düğme değil, altı çizili bir yazıdır; pencere kapanmaz, sadece genişler."
      },
      {
        title: "4. Beliren “Yine de çalıştır” düğmesine basın",
        body: "Bir önceki adımdan sonra pencerenin sağ altında “Yine de çalıştır” düğmesi görünür. Ona bastığınızda kurulum başlar."
      },
      {
        title: "5. Kurulumun bitmesini bekleyin",
        body: "Kurulum başka soru sormaz; tamamlanınca Tekno Portal kendiliğinden açılır. Masaüstünüzde ve Başlat menüsünde kısayolu oluşur."
      },
      {
        title: "6. Giriş yapın",
        body: "Kullanıcı adı ve şifreniz satış temsilciniz tarafından tanımlanır. Uygulama üzerinden yeni hesap oluşturulamaz."
      }
    ],
    windowsUpdatesTitle: "Güncellemeler",
    windowsUpdatesBody:
      "Setup.exe sürümü her açılışta yeni sürüm denetler ve yalnızca değişen küçük bir paketi indirir. Uyarı ekranı yalnızca ilk kurulumda çıkar; güncellemelerde tekrar görmezsiniz.",
    windowsStoreAltTitle: "Microsoft Store sürümü",
    windowsStoreAltBody:
      "Kurulum dosyasını çalıştıramıyorsanız (örneğin şirket bilgisayarınızda imzasız kuruluma izin yoksa) ya da güncellemeleri Store'un yönetmesini istiyorsanız Store sürümünü kurabilirsiniz. Bu sürümde uyarı ekranı çıkmaz; karşılığında kart ile ödeme ve IBAN alanları bulunmaz.",
    windowsStoreAltCta: "Microsoft Store'da aç",
    windowsStoreAltPrivacy: "Store sürümünün gizlilik politikası",

    trademarks:
      "Apple ve Apple logosu, Apple Inc.'in ABD ve diğer ülkelerde tescilli ticari markalarıdır. App Store, Apple Inc.'in hizmet markasıdır. Google Play ve Google Play logosu, Google LLC'nin ticari markalarıdır. Microsoft ve Microsoft Store, Microsoft şirketler grubunun ticari markalarıdır.",

    detailIntro:
      "Tekno Portal, Tekno İklimlendirme müşterilerine yönelik B2B self-servis uygulamasıdır. Müşteri; kendi cari hesabını, bakiyesini, faturalarını, siparişlerini ve tekliflerini görüntüler, kart ile ödeme yapar ve kendi kataloğundan sipariş verir.",
    detailSection: "Uygulama detayları",
    detailBody:
      "Uygulama iOS (SwiftUI), Android (Kotlin / Compose) ve Windows (WinUI 3 / .NET) için ayrı ayrı geliştirildi; üç platformda davranış birebir aynı tutuluyor. Personel uygulaması Tekno Satış ile aynı sunucuyu kullanır, ancak kimlik ekseninde ayrılır: her Portal hesabı yalnızca kendi cari kümesini görür. Hesaplar uygulama üzerinden açılmaz — müşteri hesabını satış temsilcisi tanımlar.",
    platforms: "Platformlar",
    platformValue: "iOS 18+, Android ve Windows 10 / 11 (64-bit)",
    appNameLabel: "Uygulama Adı",
    usage: "Kullanım Alanı",
    usageValue: "B2B müşteri self-servisi: cari ekstre, sipariş, ödeme ve katalog",
    status: "Durum",
    statusValue:
      "iOS sürümü App Store'da yayında; Android sürümü Google Play'de kapalı testte. Windows sürümü hem Microsoft Store'da hem de doğrudan indirilen kurulum dosyası olarak yayında — kart ile ödeme ve IBAN yalnızca kurulum dosyasındaki sürümde var. İlk sürümlerde modül kapsamı platformdan platforma farklılık gösterebilir; eksik modüller sonraki güncellemelerle eşitlenir.",
    featuresSection: "Öne çıkan özellikler",
    features: [
      {
        label: "Cari ekstre ve bakiye",
        value: "Kendi hesaplarınızın bakiyesi, borç / alacak durumu ve hareket geçmişi; fatura kalemleri ve fatura PDF'i."
      },
      {
        label: "Sipariş ver ve tekliflerim",
        value: "Kendi kataloğunuzdan ürün arayıp sipariş oluşturma. Fiyat ve cari kodu istemciden gönderilmez; sunucu türetir."
      },
      {
        label: "Bekleyen siparişlerim",
        value: "Henüz sevk edilmemiş siparişleriniz — salt okunur liste, arama ve PDF çıktısı."
      },
      {
        label: "Kart ile ödeme (3D Secure)",
        value: "Hesabınıza kartla tahsilat. Kart bilgileri cihaza yazılmaz; ödeme bankanın 3D Secure sayfasında tamamlanır."
      },
      {
        label: "Ürün hareketlerim",
        value: "Hangi ürünü ne zaman, hangi fiyata aldığınızın dökümü; ürün bazında föy."
      },
      {
        label: "Katalog, valörmatik ve iskonto",
        value: "Güncel ürün katalogları (PDF) ile vade farkı ve iskonto hesaplama araçları."
      }
    ],
    privacySection: "Gizlilik",
    privacyBody:
      "Tekno Portal'da reklam, izleme, analitik ve telemetri yoktur; konum, kamera, mikrofon veya rehber izni istenmez. Kart bilgileri cihazda saklanmaz. Profil altında kendi girdiğiniz IBAN ve adres kayıtları yalnızca cihazınızda kalır, sunucuya gönderilmez.",
    privacyLink: "Gizlilik politikası",
    supportTitle: "Destek",
    supportTitleIt: "Kanalları",
    supportIntro:
      "Tekno Portal ile ilgili hesap erişimi, cari verileriniz ve teknik sorunlar için aşağıdaki kanalları kullanabilirsiniz.",
    supportSectionLabel: "Destek kanalları",
    supportCompany: "Firma Desteği",
    supportCompanyName: "Tekno İklimlendirme",
    supportCompanyText:
      "Hesap, yetki, cari veri, fatura, sipariş ve tahsilat süreçleri için destek e-postasını kullanabilirsiniz.",
    supportAccount: "Hesap Erişimi",
    supportAccountHeading: "Hesabınızı temsilciniz açar",
    supportAccountText:
      "Portal hesapları uygulama üzerinden oluşturulmaz. Kullanıcı adı, şifre ve yetki talepleri için satış temsilcinize ya da firma desteğine başvurun.",
    supportTechnical: "Teknik Geliştirici",
    supportTechnicalName: "Mehmet Gümrah",
    supportTechnicalText:
      "Uygulama yayını ve teknik sayfalar Mehmet Gümrah tarafından yönetilmektedir.",
    supportResponse: "Yanıt Süresi",
    supportResponseHeading: "Yanıt süresi",
    supportResponseText: "Destek talepleri iş günleri içinde, genellikle aynı gün değerlendirilir.",
    supportPrivacyText: "Veri toplama, saklama ve kullanım politikası için gizlilik sayfasına bakın."
  },
  en: {
    appName: "Tekno Portal",
    cardEyebrow: "Customer portal · three platforms",
    cardBody:
      "A mobile and desktop app where Tekno İklimlendirme customers review their own account statement, balance, invoices, and orders — and pay by card or place an order from their own catalog.",
    platformIos: "iOS · Live",
    platformAndroid: "Android · Closed testing",
    platformWindows: "Windows · Live",
    platformsLabel: "Supported platforms",
    previewLabel: "Preview",
    previewMeta: "iOS · Android · Windows",
    previewAlt: "Tekno Portal app icon",
    detailCta: "View details",
    privacyCta: "Privacy",
    supportCta: "Support",
    crumbHome: "Home",
    crumbApps: "Apps",
    crumbSupport: "Support",
    crumbDownload: "Download",

    downloadCta: "Download",
    installNeutral: "Install",
    installHint: "You'll be sent to the store that matches your device.",
    installIosHint: "Live on the App Store for iPhone and iPad.",
    allOptionsCta: "All download options",
    downloadTitle: "Download",
    downloadTitleIt: "Tekno Portal",
    downloadIntro:
      "The same app ships separately for iPhone, Android, and Windows. Use the button above to take the route that matches your device, or pick one below. On Windows the recommended route is not the store — it is the installer below.",
    storesSection: "Install options",
    storeIosMeta: "iPhone · iPad",
    storeAndroidMeta: "Android · Closed testing · join by e-mail",
    /** On the group route no address is collected; the visitor joins it themselves. */
    storeAndroidMetaGrup: "Android · Closed testing · join the group",
    storeWindowsMeta: "Windows 10 / 11 (64-bit) · No card payment or IBAN",
    storeDirectCta: "Download Setup.exe",
    storeDirectMeta: "Windows 10 / 11 (64-bit) · Full build · recommended",
    storeStatusTitle: "Release status",
    storeStatusBody:
      "Tekno Portal is live on the App Store, and the App Store link opens the app's own listing. The Android build is in closed testing on Google Play: only accounts on the tester list can install it, which is why Android starts with an e-mail address here. On Windows there are two builds and they are not the same — the Microsoft Store version ships without card payment and IBAN, because the Store does not open those to an individual publisher account. The full build is the Setup.exe downloaded here. This page's address (mgumrah.com/portal) stays the same.",
    accountTitle: "Account setup",
    accountBody:
      "Portal accounts are not created in the app. Your sales representative sets up your username and password; you sign in with those once the app is installed.",

    windowsSectionLabel: "Windows installation",
    windowsEyebrow: "Windows · installer",
    windowsTitle: "Installing on Windows",
    windowsIntro:
      "The complete Windows build — card payment and IBAN included — is the installer you download here. Download it, run it, and setup finishes on its own. Only the first run brings up a Windows security screen; the steps below say exactly which button to click.",
    windowsDownloadCta: "Download Setup.exe",
    windowsDownloadMeta: "TeknoPortal-win-Setup.exe · ~127 MB · Windows 10 / 11 (64-bit)",
    windowsWarnTitle: "The first install shows an “unknown publisher” warning — this is normal.",
    windowsWarnBody:
      "The installer does not carry a code-signing certificate yet. Until one is in place, Windows does not recognize the publisher and shows a blue warning screen. It does not mean the file is broken or harmful; two clicks get past it.",
    windowsStepsTitle: "Step by step",
    windowsSteps: [
      {
        title: "1. Download the file",
        body: "Click “Download Setup.exe” above. If your browser stops the download and says the file may not be safe, open the ‹ › or ⋮ menu on the download row and choose “Keep” / “Download anyway”."
      },
      {
        title: "2. Double-click the file",
        body: "Open TeknoPortal-win-Setup.exe from your Downloads folder."
      },
      {
        title: "3. On the blue screen, click “More info”",
        body: "If a blue window titled “Windows protected your PC” appears, click the small “More info” link under the text. It is a link, not a button; the window does not close, it just expands."
      },
      {
        title: "4. Click “Run anyway”",
        body: "After the previous step, a “Run anyway” button appears at the bottom right of the window. Click it and the installer starts."
      },
      {
        title: "5. Wait for setup to finish",
        body: "Setup asks nothing else; Tekno Portal opens by itself when it is done, and shortcuts appear on your desktop and in the Start menu."
      },
      {
        title: "6. Sign in",
        body: "Your sales representative sets up your username and password. New accounts cannot be created in the app."
      }
    ],
    windowsUpdatesTitle: "Updates",
    windowsUpdatesBody:
      "The Setup.exe build checks for a new version on every launch and downloads only the small changed package. The warning screen appears on the first install only — you will not see it again on updates.",
    windowsStoreAltTitle: "Microsoft Store build",
    windowsStoreAltBody:
      "If you cannot run the installer — for example your work computer does not allow unsigned installs — or you would rather the Store handled updates, install the Store build instead. It shows no warning screen; in exchange, it has no card payment and no IBAN fields.",
    windowsStoreAltCta: "Open in Microsoft Store",
    windowsStoreAltPrivacy: "Privacy policy for the Store build",

    trademarks:
      "Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC. Microsoft and Microsoft Store are trademarks of the Microsoft group of companies.",

    detailIntro:
      "Tekno Portal is the B2B self-service app for Tekno İklimlendirme customers. A customer reviews their own account, balance, invoices, orders, and quotes, pays by card, and places orders from their own catalog.",
    detailSection: "App details",
    detailBody:
      "The app is built separately for iOS (SwiftUI), Android (Kotlin / Compose), and Windows (WinUI 3 / .NET), with behavior kept identical across the three. It shares a backend with the staff app, Tekno Sales, but splits on identity: a Portal account only ever sees its own set of accounts. Accounts are not created in the app — a sales representative sets up the customer's account.",
    platforms: "Platforms",
    platformValue: "iOS 18+, Android, and Windows 10 / 11 (64-bit)",
    appNameLabel: "App Name",
    usage: "Use Case",
    usageValue: "B2B customer self-service: statements, orders, payments, and catalogs",
    status: "Status",
    statusValue:
      "The iOS version is live on the App Store; the Android build is in closed testing on Google Play. The Windows version is live both on the Microsoft Store and as a direct installer — card payment and IBAN exist only in the installer build. Module coverage may differ between platforms in the first releases; missing modules are brought level in later updates.",
    featuresSection: "Key features",
    features: [
      {
        label: "Statement and balance",
        value: "Balance, debit / credit status, and activity history for your own accounts; invoice lines and invoice PDFs."
      },
      {
        label: "Place orders and quotes",
        value: "Search your own catalog and place an order. Neither price nor account code is sent by the client — the server derives both."
      },
      {
        label: "Pending orders",
        value: "Orders not yet shipped — a read-only list with search and a PDF export."
      },
      {
        label: "Card payment (3D Secure)",
        value: "Pay into your account by card. Card details are never written to the device; payment completes on the bank's 3D Secure page."
      },
      {
        label: "My product activity",
        value: "A breakdown of which product you bought, when, and at what price, plus a per-product ledger."
      },
      {
        label: "Catalog, term and discount tools",
        value: "Current product catalogs (PDF) with term-difference and discount calculators."
      }
    ],
    privacySection: "Privacy",
    privacyBody:
      "Tekno Portal contains no advertising, tracking, analytics, or telemetry, and asks for no location, camera, microphone, or contacts permission. Card details are not stored on the device. The IBANs and addresses you enter under Profile stay on your device only and are never sent to the server.",
    privacyLink: "Privacy policy",
    supportTitle: "Support",
    supportTitleIt: "Channels",
    supportIntro:
      "For account access, questions about your account data, and technical issues with Tekno Portal, please use the channels below.",
    supportSectionLabel: "Support channels",
    supportCompany: "Company Support",
    supportCompanyName: "Tekno İklimlendirme",
    supportCompanyText:
      "For account, authorization, customer data, invoice, order, and collection workflows, use the support email address.",
    supportAccount: "Account Access",
    supportAccountHeading: "Your representative opens the account",
    supportAccountText:
      "Portal accounts cannot be created in the app. For usernames, passwords, and permissions, contact your sales representative or company support.",
    supportTechnical: "Technical Developer",
    supportTechnicalName: "Mehmet Gümrah",
    supportTechnicalText: "App publishing and technical pages are maintained by Mehmet Gümrah.",
    supportResponse: "Response Time",
    supportResponseHeading: "Response time",
    supportResponseText: "Support requests are reviewed during business days, usually within the same day.",
    supportPrivacyText: "See the privacy page for data collection, storage, and usage policy."
  }
};

/**
 * Gümrah Saha — a multi-tenant field sales app, and a product family of its own rather
 * than a third Tekno app. Its own copy table for the same reason as the others.
 *
 * The one place its wording must not be borrowed from the Tekno pages: there is no central
 * server here. Each business runs its own installation and the app resolves a firm code to
 * it, so data never reaches the developer. That is why the privacy and support copy points
 * at "your own business" instead of naming a single company.
 */
const gumrahSahaCopy = {
  tr: {
    appName: "Gümrah Saha",
    cardEyebrow: "Saha satış · dört platform",
    cardBody:
      "Satış ekiplerinin ve yöneticilerin cari hesapları, stoğu, teklif, sipariş, fatura ve tahsilatı sahadan takip ettiği uygulama; Android, iOS, web ve Windows’ta. Tek uygulama, birden çok işletme: her firma kendi sunucu kurulumuna kendi firma koduyla bağlanır.",
    platformAndroid: "Android · Yakında",
    platformIos: "iOS · Yakında",
    platformWeb: "Web · Yayında",
    platformWindows: "Windows · Firmanız üzerinden",
    platformsLabel: "Desteklenen platformlar",
    previewLabel: "Önizleme",
    previewMeta: "Android · iOS · Web · Windows",
    previewAlt: "Gümrah Saha uygulama simgesi",
    detailCta: "Detaylara bak",
    privacyCta: "Gizlilik",
    supportCta: "Destek",
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbSupport: "Destek",

    detailIntro:
      "Gümrah Saha, saha satış ekipleri için geliştirilen çok firmalı bir uygulamadır; Android, iOS, web ve Windows’ta çalışır. Temsilci ve yönetici; yetkisindeki cari hesapları, ekstreleri, stokları, teklif, sipariş, fatura ve tahsilatları tek yerden görür. Uygulama merkezi bir sunucuya değil, çalıştığınız işletmenin kendi kurulumuna bağlanır.",
    platformsSection: "Platformlar",
    platformsIntro:
      "Gümrah Saha tek bir ürün, ama her platform için ayrı ayrı, o platformun kendi araçlarıyla yazıldı. Dört sürüm de aynı sunucuya aynı şekilde bağlanır; davranışları birebir aynı tutulur.",
    platformDetails: [
      {
        label: "Android",
        value: "Kotlin ve Jetpack Compose · Android 8.0 ve üzeri. Google Play yayınına hazırlanıyor; henüz mağazada değil."
      },
      {
        label: "iOS",
        value: "Swift ve SwiftUI · iPhone ve iPad, iOS 26 ve üzeri. App Store yayınına hazırlanıyor; henüz mağazada değil."
      },
      {
        label: "Web",
        value: `React ve TypeScript · güncel bir tarayıcı yeter, kurulum gerekmez. Her firmanın kendi adresinde yayında: https://<kod>.${gumrahSahaLinks.kurulumAlanAdi}${gumrahSahaLinks.webYolu}`,
        live: true
      },
      {
        label: "Windows",
        value: "WinUI 3 ve .NET 10 · Windows 10 (1809 ve sonrası) ya da Windows 11, 64-bit. Mağazada yayınlanmıyor; kurulum paketini firmanızın sistem sorumlusu verir."
      }
    ],
    detailSection: "Uygulama detayları",
    detailBody:
      "Açılışta firma kodu ya da sunucu adresiyle bağlanılır, ardından kullanıcı adı ve şifreyle giriş yapılır. Web sürümü firmanın kendi adresinden açıldığı için bu adımı atlar ve doğrudan giriş ekranıyla başlar. Hangi modüllerin ve ekranların görüneceğini sunucudan gelen firma yapılandırması ile kullanıcının rolü belirler: aynı uygulama her işletmede farklı bir menüyle açılır.",
    usage: "Kullanım Alanı",
    usageValue: "Saha satış ve ön muhasebe: cari, stok, teklif, sipariş, irsaliye, fatura ve tahsilat",
    controller: "Veri Sorumlusu",
    controllerValue:
      "Uygulamayı kullandığınız işletme. Ticari veriler o işletmenin kendi sunucusunda tutulur; geliştiricinin bu verileri topladığı merkezi bir sunucu yoktur.",
    featuresSection: "Öne çıkan özellikler",
    features: [
      {
        label: "Firma koduyla bağlanma",
        value: `Firma kodunuz https://<kod>.${gumrahSahaLinks.kurulumAlanAdi}/ adresine çözülür; kurulumunuz başka bir adresteyse sunucu adresi elle yazılır. Web sürümü zaten firmanın adresinden açıldığı için kod sormaz.`
      },
      {
        label: "Firmaya göre menü",
        value: "Ana menü üç eksenin kesişimidir: işletmenin lisanslı modülleri, firma yapılandırmasından gelen ekran ayarı ve kullanıcının rol yetkileri. Firmanın logosu ve marka rengi de sunucudan gelir."
      },
      {
        label: "Patron ekranı ve raporlar",
        value: "Yönetici için şirketin nakit ve borç durumunu özetleyen pano; kâr / zarar, cari raporları, mutabakat ve vade ortalaması."
      },
      {
        label: "Cari hesaplar ve ekstre",
        value: "Yetkinizdeki cariler bakiyeleriyle tek listede; cari kartında adres, yol tarifi, telefon ve e-posta. Devir satırı ve yürüyen bakiyeli ekstre, PDF çıktısıyla. Uygulamadan yeni cari de açılır."
      },
      {
        label: "Stok ve kataloglar",
        value: "Ürün kartları, miktar ve fiyat bilgisi; yeni stok kartı açma ve PDF ürün katalogları."
      },
      {
        label: "Teklif, sipariş ve irsaliye",
        value: "Teklif hazırlama ve PDF çıktısı; bekleyen siparişler ve irsaliyeler, irsaliye fiyatlandırma ve fabrika sipariş önerisi."
      },
      {
        label: "Fatura ve tahsilat",
        value: "Faturalar ve kalemleri, GİB’den gelip henüz işlenmemiş e-fatura ve e-irsaliyeler; tahsilat makbuzu (PDF), tahsilat raporu, geçilen kartlar ve çek / senet."
      },
      {
        label: "Mesajlar ve kullanıcılar",
        value: "Birebir, grup ve duyuru mesajları; öneri, şikâyet ve hata için geri bildirim. Yönetici personel hesaplarını uygulamadan yönetir."
      }
    ],
    privacySection: "Gizlilik",
    privacyBody:
      "Gümrah Saha’nın hiçbir sürümünde reklam, kullanım analitiği ya da çökme raporlama yoktur; konum, kamera, mikrofon, rehber, fotoğraf ve takvim izni istenmez. Ticari veriler çalıştığınız işletmenin kendi sunucusunda tutulur. Oturum bilgileri her platformun korumalı deposundadır: iOS’ta Anahtar Zinciri, Android’de şifreli depolama, Windows’ta Windows’un veri koruma şifrelemesi (DPAPI); web’de oturum sekme kapanınca biter. Bildirim yalnızca Android sürümünde var ve Google’ın Firebase Cloud Messaging hizmetiyle iletilir. Aşağıdaki gizlilik politikası iOS sürümünü kapsar.",
    privacyLink: "Gizlilik politikası (iOS)",

    supportTitle: "Destek",
    supportTitleIt: "Kanalları",
    supportIntro:
      "Gümrah Saha ile ilgili hesap erişimi, firma bağlantısı ve teknik sorunlar için aşağıdaki kanalları kullanabilirsiniz.",
    supportSectionLabel: "Destek kanalları",
    supportCompany: "Firma Desteği",
    supportCompanyHeading: "Önce çalıştığınız işletme",
    supportCompanyText:
      "Gümrah Saha çok firmalı bir uygulamadır: hesabınızı, yetkilerinizi ve gördüğünüz verileri çalıştığınız işletme yönetir. Kullanıcı adı, şifre, yetki, cari ve stok verisiyle ilgili talepler için önce kendi firmanızın yetkilisine başvurun.",
    supportConnect: "Firma Bağlantısı",
    supportConnectHeading: "Firma kodu ve bağlantı anahtarı",
    supportConnectText: `Mobil ve masaüstü uygulamalar firma kodunuzu <kod>.${gumrahSahaLinks.kurulumAlanAdi} adresine çözer; kurulumunuz farklı bir adresteyse sunucu adresini elle yazarsınız. Web sürümü aynı adresin ${gumrahSahaLinks.webYolu} yolunda açılır ve firma kodu sormaz. Firma kodu, sunucu adresi ve bağlantı anahtarı işletmenizin sistem sorumlusundan alınır — bu bilgiler uygulamayla birlikte gelmez. Windows sürümünün kurulum paketini de aynı kişi verir.`,
    supportTechnical: "Teknik Geliştirici",
    supportTechnicalName: "Mehmet Gümrah",
    supportTechnicalText:
      "Uygulama yayını ve teknik sayfalar Mehmet Gümrah tarafından yönetilmektedir. Uygulama hatalarını ve önerilerinizi e-posta ile iletebilirsiniz.",
    supportResponse: "Yanıt Süresi",
    supportResponseHeading: "Yanıt süresi",
    supportResponseText: "Destek talepleri iş günleri içinde, genellikle aynı gün değerlendirilir.",
    supportPrivacyText: "Veri toplama, saklama ve kullanım politikası için gizlilik sayfasına bakın."
  },
  en: {
    appName: "Gümrah Saha",
    cardEyebrow: "Field sales · four platforms",
    cardBody:
      "An app for sales teams and managers to follow customer accounts, stock, quotes, orders, invoices, and collections from the field — on Android, iOS, the web, and Windows. One app, many businesses: each firm connects to its own server installation with its own firm code.",
    platformAndroid: "Android · Soon",
    platformIos: "iOS · Soon",
    platformWeb: "Web · Live",
    platformWindows: "Windows · Via your company",
    platformsLabel: "Supported platforms",
    previewLabel: "Preview",
    previewMeta: "Android · iOS · Web · Windows",
    previewAlt: "Gümrah Saha app icon",
    detailCta: "View details",
    privacyCta: "Privacy",
    supportCta: "Support",
    crumbHome: "Home",
    crumbApps: "Apps",
    crumbSupport: "Support",

    detailIntro:
      "Gümrah Saha is a multi-tenant app for field sales teams that runs on Android, iOS, the web, and Windows. Representatives and managers see the customer accounts, statements, stock, quotes, orders, invoices, and collections they are authorised for in one place. The app connects to the installation run by the business you work for, not to a central server.",
    platformsSection: "Platforms",
    platformsIntro:
      "Gümrah Saha is one product, written separately for each platform with that platform’s own tools. All four versions connect to the same server in the same way, and their behaviour is kept identical.",
    platformDetails: [
      {
        label: "Android",
        value: "Kotlin and Jetpack Compose · Android 8.0 and later. Being prepared for Google Play; not in the store yet."
      },
      {
        label: "iOS",
        value: "Swift and SwiftUI · iPhone and iPad, iOS 26 and later. Being prepared for the App Store; not in the store yet."
      },
      {
        label: "Web",
        value: `React and TypeScript · any current browser, nothing to install. Live at each firm’s own address: https://<firmcode>.${gumrahSahaLinks.kurulumAlanAdi}${gumrahSahaLinks.webYolu}`,
        live: true
      },
      {
        label: "Windows",
        value: "WinUI 3 and .NET 10 · Windows 10 (1809 or later) or Windows 11, 64-bit. Not published in a store; your company’s system administrator provides the installation package."
      }
    ],
    detailSection: "App details",
    detailBody:
      "On launch you connect with a firm code or a server address, then sign in with a username and password. The web version opens from the firm’s own address, so it skips that step and starts at the sign-in screen. Which modules and screens appear is decided by the firm configuration returned by the server together with the user’s role: the same app opens with a different menu at every business.",
    usage: "Use Case",
    usageValue: "Field sales and bookkeeping: accounts, stock, quotes, orders, waybills, invoices, and collections",
    controller: "Data Controller",
    controllerValue:
      "The business you use the app with. Business data is kept on that business’s own server; the developer runs no central server that collects it.",
    featuresSection: "Key features",
    features: [
      {
        label: "Connect with a firm code",
        value: `Your firm code resolves to https://<firmcode>.${gumrahSahaLinks.kurulumAlanAdi}/; if your installation lives at a different address, the server address is entered by hand. The web version already opens from the firm’s address, so it asks for no code.`
      },
      {
        label: "Menu shaped by the firm",
        value: "The main menu is the intersection of three axes: the modules the business is licensed for, the screen configuration returned by the server, and the user’s role permissions. The firm’s logo and brand colour come from the server too."
      },
      {
        label: "Owner dashboard and reports",
        value: "A dashboard that sums up the company’s cash and debt position for management; profit and loss, account reports, reconciliation, and average due date."
      },
      {
        label: "Accounts and statements",
        value: "The accounts you are authorised for, with balances, in one list; address, directions, phone, and email on each account. Statements with an opening balance row and a running balance, exported as PDF. New accounts can be opened from the app."
      },
      {
        label: "Stock and catalogs",
        value: "Product records with quantity and price; new stock records and PDF product catalogs."
      },
      {
        label: "Quotes, orders, and waybills",
        value: "Quote creation with PDF output; pending orders and waybills, waybill pricing, and factory order suggestions."
      },
      {
        label: "Invoices and collections",
        value: "Invoices and their lines, plus e-invoices and e-waybills received from GİB that are not yet processed; collection receipts (PDF), collection reports, card collections, and cheques and notes."
      },
      {
        label: "Messages and users",
        value: "One-to-one, group, and announcement messages; feedback for suggestions, complaints, and bugs. Managers handle staff accounts from within the app."
      }
    ],
    privacySection: "Privacy",
    privacyBody:
      "No version of Gümrah Saha contains advertising, usage analytics, or crash reporting, and none asks for location, camera, microphone, contacts, photo, or calendar access. Business data is kept on the server run by the business you work for. Session credentials live in each platform’s protected store: the Keychain on iOS, encrypted storage on Android, and Windows data protection (DPAPI) on Windows; on the web, the session ends when the tab is closed. Notifications exist only in the Android version and are delivered through Google’s Firebase Cloud Messaging. The privacy policy below covers the iOS version.",
    privacyLink: "Privacy policy (iOS)",

    supportTitle: "Support",
    supportTitleIt: "Channels",
    supportIntro:
      "For account access, firm connection, and technical issues with Gümrah Saha, please use the channels below.",
    supportSectionLabel: "Support channels",
    supportCompany: "Company Support",
    supportCompanyHeading: "Your own business comes first",
    supportCompanyText:
      "Gümrah Saha is multi-tenant: your account, your permissions, and the data you can see are all managed by the business you work for. For usernames, passwords, permissions, and questions about customer or stock data, contact your own company first.",
    supportConnect: "Firm Connection",
    supportConnectHeading: "Firm code and connection key",
    supportConnectText: `The mobile and desktop apps resolve your firm code to <firmcode>.${gumrahSahaLinks.kurulumAlanAdi}; if your installation lives at a different address, you enter the server address by hand. The web version opens at the same address under ${gumrahSahaLinks.webYolu} and asks for no firm code. The firm code, server address, and connection key come from your company’s system administrator — they do not ship with the app. The same person provides the Windows installation package.`,
    supportTechnical: "Technical Developer",
    supportTechnicalName: "Mehmet Gümrah",
    supportTechnicalText:
      "App publishing and technical pages are maintained by Mehmet Gümrah. You can send bug reports and suggestions by email.",
    supportResponse: "Response Time",
    supportResponseHeading: "Response time",
    supportResponseText: "Support requests are reviewed during business days, usually within the same day.",
    supportPrivacyText: "See the privacy page for data collection, storage, and usage policy."
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
  const tp = portalCopy[locale];
  const tg = gumrahSahaCopy[locale];
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
        aria-label={tp.appName}
        style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}
      >
        <article className="feat-card">
          <div className="app-tile">
            <img
              className="app-tile-icon lg"
              src="/images/teknoportal-icon.png"
              alt={`${tp.appName} app logo`}
              width={512}
              height={512}
            />
            <div className="app-meta">
              <span className="sub">{tp.cardEyebrow}</span>
              <span className="name">{tp.appName}</span>
            </div>
          </div>
          <p>{tp.cardBody}</p>
          <div className="platform-row" aria-label={tp.platformsLabel}>
            <span className="platform-chip live">{tp.platformIos}</span>
            <span className="platform-chip">{tp.platformAndroid}</span>
            <span className="platform-chip">{tp.platformWindows}</span>
          </div>
          <div className="actions-row">
            <Link className="btn primary" href={`/${locale}/apps/teknoportal/`}>
              {tp.detailCta} <ArrowIcon />
            </Link>
            <Link className="btn" href={`/${locale}/apps/teknoportal/privacy/`}>
              {tp.privacyCta}
            </Link>
            <Link className="btn" href={`/${locale}/apps/teknoportal/support/`}>
              {tp.supportCta}
            </Link>
          </div>
        </article>

        <aside className="preview-card" aria-hidden="true">
          <div className="grid-bg" />
          <div className="preview-card-inner">
            <img
              src="/images/teknoportal-icon.png"
              alt={tp.previewAlt}
              width={512}
              height={512}
              loading="lazy"
              decoding="async"
              style={{
                width: "clamp(120px, 45%, 176px)",
                height: "auto",
                filter: "drop-shadow(0 24px 48px rgba(4, 40, 20, 0.18))"
              }}
            />
            <div className="preview-meta">
              <span>{tp.previewLabel}</span>
              <span>{tp.previewMeta}</span>
            </div>
          </div>
        </aside>
      </section>

      <section
        className="feat-grid"
        aria-label={tg.appName}
        style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}
      >
        <article className="feat-card">
          <div className="app-tile">
            <img
              className="app-tile-icon lg"
              src="/images/gumrahsaha-icon.png"
              alt={`${tg.appName} app logo`}
              width={512}
              height={512}
            />
            <div className="app-meta">
              <span className="sub">{tg.cardEyebrow}</span>
              <span className="name">{tg.appName}</span>
            </div>
          </div>
          <p>{tg.cardBody}</p>
          {/* Only the web chip is `live`: it is the one version a visitor can
              open today, at their firm's own address. No store carries the
              others yet, and the Windows build is handed out by the firm. */}
          <div className="platform-row" aria-label={tg.platformsLabel}>
            <span className="platform-chip">{tg.platformAndroid}</span>
            <span className="platform-chip">{tg.platformIos}</span>
            <span className="platform-chip live">{tg.platformWeb}</span>
            <span className="platform-chip">{tg.platformWindows}</span>
          </div>
          <div className="actions-row">
            <Link className="btn primary" href={`/${locale}/apps/gumrahsaha/`}>
              {tg.detailCta} <ArrowIcon />
            </Link>
            <Link className="btn" href={`/${locale}/apps/gumrahsaha/privacy/`}>
              {tg.privacyCta}
            </Link>
            <Link className="btn" href={`/${locale}/apps/gumrahsaha/support/`}>
              {tg.supportCta}
            </Link>
          </div>
        </article>

        <aside className="preview-card" aria-hidden="true">
          <div className="grid-bg" />
          <div className="preview-card-inner">
            <img
              src="/images/gumrahsaha-icon.png"
              alt={tg.previewAlt}
              width={512}
              height={512}
              loading="lazy"
              decoding="async"
              style={{
                width: "clamp(120px, 45%, 176px)",
                height: "auto",
                filter: "drop-shadow(0 24px 48px rgba(0, 0, 0, 0.2))"
              }}
            />
            <div className="preview-meta">
              <span>{tg.previewLabel}</span>
              <span>{tg.previewMeta}</span>
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

export function TeknoPortalDetail({ locale }: { locale: Locale }) {
  const t = portalCopy[locale];

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
            src="/images/teknoportal-icon.png"
            alt={`${t.appName} app logo`}
            width={512}
            height={512}
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
          <span className="platform-chip live">{t.platformIos}</span>
          <span className="platform-chip">{t.platformAndroid}</span>
          <span className="platform-chip">{t.platformWindows}</span>
        </div>

        {/* Only the App Store badge, unlike TeknoSales: iOS is the one store
            actually carrying Portal today. Play is not public yet and Microsoft
            still resolves to the staff app, so those two stay on the download
            page, next to the status note that says what they open. */}
        <div className="install-row">
          <a className="install-cta is-badge" href={portalLinks.appStore}>
            <StoreBadge platform="ios" locale={locale} />
          </a>
          <p className="install-hint">{t.installIosHint}</p>
        </div>

        <div className="actions-row">
          <Link className="btn primary" href={`/${locale}/apps/teknoportal/download/`}>
            {t.downloadCta} <ArrowIcon />
          </Link>
          <Link className="btn" href={`/${locale}/apps/teknoportal/privacy/`}>
            {t.privacyCta}
          </Link>
          <Link className="btn" href={`/${locale}/apps/teknoportal/support/`}>
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
            <div className="label">{t.usage}</div>
            <div className="value">{t.usageValue}</div>
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
          <Link className="btn" href={`/${locale}/apps/teknoportal/privacy/`}>
            {t.privacyLink} <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * Download page — the address handed to customers, shortened to mgumrah.com/portal
 * in public/_redirects. Every link comes from `portalLinks` and every one of them
 * is now Portal's own.
 *
 * Two platforms do not lead with their store, and for different reasons. Android
 * leads with the tester sign-up because Play's listing is closed. Windows leads
 * with the direct installer because the Microsoft Store build is the lesser one:
 * an individual publisher account cannot ship card payment or IBAN, so those
 * screens are absent there. The Store badge stays anyway — it is the only route
 * left for a machine that refuses unsigned installers — with its meta line
 * naming what it gives up. The status note below says all of this out loud.
 */
export function TeknoPortalDownload({ locale }: { locale: Locale }) {
  const t = portalCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/teknoportal/`}>{t.appName}</Link>
          <span>/</span>
          <span>{t.crumbDownload}</span>
        </div>
        <h1>
          {t.downloadTitle} <span className="it">{t.downloadTitleIt}</span>
        </h1>
        <p className="meta">{t.downloadIntro}</p>

        <div className="install-row">
          {/* Falls back to the store list below when the platform is unknown. */}
          <InstallButton
            locale={locale}
            neutralLabel={t.installNeutral}
            fallbackHref="#stores"
            storeUrls={{
              ios: portalLinks.appStore,
              // The sign-up section, not Play: the listing is in closed testing,
              // so the store only opens for accounts already on the tester list.
              android: "#android-test",
              // The install section, not the Store: the Store build is missing
              // card payment and IBAN, and the full one warns on first run.
              windows: "#windows"
            }}
            badgeless={portalBadgeless}
          />
          <p className="install-hint">{t.installHint}</p>
        </div>
      </header>

      <section className="doc-section" id="stores" aria-label={t.storesSection}>
        <h2>{t.storesSection}</h2>
        <div className="store-grid">
          <div className="store-card">
            <a className="store-badge-link" href={portalLinks.appStore}>
              <StoreBadge platform="ios" locale={locale} />
            </a>
            <span className="store-meta">{t.storeIosMeta}</span>
          </div>

          <div className="store-card">
            {/* Same reason as the install button above: this badge opens the
                closed-test section on this page, and that section carries the
                direct Play link for whoever is already a tester. */}
            <a className="store-badge-link" href="#android-test">
              <StoreBadge platform="android" locale={locale} />
            </a>
            <span className="store-meta">
              {portalAndroidTest.mode === "grup" ? t.storeAndroidMetaGrup : t.storeAndroidMeta}
            </span>
          </div>

          {/* Not a store: a plain file download, so no badge and no borrowed
              mark. It leads to the section below rather than straight to the
              127 MB file, because the SmartScreen warning has to be read
              before it appears, not after. */}
          <div className="store-card">
            <a className="btn primary store-direct" href="#windows">
              {t.storeDirectCta} <ArrowIcon />
            </a>
            <span className="store-meta">{t.storeDirectMeta}</span>
          </div>

          {/* The lesser Windows build, kept for whoever cannot run an unsigned
              installer. Its meta line names what it gives up. */}
          <div className="store-card">
            <a className="store-badge-link" href={portalLinks.microsoftStore}>
              <StoreBadge platform="windows" locale={locale} />
            </a>
            <span className="store-meta">{t.storeWindowsMeta}</span>
          </div>
        </div>
        <p className="legal-note">{t.trademarks}</p>
      </section>

      {/* Android's install route in full: Play cannot be the first tap while
          the track is closed, so what stands in front of it lives here. Which
          of the two routes is shown mirrors Play Console's own tester setting
          — see portalAndroidTest in site-config. */}
      <section className="doc-section">
        {portalAndroidTest.mode === "grup" ? (
          <AndroidTesterJoin locale={locale} playStoreUrl={portalLinks.playStore} />
        ) : (
          <AndroidTesterForm
            locale={locale}
            playStoreUrl={portalLinks.playStore}
            source={`${locale}/download`}
          />
        )}
      </section>

      {/* Windows's install route in full. The recommended build is unsigned, so
          the download button sits next to what Windows will say about it —
          putting the file first and the explanation lower would hand the
          visitor a warning they have no answer for. */}
      <section className="winstall" id="windows" aria-labelledby="windows-title">
        <span className="kicker">
          <span className="dot" />
          {t.windowsEyebrow}
        </span>
        <h2 id="windows-title">{t.windowsTitle}</h2>
        <p className="winstall-intro">{t.windowsIntro}</p>

        <div className="winstall-get">
          <a className="btn primary" href={portalLinks.windowsDownload} download>
            {t.windowsDownloadCta} <ArrowIcon />
          </a>
          <span className="winstall-file">{t.windowsDownloadMeta}</span>
        </div>

        <div className="winstall-warn" role="note">
          <p className="winstall-warn-head">{t.windowsWarnTitle}</p>
          <p>{t.windowsWarnBody}</p>
        </div>

        <h3 className="winstall-steps-title">{t.windowsStepsTitle}</h3>
        <ol className="winstall-steps">
          {t.windowsSteps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <span>{step.body}</span>
            </li>
          ))}
        </ol>

        <div className="feature-grid">
          <div className="feature-cell">
            <div className="label">{t.windowsUpdatesTitle}</div>
            <div className="value">{t.windowsUpdatesBody}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.windowsStoreAltTitle}</div>
            <div className="value">
              {t.windowsStoreAltBody}{" "}
              <a href={portalLinks.microsoftStore}>{t.windowsStoreAltCta}</a>
              {" · "}
              <Link href={`/${locale}/apps/teknoportal/privacy-microsoft-store/`}>
                {t.windowsStoreAltPrivacy}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="doc-section" aria-label={t.storeStatusTitle}>
        <h2>{t.storeStatusTitle}</h2>
        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          <div className="feature-cell">
            <div className="label">{t.storeStatusTitle}</div>
            <div className="value">{t.storeStatusBody}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.accountTitle}</div>
            <div className="value">{t.accountBody}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.platforms}</div>
            <div className="value">{t.platformValue}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.supportTitle}</div>
            <div className="value">{t.supportIntro}</div>
          </div>
        </div>
        <div className="actions-row" style={{ marginTop: "1rem" }}>
          <Link className="btn" href={`/${locale}/apps/teknoportal/`}>
            {t.detailCta} <ArrowIcon />
          </Link>
          <Link className="btn" href={`/${locale}/apps/teknoportal/support/`}>
            {t.supportCta}
          </Link>
          <Link className="btn" href={`/${locale}/apps/teknoportal/privacy/`}>
            {t.privacyCta}
          </Link>
        </div>
      </section>
    </main>
  );
}

export function TeknoPortalSupport({ locale }: { locale: Locale }) {
  const t = portalCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/teknoportal/`}>{t.appName}</Link>
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
          <span className="label">{t.supportAccount}</span>
          <h3>{t.supportAccountHeading}</h3>
          <p>{t.supportAccountText}</p>
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
          <Link className="link" href={`/${locale}/apps/teknoportal/privacy/`}>
            {t.privacyCta} →
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * Gümrah Saha detail page. Unlike the Tekno pages it carries no store badge and no
 * download route: no store lists any of the four versions yet, and a badge that opened
 * nothing would be worse than no badge. The web version is live but has no single
 * address — every firm serves it from its own installation — so the platforms section
 * shows the address pattern instead of a link. When a store listing goes live, its
 * badge and a download page slot in here the way Tekno Portal's do.
 */
export function GumrahSahaDetail({ locale }: { locale: Locale }) {
  const t = gumrahSahaCopy[locale];

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
            src="/images/gumrahsaha-icon.png"
            alt={`${t.appName} app logo`}
            width={512}
            height={512}
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
          <span className="platform-chip">{t.platformAndroid}</span>
          <span className="platform-chip">{t.platformIos}</span>
          <span className="platform-chip live">{t.platformWeb}</span>
          <span className="platform-chip">{t.platformWindows}</span>
        </div>

        <div className="actions-row">
          <Link className="btn primary" href={`/${locale}/apps/gumrahsaha/privacy/`}>
            {t.privacyCta} <ArrowIcon />
          </Link>
          <Link className="btn" href={`/${locale}/apps/gumrahsaha/support/`}>
            {t.supportCta}
          </Link>
        </div>
      </header>

      {/* Where each version comes from, straight under the chips that name
          them: requirements, stack, and the honest state of each route. */}
      <section className="doc-section" id="platforms" aria-label={t.platformsSection}>
        <h2>{t.platformsSection}</h2>
        <p>{t.platformsIntro}</p>

        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          {t.platformDetails.map((p) => (
            <div className={p.live ? "feature-cell live" : "feature-cell"} key={p.label}>
              <div className="label">{p.label}</div>
              <div className="value">{p.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="doc-section" aria-label={t.detailSection}>
        <h2>{t.detailSection}</h2>
        <p>{t.detailBody}</p>

        <div className="feature-grid" style={{ marginTop: "1rem" }}>
          <div className="feature-cell">
            <div className="label">{t.usage}</div>
            <div className="value">{t.usageValue}</div>
          </div>
          <div className="feature-cell">
            <div className="label">{t.controller}</div>
            <div className="value">{t.controllerValue}</div>
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
          <Link className="btn" href={`/${locale}/apps/gumrahsaha/privacy/`}>
            {t.privacyLink} <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * Support page — the URL handed to App Review. It names no company email on purpose:
 * the app is multi-tenant, so the first line of support is whichever business the user
 * works for. Only the developer channel can be spelled out here.
 */
export function GumrahSahaSupport({ locale }: { locale: Locale }) {
  const t = gumrahSahaCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/gumrahsaha/`}>{t.appName}</Link>
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
          <h3>{t.supportCompanyHeading}</h3>
          <p>{t.supportCompanyText}</p>
        </div>

        <div className="channel-card">
          <span className="label">{t.supportConnect}</span>
          <h3>{t.supportConnectHeading}</h3>
          <p>{t.supportConnectText}</p>
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
          <Link className="link" href={`/${locale}/apps/gumrahsaha/privacy/`}>
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
