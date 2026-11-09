/**
 * /borc — bütün hesap mantığı burada: ekstre ayı, taksit dağılımı, toplamlar,
 * faiz tahmini, takvim. Sayfa da Worker da aynı fonksiyonları kullanır; ortak
 * kuralın iki yerde ayrı yazılıp ayrışmaması için.
 *
 * Bilerek SAF ve bağımlılıksız: yalnızca `import type`, hiç yan etki yok,
 * `erasableSyntaxOnly` uyumlu (enum/namespace yok). Böylece
 * `node scripts/borc-test.mjs` bu dosyayı derleyicisiz doğrudan çalıştırır.
 *
 * Tutarlar kuruş, tarihler "YYYY-MM-DD", aylar "YYYY-MM". Tarih işlemi UTC'de
 * yapılır (saat dilimi kayması olmasın diye); "bugün" dışarıdan verilir,
 * İstanbul gününü hesaplamak çağıranın işi (bkz. istanbulBugun).
 */

import type { Ayarlar, DuzenliGelir, Durum, Gelir, Hesap, Islem, ParaBirimi, Veri } from "./ortak";

/* ── Takvim yardımcıları ───────────────────────────────────────────────── */

const gunSayisi = (yil: number, ay1: number) => new Date(Date.UTC(yil, ay1, 0)).getUTCDate();

const iki = (n: number) => String(n).padStart(2, "0");

export function istanbulBugun(simdi: Date = new Date()): string {
  // en-CA "YYYY-MM-DD" verir; timeZone bunu İstanbul gününe çevirir.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(simdi);
}

export const ayiAl = (tarih: string) => tarih.slice(0, 7);

/** "2026-11" + 2 → "2027-01". Negatif sayı geriye gider. */
export function ayEkle(ay: string, n: number): string {
  const [yil, ay1] = ay.split("-").map(Number);
  const sira = yil * 12 + (ay1 - 1) + n;
  return `${Math.floor(sira / 12)}-${iki((sira % 12) + 1)}`;
}

/** b − a, ay olarak. */
export function ayFarki(a: string, b: string): number {
  const [ya, ma] = a.split("-").map(Number);
  const [yb, mb] = b.split("-").map(Number);
  return (yb - ya) * 12 + (mb - ma);
}

/** Ayın `gun`'ü; ayda o gün yoksa (31 Şubat) ayın son günü. */
export function ayinGunu(ay: string, gun: number): string {
  const [yil, ay1] = ay.split("-").map(Number);
  return `${ay}-${iki(Math.min(gun, gunSayisi(yil, ay1)))}`;
}

const gunSirasi = (tarih: string) => {
  const [y, a, g] = tarih.split("-").map(Number);
  return Date.UTC(y, a - 1, g) / 86_400_000;
};

export const gunFarki = (a: string, b: string) => Math.round(gunSirasi(b) - gunSirasi(a));

export function gunEkle(tarih: string, n: number): string {
  return new Date((gunSirasi(tarih) + n) * 86_400_000).toISOString().slice(0, 10);
}

/** "2026-02-30" gibi var olmayan günleri de yakalar. */
export function gecerliTarih(deger: unknown): deger is string {
  if (typeof deger !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(deger)) return false;
  const [y, a, g] = deger.split("-").map(Number);
  return a >= 1 && a <= 12 && g >= 1 && g <= gunSayisi(y, a) && y >= 2000 && y <= 2100;
}

export const gecerliAy = (deger: unknown): deger is string =>
  typeof deger === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(deger);

/* ── Ekstre ve taksit ──────────────────────────────────────────────────── */

/**
 * Bir harcamanın düşeceği ekstrenin ayı. Harcama günü kesim gününden BÜYÜKSE
 * sonraki ayın ekstresine düşer; kesim gününün kendisi hâlâ bu ekstrededir.
 * Kesim günü bilinmiyorsa (KMH, işyeri) harcamanın kendi ayı.
 */
export function ekstreAyi(tarih: string, kesimGunu: number | null): string {
  const ay = ayiAl(tarih);
  if (!kesimGunu) return ay;
  const kesim = Number(ayinGunu(ay, kesimGunu).slice(8));
  return Number(tarih.slice(8)) > kesim ? ayEkle(ay, 1) : ay;
}

/**
 * Taksitli harcamayı ekstrelere böler. Tutar taksit sayısına bölünür; kuruş
 * artığı ilk taksite gider, böylece parçaların toplamı her zaman harcamaya eşit.
 */
export function taksitDagilimi(tutar: number, taksit: number, ilkEkstreAy: string): { ay: string; tutar: number }[] {
  const adet = Math.max(1, Math.floor(taksit));
  const tane = Math.trunc(tutar / adet);
  const arti = tutar - tane * adet;
  return Array.from({ length: adet }, (_, i) => ({ ay: ayEkle(ilkEkstreAy, i), tutar: i === 0 ? tane + arti : tane }));
}

/* ── Güncel durum ──────────────────────────────────────────────────────── */

/** Hesap başına en yeni ölçüm. Aynı tarihte iki kayıt varsa sonra yazılan. */
export function guncelDurumlar(durum: Durum[]): Map<number, Durum> {
  const sonuc = new Map<number, Durum>();
  for (const d of durum) {
    const eski = sonuc.get(d.hesapId);
    if (!eski || d.tarih > eski.tarih || (d.tarih === eski.tarih && d.id > eski.id)) sonuc.set(d.hesapId, d);
  }
  return sonuc;
}

