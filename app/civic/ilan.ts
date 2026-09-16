/**
 * mgumrah.com/civic — satılık Civic'in bütün bilgisi burada; sayfa yalnızca
 * bunu çizer. Fiyat, telefon, boya/değişen ya da açıklama değişecekse
 * dokunulacak tek dosya bu.
 *
 * Uydurma bilgi yok. Tablodaki her satır ya aracın kendisinden (gösterge
 * fotoğrafı, ruhsat bilgisi) ya da aynı paketin (2020 Civic Sedan 1.5 VTEC Turbo
 * Executive Plus) katalog ve yetkili bayi verisinden geliyor. Emin olunmayan
 * donanım işaretlenmedi: işaretsiz kalan "yok" değil, "belirtilmedi" demek.
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
  /** public/images/civic/<id>-{lg,md,sm}.jpg */
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
 * Servis formu ya da muayene raporu. Dosyalar public/belgeler/civic/ altında;
 * asıllarından küçültülüp kişisel bilgileri karartılarak üretildi (ad, adres,
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

type Ilan = {
  baslik: string;
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
  /** Galeri sırası; ilki kapak. */
  fotograflar: Foto[];
};

export const ilan: Ilan = {
  baslik: "Sahibinden 2020 Honda Civic 1.5 VTEC Executive Plus",
  fiyat: 1950000,
  ilanTarihi: "2026-09-16",
  konum: { il: "Denizli", ilce: "Merkezefendi" },
  satici: {
    ad: "Mehmet Gümrah",
    telefon: "905075211816"
  },

  arac: {
    marka: "Honda",
    seri: "Civic",
    model: "1.5 VTEC Executive Plus",
    yil: 2020,
    yakit: "Benzin",
    vites: "Otomatik",
    durum: "İkinci El",
    // Gösterge fotoğrafındaki değer (IMG_6164, 16.09.2026).
    km: 65203,
    kasa: "Sedan",
    motorGucu: "182 hp",
    motorHacmi: "1498 cc",
    cekis: "Önden Çekiş",
    renk: "Kozmik Mavi",
    ruhsatRengi: null,
    servisGarantisi: "Hayır",
    agirHasarKayitli: "Hayır",
    plaka: "Türkiye (TR) Plakalı",
    kimden: "Sahibinden",
    takas: "Hayır"
  },

  // "İlk sahibinden": muayene raporunda ilk tescil ile tescil tarihi aynı (26.10.2020).
  rozetler: ["İlk sahibinden", "Yetkili servis bakımlı", "Tramer kaydı yok"],
  oneCikanlar: ["Sunroof", "Honda SENSING"],

  aciklama: [
    "2020 model Honda Civic Sedan 1.5 VTEC Turbo Executive Plus, kozmik mavi. İlk sahibinden; araç 65.203 km'de. 182 hp turbo benzinli motor ve CVT otomatik şanzıman.",
    "Periyodik bakımlarının hepsi her yıl Honda yetkili servisinde yapıldı. CVT şanzıman yağı 2022 ve 2024'te, fren hidroliği 2023'te değişti. Beş bakımın servis formu ve son muayene raporu aşağıda.",
    "Yalnızca arka tampon boyalı: geri manevrada ağaca sürttüğü için plastik tampon boyandı, başka yerde hasar yok. Tramer / hasar kaydı yok. Muayenesi 18.09.2027'ye kadar geçerli.",
    "Executive Plus paketinin Honda SENSING güvenlik donanımı araçta: adaptif hız sabitleyici ve şeritte tutma yardımcısı. Bunlara ek olarak sunroof, deri ve ısıtmalı ön koltuklar, anahtarsız giriş ve çalıştırma, geri görüş kamerası, ön ve arka park sensörü, Apple CarPlay ve Android Auto var.",
    "Sağ ön, yan ve arka fotoğraflar Nisan 2021'de, diğerleri 16 Eylül 2026'da çekildi; güncel kilometre gösterge paneli fotoğrafında görülebilir.",
    "Aracı yerinde görmek ve bilgi almak için arayabilirsiniz."
  ],

  bakimNotu:
    "Bakımların hepsi Honda yetkili servisi Turkuaz Motorlu Araçlar'da (Denizli) yapıldı. Belgelerde ad, adres, TC kimlik no, şasi no ve imzalar karartıldı; üzerlerindeki telefon numarası bu ilandakiyle aynı.",

  belgeler: [
    {
      tarih: "2021-11-12",
      km: 11632,
      baslik: "1. yıl bakımı",
      yapilanlar:
        "Motor yağı ve yağ filtresi, hava ve polen filtresi değişimi; motor içi temizlik (engine flush), Premium sağlık ve hijyen paketi.",
      dosya: "/belgeler/civic/bakim-2021.pdf"
    },
    {
      tarih: "2022-10-19",
      km: 23358,
      baslik: "2. yıl bakımı",
      yapilanlar:
        "Motor yağı ve yağ filtresi, CVT şanzıman yağı, hava ve polen filtresi değişimi; klima ve koku bakımı, Premium sağlık ve hijyen paketi.",
      dosya: "/belgeler/civic/bakim-2022.pdf"
    },
    {
      tarih: "2023-09-09",
      km: 36558,
      baslik: "3. yıl bakımı",
      yapilanlar:
        "Motor yağı ve yağ filtresi, polen filtresi ve fren hidroliği değişimi; klima bakımı, Premium sağlık ve hijyen paketi.",
      dosya: "/belgeler/civic/bakim-2023.pdf"
    },
    {
      tarih: "2024-07-25",
      km: 49157,
      baslik: "4. yıl bakımı",
      yapilanlar:
        "Motor yağı ve yağ filtresi, CVT şanzıman yağı, hava ve polen filtresi değişimi; lastik rotasyonu, sunroof kızakları ve kapı gergileri yağlandı, far temizliği, Premium sağlık ve hijyen paketi.",
      dosya: "/belgeler/civic/bakim-2024.pdf"
    },
    {
      tarih: "2025-09-16",
      km: 57664,
      baslik: "5. yıl bakımı",
      yapilanlar:
        "Motor yağı ve yağ filtresi, hava ve polen filtresi değişimi; motor yüzeyi ve klima-kalorifer temizliği, kapı cam fitilleri temizlenip yağlandı.",
      dosya: "/belgeler/civic/bakim-2025.pdf"
    },
    {
      tarih: "2025-09-18",
      km: 57722,
      baslik: "Araç muayenesi",
      yer: "TÜVTÜRK Denizli-Merkez",
      yapilanlar:
        "Sonuç: hafif kusurlu, muayene onaylandı (camlarda sonradan film, kısa far ayarı). Geçerlilik: 18.09.2027.",
      dosya: "/belgeler/civic/muayene-2025.pdf"
    }
  ],

  boyaDegisen: { arkaTampon: "boyali" },
  boyaNotu: "Geri manevrada ağaca sürttüğü için boyandı; yalnızca plastik tampon. Başka yerde hasar yok.",
  tramer: 0,

  donanim: [
    {
      baslik: "Güvenlik",
      secenekler: [
        "ABS",
        "AEB",
        "BAS",
        "Çocuk Kilidi",
        "Distronic",
        "ESP / VSA",
        "Gece Görüş Sistemi",
        "Hava Yastığı (Sürücü)",
        "Hava Yastığı (Yolcu)",
        "Immobilizer",
        "Isofix",
        "Kör Nokta Uyarı Sistemi",
        "Merkezi Kilit",
        "Şerit Takip Sistemi",
        "Yokuş Kalkış Desteği",
        "Yorgunluk Tespit Sistemi"
      ],
      var: [
        "ABS",
        "BAS",
        "Çocuk Kilidi",
        "Distronic",
        "ESP / VSA",
        "Hava Yastığı (Sürücü)",
        "Hava Yastığı (Yolcu)",
        "Immobilizer",
        "Isofix",
        "Merkezi Kilit",
        "Şerit Takip Sistemi",
        "Yokuş Kalkış Desteği"
      ]
    },
    {
      baslik: "İç Donanım",
      secenekler: [
        "Adaptive Cruise Control",
        "Anahtarsız Giriş ve Çalıştırma",
        "Deri Koltuk",
        "Elektrikli Camlar",
        "Fonksiyonel Direksiyon",
        "Geri Görüş Kamerası",
        "Head-up Display",
        "Hız Sabitleme Sistemi",
        "Isıtmalı Direksiyon",
        "Klima",
        "Koltuklar (Elektrikli)",
        "Koltuklar (Hafızalı)",
        "Koltuklar (Isıtmalı)",
        "Koltuklar (Soğutmalı)",
        "Otm. Kararan Dikiz Aynası",
        "Ön Görüş Kamerası",
        "Ön Koltuk Kol Dayaması",
        "Start / Stop",
        "Yol Bilgisayarı"
      ],
      var: [
        "Adaptive Cruise Control",
        "Anahtarsız Giriş ve Çalıştırma",
        "Deri Koltuk",
        "Elektrikli Camlar",
        "Fonksiyonel Direksiyon",
        "Geri Görüş Kamerası",
        "Hız Sabitleme Sistemi",
        "Klima",
        "Koltuklar (Isıtmalı)",
        "Otm. Kararan Dikiz Aynası",
        "Ön Koltuk Kol Dayaması",
        "Yol Bilgisayarı"
      ]
    },
    {
      baslik: "Dış Donanım",
      secenekler: [
        "Akıllı Bagaj Kapağı",
        "Aynalar (Elektrikli)",
        "Aynalar (Hafızalı)",
        "Aynalar (Isıtmalı)",
        "Far (Adaptif)",
        "Panoramik Cam Tavan",
        "Park Asistanı",
        "Park Sensörü (Arka)",
        "Park Sensörü (Ön)",
        "Römork Çeki Demiri",
        "Sunroof"
      ],
      var: ["Aynalar (Elektrikli)", "Aynalar (Isıtmalı)", "Park Sensörü (Arka)", "Park Sensörü (Ön)", "Sunroof"]
    },
    {
      baslik: "Multimedya",
      secenekler: ["Android Auto", "Apple CarPlay", "Bluetooth", "USB / AUX"],
      var: ["Android Auto", "Apple CarPlay", "Bluetooth", "USB / AUX"]
    }
  ],

  // Paketin katalog değerleri — araca özel ölçüm değil.
  teknik: [
    ["Motor", "1.5 VTEC Turbo, 4 silindir, benzinli"],
    ["Motor hacmi", "1498 cc"],
    ["Maksimum güç", "182 hp"],
    ["Maksimum tork", "220 Nm"],
    ["Şanzıman", "CVT otomatik"],
    ["Çekiş", "Önden çekiş"],
    ["0–100 km/s", "8,2 sn"],
    ["Azami hız", "200 km/s"],
    ["Uzunluk / genişlik / yükseklik", "4658 / 1799 / 1407 mm"],
    ["Boş ağırlık", "1388 kg"],
    ["Bagaj hacmi", "519 lt"],
    ["Lastik ölçüsü", "215/50 R17"]
  ],

  // Aynı açıdan tekrar eden kareler çıkarıldı; her fotoğraf farklı bir yönü gösteriyor.
  fotograflar: [
    { id: 6176, alt: "Kozmik mavi 2020 Honda Civic Sedan, sol ön çaprazdan" },
    { id: 6174, dikey: true, alt: "Sol yandan ve önden" },
    { id: 6173, dikey: true, alt: "Tam önden; tavanda sunroof" },
    { id: 5253, alt: "Sağ ön çaprazdan", tarih: "Nisan 2021" },
    { id: 5318, alt: "Sol arka çaprazdan, yandan görünüş", tarih: "Nisan 2021" },
    { id: 5282, alt: "Tam arkadan", tarih: "Nisan 2021" },
    { id: 6164, alt: "Gösterge paneli: 65.203 km; ACC ve LKAS göstergeleri yanıyor" }
  ]
};
