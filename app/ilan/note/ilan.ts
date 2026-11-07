/**
 * mgumrah.com/ilan/note — satılık Nissan Note'un bütün bilgisi burada; sayfa
 * yalnızca bunu çizer (../ilan-sayfasi.tsx). Biçim ve kurallar ./civic/ilan.ts
 * ile aynı.
 *
 * Bilgi tablosu, donanım ve teknik özellikler sahibinden ilanının mobil
 * uygulamadaki ekran görüntülerinden (4 ekran, 2026-11-04) alındı. Başlık,
 * açıklama, kilometre, değişen parçalar ve tramer ise satıcının 2026-11-05'te
 * verdiği güncel metinden; eski ilan metni (iç döşeme yenilenmiş, tek kaza vb.)
 * onunla değiştirildi. Satıcı adı ve telefon sohbette yazıldı. Uydurma bilgi yok.
 * Fotoğraflar satıcının WhatsApp'tan gönderdiği zip'ten (16 kare, 4'ü tekrar).
 *
 * Bekleyenler:
 *  - belgeler: boş iken "Servis Bakım Geçmişi" bölümü hiç çizilmez; bakım
 *    belgeleri gelirse buraya eklenir.
 */

import type { Ilan } from "../tipler";

export const ilan: Ilan = {
  slug: "note",
  baslik: "2007 Nissan Note 1.4 Manuel – Bakımlı ve Masrafsız",
  yol: ["Vasıta", "Otomobil", "Nissan", "Note", "1.4", "Tekna"],
  fiyat: 395000,
  // Yeni metin ve fotoğraflarla yayınlandığı gün (2026-11-07, kullanıcı isteği);
  // sahibinden'deki eski tarih 17.12.2024 idi.
  ilanTarihi: "2026-11-07",
  konum: { il: "Denizli", ilce: "Merkezefendi" },
  // Kullanıcının yazdığı gibi (2026-11-04): Mahmut Sevinç, +90 551 127 34 73.
  satici: {
    ad: "Mahmut Sevinç",
    telefon: "905511273473"
  },

  arac: {
    marka: "Nissan",
    seri: "Note",
    model: "1.4 Tekna",
    yil: 2007,
    yakit: "Benzin (LPG)",
    vites: "Manuel",
    durum: "İkinci El",
    km: 235000,
    kasa: "Hatchback 5 kapı",
    motorGucu: "88 hp",
    motorHacmi: "1386 cc",
    cekis: "Önden Çekiş",
    renk: "Siyah",
    ruhsatRengi: null,
    servisGarantisi: "Hayır",
    agirHasarKayitli: "Hayır",
    plaka: "Türkiye (TR) Plakalı",
    kimden: "Sahibinden",
    takas: "Hayır"
  },

  // Her biri satıcının açıklamasında yazıyor. Eski metindeki "ağır hasar kaydı yok"
  // ve "iç döşemesi yenilenmiş" rozetleri, yeni metin onları yazmadığı ve tramer
  // kaydı bulunduğu için kaldırıldı ("Ağır hasar kayıtlı: Hayır" bilgi tablosunda duruyor).
  rozetler: ["Yıllık bakımları yapıldı", "Ağır bakımı yapıldı", "Motor ve yürüyen aksam sorunsuz"],
  oneCikanlar: ["LPG'li"],

  // Satıcının güncel ilan metni (2026-11-05); yazım düzeltildi (tremer → tramer,
  // treger → triger, kusur → küsur), "70 bin" TL olarak okundu, her satır bir paragraf.
  // "2026 sonunda" satıcının yazdığı gibi bırakıldı.
  aciklama: [
    "2007 model Nissan Note Tekna manuel vites aracım satılıktır. 235.000 km'dedir. Renk siyah.",
    "Kaput, sol ön çamurluk ve sağ arka kapı değişendir. Parça parça yaklaşık 70 bin TL tramer kaydı vardır; son 2 kazası güncel, biri 40 bin küsur, biri 30 bin küsur TL. 2026'da sağ kapıya sürttüler, 30 bin küsur TL'lik tramer o kayıttan.",
    "Motor ve yürüyen aksamında herhangi bir sorun bulunmamaktadır. Yıllık bakımları yapıldı; 2026 sonunda ağır bakımı yapıldı, alt takımlar ve motor aksamı bakımdan geçti, triger seti vb. değişti.",
    "Bakımları zamanında, yıllık olarak yapılmıştır.",
    "Aile aracı olarak kullanılmış olup oldukça geniş ve kullanışlıdır.",
    "Klima, elektrikli camlar ve tüm donanımları aktif şekilde çalışmaktadır.",
    "Aracım yaşına ve kilometresine göre temiz ve diri durumdadır. Ciddi alıcılar arayabilir. Pazarlık araç başında değerlendirilecektir."
  ],

  bakimNotu: "",
  belgeler: [],

  boyaDegisen: { motorKaputu: "degisen", solOnCamurluk: "degisen", sagArkaKapi: "degisen" },
  boyaNotu:
    "Tramer parça parça toplam yaklaşık 70 bin TL. Son iki kaza güncel: 40 bin küsur ve 30 bin küsur TL; ikincisi 2026'da sağ kapıya sürtülmesinden.",
  // Satıcı "yaklaşık 70 bin" dedi; yuvarlak değer, "yaklaşık" boyaNotu'nda yazıyor.
  tramer: 70000,

  // Mobil uygulamada yalnızca işaretli seçenekler listeleniyor; işaretsizlerin
  // tam listesi bilinmediği için burada da yalnızca işaretliler var.
  donanim: [
    {
      baslik: "Güvenlik",
      secenekler: ["ABS", "BAS", "Hava Yastığı (Sürücü)", "Hava Yastığı (Yolcu)", "Isofix", "Merkezi Kilit"],
      var: ["ABS", "BAS", "Hava Yastığı (Sürücü)", "Hava Yastığı (Yolcu)", "Isofix", "Merkezi Kilit"]
    },
    {
      baslik: "İç Donanım",
      secenekler: [
        "Elektrikli Camlar",
        "Hidrolik Direksiyon",
        "Klima",
        "Kumaş Koltuk",
        "Ön Koltuk Kol Dayaması",
        "Soğutmalı Torpido",
        "Yol Bilgisayarı"
      ],
      var: [
        "Elektrikli Camlar",
        "Hidrolik Direksiyon",
        "Klima",
        "Kumaş Koltuk",
        "Ön Koltuk Kol Dayaması",
        "Soğutmalı Torpido",
        "Yol Bilgisayarı"
      ]
    },
    {
      baslik: "Dış Donanım",
      secenekler: ["Aynalar (Elektrikli)", "Aynalar (Isıtmalı)"],
      var: ["Aynalar (Elektrikli)", "Aynalar (Isıtmalı)"]
    },
    {
      baslik: "Multimedya",
      secenekler: ["USB / AUX"],
      var: ["USB / AUX"]
    }
  ],

  // Sahibinden'in "Teknik Özellikler" bölümünden; "Tüm Teknik Özellikleri Göster"
  // altındakiler görülmedi, o yüzden eklenmedi.
  teknik: [
    ["Motor hacmi", "1386 cc"],
    ["Maksimum güç", "88 hp (65 kW) / 5.200 rpm"],
    ["Yakıt", "Benzin (LPG)"],
    ["Şanzıman", "Manuel"],
    ["Çekiş", "Önden çekiş"],
    ["0–100 km/s", "13,4 sn"],
    ["Azami hız", "165 km/s"],
    ["Yakıt tüketimi", "7,2 lt / 5,2 lt"]
  ],
  teknikNotu: "Sahibinden ilanındaki teknik özellikler bölümünden alınan model değerleridir; araca özel ölçüm değildir.",

  // Satıcının 2026-11-04'te çektiği kareler; aynı kareden iki kopya gelenlerin biri
  // alındı. Yataylar 3:2 (galeri içine sığdırır), 11 ve 12 dikey 3:4.
  fotograflar: [
    { id: 1, alt: "Siyah 2007 Nissan Note, önden çaprazdan" },
    { id: 2, alt: "Önden, tam karşıdan" },
    { id: 3, alt: "Önden, yakın çekim" },
    { id: 4, alt: "Önden çaprazdan, güneş ışığında" },
    { id: 5, alt: "Yandan" },
    { id: 6, alt: "Arkadan çaprazdan" },
    { id: 7, alt: "Bagaj kapağı açık, bagaj bölümü" },
    { id: 8, alt: "Ön kapı açık, ön koltuklar ve gösterge paneli" },
    { id: 9, alt: "Arka kapı açık, arka koltuk" },
    { id: 10, alt: "Arka koltuktan ön koltuklar, ön cam ve gösterge paneli" },
    { id: 11, dikey: true, alt: "Akaryakıt istasyonunda, önden çaprazdan" },
    { id: 12, dikey: true, alt: "Akaryakıt istasyonunda, önden" }
  ]
};
