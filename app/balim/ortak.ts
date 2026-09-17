/**
 * Balım panelinde sayfa ile Worker'ın ortak dili: API'nin taşıdığı şekiller,
 * iki tarafın da uyduğu sınırlar ve ikisinin de yazdığı tutar/tarih biçimleri.
 * worker/balim.ts de buradan okur — bir alan değişecekse tek yerde değişir.
 */

export type Kisi = { id: number; kullaniciAdi: string; ad: string };

/** Linki kim ekledi: bir kişinin id'si ya da komut satırından ekleyen Claude. */
export type LinkEkleyen = number | "claude";

/** `ekleyen` sunucuda yazılır; bu alan gelmeden önce eklenmiş linklerde yok. */
export type Link = { url: string; not: string; ekleyen?: LinkEkleyen };

export type Alinacak = {
  id: number;
  ad: string;
  kategori: string;
  adet: number;
  /** Kuruş. null: fiyat henüz belli değil. */
  birimFiyat: number | null;
  linkler: Link[];
  aciklama: string;
  alindi: boolean;
  alinmaZamani: string | null;
  ekleyenId: number | null;
  olusturuldu: string;
  guncellendi: string;
};

export type Yapilacak = {
  id: number;
  baslik: string;
  aciklama: string;
  /** "YYYY-MM-DD", İstanbul takvimi. */
  sonTarih: string | null;
  sorumluId: number | null;
  tamamlandi: boolean;
  tamamlanmaZamani: string | null;
  ekleyenId: number | null;
  olusturuldu: string;
  guncellendi: string;
};

export type Gider = {
  id: number;
  ad: string;
  /** Kuruş, aylık. */
  tutar: number;
  /** "YYYY-MM": ilk ödemenin ayı. */
  baslangic: string;
  bitis: string | null;
  odemeGunu: number;
  ekleyenId: number | null;
  olusturuldu: string;
  guncellendi: string;
};

export type Odeme = {
  id: number;
  giderId: number;
  ay: string;
  tutar: number;
  /** "YYYY-MM-DD" */
  odemeTarihi: string;
  odeyenId: number | null;
  olusturuldu: string;
};

export type Gorsel = {
  id: string;
  baslik: string;
  kategori: string;
  tur: string;
  boyut: number;
  genislik: number | null;
  yukseklik: number | null;
  kucukVar: boolean;
  ekleyenId: number | null;
  olusturuldu: string;
};

export type EtkinlikTuru = "alinacak" | "yapilacak" | "gider" | "odeme" | "gorsel" | "ayar" | "kisi";

export type Etkinlik = {
  id: number;
  kullaniciId: number | null;
  tur: EtkinlikTuru;
  /** Hazır cümle parçası: "listeye ekledi", "ödendi olarak işaretledi". */
  eylem: string;
  metin: string;
  zaman: string;
};

export type Ayarlar = { acilisTarihi: string | null };

export type Veri = {
  ben: Kisi;
  kisiler: Kisi[];
  alinacaklar: Alinacak[];
  yapilacaklar: Yapilacak[];
  giderler: Gider[];
  odemeler: Odeme[];
  gorseller: Gorsel[];
  ayarlar: Ayarlar;
  etkinlikler: Etkinlik[];
  /** En son etkinliğin id'si; açık sayfalar değişip değişmediğine buna bakar. */
  surum: number;
} & Omit<Surum, "surum">;

/** Açık sayfaların birkaç saniyede bir sorduğu üç sayı. */
export type Surum = {
  /** Liste, iş, gider, görsel: en son etkinliğin id'si. */
  surum: number;
  /** En son sohbet mesajının id'si. */
  mesajSurum: number;
  /** Başkalarının yazıp bu kişinin henüz görmediği mesaj sayısı. */
  okunmamis: number;
};

export type Mesaj = {
  id: number;
  kullaniciId: number | null;
  metin: string;
  gorsel: { id: string; genislik: number | null; yukseklik: number | null } | null;
  olusturuldu: string;
};

export type BildirimTercihleri = {
  /** Başkası sohbete yazınca. */
  sohbet: boolean;
  /** Listeye kalem, iş, gider, görsel eklenince ya da işaretlenince. */
  degisiklikler: boolean;
  /** Sabah: yaklaşan kira günü, bugün biten iş. */
  hatirlatmalar: boolean;
};

export const VARSAYILAN_TERCIHLER: BildirimTercihleri = { sohbet: true, degisiklikler: true, hatirlatmalar: true };

/** Sohbette paylaşılan fotoğraflar Görseller'de bu kategoriyle görünür. */
export const SOHBET_KATEGORISI = "Sohbet";

