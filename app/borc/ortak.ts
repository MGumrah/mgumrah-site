/**
 * /borc — sayfa ile Worker'ın paylaştığı tipler. Çalışma zamanı kodu YOK:
 * app/borc/hesap.ts bu dosyayı yalnızca `import type` ile alır, böylece hesap
 * mantığı Node'un kendi test koşucusunda (scripts/borc-test.mjs) hiçbir
 * derleyici olmadan çalışır.
 *
 * Bütün tutarlar kuruş cinsinden tamsayıdır (1.249,90 TL = 124990).
 * Tarihler İstanbul takvimindeki gün "YYYY-MM-DD", aylar "YYYY-MM".
 */

export type HesapTuru = "kart" | "kmh" | "diger";

export type Hesap = {
  id: number;
  ad: string;
  tur: HesapTuru;
  /** Güncel limit. KMH ve kartta anlamlı; "diger" için 0. */
  limit: number;
  kesimGunu: number | null;
  sonOdemeGunu: number | null;
  /** 0-1 arası; 0,4 = ekstrenin %40'ı. Boşsa varsayılan oran kullanılır. */
  asgariOrani: number | null;
  sira: number;
};

/** Bir hesabın bir günkü ölçümü. Hesap başına en yeni tarih güncel durumdur. */
export type Durum = {
  id: number;
  hesapId: number;
  tarih: string;
  ay: string;
  borc: number;
  limit: number | null;
  ekstre: number | null;
  asgari: number | null;
  sonOdeme: string | null;
  not: string;
};

export type Islem = {
  id: number;
  tarih: string;
  hesapId: number;
  aciklama: string;
  /** Pozitif harcama, negatif iade. */
  tutar: number;
  taksit: number;
  ekstreAy: string;
  kategori: string;
  not: string;
};

export type ParaBirimi = "TRY" | "USD";

export const PARA_BIRIMLERI: readonly ParaBirimi[] = ["TRY", "USD"];

export type Gelir = {
  id: number;
  ad: string;
  /** `paraBirimi`nin 1/100'ü: TRY'de kuruş, USD'de sent. */
  tutar: number;
  paraBirimi: ParaBirimi;
  beklenenTarih: string;
  /** false: tarih kesin değil. */
  kesin: boolean;
  alindiTarihi: string | null;
  /** Bir düzenli gelir kaleminin o ayki gerçekleşen kaydıysa onun id'si. */
  duzenliId: number | null;
  not: string;
};

/** Her ay tekrarlayan gelir (maaş, kira...). Takvim bundan aylık satır türetir. */
export type DuzenliGelir = {
  id: number;
  ad: string;
  /** `paraBirimi`nin 1/100'ü. */
  tutar: number;
  paraBirimi: ParaBirimi;
  /** Ayın kaçında yatar. */
  gun: number;
  /** false: yatış günü kesin değil. */
  kesin: boolean;
  /** İlk beklenen ay, "YYYY-MM". */
  baslangicAy: string;
  aktif: boolean;
  not: string;
};

/** Faiz varsayımları; Excel'deki "Hesaplar ve ayarlar" sayfasıyla aynı kavramlar. */
export type Ayarlar = {
  /** KKDF + BSMV çarpanı: faiz bununla çarpılır. */
  vergiCarpani: number;
  /** Aylık kart faizi, devreden tutar eşikten küçük ya da eşit ise. */
  kartFaiziAlt: number;
  /** Aylık kart faizi, devreden tutar eşiği aşıyorsa. */
  kartFaiziUst: number;
  /** kuruş */
  faizEsigi: number;
  kmhFaizi: number;
  /** Ekstre asgarisi bilinmiyorsa ekstrenin bu oranı alınır. */
  varsayilanAsgariOrani: number;
  /**
   * 1 USD kaç TL. Resmî kur DEĞİL, elle girilen tahmin; dövizli gelirin TL karşılığında kullanılır.
   * 0 = girilmedi: dövizli tutarlar TL toplamlarına katılmaz (yanlış toplam göstermemek için).
   */
  usdTry: number;
  /** Nakit akışının başlangıç bakiyesi (kuruş); elle girilir. */
  eldekiNakit: number;
};

