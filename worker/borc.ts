/**
 * mgumrah.com/borc — kişisel borç takibinin API'si.
 *
 * Sayfanın kendisi (app/borc) statik bir kabuk ve İÇİNDE HİÇBİR VERİ YOK; kart,
 * KMH ve işyeri borcunun her rakamı buradan, oturum çerezi doğrulandıktan sonra
 * gelir. Depo herkese açık olduğu için bu dosyada ve migrations/borc'ta yalnızca
 * yapı var; gerçek hesaplar sahibin makinesinde scripts/borc-ice-aktar.mjs ile
 * D1'e girer.
 *
 * Güvenlik duruşu (ayrıntı README'de):
 *  - Her uç oturum ister; tek istisna POST /giris. Kimlik doğrulaması olmadan
 *    tek bayt veri dönmez, yanlış/eksik çerez 401'dir.
 *  - Şifre PBKDF2-SHA256 hash'i olarak D1'de; oturum jetonunun yalnızca SHA-256'sı.
 *  - Çerez: HttpOnly, Secure, SameSite=Strict, Path=/api/borc. 30 gün kayan
 *    ömür, en çok 90 gün mutlak ömür.
 *  - Giriş denemesi: IP başına ve TOPLAM sınır (dağıtık deneme için).
 *  - Yazma isteklerinde Origin denetimi (CSRF'e ikinci kat).
 *  - Her yanıt no-store ve noindex.
 *  - Binding yoksa (D1 henüz kurulmadıysa) 503 döner; site diğer her şeyiyle çalışır.
 *
 * Tipler index.ts'teki gerekçeyle satır içinde (workers-types ile DOM tipleri çakışır).
 * Oturum/şifre kalıbı worker/balim.ts'ten; canlı çalışan Balım'a dokunmamak için
 * ortak bir modüle çıkarılmadı, kopyalandı.
 */

import {
  ayiAl,
  ekstreAyi,
  gecerliAy,
  gecerliTarih,
  gunEkle,
  istanbulBugun
} from "../app/borc/hesap";
import {
  KUR_SINIRI,
  PARA_BIRIMLERI,
  SINIR,
  VARSAYILAN_AYARLAR,
  type Ayarlar,
  type Durum,
  type DurumGirdisi,
  type DuzenliGelir,
  type DuzenliGelirGirdisi,
  type Gelir,
  type GelirGirdisi,
  type ParaBirimi,
  type Hesap,
  type HesapTuru,
  type Islem,
  type IslemGirdisi,
  type Veri
} from "../app/borc/ortak";

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

export type BorcEnv = {
  /** Yoksa /api/borc 503 döner; wrangler.jsonc'taki d1_databases kaydı. */
  BORC_DB?: D1Veritabani;
};

const CEREZ = "borc_oturum";
const CEREZ_YOLU = "/api/borc";
/** Kayan ömür: kullanıldıkça uzar. Parasal veri için Balım'ın 400 gününden çok daha kısa. */
const OTURUM_OMRU_SN = 30 * 24 * 60 * 60;
/** Ne kadar kullanılırsa kullanılsın bir oturum bundan uzun yaşamaz. */
const OTURUM_MUTLAK_SN = 90 * 24 * 60 * 60;
const TAZELEME_MS = 24 * 60 * 60 * 1000;
/** Workers'ın Web Crypto'su PBKDF2'de 100.000 turun üstüne çıkmıyor. */
const PBKDF2_TUR = 100_000;
const GIRIS_PENCERESI_MS = 15 * 60 * 1000;
const GIRIS_IP_SINIRI = 5;
/** Bütün IP'lerden gelen toplam hatalı deneme; dağıtık tahmini durdurur. */
const GIRIS_TOPLAM_SINIRI = 25;
const GOVDE_EN_FAZLA = 20_000;
/** Hesaplamada kullanılan işlem penceresi (taksitliler her zaman gelir). */
const ISLEM_PENCERESI_GUN = 400;

/** Kullanıcıya olduğu gibi gösterilecek bir doğrulama hatası. */
class GecersizGirdi extends Error {}

const simdi = () => new Date().toISOString();

function json(govde: unknown, durum = 200, basliklar: Record<string, string> = {}) {
  return new Response(JSON.stringify(govde), {
    status: durum,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
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
  const anahtar = await crypto.subtle.importKey("raw", new TextEncoder().encode(sifre), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: tuz, iterations: tur, hash: "SHA-256" }, anahtar, 256));
}

