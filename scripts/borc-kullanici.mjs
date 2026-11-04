#!/usr/bin/env node
/**
 * /borc için giriş bilgisini oluşturur ya da şifreyi yeniler.
 *
 *   node scripts/borc-kullanici.mjs <kullanici_adi> --local            yerel (wrangler dev) veritabanı
 *   node scripts/borc-kullanici.mjs <kullanici_adi> --remote           CANLI veritabanı
 *   ... --sifre "..."            kendi şifreni seç (en az 12 karakter); yoksa güçlü bir şifre üretilir
 *   ... --oturumlari-kapat       bu kişinin açık oturumlarını da düşür (telefon kaybolduysa)
 *
 * --local ya da --remote ZORUNLU: yanlış veritabanına yazmamak için varsayılan yok.
 *
 * Şifre bu makinede hash'lenir; D1'e yalnızca PBKDF2 hash'i gider, şifrenin
 * kendisi hiçbir yere kaydedilmez. Üretilen şifre ekrana BİR KEZ yazılır:
 * telefonun şifre yöneticisine (iCloud Anahtar Zinciri) kaydet.
 *
 * Neden güçlü üretiliyor: Workers'ın Web Crypto'su PBKDF2'de 100.000 turun
 * üstüne çıkmıyor; veritabanı bir gün sızarsa hash'i çevrimdışı denemeye karşı
 * asıl koruma şifrenin entropisi. 16 karakter × 32 sembol ≈ 80 bit.
 *
 * Hesap kurulumu burada yok: veritabanı daha önce `wrangler d1 create borc` ile
 * açılmış ve migrations/borc uygulanmış olmalı (README → "/borc canlıya alma").
 */

import { spawnSync } from "node:child_process";
import { pbkdf2Sync, randomBytes, randomInt } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** worker/borc.ts'teki PBKDF2_TUR ile aynı olmak zorunda. */
const TUR = 100_000;
/** 0/o, 1/l/i karışmasın diye çıkarıldı: telefondan elle yazmak gerekirse. */
const ALFABE = "abcdefghjkmnpqrstuvwxyz23456789";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const argumanlar = process.argv.slice(2);

function secenek(ad) {
  const i = argumanlar.indexOf(`--${ad}`);
  return i === -1 ? undefined : argumanlar[i + 1];
}

function kullanim(mesaj) {
  if (mesaj) console.error(`${mesaj}\n`);
  console.error('Kullanım: node scripts/borc-kullanici.mjs <kullanici_adi> (--local | --remote) [--sifre "..."] [--oturumlari-kapat]');
  process.exit(1);
}

const kullaniciAdi = argumanlar[0];
if (!kullaniciAdi || kullaniciAdi.startsWith("--") || !/^[a-z0-9._-]{2,32}$/.test(kullaniciAdi)) {
  kullanim("Kullanıcı adı küçük harf, rakam, nokta, tire (2-32 karakter): örn. sahip");
}

const yerel = argumanlar.includes("--local");
const uzak = argumanlar.includes("--remote");
if (yerel === uzak) kullanim("Tam olarak birini seç: --local (yerel deneme) ya da --remote (canlı).");

const uretildi = secenek("sifre") === undefined;
const sifre =
  secenek("sifre") ??
  Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ALFABE[randomInt(ALFABE.length)]).join("")).join("-");

if (sifre.length < 12) {
  console.error("Şifre en az 12 karakter olmalı.");
  process.exit(1);
}

const tuz = randomBytes(16);
const kayit = `pbkdf2-sha256$${TUR}$${tuz.toString("base64")}$${pbkdf2Sync(sifre, tuz, TUR, 32, "sha256").toString("base64")}`;
const metin = (deger) => `'${String(deger).replace(/'/g, "''")}'`;

const sorgular = [
  `INSERT INTO kullanicilar (kullanici_adi, sifre, olusturuldu)
   VALUES (${metin(kullaniciAdi)}, ${metin(kayit)}, ${metin(new Date().toISOString())})
   ON CONFLICT (kullanici_adi) DO UPDATE SET sifre = excluded.sifre`
];
if (argumanlar.includes("--oturumlari-kapat")) {
  sorgular.push(`DELETE FROM oturumlar WHERE kullanici_id = (SELECT id FROM kullanicilar WHERE kullanici_adi = ${metin(kullaniciAdi)})`);
}

// wrangler'ın kendi giriş dosyası node ile çağrılıyor: kabuk açılmaz, SQL'in tırnakları bozulmaz.
const sonuc = spawnSync(
  process.execPath,
  [join(kok, "node_modules", "wrangler", "bin", "wrangler.js"), "d1", "execute", "borc", yerel ? "--local" : "--remote", "--command", sorgular.join(";\n")],
  { cwd: kok, stdio: ["ignore", "ignore", "inherit"], encoding: "utf8" }
);

if (sonuc.status !== 0) {
  console.error("D1'e yazılamadı. Veritabanı açık mı ve migrations/borc uygulandı mı?");
  process.exit(sonuc.status ?? 1);
}

console.log(`\n${yerel ? "Yerel" : "CANLI"} /borc · kullanıcı: ${kullaniciAdi}`);
console.log(uretildi ? `Şifre: ${sifre}\n(Bir daha gösterilmez — şifre yöneticine kaydet.)` : "Şifre kaydedildi.");
