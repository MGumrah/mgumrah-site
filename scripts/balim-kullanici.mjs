#!/usr/bin/env node
/**
 * Balım paneline kişi ekler ya da bir kişinin şifresini yeniler.
 *
 *   node scripts/balim-kullanici.mjs <kullanici_adi> [--ad "Görünen ad"] [--sifre "..."] [--local]
 *
 *   node scripts/balim-kullanici.mjs ayse --ad Ayşe     → kişiyi ekler, şifre üretip yazdırır
 *   node scripts/balim-kullanici.mjs ayse               → unutulan şifre: yenisini üretip yazdırır
 *   node scripts/balim-kullanici.mjs ayse --sifre kahve2026
 *   ... --local                                         → canlı değil, `wrangler dev`in yerel D1'i
 *
 * Borçlar bölümü (Balım › Borçlar) kişi başına yetkiyle açılır; varsayılan KAPALI ve yalnızca
 * buradan verilir (panelden verilemez, yoksa her panel kullanıcısı kendine yetki verebilirdi):
 *
 *   node scripts/balim-kullanici.mjs ayse --borc          → Ayşe'ye yetki verir, ŞİFRESİNE DOKUNMAZ
 *   node scripts/balim-kullanici.mjs ayse --borc-kapat    → yetkiyi kaldırır, şifreye dokunmaz
 *   node scripts/balim-kullanici.mjs ali --ad Ali --borc  → yeni kişiyi yetkiyle açar (şifre üretir)
 *   node scripts/balim-kullanici.mjs --liste              → kimin yetkisi var, şifresiz
 *
 * Yetkiyi geri alınca kişinin açık oturumları kapanmaz ama bir sonraki istekte borç verisi
 * gelmez (sunucu her istekte denetler). Telefonu da kapatmak için --oturumlari-kapat ekleyin.
 *
 * `--ad` yoksa yalnızca var olan kişinin şifresi yenilenir; kullanıcı adı yanlış
 * yazıldıysa yeni biri açılmaz, hata verilir. Açılsaydı giriş ekranına kimsenin
 * olmayan bir düğme düşerdi.
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

/** wrangler d1 execute balim ... --json: ortak çağrı. */
function d1(hedef, sql) {
  // wrangler'ın kendi giriş dosyası node ile çağrılıyor: Windows'ta npx.cmd için
  // kabuk açmak gerekir, kabuk da SQL'in tırnaklarını bozar.
  return spawnSync(
    process.execPath,
    [join(kok, "node_modules", "wrangler", "bin", "wrangler.js"), "d1", "execute", "balim", hedef, "--json", "--command", sql],
    { cwd: kok, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" }
  );
}

if (argumanlar.includes("--liste")) {
  const hedefListe = argumanlar.includes("--local") ? "--local" : "--remote";
  const sonucListe = d1(hedefListe, "SELECT kullanici_adi, ad, borc_yetkisi FROM kullanicilar ORDER BY id");
  if (sonucListe.status !== 0) {
    console.error(sonucListe.stdout);
    console.error("D1'den okunamadı (migration 0003 uygulandı mı?).");
    process.exit(sonucListe.status ?? 1);
  }
  const satirlar = JSON.parse(sonucListe.stdout.slice(sonucListe.stdout.indexOf("[")))[0].results;
  console.log(`${hedefListe === "--local" ? "Yerel" : "Canlı"} Balım · ${satirlar.length} kişi`);
  for (const k of satirlar) console.log(`  ${k.kullanici_adi.padEnd(16)} ${String(k.ad).padEnd(20)} borç yetkisi: ${k.borc_yetkisi ? "AÇIK" : "kapalı"}`);
  process.exit(0);
}

const kullaniciAdi = argumanlar[0];
if (!kullaniciAdi || kullaniciAdi.startsWith("--") || !/^[a-z0-9._-]+$/.test(kullaniciAdi)) {
  console.error("Kullanım: node scripts/balim-kullanici.mjs <kullanici_adi> [--ad \"Görünen ad\"] [--sifre \"...\"] [--local]");
  console.error("Kullanıcı adı küçük harf, rakam, nokta, tire: mehmet, ayse, ali.veli");
  process.exit(1);
}

const ad = secenek("ad");
const uretildi = secenek("sifre") === undefined;
const sifre = secenek("sifre") ?? `${KELIMELER[randomInt(KELIMELER.length)]}${randomInt(1000, 10000)}`;
const hedef = argumanlar.includes("--local") ? "--local" : "--remote";

if (argumanlar.includes("--borc") && argumanlar.includes("--borc-kapat")) {
  console.error("--borc ile --borc-kapat birlikte verilemez.");
  process.exit(1);
}
/** 1: ver, 0: kaldır, undefined: dokunma. */
const borcYetkisi = argumanlar.includes("--borc") ? 1 : argumanlar.includes("--borc-kapat") ? 0 : undefined;
/** Yalnızca yetki değişiyor: kişi var olmalı, şifre üretilmez ve yazılmaz. */
const yalnizYetki = borcYetkisi !== undefined && ad === undefined && secenek("sifre") === undefined;

if (sifre.length < 6) {
  console.error("Şifre en az 6 karakter olmalı.");
  process.exit(1);
}

const tuz = randomBytes(16);
const hash = pbkdf2Sync(sifre, tuz, TUR, 32, "sha256");
const kayit = `pbkdf2-sha256$${TUR}$${tuz.toString("base64")}$${hash.toString("base64")}`;

const metin = (deger) => `'${String(deger).replace(/'/g, "''")}'`;

// Şifre yenilemede ilk sorgu kişinin var olup olmadığını döner. `meta.changes`
// yerine bu: yerel D1'in --json çıktısında o alan hiç yok.
const sorgular = yalnizYetki
  ? [
      `SELECT COUNT(*) AS var FROM kullanicilar WHERE kullanici_adi = ${metin(kullaniciAdi)}`,
      `UPDATE kullanicilar SET borc_yetkisi = ${borcYetkisi} WHERE kullanici_adi = ${metin(kullaniciAdi)}`
    ]
  : ad === undefined
    ? [
        `SELECT COUNT(*) AS var FROM kullanicilar WHERE kullanici_adi = ${metin(kullaniciAdi)}`,
        `UPDATE kullanicilar SET sifre = ${metin(kayit)} WHERE kullanici_adi = ${metin(kullaniciAdi)}`
      ]
    : [
        `INSERT INTO kullanicilar (kullanici_adi, ad, sifre, olusturuldu)
         VALUES (${metin(kullaniciAdi)}, ${metin(ad)}, ${metin(kayit)}, ${metin(new Date().toISOString())})
         ON CONFLICT (kullanici_adi) DO UPDATE SET sifre = excluded.sifre, ad = excluded.ad`
      ];
// Yeni kişi ya da şifre yenileme sırasında yetki de isteniyorsa (yalnız-yetki modu kendi sorgusunu kurdu).
if (!yalnizYetki && borcYetkisi !== undefined) {
  sorgular.push(`UPDATE kullanicilar SET borc_yetkisi = ${borcYetkisi} WHERE kullanici_adi = ${metin(kullaniciAdi)}`);
}
if (argumanlar.includes("--oturumlari-kapat")) {
  sorgular.push(
    `DELETE FROM oturumlar WHERE kullanici_id = (SELECT id FROM kullanicilar WHERE kullanici_adi = ${metin(kullaniciAdi)})`
  );
}

const sonuc = d1(hedef, sorgular.join(";\n"));

if (sonuc.status !== 0) {
  console.error(sonuc.stdout);
  console.error("D1'e yazılamadı.");
  process.exit(sonuc.status ?? 1);
}

if (ad === undefined) {
  let kisiVar = null;
  try {
    kisiVar = JSON.parse(sonuc.stdout.slice(sonuc.stdout.indexOf("[")))[0].results[0].var > 0;
  } catch {
    // Çıktı okunamadıysa yazıldığı varsayılır; wrangler hata vermedi.
  }
  if (kisiVar === false) {
    console.error(`"${kullaniciAdi}" diye biri yok, hiçbir şey değişmedi.`);
    console.error(`Yeni kişi eklemek için: node scripts/balim-kullanici.mjs ${kullaniciAdi} --ad "Görünen ad"`);
    process.exit(1);
  }
}

console.log(`\n${hedef === "--local" ? "Yerel" : "Canlı"} Balım · ${kullaniciAdi}${ad ? ` (${ad})` : ""}`);
if (borcYetkisi !== undefined) console.log(`Borç yetkisi: ${borcYetkisi ? "AÇIK" : "kapalı"}`);
if (!yalnizYetki) console.log(uretildi ? `Şifre: ${sifre}` : "Şifre kaydedildi.");