/** Uzunluktan bağımsız süren karşılaştırma. */
function esit(a: string, b: string) {
  if (a.length !== b.length) return false;
  let fark = 0;
  for (let i = 0; i < a.length; i += 1) fark |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return fark === 0;
}

/** Biçim scripts/borc-kullanici.mjs ile aynı: "pbkdf2-sha256$tur$tuz$hash". */
async function sifreDogrula(sifre: string, kayitli: string) {
  const [yontem, turMetni, tuz, hash] = kayitli.split("$");
  const tur = Number(turMetni);
  if (yontem !== "pbkdf2-sha256" || !Number.isInteger(tur) || tur < 1 || tur > PBKDF2_TUR || !tuz || !hash) return false;
  return esit(base64(await pbkdf2(sifre, base64Coz(tuz), tur)), hash);
}

/**
 * Kullanıcı yokken de aynı işi yapmak için sahte kayıt: "bu kullanıcı adı yok"
 * ile "şifre yanlış" arasındaki süre farkı kullanıcı adını ele vermesin.
 */
const SAHTE_KAYIT = `pbkdf2-sha256$${PBKDF2_TUR}$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`;

function cerezOku(request: Request) {
  for (const parca of (request.headers.get("cookie") ?? "").split(";")) {
    const [ad, ...deger] = parca.trim().split("=");
    if (ad === CEREZ) return deger.join("=");
  }
  return null;
}

/** `wrangler dev` http://localhost'ta çalışır; Secure çerez orada (Safari'de) saklanmaz. Canlıda hep https. */
const yerelMi = (url: URL) => url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");

const oturumCerezi = (jeton: string, url: URL) =>
  `${CEREZ}=${jeton}; Path=${CEREZ_YOLU}; Max-Age=${OTURUM_OMRU_SN}; HttpOnly;${yerelMi(url) ? "" : " Secure;"} SameSite=Strict`;

const cerezSil = (url: URL) =>
  `${CEREZ}=; Path=${CEREZ_YOLU}; Max-Age=0; HttpOnly;${yerelMi(url) ? "" : " Secure;"} SameSite=Strict`;

type Oturum = { kullaniciAdi: string; anahtar: string; jeton: string; tazele: boolean };

async function oturumBul(request: Request, db: D1Veritabani): Promise<Oturum | null> {
  const jeton = cerezOku(request);
  if (!jeton || jeton.length > 128) return null;

  const anahtar = await sha256Hex(jeton);
  const satir = await db
    .prepare(
      `SELECT k.kullanici_adi, o.olusturuldu, o.son_gorulme
         FROM oturumlar o JOIN kullanicilar k ON k.id = o.kullanici_id
        WHERE o.anahtar = ?`
    )
    .bind(anahtar)
    .first<{ kullanici_adi: string; olusturuldu: string; son_gorulme: string }>();
  if (!satir) return null;

  const simdiMs = Date.now();
  const bos = simdiMs - Date.parse(satir.son_gorulme);
  const yas = simdiMs - Date.parse(satir.olusturuldu);
  if (bos > OTURUM_OMRU_SN * 1000 || yas > OTURUM_MUTLAK_SN * 1000) {
    await db.prepare("DELETE FROM oturumlar WHERE anahtar = ?").bind(anahtar).run();
    return null;
  }

  const tazele = bos > TAZELEME_MS;
  if (tazele) await db.prepare("UPDATE oturumlar SET son_gorulme = ? WHERE anahtar = ?").bind(simdi(), anahtar).run();
  return { kullaniciAdi: satir.kullanici_adi, anahtar, jeton, tazele };
}

async function govdeOku(request: Request): Promise<Record<string, unknown>> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    throw new GecersizGirdi("İstek JSON olmalı.");
  }
  const metin = await request.text();
  if (metin.length > GOVDE_EN_FAZLA) throw new GecersizGirdi("İstek çok büyük.");
  try {
    const govde = JSON.parse(metin) as unknown;
    if (govde && typeof govde === "object" && !Array.isArray(govde)) return govde as Record<string, unknown>;
  } catch {
    // aşağıdaki hata yeter
  }
  throw new GecersizGirdi("İstek okunamadı.");
}

