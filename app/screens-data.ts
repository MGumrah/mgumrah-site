/**
 * Screen-by-screen tours of the three business apps. Pure data: apps-content
 * stays untouched and screens-content.tsx renders whatever is listed here.
 *
 * Images live in /public/images/screens/<slug>/<name>.webp. They are portrait
 * captures from the Android debug builds, status and navigation bars cropped
 * off, with customer names, amounts and other real values blurred before they
 * were committed (the emulator talks to live data). A new capture must be
 * blurred the same way — never drop a raw screenshot in here.
 *
 * Captions are deliberately one or two short sentences: what the screen is
 * for, not how every button works.
 */

export type Localized = { tr: string; en: string };

export type TourItem = {
  id: string;
  title: Localized;
  text: Localized;
  /** Image names without folder or extension; omitted for text-only entries. */
  images?: string[];
  /** Small label on the card, e.g. who gets to see the screen. */
  tag?: Localized;
};

export type TourGroup = {
  id: string;
  title: Localized;
  intro?: Localized;
  /** "list" renders compact text rows instead of screenshot cards. */
  layout?: "cards" | "list";
  items: TourItem[];
};

export type TourApp = {
  slug: "teknosales" | "teknoportal" | "gumrahsaha";
  name: Localized;
  icon: string;
  iconSize: number;
  intro: Localized;
  /** Shown under the intro: where the captures come from and what was blurred. */
  note: Localized;
  groups: TourGroup[];
};

const l = (tr: string, en: string): Localized => ({ tr, en });

const dev = l("Geliştirici hesabı", "Developer account");

