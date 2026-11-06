#!/usr/bin/env node
/**
 * Balım panelindeki kişileri ve kişi başına yetkiyi yönetir. ŞİFRE BURADA YOK.
 *
 * Tek üyelik (2026-11-06): dört kişinin şifresi balim.cafe adisyonunda durur ve panel girişi
 * oraya doğrulatılır (README → "One membership"). Panelde ikinci bir şifre yoktur,
 * `kullanicilar.sifre` sütunu yalnız NOT NULL olduğu için "-" taşır. Şifre unutulduysa
 * Adisyon'un kendi yolları: "Şifremi unuttum" e-postası ya da Menü ▸ Ayarlar ▸ Ekip ▸ Şifre belirle.
 *
 *   node scripts/balim-kullanici.mjs --liste                 → kim var, kimin borç yetkisi var
 *   node scripts/balim-kullanici.mjs ayse --borc             → Ayşe'ye Borçlar yetkisi verir
 *   node scripts/balim-kullanici.mjs ayse --borc-kapat       → yetkiyi kaldırır
 *   node scripts/balim-kullanici.mjs ali --ad Ali [--borc]   → panele kişi satırı ekler (şifresiz)
 *   node scripts/balim-kullanici.mjs ayse --oturumlari-kapat → kişinin panel oturumlarını kapatır (kayıp telefon)
 *   ... --local                                              → canlı değil, `wrangler dev`in yerel D1'i
 *
 * Borçlar bölümü (Balım › Borçlar) kişi başına yetkiyle açılır; varsayılan KAPALI ve yalnızca
 * buradan verilir (panelden verilemez, yoksa her panel kullanıcısı kendine yetki verebilirdi).
 * Yetkiyi geri alınca kişinin açık oturumları kapanmaz ama bir sonraki istekte borç verisi
 * gelmez (sunucu her istekte denetler). Telefonu da kapatmak için --oturumlari-kapat ekleyin.
 *
 * `--ad` yoksa yalnızca var olan kişi değiştirilir; kullanıcı adı yanlış yazıldıysa yeni biri
 * açılmaz, hata verilir. Açılsaydı giriş ekranına kimsenin olmayan bir düğme düşerdi. Yeni bir
 * kişi satırı tek başına giriş yaptırmaz: kişi Adisyon'un personel listesinde de olmalıdır
 * (worker/adisyon/defter.ts, BalimKafe deposu), çünkü şifre orada doğrulanır.
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

if (argumanlar.includes("--sifre")) {
  console.error("Şifre bu panelde belirlenmez: tek üyelik, şifre balim.cafe adisyonunda durur (Şifremi unuttum / Ekip ▸ Şifre belirle).");
  process.exit(1);
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
  console.error('Kullanım: node scripts/balim-kullanici.mjs <kullanici_adi> (--borc | --borc-kapat | --ad "Görünen ad" | --oturumlari-kapat) [--local]');
  console.error("         node scripts/balim-kullanici.mjs --liste");
  console.error("Kullanıcı adı küçük harf, rakam, nokta, tire: mehmet, ayse, ali.veli");
  process.exit(1);
}

const ad = secenek("ad");
const hedef = argumanlar.includes("--local") ? "--local" : "--remote";

if (argumanlar.includes("--borc") && argumanlar.includes("--borc-kapat")) {
  console.error("--borc ile --borc-kapat birlikte verilemez.");
  process.exit(1);
}
/** 1: ver, 0: kaldır, undefined: dokunma. */
const borcYetkisi = argumanlar.includes("--borc") ? 1 : argumanlar.includes("--borc-kapat") ? 0 : undefined;
const oturumlariKapat = argumanlar.includes("--oturumlari-kapat");

if (ad === undefined && borcYetkisi === undefined && !oturumlariKapat) {
  console.error("Yapılacak bir şey verilmedi (--borc, --borc-kapat, --ad ya da --oturumlari-kapat).");
  console.error("Şifre bu panelde belirlenmez: tek üyelik, şifre balim.cafe adisyonunda durur.");
  process.exit(1);
}

const metin = (deger) => `'${String(deger).replace(/'/g, "''")}'`;
const kisi = `kullanici_adi = ${metin(kullaniciAdi)}`;

// Var olan kişide ilk sorgu kişinin var olup olmadığını döner. `meta.changes`
// yerine bu: yerel D1'in --json çıktısında o alan hiç yok.
const sorgular =
  ad === undefined
    ? [`SELECT COUNT(*) AS var FROM kullanicilar WHERE ${kisi}`]
    : [
        // "-": şifre bu panelde saklanmaz (NOT NULL sütunun yer tutucusu, hiçbir şifre özetine benzemez).
        `INSERT INTO kullanicilar (kullanici_adi, ad, sifre, olusturuldu)
         VALUES (${metin(kullaniciAdi)}, ${metin(ad)}, '-', ${metin(new Date().toISOString())})
         ON CONFLICT (kullanici_adi) DO UPDATE SET ad = excluded.ad`
      ];
if (borcYetkisi !== undefined) sorgular.push(`UPDATE kullanicilar SET borc_yetkisi = ${borcYetkisi} WHERE ${kisi}`);
if (oturumlariKapat) {
  sorgular.push(`DELETE FROM oturumlar WHERE kullanici_id = (SELECT id FROM kullanicilar WHERE ${kisi})`);
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
    console.error(`Yeni kişi satırı eklemek için: node scripts/balim-kullanici.mjs ${kullaniciAdi} --ad "Görünen ad"`);
    process.exit(1);
  }
}

console.log(`\n${hedef === "--local" ? "Yerel" : "Canlı"} Balım · ${kullaniciAdi}${ad ? ` (${ad})` : ""}`);
if (ad !== undefined) console.log("Kişi satırı hazır (şifresiz). Giriş için kişi Adisyon'un personel listesinde de olmalı.");
if (borcYetkisi !== undefined) console.log(`Borç yetkisi: ${borcYetkisi ? "AÇIK" : "kapalı"}`);
if (oturumlariKapat) console.log("Panel oturumları kapatıldı.");
