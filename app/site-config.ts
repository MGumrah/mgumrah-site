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
 * iOS ve Android artık Portal'ın kendi adreslerini gösteriyor; yalnızca
 * Microsoft Store satırı hâlâ geçici olarak Tekno Satış listelemesine gidiyor.
 * O satır da kendi kimliğini alınca burada değiştirilir; sayfa ve kısa link
 * aynı kalır. Hangi adresin gerçekten yayında olduğu ayrı bir konu — atlamaya
 * kimin dahil olduğunu app/portal-redirect.tsx içindeki liste belirler.
 */
export const portalLinks = {
  /**
   * Portal'ın kendi paketi. Adres doğru; listeleme herkese açılana kadar Play
   * bu adreste "bulunamadı" gösterir, bu yüzden Android henüz atlamaya dahil
   * değil — indirme sayfasındaki "Yakında" notuna düşer.
   */
  playStore: "https://play.google.com/store/apps/details?id=com.tekno.portal",
  /** Portal'ın kendi listelemesi — yayında. Uygulama yalnızca TR vitrininde. */
  appStore: "https://apps.apple.com/tr/app/tekno-portal/id6797911628",
  /** Yayına girdiğinde: Portal'ın kendi Microsoft Store kimliği. */
  microsoftStore: links.microsoftStore
} as const;
