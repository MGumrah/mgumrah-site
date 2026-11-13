/**
 * /borc — Harcama akışı (Sankey: kartlar → kategoriler). Bütün kategori kuralları,
 * toplama ve çizim yerleşimi burada; ekran (akis.tsx) yalnızca bu sonuçları çizer.
 *
 * hesap.ts gibi SAF ve bağımlılıksız: yalnızca `import type`, yan etki yok,
 * `erasableSyntaxOnly` uyumlu. Böylece `node scripts/borc-test.mjs` bu dosyayı
 * derleyicisiz çalıştırır. (Bu yüzden başka dosyadan çalışma-zamanı içe aktarması
 * yok: Node uzantısız yolu çözmez. Ay kaydırma gibi iki satırlık yardımcılar
 * burada yeniden yazıldı.)
 *
 * Tutarlar kuruş, tarihler "YYYY-MM-DD", aylar "YYYY-MM".
 */

import type { Hesap, Islem, Veri } from "./ortak";

/* ── Kategori kuralları ───────────────────────────────────────────────────
 * Kategori işlemin kendi `kategori` alanıdır; boşsa açıklamadan ÖNERİ üretilir,
 * hiçbiri tutmazsa "Diğer". Öneri yalnızca gösterimde/öneri olarak kullanılır:
 * kullanıcının girdiği kategoriyi asla ezmez ve veriye geri yazılmaz.
 *
 * Kurallar sırayla denenir, İLK eşleşen kazanır. Eşleşme: küçük harfe çevrilmiş
 * açıklamada "içerir" araması; İ/I/ı hepsi "i" sayılır (büyük harfle yazılan
 * "BİM" ya da "IGDAŞ" da eşleşsin), öteki Türkçe harfler yazıldığı gibi kalır
 * (bu yüzden bazı anahtarlar iki yazımla listelenir). Anahtardaki sondaki boşluk
 * ("ram ") bilerek kelime sonunu arar. Ayrıntı: kategoriOner() testleri.
 *
 * İleride kullanıcı kendi kuralını ekleyebilsin diye liste tek yerde, düz veri.
 * Kişiye özgü işyeri/isim anahtarları genel depoda tutulmaz.
 */

export const KATEGORI_DIGER = "Diğer";

export type KategoriKurali = { kategori: string; anahtarlar: readonly string[] };

export const KATEGORI_KURALLARI: readonly KategoriKurali[] = [
  { kategori: "Faiz ve vergi", anahtarlar: ["faiz", "kkdf", "bsmv", "komisyon", "aidat"] },
  { kategori: "Nakit avans ve aktarım", anahtarlar: ["nakit avans", "geçilen", "gecilen", "aktarım", "aktarim", "havale", "eft"] },
  { kategori: "İşyeri ekipmanı", anahtarlar: ["işyeri", "isyeri", "işlemci", "anakart", "soğutma", "kasa", "modem", "ssd", "monitör", "bilgisayar", "ram ", "netgsm"] },
  { kategori: "Sigorta", anahtarlar: ["sigorta", "broker", "kasko"] },
  { kategori: "Kişisel bakım", anahtarlar: ["berber", "kuaför", "kuafor", "güzellik"] },
  {
    kategori: "Araç ve servis",
    anahtarlar: [
      "honda", "servis", "nissan", "civic", "mtv", "trafik", "ceza", "tamir", "lastik", "oto", "otomotiv", "yedek parça", "egzoz",
      "muayene", "otopark", "hgs", "ogs", "otoyol", "benzin", "akaryakıt", "akaryakit", "opet", "shell", "petrol", "bp ", "total"
    ]
  },
  { kategori: "Faturalar", anahtarlar: ["turkcell", "aydem", "enerya", "turksat", "elektrik", "doğalgaz", "dogalgaz", "internet", "fatura", "deski", "igdaş", "noter"] },
  { kategori: "Abonelikler", anahtarlar: ["youtube", "prime", "apple", "netflix", "spotify", "icloud", "google", "chatgpt", "openai", "claude"] },
  { kategori: "Oyun", anahtarlar: ["gameforce", "gameforge", "silkroad", "steam", "playstat", "gta", "oyun"] },
  {
    kategori: "Market ve yemek",
    anahtarlar: [
      "market", "ekmek", "fırın", "firin", "getir", "şok", "sok ", "bim", "a101", "migros", "yemek", "restoran", "cafe", "kafe", "file", "manav",
      "kasap", "simit", "pastane", "döner", "doner", "pizza", "lokanta", "şarküteri", "sarkuteri", "gurme", "gıda", "gida", "bakkal", "kuruyemiş",
      "tatlı", "börek"
    ]
  },
  { kategori: "Çocuk", anahtarlar: ["ebebek", "bebek", "oyuncak", "okul", "kreş", "kres", "bisiklet"] },
  { kategori: "Sağlık", anahtarlar: ["eczane", "hastane", "doktor", "klinik", "diş", "sağlık", "saglik", "göz"] },
  { kategori: "Seyahat", anahtarlar: ["otel", "konaklama", "thy", "pegasus", "booking", "crown", "bursa"] },
  {
    kategori: "Alışveriş",
    anahtarlar: ["amazon", "trendyol", "hepsiburada", "n11", "temu", "aliexpress", "paytr", "sanal kart", "çiçeksepeti", "kıyafet", "tekstil", "xiaomi", "vatan", "outlet"]
  }
];

