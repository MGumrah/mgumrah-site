/**
 * Panelin bütün hesabı: "kaç para tutacak", "ne kadarı harcandı", "hangi kira
 * ödenmedi". Hepsi sunucudan gelen ham kayıtlardan türetilir, hiçbiri
 * saklanmaz — kalem düzelince toplam kendiliğinden düzelir.
 */

import {
  ALINACAK_KATEGORILERI,
  tutarOku,
  type Alinacak,
  type Gider,
  type Link,
  type Odeme,
  type Veri,
  type Yapilacak
} from "./ortak";
import { ayEkle, gunEkle, odemeTarihi } from "./zaman";

export const kalemTutari = (kalem: Alinacak) => (kalem.birimFiyat === null ? null : kalem.birimFiyat * kalem.adet);

/**
 * Linkin notunun sonunda yazan fiyat, kuruş cinsinden: "Beko Keyf, ikili · 10.470 TL".
 * Not TL ya da ₺ ile bitmiyorsa null: "5.400 TL'den", "851,82 TL+KDV" ve
 * "500-1.000 TL" tek bir fiyat olmadığı için ortalamaya katılmaz.
 */
export function linkFiyati(link: Link): number | null {
  const eslesme = /(?:^|[\s·~≈:])(\d[\d.,]*)\s*(?:TL|₺)\s*$/i.exec(link.not);
  if (!eslesme) return null;
  const kurus = tutarOku(eslesme[1]);
  return kurus !== null && !Number.isNaN(kurus) && kurus > 0 ? kurus : null;
}

export type LinkOrtalamasi = {
  /** Kuruş, tam liraya yuvarlanmış. */
  ortalama: number;
  /** Notunda fiyat yazan link sayısı. */
  sayi: number;
  en: number;
  fazla: number;
};

/** Linklerin notlarındaki fiyatların ortalaması; hiçbirinde fiyat yazmıyorsa null. */
export function linkOrtalamasi(linkler: Link[]): LinkOrtalamasi | null {
  const fiyatlar = linkler.map(linkFiyati).filter((fiyat): fiyat is number => fiyat !== null);
  if (!fiyatlar.length) return null;
  const toplam = fiyatlar.reduce((t, fiyat) => t + fiyat, 0);
  return {
    ortalama: Math.round(toplam / fiyatlar.length / 100) * 100,
    sayi: fiyatlar.length,
    en: Math.min(...fiyatlar),
    fazla: Math.max(...fiyatlar)
  };
}

export type KalemMaliyeti = { tutar: number; tahmini: boolean };

/**
 * Kalemin maliyeti: fiyatı girilmişse o. Girilmemişse ve kalem henüz alınmadıysa
 * linklerin ortalaması × adet, "tahmini" diye işaretli. Alınmış ama fiyatı
 * girilmemiş kalemde tahmin yok: linkler ne kadar *tutacağını* söyler, ne kadar
 * *tuttuğunu* değil, harcanan toplamı da tahminle şişirmemek gerekir.
 * Hiçbiri yoksa null.
 */
export function kalemMaliyeti(kalem: Alinacak): KalemMaliyeti | null {
  const tutar = kalemTutari(kalem);
  if (tutar !== null) return { tutar, tahmini: false };
  if (kalem.alindi) return null;
  const ortalama = linkOrtalamasi(kalem.linkler);
  return ortalama ? { tutar: ortalama.ortalama * kalem.adet, tahmini: true } : null;
}

export type KalemOzeti = {
  /** Girilen fiyatlar + tahminler. */
  toplam: number;
  alinan: number;
  kalan: number;
  sayi: number;
  alinanSayi: number;
  /** Ne fiyatı ne de fiyat yazan linki olan kalemler: toplama katılmıyor, kullanıcıya ayrıca söylenir. */
  fiyatsiz: number;
  /** `toplam`ın linklerin ortalamasından gelen kısmı ve bu yolla sayılan kalem adedi. */
  tahmini: number;
  tahminiSayi: number;
};

export function kalemOzeti(kalemler: Alinacak[]): KalemOzeti {
  const ozet: KalemOzeti = {
    toplam: 0,
    alinan: 0,
    kalan: 0,
    sayi: kalemler.length,
    alinanSayi: 0,
    fiyatsiz: 0,
    tahmini: 0,
    tahminiSayi: 0
  };
  for (const kalem of kalemler) {
    if (kalem.alindi) ozet.alinanSayi += 1;
    const maliyet = kalemMaliyeti(kalem);
    if (maliyet === null) {
      ozet.fiyatsiz += 1;
      continue;
    }
    ozet.toplam += maliyet.tutar;
    if (kalem.alindi) ozet.alinan += maliyet.tutar;
    else ozet.kalan += maliyet.tutar;
    if (maliyet.tahmini) {
      ozet.tahmini += maliyet.tutar;
      ozet.tahminiSayi += 1;
    }
  }
  return ozet;
}

/** Hazır kategoriler kendi sırasında; sonradan çıkan bir kategori "Diğer"in hemen önünde. */
export function kategoriSirasi(a: string, b: string) {
  const sira = (kategori: string) => {
    const i = ALINACAK_KATEGORILERI.indexOf(kategori);
    return i === -1 ? ALINACAK_KATEGORILERI.length - 1.5 : i;
  };
  return sira(a) - sira(b) || a.localeCompare(b, "tr");
}

export type KategoriOzeti = { kategori: string; toplam: number; alinan: number; sayi: number; tahmini: number };

