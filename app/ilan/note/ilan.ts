/**
 * mgumrah.com/ilan/note — satılık Nissan Note'un bütün bilgisi burada; sayfa
 * yalnızca bunu çizer (../ilan-sayfasi.tsx). Biçim ve kurallar ./civic/ilan.ts
 * ile aynı.
 *
 * Bilgilerin hepsi sahibinden ilanının mobil uygulamadaki ekran görüntülerinden
 * (4 ekran, 2026-11-04) alındı; uydurma bilgi yok. Ekran görüntülerinde olmayan
 * şey burada da yok: bakım belgeleri ve tramer tutarı bilinmiyor. Satıcı adı ve
 * telefon ekran görüntüsünde yoktu; kullanıcı sohbette yazdı.
 *
 * Bekleyenler:
 *  - fotograflar: [] iken sayfada "Fotoğraflar eklenecek" yazar. Fotoğraflar
 *    public/images/note/<id>-{lg,md,sm}.jpg (+ paylaşım kartı için og.jpg) olarak
 *    eklenip buraya yazılınca galeri kendiliğinden çıkar.
 *  - belgeler: boş iken "Servis Bakım Geçmişi" bölümü hiç çizilmez.
 */

import type { Ilan } from "../tipler";

export const ilan: Ilan = {
  slug: "note",
  baslik: "Sahibinden 2007 Nissan Note 1.4 Tekna",
  yol: ["Vasıta", "Otomobil", "Nissan", "Note", "1.4", "Tekna"],
  fiyat: 395000,
  // Sahibinden'deki ilan tarihi (17.12.2024).
  ilanTarihi: "2024-12-17",
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
    km: 220000,
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

  // Her biri ilanda yazıyor: açıklamadaki düzenli bakım ve yenilenen iç döşeme,
  // bilgi tablosundaki "Ağır hasar kayıtlı: Hayır".
  rozetler: ["Düzenli bakımlı", "Ağır hasar kaydı yok", "İç döşemesi yenilenmiş"],
  oneCikanlar: ["LPG'li"],

  // İlan açıklaması, sahibinden'deki sözleriyle; yalnızca maddeler paragraf yapıldı.
  aciklama: [
    "Aracımız uzun zamandır bizdedir ve düzenli olarak bakımları yapılmıştır.",
    "Sol ön çamurluk ve kaput değişmiş olup, başka bir kazası ya da hasarı bulunmamaktadır.",
    "Az yakıt tüketimi ile bütçe dostudur ve sorunsuz şekilde kullanılmaktadır.",
    "İç döşemeleri yenilenmiştir, temiz ve bakımlı bir durumdadır.",
    "Model yükseltmek amacıyla satışa çıkarılmıştır. Gönül rahatlığıyla kullanabileceğiniz bir araç arıyorsanız doğru yerdesiniz."
  ],

  bakimNotu: "",
  belgeler: [],

  boyaDegisen: { motorKaputu: "degisen", solOnCamurluk: "degisen" },
  boyaNotu: null,
  // İlanda tramer tutarı yazmıyor: satır gizli.
  tramer: null,

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

  fotograflar: []
};