/** Belirgin renk alan 8 kategori (sırası = renk numarası, --k1…--k8); kalan hepsi nötr gri. */
export const RENKLI_KATEGORILER: readonly string[] = [
  "Nakit avans ve aktarım",
  "Araç ve servis",
  "Sağlık",
  "Oyun",
  "Faturalar",
  "Abonelikler",
  "Market ve yemek",
  "İşyeri ekipmanı"
];

/** Eşleştirme için metni düzler: Unicode birleşik hâl, İ/I/ı → i, küçük harf, tek boşluk. */
function duzle(metin: string): string {
  return metin.normalize("NFC").replace(/[İIı]/g, "i").toLowerCase().replace(/\s+/g, " ");
}

const DUZLENMIS_KURALLAR = KATEGORI_KURALLARI.map((k) => ({ kategori: k.kategori, anahtarlar: k.anahtarlar.map(duzle) }));

/** Açıklamadan kategori önerisi; hiçbir kural tutmazsa null. Kullanıcının girdiği kategoriyi ezmez (bkz. kategoriBul). */
export function kategoriOner(aciklama: string): string | null {
  // Sonuna boşluk: "ram " gibi kelime sonu anahtarları açıklamanın son kelimesinde de tutsun.
  const metin = `${duzle(aciklama).trim()} `;
  if (metin.trim() === "") return null;
  for (const kural of DUZLENMIS_KURALLAR) {
    if (kural.anahtarlar.some((a) => metin.includes(a))) return kural.kategori;
  }
  return null;
}

/** Aynı kategorinin farklı yazımları (büyük/küçük harf, fazla boşluk) tek kategori sayılsın. */
export const kategoriAnahtari = (ad: string) => duzle(ad).trim();

const BILINEN_KATEGORILER: ReadonlyMap<string, string> = new Map(
  [...RENKLI_KATEGORILER, ...KATEGORI_KURALLARI.map((k) => k.kategori), KATEGORI_DIGER].map((ad) => [kategoriAnahtari(ad), ad])
);

export type KategoriKaynagi = "girilen" | "oneri" | "varsayilan";

/**
 * Bir işlemin akıştaki kategorisi: kendi kategori alanı doluysa o; boşsa açıklamadan öneri; yoksa "Diğer".
 * Bilinen bir kategorinin yazımı (ör. "oyun") kurallardaki yazıma çevrilir; bilinmeyen kategori yazıldığı gibi kalır.
 */
