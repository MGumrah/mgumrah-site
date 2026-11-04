#!/usr/bin/env node
/**
 * Borç-Takip.xlsx → /borc veritabanı. YALNIZCA KENDİ MAKİNENDE çalışır.
 *
 *   node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>"                       özet + uyarılar (hiçbir yere yazmaz*)
 *   node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --goster              hesap hesap güncel rakamları da yazdır
 *   node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --uygula --local      yerel (wrangler dev) veritabanına yaz
 *   node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --uygula --remote     CANLI veritabanına yaz (onay sorar)
 *   ... --hesap "Ad|kart|limitTL|kesimGunu|sonOdemeGunu"   Excel'de olmayan bir hesabı ekle (tekrarlanabilir):
 *                                                          --hesap "Örnek KK|kart|50000|12|22"
 *   ... --cikti yol.sql                                    SQL'in yazılacağı dosya (varsayılan veri-yerel/borc-ice-aktar.sql)
 *
 *   * SQL dosyası yazılır ama veritabanına dokunulmaz. Dosya GERÇEK rakamlar içerir: bu yüzden yalnızca
 *     .gitignore'daki bir yola yazılır (veri-yerel/ klasörü) ve depodaki bir yer ignore'da değilse betik durur.
 *
 * Yeniden çalıştırılabilir: hesaplar adıyla, ölçümler (hesap, tarih) ile, işlemler Excel'deki satırdan türetilen
 * anahtarla güncellenir. Hiçbir şey SİLİNMEZ; telefondan girilen kayıtlara dokunulmaz.
 * Excel'den bir satırı silmek veritabanından silmez.
 *
 * Gelir kayıtları Excel'de yok; "Gelir" sekmesinden elle girilir.
 *
 * Dosya okunurken ağa hiçbir şey gönderilmez; yalnızca --uygula ile wrangler çalışır.
 */

import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { donustur, sqlUret } from "./lib/borc-donustur.mjs";
import { xlsxOku } from "./lib/xlsx-oku.mjs";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.slice(2);

const secenekler = (ad) => arg.flatMap((a, i) => (a === `--${ad}` && arg[i + 1] ? [arg[i + 1]] : []));
const tek = (ad) => secenekler(ad)[0];

const dosya = arg[0];
if (!dosya || dosya.startsWith("--")) {
  console.error('Kullanım: node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" [--goster] [--uygula (--local | --remote)] [--hesap "Ad|kart|limitTL|kesim|sonOdeme"] [--cikti yol.sql]');
  process.exit(1);
}
if (!existsSync(dosya)) {
  console.error(`Dosya bulunamadı: ${dosya}`);
  process.exit(1);
}

const uygula = arg.includes("--uygula");
const yerel = arg.includes("--local");
const uzak = arg.includes("--remote");
if (uygula && yerel === uzak) {
  console.error("--uygula ile tam olarak birini seç: --local ya da --remote.");
  process.exit(1);
}

const ekHesaplar = secenekler("hesap").map((metin) => {
  const [ad, tur, limitTl, kesim, odeme] = metin.split("|").map((p) => p.trim());
  if (!ad || !["kart", "kmh", "diger"].includes(tur)) {
    console.error(`--hesap biçimi: "Ad|kart|limitTL|kesimGunu|sonOdemeGunu" (geçersiz: ${metin})`);
    process.exit(1);
  }
  const sayi = (s) => (s ? Number(s.replace(",", ".")) : null);
  return { ad, tur, limit: limitTl ? Math.round(sayi(limitTl) * 100) : 0, kesimGunu: kesim ? Number(kesim) : null, sonOdemeGunu: odeme ? Number(odeme) : null };
});

/* ── Oku ve dönüştür ── */
let sonuc;
try {
  sonuc = donustur(xlsxOku(dosya), { ekHesaplar });
} catch (e) {
  console.error(`İçe aktarılamadı: ${e.message}`);
  process.exit(1);
}
const sql = sqlUret(sonuc);

/* ── Çıktı yolu: gerçek rakamlar içerir, depoya GİRMEMELİ ── */
const cikti = resolve(tek("cikti") ?? join(kok, "veri-yerel", "borc-ice-aktar.sql"));
const goreli = relative(kok, cikti);
const depoIcinde = !goreli.startsWith("..") && !isAbsolute(goreli);
if (depoIcinde) {
  const ignore = spawnSync("git", ["check-ignore", "-q", cikti], { cwd: kok });
  if (ignore.status !== 0) {
    console.error(`Çıktı yolu .gitignore'da değil, yazılmadı: ${relative(kok, cikti)}\nBaşka bir yol ver ya da veri-yerel/ altını kullan.`);
    process.exit(1);
  }
}
mkdirSync(dirname(cikti), { recursive: true });
writeFileSync(cikti, sql, { mode: 0o600 });
try {
  chmodSync(cikti, 0o600);
} catch {
  // Windows'ta izin biti anlamsız; sorun değil.
}