async function girisYap(request: Request, db: D1Veritabani, url: URL) {
  const ip = request.headers.get("cf-connecting-ip") ?? "yerel";
  const pencere = new Date(Date.now() - GIRIS_PENCERESI_MS).toISOString();

  const sayac = await db
    .prepare("SELECT COUNT(*) AS toplam, SUM(CASE WHEN ip = ? THEN 1 ELSE 0 END) AS bu_ip FROM giris_denemeleri WHERE zaman > ?")
    .bind(ip, pencere)
    .first<{ toplam: number; bu_ip: number | null }>();
  if ((sayac?.bu_ip ?? 0) >= GIRIS_IP_SINIRI || (sayac?.toplam ?? 0) >= GIRIS_TOPLAM_SINIRI) {
    return hata(429, "Çok fazla hatalı deneme oldu. 15 dakika sonra tekrar deneyin.");
  }

  const govde = await govdeOku(request);
  const kullaniciAdi = typeof govde.kullaniciAdi === "string" ? govde.kullaniciAdi.trim().toLowerCase().slice(0, 64) : "";
  const sifre = typeof govde.sifre === "string" ? govde.sifre : "";
  if (!kullaniciAdi || !sifre) return hata(400, "Kullanıcı adı ve şifreyi yazın.");

  const kisi = await db
    .prepare("SELECT id, sifre FROM kullanicilar WHERE kullanici_adi = ?")
    .bind(kullaniciAdi)
    .first<{ id: number; sifre: string }>();

  const dogru = sifre.length <= SINIR.sifreEnFazla && (await sifreDogrula(sifre, kisi?.sifre ?? SAHTE_KAYIT));
  if (!kisi || !dogru) {
    await db.prepare("INSERT INTO giris_denemeleri (ip, zaman) VALUES (?, ?)").bind(ip, simdi()).run();
    return hata(401, "Kullanıcı adı ya da şifre yanlış.");
  }

  const jeton = base64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const zaman = simdi();
  await db.batch([
    db
      .prepare("INSERT INTO oturumlar (anahtar, kullanici_id, olusturuldu, son_gorulme, cihaz) VALUES (?, ?, ?, ?, ?)")
      .bind(await sha256Hex(jeton), kisi.id, zaman, zaman, (request.headers.get("user-agent") ?? "").slice(0, 200)),
    db.prepare("DELETE FROM giris_denemeleri WHERE ip = ? OR zaman < ?").bind(ip, pencere),
    db.prepare("DELETE FROM oturumlar WHERE olusturuldu < ?").bind(new Date(Date.now() - OTURUM_MUTLAK_SN * 1000).toISOString())
  ]);

  return json({ ok: true }, 200, { "set-cookie": oturumCerezi(jeton, url) });
}

/* ── Doğrulama ─────────────────────────────────────────────────────────── */

function tamsayi(deger: unknown, ad: string, { min = 0, bos = false }: { min?: number; bos?: boolean } = {}): number | null {
  if (deger === null || deger === undefined || deger === "") {
    if (bos) return null;
    throw new GecersizGirdi(`${ad} gerekli.`);
  }
  if (typeof deger !== "number" || !Number.isInteger(deger)) throw new GecersizGirdi(`${ad} geçerli bir tutar değil.`);
  if (deger < min || deger > SINIR.tutarEnFazlaKurus) throw new GecersizGirdi(`${ad} izin verilen aralığın dışında.`);
  return deger;
}

function metin(deger: unknown, ad: string, enFazla: number, { gerekli = false }: { gerekli?: boolean } = {}) {
  const t = typeof deger === "string" ? deger.trim() : "";
  if (gerekli && !t) throw new GecersizGirdi(`${ad} gerekli.`);
  if (t.length > enFazla) throw new GecersizGirdi(`${ad} en fazla ${enFazla} karakter olabilir.`);
  return t;
}

function tarih(deger: unknown, ad: string, { bos = false }: { bos?: boolean } = {}): string | null {
  if ((deger === null || deger === undefined || deger === "") && bos) return null;
  if (!gecerliTarih(deger)) throw new GecersizGirdi(`${ad} geçerli bir tarih değil.`);
  return deger;
}

function id(deger: unknown, ad: string) {
  if (typeof deger !== "number" || !Number.isInteger(deger) || deger < 1) throw new GecersizGirdi(`${ad} seçilmeli.`);
  return deger;
}

/* ── Okuma ─────────────────────────────────────────────────────────────── */