export function kategoriBul(islem: Pick<Islem, "kategori" | "aciklama">): { ad: string; kaynak: KategoriKaynagi } {
  const girilen = (islem.kategori ?? "").trim().replace(/\s+/g, " ");
  if (girilen !== "") return { ad: BILINEN_KATEGORILER.get(kategoriAnahtari(girilen)) ?? girilen, kaynak: "girilen" };
  const oneri = kategoriOner(islem.aciklama ?? "");
  if (oneri !== null) return { ad: oneri, kaynak: "oneri" };
  return { ad: KATEGORI_DIGER, kaynak: "varsayilan" };
}

/** Kategorinin sabit renk numarası (1…8 → --k1…--k8); gri olanlar için null. Ada bağlı, sıralamaya değil. */
export function kategoriRenkNo(ad: string): number | null {
  const anahtar = kategoriAnahtari(ad);
  const sira = RENKLI_KATEGORILER.findIndex((k) => kategoriAnahtari(k) === anahtar);
  return sira < 0 ? null : sira + 1;
}

/** CSS rengi: borc.css'teki --k1…--k8 (açık/koyu tema) ya da nötr --k0. */
export const kategoriRengi = (renkNo: number | null) => `var(--k${renkNo ?? 0})`;

/* ── Dönem ve toplama ──────────────────────────────────────────────────── */

export type AkisDonemi = { tur: "tum" } | { tur: "son3" } | { tur: "ay"; ay: string };

const GECERLI_AY = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "2026-11" − n ay. (hesap.ts'teki ayEkle'nin geriye giden hâli; bkz. dosya başı.) */
function ayGeri(ay: string, n: number): string {
  const [yil, ay1] = ay.split("-").map(Number);
  const sira = yil * 12 + (ay1 - 1) - n;
  return `${Math.floor(sira / 12)}-${String((sira % 12) + 1).padStart(2, "0")}`;
}

const kartlar = (hesaplar: readonly Hesap[]) => hesaplar.filter((h) => h.tur === "kart").sort((a, b) => a.sira - b.sira || a.id - b.id);

/** Kart harcaması olan aylar, EN YENİ başta. "Son 3 ay" ve varsayılan seçim bu listenin başından başlar. */
export function akisAylari(veri: Pick<Veri, "hesaplar" | "islemler">): string[] {
  const kartNo = new Set(kartlar(veri.hesaplar).map((h) => h.id));
  const aylar = new Set<string>();
  for (const i of veri.islemler) {
    const ay = i.tarih.slice(0, 7);
    if (kartNo.has(i.hesapId) && GECERLI_AY.test(ay)) aylar.add(ay);
  }
  return [...aylar].sort().reverse();
}

/** Dönemin kapsadığı aylar (takvim ayı olarak). "Son 3 ay" = verideki en yeni aydan geriye 3 takvim ayı. */
export function donemAylari(aylar: readonly string[], donem: AkisDonemi): string[] {
  if (donem.tur === "ay") return [donem.ay];
  if (aylar.length === 0) return [];
  if (donem.tur === "tum") return [...aylar];
  return [0, 1, 2].map((n) => ayGeri(aylar[0], n));
}

export type AkisHucre = { hesapId: number; tutar: number };
export type AkisKategori = {
  /** kategoriAnahtari(ad): gruplama ve anahtar. */
  anahtar: string;
  ad: string;
  /** 1…8 → --k1…--k8; null → nötr gri. */
  renk: number | null;
  toplam: number;
  /** Hesap sırasına göre; yalnız tutarı > 0 olanlar. */
  hucreler: AkisHucre[];
};
export type AkisHesap = { hesapId: number; ad: string; toplam: number };
export type Akis = {
  /** Dönemin kapsadığı aylar. */
  aylar: string[];
  /** Gösterilen sayı: bantların toplamı. */
  toplam: number;
  /** Sabit hesap sırası; toplamı 0 olanlar yok. */
  hesaplar: AkisHesap[];
  /** Toplama göre azalan; toplamı 0 olanlar yok. */
  kategoriler: AkisKategori[];
  /** Döneme giren (kart) işlem sayısı, iade satırları dahil. */
  islemSayisi: number;
};