export type HesapDurumu = {
  hesap: Hesap;
  durum: Durum | null;
  borc: number;
  limit: number;
  /** 0-1; limit yoksa null. 1'i aşabilir (limit aşımı). */
  kullanim: number | null;
  kalanLimit: number | null;
  ekstre: number | null;
  /** Bankanın yazdığı asgari; yoksa ekstre × oran tahmini. */
  asgari: number | null;
  asgariTahmini: boolean;
  sonOdeme: string | null;
  /** Ölçümün tarihi: "bu rakam ne kadar eski?" */
  olcumTarihi: string | null;
};

export function asgariBul(hesap: Hesap, durum: Durum | null, ayarlar: Ayarlar) {
  if (hesap.tur !== "kart" || !durum) return { asgari: null, tahmini: false };
  if (durum.asgari !== null) return { asgari: durum.asgari, tahmini: false };
  if (durum.ekstre === null) return { asgari: null, tahmini: false };
  return { asgari: Math.round(durum.ekstre * (hesap.asgariOrani ?? ayarlar.varsayilanAsgariOrani)), tahmini: true };
}

export function hesapDurumlari(veri: Veri): HesapDurumu[] {
  const guncel = guncelDurumlar(veri.durum);
  return [...veri.hesaplar]
    .sort((a, b) => a.sira - b.sira || a.id - b.id)
    .map((hesap) => {
      const durum = guncel.get(hesap.id) ?? null;
      const limit = durum?.limit ?? hesap.limit;
      const borc = durum?.borc ?? 0;
      const { asgari, tahmini } = asgariBul(hesap, durum, veri.ayarlar);
      return {
        hesap,
        durum,
        borc,
        limit,
        kullanim: limit > 0 ? borc / limit : null,
        kalanLimit: limit > 0 ? limit - borc : null,
        ekstre: hesap.tur === "kart" ? (durum?.ekstre ?? null) : null,
        asgari,
        asgariTahmini: tahmini,
        sonOdeme: hesap.tur === "kart" ? (durum?.sonOdeme ?? null) : null,
        olcumTarihi: durum?.tarih ?? null
      };
    });
}

/* ── Pano ──────────────────────────────────────────────────────────────── */

export type Senaryo = {
  /** Ekstreleri tamamen ödersem ödenecek. */
  ekstreToplami: number;
  /** Yalnızca asgari ödersem ödenecek. */
  asgariToplami: number;
  /** Asgari ödenirse sonraki aya devreden kart borcu. */
  devreden: number;
  kartFaizi: number;
  kmhFaizi: number;
  /** Asgari ödenirse tahmini aylık faiz (kart + KMH). */
  aylikFaiz: number;
};

export type Pano = {
  kartBorcu: number;
  kmhBorcu: number;
  digerBorcu: number;
  /** Toplam borç = kart + KMH + diğer. Diğer ayrı bir kalemdir; toplama bir kez eklenir, çift sayılmaz. */
  toplam: number;
  kartLimit: number;
  kmhLimit: number;
  kartKullanim: number | null;
  kmhKullanim: number | null;
  /** Kart + KMH borcunun, ikisinin toplam limitine oranı. */
  toplamKullanim: number | null;
  hesaplar: HesapDurumu[];
  senaryo: Senaryo;
  /** En yeni ölçümün tarihi. */
  guncelTarih: string | null;
};

/**
 * Faiz tahmini. Kart: asgari ödenince kalan (devreden) tutar, eşiğin altı/üstü
 * için ayrı aylık oranla, vergi çarpanıyla. KMH: borcun tamamı faiz işler.
 * Bu bir TAHMİNDİR — bankanın günlük faiz hesabı ve ödeme günleri farklı olabilir.
 */
export function senaryoHesapla(durumlar: HesapDurumu[], ayarlar: Ayarlar): Senaryo {
  let ekstreToplami = 0;
  let asgariToplami = 0;
  let devreden = 0;
  let kartFaizi = 0;
  let kmhFaizi = 0;

  for (const d of durumlar) {
    if (d.hesap.tur === "kart") {
      const ekstre = d.ekstre ?? 0;
      const asgari = Math.min(d.asgari ?? 0, ekstre);
      const kalan = ekstre - asgari;
      ekstreToplami += ekstre;
      asgariToplami += asgari;
      devreden += kalan;
      const oran = kalan > ayarlar.faizEsigi ? ayarlar.kartFaiziUst : ayarlar.kartFaiziAlt;
      kartFaizi += kalan * oran * ayarlar.vergiCarpani;
    } else if (d.hesap.tur === "kmh") {
      kmhFaizi += d.borc * ayarlar.kmhFaizi * ayarlar.vergiCarpani;
    }
  }

  const kart = Math.round(kartFaizi);
  const kmh = Math.round(kmhFaizi);
  return { ekstreToplami, asgariToplami, devreden, kartFaizi: kart, kmhFaizi: kmh, aylikFaiz: kart + kmh };
}

export function panoHesapla(veri: Veri): Pano {
  const hesaplar = hesapDurumlari(veri);
  const topla = (tur: Hesap["tur"], alan: "borc" | "limit") =>
    hesaplar.filter((h) => h.hesap.tur === tur).reduce((t, h) => t + h[alan], 0);

  const kartBorcu = topla("kart", "borc");
  const kmhBorcu = topla("kmh", "borc");
  const digerBorcu = topla("diger", "borc");
  const kartLimit = topla("kart", "limit");
  const kmhLimit = topla("kmh", "limit");
  const oran = (borc: number, limit: number) => (limit > 0 ? borc / limit : null);

  return {
    kartBorcu,
    kmhBorcu,
    digerBorcu,
    toplam: aylikToplam(kartBorcu, kmhBorcu, digerBorcu) ?? 0,
    kartLimit,
    kmhLimit,
    kartKullanim: oran(kartBorcu, kartLimit),
    kmhKullanim: oran(kmhBorcu, kmhLimit),
    // Limit kullanımı yalnızca kart + KMH'dedir: diğer borçların limiti yoktur.
    toplamKullanim: oran(kartBorcu + kmhBorcu, kartLimit + kmhLimit),
    hesaplar,
    senaryo: senaryoHesapla(hesaplar, veri.ayarlar),
    guncelTarih: veri.durum.reduce<string | null>((en, d) => (en === null || d.tarih > en ? d.tarih : en), null)
  };
}

