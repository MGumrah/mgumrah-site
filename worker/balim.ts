/**
 * mgumrah.com/balim — Balım kafe hazırlık panelinin API'si.
 *
 * Sayfanın kendisi statik (app/balim); dört kişinin paylaştığı her şey —
 * alınacaklar, işler, giderler, fotoğraflar — buradan geçer. Kayıtlar D1'de,
 * fotoğrafların kendisi R2'de. Oturum açmadan erişilen yalnızca giriş ekranının
 * ihtiyacı olan iki uç var: kişi listesi ve girişin kendisi.
 *
 * Her yazma işlemi aynı toplu sorguda bir "etkinlik" satırı da yazar; o
 * tablonun en büyük id'si verinin sürümüdür. Açık sayfalar birkaç saniyede bir
 * yalnızca bu sayıyı sorar ve değiştiyse her şeyi yeniden çeker: annenin
 * eklediği kalem, babanın açık duran ekranına yenilemeden düşer.
 *
 * Tipler index.ts'teki gerekçeyle satır içinde: dosya Next projesinin
 * tsconfig'inde duruyor ve workers-types ile DOM tipleri çakışıyor.
 */

import {
  GORSEL_TURLERI,
  SINIR,
  ayYazisi,
  linkDuzelt,
  tarihYazisi,
  tl,
  type Alinacak,
  type Etkinlik,
  type EtkinlikTuru,
  type Gider,
  type Gorsel,
  type Kisi,
  type Link,
  type Odeme,
  type Veri,
  type Yapilacak
} from "../app/balim/ortak";

type D1Deger = string | number | null;

type D1Sonuc<T> = { results: T[]; meta: { changes: number } };

type D1Sorgu = {
  bind(...degerler: D1Deger[]): D1Sorgu;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Sonuc<T>>;
  run(): Promise<D1Sonuc<unknown>>;
};

type D1Veritabani = {
  prepare(sql: string): D1Sorgu;
  batch(sorgular: D1Sorgu[]): Promise<D1Sonuc<unknown>[]>;
};

type R2Nesne = {
  body: ReadableStream;
  httpEtag: string;
  size: number;
  httpMetadata?: { contentType?: string };
};

type R2Kova = {
  get(anahtar: string): Promise<R2Nesne | null>;
  put(anahtar: string, deger: ArrayBuffer, secenek?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(anahtarlar: string | string[]): Promise<void>;
};

export type BalimEnv = {
  BALIM_DB: D1Veritabani;
  BALIM_GORSELLER: R2Kova;
};

const CEREZ = "balim_oturum";
/** Çerez yalnızca API'ye gider; sayfanın kendisi statik ve çereze ihtiyacı yok. */
const CEREZ_YOLU = "/api/balim";
/** Chrome çerez ömrünü 400 günde kesiyor. Her kullanımda tazelendiği için bu süre "bir yıl hiç açılmazsa" demek. */
const OTURUM_OMRU_SN = 400 * 24 * 60 * 60;
/** Oturum en fazla günde bir tazelenir — her istekte D1'e yazmamak için. */
const TAZELEME_MS = 24 * 60 * 60 * 1000;
/** Workers'ın Web Crypto'su PBKDF2'de 100.000 turun üstüne çıkmıyor. */
const PBKDF2_TUR = 100_000;
const GIRIS_DENEME_SINIRI = 10;
const GIRIS_PENCERESI_MS = 15 * 60 * 1000;

const simdi = () => new Date().toISOString();

/** Kullanıcıya olduğu gibi gösterilecek bir doğrulama hatası. */
class GecersizGirdi extends Error {}

function json(govde: unknown, durum = 200, basliklar: Record<string, string> = {}) {
  return new Response(JSON.stringify(govde), {
    status: durum,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      ...basliklar
    }
  });
}

const hata = (durum: number, mesaj: string, basliklar?: Record<string, string>) =>
  json({ ok: false, hata: mesaj }, durum, basliklar);

/* ── Şifre ve oturum ───────────────────────────────────────────────────── */

function base64(bayt: Uint8Array) {
  let ikili = "";
  for (const b of bayt) ikili += String.fromCharCode(b);
  return btoa(ikili);
}

const base64Coz = (metin: string) => Uint8Array.from(atob(metin), (c) => c.charCodeAt(0));

async function sha256Hex(metin: string) {
  const ozet = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(metin));
  return [...new Uint8Array(ozet)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function pbkdf2(sifre: string, tuz: Uint8Array<ArrayBuffer>, tur: number) {
  const anahtar = await crypto.subtle.importKey("raw", new TextEncoder().encode(sifre), "PBKDF2", false, [
    "deriveBits"
  ]);
  const bitler = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: tuz, iterations: tur, hash: "SHA-256" }, anahtar, 256);
  return new Uint8Array(bitler);
}

/** Uzunluktan bağımsız süren karşılaştırma: erken dönen bir eşitlik hash'i hane hane ele verir. */
function esit(a: string, b: string) {
  if (a.length !== b.length) return false;
  let fark = 0;
  for (let i = 0; i < a.length; i += 1) fark |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return fark === 0;
}