export const teknoSalesTour: TourApp = {
  slug: "teknosales",
  name: l("Tekno Satış", "Tekno Sales"),
  icon: "/images/teknosales-icon.png",
  iconSize: 1024,
  intro: l(
    "Tekno Satış'ın menüsündeki her ekran, ne işe yaradığını anlatan kısa bir cümleyle. Menü dört sekmeden oluşur: Anasayfa, Araçlar, Raporlar ve Profil.",
    "Every screen in Tekno Sales' menu, with a short sentence on what it is for. The menu has four tabs: Home, Tools, Reports and Profile."
  ),
  note: l(
    "Görüntüler Android sürümünden alındı. Hangi kartların göründüğü kullanıcının rolüne göre değişir. Müşteri adı, tutar, telefon gibi gerçek veriler bulanıklaştırıldı.",
    "Captures are from the Android version. Which cards appear depends on the user's role. Real values such as customer names, amounts and phone numbers are blurred."
  ),
  groups: [
    {
      id: "anasayfa",
      title: l("Anasayfa", "Home"),
      items: [
        {
          id: "home",
          title: l("Ana sayfa", "Home screen"),
          text: l(
            "Girişten sonra ilk açılan ekran. Toplam cari, borç ve alacak özeti ile rolüne göre sıralanan işlem kartları.",
            "The first screen after sign-in: total accounts, debt and receivables, then the action cards your role allows."
          ),
          images: ["home", "home2"]
        },
        {
          id: "patron",
          title: l("Patron Ekranı", "Owner dashboard"),
          text: l(
            "Yönetici rollerinde ana sayfanın üstünde kasa, banka, çek-senet ve cari özeti görünür. Patron Ekranı kartı kredi ve cari ayrıntısına da açılır.",
            "For management roles the top of the home screen shows cash, bank, cheques and notes, and receivables. The Owner dashboard card opens credit and account detail too."
          ),
          images: ["patron"]
        }
      ]
    },
    {
      id: "islemler",
      title: l("İşlemler", "Operations"),
      intro: l("Ana sayfadaki işlem kartları, yukarıdan aşağıya.", "The action cards on the home screen, top to bottom."),
      items: [
        {
          id: "cariler",
          title: l("Cari Hesaplar", "Customer Accounts"),
          text: l(
            "Yetkindeki carilerin listesi, bakiyeleri ve hareketleri. Cari kartında ekstre, bakiye durumu ve iletişim bilgisi; ekstre PDF olarak alınır.",
            "The accounts you are authorised for, with balances and activity. An account shows its statement, balance and contact details; the statement exports as PDF."
          ),
          images: ["cariler", "caridetay"]
        },
        {
          id: "gr",
          title: l("GR Hesaplar", "GR Accounts"),
          text: l(
            "Tanımlı firma hesapları ve hareketleri, cari listesinden ayrı bir listede.",
            "Defined company accounts and their activity, in a list of their own."
          ),
          images: ["gr"]
        },
        {
          id: "fiyat",
          title: l("Fatura Fiyatlandır", "Invoice Pricing"),
          text: l(
            "Bekleyen faturalar fiyatlanır ve onaylanır. Bekleyen, Onaylandı ve Resmileşti sekmeleri; karttaki sayı fiyat bekleyen fatura adedidir.",
            "Pending invoices are priced and approved. Tabs for Pending, Approved and Finalised; the badge on the card counts invoices waiting for a price."
          ),
          images: ["fiyat"]
        },
        {
          id: "stoklar",
          title: l("Stoklar", "Stock"),
          text: l(
            "Stok kartları, kodları ve eldeki miktarlar. İsim ya da kodla arama, filtre ve yeni stok açma.",
            "Stock items with codes and quantities on hand. Search by name or code, filter, and open a new stock item."
          ),
          images: ["stoklar"]
        },
        {
          id: "teklifler",
          title: l("Teklifler", "Quotes"),
          text: l(
            "Müşterilere hazırlanan teklifler; onaysız, onaylı ve kapalı filtreleri, adet ve toplam tutar. Yeni teklif hazırlanır, PDF olarak paylaşılır.",
            "Quotes prepared for customers, with unapproved, approved and closed filters plus count and total. New quotes are drafted and shared as PDF."
          ),
          images: ["teklifler"]
        },
        {
          id: "beksip",
          title: l("Bekleyen Siparişler", "Pending Orders"),
          text: l(
            "Sevk edilmeyi bekleyen ürünler, teslim durumu ve satır sayısıyla. Yeni gelen siparişler karttaki sayaçla duyurulur.",
            "Products waiting to ship, with delivery status and line count. New orders are announced by the counter on the card."
          ),
          images: ["beksip"]
        },
        {
          id: "bekirs",
          title: l("İrsaliyeler", "Waybills"),
          text: l(
            "Faturaya dönüşmemiş satış ve iade irsaliyeleri iki sekmede. Yeni irsaliye bu ekrandan kesilir.",
            "Waybills not yet invoiced, with sales and returns on two tabs. New waybills are issued from here."
          ),
          images: ["bekirs"]
        },
        {
          id: "gelenfat",
          title: l("Gelen Faturalar", "Incoming Invoices"),
          text: l(
            "GİB gelen kutusundan gelen, henüz işlenmemiş e-fatura ve e-irsaliyeler.",
            "E-invoices and e-waybills from the GİB inbox that have not been processed yet."
          ),
          images: ["gelenfat"]
        },
        {
          id: "cekse",
          title: l("Çek-Senet Hareketleri", "Cheque & Note Movements"),
          text: l(
            "Kasadaki ve verilen çek ve senetler; adet, toplam tutar ve ortalama vade. Seçilenlerin toplamı alınır, liste PDF olur.",
            "Cheques and notes held and given, with count, total and average due date. Select some to total them; the list exports as PDF."
          ),
          images: ["cekse"]
        },
        {
          id: "pos",
          title: l("Sanal Pos", "Virtual POS"),
          text: l(
            "Kredi kartıyla tahsilat: cari ve tutar seçilir, ödeme bankanın 3D Secure ekranında doğrulanır. Geçilen Kartlar sekmesi geçmişi gösterir.",
            "Collect by card: pick the account and amount, and the bank's 3D Secure screen confirms the payment. The Cards Charged tab shows the history."
          ),
          images: ["pos"]
        },
        {
          id: "makbuz",
          title: l("Tahsilat Makbuzu Kes", "Issue Collection Receipt"),
          text: l(
            "Nakit, çek ve senet makbuzu kesilir. Teslim Takibi sekmesi kesilen makbuzların teslimini izler.",
            "Issue cash, cheque and note receipts. The Handover tab follows what happens to the receipts you issued."
          ),
          images: ["makbuz"]
        },
        {
          id: "mesajlar",
          title: l("Mesajlar", "Messages"),
          text: l(
            "İş arkadaşlarıyla birebir, grup ve duyuru mesajları.",
            "One-to-one, group and announcement messages with colleagues."
          ),
          images: ["mesajlar"]
        },
        {
          id: "nabiz",
          title: l("Sistem Nabzı", "System Pulse"),
          text: l(
            "Online kullanıcılar, sürüm dağılımı ve API trafik özeti.",
            "Online users, version spread and an API traffic summary."
          ),
          tag: dev
        },
        {
          id: "siparis-log",
          title: l("Sipariş Aksiyon Log", "Order Action Log"),
          text: l(
            "Kim hangi siparişi kapattı, geri çevirdi ya da geri açtı kaydı.",
            "A record of who closed, reverted or reopened which order."
          ),
          tag: dev
        }
      ]
    },
    {
      id: "araclar",
      title: l("Araçlar", "Tools"),
      items: [
        {
          id: "araclar-sekmesi",
          title: l("Araçlar sekmesi", "Tools tab"),
          text: l(
            "Katalog, müşteri hesabı, kart tahsilat, prim, kasa ve hesaplama araçları tek listede.",
            "Catalogs, customer accounts, card collections, commission, cash book and calculators in one list."
          ),
          images: ["araclar", "araclar2"]
        },
        {
          id: "katalog",
          title: l("Kataloglar", "Catalogs"),
          text: l(
            "Firma ve fabrika ürün katalogları. İndirilir, telefonda açılır ve paylaşılır.",
            "Company and manufacturer product catalogs. Download, open on the phone and share."
          ),
          images: ["katalog"]
        },
        {
          id: "portal",
          title: l("Tekno Portal", "Tekno Portal accounts"),
          text: l(
            "Müşteri için Tekno Portal kullanıcı adı ve şifresi belirlenir. Şifre yalnız bir kez gösterilir; açılan hesaplar ikinci sekmede.",
            "Sets the username and password a customer uses in Tekno Portal. The password is shown only once; opened accounts are on the second tab."
          ),
          images: ["a-portal"]
        },
        {
          id: "karttah",
          title: l("Kart Tahsilat", "Card Collections"),
          text: l(
            "Kartla yapılan tahsilatlar: günlük, aylık ve yıllık net yatacak tutar, banka bazında komisyon ve ertesi gün bankaya yatış.",
            "Card collections by day, month and year: net amount due, commission per bank, and the next-day bank deposit."
          ),
          images: ["a-karttah"]
        },
        {
          id: "prim",
          title: l("Prim Hesaplama", "Commission"),
          text: l(
            "Aylık plasiyer prim hak edişi: toplam prim, ürün ve tahsilat kırılımı, plasiyer bazında matrah.",
            "Monthly sales-rep commission: the total, its product and collection parts, and the base per rep."
          ),
          images: ["a-prim"]
        },
        {
          id: "kasa",
          title: l("Kasa Defteri", "Cash Book"),
          text: l(
            "Şirket kasasının hareketleri, personel carisi ve sayım. Yeni hareket buradan girilir, Excel çıktısı alınır.",
            "The company cash book: movements, staff accounts and cash counts. Add entries here and export to Excel."
          ),
          images: ["a-kasa"]
        },
        {
          id: "bildirim",
          title: l("Bildirim Gönder", "Send Notification"),
          text: l(
            "Seçilen kitleye elle push bildirimi gönderilir: başlık, mesaj ve hedef (hepsi, Tekno Satış ya da Tekno Portal).",
            "Sends a push notification to a chosen audience: title, message and target (everyone, Tekno Sales or Tekno Portal)."
          ),
          images: ["a-bildirim"],
          tag: dev
        },
        {
          id: "valor",
          title: l("Valörmatik", "Value-date Calculator"),
          text: l(
            "Tarih ve tutarları girerek ağırlıklı ortalama vadeyi hesaplar.",
            "Enter dates and amounts to get the weighted average due date."
          ),
          images: ["valor"]
        },
        {
          id: "iskonto",
          title: l("İskonto Hesaplama", "Discount Calculator"),
          text: l(
            "Liste fiyatı, iskonto ve vergiden vergi dahil tutarı bulur; kâr oranı klasik ya da marj olarak hesaplanır.",
            "Works out the tax-inclusive price from list price, discount and tax; profit is calculated as markup or as margin."
          ),
          images: ["iskonto"]
        },
        {
          id: "geribildirim",
          title: l("Geri Bildirimler", "Feedback"),
          text: l(
            "Kullanıcıların öneri, şikâyet ve hata talepleri; yönetici cevaplar ve çözüldü olarak işaretler.",
            "Suggestions, complaints and bug reports from users; managers reply and mark them resolved."
          ),
          images: ["a-geribildirim"]
        }
      ]
    },
    {
      id: "raporlar",
      title: l("Raporlar", "Reports"),
      items: [
        {
          id: "raporlar-sekmesi",
          title: l("Raporlar sekmesi", "Reports tab"),
          text: l(
            "Satış, tahsilat, kâr ve cari raporlarının hepsi bu listeden açılır.",
            "Sales, collection, profit and account reports all open from this list."
          ),
          images: ["raporlar", "raporlar2"]
        },
        {
          id: "tahsrap",
          title: l("Tahsilat Raporu", "Collection Report"),
          text: l(
            "Plasiyer bazında tahsilat ve net satış: nakit, kart, çek ve senet dağılımı, günlük ve aylık.",
            "Collections and net sales per sales rep: cash, card, cheque and note split, daily and monthly."
          ),
          images: ["tahsrap"]
        },
        {
          id: "arac",
          title: l("Araç Sevk Raporu", "Vehicle Dispatch Report"),
          text: l(
            "Kamyon plakasına göre günlük, aylık ve yıllık sevk tutarları; irsaliye ve satır sayısı, kâr.",
            "Dispatch totals by truck plate, daily, monthly and yearly, with waybill and line counts and profit."
          ),
          images: ["arac"]
        },
        {
          id: "karzarar",
          title: l("Kar / Zarar Raporu", "Profit / Loss Report"),
          text: l(
            "Yıl için net satış, maliyet ve net kâr; her ayın satış, maliyet ve kâr oranı.",
            "Net sales, cost and net profit for the year, with sales, cost and profit rate for every month."
          ),
          images: ["karzarar"]
        },
        {
          id: "analiz",
          title: l("Satış Analizi", "Sales Analysis"),
          text: l(
            "Plasiyer, müşteri ya da ürün bazında filtreli satış: net satış, iade, belge sayısı ve kâr. Dönem seçilir, sıralama değişir.",
            "Sales by rep, customer or product: net sales, returns, document count and profit. Pick a period and change the sort."
          ),
          images: ["analiz"]
        },
        {
          id: "carirap",
          title: l("Cari Raporlar", "Account Reports"),
          text: l(
            "Plasiyer bazlı cari bakiye ve GR raporu, A4 PDF ya da Excel olarak.",
            "Account balance and GR report per sales rep, as A4 PDF or Excel."
          ),
          images: ["carirap"]
        },
        {
          id: "vade",
          title: l("Vade Ortalama", "Average Due Date"),
          text: l(
            "Cari bazında ortalama ödeme vadesi ve vade takvimi.",
            "Average payment term per account, with a due-date calendar."
          ),
          images: ["vade"]
        },
        {
          id: "mutab",
          title: l("Mütabakat Raporu", "Reconciliation Report"),
          text: l(
            "Plasiyer ve cari bazında mutabakat mektubu, A4 PDF olarak.",
            "Reconciliation letters per sales rep and account, as A4 PDF."
          ),
          images: ["mutab"]
        },
        {
          id: "fabrika",
          title: l("Fabrika Sipariş Önerisi", "Factory Order Suggestion"),
          text: l(
            "Aylık satış hızı, eldeki stok ve bekleyen siparişten ürün grubu bazında önerilen sipariş miktarı. Hedef 1-4 ay seçilir.",
            "Suggested order quantity per product group from monthly sales, stock on hand and open orders. Pick a 1-4 month target."
          ),
          images: ["fabrika"]
        },
        {
          id: "muadil",
          title: l("Muadil Ürün Yönetimi", "Equivalent Products"),
          text: l(
            "Farklı marka aynı ürünler gruplanır; sistem öneri üretir, onaylanır ya da elle eşleştirilir.",
            "Same product, different brand: items are grouped, the system suggests matches, and you confirm or pair them by hand."
          ),
          images: ["muadil"]
        }
      ]
    },
    {
      id: "profil",
      title: l("Profil", "Profile"),
      items: [
        {
          id: "profil-sekmesi",
          title: l("Profil sekmesi", "Profile tab"),
          text: l(
            "Kullanıcı adı ve rolü, firma bilgileri kısayolları ve oturumu kapatma.",
            "The user's name and role, shortcuts to company details, and sign-out."
          ),
          images: ["profil", "profil2"]
        },
        {
          id: "firmaf",
          title: l("Fatura Bilgileri", "Invoice Details"),
          text: l(
            "Faturada kullanılacak firma bilgileri: adres, vergi dairesi, vergi no, e-posta ve telefon. Tek dokunuşla paylaşılır.",
            "The company details used on invoices: address, tax office, tax number, email and phone. Shared in one tap."
          ),
          images: ["firmaf"]
        },
        {
          id: "firmai",
          title: l("IBAN Bilgileri", "IBAN Details"),
          text: l(
            "Firmaların banka hesap numaraları ve IBAN'ları; kopyalanır ya da paylaşılır.",
            "The companies' bank account numbers and IBANs, ready to copy or share."
          ),
          images: ["firmai"]
        },
        {
          id: "konum",
          title: l("Konum Paylaş", "Share Location"),
          text: l(
            "Showroom ve merkez ofis konumları; haritada açılır ya da müşteriye gönderilir.",
            "Showroom and head-office locations; open on the map or send to a customer."
          ),
          images: ["konum"]
        }
      ]
    }
  ]
};