type HesapSatiri = {
  id: number;
  ad: string;
  tur: HesapTuru;
  limit_kurus: number;
  kesim_gunu: number | null;
  son_odeme_gunu: number | null;
  asgari_orani_bp: number | null;
  sira: number;
};
type DurumSatiri = {
  id: number;
  hesap_id: number;
  tarih: string;
  ay: string;
  borc_kurus: number;
  limit_kurus: number | null;
  ekstre_kurus: number | null;
  asgari_kurus: number | null;
  son_odeme: string | null;
  aciklama: string;
};
type IslemSatiri = {
  id: number;
  tarih: string;
  hesap_id: number;
  aciklama: string;
  tutar_kurus: number;
  taksit: number;
  ekstre_ay: string;
  kategori: string;
  aciklama_not: string;
};
type GelirSatiri = {
  id: number;
  ad: string;
  tutar_kurus: number;
  para_birimi: ParaBirimi;
  beklenen_tarih: string;
  kesin: number;
  alindi_tarihi: string | null;
  duzenli_id: number | null;
  aciklama_not: string;
};
type DuzenliSatiri = {
  id: number;
  ad: string;
  tutar_kurus: number;
  para_birimi: ParaBirimi;
  gun: number;
  kesin: number;
  baslangic_ay: string;
  aktif: number;
  aciklama_not: string;
};

async function ayarlariOku(db: D1Veritabani): Promise<Ayarlar> {
  const { results } = await db.prepare("SELECT anahtar, deger FROM ayarlar").all<{ anahtar: string; deger: string }>();
  const ayarlar: Ayarlar = { ...VARSAYILAN_AYARLAR };
  for (const { anahtar, deger } of results) {
    const sayi = Number(deger);
    if (anahtar in ayarlar && Number.isFinite(sayi) && sayi >= 0) (ayarlar as Record<string, number>)[anahtar] = sayi;
  }
  // Bozuk bir kur (0, 1'den küçük) dövizli geliri sıfırlamasın: varsayılana dön.
  if (ayarlar.usdTry < KUR_SINIRI.enAz || ayarlar.usdTry > KUR_SINIRI.enCok) ayarlar.usdTry = VARSAYILAN_AYARLAR.usdTry;
  return ayarlar;
}

async function veriOku(db: D1Veritabani): Promise<Veri> {
  const pencere = gunEkle(istanbulBugun(), -ISLEM_PENCERESI_GUN);
  const [hesaplar, durum, islemler, gelirler, duzenli, ayarlar] = await Promise.all([
    db
      .prepare("SELECT id, ad, tur, limit_kurus, kesim_gunu, son_odeme_gunu, asgari_orani_bp, sira FROM hesaplar WHERE aktif = 1 ORDER BY sira, id")
      .all<HesapSatiri>(),
    db
      .prepare(
        `SELECT id, hesap_id, tarih, ay, borc_kurus, limit_kurus, ekstre_kurus, asgari_kurus, son_odeme, aciklama
           FROM durum_kayitlari ORDER BY tarih, id`
      )
      .all<DurumSatiri>(),
    db
      .prepare(
        `SELECT id, tarih, hesap_id, aciklama, tutar_kurus, taksit, ekstre_ay, kategori, aciklama_not
           FROM islemler WHERE tarih >= ? OR taksit > 1 ORDER BY tarih DESC, id DESC LIMIT 3000`
      )
      .bind(pencere)
      .all<IslemSatiri>(),
    db
      .prepare(
        `SELECT id, ad, tutar_kurus, para_birimi, beklenen_tarih, kesin, alindi_tarihi, duzenli_id, aciklama_not
           FROM gelirler WHERE alindi_tarihi IS NULL OR alindi_tarihi >= ? ORDER BY beklenen_tarih, id`
      )
      .bind(pencere)
      .all<GelirSatiri>(),
    db
      .prepare("SELECT id, ad, tutar_kurus, para_birimi, gun, kesin, baslangic_ay, aktif, aciklama_not FROM duzenli_gelirler ORDER BY id")
      .all<DuzenliSatiri>(),
    ayarlariOku(db)
  ]);

  return {
    hesaplar: hesaplar.results.map<Hesap>((h) => ({
      id: h.id,
      ad: h.ad,
      tur: h.tur,
      limit: h.limit_kurus,
      kesimGunu: h.kesim_gunu,
      sonOdemeGunu: h.son_odeme_gunu,
      asgariOrani: h.asgari_orani_bp === null ? null : h.asgari_orani_bp / 10_000,
      sira: h.sira
    })),
    durum: durum.results.map<Durum>((d) => ({
      id: d.id,
      hesapId: d.hesap_id,
      tarih: d.tarih,
      ay: d.ay,
      borc: d.borc_kurus,
      limit: d.limit_kurus,
      ekstre: d.ekstre_kurus,
      asgari: d.asgari_kurus,
      sonOdeme: d.son_odeme,
      not: d.aciklama
    })),
    islemler: islemler.results.map<Islem>((i) => ({
      id: i.id,
      tarih: i.tarih,
      hesapId: i.hesap_id,
      aciklama: i.aciklama,
      tutar: i.tutar_kurus,
      taksit: i.taksit,
      ekstreAy: i.ekstre_ay,
      kategori: i.kategori,
      not: i.aciklama_not
    })),
    gelirler: gelirler.results.map<Gelir>((g) => ({
      id: g.id,
      ad: g.ad,
      tutar: g.tutar_kurus,
      paraBirimi: g.para_birimi === "USD" ? "USD" : "TRY",
      beklenenTarih: g.beklenen_tarih,
      kesin: g.kesin === 1,
      alindiTarihi: g.alindi_tarihi,
      duzenliId: g.duzenli_id,
      not: g.aciklama_not
    })),
    duzenliGelirler: duzenli.results.map<DuzenliGelir>((k) => ({
      id: k.id,
      ad: k.ad,
      tutar: k.tutar_kurus,
      paraBirimi: k.para_birimi === "USD" ? "USD" : "TRY",
      gun: k.gun,
      kesin: k.kesin === 1,
      baslangicAy: k.baslangic_ay,
      aktif: k.aktif === 1,
      not: k.aciklama_not
    })),
    ayarlar
  };
}

