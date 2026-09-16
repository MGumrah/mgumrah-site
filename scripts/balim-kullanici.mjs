#!/usr/bin/env node
/**
 * Balım paneline kişi ekler ya da bir kişinin şifresini yeniler.
 *
 *   node scripts/balim-kullanici.mjs <kullanici_adi> [--ad "Görünen ad"] [--sifre "..."] [--local]
 *
 *   node scripts/balim-kullanici.mjs anne --ad Anne     → kişiyi ekler, şifre üretip yazdırır
 *   node scripts/balim-kullanici.mjs anne               → unutulan şifre: yenisini üretip yazdırır
 *   node scripts/balim-kullanici.mjs anne --sifre kahve2026
 *   ... --local                                         → canlı değil, `wrangler dev`in yerel D1'i
 *
 * Kişiler migration'a yazılmıyor: depo herkese açık ve kısa bir şifrenin hash'i
 * orada herkesin önünde dururdu. Hash bu makinede hesaplanır; D1'e yalnızca
 * hash gider, şifrenin kendisi hiçbir yere kaydedilmez.
 *
 * Şifre değişince kişinin açık oturumları kapanmaz — amaç unutulan şifreyi
 * yenilemek, telefondaki girişi düşürmek değil. Kayıp bir telefon için
 * --oturumlari-kapat eklenir.
 */

import { spawnSync } from "node:child_process";
import { pbkdf2Sync, randomBytes, randomInt } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** worker/balim.ts'teki PBKDF2_TUR ile aynı olmak zorunda. */
const TUR = 100_000;
const KELIMELER = ["kahve", "lokum", "simit", "pogaca", "kurabiye", "limonata", "salep", "sufle", "demlik", "fincan", "tepsi", "gevrek", "badem", "tarcin", "karamel", "vanilya"];

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const argumanlar = process.argv.slice(2);

function secenek(ad) {
  const i = argumanlar.indexOf(`--${ad}`);
  return i === -1 ? undefined : argumanlar[i + 1];
}

const kullaniciAdi = argumanlar[0];
if (!kullaniciAdi || kullaniciAdi.startsWith("--") || !/^[a-z0-9._-]+$/.test(kullaniciAdi)) {
  console.error("Kullanım: node scripts/balim-kullanici.mjs <kullanici_adi> [--ad \"Görünen ad\"] [--sifre \"...\"] [--local]");
  console.error("Kullanıcı adı küçük harf, rakam, nokta, tire: anne, baba, mehmet");
  process.exit(1);
}

const ad = secenek("ad");
const uretildi = secenek("sifre") === undefined;
const sifre = secenek("sifre") ?? `${KELIMELER[randomInt(KELIMELER.length)]}${randomInt(1000, 10000)}`;
const hedef = argumanlar.includes("--local") ? "--local" : "--remote";

if (sifre.length < 6) {
  console.error("Şifre en az 6 karakter olmalı.");
  process.exit(1);
}

const tuz = randomBytes(16);
const hash = pbkdf2Sync(sifre, tuz, TUR, 32, "sha256");
const kayit = `pbkdf2-sha256$${TUR}$${tuz.toString("base64")}$${hash.toString("base64")}`;

const metin = (deger) => `'${String(deger).replace(/'/g, "''")}'`;
const varsayilanAd = kullaniciAdi.charAt(0).toLocaleUpperCase("tr-TR") + kullaniciAdi.slice(1);

const sorgular = [
  `INSERT INTO kullanicilar (kullanici_adi, ad, sifre, olusturuldu)
   VALUES (${metin(kullaniciAdi)}, ${metin(ad ?? varsayilanAd)}, ${metin(kayit)}, ${metin(new Date().toISOString())})
   ON CONFLICT (kullanici_adi) DO UPDATE SET sifre = excluded.sifre${ad ? ", ad = excluded.ad" : ""}`
];
if (argumanlar.includes("--oturumlari-kapat")) {
  sorgular.push(
    `DELETE FROM oturumlar WHERE kullanici_id = (SELECT id FROM kullanicilar WHERE kullanici_adi = ${metin(kullaniciAdi)})`
  );
}

// wrangler'ın kendi giriş dosyası node ile çağrılıyor: Windows'ta npx.cmd için
// kabuk açmak gerekir, kabuk da SQL'in tırnaklarını bozar.
const sonuc = spawnSync(
  process.execPath,
  [join(kok, "node_modules", "wrangler", "bin", "wrangler.js"), "d1", "execute", "balim", hedef, "--command", sorgular.join(";\n")],
  { cwd: kok, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" }
);

if (sonuc.status !== 0) {
  console.error(sonuc.stdout);
  console.error("D1'e yazılamadı.");
  process.exit(sonuc.status ?? 1);
}

console.log(`\n${hedef === "--local" ? "Yerel" : "Canlı"} Balım · ${kullaniciAdi}${ad ? ` (${ad})` : ""}`);
console.log(uretildi ? `Şifre: ${sifre}` : "Şifre kaydedildi.");
