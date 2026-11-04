/** /borc — gösterim ve giriş biçimleri. Tutarlar kuruş cinsinden tamsayıdır. */

const TAM = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const KURUSLU = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "64.250 ₺" — liste ve özetlerde kuruşsuz. */
export function tl(kurus: number): string {
  return `${TAM.format(Math.round(kurus / 100))} ₺`;
}

/** "64.250,40 ₺" — kuruşu da gösteren tam hâl (ayrıntı ve formlar). */
export function tlTam(kurus: number): string {
  return `${KURUSLU.format(kurus / 100)} ₺`;
}

/** Düzenleme kutusuna konacak sayı: "64250,4" → "64.250,40" değil, elle yazmaya uygun "64250,40". */
export function kurusMetni(kurus: number): string {
  const mutlak = Math.abs(kurus);
  const lira = Math.floor(mutlak / 100);
  const kr = mutlak % 100;
  return `${kurus < 0 ? "-" : ""}${lira}${kr ? `,${String(kr).padStart(2, "0")}` : ""}`;
}

/**
 * "1.249,90", "1249,9", "1249.90", "₺ 1 249,90", "-500" → kuruş. Geçersizse null.
 * Tek bir "." ve ardından tam 3 hane ("1.249") bin ayracı sayılır; Türkçe yazım böyle.
 */
export function kurusaCevir(girdi: string): number | null {
  let t = girdi.replace(/[₺\s]|TL/gi, "").replace(/−/g, "-");
  if (!t || !/^-?[\d.,]+$/.test(t)) return null;
  const eksi = t.startsWith("-");
  t = t.replace(/^-/, "");

  const sonVirgul = t.lastIndexOf(",");
  const sonNokta = t.lastIndexOf(".");
  if (sonVirgul !== -1 && sonNokta !== -1) {
    // İkisi de var: sonuncusu ondalık ayracıdır.
    const ondalik = sonVirgul > sonNokta ? "," : ".";
    const bin = ondalik === "," ? "." : ",";
    t = t.split(bin).join("").replace(ondalik, ".");
  } else if (sonVirgul !== -1) {
    if (t.split(",").length > 2) return null;
    t = t.replace(",", ".");
  } else if (sonNokta !== -1) {
    const parcalar = t.split(".");
    const binlik = parcalar.length > 1 && parcalar.slice(1).every((p) => p.length === 3) && parcalar[0].length <= 3;
    if (binlik) t = parcalar.join("");
    else if (parcalar.length > 2) return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const kurus = Math.round(Number(t) * 100);
  return eksi ? -kurus : kurus;
}

const AYLAR_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

const parcala = (tarih: string) => tarih.split("-").map(Number) as [number, number, number];

/** "2026-11-15" → "15 Kas" */
export function tarihKisa(tarih: string): string {
  const [, a, g] = parcala(tarih);
  return `${g} ${AYLAR_KISA[a - 1]}`;
}

/** "2026-11-15" → "15 Kas 2026" */
export function tarihTam(tarih: string): string {
  const [y] = parcala(tarih);
  return `${tarihKisa(tarih)} ${y}`;
}

export function gunAdi(tarih: string): string {
  const [y, a, g] = parcala(tarih);
  return GUNLER[new Date(Date.UTC(y, a - 1, g)).getUTCDay()];
}

/** "2026-12" → "Aralık 2026" */
export function ayAdi(ay: string): string {
  const [y, a] = ay.split("-").map(Number);
  return `${AYLAR[a - 1]} ${y}`;
}

/** "2026-12" → "Ara 26" (tablo başlığı) */
export function ayKisa(ay: string): string {
  const [y, a] = ay.split("-").map(Number);
  return `${AYLAR_KISA[a - 1]} ${String(y).slice(2)}`;
}

export function kalanYazi(kalanGun: number): string {
  if (kalanGun === 0) return "bugün";
  if (kalanGun === 1) return "yarın";
  if (kalanGun > 1) return `${kalanGun} gün sonra`;
  return `${-kalanGun} gün gecikti`;
}

export const yuzde = (oran: number | null) => (oran === null ? "—" : `%${Math.round(oran * 100)}`);

const SENT = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const KUR = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

/** Döviz tutarı: "150 USD", "149,90 USD". `sent` para biriminin 1/100'ü. */
export const dovizYazi = (sent: number, paraBirimi: string) => `${SENT.format(sent / 100)} ${paraBirimi}`;

/** Kur: "50,40" (en fazla 4 hane). */
export const kurYazi = (kur: number) => KUR.format(kur);

/** Kur kutusuna yazılan "50,4" / "50.40" → 50.4; geçersizse null. */
export function kurCevir(girdi: string): number | null {
  const t = girdi.replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,4}(\.\d{1,4})?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** "5,1" — borcun kaç aylık gelire denk geldiği. */
export const katYazi = (oran: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(oran);
