/**
 * Soy ağacının hesabı: veriyi doğrular, tarayıcıya gidecek hâline getirir,
 * akrabalık adlarını çıkarır ve ağacı yerleştirir. Tarayıcıya bağımlı hiçbir
 * şey yok; sayfa derlenirken de "Merkeze al"a basıldığında da aynı kod çalışır.
 */

import type { Kisi, Olay } from "./aile";

/**
 * Tarayıcıya giden kişi. Hayattakilerin doğum ve nüfus kaydı alanları burada
 * hiç yok: istemci bileşenine verilen her şey sayfanın HTML'ine gömülür,
 * gizlemek yetmez, göndermemek gerekir.
 */
export type Gorunen = {
  id: string;
  ad: string;
  soyad?: string;
  oncekiSoyad?: string;
  cinsiyet?: "erkek" | "kadin";
  baba?: string;
  anne?: string;
  /** Yazılanlar ve ortak çocuktan çıkanlar, iki yönlü. */
  esler: string[];
  hayatta: boolean;
  /** Yalnızca adı biliniyor: bir kişinin `babaAdi` ya da `anneAdi` alanından türedi. */
  sanal: boolean;
  dogum?: Olay;
  vefat?: Olay;
  kutuk?: string;
  not?: string;
};

export type Yakinlik = {
  /** Kartın üstündeki kısa ad: "Babaannem". Karşılığı yoksa boş. */
  kisa: string;
  /** Paneldeki tam yol, e-Devlet belgesi gibi: "Babamın annesinin babası". */
  uzun: string;
  /** Köke göre kuşak: anne-baba −1, çocuklar +1. */
  kusak: number;
};

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TARIH = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

