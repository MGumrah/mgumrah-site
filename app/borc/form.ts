/**
 * Ekleme pencerelerinin (ekle.tsx) saf mantığı: varsayılan değerler, varsayılan hesap, "Daha fazla" tercihi ve
 * API girdisinin kurulması. Ekran bunları çağırır; kural burada durur ve scripts/borc-test.mjs'te sınanır.
 *
 * hesap.ts gibi çalışma zamanında hiçbir dosyayı içe almaz (yalnızca `import type`): Node'un test koşucusu
 * bunu derleyicisiz çalıştırır. Tutar yazısı ↔ kuruş çevirisi bu yüzden `Para` ile dışarıdan verilir (bicim.ts).
 *
 * Tasarım kuralı: ana görünümde yalnızca Tarih, Tutar, Açıklama; kalan her alan "Daha fazla"da. Alanlar gizli
 * olsa da değerleri formun durumunda durur ve kaydedilir; yani sade görünüm hiçbir özelliği kapatmaz.
 */

import type { Durum, DurumGirdisi, GelirGirdisi, Hesap, HesapTuru, Islem, IslemGirdisi, ParaBirimi } from "./ortak";

/** Tutar yazısı ↔ kuruş (bicim.ts: kurusaCevir / kurusMetni). */
export type Para = { cevir: (yazi: string) => number | null; yaz: (kurus: number) => string };

/** `dahaFazla`: hata, "Daha fazla"daki bir alanla ilgili; ekran bölümü kendiliğinden açar. */
export type Sonuc<T> = { tamam: true; girdi: T } | { tamam: false; hata: string; dahaFazla?: boolean };

/* ── Tarayıcı deposu (yalnızca kolaylık: hesap kimliği ve açık/kapalı) ─────────────────────────────────────── */

export type Depo = { getItem(anahtar: string): string | null; setItem(anahtar: string, deger: string): void };

/** "borc": kişisel panel · "balim": Balım › Borçlar. İkisi aynı adreste (mgumrah.com) çalışır, kimlikleri karışmasın. */
export type Kapsam = "borc" | "balim";
export type FormAdi = "harcama" | "durum" | "gelir";

export const sonKartAnahtari = (kapsam: Kapsam) => `${kapsam}:son-kart`;
export const sonHesapAnahtari = (kapsam: Kapsam) => `${kapsam}:son-hesap`;
export const dahaFazlaAnahtari = (kapsam: Kapsam, form: FormAdi) => `${kapsam}:daha-fazla:${form}`;

/** localStorage; gizli sekmede, engelliyken ya da sunucuda `undefined` (her okuma/yazma sessizce boş geçer). */
export function tarayiciDeposu(): Depo | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function depoOku(depo: Depo | undefined, anahtar: string): string | null {
  try {
    return depo?.getItem(anahtar) ?? null;
  } catch {
    return null;
  }
}

export function depoYaz(depo: Depo | undefined, anahtar: string, deger: string): void {
  try {
    depo?.setItem(anahtar, deger);
  } catch {
    // Gizli sekmede depo kapalı olabilir; sorun değil.
  }
}

