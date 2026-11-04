/**
 * mgumrah.com/ilan/<araç> — satılık araç ilanlarının ortak veri biçimi. Her
 * aracın bilgisi kendi klasöründeki ilan.ts'te (ör. ./civic/ilan.ts); sayfayı
 * çizen kod ortak (./ilan-sayfasi.tsx).
 */

export type ParcaId =
  | "onTampon"
  | "motorKaputu"
  | "tavan"
  | "bagajKapagi"
  | "arkaTampon"
  | "solOnCamurluk"
  | "solOnKapi"
  | "solArkaKapi"
  | "solArkaCamurluk"
  | "sagOnCamurluk"
  | "sagOnKapi"
  | "sagArkaKapi"
  | "sagArkaCamurluk";

/** Orijinal parça listeye yazılmaz; yazılan her parça bu üç durumdan biridir. */
export type ParcaDurumu = "lokal" | "boyali" | "degisen";

export type Foto = {
  /** public/images/<slug>/<id>-{lg,md,sm}.jpg */
  id: number;
  /** Dikey çekim (3:4). Yataylar 4:3. */
  dikey?: boolean;
  alt: string;
  /**
   * Eski bir kareyse çekildiği ay, ör. "Nisan 2021": fotoğrafın üstünde etiket
   * olarak görünür ki alıcı aracın bugünkü hâli sanmasın. Güncel karelerde yok.
   */
  tarih?: string;
};

export type DonanimGrubu = {
  baslik: string;
  /** Sahibinden'in bu gruptaki bütün seçenekleri, göründükleri sırayla. */
  secenekler: string[];
  /** Araçta olanlar — `secenekler` içindeki yazımla birebir aynı olmalı. */
  var: string[];
};

/**
 * Servis formu ya da muayene raporu. Dosyalar public/belgeler/<slug>/ altında;
 * asıllarından küçültülüp kişisel bilgileri karartılarak üretilir (ad, adres,
 * TC kimlik no, müşteri kodu, imzalar, şasi/motor no, rapor no, barkod, QR).
 * Telefon bilerek açık: ilandaki numarayla aynı olması belgeyi satıcıya bağlıyor.
 */
export type Belge = {
  /** YYYY-AA-GG */
  tarih: string;
  km: number;
  baslik: string;
  /** Belgenin kendisinde yazanın özeti — eklenen yorum yok. */
  yapilanlar: string;
  /** Yalnız bakımlardan farklı bir yerde yapıldıysa. */
  yer?: string;
  /** public/ altındaki yol */
  dosya: string;
};

export type Ilan = {
  /**
   * Adres parçası: sayfa /ilan/<slug>/ altında, fotoğraflar /images/<slug>/
   * altında durur.
   */
  slug: string;
  baslik: string;
  /** Sayfanın en üstündeki kategori yolu, ör. Vasıta › Otomobil › Honda … */
  yol: string[];
  /** TL. null iken fiyat yerine "Fiyat için arayın" yazar. */
  fiyat: number | null;
  /** YYYY-AA-GG */
  ilanTarihi: string;
  konum: { il: string; ilce: string | null };
  satici: {
    ad: string;
    /**
     * Başında 90 olan 12 hane, ör. "905321234567". null iken telefon satırı,
     * Ara / WhatsApp düğmeleri ve mobildeki alt çubuk hiç çizilmez.
     */
    telefon: string | null;
  };
  arac: {
    marka: string;
    seri: string;
    model: string;
    yil: number;
    yakit: string;
    vites: string;
    durum: string;
    km: number;
    kasa: string;
    motorGucu: string;
    motorHacmi: string;
    cekis: string;
    renk: string;
    /** Ruhsatta ve muayene raporunda yazan renk; göze göründüğünden farklıysa. */
    ruhsatRengi: string | null;
    servisGarantisi: string;
    agirHasarKayitli: string;
    plaka: string;
    kimden: string;
    takas: string;
  };
  /** Fiyatın altındaki onay rozetleri; paylaşım önizlemesine de eklenir. */
  rozetler: string[];
  /** WhatsApp'a yapıştırılan bağlantının önizleme satırına eklenen öne çıkanlar. */
  oneCikanlar: string[];
  /** Her eleman bir paragraf. */
  aciklama: string[];
  /** Bakım geçmişi bölümünün giriş cümlesi. */
  bakimNotu: string;
  /** Eskiden yeniye. */
  belgeler: Belge[];
  /**
   * null → "Belirtilmemiş" (şema gri çizilir).
   * {}   → bütün parçalar orijinal.
   * { solOnKapi: "lokal", onTampon: "boyali" } → yalnızca yazılanlar işaretlenir.
   */
  boyaDegisen: Partial<Record<ParcaId, ParcaDurumu>> | null;
  /** Boyanın neden yapıldığı; şemanın yanındaki listenin altında görünür. */
  boyaNotu: string | null;
  /** TL. null → satır gizli, 0 → "Yok". */
  tramer: number | null;
  donanim: DonanimGrubu[];
  teknik: [string, string][];
  /** Teknik özellikler tablosunun altındaki not: değerlerin nereden geldiği. */
  teknikNotu: string;
  /** Galeri sırası; ilki kapak. */
  fotograflar: Foto[];
};