/** Veriyi doğrular ve tarayıcıya gidecek hâle getirir. Hatalıysa derleme durur. */
export function hazirla(kisiler: Kisi[], kok: string): Gorunen[] {
  const hatalar: string[] = [];
  const kimlik = new Map<string, Kisi>();

  for (const k of kisiler) {
    if (!ID.test(k.id)) hatalar.push(`"${k.id}": id yalnızca küçük harf, rakam ve tireden oluşur.`);
    if (kimlik.has(k.id)) hatalar.push(`"${k.id}" iki kez yazılmış.`);
    kimlik.set(k.id, k);
  }
  if (!kimlik.has(kok)) hatalar.push(`Kök kişi "${kok}" listede yok.`);

  for (const k of kisiler) {
    const kim = `"${k.id}"`;
    if (!k.ad.trim()) hatalar.push(`${kim}: ad boş.`);

    for (const [alan, beklenen] of [
      ["baba", "erkek"],
      ["anne", "kadin"]
    ] as const) {
      const hedef = k[alan];
      if (!hedef) continue;
      const h = kimlik.get(hedef);
      if (hedef === k.id) hatalar.push(`${kim}: kendi ${alan === "baba" ? "babası" : "annesi"} olarak yazılmış.`);
      else if (!h) hatalar.push(`${kim}: ${alan} "${hedef}" listede yok.`);
      else if (h.cinsiyet && h.cinsiyet !== beklenen) hatalar.push(`${kim}: ${alan} olarak yazılan "${hedef}" ${h.cinsiyet}.`);
    }
    if (k.baba && k.babaAdi) hatalar.push(`${kim}: babası listedeyken babaAdi yazılmaz.`);
    if (k.anne && k.anneAdi) hatalar.push(`${kim}: annesi listedeyken anneAdi yazılmaz.`);

    for (const es of k.esler ?? []) {
      if (es === k.id) hatalar.push(`${kim}: kendi eşi olarak yazılmış.`);
      else if (!kimlik.has(es)) hatalar.push(`${kim}: eş "${es}" listede yok.`);
    }

    for (const [alan, olay] of [
      ["dogum", k.dogum],
      ["vefat", k.vefat]
    ] as const) {
      if (olay?.tarih && !TARIH.test(olay.tarih)) {
        hatalar.push(`${kim}: ${alan} tarihi "${olay.tarih}" — YYYY, YYYY-AA ya da YYYY-AA-GG olmalı.`);
      }
    }

    if (!k.vefat && /\d{4}/.test(k.id)) {
      hatalar.push(`${kim}: hayatta sayılan kişinin id'sinde yıl var; id de repoda okunur, yılı çıkar.`);
    }
    if (!k.vefat && (k.dogum || k.kutuk)) {
      hatalar.push(
        `${kim}: vefat alanı yok, yani hayatta sayılıyor; ama doğum ya da nüfus kaydı yazılmış. ` +
          `Depo herkese açık, hayattaki kişinin bu bilgileri buraya yazılmaz. Vefat ettiyse "vefat: {}" ekle.`
      );
    }
  }

  // Kimse kendi atası olamaz; olursa yerleşim sonsuza kadar yukarı çıkar.
  const durum = new Map<string, "yolda" | "bitti">();
  const dongu = (id: string, yol: string[]): string[] | null => {
    if (durum.get(id) === "bitti") return null;
    if (durum.get(id) === "yolda") return [...yol.slice(yol.indexOf(id)), id];
    durum.set(id, "yolda");
    const k = kimlik.get(id);
    for (const e of [k?.baba, k?.anne]) {
      if (!e || !kimlik.has(e)) continue;
      const bulunan = dongu(e, [...yol, id]);
      if (bulunan) return bulunan;
    }
    durum.set(id, "bitti");
    return null;
  };
  for (const k of kisiler) {
    const bulunan = dongu(k.id, []);
    if (bulunan) {
      hatalar.push(`Soy kendi üstüne dönüyor: ${bulunan.join(" → ")}.`);
      break;
    }
  }

  if (hatalar.length) throw new Error(`app/soyagaci/aile.ts:\n- ${hatalar.join("\n- ")}`);

  const gorunenler: Gorunen[] = kisiler.map((k) => {
    const hayatta = !k.vefat;
    return temiz({
      id: k.id,
      ad: k.ad.trim(),
      soyad: k.soyad,
      oncekiSoyad: k.oncekiSoyad,
      cinsiyet: k.cinsiyet,
      baba: k.baba,
      anne: k.anne,
      esler: [],
      hayatta,
      sanal: false,
      dogum: hayatta ? undefined : k.dogum,
      vefat: hayatta ? undefined : k.vefat,
      kutuk: hayatta ? undefined : k.kutuk,
      not: k.not
    });
  });

  // Yalnızca adı bilinen anne-babalar. Id'lerindeki nokta gerçek bir id'de
  // olamayacağı için çakışmaz.
  for (const k of kisiler) {
    const g = gorunenler.find((x) => x.id === k.id)!;
    if (!k.baba && k.babaAdi) {
      g.baba = `${k.id}.baba`;
      gorunenler.push({ id: g.baba, ad: k.babaAdi, cinsiyet: "erkek", esler: [], hayatta: false, sanal: true });
    }
    if (!k.anne && k.anneAdi) {
      g.anne = `${k.id}.anne`;
      gorunenler.push({ id: g.anne, ad: k.anneAdi, cinsiyet: "kadin", esler: [], hayatta: false, sanal: true });
    }
  }

  const bul = new Map(gorunenler.map((g) => [g.id, g]));
  const esle = (a: string, b: string) => {
    const l = bul.get(a)!.esler;
    if (!l.includes(b)) l.push(b);
  };
  for (const k of kisiler) {
    for (const es of k.esler ?? []) {
      esle(k.id, es);
      esle(es, k.id);
    }
  }
  for (const g of gorunenler) {
    if (g.baba && g.anne) {
      esle(g.baba, g.anne);
      esle(g.anne, g.baba);
    }
  }

  const ulasilan = new Set([kok]);
  const sira = [kok];
  const komsular = new Map<string, string[]>(gorunenler.map((g) => [g.id, []]));
  for (const g of gorunenler) {
    for (const e of [g.baba, g.anne, ...g.esler]) {
      if (!e) continue;
      komsular.get(g.id)!.push(e);
      komsular.get(e)!.push(g.id);
    }
  }
  while (sira.length) {
    for (const n of komsular.get(sira.shift()!)!) {
      if (!ulasilan.has(n)) {
        ulasilan.add(n);
        sira.push(n);
      }
    }
  }
  const kopuk = gorunenler.filter((g) => !ulasilan.has(g.id)).map((g) => `"${g.id}"`);
  if (kopuk.length) {
    throw new Error(
      `app/soyagaci/aile.ts:\n- Ağaca bağlanmayan kişi: ${kopuk.join(", ")}. baba, anne ya da esler alanıyla birine bağlanmalı.`
    );
  }

  return gorunenler;
}

