#!/usr/bin/env node
/**
 * Panel alan adı kapısının (worker/panel-host.ts) testi — `node scripts/balim-host-test.mjs`.
 *
 * Worker'ın GERÇEK girişi (worker/index.ts) esbuild ile paketlenir; istekler `Host`'u panel alan adı
 * (panel.balim.cafe) ya da başka bir alan adı olan sahte Request'lerdir. D1 yerine node:sqlite ve gerçek
 * migration dosyaları kullanılır; yalnızca uydurma kullanıcılar var. Ayrıca wrangler.jsonc ve
 * app/balim/adres.ts üzerinde statik değişmezler denetlenir (bir alan adı kapısız bağlanamasın diye).
 *
 * Sınanan üç şey:
 *  1. panel alan adında YALNIZCA panel açık (sayfa, API, /_next); kişisel /borc, ilanlar, brief… kapalı;
 *  2. diğer alan adları için hiçbir şey değişmedi (mgumrah.com eskisi gibi);
 *  3. panel o alan adında gerçekten çalışır: giriş, host-only çerez, Borçlar yetkisi, Origin denetimi.
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
const oku = (yol) => readFileSync(join(kok, yol), "utf8");
// Etkinleştirilmiş (route + run_worker_first açık) bir wrangler.jsonc kopyasını denemek için: BALIM_WRANGLER=/yol/wrangler.jsonc
const wranglerMetni = () => (process.env.BALIM_WRANGLER ? readFileSync(process.env.BALIM_WRANGLER, "utf8") : oku("wrangler.jsonc"));
const esbuild = createRequire(createRequire(join(kok, "package.json")).resolve("wrangler/package.json"))("esbuild");

const PANEL = "panel.balim.cafe";
const gecici = mkdtempSync(join(tmpdir(), "balim-host-test-"));
after(() => rmSync(gecici, { recursive: true, force: true }));

/* ── 1. Statik değişmezler ─────────────────────────────────────────────── */

const adres = oku("app/balim/adres.ts");
const liste = adres.match(/export const PANEL_ALAN_ADLARI: readonly string\[\] = \[([^\]]*)\];/);
const PANEL_ALAN_ADLARI = liste ? [...liste[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];

/** wrangler.jsonc'tan // ve /* *​/ yorumlarını (dizgilerin dışında) atıp JSON olarak okur. */
function jsonc(metin) {
  let cikti = "";
  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    if (c === '"') {
      let j = i + 1;
      while (j < metin.length && metin[j] !== '"') j += metin[j] === "\\" ? 2 : 1;
      cikti += metin.slice(i, j + 1);
      i = j;
    } else if (c === "/" && metin[i + 1] === "/") {
      while (i < metin.length && metin[i] !== "\n") i++;
      cikti += "\n";
    } else if (c === "/" && metin[i + 1] === "*") {
      i = metin.indexOf("*/", i + 2) + 1;
    } else cikti += c;
  }
  return JSON.parse(cikti.replace(/,(\s*[}\]])/g, "$1"));
}

test("PANEL_ALAN_ADLARI: tanımlı, geçerli alan adları, panel.balim.cafe içinde", () => {
  assert.ok(PANEL_ALAN_ADLARI.length >= 1, "adres.ts içindeki liste okunamadı");
  assert.ok(PANEL_ALAN_ADLARI.includes(PANEL));
  for (const a of PANEL_ALAN_ADLARI) {
    assert.match(a, /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, `${a}: küçük harfli, yalnızca alan adı olmalı`);
    assert.notEqual(a, "balim.cafe", "balim.cafe'nin kendisi başka bir Worker'a ait; panel yalnızca alt alan adında");
    assert.ok(!/^(www\.)?mgumrah\.com$/.test(a), "ana site alan adı panel kapısına konmaz");
  }
});

