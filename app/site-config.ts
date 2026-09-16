/**
 * Single source of truth for external links and contact identity.
 * Imported by content components, the header nav, and the footer so a URL
 * only ever needs to change in one place.
 */
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
   * Portal'ın kendi paketi. Android artık iOS gibi doğrudan buraya atlıyor.
   * Listeleme kapalı testte olduğu sürece tester listesinde olmayan ziyaretçi
   * Play'de "bulunamadı" görür; bu bilinerek kabul edildi — track herkese
   * açıldığı gün site tarafında değişecek bir şey kalmıyor.
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