export const teknoPortalTour: TourApp = {
  slug: "teknoportal",
  name: l("Tekno Portal", "Tekno Portal"),
  icon: "/images/teknoportal-icon.png",
  iconSize: 512,
  intro: l(
    "Tekno Portal'daki her ekran, ne işe yaradığını anlatan kısa bir cümleyle. Menü iki sekmeden oluşur: Ana Sayfa ve Profil.",
    "Every screen in Tekno Portal, with a short sentence on what it is for. The menu has two tabs: Home and Profile."
  ),
  note: l(
    "Görüntüler Android sürümünden alındı; iOS ve Windows aynı akışı izler, modül kapsamı platforma göre küçük farklar gösterebilir. Müşteri adı, tutar, vergi no gibi gerçek veriler bulanıklaştırıldı.",
    "Captures are from the Android version; iOS and Windows follow the same flow, though module coverage can differ slightly by platform. Real values such as customer names, amounts and tax numbers are blurred."
  ),
  groups: [
    {
      id: "anasayfa",
      title: l("Ana Sayfa", "Home"),
      items: [
        {
          id: "home",
          title: l("Ana sayfa", "Home screen"),
          text: l(
            "Müşterinin kendi firması: toplam alacak, son altı ayın değişim grafiği ve altında işlem kartları.",
            "The customer's own company: total receivable, a six-month change chart, and the action cards below."
          ),
          images: ["home", "home2"]
        }
      ]
    },
    {
      id: "hesap",
      title: l("Hesap ve ödemeler", "Account and payments"),
      items: [
        {
          id: "cari",
          title: l("Cari Hesaplarım", "My Accounts"),
          text: l(
            "Müşteriye bağlı cari hesaplar bakiyeleriyle listelenir; grup (GR) hesapları rozetle ayrılır.",
            "The accounts linked to the customer, with balances; group (GR) accounts carry a badge."
          ),
          images: ["cari"]
        },
        {
          id: "ekstre",
          title: l("Cari ekstre", "Account statement"),
          text: l(
            "Bir hesaba dokununca faturalar, iadeler ve tahsilatlar tarih sırasıyla, altında güncel bakiye. Arama, tablo görünümü ve PDF.",
            "Open an account for its invoices, returns and payments by date, with the current balance below. Search, table view and PDF."
          ),
          images: ["ekstre"]
        },
        {
          id: "fatura-kalem",
          title: l("Fatura kalemleri", "Invoice lines"),
          text: l(
            "Faturanın kalemleri, ara toplam, iskonto, KDV ve genel toplam; fatura PDF olarak açılır.",
            "The invoice's lines, subtotal, discount, VAT and grand total; the invoice opens as PDF."
          ),
          images: ["fatura-kalem"]
        },
        {
          id: "kart",
          title: l("Kart ile Ödeme", "Pay by Card"),
          text: l(
            "Borcu kredi kartıyla öde: tutar ve kart bilgisi girilir, ödeme bankanın 3D Secure sayfasında tamamlanır. Kart bilgisi cihazda saklanmaz.",
            "Pay a balance by card: enter the amount and card details, and the payment completes on the bank's 3D Secure page. Card details are never stored on the device."
          ),
          images: ["kart"]
        },
        {
          id: "makbuz",
          title: l("Makbuzlarım", "My Receipts"),
          text: l(
            "Yapılan ödemelerin makbuzları nakit, kart, çek ve senet sekmelerinde.",
            "Receipts for payments made, on cash, card, cheque and note tabs."
          ),
          images: ["makbuz"]
        }
      ]
    },
    {
      id: "siparis",
      title: l("Sipariş", "Orders"),
      items: [
        {
          id: "siparis",
          title: l("Sipariş Ver", "Place an Order"),
          text: l(
            "Kendi kataloğundan ürün arayıp sipariş oluşturulur. Fiyat ve cari kodu istemciden gönderilmez, sunucu belirler.",
            "Search your own catalog and build an order. Price and account code are never sent by the client; the server decides them."
          ),
          images: ["siparis"]
        },
        {
          id: "teklifler",
          title: l("Tekliflerim", "My Quotes"),
          text: l(
            "Adına düzenlenmiş teklifler; son üç ayın iptal edilmemiş kayıtları listelenir.",
            "Quotes issued in the customer's name; non-cancelled records from the last three months are listed."
          ),
          images: ["teklifler"]
        },
        {
          id: "bekleyen",
          title: l("Bekleyen Siparişlerim", "My Pending Orders"),
          text: l(
            "Teslim edilmeyi bekleyen kalemler: miktar, teslim edilen kısım ve açık tutar. Arama ve PDF çıktısı.",
            "Items waiting for delivery: quantity, delivered part and open amount. Search and PDF export."
          ),
          images: ["bekleyen"]
        },
        {
          id: "urun",
          title: l("Ürün Hareketlerim", "My Product Activity"),
          text: l(
            "Hangi ürünü ne zaman ve hangi fiyata aldığının dökümü; ürün bazında föy.",
            "Which product was bought, when and at what price, with a per-product ledger."
          ),
          images: ["urun"]
        }
      ]
    },
    {
      id: "araclar",
      title: l("Araçlar", "Tools"),
      items: [
        {
          id: "katalog",
          title: l("Katalog", "Catalog"),
          text: l(
            "Firma ve fabrika ürün katalogları; indirilir ve telefonda açılır.",
            "Company and manufacturer product catalogs; download and open on the phone."
          ),
          images: ["katalog"]
        },
        {
          id: "valor",
          title: l("Valörmatik", "Value-date Calculator"),
          text: l(
            "Tarih ve tutarları girerek ortalama vadeyi hesaplar.",
            "Enter dates and amounts to work out the average due date."
          ),
          images: ["valor"]
        },
        {
          id: "iskonto",
          title: l("İskonto Hesaplama", "Discount Calculator"),
          text: l(
            "Liste fiyatı, iskonto ve vergi oranından net tutarı ve kârı bulur.",
            "Works out the net amount and profit from list price, discount and tax rate."
          ),
          images: ["iskonto"]
        }
      ]
    },
    {
      id: "profil",
      title: l("Profil", "Profile"),
      items: [
        {
          id: "profil",
          title: l("Profil sekmesi", "Profile tab"),
          text: l(
            "Müşterinin hesabı, kendi bilgileri, Tekno A.Ş. bilgileri, destek ve oturumu kapatma.",
            "The customer's account, their own details, Tekno A.Ş. details, support and sign-out."
          ),
          images: ["profil", "profil2"]
        },
        {
          id: "b-fatura",
          title: l("Fatura Bilgilerim", "My Invoice Details"),
          text: l(
            "Müşteriye fatura kesilirken kullanılan bilgiler. Güncellenir, paylaşılır ya da görsel olarak gönderilir.",
            "The details used when invoicing the customer. Update, share, or send as an image."
          ),
          images: ["b-fatura"]
        },
        {
          id: "b-iban",
          title: l("IBAN Bilgilerim", "My IBANs"),
          text: l(
            "Müşteriye ödeme yapılırken kullanılan IBAN'lar; yalnız cihazda tutulur, sunucuya gönderilmez.",
            "The IBANs used when paying the customer. They stay on the device and are never sent to the server."
          ),
          images: ["b-iban"]
        },
        {
          id: "b-konum",
          title: l("Konumlarım", "My Locations"),
          text: l(
            "Sevkiyat yapılırken kullanılan mağaza, depo ve şantiye adresleri; yalnız cihazda tutulur.",
            "Shop, warehouse and site addresses used for deliveries; kept on the device only."
          ),
          images: ["b-konum"]
        },
        {
          id: "firma-fatura",
          title: l("Fatura Bilgilerimiz", "Our Invoice Details"),
          text: l(
            "Tekno'ya fatura keserken kullanılacak firma bilgileri.",
            "Tekno's company details, for invoicing Tekno."
          ),
          images: ["firma-fatura"]
        },
        {
          id: "firma-iban",
          title: l("IBAN Bilgilerimiz", "Our IBANs"),
          text: l(
            "Tekno'ya havale ya da EFT yaparken kullanılacak banka hesapları; kopyalanır ya da paylaşılır.",
            "Tekno's bank accounts for transfers; copy or share."
          ),
          images: ["firma-iban"]
        },
        {
          id: "konum",
          title: l("Konumlarımız", "Our Locations"),
          text: l(
            "Merkez ofis ve showroom'lar; haritada açılır ya da paylaşılır.",
            "The head office and showrooms; open on the map or share."
          ),
          images: ["konum"]
        },
        {
          id: "geribildirim",
          title: l("Geri Bildirim", "Feedback"),
          text: l(
            "Öneri, şikâyet ya da hata bildirilir; verilen cevaplar aynı konunun altında görünür.",
            "Send a suggestion, complaint or bug report; replies appear under the same thread."
          ),
          images: ["geribildirim", "gb-yeni"]
        }
      ]
    }
  ]
};

