#!/usr/bin/env node
/**
 * Balım › Borçlar'ın sunucu tarafı testi — `node scripts/balim-borc-test.mjs`.
 *
 * Worker'ın GERÇEK kodu (worker/balim.ts, worker/borc.ts, ortak çekirdek) esbuild ile
 * paketlenir ve Node'un yerleşik SQLite'ı üstünde, GERÇEK migration dosyalarıyla çalışır:
 * D1 yerine node:sqlite'ı saran küçük bir bağdaştırıcı var. Yerelde `wrangler dev` olmadan
 * koşar. Burada yalnızca UYDURMA veri ve geçici hesaplar var.
 *
 * En çok denetlenen şey: yetkisiz biri, hangi yoldan denerse denesin, borç verisini ne
 * okuyabilir ne değiştirebilir; ve borç hareketi Balım'ın herkese açık akışına sızmaz.
 */

import assert from "node:assert/strict";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
// esbuild wrangler'ın bağımlılığı: ayrı bir paket eklemeden onunla paketliyoruz.
const esbuild = createRequire(createRequire(join(kok, "package.json")).resolve("wrangler/package.json"))("esbuild");

/* ── Ortam: paketle, D1 bağdaştırıcısı, migration'lar ─────────────────── */

const gecici = mkdtempSync(join(tmpdir(), "balim-borc-test-"));
after(() => rmSync(gecici, { recursive: true, force: true }));

async function paketle(girdi, ad) {
  const cikti = join(gecici, `${ad}.mjs`);
  await esbuild.build({ entryPoints: [join(kok, girdi)], outfile: cikti, bundle: true, format: "esm", platform: "node", target: "node22", logLevel: "silent" });
  return import(pathToFileURL(cikti).href);
}