export function hesapKimligiOku(depo: Depo | undefined, anahtar: string): number | null {
  const ham = depoOku(depo, anahtar);
  const n = ham === null ? Number.NaN : Number(ham);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export const dahaFazlaAcikMi = (depo: Depo | undefined, kapsam: Kapsam, form: FormAdi) => depoOku(depo, dahaFazlaAnahtari(kapsam, form)) === "1";

export const dahaFazlaKaydet = (depo: Depo | undefined, kapsam: Kapsam, form: FormAdi, acik: boolean) =>
  depoYaz(depo, dahaFazlaAnahtari(kapsam, form), acik ? "1" : "0");

/**
 * Borç bir hesaba yazılır; hesap alanı gizlenince yanlış hesaba yazılmasın diye sıra: istenen hesap (ekran bir hesabı
 * açtıysa) → son kullanılan → ilk hesap (tek hesap varsa o). Listede olmayan kimlik yok sayılır; hesap yoksa 0.
 */
export function varsayilanHesapId(hesaplar: readonly { id: number }[], istenen?: number, son?: number | null): number {
  if (istenen && hesaplar.some((h) => h.id === istenen)) return istenen;
  if (son && hesaplar.some((h) => h.id === son)) return son;
  return hesaplar[0]?.id ?? 0;
}

/** "Daha fazla" düğmesinin yanında, kapalıyken gizli alanlarda ne olduğunu söyler. Boşsa yazı yok. */
export const dahaFazlaOzeti = (parcalar: readonly string[]) => parcalar.join(" · ");

/* ── Harcama ───────────────────────────────────────────────────────────────────────────────────────────── */

export type HarcamaDegerleri = {
  hesapId: number;
  tutar: string;
  iade: boolean;
  taksit: number;
  aciklama: string;
  tarih: string;
  kategori: string;
  not: string;
};

/** Yeni harcama: bugün, varsayılan kart, tek taksit. Düzenleme: kaydın kendi değerleri. */
export function harcamaIlk(
  o: { islem?: Islem; kartlar: readonly Hesap[]; istenen?: number; son?: number | null; bugun: string },
  para: Para
): HarcamaDegerleri {
  const { islem } = o;
  return {
    hesapId: islem ? islem.hesapId : varsayilanHesapId(o.kartlar, o.istenen, o.son),
    tutar: islem ? para.yaz(Math.abs(islem.tutar)) : "",
    iade: islem ? islem.tutar < 0 : false,
    taksit: islem?.taksit ?? 1,
    aciklama: islem?.aciklama ?? "",
    tarih: islem?.tarih ?? o.bugun,
    kategori: islem?.kategori ?? "",
    not: islem?.not ?? ""
  };
}

/** "Daha fazla"da varsayılandan farklı değer varsa hangileri (iade tutarın işaretini çevirir: gizli kalmamalı). */
export function harcamaGizliOzet(f: HarcamaDegerleri): string[] {
  const o: string[] = [];
  if (f.iade) o.push("iade");
  if (f.taksit > 1) o.push(`${f.taksit} taksit`);
  if (f.kategori.trim()) o.push("kategori");
  if (f.not.trim()) o.push("not");
  return o;
}

export function harcamaGirdisi(
  f: HarcamaDegerleri,
  kartlar: readonly Hesap[],
  islem: Pick<Islem, "tarih" | "hesapId" | "ekstreAy"> | undefined,
  para: Para
): Sonuc<IslemGirdisi> {
  const kart = kartlar.find((k) => k.id === f.hesapId);
  if (!kart) return { tamam: false, hata: "Önce bir kart seçin." };
  const kurus = para.cevir(f.tutar);
  const net = kurus === null ? null : f.iade ? -Math.abs(kurus) : Math.abs(kurus);
  if (net === null || net === 0) return { tamam: false, hata: "Geçerli bir tutar yazın (örn. 1.249,90)." };
  if (!f.aciklama.trim()) return { tamam: false, hata: "Ne için olduğunu yazın." };
  return {
    tamam: true,
    girdi: {
      tarih: f.tarih,
      hesapId: kart.id,
      aciklama: f.aciklama.trim(),
      tutar: net,
      taksit: f.taksit,
      kategori: f.kategori.trim(),
      not: f.not.trim(),
      // Tarih ve kart değişmediyse elle verilmiş/içe aktarılmış ekstre ayı korunur; değiştiyse sunucu yeniden hesaplar.
      ...(islem && islem.tarih === f.tarih && islem.hesapId === kart.id ? { ekstreAy: islem.ekstreAy } : {})
    }
  };
}

/* ── Güncel durum (ölçüm) ──────────────────────────────────────────────────────────────────────────────── */

export type DurumDegerleri = {
  limit: string;
  /** kart: kullanılabilir limit · kmh: bakiye · diğer: borç */
  deger: string;
  ekstre: string;
  asgari: string;
  sonOdeme: string;
  tarih: string;
  not: string;
};

/** Hesabın son ölçümüyle dolar; tutar boş, tarih bugün. Aynı gün yeniden ölçülürse o günün açıklaması korunur. */
export function durumIlk(o: { hesapLimit: number; onceki?: Durum; bugun: string }, para: Para): DurumDegerleri {
  const { onceki } = o;
  const limit = onceki?.limit ?? o.hesapLimit ?? 0;
  return {
    limit: limit ? para.yaz(limit) : "",
    deger: "",
    ekstre: onceki?.ekstre != null ? para.yaz(onceki.ekstre) : "",
    asgari: onceki?.asgari != null ? para.yaz(onceki.asgari) : "",
    sonOdeme: onceki?.sonOdeme && onceki.sonOdeme >= o.bugun ? onceki.sonOdeme : "",
    tarih: o.bugun,
    not: onceki && onceki.tarih === o.bugun ? onceki.not : ""
  };
}

/** Kartta limit bilinmiyorsa borç hesaplanamaz: limit ana görünümde sorulur (bilinen limit "Daha fazla"da durur). */
export const durumLimitAnaGorunumde = (tur: HesapTuru, f: Pick<DurumDegerleri, "limit">) => tur === "kart" && f.limit.trim() === "";

export type DurumAlani = "limit" | "ekstre" | "asgari" | "sonOdeme";

/** "Daha fazla"nın içindeki alanlar; boşsa bölüm hiç çizilmez ("diğer" borcun gizli alanı yok). */
export function durumDahaFazlaAlanlari(tur: HesapTuru, limitAna: boolean): DurumAlani[] {
  if (tur === "kart") return limitAna ? ["ekstre", "asgari", "sonOdeme"] : ["limit", "ekstre", "asgari", "sonOdeme"];
  if (tur === "kmh") return ["limit"];
  return [];
}

/** Kapalıyken hangi gizli alanlarda değer var; kaydedilince bunlar da yazılır, kullanıcı görsün. */
export function durumGizliOzet(tur: HesapTuru, f: DurumDegerleri, limitAna: boolean): string[] {
  const dolu: Record<DurumAlani, boolean> = {
    limit: f.limit.trim() !== "",
    ekstre: f.ekstre.trim() !== "",
    asgari: f.asgari.trim() !== "",
    sonOdeme: f.sonOdeme !== ""
  };
  const ad: Record<DurumAlani, string> = { limit: "limit", ekstre: "ekstre", asgari: "asgari", sonOdeme: "son ödeme" };
  return durumDahaFazlaAlanlari(tur, limitAna)
    .filter((a) => dolu[a])
    .map((a) => ad[a]);
}

/** Kart borcu = limit − kullanılabilir limit; KMH borcu = hesabın eksi bakiyesi (artıdaysa 0); diğer: yazılan borç. */
export function durumBorcu(tur: HesapTuru, limitKurus: number | null, degerKurus: number | null): number | null {
  if (degerKurus === null) return null;
  if (tur === "kart") return limitKurus === null ? null : limitKurus - degerKurus;
  if (tur === "kmh") return Math.max(0, -degerKurus);
  return degerKurus;
}

export function durumGirdisi(hesap: Pick<Hesap, "id" | "tur">, f: DurumDegerleri, para: Para): Sonuc<{ girdi: DurumGirdisi; borc: number }> {
  const tur = hesap.tur;
  const limitKurus = para.cevir(f.limit);
  const borc = durumBorcu(tur, limitKurus, para.cevir(f.deger));
  if (borc === null) {
    if (tur === "kart") {
      return limitKurus === null
        ? { tamam: false, hata: "Limit ve kullanılabilir limiti yazın.", dahaFazla: true }
        : { tamam: false, hata: "Kullanılabilir limiti yazın." };
    }
    return { tamam: false, hata: "Tutarı yazın." };
  }
  if (borc < 0) return { tamam: false, hata: "Kullanılabilir limit, limitten büyük olamaz.", dahaFazla: true };

  const ekstre = f.ekstre.trim() ? para.cevir(f.ekstre) : null;
  const asgari = f.asgari.trim() ? para.cevir(f.asgari) : null;
  if ((f.ekstre.trim() && ekstre === null) || (f.asgari.trim() && asgari === null)) {
    return { tamam: false, hata: "Ekstre ve asgari tutarı geçerli değil.", dahaFazla: true };
  }
  return {
    tamam: true,
    girdi: {
      borc,
      girdi: {
        hesapId: hesap.id,
        tarih: f.tarih,
        borc,
        limit: tur === "diger" ? null : limitKurus,
        ekstre: tur === "kart" ? ekstre : null,
        asgari: tur === "kart" ? asgari : null,
        sonOdeme: tur === "kart" && f.sonOdeme ? f.sonOdeme : null,
        not: f.not.trim()
      }
    }
  };
}

/* ── Gelir ─────────────────────────────────────────────────────────────────────────────────────────────── */

export type GelirDegerleri = {
  /** Ekranda "Açıklama"; kayıtta gelirin adı. */
  ad: string;
  tutar: string;
  tarih: string;
  paraBirimi: ParaBirimi;
  kesin: boolean;
  alindi: boolean;
  not: string;
};

export const gelirIlk = (bugun: string): GelirDegerleri => ({ ad: "", tutar: "", tarih: bugun, paraBirimi: "TRY", kesin: true, alindi: false, not: "" });

export function gelirGizliOzet(f: GelirDegerleri): string[] {
  const o: string[] = [];
  if (f.paraBirimi !== "TRY") o.push(f.paraBirimi);
  if (!f.kesin) o.push("tarih kesin değil");
  if (f.alindi) o.push("alındı");
  if (f.not.trim()) o.push("not");
  return o;
}

export function gelirGirdisi(f: GelirDegerleri, bugun: string, ornek: string, para: Para): Sonuc<GelirGirdisi> {
  const kurus = para.cevir(f.tutar);
  if (!f.ad.trim()) return { tamam: false, hata: `Açıklama yazın (örn. ${ornek}).` };
  if (kurus === null || kurus <= 0) return { tamam: false, hata: "Geçerli bir tutar yazın." };
  return {
    tamam: true,
    girdi: {
      ad: f.ad.trim(),
      tutar: kurus,
      paraBirimi: f.paraBirimi,
      beklenenTarih: f.tarih,
      kesin: f.kesin,
      alindiTarihi: f.alindi ? bugun : null,
      not: f.not.trim()
    }
  };
}