/**
 * Dönemdeki kart harcamalarını kategori × hesap olarak toplar.
 *
 * - Yalnızca kart türü hesaplar; KMH ve "Diğer" borç hesapları, ekstre ödemeleri akışa girmez.
 * - Tarih = işlem tarihinin ayı; taksitli alışverişin TAM tutarı alındığı ay sayılır (taksit bölünmez).
 * - İade (negatif) satırı kendi hücresinden (kategori × hesap, iadenin tarihindeki ay) düşer; hücre sıfırın altına
 *   inerse sıfır sayılır. Yani bant hiç negatif olmaz ve gösterilen toplam = bantların toplamı.
 */
export function akisHesapla(veri: Pick<Veri, "hesaplar" | "islemler">, donem: AkisDonemi): Akis {
  const kartListesi = kartlar(veri.hesaplar);
  const kartNo = new Set(kartListesi.map((h) => h.id));
  const aylar = donemAylari(akisAylari(veri), donem);
  const ayKumesi = new Set(aylar);

  type Toplayici = { ad: string; hucre: Map<number, number> };
  const kategoriler = new Map<string, Toplayici>();
  let islemSayisi = 0;
  for (const i of veri.islemler) {
    if (!kartNo.has(i.hesapId) || !ayKumesi.has(i.tarih.slice(0, 7))) continue;
    islemSayisi++;
    const { ad } = kategoriBul(i);
    const anahtar = kategoriAnahtari(ad);
    const t = kategoriler.get(anahtar) ?? { ad, hucre: new Map<number, number>() };
    t.hucre.set(i.hesapId, (t.hucre.get(i.hesapId) ?? 0) + i.tutar);
    kategoriler.set(anahtar, t);
  }

  const hesapToplami = new Map<number, number>();
  const sonuc: AkisKategori[] = [];
  for (const [anahtar, t] of kategoriler) {
    const hucreler: AkisHucre[] = [];
    for (const h of kartListesi) {
      const tutar = t.hucre.get(h.id) ?? 0;
      if (tutar > 0) {
        hucreler.push({ hesapId: h.id, tutar });
        hesapToplami.set(h.id, (hesapToplami.get(h.id) ?? 0) + tutar);
      }
    }
    const toplam = hucreler.reduce((s, h) => s + h.tutar, 0);
    if (toplam > 0) sonuc.push({ anahtar, ad: t.ad, renk: kategoriRenkNo(t.ad), toplam, hucreler });
  }
  sonuc.sort((a, b) => b.toplam - a.toplam || a.ad.localeCompare(b.ad, "tr"));

  const hesaplar = kartListesi.filter((h) => (hesapToplami.get(h.id) ?? 0) > 0).map((h) => ({ hesapId: h.id, ad: h.ad, toplam: hesapToplami.get(h.id) ?? 0 }));
  return { aylar, toplam: sonuc.reduce((s, k) => s + k.toplam, 0), hesaplar, kategoriler: sonuc, islemSayisi };
}

/* ── Yüzde metni ───────────────────────────────────────────────────────── */

/**
 * "%93'ü" gibi iyelik eki: ekin ünlüsü sayının SÖYLENİŞİNİN son hecesine göre seçilir
 * (3 üç → ü, 6 altı → sı, 20 yirmi → si, 100 yüz → ü). 1…100 için; 0 ve dışı ayrıca ele alınır.
 */
export function yuzdeEki(n: number): string {
  const onlar: Record<number, string> = { 10: "u", 20: "si", 30: "u", 40: "ı", 50: "si", 60: "ı", 70: "i", 80: "i", 90: "ı", 100: "ü" };
  const birler = ["ı", "i", "si", "ü", "ü", "i", "sı", "si", "i", "u"];
  const ek = n % 10 === 0 ? onlar[n] ?? "ı" : birler[n % 10];
  return `'${ek}`;
}

/**
 * "kategorinin %93'ü" / "toplamın %31'i": parçanın bütün içindeki payı. Yüzde 1'in altında "…%1'den azı".
 * `kime` genitifli sözcüktür ("kategorinin", "toplamın").
 */
