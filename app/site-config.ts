/**
 * Single source of truth for external links and contact identity.
 * Imported by content components, the header nav, and the footer so a URL
 * only ever needs to change in one place.
 */
/**
 * Routes that are apps with their own header and navigation rather than pages
 * of the personal site. The site header and footer step aside on these —
 * /balim is a family planning tool, and the "Apps / Websites / GitHub" bar
 * above it would only be something to mis-tap.
 */
const OWN_SHELL_ROUTES = ["/balim"];

export function hasOwnShell(pathname: string | null) {
  return OWN_SHELL_ROUTES.some((route) => pathname === route || pathname?.startsWith(`${route}/`));
}

export const links = {
  github: "https://github.com/MGumrah",
  youtube: "https://www.youtube.com/@MGumrah",
  playStore: "https://play.google.com/store/apps/details?id=com.tekno.satis",
  appStore: "https://apps.apple.com/tr/app/tekno-sat%C4%B1%C5%9F/id6766247299?l=tr",
  /** Windows has two install routes: the Microsoft Store listing and the direct installer. */
  microsoftStore: "https://apps.microsoft.com/detail/9NFF9J8PLXWT",
  windowsDownload: "https://mgumrah.com/teknosales/releases/TeknoSales-win-Setup.exe",
  email: "support@mgumrah.com",
  domain: "mgumrah.com",
  sevcanhomeLive: "https://sevcanhome.com",
  sevcanhomeRepo: "https://github.com/MGumrah/sevcanhome-site",
  mgumrahLive: "https://mgumrah.com",
  mgumrahRepo: "https://github.com/MGumrah/mgumrah-site"
} as const;

/**
 * Tekno Portal mağaza bağlantıları — kısa link: mgumrah.com/portal
 *
 * Dördü de artık Portal'ın kendi adresleri; ödünç alınmış Tekno Satış
 * bağlantısı kalmadı. Hangi adresin ziyaretçiye ilk gösterildiği ayrı bir
 * konu — atlamaya kimin dahil olduğunu app/portal-redirect.tsx içindeki liste,
 * Windows'ta hangi yolun önerildiğini ise indirme sayfası belirler.
 */
export const portalLinks = {
  /**
   * Portal'ın kendi Play listelemesi. /portal kısa linki Android'i buraya DEĞİL,
   * kapalı testin opt-in sayfasına atlatır (`portalAndroidTest.optInUrl`):
   * kapalı testte bu listeleme yalnız opt-in etmiş hesaba açılır, opt-in sayfası
   * ise listedeki her hesaba çalışır. Track herkese açıldığı gün atlama hedefi
   * (app/portal-redirect.tsx → PORTAL_STORE_URLS.android) buraya çevrilir.
   */
  playStore: "https://play.google.com/store/apps/details?id=com.tekno.portal",
  /** Portal'ın kendi listelemesi — yayında. Uygulama yalnızca TR vitrininde. */
  appStore: "https://apps.apple.com/tr/app/tekno-portal/id6797911628",
  /**
   * Portal'ın kendi Microsoft Store listelemesi — yayında, ama Windows'ta
   * önerilen yol bu değil. Geliştirici hesabı bireysel olduğu için Store
   * sürümünde kart ile ödeme ve IBAN alanları kapalı; Store'un ticari işlem
   * kuralları bunları bireysel yayıncıya açmıyor. Aynı sürümün eksiksiz hâli
   * aşağıdaki `windowsDownload` paketidir, o yüzden indirme sayfası önce onu
   * gösterir. Store satırı yine de duruyor: güncellemeyi Store'un yönetmesini
   * isteyen ya da imzasız kuruluma izni olmayan kullanıcı için tek yol o.
   * Bu sürümün ayrı gizlilik metni: /apps/teknoportal/privacy-microsoft-store/
   */
  microsoftStore: "https://apps.microsoft.com/detail/9NJZZJNFFQMS",
  /**
   * Windows'un asıl kanalı: R2'de duran, şirketin doğrudan dağıttığı Setup.exe.
   * Kart ile ödeme ve IBAN yalnızca burada var.
   *
   * Paket kod imzalama sertifikası taşımıyor, yani ilk çalıştırmada Windows
   * SmartScreen "Bilinmeyen yayıncı" ekranını gösterir. Bu bir hata değil,
   * beklenen davranış — indirme sayfasındaki #windows bölümü ziyaretçiye
   * hangi düğmeye basacağını adım adım anlatır.
   */
  windowsDownload: "https://mgumrah.com/teknoportal/releases/TeknoPortal-win-Setup.exe"
} as const;

/**
 * Android kapalı testine giriş yolu — indirme sayfasının hangi ekranı
 * göstereceği.
 *
 * "form": ziyaretçi adresini bırakır, biri Play Console'daki E-POSTA LİSTESİNE
 *   ekler, ziyaretçi o ana kadar bekler. Bu adım otomatikleşmez: Play
 *   Developer API e-posta listelerini yönetmez, `edits.testers` yalnızca
 *   `googleGroups[]` alanını alır.
 * "grup": ziyaretçi GRUBA kendisi katılır ve o anda tester listesine girer.
 *   Hem bekleme hem elle ekleme adımı ortadan kalkar.
 *
 * ⚠ Bu değer bir tercih değil, Play Console → Test → Kapalı test → Test
 * kullanıcıları ekranındaki seçimin AYNASI. Play "E-posta listeleri"ndeyken
 * burayı "grup" yapmak, gruba katılan ziyaretçiyi tester OLMADAN Play'e yollar
 * ve tam da kaçınmak için var olduğu "bulunamadı" ekranına düşürür. Play
 * tarafı gruba geçirildiği gün burası "grup" olur — değişecek tek satır bu.
 *
 * Bugün "form" olmasının sebebi: kanalda hâlâ e-posta listeleri işaretli.
 * Liste tipini üretim başvurusunun 14 günlük penceresi işlerken değiştirmek
 * opt-in'leri düşürme riski taşıdığı için geçiş başvuru sonrasına bırakıldı.
 */