/** undefined alanları atar; sayfaya gömülen veri kısa kalsın. */
function temiz<T extends object>(nesne: T): T {
  return Object.fromEntries(Object.entries(nesne).filter(([, v]) => v !== undefined)) as T;
}

export type Aile = {
  kisiler: Gorunen[];
  kisi: (id: string) => Gorunen;
  /** Veri sırasıyla. */
  cocuklar: (id: string) => string[];
  /** Anne-babası ikisi de aynı olanlar, kişinin kendisi dahil, veri sırasıyla. */
  tamKardesler: (id: string) => string[];
  /** En az bir ebeveyni ortak olanlar, kişinin kendisi hariç. */
  kardesler: (id: string) => string[];
};

export function aileKur(kisiler: Gorunen[]): Aile {
  const bul = new Map(kisiler.map((k) => [k.id, k]));
  const cocuk = new Map<string, string[]>();
  for (const k of kisiler) {
    for (const e of [k.baba, k.anne]) if (e) cocuk.set(e, [...(cocuk.get(e) ?? []), k.id]);
  }

  return {
    kisiler,
    kisi: (id) => bul.get(id)!,
    cocuklar: (id) => cocuk.get(id) ?? [],
    tamKardesler: (id) => {
      const k = bul.get(id)!;
      if (!k.baba && !k.anne) return [id];
      return kisiler.filter((p) => p.baba === k.baba && p.anne === k.anne).map((p) => p.id);
    },
    kardesler: (id) => {
      const k = bul.get(id)!;
      return kisiler
        .filter((p) => p.id !== id && ((k.baba && p.baba === k.baba) || (k.anne && p.anne === k.anne)))
        .map((p) => p.id);
    }
  };
}

export const adSoyad = (k: Gorunen) => [k.ad, k.soyad].filter(Boolean).join(" ");

const buyukHarf = (s: string) => s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);

/*
 * Akrabalık: kökten kişiye en kısa yol, adım adım. B babası, A annesi,
 * O oğlu, K kızı, C cinsiyeti bilinmeyen çocuğu, E eşi. Eş adımı biraz daha
 * pahalı: "annem" yolu hep "babamın eşi"nden önce gelsin.
 */

const KELIME: Record<string, [string, string, string, string]> = {
  // [benim, benimin, onun, onunun]
  B: ["babam", "babamın", "babası", "babasının"],
  A: ["annem", "annemin", "annesi", "annesinin"],
  O: ["oğlum", "oğlumun", "oğlu", "oğlunun"],
  K: ["kızım", "kızımın", "kızı", "kızının"],
  C: ["çocuğum", "çocuğumun", "çocuğu", "çocuğunun"],
  E: ["eşim", "eşimin", "eşi", "eşinin"],
  S: ["kardeşim", "kardeşimin", "kardeşi", "kardeşinin"]
};

/** "BAB" → "Babamın annesinin babası". Bir üst bir alt adım "kardeş" olarak okunur. */
function uzunAd(yol: string): string {
  if (!yol) return "";
  const parcalar = [...yol.replace(/[BA][OKC]/g, "S")];
  const n = parcalar.length;
  return buyukHarf(
    parcalar.map((h, i) => KELIME[h][i === 0 ? (n === 1 ? 0 : 1) : i === n - 1 ? 2 : 3]).join(" ")
  );
}

