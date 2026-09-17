/**
 * mgumrah.com/soyagaci — soy ağacının bütün bilgisi burada; sayfa yalnızca
 * bunu çizer. Kişi eklenecek ya da düzeltilecekse dokunulacak tek dosya bu.
 *
 * ⚠ Bu depo GitHub'da herkese açık: buraya yazılan her şey, sayfada
 * görünmese bile orada okunur. O yüzden:
 * - T.C. kimlik no ve cilt / hane / birey sıra no hiçbir kişi için yazılmaz.
 * - Hayattaki kişi için yalnızca ad, soyad, cinsiyet ve aile bağları yazılır.
 *   Doğum ya da nüfus kaydı bilgisi yazılırsa derleme durur. Kişinin vefat
 *   ettiği `vefat` alanından anlaşılır; alan yoksa hayatta sayılır.
 *
 * Uydurma bilgi yok. Her satır ya e-Devlet'teki nüfus kaydından (Alt-Üst Soy
 * Bilgisi belgesi ya da soyağacı görseli) ya da aileden duyulandan gelir;
 * bilinmeyen alan boş bırakılır. Kayıtta doğum tarihi 1 Temmuz görünenlerin
 * yalnızca yılı yazılır: günü ve ayı bilinmeyen doğum o yılın 1 Temmuz'u
 * olarak kaydedilir, gerçek doğum günü değildir.
 *
 * Bağlar yalnızca `baba`, `anne` ve gerekirse `esler` ile kurulur: kardeşler
 * ortak anne-babadan, amca, kuzen, yenge gibi adlar da bunlardan çıkarılır.
 * Yanlış yazılan bir id, ağaca bağlanmayan bir kişi ya da kendi atası olan
 * biri derlemeyi durdurur; hata mesajı hangi satır olduğunu söyler.
 */

/** "1931", "1931-03" ya da "1931-03-12" — ne kadarı biliniyorsa. */
export type Tarih = string;

export type Olay = {
  tarih?: Tarih;
  /** İl, ilçe ya da köy; belgede nasıl yazıyorsa. */
  yer?: string;
};

export type Kisi = {
  /**
   * Küçük harf, rakam ve tire: "ahmet-1901". Bağlar bununla kurulur, sayfada
   * görünmez ama repoda okunur: hayattaki kişinin id'sine yıl yazılmaz.
   */
  id: string;
  ad: string;
  soyad?: string;
  /** Evlilikten önceki soyadı, değiştiyse. */
  oncekiSoyad?: string;
  /** Bilinmiyorsa yazılmaz. "Amcam / halam", "yengem / eniştem" gibi adlar buna bakar. */
  cinsiyet?: "erkek" | "kadin";
  /** Babasının id'si; babası listede varsa. */
  baba?: string;
  anne?: string;
  /**
   * Babası listede yoksa yalnızca adı. e-Devlet belgesinde en üstteki
   * kişilerin bile "baba adı" sütunu dolu; ağaçta kesik çizgili kart olur.
   */
  babaAdi?: string;
  anneAdi?: string;
  /**
   * Eşler, evlilik sırasıyla. Ortak çocuğu listede olan eşi yazmaya gerek yok,
   * çocuktan anlaşılır; çocuğu olmayan eş ya da sıranın önemli olduğu ikinci
   * evlilik için yazılır.
   */
  esler?: string[];
  /** Yalnızca vefat edenlerde. */
  dogum?: Olay;
  /** Vefat ettiyse; tarihi ve yeri bilinmiyorsa `{}`. */
  vefat?: Olay;
  /** Nüfusa kayıtlı olduğu yer: belgedeki "il-ilçe-mahalle/köy". Yalnızca vefat edenlerde. */
  kutuk?: string;
  /** Kişiye tıklanınca açılan panelde görünen bir iki cümle. */
  not?: string;
};

type Aile = {
  baslik: string;
  /** Ağacın kimin gözünden çizildiği: "babam", "dedem" bu kişiye göre. */
  kok: string;
  /** Sayfanın altındaki kaynak cümlesi; veri nereden geldiyse. */
  kaynak: string | null;
  /** Kardeşler doğum sırasıyla yazılır, sayfa onları bu sırayla dizer. Başka sıra önemli değil. */
  kisiler: Kisi[];
};