export type Veri = {
  hesaplar: Hesap[];
  durum: Durum[];
  islemler: Islem[];
  gelirler: Gelir[];
  duzenliGelirler: DuzenliGelir[];
  ayarlar: Ayarlar;
};

/** Çerezi olan kişinin kim olduğunu söyler; sayfa ismini üst şeritte yazar. */
export type Oturum = { kullaniciAdi: string };

export type IslemGirdisi = {
  tarih: string;
  hesapId: number;
  aciklama: string;
  tutar: number;
  taksit: number;
  kategori?: string;
  not?: string;
  /** Doluysa sunucu kesim gününe göre hesaplamaz, bunu yazar. */
  ekstreAy?: string;
};

export type DurumGirdisi = {
  hesapId: number;
  tarih?: string;
  borc: number;
  limit?: number | null;
  ekstre?: number | null;
  asgari?: number | null;
  sonOdeme?: string | null;
  not?: string;
};

export type GelirGirdisi = {
  ad: string;
  tutar: number;
  paraBirimi?: ParaBirimi;
  beklenenTarih: string;
  kesin?: boolean;
  alindiTarihi?: string | null;
  duzenliId?: number | null;
  not?: string;
};

export type HesapGirdisi = {
  ad: string;
  tur: HesapTuru;
  /** kuruş; "diger" için yok sayılır. */
  limit?: number;
  kesimGunu?: number | null;
  sonOdemeGunu?: number | null;
  /** 0-1; boşsa ayarlardaki varsayılan oran. */
  asgariOrani?: number | null;
};

/** Faiz varsayımları ve nakit; `usdTry` ayrı uçtan (kur) güncellenir. */
export type AyarGirdisi = Partial<Omit<Ayarlar, "usdTry">>;

export type DuzenliGelirGirdisi = {
  ad: string;
  tutar: number;
  paraBirimi: ParaBirimi;
  gun: number;
  kesin: boolean;
  baslangicAy: string;
  aktif?: boolean;
  not?: string;
};

export const SINIR = {
  aciklamaEnFazla: 160,
  notEnFazla: 400,
  kategoriEnFazla: 40,
  adEnFazla: 80,
  /** 100 milyon TL: yanlış sıfır girmeye karşı üst sınır, gerçek bir borcu engellemez. */
  tutarEnFazlaKurus: 10_000_000_000,
  taksitEnFazla: 60,
  sifreEnAz: 12,
  sifreEnFazla: 200
} as const;

export const VARSAYILAN_AYARLAR: Ayarlar = {
  vergiCarpani: 1.3,
  kartFaiziAlt: 0.035,
  kartFaiziUst: 0.04,
  faizEsigi: 2_500_000,
  kmhFaizi: 0.0425,
  varsayilanAsgariOrani: 0.4,
  // Tahmin. Gerçek kur uygulamadan değiştirilir (Gelir sekmesi); bu rakam yalnızca başlangıç değeri.
  usdTry: 50.4,
  eldekiNakit: 0
};

/** USD/TRY için makul aralık: yanlış virgülü yakalar, gerçek bir kuru engellemez. 0 (girilmedi) ayrıca kabul edilir. */
export const KUR_SINIRI = { enAz: 1, enCok: 1000 } as const;

/** Faiz varsayımlarının makul aralıkları (sunucu ve form aynı sınırı kullanır). */
export const AYAR_SINIRI = {
  vergiCarpani: { enAz: 1, enCok: 3 },
  kartFaiziAlt: { enAz: 0, enCok: 0.2 },
  kartFaiziUst: { enAz: 0, enCok: 0.2 },
  kmhFaizi: { enAz: 0, enCok: 0.2 },
  varsayilanAsgariOrani: { enAz: 0, enCok: 1 }
} as const;