/**
 * Bir ayın toplam borcu: kart + KMH + diğer. Üç türden de kayıt yoksa null ("0" değil, "veri yok");
 * yalnızca diğer kaydı olan ayda toplam diğerin kendisidir. Diğer bir kez sayılır.
 */
export function aylikToplam(kart: number | null, kmh: number | null, diger: number | null): number | null {
  return kart === null && kmh === null && diger === null ? null : (kart ?? 0) + (kmh ?? 0) + (diger ?? 0);
}

/** Ay ay kart / KMH / diğer borç. Her ay için o aya kadarki en yeni ölçüm. */
export function borcGecmisi(veri: Veri, sonAy: number = 14) {
  const aylar = [...new Set(veri.durum.map((d) => d.ay))].sort().slice(-sonAy);
  return aylar.map((ay) => {
    const toplam = { ay, kart: 0, kmh: 0, diger: 0 };
    for (const hesap of veri.hesaplar) {
      const son = guncelDurumlar(veri.durum.filter((d) => d.hesapId === hesap.id && d.ay <= ay)).get(hesap.id);
      if (son) toplam[hesap.tur] += son.borc;
    }
    return toplam;
  });
}

/* ── Taksit planı ──────────────────────────────────────────────────────── */

/** Kartın henüz kesilmemiş ilk ekstresi: bugün yapılacak bir harcama buraya düşer. */
export const sonrakiEkstreAyi = (bugun: string, kesimGunu: number | null) => ekstreAyi(bugun, kesimGunu);

export type TaksitliAlisveris = {
  islem: Islem;
  hesap: Hesap;
  aylikTutar: number;
  /** Henüz ekstreye düşmemiş taksit sayısı. */
  kalanTaksit: number;
  kalanToplam: number;
  /** Son taksidin düştüğü ekstre ayı. */
  bitisAy: string;
};

export type TaksitPlani = {
  /** Sütunlar: bugünün ayından başlayarak `ayAdedi` ay. */
  aylar: string[];
  satirlar: { hesap: Hesap; hucreler: number[]; toplam: number; sonrakiEkstre: string }[];
  /** Ay sütunlarının toplamı (tüm kartlar). */
  toplamlar: number[];
  genelToplam: number;
  taksitliler: TaksitliAlisveris[];
  /** Kart başına: sonraki ekstreye düşecek her şey (tek çekim + taksit), kuruş. */
  sonrakiEkstreyeDusen: Map<number, number>;
};

export function taksitPlani(veri: Veri, bugun: string, ayAdedi: number = 12): TaksitPlani {
  const baslangic = ayiAl(bugun);
  const aylar = Array.from({ length: ayAdedi }, (_, i) => ayEkle(baslangic, i));
  const kartlar = veri.hesaplar.filter((h) => h.tur === "kart").sort((a, b) => a.sira - b.sira || a.id - b.id);
  const kartSirasi = new Map(kartlar.map((k) => [k.id, k]));

  const hucre = new Map<number, number[]>(kartlar.map((k) => [k.id, aylar.map(() => 0)]));
  const sonrakiEkstreyeDusen = new Map<number, number>(kartlar.map((k) => [k.id, 0]));
  const taksitliler: TaksitliAlisveris[] = [];

  for (const islem of veri.islemler) {
    const hesap = kartSirasi.get(islem.hesapId);
    if (!hesap) continue;
    const sonraki = sonrakiEkstreAyi(bugun, hesap.kesimGunu);
    const parcalar = taksitDagilimi(islem.tutar, islem.taksit, islem.ekstreAy);

    let kalanToplam = 0;
    let kalanTaksit = 0;
    for (const parca of parcalar) {
      if (parca.ay < sonraki) continue; // zaten bir ekstrede
      if (parca.ay === sonraki) sonrakiEkstreyeDusen.set(hesap.id, (sonrakiEkstreyeDusen.get(hesap.id) ?? 0) + parca.tutar);
      if (islem.taksit > 1) {
        kalanToplam += parca.tutar;
        kalanTaksit += 1;
        const sutun = aylar.indexOf(parca.ay);
        if (sutun !== -1) hucre.get(hesap.id)![sutun] += parca.tutar;
      }
    }
    if (islem.taksit > 1 && kalanTaksit > 0) {
      taksitliler.push({
        islem,
        hesap,
        aylikTutar: parcalar[1]?.tutar ?? parcalar[0].tutar,
        kalanTaksit,
        kalanToplam,
        bitisAy: parcalar[parcalar.length - 1].ay
      });
    }
  }

  const satirlar = kartlar.map((hesap) => {
    const hucreler = hucre.get(hesap.id)!;
    return { hesap, hucreler, toplam: hucreler.reduce((t, n) => t + n, 0), sonrakiEkstre: sonrakiEkstreAyi(bugun, hesap.kesimGunu) };
  });
  const toplamlar = aylar.map((_, i) => satirlar.reduce((t, s) => t + s.hucreler[i], 0));

  taksitliler.sort((a, b) => a.bitisAy.localeCompare(b.bitisAy) || b.kalanToplam - a.kalanToplam);
  return { aylar, satirlar, toplamlar, genelToplam: toplamlar.reduce((t, n) => t + n, 0), taksitliler, sonrakiEkstreyeDusen };
}

/* ── Gelir ─────────────────────────────────────────────────────────────── */