function kisaAd(yol: string, kisiler: Gorunen[]): string {
  const son = kisiler[kisiler.length - 1];
  const cinsine = (erkek: string, kadin: string) =>
    son.cinsiyet === "erkek" ? erkek : son.cinsiyet === "kadin" ? kadin : "";

  if (yol === "") return "Ben";
  if (yol === "B") return "Babam";
  if (yol === "A") return "Annem";
  if (yol === "BB" || yol === "AB") return "Dedem";
  if (yol === "BA") return "Babaannem";
  if (yol === "AA") return "Anneannem";
  if (/^[BA]{3,}$/.test(yol)) {
    const kac = yol.length - 2;
    return buyukHarf(`${kac > 1 ? `${kac}. ` : ""}büyük ${yol.endsWith("B") ? "dedem" : "ninem"}`);
  }
  if (yol === "O") return "Oğlum";
  if (yol === "K") return "Kızım";
  if (yol === "C") return "Çocuğum";
  if (/^[OKC]{2}$/.test(yol)) return "Torunum";
  if (/^[OKC]{3}$/.test(yol)) return "Torunumun çocuğu";
  if (/^[BA][OKC]$/.test(yol)) return "Kardeşim";
  if (/^B[BA]O$/.test(yol)) return "Amcam";
  if (/^B[BA]K$/.test(yol)) return "Halam";
  if (/^A[BA]O$/.test(yol)) return "Dayım";
  if (/^A[BA]K$/.test(yol)) return "Teyzem";
  if (/^[BA]{2}[OKC]{2}$/.test(yol)) return "Kuzenim";
  if (/^[BA][OKC]{2}$/.test(yol)) return "Yeğenim";
  if (yol === "E") return "Eşim";
  if (yol === "EB") return "Kayınpederim";
  if (yol === "EA") return "Kayınvalidem";
  if (/^E[BA]O$/.test(yol)) return "Kayınbiraderim";
  if (/^E[BA]K$/.test(yol)) {
    const es = kisiler[1];
    return es.cinsiyet === "kadin" ? "Baldızım" : es.cinsiyet === "erkek" ? "Görümcem" : "";
  }
  if (/^[OKC]E$/.test(yol)) return cinsine("Damadım", "Gelinim");
  if (/^[BA]{1,2}[OK]E$/.test(yol)) return cinsine("Eniştem", "Yengem");
  if (yol === "BE" || yol === "AE") return cinsine("Üvey babam", "Üvey annem");
  if (yol === "EO") return "Üvey oğlum";
  if (yol === "EK") return "Üvey kızım";
  return "";
}

/** Kökten herkese akrabalık. Kök dahil; köke bağlı olmayan yok (hazirla bunu durdurur). */
export function yakinliklar(aile: Aile, kok: string): Map<string, Yakinlik> {
  type Iz = { maliyet: number; onceki: string | null; adim: string };
  const iz = new Map<string, Iz>([[kok, { maliyet: 0, onceki: null, adim: "" }]]);
  const bitti = new Set<string>();

  for (;;) {
    let simdi: string | null = null;
    for (const [id, i] of iz) {
      if (!bitti.has(id) && (simdi === null || i.maliyet < iz.get(simdi)!.maliyet)) simdi = id;
    }
    if (simdi === null) break;
    bitti.add(simdi);

    const k = aile.kisi(simdi);
    const temel = iz.get(simdi)!.maliyet;
    const kenarlar: [string | undefined, string, number][] = [
      [k.baba, "B", 2],
      [k.anne, "A", 2],
      ...aile.cocuklar(simdi).map((c): [string, string, number] => {
        const cins = aile.kisi(c).cinsiyet;
        return [c, cins === "erkek" ? "O" : cins === "kadin" ? "K" : "C", 2];
      }),
      ...k.esler.map((e): [string, string, number] => [e, "E", 3])
    ];
    for (const [hedef, adim, bedel] of kenarlar) {
      if (!hedef || bitti.has(hedef)) continue;
      const mevcut = iz.get(hedef);
      if (!mevcut || temel + bedel < mevcut.maliyet) iz.set(hedef, { maliyet: temel + bedel, onceki: simdi, adim });
    }
  }

  const sonuc = new Map<string, Yakinlik>();
  for (const id of iz.keys()) {
    let yol = "";
    const zincir: Gorunen[] = [];
    for (let c: string | null = id; c !== null && c !== kok; c = iz.get(c)!.onceki) {
      yol = iz.get(c)!.adim + yol;
      zincir.unshift(aile.kisi(c));
    }
    zincir.unshift(aile.kisi(kok));
    const kusak = [...yol].reduce((t, h) => t + ("BA".includes(h) ? -1 : "OKC".includes(h) ? 1 : 0), 0);
    sonuc.set(id, { kisa: kisaAd(yol, zincir), uzun: uzunAd(yol), kusak });
  }
  return sonuc;
}

