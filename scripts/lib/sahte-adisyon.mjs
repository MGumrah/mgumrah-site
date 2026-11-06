/**
 * Balım paneli testleri için SAHTE adisyon (tek üyelik).
 *
 * Panel şifreyi kendi tutmaz; giriş ve şifre değişikliğini https://balim.cafe/api/adisyon/uye/* uçlarına sorar
 * (worker/balim.ts → uyelikSor). Testler gerçek siteye gitmesin diye `fetch` bu adrese gelen istekleri burada
 * karşılar, gerisini gerçek fetch'e bırakır. Davranış `adisyon.mod` ile değişir:
 *
 *   "normal"       doğru şifre = `adisyon.sifre` ("deneme-sifre"); öteki her şey 401
 *   "etkinlestir"  hesap adisyonda henüz etkinleştirilmemiş (409)
 *   "kota"         adisyon "çok fazla deneme" der (429)
 *   "kapali"       adisyon sistemi kapalı (503)
 *   "ulasilamaz"   ağ hatası (fetch fırlatır)
 */

export const ANAHTAR = "test-ortak-sir-".padEnd(40, "x");

export function sahteAdisyonuKur() {
  const gercek = globalThis.fetch;
  const adisyon = { mod: "normal", sifre: "deneme-sifre", cagrilar: [], anahtar: ANAHTAR };

  const yanit = (govde, durum) => new Response(JSON.stringify(govde), { status: durum, headers: { "content-type": "application/json" } });

  globalThis.fetch = async (girdi, secenek = {}) => {
    const url = String(typeof girdi === "string" || girdi instanceof URL ? girdi : girdi.url);
    if (!url.startsWith("https://balim.cafe/api/adisyon/uye/")) return gercek(girdi, secenek);
    const yol = url.slice("https://balim.cafe/api/adisyon/uye/".length);
    const basliklar = new Headers(secenek.headers ?? {});
    const govde = JSON.parse(String(secenek.body ?? "{}"));
    adisyon.cagrilar.push({ yol, anahtar: basliklar.get("x-uye-anahtari"), govde });

    if (adisyon.mod === "ulasilamaz") throw new TypeError("fetch failed");
    if (basliklar.get("x-uye-anahtari") !== adisyon.anahtar) return yanit({ ok: false, hata: "İzin verilmedi." }, 403);
    if (adisyon.mod === "kapali") return yanit({ ok: false, hata: "Adisyon sistemi kapalı." }, 503);
    if (yol === "dogrula") {
      if (adisyon.mod === "etkinlestir") return yanit({ ok: false, etkinlestir: true, hata: "Bu hesap henüz etkinleştirilmedi." }, 409);
      if (adisyon.mod === "kota") return yanit({ ok: false, hata: "Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin." }, 429);
      return govde.sifre === adisyon.sifre ? yanit({ ok: true, kullanici: govde.kullanici, ad: govde.kullanici }, 200) : yanit({ ok: false, hata: "Kullanıcı adı veya şifre yanlış." }, 401);
    }
    if (yol === "sifre") {
      if (govde.mevcut !== adisyon.sifre) return yanit({ ok: false, hata: "Mevcut şifre yanlış." }, 400);
      if (String(govde.yeni ?? "").length < 8) return yanit({ ok: false, hata: "Şifre en az 8 karakter olmalı." }, 400);
      adisyon.sifre = govde.yeni;
      return yanit({ ok: true }, 200);
    }
    return yanit({ ok: false, hata: "Bulunamadı." }, 404);
  };

  return { adisyon, kapat: () => void (globalThis.fetch = gercek) };
}