/** Biçim scripts/balim-kullanici.mjs ile aynı olmak zorunda: "pbkdf2-sha256$tur$tuz$hash". */
async function sifreHashle(sifre: string) {
  const tuz = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256$${PBKDF2_TUR}$${base64(tuz)}$${base64(await pbkdf2(sifre, tuz, PBKDF2_TUR))}`;
}

async function sifreDogrula(sifre: string, kayitli: string) {
  const [yontem, turMetni, tuz, hash] = kayitli.split("$");
  const tur = Number(turMetni);
  if (yontem !== "pbkdf2-sha256" || !Number.isInteger(tur) || tur < 1 || tur > PBKDF2_TUR || !tuz || !hash) return false;
  return esit(base64(await pbkdf2(sifre, base64Coz(tuz), tur)), hash);
}

function cerezOku(request: Request) {
  for (const parca of (request.headers.get("cookie") ?? "").split(";")) {
    const [ad, ...deger] = parca.trim().split("=");
    if (ad === CEREZ) return deger.join("=");
  }
  return null;
}

const oturumCerezi = (jeton: string) =>
  `${CEREZ}=${jeton}; Path=${CEREZ_YOLU}; Max-Age=${OTURUM_OMRU_SN}; HttpOnly; Secure; SameSite=Lax`;

const cerezSil = `${CEREZ}=; Path=${CEREZ_YOLU}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

type Oturum = { ben: Kisi; anahtar: string; jeton: string; tazele: boolean };

async function oturumBul(request: Request, db: D1Veritabani): Promise<Oturum | null> {
  const jeton = cerezOku(request);
  if (!jeton || jeton.length > 128) return null;

  const anahtar = await sha256Hex(jeton);
  const satir = await db
    .prepare(
      `SELECT k.id, k.kullanici_adi, k.ad, o.son_gorulme
         FROM oturumlar o JOIN kullanicilar k ON k.id = o.kullanici_id
        WHERE o.anahtar = ?`
    )
    .bind(anahtar)
    .first<{ id: number; kullanici_adi: string; ad: string; son_gorulme: string }>();
  if (!satir) return null;

  const gecen = Date.now() - Date.parse(satir.son_gorulme);
  if (gecen > OTURUM_OMRU_SN * 1000) {
    await db.prepare("DELETE FROM oturumlar WHERE anahtar = ?").bind(anahtar).run();
    return null;
  }

  const tazele = gecen > TAZELEME_MS;
  if (tazele) await db.prepare("UPDATE oturumlar SET son_gorulme = ? WHERE anahtar = ?").bind(simdi(), anahtar).run();

  return { ben: { id: satir.id, kullaniciAdi: satir.kullanici_adi, ad: satir.ad }, anahtar, jeton, tazele };
}

/** "Anne", " ANNE " → "anne". Kişi düğmeden seçildiği için çoğunlukla zaten temiz gelir. */
export function kullaniciAdiDuzelt(ad: string) {
  return ad
    .trim()
    .replace(/[İIı]/g, "i")
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9._-]/g, "");
}