export type GelirDurumu = "alindi" | "gecikti" | "bekliyor";

export function gelirDurumu(gelir: Pick<Gelir, "alindiTarihi" | "beklenenTarih">, bugun: string): GelirDurumu {
  if (gelir.alindiTarihi) return "alindi";
  return gelir.beklenenTarih < bugun ? "gecikti" : "bekliyor";
}

/**
 * Döviz tutarının TL karşılığı (kuruş). `tutar` para biriminin 1/100'üdür (sent), kur "1 USD = x TL"
 * olduğundan sent × kur doğrudan kuruş verir. Kur bir TAHMİNDİR; resmî kur değildir.
 */
export function tlKarsiligi(tutar: number, paraBirimi: ParaBirimi | undefined, usdTry: number): number {
  if (paraBirimi !== "USD") return tutar;
  // Kur girilmemişken (0) dövizli tutar 0 sayılır: yanlış bir toplam göstermektense toplama katılmaz.
  return usdTry > 0 ? Math.round(tutar * usdTry) : 0;
}

/** Takvimde ve Gelir sekmesinde gösterilen tek bir gelir satırı: gerçek kayıt ya da düzenli kalemden türetilmiş plan. */
export type GelirOlayi = {
  anahtar: string;
  /** Gerçek kayıtsa gelirler.id; plansa null. */
  kayitId: number | null;
  duzenliId: number | null;
  ad: string;
  tarih: string;
  /** Kendi para biriminin 1/100'ü. */
  tutar: number;
  paraBirimi: ParaBirimi;
  /** TL karşılığı (kuruş). */
  tl: number;
  kesin: boolean;
  alindiTarihi: string | null;
  durum: GelirDurumu;
  /** true: kayıt yok, düzenli kalemin ayarından türetildi. "Alındı" denince kayıt açılır. */
  planli: boolean;
  not: string;
};

/**
 * Gerçek gelir kayıtları + düzenli kalemlerin önümüzdeki `ayAdedi` ayı için planlanan satırları.
 * Bir kalemin bir ayı için kayıt varsa (alınmış ya da geciken) o ay plan üretilmez. Planlı bir satırın
 * günü geçtiyse ve "Alındı" denmediyse GECİKEN ALACAK sayılır (işyeri ödemediyse beklenen davranış).
 */
export function gelirOlaylari(veri: Pick<Veri, "gelirler" | "ayarlar"> & { duzenliGelirler?: DuzenliGelir[] }, bugun: string, ayAdedi: number = 4): GelirOlayi[] {
  const kur = veri.ayarlar.usdTry;
  const olaylar: GelirOlayi[] = veri.gelirler.map((g) => ({
    anahtar: `kayit:${g.id}`,
    kayitId: g.id,
    duzenliId: g.duzenliId ?? null,
    ad: g.ad,
    tarih: g.beklenenTarih,
    tutar: g.tutar,
    paraBirimi: g.paraBirimi ?? "TRY",
    tl: tlKarsiligi(g.tutar, g.paraBirimi, kur),
    kesin: g.kesin,
    alindiTarihi: g.alindiTarihi,
    durum: gelirDurumu(g, bugun),
    planli: false,
    not: g.not
  }));

  const kayitli = new Set(veri.gelirler.filter((g) => g.duzenliId != null).map((g) => `${g.duzenliId}:${ayiAl(g.beklenenTarih)}`));
  for (const k of veri.duzenliGelirler ?? []) {
    if (!k.aktif) continue;
    for (let i = 0; i < ayAdedi; i += 1) {
      const ay = ayEkle(ayiAl(bugun), i);
      if (ay < k.baslangicAy || kayitli.has(`${k.id}:${ay}`)) continue;
      const tarih = ayinGunu(ay, k.gun);
      olaylar.push({
        anahtar: `plan:${k.id}:${ay}`,
        kayitId: null,
        duzenliId: k.id,
        ad: k.ad,
        tarih,
        tutar: k.tutar,
        paraBirimi: k.paraBirimi,
        tl: tlKarsiligi(k.tutar, k.paraBirimi, kur),
        kesin: k.kesin,
        alindiTarihi: null,
        durum: gelirDurumu({ alindiTarihi: null, beklenenTarih: tarih }, bugun),
        planli: true,
        not: k.not
      });
    }
  }
  return olaylar.sort((a, b) => a.tarih.localeCompare(b.tarih) || a.ad.localeCompare(b.ad, "tr"));
}

export function gelirOzeti(olaylar: GelirOlayi[], bugun: string) {
  let geciken = 0;
  let gecikenAdet = 0;
  let bekleyen = 0;
  let bekleyenAdet = 0;
  let alinanBuAy = 0;
  const bekleyenSon = gunEkle(bugun, 31);
  for (const o of olaylar) {
    if (o.durum === "gecikti") {
      geciken += o.tl;
      gecikenAdet += 1;
    } else if (o.durum === "bekliyor") {
      // Düzenli kalemlerin aylar sonrasına planlanan satırları “bekleyen” toplamını şişirmesin: 31 gün.
      if (o.tarih > bekleyenSon) continue;
      bekleyen += o.tl;
      bekleyenAdet += 1;
    } else if (o.alindiTarihi && ayiAl(o.alindiTarihi) === ayiAl(bugun)) {
      alinanBuAy += o.tl;
    }
  }
  return { geciken, gecikenAdet, bekleyen, bekleyenAdet, alinanBuAy };
}

export type AylikGelir = {
  /** Aktif düzenli kalemlerin aylık TL karşılığı toplamı (kuruş). */
  toplam: number;
  kalemler: { kalem: DuzenliGelir; tl: number }[];
  /** TL karşılığı USD kuruna bağlı bir kalem var mı (rakam bir tahmin içeriyor). */
  dovizVar: boolean;
  /** Yatış günü kesin olmayan bir kalem var mı. */
  belirsizVar: boolean;
};