/** node:sqlite'ı D1'in (prepare/bind/first/all/run/batch) yüzeyine sarar. */
function d1(sqlite) {
  const hazirla = (sql) => {
    let degerler = [];
    const calistir = () => {
      const sorgu = sqlite.prepare(sql);
      if (/^\s*(select|with|pragma)\b/i.test(sql)) return { results: sorgu.all(...degerler).map((s) => ({ ...s })), meta: {} };
      const r = sorgu.run(...degerler);
      return { results: [], meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    };
    const nesne = {
      bind: (...v) => {
        degerler = v;
        return nesne;
      },
      first: async () => calistir().results[0] ?? null,
      all: async () => calistir(),
      run: async () => calistir(),
      _calistir: calistir
    };
    return nesne;
  };
  return {
    prepare: hazirla,
    // Gerçek D1 gibi: ya hepsi ya hiçbiri.
    batch: async (sorgular) => {
      sqlite.exec("BEGIN");
      try {
        const cikti = sorgular.map((s) => s._calistir());
        sqlite.exec("COMMIT");
        return cikti;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    }
  };
}

const migration = (klasor, ad) => readFileSync(join(kok, "migrations", klasor, ad), "utf8");

function veritabani(klasor, dosyalar) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  for (const d of dosyalar) sqlite.exec(migration(klasor, d));
  return { sqlite, db: d1(sqlite) };
}

const BALIM_MIGRATIONLARI = ["0001_baslangic.sql", "0002_sohbet_ve_bildirim.sql", "0003_borclar.sql"];
const BORC_MIGRATIONLARI = ["0001_baslangic.sql", "0002_islem_kaynak.sql", "0003_duzenli_gelir.sql"];

/** Testte hızlı olsun diye 1000 tur; worker 1..100.000 arası her turu kabul eder. */
function sifreKaydi(sifre) {
  const tuz = randomBytes(16);
  return `pbkdf2-sha256$1000$${tuz.toString("base64")}$${pbkdf2Sync(sifre, tuz, 1000, 32, "sha256").toString("base64")}`;
}

const ctx = { waitUntil: () => undefined };
const TL = (n) => Math.round(n * 100);

/* ── İstek yardımcıları ───────────────────────────────────────────────── */

function istemci(api, env, onEk, cerezAdi) {
  /** Giriş yapar, çerezi saklar. */
  const kisi = { cerez: null };
  async function istek(yol, { yontem = "GET", govde, cerez = kisi.cerez, baslik = {} } = {}) {
    const url = `https://test.local/api/${onEk}/${yol}`;
    const headers = { ...baslik };
    if (cerez) headers.cookie = cerez;
    if (govde !== undefined) headers["content-type"] = "application/json";
    const yanit = await api(new Request(url, { method: yontem, headers, body: govde === undefined ? undefined : JSON.stringify(govde) }), env, `/api/${onEk}/${yol}`, ctx);
    const metin = await yanit.text();
    let json = null;
    try {
      json = JSON.parse(metin);
    } catch {
      // JSON değil
    }
    return { durum: yanit.status, json, metin, yanit };
  }
  return {
    istek,
    kisi,
    async girisYap(kullaniciAdi, sifre) {
      const y = await istek("giris", { yontem: "POST", govde: { kullaniciAdi, sifre }, cerez: null });
      assert.equal(y.durum, 200, `giriş: ${y.metin}`);
      const c = y.yanit.headers.get("set-cookie");
      assert.ok(c && c.includes(`${cerezAdi}=`), "oturum çerezi verilmeli");
      const parca = new Headers({ "set-cookie": c }).get("set-cookie").split(";")[0];
      return parca;
    }
  };
}

/* ── Balım › Borçlar ──────────────────────────────────────────────────── */

let balim;
let borcWorker;

before(async () => {
  balim = await paketle("worker/balim.ts", "balim");
  borcWorker = await paketle("worker/borc.ts", "borc");
});

async function balimOrtami({ migrationlar = BALIM_MIGRATIONLARI } = {}) {
  const { sqlite, db } = veritabani("balim", migrationlar);
  const env = { BALIM_DB: db, BALIM_GORSELLER: {} };
  const bayrak = migrationlar.includes("0003_borclar.sql");
  const ekle = (kullanici, ad, borc) => {
    sqlite
      .prepare(`INSERT INTO kullanicilar (kullanici_adi, ad, sifre, olusturuldu${bayrak ? ", borc_yetkisi" : ""}) VALUES (?, ?, ?, ?${bayrak ? ", ?" : ""})`)
      .run(...[kullanici, ad, sifreKaydi("deneme-sifre"), "2026-11-04T09:00:00.000Z", ...(bayrak ? [borc ? 1 : 0] : [])]);
  };
  ekle("yetkili", "Yetkili Kişi", true);
  ekle("siradan", "Sıradan Kişi", false);
  const c = istemci(balim.balimApi, env, "balim", "balim_oturum");
  const yetkili = istemci(balim.balimApi, env, "balim", "balim_oturum");
  const siradan = istemci(balim.balimApi, env, "balim", "balim_oturum");
  yetkili.kisi.cerez = await yetkili.girisYap("yetkili", "deneme-sifre");
  siradan.kisi.cerez = await siradan.girisYap("siradan", "deneme-sifre");
  return { sqlite, env, anonim: c, yetkili, siradan };
}

const hesapKart = { ad: "Mavi Banka KK", tur: "kart", limit: TL(100_000), kesimGunu: 7, sonOdemeGunu: 17 };

test("migration 0003: borc_yetkisi varsayılan KAPALI, tablolar boş, yetki yalnızca 0/1", async () => {
  const { sqlite } = await balimOrtami();
  assert.equal(sqlite.prepare("SELECT borc_yetkisi FROM kullanicilar WHERE kullanici_adi = 'siradan'").get().borc_yetkisi, 0);
  for (const t of ["borc_hesaplar", "borc_durum_kayitlari", "borc_islemler", "borc_gelirler", "borc_duzenli_gelirler"]) {
    assert.equal(sqlite.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n, 0, `${t} boş açılmalı`);
  }
  assert.throws(() => sqlite.prepare("UPDATE kullanicilar SET borc_yetkisi = 2").run(), /CHECK/);
  // Yeni eklenen kişi yetki istemeden açılır: varsayılan kapalı.
  sqlite.prepare("INSERT INTO kullanicilar (kullanici_adi, ad, sifre, olusturuldu) VALUES ('yeni', 'Yeni', 'x', 'z')").run();
  assert.equal(sqlite.prepare("SELECT borc_yetkisi FROM kullanicilar WHERE kullanici_adi = 'yeni'").get().borc_yetkisi, 0);
});

test("yetki: oturumsuz 401, yetkisiz 403 — hiçbir borç ucu (okuma de yazma da) yetkisize açılmaz", async () => {
  const { anonim, siradan, yetkili } = await balimOrtami();

  // Yetkili bir hesap açsın; yetkisiz bunu hiçbir yoldan görememeli.
  const acildi = await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: { ...hesapKart, ad: "GIZLI-HESAP-ADI" } });
  assert.equal(acildi.durum, 200, acildi.metin);

  const uclar = [
    ["GET", "borc/veri"],
    ["GET", "borc/surum"],
    ["POST", "borc/hesaplar", hesapKart],
    ["PUT", "borc/hesaplar/1", hesapKart],
    ["DELETE", "borc/hesaplar/1"],
    ["POST", "borc/islemler", { tarih: "2026-11-01", hesapId: 1, aciklama: "x", tutar: 100, taksit: 1 }],
    ["PUT", "borc/durum", { hesapId: 1, borc: 100 }],
    ["POST", "borc/gelirler", { ad: "x", tutar: 100, beklenenTarih: "2026-11-15" }],
    ["POST", "borc/duzenli-gelirler", { ad: "x", tutar: 100, paraBirimi: "TRY", gun: 15, kesin: true, baslangicAy: "2026-11" }],
    ["PUT", "borc/kur", { usdTry: 40 }],
    ["PUT", "borc/ayarlar", { eldekiNakit: 100 }]
  ];
  for (const [yontem, yol, govde] of uclar) {
    const oturumsuz = await anonim.istek(yol, { yontem, govde });
    assert.equal(oturumsuz.durum, 401, `oturumsuz ${yontem} ${yol}`);
    const yetkisiz = await siradan.istek(yol, { yontem, govde });
    assert.equal(yetkisiz.durum, 403, `yetkisiz ${yontem} ${yol}: ${yetkisiz.metin}`);
    assert.ok(!yetkisiz.metin.includes("GIZLI-HESAP-ADI"), "yetkisize veri sızmamalı");
  }

  // Yetkisizin kendi görebildiği hiçbir yerde borç verisi yok: /veri'nin tamamında ne hesap adı ne rakam.
  const veri = await siradan.istek("veri");
  assert.equal(veri.durum, 200);
  assert.equal(veri.json.veri.borcYetkisi, false);
  assert.ok(!veri.metin.includes("GIZLI-HESAP-ADI"));
  const borcAnahtarlari = Object.keys(veri.json.veri).filter((k) => /borc|hesap|durum|islem|gelir/i.test(k) && k !== "borcYetkisi");
  assert.deepEqual(borcAnahtarlari, [], "yanıtta borç alanı yok (yalnızca borcYetkisi bayrağı)");

  // Hiçbir yazma denemesi yetkisizin lehine bir şey değiştirmemiş olmalı (yalnızca yetkilinin 1 hesabı var).
  const yetkiliVeri = await yetkili.istek("borc/veri");
  assert.equal(yetkiliVeri.json.veri.hesaplar.length, 1);
});