export const gumrahSahaTour: TourApp = {
  slug: "gumrahsaha",
  name: l("Gümrah Saha", "Gümrah Saha"),
  icon: "/images/gumrahsaha-icon.png",
  iconSize: 512,
  intro: l(
    "Gümrah Saha'nın ekranları, ne işe yaradıklarını anlatan kısa cümlelerle. Menü her işletmede farklıdır: işletmenin lisansı ve kullanıcının rolü hangi ekranların açılacağını belirler.",
    "Gümrah Saha's screens, with short sentences on what each is for. The menu differs at every business: the firm's licence and the user's role decide which screens open."
  ),
  note: l(
    "Görüntüler Android sürümünden alındı ve yalnız Patron ile Cari ekranlarının açık olduğu bir kurulumdan geliyor; diğer ekranlar aşağıda yalnız metinle anlatıldı. Firma adı, tutar, kimlik no gibi gerçek veriler ve firma logosu bulanıklaştırıldı.",
    "Captures are from the Android version, taken on an installation where only the Owner dashboard and Accounts screens are enabled; other screens are described in text below. Real values such as company names, amounts, ID numbers and the firm's logo are blurred."
  ),
  groups: [
    {
      id: "baslarken",
      title: l("Genel", "General"),
      items: [
        {
          id: "home",
          title: l("Ana sayfa", "Home screen"),
          text: l(
            "Karşılama, firma ve rol, Patron özeti kutuları, yardım kartı ve sık kullanılan ekranlar.",
            "A greeting with firm and role, the owner summary tiles, a help card and frequently used screens."
          ),
          images: ["home"]
        },
        {
          id: "ekranlar",
          title: l("Ekranlar listesi", "Screen list"),
          text: l(
            "Menü; firmanın lisansındaki, firma ayarındaki ve kullanıcının rolünün izin verdiği ekranlardan kurulur ve gruplara ayrılır.",
            "The menu is built from the screens the firm is licensed for, the firm's own settings and the user's role, and split into groups."
          ),
          images: ["home3"]
        },
        {
          id: "yan-menu",
          title: l("Yan menü", "Side menu"),
          text: l(
            "Ana sayfa ve tüm ekranlar yan menüde; üstte firmanın kendi logosu ve markası görünür.",
            "The home page and every screen in a side menu, with the firm's own logo and brand at the top."
          ),
          images: ["drawer"]
        },
        {
          id: "arama",
          title: l("Arama ve komutlar", "Search and commands"),
          text: l(
            "Ekran, işlem ya da komut yazarak anında bulunur. Tema değiştirme ve çalışma firmasını değiştirme komutları da burada.",
            "Type a screen, action or command to jump straight to it. Switching theme or working firm is here too."
          ),
          images: ["arama"]
        },
        {
          id: "bildirim",
          title: l("Bekleyen işler", "Pending items"),
          text: l(
            "Zil, kullanıcının bekleyen işlerini toplar.",
            "The bell gathers the user's pending items."
          ),
          images: ["bildirim"]
        },
        {
          id: "hesap",
          title: l("Hesap menüsü", "Account menu"),
          text: l(
            "Kullanıcı ve rol, görünüm (sistem, açık, koyu), çalışma firmasını değiştirme ve çıkış.",
            "User and role, appearance (system, light, dark), switching the working firm, and sign-out."
          ),
          images: ["profil"]
        }
      ]
    },
    {
      id: "patron",
      title: l("Patron", "Owner"),
      items: [
        {
          id: "pano",
          title: l("Patron Ekranı", "Owner dashboard"),
          text: l(
            "Kasa, banka, çek/senet, nakit akışı, banka kredileri ve kredi taksitleri tek panoda. Her kart ayrıntıya açılır; firma bazında döküm ve aylık grafikler içerir.",
            "Cash, bank, cheques and notes, cash flow, bank loans and loan instalments on one board. Each card opens its detail, with a per-company breakdown and monthly charts."
          ),
          images: ["pano1", "pano3", "pano5"]
        }
      ]
    },
    {
      id: "cari",
      title: l("Cari", "Accounts"),
      items: [
        {
          id: "cariler",
          title: l("Cariler", "Accounts"),
          text: l(
            "Cariler müşteri, taşeron ve diğer gruplarına göre özetlenir; altında bakiyeleriyle tek liste, arama ve sıralama.",
            "Accounts are summarised by customer, subcontractor and other groups, with one balance list underneath, search and sorting."
          ),
          images: ["cariler", "cariler2"]
        },
        {
          id: "cari-karti",
          title: l("Cari kartı ve ekstre", "Account card and statement"),
          text: l(
            "Hareketler, güncel bakiye ve cari bilgileri; ekstre PDF olarak alınır. Bir faturaya dokununca kalemleri ve fatura özeti açılır.",
            "Movements, current balance and account details; the statement exports as PDF. Tap an invoice to see its lines and summary."
          ),
          images: ["caridetay", "fatura"]
        }
      ]
    },
    {
      id: "yonetim",
      title: l("İletişim ve yönetim", "Support and administration"),
      items: [
        {
          id: "geribildirim",
          title: l("Geri Bildirim", "Feedback"),
          text: l(
            "Öneri, hata ya da soru için destek talebi açılır; cevap aynı ekrana düşer.",
            "Open a support request for a suggestion, bug or question; the reply lands on the same screen."
          ),
          images: ["geribildirim"]
        },
        {
          id: "kullanicilar",
          title: l("Kullanıcılar", "Users"),
          text: l(
            "Yönetici, personel hesaplarını ve rollerini uygulamadan yönetir; her kullanıcı ERP'deki kullanıcı numarasıyla eşleşir.",
            "Managers handle staff accounts and roles in the app; each user is matched to their ERP user number."
          ),
          images: ["kullanicilar"]
        }
      ]
    },
    {
      id: "diger",
      title: l("Firmaya göre açılan diğer ekranlar", "Other screens, enabled per firm"),
      intro: l(
        "Bu ekranlar menü kataloğunda var; bir firmada yalnız lisanslıysa ve rolü izin veriyorsa görünür.",
        "These screens exist in the menu catalogue; a firm sees one only if it is licensed and the role allows it."
      ),
      layout: "list",
      items: [
        {
          id: "cari-rapor",
          title: l("Cari Raporları", "Account Reports"),
          text: l("Plasiyer bazlı cari bakiye raporu.", "Account balance report per sales rep.")
        },
        {
          id: "mutabakat",
          title: l("Mutabakat", "Reconciliation"),
          text: l("Cari bazlı mutabakat mektubu, PDF olarak.", "Reconciliation letters per account, as PDF.")
        },
        {
          id: "vade",
          title: l("Vade Ortalaması", "Average Due Date"),
          text: l("Cari bazında ortalama ödeme vadesi.", "Average payment term per account.")
        },
        {
          id: "sorumluluk",
          title: l("Sorumluluk Merkezleri", "Responsibility Centres"),
          text: l("Tanımlı firma hesapları ve hareketleri.", "Defined company accounts and their activity.")
        },
        {
          id: "stoklar",
          title: l("Stoklar", "Stock"),
          text: l("Ürün kartları, miktar ve fiyat; yeni stok kartı açma.", "Product records with quantity and price; open a new stock record.")
        },
        {
          id: "muadil",
          title: l("Muadil Yönetimi", "Equivalent Products"),
          text: l("Aynı ürünün farklı markalarını eşleştirir.", "Pairs different brands of the same product.")
        },
        {
          id: "teklifler",
          title: l("Teklifler", "Quotes"),
          text: l("Teklif hazırlama ve PDF çıktısı.", "Quote creation with PDF output.")
        },
        {
          id: "siparisler",
          title: l("Bekleyen Siparişler", "Pending Orders"),
          text: l("Sevk edilmeyi bekleyen siparişler.", "Orders waiting to ship.")
        },
        {
          id: "fabrika",
          title: l("Fabrika Sipariş Önerisi", "Factory Order Suggestion"),
          text: l("Ürün grubu bazında önerilen sipariş miktarı.", "Suggested order quantity per product group.")
        },
        {
          id: "irsaliyeler",
          title: l("Bekleyen İrsaliyeler", "Pending Waybills"),
          text: l("Faturaya dönüşmemiş irsaliyeler.", "Waybills not yet invoiced.")
        },
        {
          id: "irsaliye-fiyat",
          title: l("İrsaliye Fiyatlandırma", "Waybill Pricing"),
          text: l("Bekleyen irsaliyeleri fiyatlar ve onaylar.", "Prices and approves pending waybills.")
        },
        {
          id: "iskonto",
          title: l("İskonto", "Discount"),
          text: l("Liste fiyatı, iskonto ve vergi dahil tutar hesabı.", "List price, discount and tax-inclusive price calculator.")
        },
        {
          id: "faturalar",
          title: l("Faturalar", "Invoices"),
          text: l("Faturalar ve kalemleri.", "Invoices and their lines.")
        },
        {
          id: "gelen-belge",
          title: l("Gelen Belgeler", "Incoming Documents"),
          text: l("GİB'den gelip henüz işlenmemiş e-fatura ve e-irsaliyeler.", "E-invoices and e-waybills from GİB that are not yet processed.")
        },
        {
          id: "makbuz",
          title: l("Tahsilat Makbuzu", "Collection Receipt"),
          text: l("Tahsilat makbuzu kesme ve PDF çıktısı.", "Issue collection receipts, with PDF output.")
        },
        {
          id: "makbuz-rapor",
          title: l("Tahsilat Raporu", "Collection Report"),
          text: l("Plasiyer bazlı tahsilat raporu.", "Collection report per sales rep.")
        },
        {
          id: "pos",
          title: l("Geçilen Kartlar", "Cards Charged"),
          text: l("Sanal POS'tan geçen kart tahsilatları.", "Card collections charged through the virtual POS.")
        },
        {
          id: "kart-tahsilat",
          title: l("Kart Tahsilatları", "Card Collections"),
          text: l("Komisyon sonrası banka yatışları.", "Bank deposits after commission.")
        },
        {
          id: "ceksenet",
          title: l("Çek / Senet", "Cheques / Notes"),
          text: l("Portföydeki ve verilen çek ve senetler.", "Cheques and notes held and given.")
        },
        {
          id: "kasa",
          title: l("Kasa Defteri", "Cash Book"),
          text: l("Şirket kasası hareketleri ve sayım.", "Company cash movements and counts.")
        },
        {
          id: "kar-zarar",
          title: l("Kâr / Zarar", "Profit / Loss"),
          text: l("Aylık net satış, maliyet ve kâr.", "Monthly net sales, cost and profit.")
        },
        {
          id: "prim",
          title: l("Prim Hesaplama", "Commission"),
          text: l("Aylık plasiyer prim hak edişi.", "Monthly sales-rep commission.")
        },
        {
          id: "arac-sevk",
          title: l("Araç Sevk", "Vehicle Dispatch"),
          text: l("Kamyon plakasına göre sevk tutarları.", "Dispatch totals by truck plate.")
        },
        {
          id: "kataloglar",
          title: l("Kataloglar", "Catalogs"),
          text: l("PDF ürün katalogları.", "PDF product catalogs.")
        },
        {
          id: "mesajlar",
          title: l("Mesajlar", "Messages"),
          text: l("Birebir, grup ve duyuru mesajları.", "One-to-one, group and announcement messages.")
        },
        {
          id: "musteri-hesaplari",
          title: l("Müşteri Hesapları", "Customer Accounts"),
          text: l("Müşteriler için self-servis uygulama hesabı açma.", "Opens self-service app accounts for customers.")
        }
      ]
    }
  ]
};

export const tourApps: Record<TourApp["slug"], TourApp> = {
  teknosales: teknoSalesTour,
  teknoportal: teknoPortalTour,
  gumrahsaha: gumrahSahaTour
};