export function kategoriOzetleri(kalemler: Alinacak[]): KategoriOzeti[] {
  const harita = new Map<string, KategoriOzeti>();
  for (const kalem of kalemler) {
    const ozet = harita.get(kalem.kategori) ?? { kategori: kalem.kategori, toplam: 0, alinan: 0, sayi: 0, tahmini: 0 };
    const maliyet = kalemMaliyeti(kalem);
    const tutar = maliyet?.tutar ?? 0;
    ozet.sayi += 1;
    ozet.toplam += tutar;
    if (kalem.alindi) ozet.alinan += tutar;
    if (maliyet?.tahmini) ozet.tahmini += tutar;
    harita.set(kalem.kategori, ozet);
  }
  return [...harita.values()].sort((a, b) => b.toplam - a.toplam || kategoriSirasi(a.kategori, b.kategori));
}

export type GiderAyi = { ay: string; sonGun: string; beklenen: number; odeme: Odeme | undefined };

const giderAyi = (gider: Gider, odemeler: Odeme[], ay: string): GiderAyi => ({
  ay,
  sonGun: odemeTarihi(ay, gider.odemeGunu),
  beklenen: gider.tutar,
  odeme: odemeler.find((o) => o.giderId === gider.id && o.ay === ay)
});

/** Başlangıçtan `sinir` gününe kadar (dahil) vadesi gelen aylar. */
export function vadesiGelenAylar(gider: Gider, odemeler: Odeme[], sinir: string): GiderAyi[] {
  const aylar: GiderAyi[] = [];
  for (let ay = gider.baslangic, i = 0; i < 600; ay = ayEkle(ay, 1), i += 1) {
    if (gider.bitis && ay > gider.bitis) break;
    if (odemeTarihi(ay, gider.odemeGunu) > sinir) break;
    aylar.push(giderAyi(gider, odemeler, ay));
  }
  return aylar;
}

/**
 * Giderler sayfasındaki aylar: başlangıçtan gelecek aya kadar, en az ilk üç ay.
 * Peşin ödenmiş ileri bir ay varsa liste oraya kadar uzar.
 */
export function gosterilecekAylar(gider: Gider, odemeler: Odeme[], gun: string): GiderAyi[] {
  let son = ayEkle(gun.slice(0, 7), 1);
  const enAz = ayEkle(gider.baslangic, 2);
  if (son < enAz) son = enAz;
  for (const odeme of odemeler) if (odeme.giderId === gider.id && odeme.ay > son) son = odeme.ay;
  if (gider.bitis && son > gider.bitis) son = gider.bitis;

  const aylar: GiderAyi[] = [];
  for (let ay = gider.baslangic, i = 0; ay <= son && i < 600; ay = ayEkle(ay, 1), i += 1) {
    aylar.push(giderAyi(gider, odemeler, ay));
  }
  return aylar;
}

export const aktifGiderler = (giderler: Gider[], gun: string) =>
  giderler.filter((gider) => !gider.bitis || gider.bitis >= gun.slice(0, 7));

export type Ozet = {
  kalem: KalemOzeti;
  /** Giderlerin sayıldığı son gün: açılış tarihi, o yoksa bugün. */
  kapsamSonu: string;
  giderToplam: number;
  giderOdenen: number;
  giderAySayisi: number;
  toplam: number;
  harcanan: number;
  aylikSabit: number;
};

/**
 * Tahmini toplam = alınacakların hepsi + kapsamdaki gider ayları. Açılış tarihi
 * girildiyse kapsam açılışa kadar ödenecek kiradır ("açılana kadar cebimizden
 * ne çıkacak"); girilmediyse bugüne kadar vadesi gelen aylar. Ödenmiş ayda
 * beklenen değil gerçekten ödenen tutar sayılır.
 */
export function ozetHesapla(veri: Veri, gun: string): Ozet {
  const kalem = kalemOzeti(veri.alinacaklar);
  const kapsamSonu = veri.ayarlar.acilisTarihi ?? gun;

  let giderToplam = 0;
  let giderOdenen = 0;
  let giderAySayisi = 0;
  for (const gider of veri.giderler) {
    for (const ay of vadesiGelenAylar(gider, veri.odemeler, kapsamSonu)) {
      giderAySayisi += 1;
      giderToplam += ay.odeme?.tutar ?? ay.beklenen;
      giderOdenen += ay.odeme?.tutar ?? 0;
    }
  }

  return {
    kalem,
    kapsamSonu,
    giderToplam,
    giderOdenen,
    giderAySayisi,
    toplam: kalem.toplam + giderToplam,
    harcanan: kalem.alinan + giderOdenen,
    aylikSabit: aktifGiderler(veri.giderler, gun).reduce((toplam, gider) => toplam + gider.tutar, 0)
  };
}

export type Yaklasan =
  | { tur: "odeme"; gun: string; gider: Gider; ay: string }
  | { tur: "is"; gun: string; is: Yapilacak };

/** Ödenmemiş gider ayları ve tarihi olan açık işler: gecikenler ve önümüzdeki 45 gün. */
export function yaklasanlar(veri: Veri, gun: string, adet = 6): Yaklasan[] {
  const ufuk = gunEkle(gun, 45);
  const liste: Yaklasan[] = [];

  for (const gider of veri.giderler) {
    for (const ay of vadesiGelenAylar(gider, veri.odemeler, ufuk)) {
      if (!ay.odeme) liste.push({ tur: "odeme", gun: ay.sonGun, gider, ay: ay.ay });
    }
  }
  for (const is of veri.yapilacaklar) {
    if (!is.tamamlandi && is.sonTarih && is.sonTarih <= ufuk) liste.push({ tur: "is", gun: is.sonTarih, is });
  }

  return liste.sort((a, b) => a.gun.localeCompare(b.gun)).slice(0, adet);
}
