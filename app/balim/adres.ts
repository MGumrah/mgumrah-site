/**
 * Balım panelinin yol adresleri — tek yer.
 *
 * Hepsi ALAN ADINDAN BAĞIMSIZ, kaynağa göre (origin-relative) yollar: panel hangi alan adından sunulursa
 * (mgumrah.com, ileride balim.cafe altında bir alt alan adı…) aynı kodla çalışır. Çerez alan adına bağlı
 * (host-only) kalır, API'nin Origin denetimi isteğin geldiği alan adına bakar, bildirim tıklaması ve PWA
 * manifest'i de görece yoldur. Alan adını değiştirmek bu dosyaya değil Worker'ın yönlendirmesine dokunur.
 *
 * Bu dosya hem tarayıcı kodu (app/balim) hem Worker (worker/balim.ts) tarafından içe aktarılır; bu yüzden
 * "use client" yok ve hiçbir şeye bağımlı değil.
 *
 * İÇE AKTARILAMAYAN iki statik dosya aynı değerleri elle taşır ve `node scripts/balim-adres-test.mjs`
 * bunların bu dosyayla aynı kaldığını denetler — yolu değiştirirken üçü birlikte değişir:
 *   - public/balim/manifest.webmanifest  (id, start_url, scope, ikonlar)
 *   - public/balim/sw.js                 (bildirim adresi öneki, ikonlar, /api/balim/bildirim)
 */

/** Panelin sayfası ve altındaki her şey (ikonlar, manifest, service worker). Sonda eğik çizgi var. */
export const PANEL_YOLU = "/balim/";

/** API ve oturum çerezinin yolu. Sonda eğik çizgi yok. */
export const API_YOLU = "/api/balim";

/** Balım › Borçlar'ın ucu (yetki gerektirir). Sonda eğik çizgi var. */
export const BORC_API_YOLU = `${API_YOLU}/borc/`;

export const SW_ADRESI = `${PANEL_YOLU}sw.js`;
export const MANIFEST_ADRESI = `${PANEL_YOLU}manifest.webmanifest`;

/** Panel içi adres: panelAdresi("ikon.svg") → "/balim/ikon.svg"; panelAdresi("#ozet") → "/balim/#ozet". */
export const panelAdresi = (parca = "") => `${PANEL_YOLU}${parca}`;