/* ── Yazma ─────────────────────────────────────────────────────────────── */

async function islemDogrula(db: D1Veritabani, g: Record<string, unknown>): Promise<IslemGirdisi & { ekstreAy: string }> {
  const hesapId = id(g.hesapId, "Kart");
  const hesap = await db.prepare("SELECT tur, kesim_gunu FROM hesaplar WHERE id = ? AND aktif = 1").bind(hesapId).first<{ tur: HesapTuru; kesim_gunu: number | null }>();
  if (!hesap) throw new GecersizGirdi("Kart bulunamadı.");
  if (hesap.tur !== "kart") throw new GecersizGirdi("İşlem yalnızca kredi kartına eklenir.");

  const gun = tarih(g.tarih, "Tarih") as string;
  if (gun > gunEkle(istanbulBugun(), 31)) throw new GecersizGirdi("Tarih çok ileride görünüyor.");
  const tutar = tamsayi(g.tutar, "Tutar", { min: -SINIR.tutarEnFazlaKurus }) as number;
  if (tutar === 0) throw new GecersizGirdi("Tutar sıfır olamaz.");
  const taksit = typeof g.taksit === "number" ? g.taksit : 1;
  if (!Number.isInteger(taksit) || taksit < 1 || taksit > SINIR.taksitEnFazla) {
    throw new GecersizGirdi(`Taksit 1 ile ${SINIR.taksitEnFazla} arasında olmalı.`);
  }
  if (g.ekstreAy !== undefined && g.ekstreAy !== null && g.ekstreAy !== "" && !gecerliAy(g.ekstreAy)) {
    throw new GecersizGirdi("Ekstre ayı geçerli değil.");
  }

  return {
    tarih: gun,
    hesapId,
    aciklama: metin(g.aciklama, "Açıklama", SINIR.aciklamaEnFazla, { gerekli: true }),
    tutar,
    taksit,
    kategori: metin(g.kategori, "Kategori", SINIR.kategoriEnFazla),
    not: metin(g.not, "Not", SINIR.notEnFazla),
    ekstreAy: typeof g.ekstreAy === "string" && g.ekstreAy ? g.ekstreAy : ekstreAyi(gun, hesap.kesim_gunu)
  };
}