/** Aylık gelir: aktif düzenli kalemler, dövizliler `usdTry` ile TL'ye çevrilmiş. */
export function aylikGelir(veri: Pick<Veri, "ayarlar"> & { duzenliGelirler?: DuzenliGelir[] }): AylikGelir {
  const kalemler = (veri.duzenliGelirler ?? [])
    .filter((k) => k.aktif)
    .map((kalem) => ({ kalem, tl: tlKarsiligi(kalem.tutar, kalem.paraBirimi, veri.ayarlar.usdTry) }));
  return {
    toplam: kalemler.reduce((t, k) => t + k.tl, 0),
    kalemler,
    dovizVar: kalemler.some((k) => k.kalem.paraBirimi !== "TRY"),
    belirsizVar: kalemler.some((k) => !k.kalem.kesin)
  };
}

/** Borcun kaç aylık gelire denk geldiği (ör. 5,1). Gelir tanımlı değilse null. */
export const borcGelirOrani = (borc: number, aylik: number): number | null => (aylik > 0 ? borc / aylik : null);

/* ── Takvim ────────────────────────────────────────────────────────────── */

export type TakvimOlayi = {
  anahtar: string;
  tarih: string;
  tur: "kesim" | "sonOdeme" | "gelir";
  baslik: string;
  hesapId?: number;
  /** Ödenecek ya da gelecek tutar (kuruş); bilinmiyorsa yok. */
  tutar?: number;
  asgari?: number;
  /** Tarih/tutar bir tahmin (son ödeme günü hafta sonuna göre kayabilir). */
  tahmini: boolean;
  /** Gelir: beklenen tarih geçti, alınmadı. */
  gecikmis: boolean;
  /** Gelir: tarih kesin değil. */
  belirsiz?: boolean;
  /** Gelir döviz cinsindense asıl tutar (TL karşılığı `tutar`ta); kur tahmindir. */
  doviz?: { tutar: number; paraBirimi: ParaBirimi };
  /** Bugünden kaç gün sonra; geçmişse negatif. */
  kalanGun: number;
  /** Son ödeme: hangi ekstrenin son ödemesi ("YYYY-MM"); kesin tarihli olan son kesilmiş ekstredir. */
  ekstreAy?: string;
  /** `tutar` (ve `asgari`) kesilmemiş ekstre için dönem içi harcama/taksitten tahmin edildi. */
  tutarTahmini?: boolean;
};

/**
 * Önümüzdeki `gun` günün ödeme / kesim / gelir takvimi, geciken gelirler en üstte.
 *
 * Son ödeme: bankanın yazdığı kesin tarih biliniyorsa (ve geçmediyse) o; bundan
 * sonra kesilecek ekstreler için kesim gününden "tahmini" tarih türetilir —
 * son ödeme günü kesim gününden küçükse ertesi aya sarkar.
 */
export function takvimOlaylari(veri: Veri, bugun: string, gun: number = 75): TakvimOlayi[] {
  const son = gunEkle(bugun, gun);
  const olaylar: TakvimOlayi[] = [];
  const guncel = guncelDurumlar(veri.durum);
  const kalan = (tarih: string) => gunFarki(bugun, tarih);
  // Kesilmemiş ilk ekstrenin tahmini tutarı için: o ekstreye düşen harcama + taksit (kart başına).
  const dusen = taksitPlani(veri, bugun, 1).sonrakiEkstreyeDusen;

  for (const hesap of veri.hesaplar) {
    if (hesap.tur !== "kart") continue;
    const durum = guncel.get(hesap.id) ?? null;
    const { asgari } = asgariBul(hesap, durum, veri.ayarlar);
    const kesinOdeme = durum?.sonOdeme && durum.sonOdeme >= bugun ? durum.sonOdeme : null;

    // Kesin son ödeme (kesilmiş ekstre).
    if (durum && kesinOdeme && kesinOdeme <= son) {
      olaylar.push({
        anahtar: `son:${hesap.id}:${kesinOdeme}`,
        tarih: kesinOdeme,
        tur: "sonOdeme",
        baslik: `${hesap.ad} son ödeme`,
        hesapId: hesap.id,
        tutar: durum.ekstre ?? undefined,
        asgari: asgari ?? undefined,
        tahmini: false,
        gecikmis: false,
        kalanGun: kalan(kesinOdeme)
      });
    }

    if (!hesap.kesimGunu) continue;
    // Bugünden başlayıp ufka kadar her kesim günü ve ondan türeyen tahmini son ödeme.
    for (let ay = ayiAl(bugun), i = 0; i < 4; ay = ayEkle(ay, 1), i += 1) {
      const kesim = ayinGunu(ay, hesap.kesimGunu);
      if (kesim < bugun || kesim > son) continue;
      olaylar.push({
        anahtar: `kesim:${hesap.id}:${kesim}`,
        tarih: kesim,
        tur: "kesim",
        baslik: `${hesap.ad} ekstre kesimi`,
        hesapId: hesap.id,
        tahmini: false,
        gecikmis: false,
        kalanGun: kalan(kesim)
      });

      if (!hesap.sonOdemeGunu) continue;
      const odemeAyi = hesap.sonOdemeGunu > hesap.kesimGunu ? ay : ayEkle(ay, 1);
      const odeme = ayinGunu(odemeAyi, hesap.sonOdemeGunu);
      if (odeme > son) continue;
      // Bankanın yazdığı kesin tarih varsa aynı ekstrenin tahminini ayrıca gösterme.
      if (kesinOdeme && Math.abs(gunFarki(kesinOdeme, odeme)) <= 6) continue;
      // Henüz kesilmemiş ilk ekstre: dönem içi harcama bilinen kadarıyla tahmin edilir (0 ise bilinmiyor sayılır).
      const tahminiTutar = ay === sonrakiEkstreAyi(bugun, hesap.kesimGunu) ? (dusen.get(hesap.id) ?? 0) : 0;
      olaylar.push({
        anahtar: `tson:${hesap.id}:${odeme}`,
        tarih: odeme,
        tur: "sonOdeme",
        baslik: `${hesap.ad} son ödeme`,
        hesapId: hesap.id,
        ...(tahminiTutar > 0
          ? {
              tutar: tahminiTutar,
              asgari: Math.round(tahminiTutar * (hesap.asgariOrani ?? veri.ayarlar.varsayilanAsgariOrani)),
              tutarTahmini: true
            }
          : {}),
        ekstreAy: ay,
        tahmini: true,
        gecikmis: false,
        kalanGun: kalan(odeme)
      });
    }
  }

  // Gelir: gerçek kayıtlar + düzenli kalemlerin planlı satırları (alınmışlar takvimde görünmez).
  for (const g of gelirOlaylari(veri, bugun)) {
    if (g.alindiTarihi) continue;
    const gecikmis = g.tarih < bugun;
    if (!gecikmis && g.tarih > son) continue;
    olaylar.push({
      anahtar: `gelir:${g.anahtar}`,
      tarih: g.tarih,
      tur: "gelir",
      baslik: g.ad,
      tutar: g.tl,
      doviz: g.paraBirimi === "TRY" ? undefined : { tutar: g.tutar, paraBirimi: g.paraBirimi },
      tahmini: !g.kesin,
      gecikmis,
      belirsiz: !g.kesin,
      kalanGun: kalan(g.tarih)
    });
  }

  return olaylar.sort((a, b) => Number(b.gecikmis) - Number(a.gecikmis) || a.tarih.localeCompare(b.tarih) || a.baslik.localeCompare(b.baslik, "tr"));
}

