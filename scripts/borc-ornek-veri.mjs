#!/usr/bin/env node
/**
 * /borc'u geliştirirken kullanılan UYDURMA veri — `node scripts/borc-ornek-veri.mjs`.
 *
 * Yalnızca YEREL veritabanına (wrangler dev'in D1'i) yazar; --remote seçeneği
 * yok ve eklenmemeli. Rakamlar, hesap adları ve tarihler tamamen uydurma
 * (bugüne göre kaydırılır, ekran hep canlı görünsün diye). Gerçek veri için
 * scripts/borc-ice-aktar.mjs var ve çıktısı depoya girmez.
 *
 *   npx wrangler d1 migrations apply borc --local     (bir kez)
 *   node scripts/borc-ornek-veri.mjs                  tabloları sıfırlayıp örnek veriyi yükler
 *   node scripts/borc-kullanici.mjs deneme --local --sifre deneme-sifresi-123
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ayEkle, ayinGunu, ayiAl, ekstreAyi, gunEkle, istanbulBugun } from "../app/borc/hesap.ts";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const bugun = istanbulBugun();
const buAy = ayiAl(bugun);
const TL = (n) => Math.round(n * 100);
const q = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const simdi = new Date().toISOString();

/* Uydurma hesaplar: gerçek banka adı ya da limit yok. */
const hesaplar = [
  { id: 1, ad: "Örnek Kart 1", tur: "kart", limit: TL(120_000), kesim: 9, odeme: 20, oran: 4000, borc: TL(64_250.4), ekstre: TL(41_300), asgari: TL(16_520) },
  { id: 2, ad: "Örnek Kart 2", tur: "kart", limit: TL(300_000), kesim: 8, odeme: 18, oran: 4000, borc: TL(138_900.75), ekstre: TL(88_400), asgari: TL(35_360) },
  { id: 3, ad: "Örnek Kart 3", tur: "kart", limit: TL(60_000), kesim: 6, odeme: 16, oran: 2000, borc: TL(21_480), ekstre: TL(9_750), asgari: null },
  { id: 4, ad: "Örnek KMH 1", tur: "kmh", limit: TL(80_000), kesim: null, odeme: null, oran: null, borc: TL(52_300), ekstre: null, asgari: null },
  { id: 5, ad: "Örnek KMH 2", tur: "kmh", limit: TL(40_000), kesim: null, odeme: null, oran: null, borc: 0, ekstre: null, asgari: null },
  { id: 6, ad: "Örnek işyeri borcu", tur: "diger", limit: 0, kesim: null, odeme: null, oran: null, borc: TL(35_000), ekstre: null, asgari: null }
];

const sql = [
  "DELETE FROM islemler", "DELETE FROM durum_kayitlari", "DELETE FROM gelirler", "DELETE FROM duzenli_gelirler", "DELETE FROM ayarlar", "DELETE FROM hesaplar"
];

hesaplar.forEach((h, i) => {
  sql.push(
    `INSERT INTO hesaplar (id, ad, tur, limit_kurus, kesim_gunu, son_odeme_gunu, asgari_orani_bp, sira, aktif) VALUES (${[h.id, h.ad, h.tur, h.limit, h.kesim, h.odeme, h.oran, i, 1].map(q).join(", ")})`
  );

  // Son 8 ayın geçmişi (ay başı ölçümleri) + bugünkü güncel ölçüm.
  for (let g = 8; g >= 1; g -= 1) {
    const ay = ayEkle(buAy, -g);
    const carpan = 0.55 + 0.45 * ((8 - g) / 8) + (((h.id * 7 + g * 3) % 9) - 4) / 100;
    sql.push(
      `INSERT INTO durum_kayitlari (hesap_id, tarih, ay, borc_kurus, limit_kurus, ekstre_kurus, asgari_kurus, son_odeme, aciklama, olusturuldu) VALUES (${[
        h.id, `${ay}-01`, ay, Math.round((h.borc * carpan) / 100) * 100, h.limit || null, null, null, null, "", simdi
      ].map(q).join(", ")})`
    );
  }
  const sonOdeme = h.odeme && ayinGunu(buAy, h.odeme) >= bugun ? ayinGunu(buAy, h.odeme) : h.odeme ? ayinGunu(ayEkle(buAy, 1), h.odeme) : null;
  sql.push(
    `INSERT INTO durum_kayitlari (hesap_id, tarih, ay, borc_kurus, limit_kurus, ekstre_kurus, asgari_kurus, son_odeme, aciklama, olusturuldu) VALUES (${[
      h.id, bugun, buAy, h.borc, h.limit || null, h.ekstre, h.asgari, h.tur === "kart" ? sonOdeme : null, "", simdi
    ].map(q).join(", ")})`
  );
});