export const portalAndroidTest: {
  mode: "form" | "grup";
  /** Grubun kendi sayfası — üye olmayan ziyaretçi burada "Gruba katıl" görür. */
  groupUrl: string;
  /** Sayfadaki "gruba katıl" butonunun gerçekte gittiği yer — bkz. aşağısı. */
  joinUrl: string;
  /** Play Console'a yazılan adres: tester listesinin grup yolundaki kimliği. */
  groupEmail: string;
  /** Teste opt-in sayfası. Grup üyeliği tek başına yetmez; 12/14 sayacı burayı sayar. */
  optInUrl: string;
} = {
  mode: "grup",
  // ?hl=tr: Google bu sayfanın dilini hesaba göre seçer, oturum açılmamış
  // tarayıcıya ise İngilizce verir — bağlantı WhatsApp'tan gelen bir telefonda
  // açıldığında normal durum bu.
  groupUrl: "https://groups.google.com/g/teknoportal-test?hl=tr",
  /**
   * Grup sayfasına, Google'ın giriş akışının içinden.
   *
   * Doğrudan grup adresi oturum açmamış tarayıcıda çalışmıyor: Google Groups
   * böyle bir ziyaretçiye "Gruba katıl" butonunu göstermiyor, yalnız "Oturum
   * aç" koyuyor — yani sayfa açılıyor ama katılmanın yolu yok. Telefonda Play
   * Store'un hesabı açık olsa bile bu değişmiyor; cihaz hesabı ile tarayıcının
   * web oturumu ayrı şeyler, ve bağlantı WhatsApp gibi bir uygulamanın kendi
   * tarayıcısında açıldığında web oturumu çoğu kez hiç yok.
   *
   * ServiceLogin bunu ziyaretçiye bırakmadan çözüyor: oturum açıksa ara ekran
   * göstermeden `continue` adresine geçiyor, açık değilse Google'ın kendi giriş
   * ekranını gösterip girişten SONRA gruba bırakıyor — butonun bulunduğu hâle.
   * AccountChooser da aynı işi görüyor ama oturum açık olsa bile hesap seçtiriyor.
   *
   * Kurulumu açan hesabın Play Store'daki hesapla aynı olması şartı burada da
   * geçerli; sayfadaki adım metni bunu söylüyor.
   */
  joinUrl:
    "https://accounts.google.com/ServiceLogin?continue=" +
    encodeURIComponent("https://groups.google.com/g/teknoportal-test?hl=tr") +
    "&hl=tr",
  groupEmail: "teknoportal-test@googlegroups.com",
  // ?hl=tr yalnız bu sayfanın değil, ondan önce gelebilecek giriş ekranının da
  // dilini belirliyor: Play oturum açmamış ziyaretçiyi kendiliğinden Google'ın
  // giriş akışına yollayıp buraya geri getiriyor (Groups'un yapmadığı şey), ve
  // hl'yi o adrese taşıyor.
  optInUrl: "https://play.google.com/apps/testing/com.tekno.portal?hl=tr"
};

/**
 * Platforms where Portal's install button keeps its neutral label instead of
 * wearing a store badge, because the route does not end at that store.
 *
 * Windows is here: its button opens the Setup.exe section, and a Microsoft
 * Store badge over that is both a broken promise and a mark used for something
 * it does not name. Android is deliberately absent — its button opens the
 * tester sign-up, but what that sign-up unlocks *is* Google Play, so the badge
 * still names where the route ends, only later than usual.
 *
 * Lives here rather than next to the button so a server component can read it
 * without importing across the "use client" boundary.
 */
export const portalBadgeless = ["windows"] as const;

/**
 * Gümrah Saha — çok firmalı saha satış uygulaması, Tekno ürünlerinden AYRI bir aile.
 *
 * Burada mağaza bağlantısı yok, çünkü uygulama henüz yayında değil (App Store Connect
 * kaydı açıldı, inceleme bekliyor). Yayına girince `appStore` buraya eklenir ve detay
 * sayfasına Tekno Portal'daki gibi bir rozet konur; sayfa adresleri değişmez.
 *
 * Tekno ürünlerinden yapısal farkı: tek bir merkezi sunucu YOK. Her müşteri kendi
 * kurulumunu çalıştırır ve uygulama firma kodunu bu alan adının altında çözer — gizlilik
 * metni de veri sorumlusunu bu yüzden geliştirici değil, işletme olarak gösterir.
 */
export const gumrahSahaLinks = {
  /** Firma kodu → `https://<kod>.gumrah.app/` (uygulamadaki `Uygulama.firmaAlanAdi`). */
  kurulumAlanAdi: "gumrah.app"
} as const;