test("wrangler.jsonc: Worker'a bağlı her alan adı ya ana site ya kapılı panel alan adı; panel alan adı bağlıysa run_worker_first açık", () => {
  const w = jsonc(wranglerMetni());
  const rotalar = (w.routes ?? []).map((r) => (typeof r === "string" ? { pattern: r } : r));
  const ANA = ["mgumrah.com", "www.mgumrah.com"];
  let panelBagli = false;
  for (const r of rotalar) {
    assert.ok(!r.pattern.includes("*"), `${r.pattern}: joker karakterli route kapıyı atlar`);
    const alan = r.pattern.split("/")[0].toLowerCase();
    assert.ok(ANA.includes(alan) || PANEL_ALAN_ADLARI.includes(alan), `${alan} Worker'a bağlı ama ne ana site ne PANEL_ALAN_ADLARI içinde: sitenin tamamı o alan adında açılırdı`);
    if (PANEL_ALAN_ADLARI.includes(alan)) panelBagli = true;
  }
  if (panelBagli) {
    assert.equal(w.assets?.run_worker_first, true, "panel alan adı bağlıyken assets.run_worker_first açık olmalı; yoksa statik sayfalar kapıya uğramadan sunulur");
  }
});

test("panel alan adı henüz wrangler.jsonc'a bağlı değil (bağlamak ayrı onay ister)", () => {
  // Bu test BİLİNÇLİ olarak güncellenir: canlıya alma onaylanıp route eklenince bu beklenti değişir
  // (README → "panel.balim.cafe canlıya alma"). Önceki test o zaman kapının ön koşullarını denetler.
  const w = jsonc(wranglerMetni());
  const baglanan = (w.routes ?? []).map((r) => (typeof r === "string" ? r : r.pattern));
  assert.ok(!baglanan.some((p) => PANEL_ALAN_ADLARI.includes(p.split("/")[0])), "panel alan adı route olarak eklenmiş");
});

/* ── 2. Worker paketi ve D1 ────────────────────────────────────────────── */

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

function sifreKaydi(sifre) {
  const tuz = randomBytes(16);
  return `pbkdf2-sha256$1000$${tuz.toString("base64")}$${pbkdf2Sync(sifre, tuz, 1000, 32, "sha256").toString("base64")}`;
}

let worker;
before(async () => {
  const cikti = join(gecici, "index.mjs");
  await esbuild.build({ entryPoints: [join(kok, "worker/index.ts")], outfile: cikti, bundle: true, format: "esm", platform: "node", target: "node22", logLevel: "silent" });
  worker = (await import(pathToFileURL(cikti).href)).default;
});

const ctx = { waitUntil: () => undefined };

/** ASSETS yanıtı hangi alan adı ve yolla çağrıldığını söyler; böylece isteğin alan adı korunarak statik katmana gittiği görülür. */
function ortam({ borc = false } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const migrationlar = ["0001_baslangic.sql", "0002_sohbet_ve_bildirim.sql", "0003_borclar.sql"];
  for (const m of migrationlar) sqlite.exec(oku(`migrations/balim/${m}`));
  const ekle = (kullanici, yetki) =>
    sqlite
      .prepare("INSERT INTO kullanicilar (kullanici_adi, ad, sifre, olusturuldu, borc_yetkisi) VALUES (?, ?, ?, ?, ?)")
      .run(kullanici, `Kişi ${kullanici}`, sifreKaydi("deneme-sifre"), "2026-11-04T09:00:00.000Z", yetki ? 1 : 0);
  ekle("yetkili", true);
  ekle("siradan", false);
  const env = {
    ASSETS: { fetch: async (r) => new Response(`ASSET ${new URL(r.url).host}${new URL(r.url).pathname}`) },
    BRIEF: { get: async () => null, put: async () => {}, list: async () => ({ keys: [] }) },
    BALIM_DB: d1(sqlite),
    BALIM_GORSELLER: {}
  };
  void borc;
  return { sqlite, env };
}

async function iste(env, adresi, { yontem = "GET", baslik = {}, govde } = {}) {
  const headers = { ...baslik };
  if (govde !== undefined) headers["content-type"] = "application/json";
  const y = await worker.fetch(new Request(adresi, { method: yontem, headers, body: govde === undefined ? undefined : JSON.stringify(govde), redirect: "manual" }), env, ctx);
  const metin = await y.text();
  return { durum: y.status, metin, yer: y.headers.get("location"), baslik: y.headers, yanit: y };
}

/* ── 3. Panel alan adı: yalnızca panel açık ────────────────────────────── */