/* Uydurma harcamalar: kartlara dağıtılmış, birkaçı taksitli. */
const kartlar = hesaplar.filter((h) => h.tur === "kart");
const kalemler = [
  ["Market", 1850.4, 1], ["Akaryakıt", 2400, 1], ["Restoran", 1275.5, 1], ["Elektronik mağaza", 24_999, 6], ["Mobilya", 36_000, 12],
  ["Online alışveriş", 3299.9, 3], ["Eczane", 640, 1], ["Telefon faturası", 899, 1], ["Kitapçı", 520, 1], ["Beyaz eşya", 41_999, 9],
  ["Giyim", 4850, 2], ["Streaming aboneliği", 229.99, 1], ["Market", 975.25, 1], ["Tatil", 18_400, 4], ["Akaryakıt", 2100, 1]
];
kalemler.forEach(([aciklama, tutar, taksit], i) => {
  const kart = kartlar[i % kartlar.length];
  const gun = gunEkle(bugun, -(i * 9 + 2));
  sql.push(
    `INSERT INTO islemler (tarih, hesap_id, aciklama, tutar_kurus, taksit, ekstre_ay, kategori, aciklama_not, olusturuldu) VALUES (${[
      gun, kart.id, aciklama, TL(tutar), taksit, ekstreAyi(gun, kart.kesim), "", "", simdi
    ].map(q).join(", ")})`
  );
});

/* Gelir: geciken maaş ve geciken dövizli kira (alacak), alınmış bir serbest iş; ayrıca düzenli maaş ve USD kira. */
const ilkAy = bugun.slice(8) > "15" ? ayEkle(buAy, 1) : buAy;
const gelirSatiri = (ad, tutarKurus, paraBirimi, tarih, kesin, alindi, duzenliId, aciklama) =>
  `INSERT INTO gelirler (ad, tutar_kurus, para_birimi, beklenen_tarih, kesin, alindi_tarihi, duzenli_id, aciklama_not, olusturuldu) VALUES (${[
    ad, tutarKurus, paraBirimi, tarih, kesin, alindi, duzenliId, aciklama, simdi
  ].map(q).join(", ")})`;
sql.push(
  `INSERT INTO duzenli_gelirler (ad, tutar_kurus, para_birimi, gun, kesin, baslangic_ay, aktif, aciklama_not, olusturuldu) VALUES (${["Örnek maaş", TL(65_000), "TRY", 15, 0, ilkAy, 1, "", simdi].map(q).join(", ")})`,
  `INSERT INTO duzenli_gelirler (ad, tutar_kurus, para_birimi, gun, kesin, baslangic_ay, aktif, aciklama_not, olusturuldu) VALUES (${["Örnek kira (USD)", 15_000, "USD", 15, 1, ilkAy, 1, "", simdi].map(q).join(", ")})`,
  gelirSatiri("Önceki ay maaşı", TL(65_000), "TRY", ayinGunu(ayEkle(buAy, -1), 15), 1, null, null, "İşyeri henüz ödemedi"),
  gelirSatiri("Önceki ay kirası", 15_000, "USD", ayinGunu(ayEkle(buAy, -1), 15), 1, null, null, "Dövizli geciken alacak örneği"),
  gelirSatiri("Serbest iş ödemesi", TL(12_500), "TRY", gunEkle(bugun, -20), 1, gunEkle(bugun, -19), null, "")
);

const sonuc = spawnSync(
  process.execPath,
  [join(kok, "node_modules", "wrangler", "bin", "wrangler.js"), "d1", "execute", "borc", "--local", "--command", sql.join(";\n")],
  { cwd: kok, stdio: ["ignore", "ignore", "inherit"], encoding: "utf8" }
);
if (sonuc.status !== 0) {
  console.error("Yerel D1'e yazılamadı. Önce: npx wrangler d1 migrations apply borc --local");
  process.exit(sonuc.status ?? 1);
}
console.log(`Uydurma veri yüklendi (yerel): ${hesaplar.length} hesap, ${kalemler.length} işlem, 3 gelir kaydı, 2 düzenli gelir.`);
