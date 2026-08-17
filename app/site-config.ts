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
 * Portal'ın kendi listelemeleri henüz yayında değil, bu yüzden üç satır da
 * geçici olarak Tekno Satış listelemesine gidiyor. Hangi mağaza yayına
 * girerse o satır kendi adresiyle değiştirilir; sayfa ve kısa link aynı kalır.
 */
export const portalLinks = {
  /** Yayına girdiğinde: https://play.google.com/store/apps/details?id=com.tekno.portal */
  playStore: links.playStore,
  /** Yayına girdiğinde: Portal'ın kendi App Store kimliği. */
  appStore: links.appStore,
  /** Yayına girdiğinde: Portal'ın kendi Microsoft Store kimliği. */
  microsoftStore: links.microsoftStore
} as const;