async function girisYap(request: Request, db: D1Veritabani) {
  const ip = request.headers.get("cf-connecting-ip") ?? "yerel";
  const pencere = new Date(Date.now() - GIRIS_PENCERESI_MS).toISOString();
  const deneme = await db
    .prepare("SELECT COUNT(*) AS sayi FROM giris_denemeleri WHERE ip = ? AND zaman > ?")
    .bind(ip, pencere)
    .first<{ sayi: number }>();
  if ((deneme?.sayi ?? 0) >= GIRIS_DENEME_SINIRI) {
    return hata(429, "Çok fazla hatalı deneme oldu. 15 dakika sonra tekrar deneyin.");
  }

  const govde = await govdeOku(request);
  const kullaniciAdi = typeof govde.kullaniciAdi === "string" ? kullaniciAdiDuzelt(govde.kullaniciAdi) : "";
  const sifre = typeof govde.sifre === "string" ? govde.sifre : "";
  if (!kullaniciAdi || !sifre) return hata(400, "Kişiyi seçip şifreyi yazın.");

  const kisi = await db
    .prepare("SELECT id, sifre FROM kullanicilar WHERE kullanici_adi = ?")
    .bind(kullaniciAdi)
    .first<{ id: number; sifre: string }>();

  if (!kisi || sifre.length > SINIR.sifreEnFazla || !(await sifreDogrula(sifre, kisi.sifre))) {
    await db.prepare("INSERT INTO giris_denemeleri (ip, zaman) VALUES (?, ?)").bind(ip, simdi()).run();
    return hata(401, "Şifre yanlış.");
  }

  const jeton = base64(crypto.getRandomValues(new Uint8Array(32)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const zaman = simdi();

  await db.batch([
    db
      .prepare("INSERT INTO oturumlar (anahtar, kullanici_id, olusturuldu, son_gorulme, cihaz) VALUES (?, ?, ?, ?, ?)")
      .bind(await sha256Hex(jeton), kisi.id, zaman, zaman, (request.headers.get("user-agent") ?? "").slice(0, 200)),
    // Temizlik giriş anında yapılıyor: ayrı bir zamanlanmış görev gerektirmeyecek kadar seyrek iş.
    db.prepare("DELETE FROM giris_denemeleri WHERE ip = ? OR zaman < ?").bind(ip, pencere),
    db
      .prepare("DELETE FROM oturumlar WHERE son_gorulme < ?")
      .bind(new Date(Date.now() - OTURUM_OMRU_SN * 1000).toISOString())
  ]);

  return json({ ok: true }, 200, { "set-cookie": oturumCerezi(jeton) });
}

/* ── Okuma ─────────────────────────────────────────────────────────────── */

type AlinacakSatiri = {
  id: number;
  ad: string;
  kategori: string;
  adet: number;
  birim_fiyat: number | null;
  linkler: string;
  aciklama: string;
  alindi: number;
  alinma_zamani: string | null;
  ekleyen_id: number | null;
  olusturuldu: string;
  guncellendi: string;
};

type YapilacakSatiri = {
  id: number;
  baslik: string;
  aciklama: string;
  son_tarih: string | null;
  sorumlu_id: number | null;
  tamamlandi: number;
  tamamlanma_zamani: string | null;
  ekleyen_id: number | null;
  olusturuldu: string;
  guncellendi: string;
};

type GiderSatiri = {
  id: number;
  ad: string;
  tutar: number;
  baslangic: string;
  bitis: string | null;
  odeme_gunu: number;
  ekleyen_id: number | null;
  olusturuldu: string;
  guncellendi: string;
};

type OdemeSatiri = {
  id: number;
  gider_id: number;
  ay: string;
  tutar: number;
  odeme_tarihi: string;
  odeyen_id: number | null;
  olusturuldu: string;
};

type GorselSatiri = {
  id: string;
  baslik: string;
  kategori: string;
  tur: string;
  boyut: number;
  genislik: number | null;
  yukseklik: number | null;
  kucuk_var: number;
  ekleyen_id: number | null;
  olusturuldu: string;
};

type EtkinlikSatiri = {
  id: number;
  kullanici_id: number | null;
  tur: EtkinlikTuru;
  eylem: string;
  metin: string;
  zaman: string;
};

function linkleriCoz(metin: string): Link[] {
  try {
    const liste = JSON.parse(metin) as unknown;
    return Array.isArray(liste) ? (liste as Link[]) : [];
  } catch {
    return [];
  }
}

async function veriGetir(db: D1Veritabani, ben: Kisi): Promise<Veri> {
  const [kisiler, alinacaklar, yapilacaklar, giderler, odemeler, gorseller, ayarlar, etkinlikler] = (await db.batch([
    db.prepare("SELECT id, kullanici_adi, ad FROM kullanicilar ORDER BY id"),
    db.prepare("SELECT * FROM alinacaklar ORDER BY id"),
    db.prepare("SELECT * FROM yapilacaklar ORDER BY id"),
    db.prepare("SELECT * FROM giderler ORDER BY id"),
    db.prepare("SELECT * FROM odemeler ORDER BY ay, id"),
    db.prepare("SELECT * FROM gorseller ORDER BY olusturuldu DESC"),
    db.prepare("SELECT anahtar, deger FROM ayarlar"),
    db.prepare("SELECT * FROM etkinlikler ORDER BY id DESC LIMIT 40")
  ])) as [
    D1Sonuc<{ id: number; kullanici_adi: string; ad: string }>,
    D1Sonuc<AlinacakSatiri>,
    D1Sonuc<YapilacakSatiri>,
    D1Sonuc<GiderSatiri>,
    D1Sonuc<OdemeSatiri>,
    D1Sonuc<GorselSatiri>,
    D1Sonuc<{ anahtar: string; deger: string }>,
    D1Sonuc<EtkinlikSatiri>
  ];

  const kisiListesi: Kisi[] = kisiler.results.map((k) => ({ id: k.id, kullaniciAdi: k.kullanici_adi, ad: k.ad }));
  const ayar = new Map(ayarlar.results.map((a) => [a.anahtar, a.deger]));

  return {
    // Oturum bu istekten önce okundu; ad aynı istekte değiştiyse güncel hâli listede.
    ben: kisiListesi.find((k) => k.id === ben.id) ?? ben,
    kisiler: kisiListesi,
    alinacaklar: alinacaklar.results.map(
      (s): Alinacak => ({
        id: s.id,
        ad: s.ad,
        kategori: s.kategori,
        adet: s.adet,
        birimFiyat: s.birim_fiyat,
        linkler: linkleriCoz(s.linkler),
        aciklama: s.aciklama,
        alindi: s.alindi === 1,
        alinmaZamani: s.alinma_zamani,
        ekleyenId: s.ekleyen_id,
        olusturuldu: s.olusturuldu,
        guncellendi: s.guncellendi
      })
    ),
    yapilacaklar: yapilacaklar.results.map(
      (s): Yapilacak => ({
        id: s.id,
        baslik: s.baslik,
        aciklama: s.aciklama,
        sonTarih: s.son_tarih,
        sorumluId: s.sorumlu_id,
        tamamlandi: s.tamamlandi === 1,
        tamamlanmaZamani: s.tamamlanma_zamani,
        ekleyenId: s.ekleyen_id,
        olusturuldu: s.olusturuldu,
        guncellendi: s.guncellendi
      })
    ),
    giderler: giderler.results.map(
      (s): Gider => ({
        id: s.id,
        ad: s.ad,
        tutar: s.tutar,
        baslangic: s.baslangic,
        bitis: s.bitis,
        odemeGunu: s.odeme_gunu,
        ekleyenId: s.ekleyen_id,
        olusturuldu: s.olusturuldu,
        guncellendi: s.guncellendi
      })
    ),
    odemeler: odemeler.results.map(
      (s): Odeme => ({
        id: s.id,
        giderId: s.gider_id,
        ay: s.ay,
        tutar: s.tutar,
        odemeTarihi: s.odeme_tarihi,
        odeyenId: s.odeyen_id,
        olusturuldu: s.olusturuldu
      })
    ),
    gorseller: gorseller.results.map(
      (s): Gorsel => ({
        id: s.id,
        baslik: s.baslik,
        kategori: s.kategori,
        tur: s.tur,
        boyut: s.boyut,
        genislik: s.genislik,
        yukseklik: s.yukseklik,
        kucukVar: s.kucuk_var === 1,
        ekleyenId: s.ekleyen_id,
        olusturuldu: s.olusturuldu
      })
    ),
    ayarlar: { acilisTarihi: ayar.get("acilis_tarihi") ?? null },
    etkinlikler: etkinlikler.results.map(
      (s): Etkinlik => ({
        id: s.id,
        kullaniciId: s.kullanici_id,
        tur: s.tur,
        eylem: s.eylem,
        metin: s.metin,
        zaman: s.zaman
      })
    ),
    surum: etkinlikler.results[0]?.id ?? 0
  };
}

/* ── Girdi okuma ───────────────────────────────────────────────────────── */

type Govde = Record<string, unknown>;
type Alanlar = Record<string, D1Deger>;

async function govdeOku(request: Request): Promise<Govde> {
  try {
    const govde = (await request.json()) as unknown;
    if (govde && typeof govde === "object" && !Array.isArray(govde)) return govde as Govde;
  } catch {
    // Aşağıda boş gövde gibi ele alınır; eksik alan zaten kendi hatasını verir.
  }
  return {};
}

function metin(deger: unknown, enFazla: number) {
  if (deger === undefined || deger === null) return "";
  if (typeof deger !== "string") throw new GecersizGirdi("Alanlardan biri okunamadı.");
  return deger.trim().slice(0, enFazla);
}

function doluMetin(deger: unknown, enFazla: number, bosIse: string) {
  const sonuc = metin(deger, enFazla);
  if (!sonuc) throw new GecersizGirdi(bosIse);
  return sonuc;
}

function tamSayi(deger: unknown, enAz: number, enFazla: number, gecersizIse: string) {
  if (typeof deger !== "number" || !Number.isInteger(deger) || deger < enAz || deger > enFazla) {
    throw new GecersizGirdi(gecersizIse);
  }
  return deger;
}

function gunOku(deger: unknown) {
  if (typeof deger !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(deger)) throw new GecersizGirdi("Tarih okunamadı.");
  const [y, a, g] = deger.split("-").map(Number);
  const tarih = new Date(Date.UTC(y, a - 1, g));
  if (tarih.getUTCFullYear() !== y || tarih.getUTCMonth() !== a - 1 || tarih.getUTCDate() !== g) {
    throw new GecersizGirdi("Tarih okunamadı.");
  }
  return deger;
}

function ayOku(deger: unknown) {
  if (typeof deger !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(deger)) throw new GecersizGirdi("Ay okunamadı.");
  return deger;
}

function idOku(deger: string | undefined) {
  const id = Number(deger);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function linkleriOku(deger: unknown): Link[] {
  if (!Array.isArray(deger)) throw new GecersizGirdi("Linkler okunamadı.");
  const linkler: Link[] = [];
  for (const oge of deger.slice(0, SINIR.linkSayisi)) {
    const kayit = (oge && typeof oge === "object" ? oge : {}) as Govde;
    const ham = metin(kayit.url, SINIR.url + 100);
    if (!ham) continue;
    const url = linkDuzelt(ham);
    if (!url || url.length > SINIR.url) throw new GecersizGirdi(`Bu link açılamıyor: ${ham.slice(0, 60)}`);
    linkler.push({ url, not: metin(kayit.not, SINIR.linkNotu) });
  }
  return linkler;
}

async function kisiVarMi(db: D1Veritabani, id: unknown) {
  if (id === null || id === undefined) return null;
  const kisi = typeof id === "number" ? await db.prepare("SELECT id FROM kullanicilar WHERE id = ?").bind(id).first() : null;
  if (!kisi) throw new GecersizGirdi("Seçilen kişi bulunamadı.");
  return id as number;
}

/* ── Yazma ─────────────────────────────────────────────────────────────── */

/**
 * Sütun adları hep bu dosyadaki alan fonksiyonlarından gelir, istekten asla:
 * SQL'e giren tek dış değer bind edilen parametrelerdir.
 */
function ekle(db: D1Veritabani, tablo: string, alanlar: Alanlar) {
  const sutunlar = Object.keys(alanlar);
  return db
    .prepare(`INSERT INTO ${tablo} (${sutunlar.join(", ")}) VALUES (${sutunlar.map(() => "?").join(", ")})`)
    .bind(...sutunlar.map((s) => alanlar[s]));
}

function guncelle(db: D1Veritabani, tablo: string, id: D1Deger, alanlar: Alanlar) {
  const sutunlar = Object.keys(alanlar);
  return db
    .prepare(`UPDATE ${tablo} SET ${sutunlar.map((s) => `${s} = ?`).join(", ")} WHERE id = ?`)
    .bind(...sutunlar.map((s) => alanlar[s]), id);
}

/** Değişikliği etkinliğiyle aynı toplu sorguda yazar, güncel veriyi döner. */
async function yazVeDon(
  db: D1Veritabani,
  ben: Kisi,
  sorgular: D1Sorgu[],
  etkinlik: { tur: EtkinlikTuru; eylem: string; metin: string }
) {
  await db.batch([
    ...sorgular,
    db
      .prepare("INSERT INTO etkinlikler (kullanici_id, tur, eylem, metin, zaman) VALUES (?, ?, ?, ?, ?)")
      .bind(ben.id, etkinlik.tur, etkinlik.eylem, etkinlik.metin.slice(0, 200), simdi())
  ]);
  return json({ ok: true, veri: await veriGetir(db, ben) });
}

const yokMesaji = "Bu kayıt artık yok — başka biri silmiş olabilir. Sayfa yenilendi.";

function alinacakAlanlari(g: Govde, yeni: boolean): Alanlar {
  const a: Alanlar = {};
  if (yeni || "ad" in g) a.ad = doluMetin(g.ad, SINIR.ad, "Ne alınacağını yazın.");
  if (yeni || "kategori" in g) a.kategori = metin(g.kategori, SINIR.kategori) || "Diğer";
  if (yeni || "adet" in g) a.adet = tamSayi(g.adet ?? 1, 1, SINIR.adet, "Adet 1 ile 100.000 arasında olmalı.");
  if (yeni || "birimFiyat" in g) {
    a.birim_fiyat = g.birimFiyat == null ? null : tamSayi(g.birimFiyat, 0, SINIR.tutar, "Fiyat okunamadı.");
  }
  if (yeni || "linkler" in g) a.linkler = JSON.stringify(linkleriOku(g.linkler ?? []));
  if (yeni || "aciklama" in g) a.aciklama = metin(g.aciklama, SINIR.aciklama);
  if (yeni || "alindi" in g) {
    a.alindi = g.alindi === true ? 1 : 0;
    a.alinma_zamani = g.alindi === true ? simdi() : null;
  }
  return a;
}

async function alinacaklar(request: Request, db: D1Veritabani, ben: Kisi, kimlik: string | undefined) {
  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");
    const a = alinacakAlanlari(await govdeOku(request), true);
    const zaman = simdi();
    return yazVeDon(db, ben, [ekle(db, "alinacaklar", { ...a, ekleyen_id: ben.id, olusturuldu: zaman, guncellendi: zaman })], {
      tur: "alinacak",
      eylem: "listeye ekledi",
      metin: String(a.ad)
    });
  }

  const id = idOku(kimlik);
  const mevcut = id
    ? await db.prepare("SELECT ad, alindi FROM alinacaklar WHERE id = ?").bind(id).first<{ ad: string; alindi: number }>()
    : null;
  if (!id || !mevcut) return hata(404, yokMesaji);

  if (request.method === "PATCH") {
    const a = alinacakAlanlari(await govdeOku(request), false);
    // İşaret değişmediyse "ne zaman alındı" da olduğu gibi kalsın; formu
    // yeniden kaydetmek alınma tarihini bugüne çekmemeli.
    const isaretDegisti = "alindi" in a && a.alindi !== mevcut.alindi;
    if (!isaretDegisti) delete a.alinma_zamani;
    const eylem = isaretDegisti ? (a.alindi === 1 ? "aldı" : "alınmadı olarak işaretledi") : "düzenledi";
    return yazVeDon(db, ben, [guncelle(db, "alinacaklar", id, { ...a, guncellendi: simdi() })], {
      tur: "alinacak",
      eylem,
      metin: String(a.ad ?? mevcut.ad)
    });
  }

  if (request.method === "DELETE") {
    return yazVeDon(db, ben, [db.prepare("DELETE FROM alinacaklar WHERE id = ?").bind(id)], {
      tur: "alinacak",
      eylem: "listeden sildi",
      metin: mevcut.ad
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

async function yapilacakAlanlari(db: D1Veritabani, g: Govde, yeni: boolean): Promise<Alanlar> {
  const a: Alanlar = {};
  if (yeni || "baslik" in g) a.baslik = doluMetin(g.baslik, SINIR.baslik, "Yapılacak işi yazın.");
  if (yeni || "aciklama" in g) a.aciklama = metin(g.aciklama, SINIR.aciklama);
  if (yeni || "sonTarih" in g) a.son_tarih = g.sonTarih == null || g.sonTarih === "" ? null : gunOku(g.sonTarih);
  if (yeni || "sorumluId" in g) a.sorumlu_id = await kisiVarMi(db, g.sorumluId);
  if (yeni || "tamamlandi" in g) {
    a.tamamlandi = g.tamamlandi === true ? 1 : 0;
    a.tamamlanma_zamani = g.tamamlandi === true ? simdi() : null;
  }
  return a;
}

async function yapilacaklar(request: Request, db: D1Veritabani, ben: Kisi, kimlik: string | undefined) {
  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");
    const a = await yapilacakAlanlari(db, await govdeOku(request), true);
    const zaman = simdi();
    return yazVeDon(
      db,
      ben,
      [ekle(db, "yapilacaklar", { ...a, ekleyen_id: ben.id, olusturuldu: zaman, guncellendi: zaman })],
      { tur: "yapilacak", eylem: "iş ekledi", metin: String(a.baslik) }
    );
  }

  const id = idOku(kimlik);
  const mevcut = id
    ? await db
        .prepare("SELECT baslik, tamamlandi FROM yapilacaklar WHERE id = ?")
        .bind(id)
        .first<{ baslik: string; tamamlandi: number }>()
    : null;
  if (!id || !mevcut) return hata(404, yokMesaji);

  if (request.method === "PATCH") {
    const a = await yapilacakAlanlari(db, await govdeOku(request), false);
    const isaretDegisti = "tamamlandi" in a && a.tamamlandi !== mevcut.tamamlandi;
    if (!isaretDegisti) delete a.tamamlanma_zamani;
    const eylem = isaretDegisti ? (a.tamamlandi === 1 ? "tamamladı" : "yeniden açtı") : "işi düzenledi";
    return yazVeDon(db, ben, [guncelle(db, "yapilacaklar", id, { ...a, guncellendi: simdi() })], {
      tur: "yapilacak",
      eylem,
      metin: String(a.baslik ?? mevcut.baslik)
    });
  }

  if (request.method === "DELETE") {
    return yazVeDon(db, ben, [db.prepare("DELETE FROM yapilacaklar WHERE id = ?").bind(id)], {
      tur: "yapilacak",
      eylem: "işi sildi",
      metin: mevcut.baslik
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

function giderAlanlari(g: Govde, yeni: boolean): Alanlar {
  const a: Alanlar = {};
  if (yeni || "ad" in g) a.ad = doluMetin(g.ad, SINIR.giderAdi, "Giderin adını yazın.");
  if (yeni || "tutar" in g) a.tutar = tamSayi(g.tutar, 1, SINIR.tutar, "Aylık tutarı yazın.");
  if (yeni || "baslangic" in g) a.baslangic = ayOku(g.baslangic);
  if (yeni || "bitis" in g) a.bitis = g.bitis == null || g.bitis === "" ? null : ayOku(g.bitis);
  if (yeni || "odemeGunu" in g) a.odeme_gunu = tamSayi(g.odemeGunu ?? 1, 1, 31, "Ödeme günü 1 ile 31 arasında olmalı.");
  return a;
}

async function giderler(request: Request, db: D1Veritabani, ben: Kisi, kimlik: string | undefined) {
  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");
    const a = giderAlanlari(await govdeOku(request), true);
    if (a.bitis && String(a.bitis) < String(a.baslangic)) throw new GecersizGirdi("Bitiş ayı başlangıçtan önce olamaz.");
    const zaman = simdi();
    return yazVeDon(db, ben, [ekle(db, "giderler", { ...a, ekleyen_id: ben.id, olusturuldu: zaman, guncellendi: zaman })], {
      tur: "gider",
      eylem: "gider ekledi",
      metin: `${a.ad} · aylık ${tl(Number(a.tutar))}`
    });
  }

  const id = idOku(kimlik);
  const mevcut = id
    ? await db
        .prepare("SELECT ad, baslangic, bitis FROM giderler WHERE id = ?")
        .bind(id)
        .first<{ ad: string; baslangic: string; bitis: string | null }>()
    : null;
  if (!id || !mevcut) return hata(404, yokMesaji);

  if (request.method === "PATCH") {
    const a = giderAlanlari(await govdeOku(request), false);
    const baslangic = String(a.baslangic ?? mevcut.baslangic);
    const bitis = "bitis" in a ? a.bitis : mevcut.bitis;
    if (bitis && String(bitis) < baslangic) throw new GecersizGirdi("Bitiş ayı başlangıçtan önce olamaz.");
    return yazVeDon(db, ben, [guncelle(db, "giderler", id, { ...a, guncellendi: simdi() })], {
      tur: "gider",
      eylem: "gideri düzenledi",
      metin: String(a.ad ?? mevcut.ad)
    });
  }

  if (request.method === "DELETE") {
    // Ödemeler ON DELETE CASCADE ile birlikte gider.
    return yazVeDon(db, ben, [db.prepare("DELETE FROM giderler WHERE id = ?").bind(id)], {
      tur: "gider",
      eylem: "gideri sildi",
      metin: mevcut.ad
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

async function odemeler(request: Request, db: D1Veritabani, ben: Kisi, kimlik: string | undefined) {
  if (!kimlik) {
    if (request.method !== "PUT") return hata(405, "Desteklenmeyen işlem.");
    const g = await govdeOku(request);
    const giderId = tamSayi(g.giderId, 1, Number.MAX_SAFE_INTEGER, "Gider bulunamadı.");
    const gider = await db.prepare("SELECT ad FROM giderler WHERE id = ?").bind(giderId).first<{ ad: string }>();
    if (!gider) return hata(404, yokMesaji);

    const ay = ayOku(g.ay);
    const tutar = tamSayi(g.tutar, 0, SINIR.tutar, "Ödenen tutarı yazın.");
    const tarih = gunOku(g.odemeTarihi);
    // Kiranın kimin cebinden çıktığı, işareti kimin koyduğundan ayrı: babanın
    // ödediğini telefondan Mehmet işaretleyebilir.
    const odeyenId = "odeyenId" in g ? await kisiVarMi(db, g.odeyenId) : ben.id;

    return yazVeDon(
      db,
      ben,
      [
        db
          .prepare(
            `INSERT INTO odemeler (gider_id, ay, tutar, odeme_tarihi, odeyen_id, olusturuldu)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT (gider_id, ay) DO UPDATE SET
               tutar = excluded.tutar, odeme_tarihi = excluded.odeme_tarihi, odeyen_id = excluded.odeyen_id`
          )
          .bind(giderId, ay, tutar, tarih, odeyenId, simdi())
      ],
      { tur: "odeme", eylem: "ödendi olarak işaretledi", metin: `${gider.ad} · ${ayYazisi(ay)} · ${tl(tutar)}` }
    );
  }

  const id = idOku(kimlik);
  const mevcut = id
    ? await db
        .prepare("SELECT o.ay, g.ad FROM odemeler o JOIN giderler g ON g.id = o.gider_id WHERE o.id = ?")
        .bind(id)
        .first<{ ay: string; ad: string }>()
    : null;
  if (!id || !mevcut) return hata(404, yokMesaji);

  if (request.method === "DELETE") {
    return yazVeDon(db, ben, [db.prepare("DELETE FROM odemeler WHERE id = ?").bind(id)], {
      tur: "odeme",
      eylem: "ödemeyi geri aldı",
      metin: `${mevcut.ad} · ${ayYazisi(mevcut.ay)}`
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

async function gorseller(request: Request, env: BalimEnv, ben: Kisi, kimlik: string | undefined) {
  const db = env.BALIM_DB;

  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return hata(400, "Fotoğraf okunamadı.");
    }

    const dosya = form.get("dosya");
    if (!(dosya instanceof File) || dosya.size === 0) return hata(400, "Fotoğraf seçilmedi.");
    if (!GORSEL_TURLERI.includes(dosya.type)) {
      return hata(415, "Bu dosya türü desteklenmiyor. JPEG, PNG ya da WebP fotoğraf yükleyin.");
    }
    if (dosya.size > SINIR.gorselBayt) return hata(413, "Fotoğraf 15 MB'tan büyük olamaz.");

    const kucuk = form.get("kucuk");
    const kucukUygun =
      kucuk instanceof File && kucuk.size > 0 && kucuk.size <= SINIR.kucukBayt && GORSEL_TURLERI.includes(kucuk.type);

    const olcu = (ad: string) => {
      const deger = Number(form.get(ad));
      return Number.isInteger(deger) && deger > 0 && deger < 100_000 ? deger : null;
    };
    // Metin alanları R2'ye yazmadan önce okunur: bozuk bir alan yüzünden
    // yüklenmiş ama hiçbir kayda bağlanmamış dosya kalmasın.
    const baslik = metin(form.get("baslik"), SINIR.baslik);
    const kategori = metin(form.get("kategori"), SINIR.kategori) || "Diğer";

    const id = crypto.randomUUID();
    const anahtarlar = [`gorseller/${id}`, `gorseller/${id}-kucuk`];
    try {
      await env.BALIM_GORSELLER.put(anahtarlar[0], await dosya.arrayBuffer(), { httpMetadata: { contentType: dosya.type } });
      if (kucukUygun) {
        await env.BALIM_GORSELLER.put(anahtarlar[1], await kucuk.arrayBuffer(), { httpMetadata: { contentType: kucuk.type } });
      }

      return await yazVeDon(
        db,
        ben,
        [
          ekle(db, "gorseller", {
            id,
            baslik,
            kategori,
            tur: dosya.type,
            boyut: dosya.size,
            genislik: olcu("genislik"),
            yukseklik: olcu("yukseklik"),
            kucuk_var: kucukUygun ? 1 : 0,
            ekleyen_id: ben.id,
            olusturuldu: simdi()
          })
        ],
        { tur: "gorsel", eylem: "görsel yükledi", metin: baslik || kategori }
      );
    } catch (e) {
      await env.BALIM_GORSELLER.delete(anahtarlar).catch(() => undefined);
      throw e;
    }
  }

  if (!/^[0-9a-f-]{36}$/.test(kimlik)) return hata(404, yokMesaji);

  if (request.method === "GET") {
    // D1'e sorulmuyor: silinen görselin R2'deki dosyası da silindiği için
    // yokluk burada zaten ortaya çıkıyor, ızgaradaki her kare bir sorgu eksik.
    const kucukIstendi = new URL(request.url).searchParams.get("boyut") === "kucuk";
    const nesne =
      (kucukIstendi ? await env.BALIM_GORSELLER.get(`gorseller/${kimlik}-kucuk`) : null) ??
      (await env.BALIM_GORSELLER.get(`gorseller/${kimlik}`));
    if (!nesne) return new Response("Bulunamadı", { status: 404, headers: { "cache-control": "no-store" } });

    return new Response(nesne.body, {
      headers: {
        "content-type": nesne.httpMetadata?.contentType ?? "application/octet-stream",
        "content-length": String(nesne.size),
        // Aynı id'nin içeriği hiç değişmez; "private" çünkü yalnızca oturum açan görebilir.
        "cache-control": "private, max-age=31536000, immutable",
        etag: nesne.httpEtag,
        "x-content-type-options": "nosniff"
      }
    });
  }

  const mevcut = await db.prepare("SELECT baslik, kategori FROM gorseller WHERE id = ?").bind(kimlik).first<{
    baslik: string;
    kategori: string;
  }>();
  if (!mevcut) return hata(404, yokMesaji);

  if (request.method === "PATCH") {
    const g = await govdeOku(request);
    const a: Alanlar = {};
    if ("baslik" in g) a.baslik = metin(g.baslik, SINIR.baslik);
    if ("kategori" in g) a.kategori = metin(g.kategori, SINIR.kategori) || "Diğer";
    if (!Object.keys(a).length) return hata(400, "Değişiklik yok.");
    return yazVeDon(db, ben, [guncelle(db, "gorseller", kimlik, a)], {
      tur: "gorsel",
      eylem: "görseli düzenledi",
      metin: String(a.baslik ?? mevcut.baslik) || String(a.kategori ?? mevcut.kategori)
    });
  }

  if (request.method === "DELETE") {
    await env.BALIM_GORSELLER.delete([`gorseller/${kimlik}`, `gorseller/${kimlik}-kucuk`]);
    return yazVeDon(db, ben, [db.prepare("DELETE FROM gorseller WHERE id = ?").bind(kimlik)], {
      tur: "gorsel",
      eylem: "görseli sildi",
      metin: mevcut.baslik || mevcut.kategori
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

async function ayarlar(request: Request, db: D1Veritabani, ben: Kisi) {
  if (request.method !== "PATCH") return hata(405, "Desteklenmeyen işlem.");
  const g = await govdeOku(request);
  if (!("acilisTarihi" in g)) return hata(400, "Değişiklik yok.");

  if (g.acilisTarihi == null || g.acilisTarihi === "") {
    return yazVeDon(db, ben, [db.prepare("DELETE FROM ayarlar WHERE anahtar = 'acilis_tarihi'")], {
      tur: "ayar",
      eylem: "açılış tarihini kaldırdı",
      metin: "Açılış tarihi"
    });
  }

  const tarih = gunOku(g.acilisTarihi);
  return yazVeDon(
    db,
    ben,
    [
      db
        .prepare(
          "INSERT INTO ayarlar (anahtar, deger) VALUES ('acilis_tarihi', ?) ON CONFLICT (anahtar) DO UPDATE SET deger = excluded.deger"
        )
        .bind(tarih)
    ],
    { tur: "ayar", eylem: "açılış tarihini belirledi", metin: tarihYazisi(tarih) }
  );
}

async function hesap(request: Request, db: D1Veritabani, ben: Kisi) {
  if (request.method !== "PATCH") return hata(405, "Desteklenmeyen işlem.");
  const g = await govdeOku(request);

  if ("yeniSifre" in g) {
    const mevcut = typeof g.mevcutSifre === "string" ? g.mevcutSifre : "";
    const yeni = typeof g.yeniSifre === "string" ? g.yeniSifre : "";
    const kayit = await db.prepare("SELECT sifre FROM kullanicilar WHERE id = ?").bind(ben.id).first<{ sifre: string }>();
    if (!kayit || mevcut.length > SINIR.sifreEnFazla || !(await sifreDogrula(mevcut, kayit.sifre))) {
      return hata(400, "Şu anki şifre yanlış.");
    }
    if (yeni.length < SINIR.sifreEnAz) return hata(400, `Yeni şifre en az ${SINIR.sifreEnAz} karakter olmalı.`);
    if (yeni.length > SINIR.sifreEnFazla) return hata(400, "Yeni şifre çok uzun.");

    // Diğer cihazlardaki oturumlar bilerek açık kalıyor: panelin sözü "bir kez
    // giriş yap, bir daha sorulmasın". Şifreyi değiştiren çoğu zaman üretilen
    // şifreyi kendi seçtiğiyle değiştiriyor, tabletteki girişi düşürmek istemiyor.
    await db.prepare("UPDATE kullanicilar SET sifre = ? WHERE id = ?").bind(await sifreHashle(yeni), ben.id).run();
    return json({ ok: true, veri: await veriGetir(db, ben) });
  }

  if ("ad" in g) {
    const ad = doluMetin(g.ad, SINIR.kisiAdi, "Adınızı yazın.");
    return yazVeDon(db, ben, [db.prepare("UPDATE kullanicilar SET ad = ? WHERE id = ?").bind(ad, ben.id)], {
      tur: "kisi",
      eylem: "adını değiştirdi",
      metin: `${ben.ad} → ${ad}`
    });
  }

  return hata(400, "Değişiklik yok.");
}

/* ── Giriş noktası ─────────────────────────────────────────────────────── */

/**
 * Yazan her isteğin bu siteden geldiğinden emin olur. SameSite=Lax çerez başka
 * siteden gelen POST'a zaten eklenmez; bu ikinci kilit. Origin hiç yoksa
 * (curl gibi) tarayıcı dışı bir istemcidir ve çerezi yoksa zaten içeri giremez.
 */
function ayniKaynak(request: Request) {
  const kaynak = request.headers.get("origin");
  if (!kaynak) return true;
  try {
    return new URL(kaynak).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

/** `/api/balim/...` altındaki her istek. `yol` sondaki eğik çizgisi atılmış hâl. */
export async function balimApi(request: Request, env: BalimEnv, yol: string): Promise<Response> {
  const db = env.BALIM_DB;
  const [kaynak = "", kimlik] = yol.split("/").slice(3);
  const yontem = request.method;

  if (yontem !== "GET" && yontem !== "HEAD" && !ayniKaynak(request)) return hata(403, "İzin verilmedi.");

  try {
    if (kaynak === "kisiler" && yontem === "GET") {
      const kisiler = await db.prepare("SELECT id, kullanici_adi, ad FROM kullanicilar ORDER BY id").all<{
        id: number;
        kullanici_adi: string;
        ad: string;
      }>();
      return json({ ok: true, kisiler: kisiler.results.map((k) => ({ id: k.id, kullaniciAdi: k.kullanici_adi, ad: k.ad })) });
    }

    if (kaynak === "giris" && yontem === "POST") return await girisYap(request, db);

    const oturum = await oturumBul(request, db);
    if (!oturum) return hata(401, "Oturum kapalı. Tekrar giriş yapın.", { "set-cookie": cerezSil });

    const { ben } = oturum;
    let yanit: Response;

    switch (kaynak) {
      case "veri":
        yanit = yontem === "GET" ? json({ ok: true, veri: await veriGetir(db, ben) }) : hata(405, "Desteklenmeyen işlem.");
        break;
      case "surum": {
        const satir = await db.prepare("SELECT MAX(id) AS surum FROM etkinlikler").first<{ surum: number | null }>();
        yanit = json({ ok: true, surum: satir?.surum ?? 0 });
        break;
      }
      case "cikis":
        if (yontem !== "POST") return hata(405, "Desteklenmeyen işlem.");
        await db.prepare("DELETE FROM oturumlar WHERE anahtar = ?").bind(oturum.anahtar).run();
        return json({ ok: true }, 200, { "set-cookie": cerezSil });
      case "alinacaklar":
        yanit = await alinacaklar(request, db, ben, kimlik);
        break;
      case "yapilacaklar":
        yanit = await yapilacaklar(request, db, ben, kimlik);
        break;
      case "giderler":
        yanit = await giderler(request, db, ben, kimlik);
        break;
      case "odemeler":
        yanit = await odemeler(request, db, ben, kimlik);
        break;
      case "gorseller":
        yanit = await gorseller(request, env, ben, kimlik);
        break;
      case "ayarlar":
        yanit = await ayarlar(request, db, ben);
        break;
      case "hesap":
        yanit = await hesap(request, db, ben);
        break;
      default:
        yanit = hata(404, "Bulunamadı.");
    }

    if (oturum.tazele) yanit.headers.append("set-cookie", oturumCerezi(oturum.jeton));
    return yanit;
  } catch (e) {
    if (e instanceof GecersizGirdi) return hata(400, e.message);
    console.error("balim", yontem, yol, e);
    return hata(500, "Sunucuda bir sorun oluştu. Biraz sonra tekrar deneyin.");
  }
}

/**
 * Aile adresi "mgumrah.com/balım" diye yazıyor; sayfa ise ASCII /balim/ yolunda
 * duruyor (ı'lı klasör adı hem statik dışa aktarımda hem WhatsApp'ın link
 * tanımasında dert). Büyük harfli ve ı'lı bütün yazılışlar oraya döner.
 */
export function balimYonlendirmesi(url: URL): Response | null {
  if (url.pathname === "/balim/") return null;
  let yol: string;
  try {
    yol = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  const sade = yol.replace(/\/+$/, "").replace(/[İIı]/g, "i").toLowerCase();
  return sade === "/balim" ? Response.redirect(new URL("/balim/", url).toString(), 301) : null;
}