/* ── Faiz yardımcıları ─────────────────────────────────────────────────── */

/** Devreden kart borcunun bir aylık tahmini faizi (vergiler dahil), kuruş. */
export function kartFaizi(devreden: number, a: Ayarlar): number {
  if (devreden <= 0) return 0;
  return Math.round(devreden * (devreden <= a.faizEsigi ? a.kartFaiziAlt : a.kartFaiziUst) * a.vergiCarpani);
}

/** KMH eksi bakiyesinin bir aylık tahmini faizi (vergiler dahil), kuruş. */
export function kmhFaizi(borc: number, a: Ayarlar): number {
  return borc <= 0 ? 0 : Math.round(borc * a.kmhFaizi * a.vergiCarpani);
}

/* ── Aylar tablosu ve ay detayı ────────────────────────────────────────── */

/** Bir hesabın bir aydaki ÖLÇÜMÜ: ay içinde birden çok varsa en son tarihli (aynı tarihte sonra yazılan). */
function aylikSonOlcumler(durum: Durum[]): Map<string, Map<number, Durum>> {
  const aylar = new Map<string, Map<number, Durum>>();
  for (const d of durum) {
    const ay = aylar.get(d.ay) ?? new Map<number, Durum>();
    const eski = ay.get(d.hesapId);
    if (!eski || d.tarih > eski.tarih || (d.tarih === eski.tarih && d.id > eski.id)) ay.set(d.hesapId, d);
    aylar.set(d.ay, ay);
  }
  return aylar;
}

/** "Tüm aylar" tablosunun satırı. `null` = o ay o türden hiç kayıt yok (tabloda "–"; 0 sayılmaz). */
export type AylikOzet = {
  ay: string;
  kart: number | null;
  kmh: number | null;
  /** "Diğer" türü: işyeri / kişi borçları. */
  diger: number | null;
  /** Toplam borç = kart + KMH + diğer. Üç türden de kayıt yoksa null. */
  toplam: number | null;
  /** Bir önceki takvim ayına göre toplam farkı; iki ayın toplamı da varsa. */
  fark: number | null;
  kayitSayisi: number;
};

/**
 * Durum verisindeki ilk aydan son aya HER takvim ayı için bir satır (en eskiden en yeniye); hiç kaydı olmayan
 * aylar boş satır olur. Her ay, hesap başına o ayın son ölçümüyle hesaplanır.
 */
export function aylikOzetler(veri: Pick<Veri, "hesaplar" | "durum">): AylikOzet[] {
  if (veri.durum.length === 0) return [];
  const hesapTuru = new Map(veri.hesaplar.map((h) => [h.id, h.tur]));
  const olcumler = aylikSonOlcumler(veri.durum.filter((d) => hesapTuru.has(d.hesapId)));
  const aylar = [...olcumler.keys()].sort();
  if (aylar.length === 0) return [];

  const toplamlar = new Map<string, { kart: number | null; kmh: number | null; diger: number | null; adet: number }>();
  for (const [ay, hesaplar] of olcumler) {
    const t = { kart: null as number | null, kmh: null as number | null, diger: null as number | null, adet: 0 };
    for (const d of hesaplar.values()) {
      const tur = hesapTuru.get(d.hesapId)!;
      t[tur] = (t[tur] ?? 0) + d.borc;
      t.adet += 1;
    }
    toplamlar.set(ay, t);
  }

  const toplamBul = (ay: string) => {
    const t = toplamlar.get(ay);
    return t ? aylikToplam(t.kart, t.kmh, t.diger) : null;
  };

  const sonuc: AylikOzet[] = [];
  for (let ay = aylar[0]; ay <= aylar[aylar.length - 1]; ay = ayEkle(ay, 1)) {
    const t = toplamlar.get(ay);
    const toplam = toplamBul(ay);
    const onceki = toplamBul(ayEkle(ay, -1));
    sonuc.push({
      ay,
      kart: t?.kart ?? null,
      kmh: t?.kmh ?? null,
      diger: t?.diger ?? null,
      toplam,
      fark: toplam !== null && onceki !== null ? toplam - onceki : null,
      kayitSayisi: t?.adet ?? 0
    });
  }
  return sonuc;
}