test("yetki: kaldırılınca aynı oturum bir sonraki istekte kapanır (oturumda/çerezde yetki saklanmaz)", async () => {
  const { sqlite, yetkili } = await balimOrtami();
  assert.equal((await yetkili.istek("borc/veri")).durum, 200);
  assert.equal((await yetkili.istek("veri")).json.veri.borcYetkisi, true);

  sqlite.prepare("UPDATE kullanicilar SET borc_yetkisi = 0 WHERE kullanici_adi = 'yetkili'").run();
  assert.equal((await yetkili.istek("borc/veri")).durum, 403);
  assert.equal((await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: hesapKart })).durum, 403);
  assert.equal((await yetkili.istek("veri")).json.veri.borcYetkisi, false);

  // Geri verilince yine açılır: veri silinmemiştir.
  sqlite.prepare("UPDATE kullanicilar SET borc_yetkisi = 1 WHERE kullanici_adi = 'yetkili'").run();
  assert.equal((await yetkili.istek("borc/veri")).durum, 200);
});

test("yetkili akış: hesap, ölçüm, işlem, gelir, kur, ayar — hepsi yazılır ve güncel veri döner", async () => {
  const { yetkili } = await balimOrtami();

  const bos = await yetkili.istek("borc/veri");
  assert.equal(bos.durum, 200);
  assert.deepEqual(bos.json.veri.hesaplar, []);
  assert.equal(bos.json.veri.ayarlar.usdTry, 0, "işletmede varsayılan kur yok: 0 = girilmedi");
  assert.equal(bos.json.veri.ayarlar.eldekiNakit, 0);

  let v = (await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: hesapKart })).json.veri;
  v = (await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: { ad: "KMH Hesabı", tur: "kmh", limit: TL(50_000) } })).json.veri;
  v = (await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: { ad: "Tedarikçi", tur: "diger" } })).json.veri;
  assert.deepEqual(v.hesaplar.map((h) => h.ad), ["Mavi Banka KK", "KMH Hesabı", "Tedarikçi"]);
  assert.deepEqual(v.hesaplar.map((h) => h.sira), [1, 2, 3], "sıra eklenme sırasıyla");
  const kart = v.hesaplar[0];
  assert.equal(kart.kesimGunu, 7);
  assert.equal(kart.asgariOrani, null);
  assert.equal(v.hesaplar[2].limit, 0, "diğer borçta limit yok");

  v = (await yetkili.istek("borc/durum", { yontem: "PUT", govde: { hesapId: kart.id, tarih: "2026-11-03", borc: TL(40_000), limit: TL(120_000), ekstre: TL(30_000), asgari: TL(12_000), sonOdeme: "2026-11-17" } })).json.veri;
  assert.equal(v.durum.length, 1);
  assert.equal(v.hesaplar[0].limit, TL(120_000), "ölçümdeki limit hesabın güncel limitini de değiştirir");

  v = (await yetkili.istek("borc/islemler", { yontem: "POST", govde: { tarih: "2026-11-02", hesapId: kart.id, aciklama: "Tedarik alışverişi", tutar: TL(9_000), taksit: 3 } })).json.veri;
  assert.equal(v.islemler.length, 1);
  assert.equal(v.islemler[0].ekstreAy, "2026-11", "2 Kasım, kesim günü 7'den önce: Kasım ekstresi");
  const islemId = v.islemler[0].id;
  v = (await yetkili.istek(`borc/islemler/${islemId}`, { yontem: "PUT", govde: { tarih: "2026-11-09", hesapId: kart.id, aciklama: "Tedarik alışverişi", tutar: TL(9_000), taksit: 3 } })).json.veri;
  assert.equal(v.islemler[0].ekstreAy, "2026-12", "düzenleyince ekstre ayı yeniden hesaplanır");

  v = (await yetkili.istek("borc/duzenli-gelirler", { yontem: "POST", govde: { ad: "Kira geliri", tutar: TL(200), paraBirimi: "USD", gun: 15, kesin: false, baslangicAy: "2026-11" } })).json.veri;
  assert.equal(v.duzenliGelirler[0].paraBirimi, "USD");
  v = (await yetkili.istek("borc/gelirler", { yontem: "POST", govde: { ad: "Müşteri ödemesi", tutar: TL(5_000), beklenenTarih: "2026-11-20" } })).json.veri;
  assert.equal(v.gelirler.length, 1);

  v = (await yetkili.istek("borc/kur", { yontem: "PUT", govde: { usdTry: 40.5 } })).json.veri;
  assert.equal(v.ayarlar.usdTry, 40.5);
  v = (await yetkili.istek("borc/ayarlar", { yontem: "PUT", govde: { eldekiNakit: TL(15_000), kmhFaizi: 0.05 } })).json.veri;
  assert.equal(v.ayarlar.eldekiNakit, TL(15_000));
  assert.equal(v.ayarlar.kmhFaizi, 0.05);
  assert.equal(v.ayarlar.kartFaiziAlt, 0.035, "gönderilmeyen ayara dokunulmaz");

  // Hesabı sil: ölçümü ve işlemi de gider (ON DELETE CASCADE), öteki hesaplar kalır.
  v = (await yetkili.istek(`borc/hesaplar/${kart.id}`, { yontem: "DELETE" })).json.veri;
  assert.deepEqual(v.hesaplar.map((h) => h.ad), ["KMH Hesabı", "Tedarikçi"]);
  assert.equal(v.durum.length, 0);
  assert.equal(v.islemler.length, 0);
});

