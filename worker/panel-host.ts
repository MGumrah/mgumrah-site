/**
 * Host kapısı: Balım paneli kendi alan adında (örn. panel.balim.cafe) sunulurken o alan adından yalnızca PANELİ
 * açar. Aynı Worker mgumrah.com'un tamamını da sunduğu için kapı olmasa panel.balim.cafe/borc, /ilan/…, /brief/inbox
 * gibi her şey o alan adında da açılırdı.
 *
 * Bu alan adlarında açık olanlar:
 *   /balim/…        panelin sayfası, manifest, service worker, ikonlar
 *   /api/balim/…    panelin API'si (Borçlar dahil; yetki yine sunucuda denetlenir)
 *   /_next/…        sayfanın JS/CSS/font dosyaları
 *   /robots.txt     "hepsini yasakla" (panel dizine girmesin)
 *   /               panele yönlendirir
 * Geri kalan her şey 404'tür; özellikle /api/borc (kişisel borç paneli) bu alan adlarında hiç yoktur.
 *
 * Diğer alan adları (mgumrah.com, workers.dev, yerel geliştirme…) için bu dosya hiçbir şey yapmaz: panelKapisi
 * null döner ve istek eskisi gibi yürür. Hangi alan adlarının panel alan adı olduğu tek yerde: app/balim/adres.ts.
 *
 * ÖNEMLİ — kapı yalnızca Worker çalışırsa işler. wrangler.jsonc'ta `assets.run_worker_first` kapalıyken Cloudflare
 * statik dosyaları (/, /tr/, /borc/, robots.txt…) Worker'a hiç uğramadan sunar; o durumda kapı yalnızca Worker'ın
 * cevapladığı yolları (API, brief…) kapatabilir. Bir panel alan adı bağlanırken `run_worker_first` açılmalıdır
 * (README → "panel.balim.cafe canlıya alma"; scripts/balim-host-test.mjs bunu denetler).
 */

import { API_YOLU, PANEL_ALAN_ADLARI, PANEL_YOLU } from "../app/balim/adres";

const PANEL_DIZINI = PANEL_YOLU.slice(0, -1); // "/balim"

/** İsteğin alan adı: küçük harf, sondaki nokta (FQDN yazımı) atılmış. */
export function alanAdi(url: URL): string {
  return url.hostname.toLowerCase().replace(/\.$/, "");
}

export function panelAlanAdiMi(url: URL): boolean {
  return PANEL_ALAN_ADLARI.includes(alanAdi(url));
}

/** Panel alan adlarında sunulabilen yollar. `url.pathname` normalleştirilmiş gelir (../ ve %2e%2e önceden çözülür). */
export function panelYoluMu(yol: string): boolean {
  return (
    yol === PANEL_DIZINI ||
    yol.startsWith(PANEL_YOLU) ||
    yol === API_YOLU ||
    yol.startsWith(`${API_YOLU}/`) ||
    yol.startsWith("/_next/")
  );
}

/**
 * Panel alan adından gelen istek için kapının kendi cevabı (yönlendirme, robots.txt, 404); isteğin normal akışta
 * devam etmesi gerekiyorsa (ya da alan adı panel alan adı değilse) null.
 */
export function panelKapisi(url: URL): Response | null {
  if (!panelAlanAdiMi(url)) return null;
  const yol = url.pathname;
  if (yol === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }
  if (yol === "/") return Response.redirect(new URL(PANEL_YOLU, url).toString(), 302);
  if (panelYoluMu(yol)) return null;
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