export function kusakBasligi(kusak: number): string {
  if (kusak === 0) return "Benim kuşağım";
  if (kusak === -1) return "Anne-babamın kuşağı";
  if (kusak === -2) return "Dedelerimin kuşağı";
  if (kusak === -3) return "Büyük dedelerimin kuşağı";
  if (kusak < 0) return `${-kusak - 2}. büyük dedelerimin kuşağı`;
  if (kusak === 1) return "Çocuklarımın kuşağı";
  if (kusak === 2) return "Torunlarımın kuşağı";
  return `${kusak}. kuşak torunlarım`;
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** "1931-03-12" → "12 Mart 1931"; ne kadarı yazılıysa o kadarı. */
export function tarihYazisi(tarih: string): string {
  const [yil, ay, gun] = tarih.split("-");
  return [gun ? Number(gun) : null, ay ? AYLAR[Number(ay) - 1] : null, yil].filter(Boolean).join(" ");
}

/** Kartın altındaki "1921 – 1987". Hayattakilerde boş. */
export function yillar(k: Gorunen): string {
  if (k.hayatta) return "";
  const dogum = k.dogum?.tarih?.slice(0, 4);
  const vefat = k.vefat?.tarih?.slice(0, 4);
  if (!dogum && !vefat) return "";
  return `${dogum ?? "?"} – ${vefat ?? "?"}`;
}

export function ozetle(aile: Aile, yakinlik: Map<string, Yakinlik>) {
  const gercek = aile.kisiler.filter((k) => !k.sanal);
  const kusaklar = gercek.map((k) => yakinlik.get(k.id)!.kusak);
  const dogumYillari = gercek.map((k) => k.dogum?.tarih?.slice(0, 4)).filter((y): y is string => Boolean(y));
  return {
    kisi: gercek.length,
    kusak: Math.max(...kusaklar) - Math.min(...kusaklar) + 1,
    enEski: dogumYillari.length ? dogumYillari.sort()[0] : null
  };
}

/* ── Yerleşim ───────────────────────────────────────────────────────────── */

/**
 * Kart ölçüleri piksel. CSS de bunları kullanır (sayfa değişken olarak
 * yazar); iki yerde ayrı ayrı durursa çizgiler kartları ıskalar.
 */
export const OLCU = { kartG: 184, kartY: 88, araG: 28, araY: 64, kenar: 72 } as const;

const BIRIM = OLCU.kartG + OLCU.araG;
const SATIR = OLCU.kartY + OLCU.araY;

export type YerKart = {
  /** React anahtarı: kişi aynı ağaçta iki kez çıkarsa (akraba evliliği) ikincisi "~2" alır. */
  anahtar: string;
  id: string;
  /** Kartın sol üst köşesi, sahnede piksel. */
  x: number;
  y: number;
};

export type Yerlesim = {
  kartlar: YerKart[];
  /** SVG path "d" değerleri. */
  cizgiler: string[];
  genislik: number;
  yukseklik: number;
  /** Odaktaki kartın merkezi. */
  odak: { x: number; y: number };
};

type Hat =
  | { tur: "es"; a: number; b: number; g: number }
  | { tur: "inis"; sx: number; orta: boolean; g: number; tx: number; kat: number };

/**
 * Odaktaki kişiden bakan "kum saati": yukarıda bütün bilinen ataları, kendi
 * satırında kardeşleri ve eşleri, aşağıda bütün torunları. Amca, kuzen,
 * ikinci evlilik gibi yan dallar burada yok; o kişiyi (ya da ortak atayı)
 * merkeze almak onları getirir. Böylece çizgiler hiç kesişmeyen bir düzen
 * her zaman kurulabiliyor.
 *
 * Birimler önce "kart genişliği" cinsinden hesaplanır: her kişinin
 * yukarıdaki (ya da aşağıdaki) soyu kendine ait bir bloğa sığar, bloklar yan
 * yana dizilir, kişi kendi bloğunun içinde kalır. Aynı satırda iki kart bu
 * yüzden hiçbir zaman üst üste binmez.
 */
export function yerlestir(aile: Aile, odak: string): Yerlesim {
  const kartlar: { id: string; cx: number; g: number }[] = [];
  const hatlar: Hat[] = [];
  const kisi = aile.kisi;

  const ebeveynleri = (id: string) => [kisi(id).baba, kisi(id).anne].filter((e): e is string => Boolean(e));
  const esHatti = (a: number, b: number, g: number): Hat => ({ tur: "es", a: Math.min(a, b), b: Math.max(a, b), g });

  // ── Atalar: baba soyu solda, anne soyu sağda; her çift yan yana.
  const atGenislik = new Map<string, number>();
  const atGenisligi = (id: string): number => {
    let w = atGenislik.get(id);
    if (w === undefined) {
      w = Math.max(1, ebeveynleri(id).reduce((t, e) => t + atGenisligi(e), 0));
      atGenislik.set(id, w);
    }
    return w;
  };

  /** Kişinin anne-babasını g−1 satırına, sol'dan başlayarak dizer; çocuğa inecek çizginin başını döner. */
  const ebeveynleriDiz = (id: string, g: number, sol: number) => {
    const k = kisi(id);
    if (k.baba && k.anne) {
      const bx = ataDiz(k.baba, g - 1, sol, "baba");
      const ax = ataDiz(k.anne, g - 1, sol + atGenisligi(k.baba), "anne");
      hatlar.push(esHatti(bx, ax, g - 1));
      return { x: (bx + ax) / 2, orta: true };
    }
    const tek = k.baba ?? k.anne;
    return tek ? { x: ataDiz(tek, g - 1, sol, k.baba ? "baba" : "anne"), orta: false } : null;
  };

  /**
   * Kartı kendi bloğunun ucuna koyar: baba sağ uca, anne sol uca, yani çift
   * iki bloğun birleştiği yerde yan yana oturur. Kişinin kendi anne-babası
   * bloğun içinde, onların birleşme yerinde; aradaki fark dirsekli çizgiyle
   * kapanır. Böylece en yakın akrabalar hep bir arada, uzayan yalnızca yukarı
   * doğru açılan dallar oluyor.
   */
  const ataDiz = (id: string, g: number, sol: number, yan: "baba" | "anne"): number => {
    const cx = yan === "baba" ? sol + atGenisligi(id) - 0.5 : sol + 0.5;
    const ust = ebeveynleriDiz(id, g, sol);
    if (ust) hatlar.push({ tur: "inis", sx: ust.x, orta: ust.orta, g: g - 1, tx: cx, kat: 0 });
    kartlar.push({ id, cx, g });
    return cx;
  };

  // ── Torunlar: kişi ve eşleri yan yana, çocuklar altlarında ortalı.
  const ciftDizisi = (id: string) => {
    const esler = kisi(id).esler;
    return esler.length < 2 ? [id, ...esler] : [esler[0], id, ...esler.slice(1)];
  };

  const gruplar = (id: string) => {
    const dizi = ciftDizisi(id);
    const grup = new Map<string | null, string[]>();
    for (const c of aile.cocuklar(id)) {
      const ck = kisi(c);
      const diger = (ck.baba === id ? ck.anne : ck.baba) ?? null;
      grup.set(diger, [...(grup.get(diger) ?? []), c]);
    }
    const yeri = (es: string | null) => dizi.indexOf(es ?? id);
    return [...grup].map(([es, cocuklar]) => ({ es, cocuklar })).sort((a, b) => yeri(a.es) - yeri(b.es));
  };

  const torunGenislik = new Map<string, number>();
  const cocukGenisligi = (id: string) =>
    gruplar(id).reduce((t, grup) => t + grup.cocuklar.reduce((u, c) => u + torunGenisligi(c), 0), 0);
  const torunGenisligi = (id: string): number => {
    let w = torunGenislik.get(id);
    if (w === undefined) {
      w = Math.max(ciftDizisi(id).length, cocukGenisligi(id));
      torunGenislik.set(id, w);
    }
    return w;
  };

  /** id'nin çocuklarını g+1 satırına, orta'nın altında ortalayarak dizer. */
  const cocuklariDiz = (id: string, g: number, konum: (p: string) => number, orta: number) => {
    const hepsi = gruplar(id);
    let s = orta - cocukGenisligi(id) / 2;
    hepsi.forEach((grup, i) => {
      const sx = grup.es ? (konum(id) + konum(grup.es)) / 2 : konum(id);
      for (const c of grup.cocuklar) {
        const w = torunGenisligi(c);
        const cx = torunDiz(c, g + 1, s);
        hatlar.push({ tur: "inis", sx, orta: Boolean(grup.es), g, tx: cx, kat: i - (hepsi.length - 1) / 2 });
        s += w;
      }
    });
  };

  const torunDiz = (id: string, g: number, sol: number): number => {
    const dizi = ciftDizisi(id);
    const w = torunGenisligi(id);
    const bas = sol + (w - dizi.length) / 2;
    const konum = (p: string) => bas + dizi.indexOf(p) + 0.5;
    for (const p of dizi) kartlar.push({ id: p, cx: konum(p), g });
    for (const e of kisi(id).esler) hatlar.push(esHatti(konum(id), konum(e), g));
    cocuklariDiz(id, g, konum, sol + w / 2);
    return konum(id);
  };

  // ── Odağın satırı: ağabey ve ablalar solda, kendisi ve eşleri, küçükler sağda.
  const ust = ebeveynleriDiz(odak, 0, 0);
  const kardesler = aile.tamKardesler(odak);
  const cift = ciftDizisi(odak);
  const sirada = kardesler.indexOf(odak);
  const satir = [...kardesler.slice(0, sirada), ...cift, ...kardesler.slice(sirada + 1)];
  const kardesYeri = kardesler.map((k) => satir.indexOf(k) + 0.5);
  const kayma = (ust ? ust.x : 0.5) - (Math.min(...kardesYeri) + Math.max(...kardesYeri)) / 2;
  const satirYeri = new Map(satir.map((id, i) => [id, i + 0.5 + kayma]));
  const yeri = (id: string) => satirYeri.get(id)!;

  for (const id of satir) kartlar.push({ id, cx: yeri(id), g: 0 });
  if (ust) for (const k of kardesler) hatlar.push({ tur: "inis", sx: ust.x, orta: ust.orta, g: -1, tx: yeri(k), kat: 0 });
  for (const e of kisi(odak).esler) hatlar.push(esHatti(yeri(odak), yeri(e), 0));
  cocuklariDiz(odak, 0, yeri, cift.reduce((t, p) => t + yeri(p), 0) / cift.length);

  // ── Birimden piksele.
  const enSol = Math.min(...kartlar.map((k) => k.cx));
  const enSag = Math.max(...kartlar.map((k) => k.cx));
  const enUst = Math.min(...kartlar.map((k) => k.g));
  const enAlt = Math.max(...kartlar.map((k) => k.g));
  const X = (cx: number) => OLCU.kenar + OLCU.kartG / 2 + (cx - enSol) * BIRIM;
  const Y = (g: number) => OLCU.kenar + OLCU.kartY / 2 + (g - enUst) * SATIR;
  const r = (v: number) => Math.round(v * 10) / 10;

  const tekrar = new Map<string, number>();
  const yerKartlar = kartlar.map((k) => {
    const n = (tekrar.get(k.id) ?? 0) + 1;
    tekrar.set(k.id, n);
    return {
      anahtar: n === 1 ? k.id : `${k.id}~${n}`,
      id: k.id,
      x: r(X(k.cx) - OLCU.kartG / 2),
      y: r(Y(k.g) - OLCU.kartY / 2)
    };
  });

  const cizgiler = hatlar.map((h) => {
    if (h.tur === "es") return `M${r(X(h.a) + OLCU.kartG / 2)} ${r(Y(h.g))}H${r(X(h.b) - OLCU.kartG / 2)}`;
    const sy = h.orta ? Y(h.g) : Y(h.g) + OLCU.kartY / 2;
    const by = Y(h.g) + OLCU.kartY / 2 + OLCU.araY / 2 + h.kat * 8;
    return inis(X(h.sx), sy, by, X(h.tx), Y(h.g + 1) - OLCU.kartY / 2);
  });

  const odakKarti = yerKartlar.find((k) => k.id === odak)!;
  return {
    kartlar: yerKartlar,
    cizgiler: [...new Set(cizgiler)],
    genislik: r(2 * OLCU.kenar + OLCU.kartG + (enSag - enSol) * BIRIM),
    yukseklik: r(2 * OLCU.kenar + OLCU.kartY + (enAlt - enUst) * SATIR),
    odak: { x: odakKarti.x + OLCU.kartG / 2, y: odakKarti.y + OLCU.kartY / 2 }
  };
}

/** Kaynaktan aşağı, ara yükseklikte yana, hedefe aşağı; köşeler yuvarlak. */
function inis(sx: number, sy: number, by: number, tx: number, ty: number) {
  const r = (v: number) => Math.round(v * 10) / 10;
  const dx = tx - sx;
  if (Math.abs(dx) < 1) return `M${r(tx)} ${r(sy)}V${r(ty)}`;
  const yon = Math.sign(dx);
  const k = Math.min(12, Math.abs(dx) / 2, by - sy, ty - by);
  return (
    `M${r(sx)} ${r(sy)}V${r(by - k)}Q${r(sx)} ${r(by)} ${r(sx + yon * k)} ${r(by)}` +
    `H${r(tx - yon * k)}Q${r(tx)} ${r(by)} ${r(tx)} ${r(by + k)}V${r(ty)}`
  );
}