/* ── Özet ── */
const TL = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tl = (k) => `${TL.format(k / 100)} ₺`;
const turSayisi = (t) => sonuc.hesaplar.filter((h) => h.tur === t).length;
const tarihler = sonuc.islemler.map((i) => i.tarih).sort();

console.log("Okundu:");
console.log(`  ${sonuc.hesaplar.length} hesap (${turSayisi("kart")} kart, ${turSayisi("kmh")} KMH, ${turSayisi("diger")} diğer)`);
console.log(`  ${sonuc.durum.length} aylık/güncel ölçüm`);
console.log(`  ${sonuc.islemler.length} işlem${tarihler.length ? ` (${tarihler[0]} → ${tarihler[tarihler.length - 1]})` : ""}, ${sonuc.islemler.filter((i) => i.taksit > 1).length} taksitli`);
console.log(`  ${Object.keys(sonuc.ayarlar).length} faiz/vergi ayarı${sonuc.veriTarihi ? ` · Excel veri tarihi ${sonuc.veriTarihi}` : ""}`);

if (arg.includes("--goster")) {
  const guncel = new Map();
  for (const d of sonuc.durum) if (!guncel.has(d.hesap) || d.tarih >= guncel.get(d.hesap).tarih) guncel.set(d.hesap, d);
  console.log("\nGüncel durum (Excel'deki Özet ile karşılaştır):");
  for (const h of sonuc.hesaplar) {
    const d = guncel.get(h);
    console.log(`  ${h.ad.padEnd(22)} ${d ? tl(d.borc).padStart(18) : "—".padStart(18)}${h.limit ? `  limit ${tl(h.limit)}` : ""}${d ? `  (${d.tarih})` : ""}`);
  }
  console.log(`  ${"Toplam (işyeri hariç)".padEnd(22)} ${tl(sonuc.toplamlar.isyeriHaric).padStart(18)}`);
  console.log(`  ${"Toplam (işyeri dahil)".padEnd(22)} ${tl(sonuc.toplamlar.isyeriDahil).padStart(18)}`);
  console.log("\nHesap ayarları (Excel'deki Hesaplar tablosundan; yoksa veriden türetilen):");
  for (const h of sonuc.hesaplar.filter((x) => x.tur === "kart")) {
    console.log(`  ${h.ad.padEnd(22)} kesim ${h.kesimGunu ?? "?"} · son ödeme ~${h.sonOdemeGunu ?? "?"} · asgari oranı ${h.asgariOraniBp === null ? "(varsayılan)" : `%${h.asgariOraniBp / 100}`}`);
  }
}

if (sonuc.uyarilar.length) {
  console.log(`\n${sonuc.uyarilar.length} uyarı:`);
  for (const u of sonuc.uyarilar.slice(0, 25)) console.log(`  ! ${u}`);
  if (sonuc.uyarilar.length > 25) console.log(`  … ve ${sonuc.uyarilar.length - 25} uyarı daha`);
}

console.log(`\nSQL yazıldı: ${depoIcinde ? relative(kok, cikti) : cikti}  (gerçek rakamlar içerir — paylaşma, commit etme)`);

if (!uygula) {
  console.log("Veritabanına yazmak için --uygula --local (deneme) ya da --uygula --remote (canlı) ekle.");
  process.exit(0);
}

/* ── Uygula ── */
if (uzak) {
  if (!process.stdin.isTTY) {
    console.error("CANLI veritabanına yazma yalnızca etkileşimli terminalde, onay sorularak yapılır.");
    process.exit(1);
  }
  const okuyucu = createInterface({ input: process.stdin, output: process.stdout });
  const cevap = await okuyucu.question(
    `\nCANLI /borc veritabanına yazılacak: ${sonuc.hesaplar.length} hesap, ${sonuc.durum.length} ölçüm, ${sonuc.islemler.length} işlem.\nMevcut kayıtların üstüne yazar, hiçbir şeyi silmez. Devam? (evet/hayır): `
  );
  okuyucu.close();
  if (cevap.trim().toLowerCase() !== "evet") {
    console.log("Vazgeçildi, hiçbir şey yazılmadı.");
    process.exit(0);
  }
}

const calisma = spawnSync(
  process.execPath,
  [join(kok, "node_modules", "wrangler", "bin", "wrangler.js"), "d1", "execute", "borc", uzak ? "--remote" : "--local", "--file", cikti],
  { cwd: kok, stdio: ["ignore", "ignore", "inherit"] }
);
if (calisma.status !== 0) {
  console.error("D1'e yazılamadı. Veritabanı açık mı ve migrations/borc uygulandı mı? (README → “/borc canlıya alma”)");
  process.exit(calisma.status ?? 1);
}
console.log(`${uzak ? "CANLI" : "Yerel"} veritabanına yazıldı.`);
