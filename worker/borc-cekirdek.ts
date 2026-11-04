/**
 * Borç takibinin ortak veri katmanı: doğrulama, okuma ve yazma. İKİ yerden
 * kullanılır ve ikisi de aynı SQL'i çalıştırır:
 *
 *  - worker/borc.ts   → mgumrah.com/borc, kişisel panel (tek kullanıcı, kendi D1'i)
 *  - worker/balim.ts  → Balım › Borçlar, işletme paneli (yetkili kullanıcılar, Balım D1'i)
 *
 * Oturum ve yetki burada YOK, çağıranda: bu dosya "kim?" sorusunu sormaz, yalnızca
 * "bu istek veriyle ne yapar?" sorusunu yanıtlar. Çağıran, bu dosyayı çağırmadan
 * önce kullanıcıyı doğrulamak ve yetkisini denetlemekle yükümlüdür.
 *
 * İki veritabanında tablolar aynı şemada, yalnızca adları farklı (Balım'da
 * `borc_` öneki; çünkü Balım'ın kendi `ayarlar` tablosu var). Adlar `Tablolar`
 * ile gelir ve hep bu dosyadaki sabitlerden: SQL'e giren tek dış değer bind
 * edilen parametrelerdir.
 *
 * Tipler index.ts'teki gerekçeyle satır içinde (workers-types ile DOM tipleri çakışır).
 */

import { ayiAl, ekstreAyi, gecerliAy, gecerliTarih, gunEkle, istanbulBugun } from "../app/borc/hesap";
import {
  AYAR_SINIRI,
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
  type Hesap,
  type HesapTuru,
  type Islem,
  type IslemGirdisi,
  type ParaBirimi,
  type Veri
} from "../app/borc/ortak";

export type D1Deger = string | number | null;
export type D1Sonuc<T> = { results: T[]; meta: { changes?: number; last_row_id?: number } };
export type D1Sorgu = {
  bind(...degerler: D1Deger[]): D1Sorgu;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Sonuc<T>>;
  run(): Promise<D1Sonuc<unknown>>;
};
export type D1Veritabani = {
  prepare(sql: string): D1Sorgu;
  batch(sorgular: D1Sorgu[]): Promise<D1Sonuc<unknown>[]>;
};

export type Tablolar = {
  hesaplar: string;
  durum: string;
  islemler: string;
  gelirler: string;
  duzenli: string;
  ayarlar: string;
};

/** /borc'un kendi D1'indeki adlar (migrations/borc). */
export const BORC_TABLOLARI: Tablolar = {
  hesaplar: "hesaplar",
  durum: "durum_kayitlari",
  islemler: "islemler",
  gelirler: "gelirler",
  duzenli: "duzenli_gelirler",
  ayarlar: "ayarlar"
};

/** Balım D1'indeki adlar (migrations/balim/0003_borclar.sql). */
export const BALIM_BORC_TABLOLARI: Tablolar = {
  hesaplar: "borc_hesaplar",
  durum: "borc_durum_kayitlari",
  islemler: "borc_islemler",
  gelirler: "borc_gelirler",
  duzenli: "borc_duzenli_gelirler",
  ayarlar: "borc_ayarlar"
};

export type CekirdekAyari = {
  tablolar: Tablolar;
  /** Kur hiç girilmemişse görünecek değer: kişisel panelde tahmini kur, işletmede 0 (girilmedi). */
  varsayilanKur: number;
};

/** Kullanıcıya olduğu gibi gösterilecek bir doğrulama hatası. */
export class GecersizGirdi extends Error {}

const simdi = () => new Date().toISOString();

const GOVDE_EN_FAZLA = 20_000;
/** Hesaplamada kullanılan işlem penceresi (taksitliler her zaman gelir). */
const ISLEM_PENCERESI_GUN = 400;

