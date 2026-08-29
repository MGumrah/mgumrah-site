/**
 * mgumrah.com/brief — the brief form handed to a client over WhatsApp.
 *
 * The questions live here rather than inside the form component so a future
 * brief can reuse the same renderer with a different list. Turkish only and
 * outside the /tr /en tree on purpose: this is a private link sent to one
 * person, not a page of the site.
 *
 * Every question carries quick-pick options wherever an option list is
 * honestly exhaustive. That is the whole point of the page — someone who has
 * to type 25 paragraphs answers none of them, someone who taps 25 chips
 * answers all of them in a few minutes.
 */

export type Question = {
  id: string;
  q: string;
  /** Shown under the question — why it is being asked, or an example. */
  hint?: string;
  /** `multi` allows several picks; `text` drops the chips and keeps the note box. */
  kind: "choice" | "multi" | "text";
  options?: readonly string[];
  /** Label for the free-text box, when the default "Not" is too vague. */
  noteLabel?: string;
  /** Free-text box gets more room where the answer is expected to be prose. */
  long?: boolean;
};

export type Section = {
  id: string;
  title: string;
  /** One line on what this block decides, so the questions don't read as a quiz. */
  blurb: string;
  questions: readonly Question[];
};

export const SECTIONS: readonly Section[] = [
  {
    id: "kapsam",
    title: "Kapsam",
    blurb: "Kimin, hangi cihazda kullanacağı; uygulamanın mobil mi yoksa web panel mi olacağını bu belirliyor.",
    questions: [
      {
        id: "kisi",
        q: "Uygulamayı kaç kişi kullanacak?",
        kind: "choice",
        options: ["1–5 kişi", "6–15 kişi", "16–50 kişi", "50+ kişi", "Bilmiyorum"]
      },
      {
        id: "roller",
        q: "Hangi roller olacak?",
        hint: "Birden fazla seçebilirsin.",
        kind: "multi",
        options: ["Personel", "Departman / ekip sorumlusu", "Patron / yönetici", "Muhasebe", "Bilmiyorum"]
      },
      {
        id: "magaza",
        q: "Kaç mağaza / pazaryeri hesabı var?",
        kind: "choice",
        options: ["Tek mağaza", "2–3 mağaza", "4 ve üzeri", "Bilmiyorum"],
        noteLabel: "Hangi pazaryerlerinde satış var?"
      },
      {
        id: "cihaz",
        q: "Personel gün içinde nerede çalışıyor?",
        hint: "Telefondan mı kullanacaklar, bilgisayardan mı — arayüzü buna göre kuruyoruz.",
        kind: "choice",
        options: ["Bilgisayar başında", "Depoda / sahada, telefonla", "İkisi karışık"]
      },
      {
        id: "urun",
        q: "Bu uygulama sadece kendi şirketiniz için mi?",
        hint: "Başka firmalara satılacaksa işin boyutu baştan değişir.",
        kind: "choice",
        options: ["Sadece kendimiz için", "İleride başka firmalara da satmak isteriz", "Henüz belli değil"]
      }
    ]
  },
  {
    id: "hedef",
    title: "Hedef mantığı",
    blurb: "Hedefin nasıl tanımlandığı, uygulamanın altındaki veri yapısını doğrudan belirliyor.",
    questions: [
      {
        id: "cins",
        q: "Hedefler neyin cinsinden konuluyor?",
        hint: "Birden fazla seçebilirsin.",
        kind: "multi",
        options: [
          "Ciro (TL)",
          "Sipariş adedi",
          "Yapılan iş adedi (örn. 20 ürün listelendi)",
          "Görev listesi (yapıldı / yapılmadı)",
          "Bilmiyorum"
        ]
      },
      {
        id: "kime",
        q: "Hedef kime atanıyor?",
        kind: "choice",
        options: ["Tek tek kişiye", "Takıma / departmana", "İkisi de olacak"]
      },
      {
        id: "devir",
        q: "Günlük hedef tutmazsa ne olmalı?",
        kind: "choice",
        options: ["Eksik kalan ertesi güne devreder", "Sıfırlanır, yeni gün temiz başlar", "Bilmiyorum"]
      },
      {
        id: "haftalik",
        q: "Haftalık ve aylık hedef, günlüklerin toplamı mı?",
        hint: "Toplam olması ile bağımsız hedef olması iki farklı uygulama demek — bu sorunun cevabı önemli.",
        kind: "choice",
        options: ["Günlüklerin toplamı", "Bağımsız, ayrı bir hedef", "Bilmiyorum"]
      },
      {
        id: "duzeltme",
        q: "Geçmiş güne dönüp düzeltme yapılabilecek mi?",
        kind: "choice",
        options: ["Hayır, kimse değiştiremesin", "Sadece patron değiştirebilsin", "Personel de kendi kaydını düzeltebilsin"]
      }
    ]
  },
  {
    id: "tik",
    title: "Tik ve doğrulama",
    blurb: "Tik atmak 10 saniyeden uzun sürerse iki hafta sonra kimse kullanmıyor. Ne kadar ağır olacağına burada karar veriyoruz.",
    questions: [
      {
        id: "onay",
        q: "Tiki kim atıyor?",
        kind: "choice",
        options: [
          "Personel kendi atar, onay gerekmez",
          "Personel atar, sorumlu onaylar",
          "Sadece sorumlu / patron atar"
        ]
      },
      {
        id: "kanit",
        q: "Tik atarken kanıt istenecek mi?",
        hint: "Birden fazla seçebilirsin.",
        kind: "multi",
        options: ["Hayır, sadece tik yeter", "Kısa bir not", "Fotoğraf / ekran görüntüsü", "Link veya sipariş numarası"]
      },
      {
        id: "log",
        q: "\"Kim, ne zaman tikledi\" kaydı tutulsun mu?",
        hint: "Sonradan tartışma çıkarsa lazım oluyor.",
        kind: "choice",
        options: ["Evet, tutulsun", "Gerek yok"]
      }
    ]
  },
  {
    id: "patron",
    title: "Patron tarafı",
    blurb: "Patronun ne sıklıkta ve ne kadar detay görmek istediği, panelin tamamını şekillendiriyor.",
    questions: [
      {
        id: "gorunum",
        q: "Patron ilerlemeyi nasıl görmek istiyor?",
        hint: "Birden fazla seçebilirsin.",
        kind: "multi",
        options: ["Anlık ekran, istediği an bakar", "Gün sonu özeti", "Hafta sonu özeti", "Aylık rapor"]
      },
      {
        id: "bildirim",
        q: "Hedefin altında kalınca bildirim gitsin mi, kime?",
        hint: "Birden fazla seçebilirsin.",
        kind: "multi",
        options: ["Personelin kendisine", "Sorumluya", "Patrona", "Bildirim istemiyoruz"]
      },
      {
        id: "rapor",
        q: "Excel / PDF çıktısı gerekiyor mu?",
        kind: "choice",
        options: ["Evet, Excel", "Evet, PDF", "İkisi de", "Gerekmiyor"]
      }
    ]
  },
  {
    id: "api",
    title: "Pazaryeri entegrasyonu",
    blurb: "Bu kısım ikinci faz. Şimdiden cevaplarsan ilk fazı ona hazır kuruyoruz; emin değilsen boş bırak.",
    questions: [
      {
        id: "trendyol",
        q: "Trendyol satıcı hesabı sizde mi? API bilgilerini (Satıcı ID, API key/secret) alabilir miyiz?",
        kind: "choice",
        options: [
          "Evet, bizde — verebiliriz",
          "Bizde ama patronun izni gerekiyor",
          "Hesap başkasında / ajansta",
          "Bilmiyorum"
        ]
      },
      {
        id: "pazaryerleri",
        q: "Hangi pazaryerleri bağlanacak?",
        hint: "Birden fazla seçebilirsin. Nota öncelik sırasını yazabilirsin.",
        kind: "multi",
        options: [
          "Trendyol",
          "Hepsiburada",
          "N11",
          "Amazon",
          "Çiçeksepeti",
          "Kendi web sitemiz (Shopify / Ticimax / İdeasoft)"
        ],
        noteLabel: "Öncelik sırası / başka pazaryeri"
      },
      {
        id: "veri",
        q: "API'den ne çekilsin?",
        hint: "Birden fazla seçebilirsin.",
        kind: "multi",
        options: [
          "Sipariş adedi",
          "Ciro",
          "İade / iptal",
          "Stok",
          "Ürün ve listeleme sayısı",
          "Reklam harcaması",
          "Müşteri soruları"
        ]
      },
      {
        id: "iade",
        q: "İade ve iptaller hedeften düşülecek mi?",
        hint: "E-ticarette iade oranı yüksek; brüt ciroya göre hedef takibi yanıltıcı olabiliyor.",
        kind: "choice",
        options: ["Evet, net ciro üzerinden", "Hayır, brüt ciro yeterli", "Bilmiyorum"]
      },
      {
        id: "siklik",
        q: "Pazaryeri verisi ne sıklıkta güncellensin?",
        kind: "choice",
        options: ["Anlık", "Saatlik", "Gün sonunda bir kez", "Farketmez"]
      }
    ]
  },
  {
    id: "beklenti",
    title: "Beklenti ve mevcut durum",
    blurb: "Son blok. Özellikle son iki soru, işin nereden başlayacağını belirliyor.",
    questions: [
      {
        id: "zaman",
        q: "Ne zamana istiyorsunuz?",
        kind: "choice",
        options: ["2–3 hafta içinde", "1–2 ay içinde", "3 aydan uzun sürebilir", "Acelesi yok"]
      },
      {
        id: "butce",
        q: "Bir bütçe veya karşılık konuşuldu mu?",
        kind: "choice",
        options: ["Konuşulmadı", "Bir rakam düşünülüyor", "Aylık abonelik olabilir", "Ortaklık / pay konuşuldu"],
        noteLabel: "Varsa rakam veya şart"
      },
      {
        id: "mevcut",
        q: "Şu an bu takibi nasıl yapıyorsunuz?",
        hint: "Birden fazla seçebilirsin.",
        kind: "multi",
        options: ["Hiç takip etmiyoruz", "Excel / Google Sheets", "WhatsApp grubu", "Kağıt / defter", "Başka bir program"]
      },
      {
        id: "sikinti",
        q: "Mevcut yöntemin en can sıkıcı yanı ne?",
        hint: "Buradaki cevap hepsinden değerli — uygulamanın çözeceği asıl sorun bu.",
        kind: "text",
        long: true,
        noteLabel: "Serbestçe yaz"
      },
      {
        id: "ek",
        q: "Eklemek istediğin başka bir şey var mı?",
        kind: "text",
        long: true,
        noteLabel: "Aklında kalan her şey"
      }
    ]
  }
];

export const QUESTION_COUNT = SECTIONS.reduce((total, section) => total + section.questions.length, 0);