test("panel alan adı: panelin kendisi açık, host korunarak statik katmana gider", async () => {
  const { env } = ortam();
  for (const yol of ["/balim/", "/balim/sw.js", "/balim/manifest.webmanifest", "/balim/ikon-192.png", "/balim/og.png", "/_next/static/chunks/a.js", "/_next/static/media/f.woff2"]) {
    const y = await iste(env, `https://${PANEL}${yol}`);
    assert.equal(y.durum, 200, yol);
    assert.equal(y.metin, `ASSET ${PANEL}${yol}`, `${yol}: istek alan adı korunarak statik katmana verilmeli`);
  }
  // /balim (eğik çizgisiz) panelin kendi yönlendirmesi: alan adı korunur.
  const y = await iste(env, `https://${PANEL}/balim`);
  assert.equal(y.durum, 301);
  assert.equal(y.yer, `https://${PANEL}/balim/`);
});

test("panel alan adı: / panele yönlenir, robots.txt hepsini yasaklar", async () => {
  const { env } = ortam();
  const kok_ = await iste(env, `https://${PANEL}/`);
  assert.equal(kok_.durum, 302);
  assert.equal(kok_.yer, `https://${PANEL}/balim/`);
  const sorgulu = await iste(env, `https://${PANEL}/?x=1`);
  assert.equal(sorgulu.durum, 302);
  const robots = await iste(env, `https://${PANEL}/robots.txt`);
  assert.equal(robots.durum, 200);
  assert.match(robots.metin, /^User-agent: \*\nDisallow: \/\n$/);
  assert.match(robots.baslik.get("content-type"), /^text\/plain/);
});

test("panel alan adı: ana sitenin ve kişisel /borc'un hiçbir yolu açık değil", async () => {
  const { env } = ortam();
  const kapali = [
    ["GET", "/borc"], ["GET", "/borc/"], ["GET", "/api/borc"], ["GET", "/api/borc/veri"], ["POST", "/api/borc/giris"], ["PUT", "/api/borc/kur"],
    ["GET", "/tr/"], ["GET", "/en/"], ["GET", "/apps/"], ["GET", "/ilan/note/"], ["GET", "/civic"], ["GET", "/ingilizce/"], ["GET", "/merve/ingilizce/"],
    ["GET", "/brief/"], ["GET", "/brief/inbox"], ["GET", "/testers/inbox"], ["POST", "/api/brief"], ["POST", "/api/android-tester"],
    ["GET", "/sitemap.xml"], ["GET", "/favicon.ico"], ["GET", "/icon.svg"], ["GET", "/manifest.webmanifest"], ["GET", "/index.html"], ["GET", "/belgeler/x.pdf"],
    ["GET", "/Balim/"], ["GET", "/balimx/"], ["GET", "/api/balimx"], ["GET", "/api/balim-x/surum"], ["GET", "/_next"], ["GET", "/_nextx/a.js"], ["GET", "//api/borc/veri"]
  ];
  for (const [yontem, yol] of kapali) {
    const y = await iste(env, `https://${PANEL}${yol}`, { yontem, govde: yontem === "GET" ? undefined : {} });
    assert.equal(y.durum, 404, `${yontem} ${yol} → ${y.durum} ${y.metin.slice(0, 40)}`);
    assert.equal(y.metin, "Not found");
    assert.equal(y.baslik.get("cache-control"), "no-store");
  }
});

test("panel alan adı: yol hileleri (../, kodlanmış nokta, kodlanmış eğik çizgi) /api/borc'a ulaştırmaz", async () => {
  const { env } = ortam();
  for (const yol of ["/balim/../api/borc/veri", "/balim/%2e%2e/api/borc/veri", "/balim/%2E%2E/api/borc/veri", "/balim/./../borc/", "/api/balim/../borc/veri", "/_next/../api/borc/veri", "/balim%2f..%2fapi%2fborc%2fveri", "/api/balim%2f..%2fborc%2fveri"]) {
    const y = await iste(env, `https://${PANEL}${yol}`);
    // Ya kapı 404 verir ya da (kodlanmış eğik çizgide) yol panel öneki olarak kalır ve statik katman/panel API'sine gider;
    // hiçbir durumda borcApi'ye (503 "kurulu değil" ya da 401) ya da /borc statik sayfasına ulaşmamalı.
    assert.ok(!/Borç takibi|\/api\/borc|ASSET [^ ]*\/borc/.test(y.metin), `${yol} → ${y.durum} ${y.metin.slice(0, 60)}`);
    assert.ok(y.durum !== 503, `${yol} borcApi'ye ulaştı`);
  }
  // Kodlanmamış ../ yolu normalleştirilir ve kapıda 404 olur.
  assert.equal((await iste(env, `https://${PANEL}/balim/../api/borc/veri`)).durum, 404);
});