async function islemYaz(db: D1Veritabani, g: Record<string, unknown>, islemId: number | null) {
  const i = await islemDogrula(db, g);
  if (islemId === null) {
    await db
      .prepare(
        `INSERT INTO islemler (tarih, hesap_id, aciklama, tutar_kurus, taksit, ekstre_ay, kategori, aciklama_not, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(i.tarih, i.hesapId, i.aciklama, i.tutar, i.taksit, i.ekstreAy, i.kategori ?? "", i.not ?? "", simdi())
      .run();
    return;
  }
  const sonuc = await db
    .prepare(
      `UPDATE islemler SET tarih = ?, hesap_id = ?, aciklama = ?, tutar_kurus = ?, taksit = ?, ekstre_ay = ?, kategori = ?, aciklama_not = ?
        WHERE id = ?`
    )
    .bind(i.tarih, i.hesapId, i.aciklama, i.tutar, i.taksit, i.ekstreAy, i.kategori ?? "", i.not ?? "", islemId)
    .run();
  if (!sonuc.meta.changes) throw new GecersizGirdi("İşlem bulunamadı.");
}

async function durumYaz(db: D1Veritabani, g: Record<string, unknown>) {
  const hesapId = id(g.hesapId, "Hesap");
  const hesap = await db.prepare("SELECT id FROM hesaplar WHERE id = ? AND aktif = 1").bind(hesapId).first();
  if (!hesap) throw new GecersizGirdi("Hesap bulunamadı.");

  const girdi: DurumGirdisi = {
    hesapId,
    tarih: (tarih(g.tarih ?? istanbulBugun(), "Tarih") as string),
    borc: tamsayi(g.borc, "Borç") as number,
    limit: tamsayi(g.limit, "Limit", { bos: true }),
    ekstre: tamsayi(g.ekstre, "Ekstre borcu", { bos: true }),
    asgari: tamsayi(g.asgari, "Asgari ödeme", { bos: true }),
    sonOdeme: tarih(g.sonOdeme, "Son ödeme", { bos: true }),
    not: metin(g.not, "Not", SINIR.notEnFazla)
  };
  if (girdi.tarih! > gunEkle(istanbulBugun(), 1)) throw new GecersizGirdi("Ölçüm tarihi gelecekte olamaz.");

  const sorgular = [
    db
      .prepare(
        `INSERT INTO durum_kayitlari (hesap_id, tarih, ay, borc_kurus, limit_kurus, ekstre_kurus, asgari_kurus, son_odeme, aciklama, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (hesap_id, tarih) DO UPDATE SET
           borc_kurus = excluded.borc_kurus, limit_kurus = excluded.limit_kurus, ekstre_kurus = excluded.ekstre_kurus,
           asgari_kurus = excluded.asgari_kurus, son_odeme = excluded.son_odeme, aciklama = excluded.aciklama`
      )
      .bind(hesapId, girdi.tarih!, ayiAl(girdi.tarih!), girdi.borc, girdi.limit ?? null, girdi.ekstre ?? null, girdi.asgari ?? null, girdi.sonOdeme ?? null, girdi.not ?? "", simdi())
  ];
  // Limit girildiyse hesabın güncel limiti de değişir (banka limiti artırdı/düşürdü).
  if (girdi.limit !== null && girdi.limit !== undefined) {
    sorgular.push(db.prepare("UPDATE hesaplar SET limit_kurus = ? WHERE id = ?").bind(girdi.limit, hesapId));
  }
  await db.batch(sorgular);
}

function paraBirimi(deger: unknown): ParaBirimi {
  if (deger === undefined || deger === null || deger === "") return "TRY";
  if (!PARA_BIRIMLERI.includes(deger as ParaBirimi)) throw new GecersizGirdi("Para birimi TRY ya da USD olabilir.");
  return deger as ParaBirimi;
}

async function gelirDogrula(db: D1Veritabani, g: Record<string, unknown>): Promise<GelirGirdisi & { paraBirimi: ParaBirimi; duzenliId: number | null }> {
  let duzenliId: number | null = null;
  if (g.duzenliId !== undefined && g.duzenliId !== null) {
    duzenliId = id(g.duzenliId, "Düzenli gelir");
    if (!(await db.prepare("SELECT id FROM duzenli_gelirler WHERE id = ?").bind(duzenliId).first())) throw new GecersizGirdi("Düzenli gelir bulunamadı.");
  }
  return {
    ad: metin(g.ad, "Ad", SINIR.adEnFazla, { gerekli: true }),
    tutar: tamsayi(g.tutar, "Tutar", { min: 1 }) as number,
    paraBirimi: paraBirimi(g.paraBirimi),
    beklenenTarih: tarih(g.beklenenTarih, "Beklenen tarih") as string,
    kesin: g.kesin === false ? false : true,
    alindiTarihi: tarih(g.alindiTarihi, "Alındığı tarih", { bos: true }),
    duzenliId,
    not: metin(g.not, "Not", SINIR.notEnFazla)
  };
}

async function gelirYaz(db: D1Veritabani, g: Record<string, unknown>, gelirId: number | null) {
  const x = await gelirDogrula(db, g);
  if (gelirId === null) {
    await db
      .prepare(
        `INSERT INTO gelirler (ad, tutar_kurus, para_birimi, beklenen_tarih, kesin, alindi_tarihi, duzenli_id, aciklama_not, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(x.ad, x.tutar, x.paraBirimi, x.beklenenTarih, x.kesin ? 1 : 0, x.alindiTarihi ?? null, x.duzenliId, x.not ?? "", simdi())
      .run();
    return;
  }
  const sonuc = await db
    .prepare(
      `UPDATE gelirler SET ad = ?, tutar_kurus = ?, para_birimi = ?, beklenen_tarih = ?, kesin = ?, alindi_tarihi = ?, duzenli_id = ?, aciklama_not = ? WHERE id = ?`
    )
    .bind(x.ad, x.tutar, x.paraBirimi, x.beklenenTarih, x.kesin ? 1 : 0, x.alindiTarihi ?? null, x.duzenliId, x.not ?? "", gelirId)
    .run();
  if (!sonuc.meta.changes) throw new GecersizGirdi("Gelir kaydı bulunamadı.");
}

async function duzenliDogrula(db: D1Veritabani, g: Record<string, unknown>, kalemId: number | null): Promise<DuzenliGelirGirdisi & { aktif: boolean }> {
  const ad = metin(g.ad, "Ad", SINIR.adEnFazla, { gerekli: true });
  const gun = g.gun;
  if (typeof gun !== "number" || !Number.isInteger(gun) || gun < 1 || gun > 31) throw new GecersizGirdi("Gün 1 ile 31 arasında olmalı.");
  if (!gecerliAy(g.baslangicAy)) throw new GecersizGirdi("Başlangıç ayı geçerli değil.");
  const ayni = await db.prepare("SELECT id FROM duzenli_gelirler WHERE ad = ? AND id != ?").bind(ad, kalemId ?? -1).first();
  if (ayni) throw new GecersizGirdi("Bu adla başka bir düzenli gelir var.");
  return {
    ad,
    tutar: tamsayi(g.tutar, "Tutar", { min: 1 }) as number,
    paraBirimi: paraBirimi(g.paraBirimi),
    gun,
    kesin: g.kesin === true,
    baslangicAy: g.baslangicAy,
    aktif: g.aktif === false ? false : true,
    not: metin(g.not, "Not", SINIR.notEnFazla)
  };
}

async function duzenliYaz(db: D1Veritabani, g: Record<string, unknown>, kalemId: number | null) {
  const x = await duzenliDogrula(db, g, kalemId);
  if (kalemId === null) {
    await db
      .prepare(
        `INSERT INTO duzenli_gelirler (ad, tutar_kurus, para_birimi, gun, kesin, baslangic_ay, aktif, aciklama_not, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(x.ad, x.tutar, x.paraBirimi, x.gun, x.kesin ? 1 : 0, x.baslangicAy, x.aktif ? 1 : 0, x.not ?? "", simdi())
      .run();
    return;
  }
  const sonuc = await db
    .prepare(
      `UPDATE duzenli_gelirler SET ad = ?, tutar_kurus = ?, para_birimi = ?, gun = ?, kesin = ?, baslangic_ay = ?, aktif = ?, aciklama_not = ? WHERE id = ?`
    )
    .bind(x.ad, x.tutar, x.paraBirimi, x.gun, x.kesin ? 1 : 0, x.baslangicAy, x.aktif ? 1 : 0, x.not ?? "", kalemId)
    .run();
  if (!sonuc.meta.changes) throw new GecersizGirdi("Düzenli gelir bulunamadı.");
}

/** USD/TRY kuru (tahmin). Yalnızca bu ayar elle değiştirilir; faiz oranları içe aktarıcıdan gelir. */
async function kurYaz(db: D1Veritabani, g: Record<string, unknown>) {
  const kur = g.usdTry;
  if (typeof kur !== "number" || !Number.isFinite(kur) || kur < KUR_SINIRI.enAz || kur > KUR_SINIRI.enCok) {
    throw new GecersizGirdi(`Kur ${KUR_SINIRI.enAz} ile ${KUR_SINIRI.enCok} arasında olmalı (örn. 50,40).`);
  }
  await db
    .prepare("INSERT INTO ayarlar (anahtar, deger) VALUES ('usdTry', ?) ON CONFLICT (anahtar) DO UPDATE SET deger = excluded.deger")
    .bind(String(Math.round(kur * 10_000) / 10_000))
    .run();
}

async function sil(db: D1Veritabani, tablo: "islemler" | "durum_kayitlari" | "gelirler" | "duzenli_gelirler", kayitId: number, ad: string) {
  const sonuc = await db.prepare(`DELETE FROM ${tablo} WHERE id = ?`).bind(kayitId).run();
  if (!sonuc.meta.changes) throw new GecersizGirdi(`${ad} bulunamadı.`);
}

/* ── Giriş noktası ─────────────────────────────────────────────────────── */

/**
 * /api/borc/<kaynak>[/<id>]. `path` index.ts'te sondaki eğik çizgisi atılmış hâliyle gelir.
 */
export async function borcApi(request: Request, env: BorcEnv, path: string): Promise<Response> {
  const db = env.BORC_DB;
  if (!db) return hata(503, "Borç takibi bu ortamda kurulu değil.");

  const url = new URL(request.url);
  const yontem = request.method.toUpperCase();
  const [, , , kaynak = "", kayitMetni] = path.split("/"); // ["", "api", "borc", kaynak, id]
  const kayitId = kayitMetni !== undefined && /^\d{1,12}$/.test(kayitMetni) ? Number(kayitMetni) : null;
  if (kayitMetni !== undefined && kayitId === null) return hata(404, "Bulunamadı.");

  try {
    // CSRF'in ikinci katı (SameSite=Strict zaten birinci): tarayıcı Origin gönderiyorsa bizim olmalı.
    if (yontem !== "GET" && yontem !== "HEAD") {
      const origin = request.headers.get("origin");
      if (origin !== null && origin !== url.origin) return hata(403, "İstek reddedildi.");
    }

    if (kaynak === "giris" && yontem === "POST") return await girisYap(request, db, url);

    const oturum = await oturumBul(request, db);
    if (!oturum) return hata(401, "Oturum kapalı. Giriş yapın.", { "set-cookie": cerezSil(url) });

    const yanit = async (): Promise<Response> => {
      if (kaynak === "veri" && yontem === "GET") {
        return json({ ok: true, veri: await veriOku(db), kullanici: { kullaniciAdi: oturum.kullaniciAdi } });
      }
      if (kaynak === "cikis" && yontem === "POST") {
        await db.prepare("DELETE FROM oturumlar WHERE anahtar = ?").bind(oturum.anahtar).run();
        return json({ ok: true }, 200, { "set-cookie": cerezSil(url) });
      }

      if (kaynak === "islemler") {
        if (yontem === "POST" && kayitId === null) await islemYaz(db, await govdeOku(request), null);
        else if (yontem === "PUT" && kayitId !== null) await islemYaz(db, await govdeOku(request), kayitId);
        else if (yontem === "DELETE" && kayitId !== null) await sil(db, "islemler", kayitId, "İşlem");
        else return hata(405, "Bu işlem desteklenmiyor.");
      } else if (kaynak === "durum") {
        if (yontem === "PUT" && kayitId === null) await durumYaz(db, await govdeOku(request));
        else if (yontem === "DELETE" && kayitId !== null) await sil(db, "durum_kayitlari", kayitId, "Ölçüm");
        else return hata(405, "Bu işlem desteklenmiyor.");
      } else if (kaynak === "gelirler") {
        if (yontem === "POST" && kayitId === null) await gelirYaz(db, await govdeOku(request), null);
        else if (yontem === "PUT" && kayitId !== null) await gelirYaz(db, await govdeOku(request), kayitId);
        else if (yontem === "DELETE" && kayitId !== null) await sil(db, "gelirler", kayitId, "Gelir kaydı");
        else return hata(405, "Bu işlem desteklenmiyor.");
      } else if (kaynak === "duzenli-gelirler") {
        if (yontem === "POST" && kayitId === null) await duzenliYaz(db, await govdeOku(request), null);
        else if (yontem === "PUT" && kayitId !== null) await duzenliYaz(db, await govdeOku(request), kayitId);
        else if (yontem === "DELETE" && kayitId !== null) await sil(db, "duzenli_gelirler", kayitId, "Düzenli gelir");
        else return hata(405, "Bu işlem desteklenmiyor.");
      } else if (kaynak === "kur") {
        if (yontem === "PUT" && kayitId === null) await kurYaz(db, await govdeOku(request));
        else return hata(405, "Bu işlem desteklenmiyor.");
      } else {
        return hata(404, "Bulunamadı.");
      }

      // Her yazma güncel verinin tamamını döner: ekran tek yerden tazelenir.
      return json({ ok: true, veri: await veriOku(db) });
    };

    const sonuc = await yanit();
    if (oturum.tazele) sonuc.headers.append("set-cookie", oturumCerezi(oturum.jeton, url));
    return sonuc;
  } catch (e) {
    if (e instanceof GecersizGirdi) return hata(400, e.message);
    // Ayrıntıyı (SQL, rakam) kullanıcıya da loglara da yazma: yalnızca hata türü.
    console.error("borc: beklenmeyen hata", e instanceof Error ? e.name : "bilinmiyor");
    return hata(500, "Bir sorun oluştu. Tekrar deneyin.");
  }
}