export type AyHesapSatiri = { hesap: Hesap; durum: Durum; kullanim: number | null };

/** Bir ayın hesap kırılımı: kart → KMH → diğer, kendi sıralarına göre. */
export function ayDetayi(veri: Pick<Veri, "hesaplar" | "durum">, ay: string): AyHesapSatiri[] {
  const olcumler = aylikSonOlcumler(veri.durum).get(ay);
  if (!olcumler) return [];
  const tur = { kart: 0, kmh: 1, diger: 2 } as const;
  return veri.hesaplar
    .filter((h) => olcumler.has(h.id))
    .sort((a, b) => tur[a.tur] - tur[b.tur] || a.sira - b.sira || a.id - b.id)
    .map((hesap) => {
      const durum = olcumler.get(hesap.id)!;
      const limit = durum.limit ?? hesap.limit;
      return { hesap, durum, kullanim: limit > 0 ? durum.borc / limit : null };
    });
}

/* ── Ödeme senaryosu (hesap bazında) ───────────────────────────────────── */

export type OdemeSecenegi = { tur: "tam" } | { tur: "asgari" } | { tur: "ozel"; tutar: number };

/** Hangi ekstrenin üstünden: son kesilmiş ekstre mi, henüz kesilmemiş sonraki ekstrenin tahmini mi. */
export type BazEkstre = "son" | "sonraki";

export type SenaryoGirdisi = {
  hesap: Hesap;
  kmh: boolean;
  /** Üzerinden hesaplanan tutar: ekstre (KMH'de bakiye). */
  ekstre: number;
  asgari: number;
  asgariTahmini: boolean;
  /** Hangi ekstre ("YYYY-MM"); "son" bazında bilinmez (null), KMH'de de yok. */
  ekstreAy: string | null;
};

export type SenaryoSatiri = SenaryoGirdisi & {
  odeme: number;
  devreden: number;
  aylikFaiz: number;
  /** Ödeme asgarinin altında: gecikme faizi ve kart kısıtlaması riski. */
  asgariAltinda: boolean;
};

/**
 * Senaryonun girdileri. "son": her kartın son ekstresi (bankadan girilen ekstre ve asgari). "sonraki": kesilmemiş
 * ilk ekstrenin tahmini — yalnızca o ekstreye düşecek harcama ve taksit; son ekstrenin ödenmemiş kalanı DAHİL DEĞİL
 * (ödeme kaydı tutulmadığı için). KMH'de her iki durumda güncel eksi bakiye.
 */
export function senaryoGirdileri(veri: Veri, bugun: string, baz: BazEkstre): SenaryoGirdisi[] {
  const durumlar = hesapDurumlari(veri);
  const dusen = taksitPlani(veri, bugun, 1).sonrakiEkstreyeDusen;
  const girdiler: SenaryoGirdisi[] = [];

  for (const d of durumlar) {
    if (d.hesap.tur === "kmh") {
      if (d.borc > 0) girdiler.push({ hesap: d.hesap, kmh: true, ekstre: d.borc, asgari: 0, asgariTahmini: false, ekstreAy: null });
    } else if (d.hesap.tur === "kart") {
      if (baz === "son") {
        if (d.ekstre === null || d.ekstre <= 0) continue;
        girdiler.push({
          hesap: d.hesap,
          kmh: false,
          ekstre: d.ekstre,
          asgari: Math.min(d.asgari ?? 0, d.ekstre),
          asgariTahmini: d.asgariTahmini,
          ekstreAy: null
        });
      } else {
        const tutar = dusen.get(d.hesap.id) ?? 0;
        if (tutar <= 0) continue;
        const oran = d.hesap.asgariOrani ?? veri.ayarlar.varsayilanAsgariOrani;
        girdiler.push({
          hesap: d.hesap,
          kmh: false,
          ekstre: tutar,
          asgari: Math.round(tutar * oran),
          asgariTahmini: true,
          ekstreAy: sonrakiEkstreAyi(bugun, d.hesap.kesimGunu)
        });
      }
    }
  }
  return girdiler;
}

export function senaryoSatiri(girdi: SenaryoGirdisi, secenek: OdemeSecenegi, ayarlar: Ayarlar): SenaryoSatiri {
  const { ekstre, asgari, kmh } = girdi;
  let odeme: number;
  if (kmh) {
    // KMH'de asgari yok: yalnızca "tam" ya da girilen tutar; "asgari" hiç ödememek demektir.
    odeme = secenek.tur === "tam" ? ekstre : secenek.tur === "ozel" ? Math.min(Math.max(0, secenek.tutar), ekstre) : 0;
  } else {
    odeme = secenek.tur === "tam" ? ekstre : secenek.tur === "asgari" ? Math.min(asgari, ekstre) : Math.max(0, secenek.tutar);
  }
  odeme = Math.min(odeme, ekstre);
  const devreden = Math.max(0, ekstre - odeme);
  return {
    ...girdi,
    odeme,
    devreden,
    aylikFaiz: kmh ? kmhFaizi(devreden, ayarlar) : kartFaizi(devreden, ayarlar),
    asgariAltinda: !kmh && ekstre > 0 && odeme < Math.min(asgari, ekstre)
  };
}