/** Yazma uçlarının gövdesini okur: JSON olmalı ve küçük kalmalı. */
export async function govdeOku(request: Request): Promise<Record<string, unknown>> {
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

function gunNo(deger: unknown, ad: string): number | null {
  if (deger === null || deger === undefined || deger === "") return null;
  if (typeof deger !== "number" || !Number.isInteger(deger) || deger < 1 || deger > 31) throw new GecersizGirdi(`${ad} 1 ile 31 arasında olmalı.`);
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

function ayarlariCoz(satirlar: { anahtar: string; deger: string }[], varsayilanKur: number): Ayarlar {
  const ayarlar: Ayarlar = { ...VARSAYILAN_AYARLAR, usdTry: varsayilanKur };
  for (const { anahtar, deger } of satirlar) {
    const sayi = Number(deger);
    if (anahtar in ayarlar && Number.isFinite(sayi) && sayi >= 0) (ayarlar as Record<string, number>)[anahtar] = sayi;
  }
  // Bozuk bir kur (1'den küçük, 0 hariç) dövizli geliri sıfırlamasın: varsayılana dön. 0 = "girilmedi", geçerlidir.
  if (ayarlar.usdTry !== 0 && (ayarlar.usdTry < KUR_SINIRI.enAz || ayarlar.usdTry > KUR_SINIRI.enCok)) ayarlar.usdTry = varsayilanKur;
  return ayarlar;
}

/** Bir isteğin okuduğu her şey tek toplu sorguda (tek D1 çağrısı). */
export async function veriOku(db: D1Veritabani, c: CekirdekAyari): Promise<Veri> {
  const t = c.tablolar;
  const pencere = gunEkle(istanbulBugun(), -ISLEM_PENCERESI_GUN);
  const [hesaplar, durum, islemler, gelirler, duzenli, ayarlar] = (await db.batch([
    db.prepare(`SELECT id, ad, tur, limit_kurus, kesim_gunu, son_odeme_gunu, asgari_orani_bp, sira FROM ${t.hesaplar} WHERE aktif = 1 ORDER BY sira, id`),
    db.prepare(
      `SELECT id, hesap_id, tarih, ay, borc_kurus, limit_kurus, ekstre_kurus, asgari_kurus, son_odeme, aciklama
         FROM ${t.durum} ORDER BY tarih, id`
    ),
    db
      .prepare(
        `SELECT id, tarih, hesap_id, aciklama, tutar_kurus, taksit, ekstre_ay, kategori, aciklama_not
           FROM ${t.islemler} WHERE tarih >= ? OR taksit > 1 ORDER BY tarih DESC, id DESC LIMIT 3000`
      )
      .bind(pencere),
    db
      .prepare(
        `SELECT id, ad, tutar_kurus, para_birimi, beklenen_tarih, kesin, alindi_tarihi, duzenli_id, aciklama_not
           FROM ${t.gelirler} WHERE alindi_tarihi IS NULL OR alindi_tarihi >= ? ORDER BY beklenen_tarih, id`
      )
      .bind(pencere),
    db.prepare(`SELECT id, ad, tutar_kurus, para_birimi, gun, kesin, baslangic_ay, aktif, aciklama_not FROM ${t.duzenli} ORDER BY id`),
    db.prepare(`SELECT anahtar, deger FROM ${t.ayarlar}`)
  ])) as [
    D1Sonuc<HesapSatiri>,
    D1Sonuc<DurumSatiri>,
    D1Sonuc<IslemSatiri>,
    D1Sonuc<GelirSatiri>,
    D1Sonuc<DuzenliSatiri>,
    D1Sonuc<{ anahtar: string; deger: string }>
  ];

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
    ayarlar: ayarlariCoz(ayarlar.results, c.varsayilanKur)
  };
}

/* ── Yazma ─────────────────────────────────────────────────────────────── */

async function islemDogrula(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>): Promise<IslemGirdisi & { ekstreAy: string }> {
  const hesapId = id(g.hesapId, "Kart");
  const hesap = await db.prepare(`SELECT tur, kesim_gunu FROM ${t.hesaplar} WHERE id = ? AND aktif = 1`).bind(hesapId).first<{ tur: HesapTuru; kesim_gunu: number | null }>();
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

async function islemYaz(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>, islemId: number | null) {
  const i = await islemDogrula(db, t, g);
  if (islemId === null) {
    await db
      .prepare(
        `INSERT INTO ${t.islemler} (tarih, hesap_id, aciklama, tutar_kurus, taksit, ekstre_ay, kategori, aciklama_not, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(i.tarih, i.hesapId, i.aciklama, i.tutar, i.taksit, i.ekstreAy, i.kategori ?? "", i.not ?? "", simdi())
      .run();
    return;
  }
  const sonuc = await db
    .prepare(
      `UPDATE ${t.islemler} SET tarih = ?, hesap_id = ?, aciklama = ?, tutar_kurus = ?, taksit = ?, ekstre_ay = ?, kategori = ?, aciklama_not = ?
        WHERE id = ?`
    )
    .bind(i.tarih, i.hesapId, i.aciklama, i.tutar, i.taksit, i.ekstreAy, i.kategori ?? "", i.not ?? "", islemId)
    .run();
  if (!sonuc.meta.changes) throw new GecersizGirdi("İşlem bulunamadı.");
}

async function durumYaz(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>) {
  const hesapId = id(g.hesapId, "Hesap");
  const hesap = await db.prepare(`SELECT id FROM ${t.hesaplar} WHERE id = ? AND aktif = 1`).bind(hesapId).first();
  if (!hesap) throw new GecersizGirdi("Hesap bulunamadı.");

  const girdi: DurumGirdisi = {
    hesapId,
    tarih: tarih(g.tarih ?? istanbulBugun(), "Tarih") as string,
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
        `INSERT INTO ${t.durum} (hesap_id, tarih, ay, borc_kurus, limit_kurus, ekstre_kurus, asgari_kurus, son_odeme, aciklama, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (hesap_id, tarih) DO UPDATE SET
           borc_kurus = excluded.borc_kurus, limit_kurus = excluded.limit_kurus, ekstre_kurus = excluded.ekstre_kurus,
           asgari_kurus = excluded.asgari_kurus, son_odeme = excluded.son_odeme, aciklama = excluded.aciklama`
      )
      .bind(hesapId, girdi.tarih!, ayiAl(girdi.tarih!), girdi.borc, girdi.limit ?? null, girdi.ekstre ?? null, girdi.asgari ?? null, girdi.sonOdeme ?? null, girdi.not ?? "", simdi())
  ];
  // Limit girildiyse hesabın güncel limiti de değişir (banka limiti artırdı/düşürdü).
  if (girdi.limit !== null && girdi.limit !== undefined) {
    sorgular.push(db.prepare(`UPDATE ${t.hesaplar} SET limit_kurus = ? WHERE id = ?`).bind(girdi.limit, hesapId));
  }
  await db.batch(sorgular);
}

function paraBirimi(deger: unknown): ParaBirimi {
  if (deger === undefined || deger === null || deger === "") return "TRY";
  if (!PARA_BIRIMLERI.includes(deger as ParaBirimi)) throw new GecersizGirdi("Para birimi TRY ya da USD olabilir.");
  return deger as ParaBirimi;
}

async function gelirDogrula(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>): Promise<GelirGirdisi & { paraBirimi: ParaBirimi; duzenliId: number | null }> {
  let duzenliId: number | null = null;
  if (g.duzenliId !== undefined && g.duzenliId !== null) {
    duzenliId = id(g.duzenliId, "Düzenli gelir");
    if (!(await db.prepare(`SELECT id FROM ${t.duzenli} WHERE id = ?`).bind(duzenliId).first())) throw new GecersizGirdi("Düzenli gelir bulunamadı.");
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

async function gelirYaz(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>, gelirId: number | null) {
  const x = await gelirDogrula(db, t, g);
  if (gelirId === null) {
    await db
      .prepare(
        `INSERT INTO ${t.gelirler} (ad, tutar_kurus, para_birimi, beklenen_tarih, kesin, alindi_tarihi, duzenli_id, aciklama_not, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(x.ad, x.tutar, x.paraBirimi, x.beklenenTarih, x.kesin ? 1 : 0, x.alindiTarihi ?? null, x.duzenliId, x.not ?? "", simdi())
      .run();
    return;
  }
  const sonuc = await db
    .prepare(
      `UPDATE ${t.gelirler} SET ad = ?, tutar_kurus = ?, para_birimi = ?, beklenen_tarih = ?, kesin = ?, alindi_tarihi = ?, duzenli_id = ?, aciklama_not = ? WHERE id = ?`
    )
    .bind(x.ad, x.tutar, x.paraBirimi, x.beklenenTarih, x.kesin ? 1 : 0, x.alindiTarihi ?? null, x.duzenliId, x.not ?? "", gelirId)
    .run();
  if (!sonuc.meta.changes) throw new GecersizGirdi("Gelir kaydı bulunamadı.");
}

async function duzenliDogrula(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>, kalemId: number | null): Promise<DuzenliGelirGirdisi & { aktif: boolean }> {
  const ad = metin(g.ad, "Ad", SINIR.adEnFazla, { gerekli: true });
  const gun = g.gun;
  if (typeof gun !== "number" || !Number.isInteger(gun) || gun < 1 || gun > 31) throw new GecersizGirdi("Gün 1 ile 31 arasında olmalı.");
  if (!gecerliAy(g.baslangicAy)) throw new GecersizGirdi("Başlangıç ayı geçerli değil.");
  const ayni = await db.prepare(`SELECT id FROM ${t.duzenli} WHERE ad = ? AND id != ?`).bind(ad, kalemId ?? -1).first();
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

async function duzenliYaz(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>, kalemId: number | null) {
  const x = await duzenliDogrula(db, t, g, kalemId);
  if (kalemId === null) {
    await db
      .prepare(
        `INSERT INTO ${t.duzenli} (ad, tutar_kurus, para_birimi, gun, kesin, baslangic_ay, aktif, aciklama_not, olusturuldu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(x.ad, x.tutar, x.paraBirimi, x.gun, x.kesin ? 1 : 0, x.baslangicAy, x.aktif ? 1 : 0, x.not ?? "", simdi())
      .run();
    return;
  }
  const sonuc = await db
    .prepare(
      `UPDATE ${t.duzenli} SET ad = ?, tutar_kurus = ?, para_birimi = ?, gun = ?, kesin = ?, baslangic_ay = ?, aktif = ?, aciklama_not = ? WHERE id = ?`
    )
    .bind(x.ad, x.tutar, x.paraBirimi, x.gun, x.kesin ? 1 : 0, x.baslangicAy, x.aktif ? 1 : 0, x.not ?? "", kalemId)
    .run();
  if (!sonuc.meta.changes) throw new GecersizGirdi("Düzenli gelir bulunamadı.");
}

/** Hesap: kart / KMH / diğer borç. Tür sonradan değişmez (kayıtları o türe göre okunur). */
async function hesapYaz(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>, hesapId: number | null) {
  const ad = metin(g.ad, "Hesap adı", SINIR.adEnFazla, { gerekli: true });
  if (g.tur !== "kart" && g.tur !== "kmh" && g.tur !== "diger") throw new GecersizGirdi("Hesap türü seçilmeli.");
  const tur: HesapTuru = g.tur;

  const ayni = await db.prepare(`SELECT id FROM ${t.hesaplar} WHERE ad = ? AND id != ?`).bind(ad, hesapId ?? -1).first();
  if (ayni) throw new GecersizGirdi("Bu adla başka bir hesap var.");

  const limit = tur === "diger" ? 0 : (tamsayi(g.limit ?? 0, "Limit") as number);
  const kesimGunu = tur === "kart" ? gunNo(g.kesimGunu, "Kesim günü") : null;
  const sonOdemeGunu = tur === "kart" ? gunNo(g.sonOdemeGunu, "Son ödeme günü") : null;
  let asgariBp: number | null = null;
  if (tur === "kart" && g.asgariOrani !== null && g.asgariOrani !== undefined && g.asgariOrani !== "") {
    if (typeof g.asgariOrani !== "number" || !Number.isFinite(g.asgariOrani) || g.asgariOrani < 0 || g.asgariOrani > 1) {
      throw new GecersizGirdi("Asgari ödeme oranı %0 ile %100 arasında olmalı.");
    }
    asgariBp = Math.round(g.asgariOrani * 10_000);
  }

  if (hesapId === null) {
    await db
      .prepare(
        `INSERT INTO ${t.hesaplar} (ad, tur, limit_kurus, kesim_gunu, son_odeme_gunu, asgari_orani_bp, sira, aktif)
         VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sira), 0) + 1 FROM ${t.hesaplar}), 1)`
      )
      .bind(ad, tur, limit, kesimGunu, sonOdemeGunu, asgariBp)
      .run();
    return;
  }

  const onceki = await db.prepare(`SELECT tur FROM ${t.hesaplar} WHERE id = ?`).bind(hesapId).first<{ tur: HesapTuru }>();
  if (!onceki) throw new GecersizGirdi("Hesap bulunamadı.");
  if (onceki.tur !== tur) throw new GecersizGirdi("Hesap türü sonradan değiştirilemez. Hesabı silip yeniden açın.");
  await db
    .prepare(`UPDATE ${t.hesaplar} SET ad = ?, limit_kurus = ?, kesim_gunu = ?, son_odeme_gunu = ?, asgari_orani_bp = ? WHERE id = ?`)
    .bind(ad, limit, kesimGunu, sonOdemeGunu, asgariBp, hesapId)
    .run();
}

/** USD/TRY kuru (tahmin). 0 = girilmedi; dövizli tutarlar o zaman TL toplamlara katılmaz. */
async function kurYaz(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>) {
  const kur = g.usdTry;
  const gecerli = typeof kur === "number" && Number.isFinite(kur) && (kur === 0 || (kur >= KUR_SINIRI.enAz && kur <= KUR_SINIRI.enCok));
  if (!gecerli) throw new GecersizGirdi(`Kur ${KUR_SINIRI.enAz} ile ${KUR_SINIRI.enCok} arasında olmalı (örn. 50,40); girmemek için 0 yazın.`);
  await ayarSorgusu(db, t, "usdTry", Math.round((kur as number) * 10_000) / 10_000).run();
}

const ayarSorgusu = (db: D1Veritabani, t: Tablolar, anahtar: string, deger: number) =>
  db
    .prepare(`INSERT INTO ${t.ayarlar} (anahtar, deger) VALUES (?, ?) ON CONFLICT (anahtar) DO UPDATE SET deger = excluded.deger`)
    .bind(anahtar, String(deger));

/** Faiz varsayımları ve eldeki nakit. Yalnızca gelen alanlar değişir; kur ayrı uçtan. */
async function ayarlarYaz(db: D1Veritabani, t: Tablolar, g: Record<string, unknown>) {
  const yazilacak: [string, number][] = [];
  for (const anahtar of Object.keys(AYAR_SINIRI) as (keyof typeof AYAR_SINIRI)[]) {
    if (!(anahtar in g)) continue;
    const sayi = g[anahtar];
    const { enAz, enCok } = AYAR_SINIRI[anahtar];
    if (typeof sayi !== "number" || !Number.isFinite(sayi) || sayi < enAz || sayi > enCok) {
      throw new GecersizGirdi(`${anahtar} ${enAz} ile ${enCok} arasında olmalı.`);
    }
    yazilacak.push([anahtar, Math.round(sayi * 1_000_000) / 1_000_000]);
  }
  for (const anahtar of ["faizEsigi", "eldekiNakit"] as const) {
    if (anahtar in g) yazilacak.push([anahtar, tamsayi(g[anahtar], anahtar === "eldekiNakit" ? "Eldeki nakit" : "Faiz eşiği") as number]);
  }
  if (yazilacak.length === 0) throw new GecersizGirdi("Değişiklik yok.");
  await db.batch(yazilacak.map(([anahtar, deger]) => ayarSorgusu(db, t, anahtar, deger)));
}

type SilinebilirTablo = Exclude<keyof Tablolar, "ayarlar">;

async function sil(db: D1Veritabani, t: Tablolar, tablo: SilinebilirTablo, kayitId: number, ad: string) {
  const sonuc = await db.prepare(`DELETE FROM ${t[tablo]} WHERE id = ?`).bind(kayitId).run();
  if (!sonuc.meta.changes) throw new GecersizGirdi(`${ad} bulunamadı.`);
}

/* ── Giriş noktası ─────────────────────────────────────────────────────── */

/** Yazma uçlarının sonucu: başarıda güncel verinin tamamı; yoksa istemciye gidecek durum kodu ve mesaj. */
export type UcSonucu = { veri: Veri } | { durum: 404 | 405; mesaj: string };

/**
 * Yazma uçları: /<kaynak>[/<id>]. Başarıda güncel verinin tamamını döner: ekran tek yerden tazelenir.
 * Okuma (`veri`), oturum ve yetki çağıranın işidir.
 */
export async function borcUcu(db: D1Veritabani, c: CekirdekAyari, request: Request, kaynak: string, kayitId: number | null): Promise<UcSonucu> {
  const t = c.tablolar;
  const yontem = request.method.toUpperCase();
  const yok = { durum: 405 as const, mesaj: "Bu işlem desteklenmiyor." };

  if (kaynak === "islemler") {
    if (yontem === "POST" && kayitId === null) await islemYaz(db, t, await govdeOku(request), null);
    else if (yontem === "PUT" && kayitId !== null) await islemYaz(db, t, await govdeOku(request), kayitId);
    else if (yontem === "DELETE" && kayitId !== null) await sil(db, t, "islemler", kayitId, "İşlem");
    else return yok;
  } else if (kaynak === "durum") {
    if (yontem === "PUT" && kayitId === null) await durumYaz(db, t, await govdeOku(request));
    else if (yontem === "DELETE" && kayitId !== null) await sil(db, t, "durum", kayitId, "Ölçüm");
    else return yok;
  } else if (kaynak === "gelirler") {
    if (yontem === "POST" && kayitId === null) await gelirYaz(db, t, await govdeOku(request), null);
    else if (yontem === "PUT" && kayitId !== null) await gelirYaz(db, t, await govdeOku(request), kayitId);
    else if (yontem === "DELETE" && kayitId !== null) await sil(db, t, "gelirler", kayitId, "Gelir kaydı");
    else return yok;
  } else if (kaynak === "duzenli-gelirler") {
    if (yontem === "POST" && kayitId === null) await duzenliYaz(db, t, await govdeOku(request), null);
    else if (yontem === "PUT" && kayitId !== null) await duzenliYaz(db, t, await govdeOku(request), kayitId);
    else if (yontem === "DELETE" && kayitId !== null) await sil(db, t, "duzenli", kayitId, "Düzenli gelir");
    else return yok;
  } else if (kaynak === "hesaplar") {
    if (yontem === "POST" && kayitId === null) await hesapYaz(db, t, await govdeOku(request), null);
    else if (yontem === "PUT" && kayitId !== null) await hesapYaz(db, t, await govdeOku(request), kayitId);
    else if (yontem === "DELETE" && kayitId !== null) await sil(db, t, "hesaplar", kayitId, "Hesap");
    else return yok;
  } else if (kaynak === "kur") {
    if (yontem === "PUT" && kayitId === null) await kurYaz(db, t, await govdeOku(request));
    else return yok;
  } else if (kaynak === "ayarlar") {
    if (yontem === "PUT" && kayitId === null) await ayarlarYaz(db, t, await govdeOku(request));
    else return yok;
  } else {
    return { durum: 404, mesaj: "Bulunamadı." };
  }

  return { veri: await veriOku(db, c) };
}