test("doğrulama: aynı ad, bozuk tür, tür değişimi, saçma tutar, başka sitenin isteği reddedilir", async () => {
  const { yetkili } = await balimOrtami();
  await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: hesapKart });
  const hata = async (yol, yontem, govde, parca) => {
    const y = await yetkili.istek(yol, { yontem, govde });
    assert.equal(y.durum, 400, `${yontem} ${yol}: ${y.metin}`);
    assert.match(y.json.hata, parca);
  };

  await hata("borc/hesaplar", "POST", hesapKart, /başka bir hesap/);
  await hata("borc/hesaplar", "POST", { ad: "X", tur: "kredi" }, /türü/);
  await hata("borc/hesaplar", "POST", { ad: " ", tur: "kart" }, /gerekli/);
  await hata("borc/hesaplar", "POST", { ad: "Y", tur: "kart", kesimGunu: 32 }, /1 ile 31/);
  await hata("borc/hesaplar", "POST", { ad: "Y", tur: "kart", asgariOrani: 1.5 }, /%0 ile %100/);
  await hata("borc/hesaplar/1", "PUT", { ...hesapKart, tur: "kmh" }, /değiştirilemez/);
  await hata("borc/islemler", "POST", { tarih: "2026-11-01", hesapId: 1, aciklama: "x", tutar: 0, taksit: 1 }, /sıfır/);
  await hata("borc/islemler", "POST", { tarih: "2026-11-01", hesapId: 99, aciklama: "x", tutar: 100, taksit: 1 }, /Kart bulunamadı/);
  await hata("borc/kur", "PUT", { usdTry: 0.5 }, /arasında/);
  await hata("borc/kur", "PUT", { usdTry: "40" }, /arasında/);
  await hata("borc/ayarlar", "PUT", { vergiCarpani: 9 }, /arasında/);
  await hata("borc/ayarlar", "PUT", {}, /Değişiklik yok/);

  // 0 = kuru girilmedi, geçerli.
  assert.equal((await yetkili.istek("borc/kur", { yontem: "PUT", govde: { usdTry: 0 } })).durum, 200);

  // Başka bir sitenin sayfasından gelen yazma: Origin eşleşmez.
  const dis = await yetkili.istek("borc/kur", { yontem: "PUT", govde: { usdTry: 40 }, baslik: { origin: "https://baska-site.example" } });
  assert.equal(dis.durum, 403);
  const ic = await yetkili.istek("borc/kur", { yontem: "PUT", govde: { usdTry: 41 }, baslik: { origin: "https://test.local" } });
  assert.equal(ic.durum, 200);

  // Bilinmeyen uç ve desteklenmeyen yöntem.
  assert.equal((await yetkili.istek("borc/yok", { yontem: "POST", govde: {} })).durum, 404);
  assert.equal((await yetkili.istek("borc/islemler", { yontem: "GET" })).durum, 405);
  assert.equal((await yetkili.istek("borc/veri", { yontem: "DELETE" })).durum, 404);
  assert.equal((await yetkili.istek("borc/hesaplar/abc", { yontem: "DELETE" })).durum, 404);
  // Metin alanındaki tırnak/SQL parçası düz metin olarak saklanır.
  const sql = "Ali'nin'; DROP TABLE borc_hesaplar; --";
  const y = await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: { ad: sql, tur: "diger" } });
  assert.equal(y.json.veri.hesaplar.at(-1).ad, sql);
});