test("alan adı eşleşmesi: büyük harf, sondaki nokta, port panel sayılır; benzer alan adları sayılmaz", async () => {
  const { env } = ortam();
  for (const alan of ["PANEL.BALIM.CAFE", `${PANEL}.`, `${PANEL}:8443`]) {
    assert.equal((await iste(env, `https://${alan}/api/borc/veri`)).durum, 404, `${alan} panel gibi davranmalı`);
    assert.equal((await iste(env, `https://${alan}/`)).durum, 302, alan);
  }
  // Panel alan adı DEĞİL: kapı devreye girmez, istek eskisi gibi yürür (ana site davranışı).
  // Kapı uygulansaydı 404 "Not found" olurdu; uygulanmadığında Worker'ın kendi cevabı gelir (bu ortamda BORC_DB bağlı
  // değil → borcApi 503 "kurulu değil"). Alan adı kapıya yalnızca tam eşleşmeyle girer.
  for (const alan of ["evilpanel.balim.cafe", `${PANEL}.evil.example`, "balim.cafe", "www.balim.cafe", "x.panel.balim.cafe", "xpanel.balim.cafe"]) {
    const y = await iste(env, `https://${alan}/api/borc/veri`);
    assert.equal(y.durum, 503, `${alan}: kapı uygulanmamalı`);
    assert.match(y.metin, /kurulu değil/);
  }
  // userinfo hilesi (panel.balim.cafe@evil.example): Request kurucusu kimlik bilgili adresi zaten reddeder;
  // URL ayrıştırıcısı da alan adını evil.example okur, yani kapıya hiç takılmaz.
  assert.throws(() => new Request(`https://${PANEL}@evil.example/`), TypeError);
  assert.equal(new URL(`https://${PANEL}@evil.example/`).hostname, "evil.example");
});

/* ── 4. Diğer alan adları: eskisi gibi ─────────────────────────────────── */

test("mgumrah.com ve diğer alan adları: kapı yok, istekler eskisi gibi", async () => {
  const { env } = ortam();
  for (const alan of ["mgumrah.com", "www.mgumrah.com", "localhost:8788", "mgumrah-site.hesap.workers.dev", "baska.example"]) {
    const o = `https://${alan}`;
    const k = await iste(env, `${o}/`);
    assert.equal(k.durum, 200);
    assert.equal(k.metin, `ASSET ${alan}/`, `${alan}: / statik katmana gitmeli (panele yönlenmemeli)`);
    assert.equal((await iste(env, `${o}/robots.txt`)).metin, `ASSET ${alan}/robots.txt`, "robots.txt sitenin kendisi");
    assert.equal((await iste(env, `${o}/borc/`)).metin, `ASSET ${alan}/borc/`);
    assert.equal((await iste(env, `${o}/tr/`)).metin, `ASSET ${alan}/tr/`);
    assert.equal((await iste(env, `${o}/balim/`)).metin, `ASSET ${alan}/balim/`);
    const b = await iste(env, `${o}/balim`);
    assert.equal(b.durum, 301);
    assert.equal(b.yer, `${o}/balim/`);
    // /api/borc ana sitede Worker'ın kendi cevabını verir (bu ortamda BORC_DB bağlı değil → 503), 404 değil.
    const borc = await iste(env, `${o}/api/borc/veri`);
    assert.equal(borc.durum, 503, alan);
    assert.match(borc.metin, /kurulu değil/);
    assert.equal((await iste(env, `${o}/brief/inbox`)).durum, 404, "brief gelen kutusu kendi mantığıyla (anahtarsız 404)");
    assert.equal((await iste(env, `${o}/api/brief`, { yontem: "POST", govde: undefined })).durum, 400);
    assert.equal((await iste(env, `${o}/api/balim/surum`)).durum, 401);
  }
});

/* ── 5. Panel o alan adında gerçekten çalışır ──────────────────────────── */

