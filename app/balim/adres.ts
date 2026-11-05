/**
 * Balım panelinin yol adresleri — tek yer.
 *
 * Hepsi ALAN ADINDAN BAĞIMSIZ, kaynağa göre (origin-relative) yollar: panel hangi alan adından sunulursa
 * (mgumrah.com, ileride balim.cafe altında bir alt alan adı…) aynı kodla çalışır. Çerez alan adına bağlı
 * (host-only) kalır, API'nin Origin denetimi isteğin geldiği alan adına bakar, bildirim tıklaması ve PWA
 * manifest'i de görece yoldur. Panelin ayrıca sunulacağı alan adı (PANEL_ALAN_ADLARI) bu dosyadaki TEK alan adı
 * listesidir; Worker'ın "host kapısı" (worker/panel-host.ts) o alan adlarında yalnızca paneli açar.
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

/**
 * Panelin mgumrah.com/balim dışında, kendi alan adında da sunulduğu yerler (balim.cafe'nin alt alan adı).
 * Bu alan adlarından gelen isteğe host kapısı uygulanır: yalnızca panel, API'si ve `/_next/` varlıkları açılır,
 * gerisi (kişisel /borc, ilanlar, brief, ana site…) 404 döner.
 *
 * KURAL: bir alan adını Worker'a (Custom Domain / route) bağlamadan ÖNCE buraya yazın; yoksa o alan adında
 * sitenin tamamı açılır. `node scripts/balim-host-test.mjs` wrangler.jsonc'a bağlı her alan adının burada
 * olduğunu ve kapının çalışması için gereken `assets.run_worker_first` ayarının açık olduğunu denetler.
 * Küçük harf, yalnızca alan adı (şema, yol, port yok).
 */
export const PANEL_ALAN_ADLARI: readonly string[] = ["panel.balim.cafe"];

/** Balım › Borçlar'ın ucu (yetki gerektirir). Sonda eğik çizgi var. */
export const BORC_API_YOLU = `${API_YOLU}/borc/`;

export const SW_ADRESI = `${PANEL_YOLU}sw.js`;
export const MANIFEST_ADRESI = `${PANEL_YOLU}manifest.webmanifest`;

/** Panel içi adres: panelAdresi("ikon.svg") → "/balim/ikon.svg"; panelAdresi("#ozet") → "/balim/#ozet". */
export const panelAdresi = (parca = "") => `${PANEL_YOLU}${parca}`;
