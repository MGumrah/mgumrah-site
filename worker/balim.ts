/**
 * mgumrah.com/balim — Balım kafe hazırlık panelinin API'si.
 *
 * Sayfanın kendisi statik (app/balim); dört kişinin paylaştığı her şey —
 * alınacaklar, işler, giderler, fotoğraflar, sohbet — buradan geçer. Kayıtlar
 * D1'de, fotoğrafların kendisi R2'de. Oturum açmadan erişilen yalnızca giriş
 * ekranının ihtiyacı olan iki uç var: kişi listesi ve girişin kendisi.
 *
 * Her yazma işlemi aynı toplu sorguda bir "etkinlik" satırı da yazar; o
 * tablonun en büyük id'si verinin sürümüdür. Açık sayfalar birkaç saniyede bir
 * yalnızca bu sayıyı (ve en son mesajın id'sini) sorar, değiştiyse yeniden
 * çeker: annenin eklediği kalem, babanın açık duran ekranına yenilemeden düşer.
 * Telefonu cebinde olana da aynı değişiklik web push bildirimi olarak gider.
 *
 * Tipler index.ts'teki gerekçeyle satır içinde: dosya Next projesinin
 * tsconfig'inde duruyor ve workers-types ile DOM tipleri çakışıyor.
 */

import {
  GORSEL_TURLERI,
  SINIR,
  SOHBET_KATEGORISI,
  VARSAYILAN_TERCIHLER,
  ayYazisi,
  kisaTarih,
  linkDuzelt,
  tarihYazisi,
  tl,
  type Alinacak,
  type BildirimTercihleri,
  type Etkinlik,
  type EtkinlikTuru,
  type Gider,
  type Gorsel,
  type Kisi,
  type Link,
  type Mesaj,
  type Odeme,
  type Surum,
  type Veri,
  type Yapilacak
} from "../app/balim/ortak";
import { vadesiGelenAylar } from "../app/balim/toplamlar";
import { gunEkle, gunFarki, istanbulGunu } from "../app/balim/zaman";
import { pushGonder, type VapidAnahtarlari } from "./web-push";

type D1Deger = string | number | null;

type D1Sonuc<T> = { results: T[]; meta: { changes?: number; last_row_id?: number } };

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

type IsBaglami = { waitUntil(is: Promise<unknown>): void };

export type BalimEnv = {
  BALIM_DB: D1Veritabani;
  BALIM_GORSELLER: R2Kova;
  /**
   * `node scripts/balim-vapid.mjs` üretir, `wrangler secret put` ile girilir.
   * İkisi birden yoksa bildirim özelliği kapalı sayılır; panel çalışmaya devam eder.
   */
  BALIM_VAPID_ACIK?: string;
  BALIM_VAPID_OZEL?: string;
};

/** Bir isteğin bütün handler'lara taşınan hâli. */
type Istek = { request: Request; env: BalimEnv; db: D1Veritabani; ben: Kisi; ctx: IsBaglami };

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
/** Sohbet ilk açıldığında ve "önceki mesajlar"da bir seferde gelen mesaj. */
const MESAJ_SAYFASI = 50;

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

type MesajSatiri = {
  id: number;
  kullanici_id: number | null;
  metin: string;
  gorsel_id: string | null;
  genislik: number | null;
  yukseklik: number | null;
  olusturuldu: string;
};

function linkleriCoz(metin: string): Link[] {
  try {
    const liste = JSON.parse(metin) as unknown;
    return Array.isArray(liste) ? (liste as Link[]) : [];
  } catch {
    return [];
  }
}

const alinacakDonustur = (s: AlinacakSatiri): Alinacak => ({
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
});

const yapilacakDonustur = (s: YapilacakSatiri): Yapilacak => ({
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
});

const giderDonustur = (s: GiderSatiri): Gider => ({
  id: s.id,
  ad: s.ad,
  tutar: s.tutar,
  baslangic: s.baslangic,
  bitis: s.bitis,
  odemeGunu: s.odeme_gunu,
  ekleyenId: s.ekleyen_id,
  olusturuldu: s.olusturuldu,
  guncellendi: s.guncellendi
});

const odemeDonustur = (s: OdemeSatiri): Odeme => ({
  id: s.id,
  giderId: s.gider_id,
  ay: s.ay,
  tutar: s.tutar,
  odemeTarihi: s.odeme_tarihi,
  odeyenId: s.odeyen_id,
  olusturuldu: s.olusturuldu
});

const gorselDonustur = (s: GorselSatiri): Gorsel => ({
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
});

const etkinlikDonustur = (s: EtkinlikSatiri): Etkinlik => ({
  id: s.id,
  kullaniciId: s.kullanici_id,
  tur: s.tur,
  eylem: s.eylem,
  metin: s.metin,
  zaman: s.zaman
});

const mesajDonustur = (s: MesajSatiri): Mesaj => ({
  id: s.id,
  kullaniciId: s.kullanici_id,
  metin: s.metin,
  gorsel: s.gorsel_id ? { id: s.gorsel_id, genislik: s.genislik, yukseklik: s.yukseklik } : null,
  olusturuldu: s.olusturuldu
});

const MESAJ_SORGUSU = `SELECT m.id, m.kullanici_id, m.metin, m.gorsel_id, g.genislik, g.yukseklik, m.olusturuldu
  FROM mesajlar m LEFT JOIN gorseller g ON g.id = m.gorsel_id`;