async function giris(env, alan, kullanici) {
  const y = await iste(env, `https://${alan}/api/balim/giris`, { yontem: "POST", govde: { kullaniciAdi: kullanici, sifre: "deneme-sifre" } });
  assert.equal(y.durum, 200, y.metin);
  const cerez = y.baslik.get("set-cookie");
  assert.ok(cerez, "oturum çerezi verilmeli");
  return { cerez, ilk: cerez.split(";")[0] };
}

test("giriş panel alan adında çalışır; çerez host-only (Domain yok), yalnızca /api/balim yolunda", async () => {
  const { env } = ortam();
  const { cerez } = await giris(env, PANEL, "yetkili");
  assert.match(cerez, /^balim_oturum=/);
  assert.ok(!/;\s*domain=/i.test(cerez), `çerezde Domain olmamalı (alan adına bağlı kalmalı): ${cerez}`);
  assert.match(cerez, /;\s*Path=\/api\/balim(;|$)/i);
  assert.match(cerez, /;\s*HttpOnly/i);
  assert.match(cerez, /;\s*Secure/i);
  assert.match(cerez, /;\s*SameSite=Lax/i);
});

test("panel alan adında Borçlar: yetkiliye açık, yetkisize 403; /api/borc çerezle bile kapalı", async () => {
  const { env } = ortam();
  const yetkili = (await giris(env, PANEL, "yetkili")).ilk;
  const siradan = (await giris(env, PANEL, "siradan")).ilk;
  const veri = await iste(env, `https://${PANEL}/api/balim/borc/veri`, { baslik: { cookie: yetkili } });
  assert.equal(veri.durum, 200, veri.metin.slice(0, 100));
  assert.equal(JSON.parse(veri.metin).ok, true);
  assert.equal((await iste(env, `https://${PANEL}/api/balim/borc/veri`, { baslik: { cookie: siradan } })).durum, 403);
  assert.equal((await iste(env, `https://${PANEL}/api/balim/borc/veri`)).durum, 401);
  // Kişisel /borc API'si bu alan adında hiç yok: oturum çerezi ne olursa olsun 404.
  assert.equal((await iste(env, `https://${PANEL}/api/borc/veri`, { baslik: { cookie: yetkili } })).durum, 404);
});

test("yazma isteğinin Origin denetimi panel alan adına göre: kendi alan adı geçer, başkası 403", async () => {
  const { env } = ortam();
  const cerez = (await giris(env, PANEL, "yetkili")).ilk;
  const yaz = (origin) => iste(env, `https://${PANEL}/api/balim/borc/kur`, { yontem: "PUT", govde: { usdTry: 40 }, baslik: { cookie: cerez, ...(origin ? { origin } : {}) } });
  assert.equal((await yaz(`https://${PANEL}`)).durum, 200, "panel alan adının kendi Origin'i geçmeli");
  assert.equal((await yaz("https://mgumrah.com")).durum, 403, "mgumrah.com sayfasından panel alan adına yazma kabul edilmemeli");
  assert.equal((await yaz("https://baska-site.example")).durum, 403);
  assert.equal((await yaz(null)).durum, 200, "Origin'siz (tarayıcı dışı) istek çerezle geçer, eskisi gibi");
});

test("çerez alan adlarına karışmaz: panel alan adında alınan oturum mgumrah.com isteğinde gönderilse de kendi çerezidir", async () => {
  // Tarayıcı çerezi host-only tuttuğu için iki alan adı birbirinin çerezini göremez; sunucu tarafında ise oturum
  // anahtarı aynı D1 tablosunda olduğundan çerez değeri ikisinde de geçerlidir. Burada bilinçli olarak
  // belgelenen davranış: ayrı giriş gerekir, ama aynı hesap ikisinde de çalışır.
  const { env } = ortam();
  const panel = await giris(env, PANEL, "yetkili");
  const ana = await giris(env, "mgumrah.com", "yetkili");
  assert.notEqual(panel.ilk, ana.ilk, "her giriş kendi oturum anahtarını almalı");
  assert.equal((await iste(env, "https://mgumrah.com/api/balim/borc/veri", { baslik: { cookie: ana.ilk } })).durum, 200);
  assert.equal((await iste(env, `https://${PANEL}/api/balim/borc/veri`, { baslik: { cookie: panel.ilk } })).durum, 200);
});