export function senaryoToplami(satirlar: SenaryoSatiri[]) {
  return satirlar.reduce(
    (t, s) => ({ odeme: t.odeme + s.odeme, devreden: t.devreden + s.devreden, faiz: t.faiz + s.aylikFaiz }),
    { odeme: 0, devreden: 0, faiz: 0 }
  );
}

/* ── Nakit akışı ───────────────────────────────────────────────────────── */

export type NakitTuru = "odeme" | "gelirKesin" | "gelirBelirsiz" | "alacak";

export type NakitSatiri = {
  anahtar: string;
  tarih: string;
  baslik: string;
  /** Çıkışlar eksi, girişler artı (kuruş). */
  tutar: number;
  tur: NakitTuru;
  /** Ödemenin tutarı kesilmemiş ekstrenin tahmininden geliyor. */
  tahmini: boolean;
  /** Yalnızca kesin kalemlerle yürüyen bakiye. */
  kesinBakiye: number;
  /** Belirsiz gelirler ve alacaklar da gelirse bakiye. */
  iyimserBakiye: number;
};

export type NakitAkisi = {
  satirlar: NakitSatiri[];
  baslangic: number;
  enDusukKesin: number;
  enDusukIyimser: number;
  toplamCikis: number;
  toplamKesinGiris: number;
  toplamBelirsizGiris: number;
  /** Tutarı hiç bilinmeyen (ekstresi kesilmemiş, işlemi de yok) son ödeme sayısı: akışa girmedi. */
  tutarsizOdemeSayisi: number;
};

/**
 * `ufuk` günlük bakiye seyri: eldeki nakit + gelirler − kartların son ödemeleri. `varsayim` "asgari" ya da "tam":
 * her kartın o ekstreden ne kadar ödeneceği. Vadesi geçmiş alacaklar "bugün" sırasına konur ve yalnızca iyimser
 * seriye girer; kesin bakiye belirsiz/alacak kalemlere güvenmez. KMH faizi ve günlük harcamalar dahil değildir.
 */
export function nakitAkisi(veri: Veri, bugun: string, varsayim: "asgari" | "tam", ufuk: number = 60): NakitAkisi {
  type Ham = { anahtar: string; tarih: string; baslik: string; tutar: number; tur: NakitTuru; tahmini: boolean };
  const ham: Ham[] = [];
  let tutarsizOdemeSayisi = 0;

  for (const o of takvimOlaylari(veri, bugun, ufuk)) {
    if (o.tur === "sonOdeme") {
      const miktar = varsayim === "asgari" ? (o.asgari ?? o.tutar) : o.tutar;
      if (miktar === undefined) {
        tutarsizOdemeSayisi += 1;
        continue;
      }
      if (miktar <= 0) continue;
      ham.push({
        anahtar: o.anahtar,
        tarih: o.tarih,
        baslik: `${o.baslik} (${varsayim === "asgari" ? "asgari" : "ekstre"}${o.tutarTahmini ? ", tahmini" : ""})`,
        tutar: -miktar,
        tur: "odeme",
        tahmini: o.tutarTahmini === true
      });
    } else if (o.tur === "gelir" && o.tutar !== undefined) {
      if (o.gecikmis) {
        ham.push({ anahtar: o.anahtar, tarih: bugun, baslik: `${o.baslik} (alacak, ${o.tarih} vadeli)`, tutar: o.tutar, tur: "alacak", tahmini: false });
      } else {
        ham.push({
          anahtar: o.anahtar,
          tarih: o.tarih,
          baslik: o.belirsiz ? `${o.baslik} (belirsiz)` : o.baslik,
          tutar: o.tutar,
          tur: o.belirsiz ? "gelirBelirsiz" : "gelirKesin",
          tahmini: false
        });
      }
    }
  }

  // Aynı gün: gelirler önce (hesaba geçtikten sonra ödeme), sonra ödemeler.
  ham.sort((a, b) => a.tarih.localeCompare(b.tarih) || Number(a.tutar < 0) - Number(b.tutar < 0) || a.baslik.localeCompare(b.baslik, "tr"));

  const baslangic = veri.ayarlar.eldekiNakit;
  let kesin = baslangic;
  let iyimser = baslangic;
  let enDusukKesin = baslangic;
  let enDusukIyimser = baslangic;
  let toplamCikis = 0;
  let toplamKesinGiris = 0;
  let toplamBelirsizGiris = 0;
  const satirlar: NakitSatiri[] = [];

  for (const h of ham) {
    if (h.tur === "odeme") {
      kesin += h.tutar;
      iyimser += h.tutar;
      toplamCikis -= h.tutar;
    } else if (h.tur === "gelirKesin") {
      kesin += h.tutar;
      iyimser += h.tutar;
      toplamKesinGiris += h.tutar;
    } else {
      iyimser += h.tutar;
      toplamBelirsizGiris += h.tutar;
    }
    enDusukKesin = Math.min(enDusukKesin, kesin);
    enDusukIyimser = Math.min(enDusukIyimser, iyimser);
    satirlar.push({ ...h, kesinBakiye: kesin, iyimserBakiye: iyimser });
  }

  return { satirlar, baslangic, enDusukKesin, enDusukIyimser, toplamCikis, toplamKesinGiris, toplamBelirsizGiris, tutarsizOdemeSayisi };
}

/* ── Borç dağılımı (halka grafik) ──────────────────────────────────────── */

/** Borcu olan her hesabın (kart, KMH ve diğer) toplam borçtaki payı; borcu olmayanlar dahil değil. */
export function borcDagilimi(pano: Pick<Pano, "hesaplar" | "toplam">) {
  return pano.hesaplar
    .filter((h) => h.borc > 0)
    .map((h) => ({ hesap: h.hesap, borc: h.borc, pay: pano.toplam > 0 ? h.borc / pano.toplam : 0 }))
    .sort((a, b) => b.borc - a.borc);
}