/** Açık sayfaların birkaç saniyede bir sorduğu üç sayı; üçü de tek satır okuma. */
function surumSorgusu(db: D1Veritabani, kisiId: number) {
  return db
    .prepare(
      `SELECT (SELECT MAX(id) FROM etkinlikler) AS surum,
              (SELECT MAX(id) FROM mesajlar) AS mesaj_surum,
              (SELECT COUNT(*) FROM mesajlar m
                WHERE m.id > k.son_okunan_mesaj AND (m.kullanici_id IS NULL OR m.kullanici_id != k.id)) AS okunmamis
         FROM kullanicilar k WHERE k.id = ?`
    )
    .bind(kisiId);
}

type SurumSatiri = { surum: number | null; mesaj_surum: number | null; okunmamis: number | null };

const surumDonustur = (s: SurumSatiri | undefined | null): Surum => ({
  surum: s?.surum ?? 0,
  mesajSurum: s?.mesaj_surum ?? 0,
  okunmamis: s?.okunmamis ?? 0
});

async function veriGetir(db: D1Veritabani, ben: Kisi): Promise<Veri> {
  const [kisiler, alinacaklar, yapilacaklar, giderler, odemeler, gorseller, ayarlar, etkinlikler, surum] = (await db.batch([
    db.prepare("SELECT id, kullanici_adi, ad FROM kullanicilar ORDER BY id"),
    db.prepare("SELECT * FROM alinacaklar ORDER BY id"),
    db.prepare("SELECT * FROM yapilacaklar ORDER BY id"),
    db.prepare("SELECT * FROM giderler ORDER BY id"),
    db.prepare("SELECT * FROM odemeler ORDER BY ay, id"),
    db.prepare("SELECT * FROM gorseller ORDER BY olusturuldu DESC"),
    db.prepare("SELECT anahtar, deger FROM ayarlar"),
    db.prepare("SELECT * FROM etkinlikler ORDER BY id DESC LIMIT 40"),
    surumSorgusu(db, ben.id)
  ])) as [
    D1Sonuc<{ id: number; kullanici_adi: string; ad: string }>,
    D1Sonuc<AlinacakSatiri>,
    D1Sonuc<YapilacakSatiri>,
    D1Sonuc<GiderSatiri>,
    D1Sonuc<OdemeSatiri>,
    D1Sonuc<GorselSatiri>,
    D1Sonuc<{ anahtar: string; deger: string }>,
    D1Sonuc<EtkinlikSatiri>,
    D1Sonuc<SurumSatiri>
  ];

  const kisiListesi: Kisi[] = kisiler.results.map((k) => ({ id: k.id, kullaniciAdi: k.kullanici_adi, ad: k.ad }));
  const ayar = new Map(ayarlar.results.map((a) => [a.anahtar, a.deger]));

  return {
    // Oturum bu istekten önce okundu; ad aynı istekte değiştiyse güncel hâli listede.
    ben: kisiListesi.find((k) => k.id === ben.id) ?? ben,
    kisiler: kisiListesi,
    alinacaklar: alinacaklar.results.map(alinacakDonustur),
    yapilacaklar: yapilacaklar.results.map(yapilacakDonustur),
    giderler: giderler.results.map(giderDonustur),
    odemeler: odemeler.results.map(odemeDonustur),
    gorseller: gorseller.results.map(gorselDonustur),
    ayarlar: { acilisTarihi: ayar.get("acilis_tarihi") ?? null },
    etkinlikler: etkinlikler.results.map(etkinlikDonustur),
    ...surumDonustur(surum.results[0])
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

/**
 * Linkleri doğrular ve her birine ekleyenini yazar. İstemcinin gönderdiği
 * `ekleyen` dikkate alınmaz: kalemde aynı adresle zaten duran link eski
 * ekleyenini korur, yeni adres kaydı yapan kişiye yazılır. Böylece notu
 * düzeltmek linki sahiplenmez, kimse de linki başkasının adına ekleyemez.
 */
function linkleriOku(deger: unknown, onceki: Link[], benId: number): Link[] {
  if (!Array.isArray(deger)) throw new GecersizGirdi("Linkler okunamadı.");
  const linkler: Link[] = [];
  for (const oge of deger.slice(0, SINIR.linkSayisi)) {
    const kayit = (oge && typeof oge === "object" ? oge : {}) as Govde;
    const ham = metin(kayit.url, SINIR.url + 100);
    if (!ham) continue;
    const url = linkDuzelt(ham);
    if (!url || url.length > SINIR.url) throw new GecersizGirdi(`Bu link açılamıyor: ${ham.slice(0, 60)}`);
    const eski = onceki.find((link) => link.url === url);
    const ekleyen = eski ? eski.ekleyen : benId;
    const not = metin(kayit.not, SINIR.linkNotu);
    linkler.push(ekleyen === undefined ? { url, not } : { url, not, ekleyen });
  }
  return linkler;
}

async function kisiVarMi(db: D1Veritabani, id: unknown) {
  if (id === null || id === undefined) return null;
  const kisi = typeof id === "number" ? await db.prepare("SELECT id FROM kullanicilar WHERE id = ?").bind(id).first() : null;
  if (!kisi) throw new GecersizGirdi("Seçilen kişi bulunamadı.");
  return id as number;
}

async function formOku(request: Request) {
  try {
    return await request.formData();
  } catch {
    throw new GecersizGirdi("Fotoğraf okunamadı.");
  }
}

/* ── Bildirimler ───────────────────────────────────────────────────────── */

type BildirimYuku = {
  baslik: string;
  govde: string;
  /** Tıklanınca açılacak site içi yol. */
  adres: string;
  /** Aynı etiketli bildirim öncekinin yerine geçer: art arda on kalem, telefonda tek bildirim. */
  etiket: string;
  /** Yerine geçerken yeniden titretmesin (değişiklik akışları). Sohbet titretir. */
  sessiz?: boolean;
};

function vapidAnahtarlari(env: BalimEnv): VapidAnahtarlari | null {
  const acik = env.BALIM_VAPID_ACIK?.trim();
  const ozel = env.BALIM_VAPID_OZEL?.trim();
  return acik && ozel ? { acik, ozel, konu: "mailto:support@mgumrah.com" } : null;
}

function tercihleriOku(deger: unknown): BildirimTercihleri {
  let ham: unknown = deger;
  if (typeof deger === "string") {
    try {
      ham = JSON.parse(deger);
    } catch {
      ham = null;
    }
  }
  const kayit = (ham && typeof ham === "object" ? ham : {}) as Record<string, unknown>;
  const tercih = (ad: keyof BildirimTercihleri) =>
    typeof kayit[ad] === "boolean" ? (kayit[ad] as boolean) : VARSAYILAN_TERCIHLER[ad];
  return { sohbet: tercih("sohbet"), degisiklikler: tercih("degisiklikler"), hatirlatmalar: tercih("hatirlatmalar") };
}

type AbonelikSatiri = { id: number; kullanici_id: number; endpoint: string; p256dh: string; auth: string; tercihler: string };

/**
 * Seçilen kişilerin tercihine uyan bütün cihazlarına gönderir. Tarayıcıda
 * iptal edilmiş abonelikler (404/410) burada temizlenir. Hep `waitUntil`
 * içinde çalışır: yanıt kullanıcıya bildirim beklemeden döner.
 */
async function bildirimGonder(
  env: BalimEnv,
  kime: { haric?: number[]; yalniz?: number[] },
  tercih: keyof BildirimTercihleri,
  yuk: BildirimYuku
) {
  const anahtarlar = vapidAnahtarlari(env);
  if (!anahtarlar) return;
  if (kime.yalniz && kime.yalniz.length === 0) return;

  const abonelikler = await env.BALIM_DB.prepare(
    "SELECT id, kullanici_id, endpoint, p256dh, auth, tercihler FROM bildirim_abonelikleri"
  ).all<AbonelikSatiri>();
  const hedefler = abonelikler.results.filter(
    (a) =>
      !kime.haric?.includes(a.kullanici_id) &&
      (!kime.yalniz || kime.yalniz.includes(a.kullanici_id)) &&
      tercihleriOku(a.tercihler)[tercih]
  );

  const gecersiz: number[] = [];
  await Promise.all(
    hedefler.map(async (a) => {
      const sonuc = await pushGonder(a, yuk, anahtarlar, tercih === "sohbet" ? "high" : "normal");
      if (sonuc.ok) return;
      if (sonuc.kalici) gecersiz.push(a.id);
      else console.error("balim bildirim", sonuc.durum, sonuc.hata);
    })
  );
  if (gecersiz.length) {
    await env.BALIM_DB.prepare(`DELETE FROM bildirim_abonelikleri WHERE id IN (${gecersiz.map(() => "?").join(", ")})`)
      .bind(...gecersiz)
      .run();
  }
}

const kisalt = (yazi: string, enFazla: number) => (yazi.length > enFazla ? `${yazi.slice(0, enFazla - 1)}…` : yazi);

/** Etkinliğin türüne göre bildirime dokununca açılacak sekme. */
const SEKMESI: Record<EtkinlikTuru, string> = {
  alinacak: "alinacaklar",
  yapilacak: "yapilacaklar",
  gider: "giderler",
  odeme: "giderler",
  gorsel: "gorseller",
  ayar: "ozet",
  kisi: "ozet"
};

/**
 * Sunucu bu adrese POST atacak: yalnızca tarayıcıların gerçek push servisleri
 * kabul edilir. Açık bırakılsa, oturumu olan biri Worker'a istediği adrese
 * istek attırabilirdi.
 */
const PUSH_SERVISLERI = [/\.googleapis\.com$/, /\.mozilla\.com$/, /\.mozaws\.net$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/];

function abonelikOku(deger: unknown, request: Request) {
  const kayit = (deger && typeof deger === "object" ? deger : {}) as Govde;
  const anahtarlar = (kayit.keys && typeof kayit.keys === "object" ? kayit.keys : {}) as Govde;
  const endpoint = metin(kayit.endpoint, 1000);
  const p256dh = metin(anahtarlar.p256dh, 200);
  const auth = metin(anahtarlar.auth, 100);

  let adres: URL;
  try {
    adres = new URL(endpoint);
  } catch {
    throw new GecersizGirdi("Abonelik okunamadı.");
  }
  // `wrangler dev` altında sahte bir push sunucusuyla uçtan uca deneme yapılabilsin.
  const yerelDeneme =
    new URL(request.url).hostname === "localhost" && (adres.hostname === "127.0.0.1" || adres.hostname === "localhost");
  if (!yerelDeneme && (adres.protocol !== "https:" || !PUSH_SERVISLERI.some((kalip) => kalip.test(adres.hostname)))) {
    throw new GecersizGirdi("Bu tarayıcının bildirim servisi tanınmadı.");
  }
  if (!/^[A-Za-z0-9_-]{60,120}$/.test(p256dh) || !/^[A-Za-z0-9_-]{16,40}$/.test(auth)) {
    throw new GecersizGirdi("Abonelik anahtarları okunamadı.");
  }
  return { endpoint, p256dh, auth };
}

async function bildirim(i: Istek, kimlik: string | undefined) {
  const { request, db, ben } = i;
  const anahtarlar = vapidAnahtarlari(i.env);

  // Cihazın durumu. POST, çünkü endpoint bir yetki adresi: URL'de gitse
  // Cloudflare'in istek loglarına düşerdi.
  if (kimlik === "durum" && request.method === "POST") {
    const endpoint = metin((await govdeOku(request)).endpoint, 1000);
    const kayit = endpoint
      ? await db
          .prepare("SELECT tercihler FROM bildirim_abonelikleri WHERE endpoint = ? AND kullanici_id = ?")
          .bind(endpoint, ben.id)
          .first<{ tercihler: string }>()
      : null;
    return json({
      ok: true,
      acikAnahtar: anahtarlar?.acik ?? null,
      kayitli: Boolean(kayit),
      tercihler: kayit ? tercihleriOku(kayit.tercihler) : VARSAYILAN_TERCIHLER
    });
  }

  if (!anahtarlar) return hata(503, "Bildirimler henüz kurulmadı.");

  if (!kimlik && request.method === "PUT") {
    const g = await govdeOku(request);
    const abonelik = abonelikOku(g.abonelik, request);
    const tercihler = tercihleriOku(g.tercihler);
    const zaman = simdi();
    // Aynı cihaz (endpoint) başka biriyle kayıtlıysa sahibi değişir: ortak
    // tablette çıkış yapıp başkası girdiğinde bildirim yeni kişiye gitsin.
    await db
      .prepare(
        `INSERT INTO bildirim_abonelikleri (kullanici_id, endpoint, p256dh, auth, tercihler, cihaz, olusturuldu, guncellendi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (endpoint) DO UPDATE SET
           kullanici_id = excluded.kullanici_id, p256dh = excluded.p256dh, auth = excluded.auth,
           tercihler = excluded.tercihler, cihaz = excluded.cihaz, guncellendi = excluded.guncellendi`
      )
      .bind(
        ben.id,
        abonelik.endpoint,
        abonelik.p256dh,
        abonelik.auth,
        JSON.stringify(tercihler),
        (request.headers.get("user-agent") ?? "").slice(0, 200),
        zaman,
        zaman
      )
      .run();
    return json({ ok: true, kayitli: true, tercihler });
  }

  if (!kimlik && request.method === "DELETE") {
    const g = await govdeOku(request);
    await db
      .prepare("DELETE FROM bildirim_abonelikleri WHERE endpoint = ? AND kullanici_id = ?")
      .bind(metin(g.endpoint, 1000), ben.id)
      .run();
    return json({ ok: true, kayitli: false });
  }

  if (kimlik === "deneme" && request.method === "POST") {
    const g = await govdeOku(request);
    const hedef = await db
      .prepare("SELECT id, endpoint, p256dh, auth FROM bildirim_abonelikleri WHERE endpoint = ? AND kullanici_id = ?")
      .bind(metin(g.endpoint, 1000), ben.id)
      .first<{ id: number; endpoint: string; p256dh: string; auth: string }>();
    if (!hedef) return hata(404, "Bu cihazın bildirim kaydı bulunamadı. Bildirimleri kapatıp yeniden açın.");

    const sonuc = await pushGonder(
      hedef,
      { baslik: "Balım", govde: "Bildirimler bu cihazda çalışıyor. 🐝", adres: "/balim/#ozet", etiket: "balim-deneme" } satisfies BildirimYuku,
      anahtarlar,
      "high"
    );
    if (sonuc.ok) return json({ ok: true });
    if (sonuc.kalici) {
      await db.prepare("DELETE FROM bildirim_abonelikleri WHERE id = ?").bind(hedef.id).run();
      return hata(410, "Bu cihazın bildirim kaydı geçersiz olmuş. Bildirimleri kapatıp yeniden açın.");
    }
    return hata(502, `Bildirim servisi kabul etmedi (${sonuc.durum || "bağlantı kurulamadı"}). Biraz sonra tekrar deneyin.`);
  }

  return hata(405, "Desteklenmeyen işlem.");
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

/**
 * Değişikliği etkinliğiyle aynı toplu sorguda yazar, öteki kişilere bildirim
 * yollar ve güncel veriyi döner. `bildirimHaric`: aynı değişiklik için zaten
 * kendine özel bildirim alacak kişi (işin yeni sorumlusu gibi).
 */
async function yazVeDon(
  i: Istek,
  sorgular: D1Sorgu[],
  etkinlik: { tur: EtkinlikTuru; eylem: string; metin: string },
  secenek: { bildirimHaric?: number[] } = {}
) {
  await i.db.batch([
    ...sorgular,
    i.db
      .prepare("INSERT INTO etkinlikler (kullanici_id, tur, eylem, metin, zaman) VALUES (?, ?, ?, ?, ?)")
      .bind(i.ben.id, etkinlik.tur, etkinlik.eylem, etkinlik.metin.slice(0, 200), simdi())
  ]);

  if (etkinlik.tur !== "kisi") {
    i.ctx.waitUntil(
      bildirimGonder(i.env, { haric: [i.ben.id, ...(secenek.bildirimHaric ?? [])] }, "degisiklikler", {
        baslik: "Balım",
        govde: kisalt(`${i.ben.ad} ${etkinlik.eylem}: ${etkinlik.metin}`, 180),
        adres: `/balim/#${SEKMESI[etkinlik.tur]}`,
        etiket: `balim-${etkinlik.tur}`,
        sessiz: true
      })
    );
  }

  return json({ ok: true, veri: await veriGetir(i.db, i.ben) });
}

const yokMesaji = "Bu kayıt artık yok — başka biri silmiş olabilir. Sayfa yenilendi.";

function alinacakAlanlari(g: Govde, yeni: boolean, oncekiLinkler: Link[], benId: number): Alanlar {
  const a: Alanlar = {};
  if (yeni || "ad" in g) a.ad = doluMetin(g.ad, SINIR.ad, "Ne alınacağını yazın.");
  if (yeni || "kategori" in g) a.kategori = metin(g.kategori, SINIR.kategori) || "Diğer";
  if (yeni || "adet" in g) a.adet = tamSayi(g.adet ?? 1, 1, SINIR.adet, "Adet 1 ile 100.000 arasında olmalı.");
  if (yeni || "birimFiyat" in g) {
    a.birim_fiyat = g.birimFiyat == null ? null : tamSayi(g.birimFiyat, 0, SINIR.tutar, "Fiyat okunamadı.");
  }
  if (yeni || "linkler" in g) a.linkler = JSON.stringify(linkleriOku(g.linkler ?? [], oncekiLinkler, benId));
  if (yeni || "aciklama" in g) a.aciklama = metin(g.aciklama, SINIR.aciklama);
  if (yeni || "alindi" in g) {
    a.alindi = g.alindi === true ? 1 : 0;
    a.alinma_zamani = g.alindi === true ? simdi() : null;
  }
  return a;
}

async function alinacaklar(i: Istek, kimlik: string | undefined) {
  const { request, db, ben } = i;
  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");
    const a = alinacakAlanlari(await govdeOku(request), true, [], ben.id);
    const zaman = simdi();
    return yazVeDon(i, [ekle(db, "alinacaklar", { ...a, ekleyen_id: ben.id, olusturuldu: zaman, guncellendi: zaman })], {
      tur: "alinacak",
      eylem: "listeye ekledi",
      metin: String(a.ad)
    });
  }

  const id = idOku(kimlik);
  const mevcut = id
    ? await db
        .prepare("SELECT ad, alindi, linkler FROM alinacaklar WHERE id = ?")
        .bind(id)
        .first<{ ad: string; alindi: number; linkler: string }>()
    : null;
  if (!id || !mevcut) return hata(404, yokMesaji);

  if (request.method === "PATCH") {
    const a = alinacakAlanlari(await govdeOku(request), false, linkleriCoz(mevcut.linkler), ben.id);
    // İşaret değişmediyse "ne zaman alındı" da olduğu gibi kalsın; formu
    // yeniden kaydetmek alınma tarihini bugüne çekmemeli.
    const isaretDegisti = "alindi" in a && a.alindi !== mevcut.alindi;
    if (!isaretDegisti) delete a.alinma_zamani;
    const eylem = isaretDegisti ? (a.alindi === 1 ? "aldı" : "alınmadı olarak işaretledi") : "düzenledi";
    return yazVeDon(i, [guncelle(db, "alinacaklar", id, { ...a, guncellendi: simdi() })], {
      tur: "alinacak",
      eylem,
      metin: String(a.ad ?? mevcut.ad)
    });
  }

  if (request.method === "DELETE") {
    return yazVeDon(i, [db.prepare("DELETE FROM alinacaklar WHERE id = ?").bind(id)], {
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

/** İş birine yeni verildiyse ona özel bildirim; genel akışta o kişi atlanır. */
function isVerildiBildirimi(i: Istek, sorumluId: D1Deger | undefined, eskiSorumlu: number | null, baslik: string) {
  if (typeof sorumluId !== "number" || sorumluId === eskiSorumlu || sorumluId === i.ben.id) return [];
  i.ctx.waitUntil(
    bildirimGonder(i.env, { yalniz: [sorumluId] }, "degisiklikler", {
      baslik: "Sana bir iş verildi",
      govde: kisalt(`${i.ben.ad}: ${baslik}`, 180),
      adres: "/balim/#yapilacaklar",
      etiket: "balim-is-verildi"
    })
  );
  return [sorumluId];
}

async function yapilacaklar(i: Istek, kimlik: string | undefined) {
  const { request, db, ben } = i;
  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");
    const a = await yapilacakAlanlari(db, await govdeOku(request), true);
    const zaman = simdi();
    const ozel = isVerildiBildirimi(i, a.sorumlu_id, null, String(a.baslik));
    return yazVeDon(
      i,
      [ekle(db, "yapilacaklar", { ...a, ekleyen_id: ben.id, olusturuldu: zaman, guncellendi: zaman })],
      { tur: "yapilacak", eylem: "iş ekledi", metin: String(a.baslik) },
      { bildirimHaric: ozel }
    );
  }

  const id = idOku(kimlik);
  const mevcut = id
    ? await db
        .prepare("SELECT baslik, tamamlandi, sorumlu_id FROM yapilacaklar WHERE id = ?")
        .bind(id)
        .first<{ baslik: string; tamamlandi: number; sorumlu_id: number | null }>()
    : null;
  if (!id || !mevcut) return hata(404, yokMesaji);

  if (request.method === "PATCH") {
    const a = await yapilacakAlanlari(db, await govdeOku(request), false);
    const isaretDegisti = "tamamlandi" in a && a.tamamlandi !== mevcut.tamamlandi;
    if (!isaretDegisti) delete a.tamamlanma_zamani;
    const eylem = isaretDegisti ? (a.tamamlandi === 1 ? "tamamladı" : "yeniden açtı") : "işi düzenledi";
    const baslik = String(a.baslik ?? mevcut.baslik);
    const ozel = "sorumlu_id" in a ? isVerildiBildirimi(i, a.sorumlu_id, mevcut.sorumlu_id, baslik) : [];
    return yazVeDon(
      i,
      [guncelle(db, "yapilacaklar", id, { ...a, guncellendi: simdi() })],
      { tur: "yapilacak", eylem, metin: baslik },
      { bildirimHaric: ozel }
    );
  }

  if (request.method === "DELETE") {
    return yazVeDon(i, [db.prepare("DELETE FROM yapilacaklar WHERE id = ?").bind(id)], {
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

async function giderler(i: Istek, kimlik: string | undefined) {
  const { request, db, ben } = i;
  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");
    const a = giderAlanlari(await govdeOku(request), true);
    if (a.bitis && String(a.bitis) < String(a.baslangic)) throw new GecersizGirdi("Bitiş ayı başlangıçtan önce olamaz.");
    const zaman = simdi();
    return yazVeDon(i, [ekle(db, "giderler", { ...a, ekleyen_id: ben.id, olusturuldu: zaman, guncellendi: zaman })], {
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
    return yazVeDon(i, [guncelle(db, "giderler", id, { ...a, guncellendi: simdi() })], {
      tur: "gider",
      eylem: "gideri düzenledi",
      metin: String(a.ad ?? mevcut.ad)
    });
  }

  if (request.method === "DELETE") {
    // Ödemeler ON DELETE CASCADE ile birlikte gider.
    return yazVeDon(i, [db.prepare("DELETE FROM giderler WHERE id = ?").bind(id)], {
      tur: "gider",
      eylem: "gideri sildi",
      metin: mevcut.ad
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

async function odemeler(i: Istek, kimlik: string | undefined) {
  const { request, db, ben } = i;
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
      i,
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
    return yazVeDon(i, [db.prepare("DELETE FROM odemeler WHERE id = ?").bind(id)], {
      tur: "odeme",
      eylem: "ödemeyi geri aldı",
      metin: `${mevcut.ad} · ${ayYazisi(mevcut.ay)}`
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

type YazilanGorsel = { id: string; baslik: string; kategori: string; sorgu: D1Sorgu; anahtarlar: string[] };

/**
 * Formdaki fotoğrafı doğrular, R2'ye yazar ve D1 satırının sorgusunu hazırlar
 * (çalıştırmaz: çağıran onu kendi toplu sorgusuna katar). O sorgu başarısız
 * olursa çağıran `anahtarlar`ı R2'den silmekle yükümlü.
 */
async function gorselYaz(i: Istek, form: FormData, varsayilanKategori: string, baslikAlani = "baslik"): Promise<YazilanGorsel> {
  const dosya = form.get("dosya");
  if (!(dosya instanceof File) || dosya.size === 0) throw new GecersizGirdi("Fotoğraf seçilmedi.");
  if (!GORSEL_TURLERI.includes(dosya.type)) {
    throw new GecersizGirdi("Bu dosya türü desteklenmiyor. JPEG, PNG ya da WebP fotoğraf yükleyin.");
  }
  if (dosya.size > SINIR.gorselBayt) throw new GecersizGirdi("Fotoğraf 15 MB'tan büyük olamaz.");

  const kucuk = form.get("kucuk");
  const kucukUygun =
    kucuk instanceof File && kucuk.size > 0 && kucuk.size <= SINIR.kucukBayt && GORSEL_TURLERI.includes(kucuk.type);

  const olcu = (ad: string) => {
    const deger = Number(form.get(ad));
    return Number.isInteger(deger) && deger > 0 && deger < 100_000 ? deger : null;
  };
  // Metin alanları R2'ye yazmadan önce okunur: bozuk bir alan yüzünden
  // yüklenmiş ama hiçbir kayda bağlanmamış dosya kalmasın.
  const baslik = metin(form.get(baslikAlani), SINIR.baslik);
  const kategori = metin(form.get("kategori"), SINIR.kategori) || varsayilanKategori;

  const id = crypto.randomUUID();
  const anahtarlar = [`gorseller/${id}`, `gorseller/${id}-kucuk`];
  try {
    await i.env.BALIM_GORSELLER.put(anahtarlar[0], await dosya.arrayBuffer(), { httpMetadata: { contentType: dosya.type } });
    if (kucukUygun) {
      await i.env.BALIM_GORSELLER.put(anahtarlar[1], await kucuk.arrayBuffer(), { httpMetadata: { contentType: kucuk.type } });
    }
  } catch (e) {
    await i.env.BALIM_GORSELLER.delete(anahtarlar).catch(() => undefined);
    throw e;
  }

  const sorgu = ekle(i.db, "gorseller", {
    id,
    baslik,
    kategori,
    tur: dosya.type,
    boyut: dosya.size,
    genislik: olcu("genislik"),
    yukseklik: olcu("yukseklik"),
    kucuk_var: kucukUygun ? 1 : 0,
    ekleyen_id: i.ben.id,
    olusturuldu: simdi()
  });
  return { id, baslik, kategori, sorgu, anahtarlar };
}

async function gorseller(i: Istek, kimlik: string | undefined) {
  const { request, env, db } = i;

  if (!kimlik) {
    if (request.method !== "POST") return hata(405, "Desteklenmeyen işlem.");
    const yazilan = await gorselYaz(i, await formOku(request), "Diğer");
    try {
      return await yazVeDon(i, [yazilan.sorgu], {
        tur: "gorsel",
        eylem: "görsel yükledi",
        metin: yazilan.baslik || yazilan.kategori
      });
    } catch (e) {
      await env.BALIM_GORSELLER.delete(yazilan.anahtarlar).catch(() => undefined);
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
    return yazVeDon(i, [guncelle(db, "gorseller", kimlik, a)], {
      tur: "gorsel",
      eylem: "görseli düzenledi",
      metin: String(a.baslik ?? mevcut.baslik) || String(a.kategori ?? mevcut.kategori)
    });
  }

  if (request.method === "DELETE") {
    await env.BALIM_GORSELLER.delete([`gorseller/${kimlik}`, `gorseller/${kimlik}-kucuk`]);
    return yazVeDon(i, [db.prepare("DELETE FROM gorseller WHERE id = ?").bind(kimlik)], {
      tur: "gorsel",
      eylem: "görseli sildi",
      metin: mevcut.baslik || mevcut.kategori
    });
  }

  return hata(405, "Desteklenmeyen işlem.");
}

async function mesajlar(i: Istek, kimlik: string | undefined) {
  const { request, env, db, ben } = i;
  const parametreler = new URL(request.url).searchParams;

  if (!kimlik && request.method === "GET") {
    // Açık sohbetin yoklaması: yalnızca bilinen son mesajdan sonrası.
    if (parametreler.has("sonra")) {
      const sonra = Number(parametreler.get("sonra"));
      const yeniler = await db
        .prepare(`${MESAJ_SORGUSU} WHERE m.id > ? ORDER BY m.id LIMIT 200`)
        .bind(Number.isInteger(sonra) && sonra > 0 ? sonra : 0)
        .all<MesajSatiri>();
      return json({ ok: true, mesajlar: yeniler.results.map(mesajDonustur), dahaVar: false });
    }

    const once = Number(parametreler.get("once"));
    const sayfa =
      Number.isInteger(once) && once > 0
        ? await db.prepare(`${MESAJ_SORGUSU} WHERE m.id < ? ORDER BY m.id DESC LIMIT ?`).bind(once, MESAJ_SAYFASI + 1).all<MesajSatiri>()
        : await db.prepare(`${MESAJ_SORGUSU} ORDER BY m.id DESC LIMIT ?`).bind(MESAJ_SAYFASI + 1).all<MesajSatiri>();
    return json({
      ok: true,
      mesajlar: sayfa.results.slice(0, MESAJ_SAYFASI).reverse().map(mesajDonustur),
      dahaVar: sayfa.results.length > MESAJ_SAYFASI
    });
  }

  if (!kimlik && request.method === "POST") {
    let yazi = "";
    let yazilan: YazilanGorsel | null = null;
    if ((request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
      const form = await formOku(request);
      yazi = metin(form.get("metin"), SINIR.mesaj);
      yazilan = await gorselYaz(i, form, SOHBET_KATEGORISI, "metin");
    } else {
      yazi = metin((await govdeOku(request)).metin, SINIR.mesaj);
    }
    if (!yazi && !yazilan) return hata(400, "Boş mesaj gönderilemez.");

    let yeniId: number;
    try {
      const sonuclar = await db.batch([
        ...(yazilan ? [yazilan.sorgu] : []),
        db
          .prepare("INSERT INTO mesajlar (kullanici_id, metin, gorsel_id, olusturuldu) VALUES (?, ?, ?, ?)")
          .bind(ben.id, yazi, yazilan?.id ?? null, simdi())
      ]);
      yeniId = Number(sonuclar[sonuclar.length - 1].meta.last_row_id);
    } catch (e) {
      if (yazilan) await env.BALIM_GORSELLER.delete(yazilan.anahtarlar).catch(() => undefined);
      throw e;
    }

    i.ctx.waitUntil(
      bildirimGonder(env, { haric: [ben.id] }, "sohbet", {
        baslik: ben.ad,
        govde: yazi ? kisalt(yazi, 180) : "📷 Fotoğraf gönderdi",
        adres: "/balim/#sohbet",
        etiket: "balim-sohbet"
      })
    );

    const mesaj = await db.prepare(`${MESAJ_SORGUSU} WHERE m.id = ?`).bind(yeniId).first<MesajSatiri>();
    return json({ ok: true, mesaj: mesaj ? mesajDonustur(mesaj) : null });
  }

  if (kimlik === "okundu" && request.method === "PUT") {
    const id = tamSayi((await govdeOku(request)).id, 0, Number.MAX_SAFE_INTEGER, "Mesaj okunamadı.");
    await db.prepare("UPDATE kullanicilar SET son_okunan_mesaj = MAX(son_okunan_mesaj, ?) WHERE id = ?").bind(id, ben.id).run();
    return json({ ok: true, ...surumDonustur(await surumSorgusu(db, ben.id).first<SurumSatiri>()) });
  }

  const id = idOku(kimlik);
  if (!id || request.method !== "DELETE") return hata(405, "Desteklenmeyen işlem.");

  const mevcut = await db
    .prepare("SELECT m.kullanici_id, m.gorsel_id, g.kategori FROM mesajlar m LEFT JOIN gorseller g ON g.id = m.gorsel_id WHERE m.id = ?")
    .bind(id)
    .first<{ kullanici_id: number | null; gorsel_id: string | null; kategori: string | null }>();
  if (!mevcut) return hata(404, "Bu mesaj artık yok.");
  if (mevcut.kullanici_id !== ben.id) return hata(403, "Yalnızca kendi mesajınızı silebilirsiniz.");

  // Sohbete özel yüklenen fotoğraf mesajla birlikte gider; Görseller'e ayrıca
  // eklenmiş (kategorisi değiştirilmiş) bir fotoğrafa dokunulmaz.
  const gorselGider = mevcut.gorsel_id && mevcut.kategori === SOHBET_KATEGORISI ? mevcut.gorsel_id : null;
  await db.batch([
    db.prepare("DELETE FROM mesajlar WHERE id = ?").bind(id),
    ...(gorselGider ? [db.prepare("DELETE FROM gorseller WHERE id = ?").bind(gorselGider)] : [])
  ]);
  if (gorselGider) await env.BALIM_GORSELLER.delete([`gorseller/${gorselGider}`, `gorseller/${gorselGider}-kucuk`]);
  return json({ ok: true });
}

async function ayarlar(i: Istek) {
  const { request, db } = i;
  if (request.method !== "PATCH") return hata(405, "Desteklenmeyen işlem.");
  const g = await govdeOku(request);
  if (!("acilisTarihi" in g)) return hata(400, "Değişiklik yok.");

  if (g.acilisTarihi == null || g.acilisTarihi === "") {
    return yazVeDon(i, [db.prepare("DELETE FROM ayarlar WHERE anahtar = 'acilis_tarihi'")], {
      tur: "ayar",
      eylem: "açılış tarihini kaldırdı",
      metin: "Açılış tarihi"
    });
  }

  const tarih = gunOku(g.acilisTarihi);
  return yazVeDon(
    i,
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

async function hesap(i: Istek) {
  const { request, db, ben } = i;
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
    return yazVeDon(i, [db.prepare("UPDATE kullanicilar SET ad = ? WHERE id = ?").bind(ad, ben.id)], {
      tur: "kisi",
      eylem: "adını değiştirdi",
      metin: `${ben.ad} → ${ad}`
    });
  }

  return hata(400, "Değişiklik yok.");
}

/* ── Sabah hatırlatmaları ──────────────────────────────────────────────── */

/**
 * Her sabah 09:00'da (index.ts'teki cron) çalışır: ödenmemiş bir gider ayının
 * son gününe üç gün kaldıysa, son gün bugünse ya da üç/yedi gündür
 * gecikiyorsa; bir işin son günü bugünse ya da dündüyse. Herkese tek bildirim
 * gider, satır satır; iş hatırlatması yalnızca işin sorumlusuna (yoksa herkese).
 */
export async function balimHatirlatmalari(env: BalimEnv) {
  if (!vapidAnahtarlari(env)) return;
  const db = env.BALIM_DB;
  const [kisiler, giderSatirlari, odemeSatirlari, isSatirlari] = (await db.batch([
    db.prepare("SELECT id FROM kullanicilar"),
    db.prepare("SELECT * FROM giderler"),
    db.prepare("SELECT * FROM odemeler"),
    db.prepare("SELECT * FROM yapilacaklar WHERE tamamlandi = 0 AND son_tarih IS NOT NULL")
  ])) as [D1Sonuc<{ id: number }>, D1Sonuc<GiderSatiri>, D1Sonuc<OdemeSatiri>, D1Sonuc<YapilacakSatiri>];

  const gun = istanbulGunu();
  const odemeListesi = odemeSatirlari.results.map(odemeDonustur);
  const notlar: { kime: number | null; yazi: string }[] = [];

  for (const gider of giderSatirlari.results.map(giderDonustur)) {
    for (const ay of vadesiGelenAylar(gider, odemeListesi, gunEkle(gun, 3))) {
      if (ay.odeme) continue;
      const fark = gunFarki(gun, ay.sonGun);
      const ne = `${gider.ad} (${ayYazisi(ay.ay)}, ${tl(gider.tutar)})`;
      if (fark === 3) notlar.push({ kime: null, yazi: `${ne}: son gün ${kisaTarih(ay.sonGun)}, 3 gün kaldı` });
      else if (fark === 0) notlar.push({ kime: null, yazi: `${ne}: son gün bugün` });
      else if (fark === -3 || fark === -7) notlar.push({ kime: null, yazi: `${ne}: ${-fark} gündür ödenmedi` });
    }
  }

  for (const is of isSatirlari.results.map(yapilacakDonustur)) {
    const fark = gunFarki(gun, is.sonTarih as string);
    if (fark === 0) notlar.push({ kime: is.sorumluId, yazi: `Bugün: ${is.baslik}` });
    else if (fark === -1) notlar.push({ kime: is.sorumluId, yazi: `Dün son gündü: ${is.baslik}` });
  }

  if (!notlar.length) return;

  await Promise.all(
    kisiler.results.map((kisi) => {
      const satirlar = notlar.filter((n) => n.kime === null || n.kime === kisi.id).map((n) => n.yazi);
      if (!satirlar.length) return undefined;
      const fazla = satirlar.length > 3 ? `\n+${satirlar.length - 3} hatırlatma daha` : "";
      return bildirimGonder(env, { yalniz: [kisi.id] }, "hatirlatmalar", {
        baslik: "Balım · Bugün",
        govde: kisalt(satirlar.slice(0, 3).join("\n") + fazla, 400),
        adres: "/balim/#ozet",
        etiket: "balim-hatirlatma"
      });
    })
  );
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
export async function balimApi(request: Request, env: BalimEnv, yol: string, ctx: IsBaglami): Promise<Response> {
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

    const i: Istek = { request, env, db, ben: oturum.ben, ctx };
    let yanit: Response;

    switch (kaynak) {
      case "veri":
        yanit = yontem === "GET" ? json({ ok: true, veri: await veriGetir(db, i.ben) }) : hata(405, "Desteklenmeyen işlem.");
        break;
      case "surum":
        yanit = json({ ok: true, ...surumDonustur(await surumSorgusu(db, i.ben.id).first<SurumSatiri>()) });
        break;
      case "cikis":
        if (yontem !== "POST") return hata(405, "Desteklenmeyen işlem.");
        await db.prepare("DELETE FROM oturumlar WHERE anahtar = ?").bind(oturum.anahtar).run();
        return json({ ok: true }, 200, { "set-cookie": cerezSil });
      case "alinacaklar":
        yanit = await alinacaklar(i, kimlik);
        break;
      case "yapilacaklar":
        yanit = await yapilacaklar(i, kimlik);
        break;
      case "giderler":
        yanit = await giderler(i, kimlik);
        break;
      case "odemeler":
        yanit = await odemeler(i, kimlik);
        break;
      case "gorseller":
        yanit = await gorseller(i, kimlik);
        break;
      case "mesajlar":
        yanit = await mesajlar(i, kimlik);
        break;
      case "bildirim":
        yanit = await bildirim(i, kimlik);
        break;
      case "ayarlar":
        yanit = await ayarlar(i);
        break;
      case "hesap":
        yanit = await hesap(i);
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