export function payMetni(parca: number, butun: number, kime: string): string {
  const yuzde = butun > 0 ? Math.round((parca / butun) * 100) : 0;
  if (yuzde < 1) return `${kime} %1'den azı`;
  return `${kime} %${yuzde}${yuzdeEki(yuzde)}`;
}

/* ── Çizim yerleşimi ───────────────────────────────────────────────────── */

export const SAG_BOSLUK = 7;
export const SOL_BOSLUK = 22;
/** İki satırlı etiketlerin (ad + tutar) merkezleri arası en az mesafe. */
export const ETIKET_ARALIGI = 26;
export const DUGUM_EN = 6;
const KENAR = 12;
const EN_AZ_YUKSEKLIK = 240;

/**
 * Etiket merkezlerini (artan sırada) en az `aralik` aralıkla, [alt, ust] içinde tutar; sığmayan taşar.
 * Önce yukarıdan aşağı iter, taşan olursa aşağıdan yukarı geri çeker. Zaten ferahsa hiçbirini oynatmaz.
 */
export function etiketYerlestir(merkezler: readonly number[], aralik: number, alt: number, ust: number): number[] {
  const y = merkezler.map((v) => Math.min(Math.max(v, alt), ust));
  for (let i = 1; i < y.length; i++) if (y[i] < y[i - 1] + aralik) y[i] = y[i - 1] + aralik;
  if (y.length > 0 && y[y.length - 1] > ust) {
    y[y.length - 1] = ust;
    for (let i = y.length - 2; i >= 0; i--) if (y[i] > y[i + 1] - aralik) y[i] = y[i + 1] - aralik;
  }
  return y;
}

export type SolDugum = AkisHesap & { y: number; yukseklik: number; etiketY: number };
export type SagDugum = Omit<AkisKategori, "hucreler"> & { y: number; yukseklik: number; etiketY: number };
export type Bant = {
  hesapId: number;
  /** Kategorinin `anahtar`ı. */
  kategori: string;
  tutar: number;
  kategoriToplami: number;
  kalinlik: number;
  /** SVG path: iki kübik Bezier arasındaki dolgu (orta x'te dikey teğet). */
  yol: string;
};
export type AkisDuzeni = {
  genislik: number;
  yukseklik: number;
  /** Kuruş başına piksel. */
  olcek: number;
  solEtiketEn: number;
  sagEtiketEn: number;
  /** Sol/sağ düğüm çubuğunun sol kenarı. */
  solX: number;
  sagX: number;
  sagEtiketX: number;
  sol: SolDugum[];
  sag: SagDugum[];
  bantlar: Bant[];
};

const sinirla = (v: number, alt: number, ust: number) => Math.min(Math.max(v, alt), ust);
const yuvarla = (v: number) => Math.round(v * 100) / 100;

/**
 * Sankey yerleşimi (birim: piksel; çağıran genişliği ölçüp verir).
 * Ölçek = (sağ sütun yüksekliği − sağdaki boşluklar) / genel toplam; böylece sağ sütun tam `yukseklik` olur.
 * Sağ düğümler arası 7, sol düğümler arası 22 boşluk; sol sütun dikeyde ortalanır. Bir düğümün içinde bantlar,
 * karşı sütundaki düğümün sırasına göre dizilir (bantlar mümkün olduğunca çaprazlanmaz).
 */