export const aile: Aile = {
  baslik: "Gümrah ailesi",
  kok: "mehmet",
  kaynak: "Kaynak: e-Devlet, Alt-Üst Soy Bilgisi kaydı.",
  kisiler: [
    // Hayatta olanlar: yalnızca ad ve bağlar.
    { id: "mehmet", ad: "Mehmet", soyad: "Gümrah", cinsiyet: "erkek", baba: "muhammet", anne: "sevcan" },
    { id: "arya", ad: "Arya", soyad: "Gümrah", cinsiyet: "kadin", baba: "mehmet", anneAdi: "Merve" },
    { id: "muhammet", ad: "Muhammet", soyad: "Gümrah", cinsiyet: "erkek", baba: "mehmet-1933", anne: "fatma" },
    { id: "sevcan", ad: "Sevcan", soyad: "Gümrah", cinsiyet: "kadin", baba: "necati", anne: "nezahat" },
    { id: "nezahat", ad: "Nezahat", soyad: "Perdecioğlu", cinsiyet: "kadin", baba: "huseyin", anne: "ulfet" },

    // Baba tarafı
    {
      id: "mehmet-1933",
      ad: "Mehmet",
      soyad: "Gümrah",
      cinsiyet: "erkek",
      baba: "ismail",
      anne: "ikbal",
      dogum: { tarih: "1933-01-01", yer: "Denizli" },
      vefat: { tarih: "2012-07-26" },
      kutuk: "Denizli / Merkezefendi / Gümüşçay Mahallesi"
    },
    {
      id: "fatma",
      ad: "Fatma",
      soyad: "Gümrah",
      cinsiyet: "kadin",
      baba: "mehmet-1907",
      anne: "ayse",
      dogum: { tarih: "1941-11-04", yer: "Çal" },
      vefat: { tarih: "2023-02-21" },
      kutuk: "Denizli / Merkezefendi / Gümüşçay Mahallesi"
    },
    // "Emir Ayşe" üç kaydın ana adında geçiyor (İsmail, Hayriye, Ülfet). Yalnızca
    // Ülfet'inki listedeki Emir Ayşe Can; ötekilerin aynı kişi olduğuna dair kayıt yok.
    {
      id: "ismail",
      ad: "İsmail",
      soyad: "Gümrah",
      cinsiyet: "erkek",
      baba: "mehmet-emin",
      anneAdi: "Emir Ayşe",
      dogum: { tarih: "1898", yer: "Denizli" },
      vefat: { tarih: "1959-02-25" },
      kutuk: "Denizli / Merkezefendi / Gümüşçay Mahallesi"
    },
    {
      id: "ikbal",
      ad: "İkbal",
      soyad: "Gümrah",
      cinsiyet: "kadin",
      babaAdi: "Mehmet",
      anne: "ummu",
      dogum: { tarih: "1909", yer: "Denizli" },
      vefat: { tarih: "1991-11-20" },
      kutuk: "Denizli / Merkezefendi / Gümüşçay Mahallesi"
    },
    {
      id: "mehmet-1907",
      ad: "Mehmet",
      soyad: "Koç",
      cinsiyet: "erkek",
      babaAdi: "Mehmet Ali",
      anneAdi: "Ayşe",
      dogum: { tarih: "1907", yer: "Çal" },
      vefat: { tarih: "1985-02-26" },
      kutuk: "Denizli / Merkezefendi / İlbade Mahallesi"
    },
    {
      id: "ayse",
      ad: "Ayşe",
      soyad: "Koç",
      cinsiyet: "kadin",
      babaAdi: "İbrahim",
      anneAdi: "Habibe",
      dogum: { tarih: "1909", yer: "Çal" },
      vefat: { tarih: "1990-01-04" },
      kutuk: "Denizli / Merkezefendi / İlbade Mahallesi"
    },
    // Kayıtta soyadı yok: Soyadı Kanunu'ndan (1934) önce vefat etmiş.
    {
      id: "mehmet-emin",
      ad: "Mehmet Emin",
      cinsiyet: "erkek",
      babaAdi: "Mehmet Çavuş",
      anneAdi: "Esma",
      dogum: { tarih: "1860", yer: "Denizli" },
      vefat: { tarih: "1930-11-28" },
      kutuk: "Denizli / Merkezefendi / Gümüşçay Mahallesi"
    },
    {
      id: "ummu",
      ad: "Ümmü",
      soyad: "Gümrah",
      cinsiyet: "kadin",
      babaAdi: "Abdullah",
      anneAdi: "Fatma",
      dogum: { tarih: "1892", yer: "Denizli" },
      vefat: { tarih: "1985-04-28" },
      kutuk: "Denizli / Merkezefendi / Gümüşçay Mahallesi"
    },

    // Anne tarafı
    {
      id: "necati",
      ad: "Necati",
      soyad: "Perdecioğlu",
      cinsiyet: "erkek",
      baba: "mehmet-1904",
      anne: "hayriye",
      dogum: { tarih: "1937-03-13", yer: "Denizli" },
      vefat: { tarih: "2020-03-17" },
      kutuk: "Denizli / Pamukkale / 15 Mayıs Mahallesi"
    },
    {
      id: "mehmet-1904",
      ad: "Mehmet",
      soyad: "Perdecioğlu",
      cinsiyet: "erkek",
      babaAdi: "Mehmet Ali",
      anneAdi: "Hatice",
      dogum: { tarih: "1904", yer: "Denizli" },
      vefat: { tarih: "1954-02-15" },
      kutuk: "Denizli / Pamukkale / 15 Mayıs Mahallesi"
    },
    {
      id: "hayriye",
      ad: "Hayriye",
      soyad: "Perdecioğlu",
      cinsiyet: "kadin",
      babaAdi: "Mehmet Salih",
      anneAdi: "Emir Ayşe",
      dogum: { tarih: "1908", yer: "Denizli" },
      vefat: { tarih: "2006-11-14" },
      kutuk: "Denizli / Pamukkale / 15 Mayıs Mahallesi"
    },
    {
      id: "huseyin",
      ad: "Hüseyin",
      soyad: "Sarıhan",
      cinsiyet: "erkek",
      babaAdi: "Hasan",
      anneAdi: "Mahinur",
      dogum: { tarih: "1911", yer: "Denizli" },
      vefat: { tarih: "1986-11-29" },
      kutuk: "Denizli / Merkezefendi / Gümüşçay Mahallesi"
    },
    {
      id: "ulfet",
      ad: "Ülfet",
      soyad: "Can",
      cinsiyet: "kadin",
      babaAdi: "Süleyman",
      anne: "emir-ayse",
      dogum: { tarih: "1922", yer: "Denizli" },
      vefat: { tarih: "2004-10-31" },
      kutuk: "Denizli / Pamukkale / Fesleğen Mahallesi"
    },
    {
      id: "emir-ayse",
      ad: "Emir Ayşe",
      soyad: "Can",
      cinsiyet: "kadin",
      babaAdi: "Hacı Mustafa",
      anneAdi: "Hopan",
      dogum: { tarih: "1884", yer: "Denizli" },
      vefat: { tarih: "1973-07-17" },
      kutuk: "Denizli / Pamukkale / Fesleğen Mahallesi"
    }
  ]
};