export const SINIR = {
  ad: 120,
  kategori: 40,
  aciklama: 2000,
  baslik: 200,
  giderAdi: 80,
  kisiAdi: 40,
  mesaj: 2000,
  linkSayisi: 10,
  url: 2000,
  linkNotu: 120,
  adet: 100_000,
  /** Kuruş: 10 milyar TL. Gerçek bir fiyat değil, yanlış yazılmış sayıyı yakalamak için. */
  tutar: 1_000_000_000_000,
  sifreEnAz: 6,
  sifreEnFazla: 200,
  gorselBayt: 15 * 1024 * 1024,
  kucukBayt: 2 * 1024 * 1024
} as const;

/** SVG yok: aynı adresten sunulan bir SVG içine betik taşıyabilir. */
export const GORSEL_TURLERI: readonly string[] = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export const ALINACAK_KATEGORILERI = [
  "Mutfak ve bar",
  "Mobilya",
  "Servis ve tabak",
  "Dekorasyon",
  "Aydınlatma ve elektrik",
  "Tadilat",
  "Tabela ve reklam",
  "Temizlik ve sarf",
  "Resmi işler",
  "Diğer"
];

export const GORSEL_KATEGORILERI = ["Yapay zeka", "İlham", "Dükkan", "Logo ve tabela", "Menü", "Diğer"];

export const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık"
];

const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const TAM_SAYI = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const KURUSLU = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 2500000 → "25.000 TL", 124990 → "1.249,90 TL" */
export function tl(kurus: number) {
  return `${girdiTutari(kurus)} TL`;
}

/**
 * Özet rakamları için tam liraya yuvarlanmış hâli: 7439980 → "74.400 TL".
 * Toplamlarda kuruş yalnızca kalabalık eder ve telefonda satırı taşırır;
 * kalemin kendi fiyatı `tl` ile kuruşuyla yazılmaya devam eder.
 */
export function tlYuvarlak(kurus: number) {
  return `${TAM_SAYI.format(Math.round(kurus / 100))} TL`;
}

/** Bir tutarın düzenleme kutusuna yazılacak hâli: "25.000", "1.249,90". */
export function girdiTutari(kurus: number) {
  return (kurus % 100 === 0 ? TAM_SAYI : KURUSLU).format(kurus / 100);
}

/**
 * Elle yazılmış tutarı kuruşa çevirir. Türkçe yazımı esas alır: nokta binlik,
 * virgül kuruş ayıracı ("1.249,90"). Virgülsüz tek nokta ancak ardından bir iki
 * hane geliyorsa kuruş sayılır ("12.5"); üç hane binliktir ("12.500").
 * Boş metin null, okunamayan NaN döner.
 */
export function tutarOku(metin: string): number | null {
  const temiz = metin.replace(/\s|tl|₺/gi, "");
  if (!temiz) return null;

  let sayi = temiz;
  if (temiz.includes(",")) sayi = temiz.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(temiz)) sayi = temiz.replace(/\./g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(sayi)) return Number.NaN;
  return Math.round(Number(sayi) * 100);
}

/** "2026-10" → "Ekim 2026" */
export function ayYazisi(ay: string) {
  const [yil, no] = ay.split("-").map(Number);
  return `${AYLAR[no - 1]} ${yil}`;
}

/** "2026-10-01" → "1 Ekim 2026", istenirse haftanın günüyle. */
export function tarihYazisi(gun: string, { yil = true, haftaGunu = false } = {}) {
  const [y, a, g] = gun.split("-").map(Number);
  const hafta = GUNLER[new Date(Date.UTC(y, a - 1, g)).getUTCDay()];
  return `${g} ${AYLAR[a - 1]}${yil ? ` ${y}` : ""}${haftaGunu ? `, ${hafta}` : ""}`;
}

/** "2026-10-01" → "1 Eki" */
export function kisaTarih(gun: string) {
  const [, a, g] = gun.split("-").map(Number);
  return `${g} ${AYLAR[a - 1].slice(0, 3)}`;
}

/**
 * Yapıştırılan adresi saklanacak hâle getirir: şemasız "trendyol.com/..."
 * https ile tamamlanır, http/https dışındaki her şey (javascript: dahil)
 * reddedilir. Okunamıyorsa null.
 */
export function linkDuzelt(girdi: string): string | null {
  const metin = girdi.trim();
  if (!metin) return null;
  const tam = /^https?:\/\//i.test(metin) ? metin : /^[a-z][a-z0-9+.-]*:/i.test(metin) ? null : `https://${metin}`;
  if (!tam) return null;
  try {
    const adres = new URL(tam);
    if (adres.protocol !== "https:" && adres.protocol !== "http:") return null;
    if (!adres.hostname.includes(".") && adres.hostname !== "localhost") return null;
    return adres.href;
  } catch {
    return null;
  }
}

/** "https://www.trendyol.com/..." → "trendyol.com" */
export function alanAdi(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