export function akisDuzeni(akis: Akis, genislik: number): AkisDuzeni {
  const n = akis.kategoriler.length;
  const m = akis.hesaplar.length;
  // Tam piksel: sütun kenarları bulanık çizilmesin.
  const solEtiketEn = Math.round(sinirla(genislik * 0.24, 72, 116));
  const sagEtiketEn = Math.round(sinirla(genislik * 0.4, 122, 200));
  const solX = solEtiketEn + 4;
  const sagX = genislik - sagEtiketEn - 10 - DUGUM_EN;
  const sagEtiketX = sagX + DUGUM_EN + 8;

  const sagYuksek = Math.max(EN_AZ_YUKSEKLIK, ETIKET_ARALIGI * n);
  const olcek = akis.toplam > 0 ? (sagYuksek - SAG_BOSLUK * Math.max(n - 1, 0)) / akis.toplam : 0;
  const solYuksek = olcek * akis.toplam + SOL_BOSLUK * Math.max(m - 1, 0);
  const sutun = Math.max(sagYuksek, solYuksek);

  // Sağ düğümler (üstten, toplama göre azalan).
  let y = KENAR;
  const sagGecici = akis.kategoriler.map((k) => {
    const yukseklik = olcek * k.toplam;
    const g = { k, y, yukseklik };
    y += yukseklik + SAG_BOSLUK;
    return g;
  });
  // Sol düğümler (sabit hesap sırası), sütun dikeyde ortalı.
  y = KENAR + (sutun - solYuksek) / 2;
  const solGecici = akis.hesaplar.map((h) => {
    const yukseklik = olcek * h.toplam;
    const g = { h, y, yukseklik };
    y += yukseklik + SOL_BOSLUK;
    return g;
  });

  const alt = KENAR;
  const ust = KENAR + sutun;
  const sagEtiket = etiketYerlestir(sagGecici.map((g) => g.y + g.yukseklik / 2), ETIKET_ARALIGI, alt, ust);
  const solEtiket = etiketYerlestir(solGecici.map((g) => g.y + g.yukseklik / 2), ETIKET_ARALIGI, alt, ust);

  const sag: SagDugum[] = sagGecici.map(({ k, y, yukseklik }, i) => ({
    anahtar: k.anahtar,
    ad: k.ad,
    renk: k.renk,
    toplam: k.toplam,
    y: yuvarla(y),
    yukseklik: yuvarla(yukseklik),
    etiketY: yuvarla(sagEtiket[i])
  }));
  const sol: SolDugum[] = solGecici.map(({ h, y, yukseklik }, i) => ({ ...h, y: yuvarla(y), yukseklik: yuvarla(yukseklik), etiketY: yuvarla(solEtiket[i]) }));

  // Bantlar: sol düğümde kategori sırasına, sağ düğümde hesap sırasına göre üst üste.
  const solImlec = new Map(solGecici.map((g) => [g.h.hesapId, g.y]));
  const sagImlec = new Map(sagGecici.map((g) => [g.k.anahtar, g.y]));
  const x0 = solX + DUGUM_EN;
  const x1 = sagX;
  const xo = (x0 + x1) / 2;
  const bantlar: Bant[] = [];
  // Sol imleç kategori sırasında ilerlesin: dış döngü kategori, iç döngü hesap (hucreler zaten hesap sırasında).
  for (const k of akis.kategoriler) {
    for (const h of k.hucreler) {
      const kalinlik = olcek * h.tutar;
      const yl = solImlec.get(h.hesapId) ?? 0;
      const yr = sagImlec.get(k.anahtar) ?? 0;
      solImlec.set(h.hesapId, yl + kalinlik);
      sagImlec.set(k.anahtar, yr + kalinlik);
      const f = (v: number) => yuvarla(v);
      const yol =
        `M${f(x0)} ${f(yl)}C${f(xo)} ${f(yl)} ${f(xo)} ${f(yr)} ${f(x1)} ${f(yr)}` +
        `L${f(x1)} ${f(yr + kalinlik)}C${f(xo)} ${f(yr + kalinlik)} ${f(xo)} ${f(yl + kalinlik)} ${f(x0)} ${f(yl + kalinlik)}Z`;
      bantlar.push({ hesapId: h.hesapId, kategori: k.anahtar, tutar: h.tutar, kategoriToplami: k.toplam, kalinlik: yuvarla(kalinlik), yol });
    }
  }

  return { genislik, yukseklik: yuvarla(sutun + 2 * KENAR), olcek, solEtiketEn, sagEtiketEn, solX, sagX, sagEtiketX, sol, sag, bantlar };
}