test("sızıntı yok: borç hareketi Balım'ın etkinlik akışına yazılmaz, bildirim gitmez; surum sayacı artar", async () => {
  const { sqlite, yetkili, siradan } = await balimOrtami();
  const etkinlik = () => sqlite.prepare("SELECT COUNT(*) AS n FROM etkinlikler").get().n;
  const once = etkinlik();
  const surum0 = (await yetkili.istek("borc/surum")).json.surum;

  await yetkili.istek("borc/hesaplar", { yontem: "POST", govde: { ...hesapKart, ad: "GIZLI-KART" } });
  await yetkili.istek("borc/kur", { yontem: "PUT", govde: { usdTry: 40 } });

  assert.equal(etkinlik(), once, "etkinlikler tablosuna borç satırı düşmedi");
  assert.equal((await yetkili.istek("borc/surum")).json.surum, surum0 + 2);
  const akis = await siradan.istek("veri");
  assert.ok(!akis.metin.includes("GIZLI-KART"));
  assert.equal(akis.json.veri.surum, (await yetkili.istek("veri")).json.veri.surum, "Balım'ın kendi sürümü borçla değişmez");
});

test("migration uygulanmadan deploy: panel çalışır, borç bölümü kapalı kalır, hata fırlatmaz", async () => {
  const { yetkili } = await balimOrtami({ migrationlar: BALIM_MIGRATIONLARI.slice(0, 2) });
  const veri = await yetkili.istek("veri");
  assert.equal(veri.durum, 200, veri.metin);
  assert.equal(veri.json.veri.borcYetkisi, false);
  const borc = await yetkili.istek("borc/veri");
  assert.equal(borc.durum, 403);
});

test("Balım'ın kendi uçları borç eklenince bozulmadı: kişi listesi, giriş, liste ekleme", async () => {
  const { anonim, yetkili } = await balimOrtami();
  const kisiler = await anonim.istek("kisiler");
  assert.deepEqual(kisiler.json.kisiler.map((k) => k.kullaniciAdi), ["yetkili", "siradan"]);
  const yanlis = await anonim.istek("giris", { yontem: "POST", govde: { kullaniciAdi: "yetkili", sifre: "yanlis" } });
  assert.equal(yanlis.durum, 401);
  const ekle = await yetkili.istek("alinacaklar", { yontem: "POST", govde: { ad: "Çay bardağı", kategori: "Mutfak ve bar", adet: 12, birimFiyat: 4500 } });
  assert.equal(ekle.durum, 200, ekle.metin);
  assert.equal(ekle.json.veri.alinacaklar.length, 1);
});

/* ── /borc (kişisel panel): ortak çekirdeğe geçişte davranış korundu ───── */

test("/borc: giriş, boş veri, varsayılan tahmini kur 50,4, hesap-işlem akışı ve eski uçlar aynı çalışır", async () => {
  const { sqlite, db } = veritabani("borc", BORC_MIGRATIONLARI);
  sqlite.prepare("INSERT INTO kullanicilar (kullanici_adi, sifre, olusturuldu) VALUES ('sahip', ?, 'z')").run(sifreKaydi("deneme-sifre-uzun"));
  const env = { BORC_DB: db };
  const c = istemci(borcWorker.borcApi, env, "borc", "borc_oturum");
  const ist = (yol, secenek) => c.istek(yol, secenek);
  // borcApi imzası (request, env, path); istemci yardımcısı 4. argümanı yok sayar.
  assert.equal((await ist("veri")).durum, 401);
  c.kisi.cerez = await c.girisYap("sahip", "deneme-sifre-uzun");

  const bos = await ist("veri");
  assert.equal(bos.durum, 200, bos.metin);
  assert.equal(bos.json.veri.ayarlar.usdTry, 50.4, "kişisel panelde tahmini başlangıç kuru");
  assert.deepEqual(bos.json.kullanici, { kullaniciAdi: "sahip" });

  // /borc'ta hesaplar önceden içe aktarmayla gelirdi; artık panelden de açılabilir (ortak çekirdek).
  let v = (await ist("hesaplar", { yontem: "POST", govde: hesapKart })).json.veri;
  v = (await ist("islemler", { yontem: "POST", govde: { tarih: "2026-11-02", hesapId: v.hesaplar[0].id, aciklama: "Market", tutar: TL(500), taksit: 1 } })).json.veri;
  assert.equal(v.islemler.length, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM islemler").get().n, 1, "/borc kendi öneksiz tablolarına yazar");
  assert.equal((await ist("kur", { yontem: "PUT", govde: { usdTry: 52 } })).json.veri.ayarlar.usdTry, 52);
  assert.equal((await ist("islemler", { yontem: "GET" })).durum, 405);
  assert.equal((await ist("yok", { yontem: "POST", govde: {} })).durum, 404);
});
