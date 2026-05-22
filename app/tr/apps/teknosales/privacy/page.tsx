import Link from "next/link";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknosales/privacy",
  title: "Tekno Satış Gizlilik Politikası",
  description: "TeknoSales iOS ve Android mobil uygulamaları için gizlilik politikası."
});

export default function TurkishPrivacyPage() {
  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href="/tr/">Anasayfa</Link>
          <span>/</span>
          <Link href="/tr/apps/">Uygulamalar</Link>
          <span>/</span>
          <Link href="/tr/apps/teknosales/">Tekno Satış</Link>
          <span>/</span>
          <span>Gizlilik</span>
        </div>
        <p className="kicker">
          <span className="dot" />
          Tekno Satış
        </p>
        <h1>Gizlilik Politikası</h1>
        <p className="meta">
          Tekno Satış B2B mobil uygulaması için geçerlidir. iOS ve Android sürümleri aynı veri işleme prensiplerini kullanır.
        </p>
        <p className="meta subtle">Son güncelleme: Mayıs 2026</p>
        <div className="actions-row" aria-label="Dil seçenekleri">
          <Link className="btn primary" href="/tr/apps/teknosales/privacy/">Türkçe</Link>
          <Link className="btn" href="/en/apps/teknosales/privacy/">English</Link>
        </div>
      </header>

      <article className="doc-section">
        <p>
          Bu Gizlilik Politikası, Tekno Satış mobil uygulamasının (&ldquo;Uygulama&rdquo;) kullanıcılarından hangi bilgileri topladığını,
          bu bilgilerin hangi amaçlarla kullanıldığını, kimlerle paylaşılabileceğini ve nasıl korunduğunu açıklar.
        </p>
        <p>
          Uygulama; yetkili satış temsilcilerine, yöneticilere ve ilgili şirket kullanıcılarına müşteri hesapları, fatura takibi,
          stok bilgileri, teklif takibi, sipariş ve sevkiyat raporları, tahsilat raporları ve ürün katalogları gibi B2B satış
          süreçlerini yönetme imkanı sunar.
        </p>

        <h2>1. Toplanan Veriler</h2>
        <p>Uygulama, kullanıcının yetkisine ve kullanılan ekrana bağlı olarak aşağıdaki verileri işleyebilir:</p>

        <h3>Kullanıcı Kimlik Bilgileri</h3>
        <ul>
          <li>Kullanıcı adı</li>
          <li>Şifre</li>
          <li>Kullanıcı ID bilgisi</li>
          <li>Kullanıcı rolü ve yetki bilgileri</li>
          <li>Plasiyer / satış temsilcisi kodu</li>
        </ul>

        <h3>Müşteri ve Ticari Veriler</h3>
        <ul>
          <li>Cari kod</li>
          <li>Ticari unvan</li>
          <li>Vergi numarası ve vergi dairesi</li>
          <li>İletişim bilgileri</li>
          <li>E-posta ve telefon bilgileri</li>
          <li>Bakiye, borç ve alacak durumu</li>
          <li>Cari hareket geçmişi</li>
        </ul>

        <h3>Finansal ve İşlem Verileri</h3>
        <ul>
          <li>Fatura bilgileri</li>
          <li>Fatura seri, sıra, tarih ve tutar bilgileri</li>
          <li>KDV, iskonto ve toplam tutarlar</li>
          <li>Ödeme ve hareket geçmişi</li>
          <li>Tahsilat raporları</li>
          <li>Nakit, kredi kartı, çek ve senet bilgileri</li>
          <li>Sorumluluk merkezi bakiye bilgileri</li>
        </ul>

        <h3>Stok, Sipariş, Teklif ve Sevkiyat Verileri</h3>
        <ul>
          <li>Stok kodu, stok adı ve birim bilgisi</li>
          <li>Depo bazlı stok miktarları</li>
          <li>Stok hareketleri</li>
          <li>Teklif bilgileri ve teklif kalemleri</li>
          <li>Bekleyen siparişler</li>
          <li>Bekleyen irsaliyeler</li>
          <li>Araç sevk raporu bilgileri</li>
          <li>Plaka, sevk tutarı, sevk miktarı ve irsaliye sayısı gibi rapor verileri</li>
        </ul>

        <h3>Cihazda Saklanan Veriler</h3>
        <ul>
          <li>
            Kullanıcı adı ve şifre güvenli şekilde saklanır: iOS sürümünde Apple Keychain (Anahtar Zinciri), Android sürümünde
            ise Android güvenli depolama mekanizmaları kullanılır.
          </li>
          <li>Oturum ve yetki bilgileri cihazda güvenli şekilde tutulabilir.</li>
          <li>
            İndirilen ürün katalogları ve PDF belgeleri (fatura, irsaliye, makbuz vb.) cihazın yerel depolama alanında
            tutulabilir.
          </li>
          <li>
            Push bildirimleri için alınan Firebase Cloud Messaging cihaz tokenı, kullanıcı oturumu ile ilişkilendirilerek
            cihazda saklanabilir.
          </li>
          <li>Bazı filtre, sıralama ve ekran tercihleri kullanıcı deneyimini iyileştirmek için cihazda saklanabilir.</li>
        </ul>

        <h3>Teknik ve Kullanım Verileri</h3>
        <ul>
          <li>Uygulama sürümü</li>
          <li>Cihaz modeli ve işletim sistemi bilgileri</li>
          <li>Çökme ve hata günlükleri</li>
          <li>Uygulama performans bilgileri</li>
          <li>Ekran görüntüleme ve temel kullanım istatistikleri</li>
          <li>Firebase Cloud Messaging bildirim tokenı</li>
          <li>Android sürümünde, Firebase Analytics kapsamında Google Play Hizmetleri reklam kimliği</li>
        </ul>

        <p>
          Uygulama; konum, kamera, mikrofon, rehber veya kişisel sensör verilerine erişim talep etmez ve bu verileri toplamaz.
          Uygulamada yer alan harita ekranı yalnızca sabit şirket showroom konumlarını gösterir; cihazın konum verisine
          erişmez.
        </p>

        <h2>2. Verilerin Kullanım Amaçları</h2>
        <p>Toplanan veriler aşağıdaki amaçlarla kullanılır:</p>
        <ul>
          <li>Kullanıcının kimliğini doğrulamak</li>
          <li>Oturum yönetimi sağlamak</li>
          <li>
            Kullanıcının yetkili olduğu müşteri, fatura, stok, teklif, sipariş, sevkiyat ve tahsilat bilgilerini göstermek
          </li>
          <li>Satış ve tahsilat performans raporlarını sunmak</li>
          <li>Ürün kataloglarını indirip görüntülemek</li>
          <li>Uygulama içi bildirimler ve önemli duyurular göndermek</li>
          <li>Uygulama hatalarını tespit etmek ve teknik kararlılığı artırmak</li>
          <li>Uygulama performansını ve kullanım deneyimini iyileştirmek</li>
          <li>Yetki bazlı erişim kontrollerini uygulamak</li>
        </ul>
        <p>
          Veriler; reklam gösterimi, reklam hedefleme veya yetkisiz üçüncü taraf pazarlama amacıyla kullanılmaz.
        </p>

        <h2>3. Reklam Kimliği Kullanımı</h2>
        <p>
          Android sürümünde, Firebase Analytics kapsamında Google Play Hizmetleri reklam kimliği kullanılabilir. Bu kullanım
          yalnızca:
        </p>
        <ul>
          <li>Kullanım analizi</li>
          <li>Uygulama performans ölçümü</li>
          <li>Teknik iyileştirme</li>
          <li>Hata ve kararlılık takibi</li>
        </ul>
        <p>amaçlarıyla sınırlıdır.</p>
        <p>
          iOS sürümünde Apple Reklam Tanımlayıcısı (IDFA) toplanmaz ve App Tracking Transparency izni istenmez. Uygulamanın
          <strong> PrivacyInfo.xcprivacy</strong> dosyasında izleme (tracking) olmadığı beyan edilmiştir.
        </p>
        <p>
          Uygulamada reklam gösterimi yapılmaz. Reklam kimliği; reklam hedefleme, kullanıcı profilleme veya pazarlama amacıyla
          kullanılmaz.
        </p>

        <h2>4. Bildirimler ve Firebase Cloud Messaging</h2>
        <p>
          Uygulama; önemli duyurular, uygulama güncellemeleri ve bilgilendirme mesajları için Firebase Cloud Messaging
          kullanabilir. Bu kapsamda:
        </p>
        <ul>
          <li>Cihaza ait bildirim tokenı alınabilir (iOS&apos;ta APNs token Firebase üzerinden FCM tokenına köprülenir).</li>
          <li>Bildirim tokenı, oturum açan kullanıcı hesabıyla ilişkilendirilebilir.</li>
          <li>
            Token bilgisi, şirket sunucusuna (<strong>api.teknoiklimlendirme.com</strong>) <code>/device-tokens</code>{" "}
            uç noktası üzerinden iletilir.
          </li>
          <li>Kullanıcı çıkış yaptığında veya cihaz değiştirdiğinde token sunucudan silinir.</li>
          <li>Kullanıcı, işletim sistemi ayarlarından uygulama bildirimlerini kapatabilir.</li>
        </ul>
        <p>Bildirim tokenı, yalnızca uygulama bildirimlerini göndermek ve yönetmek amacıyla kullanılır.</p>

        <h2>5. Veri Aktarımı ve Paylaşımı</h2>
        <p>
          Uygulama, verileri şirketin kendi sunucularına <strong>api.teknoiklimlendirme.com</strong> adresi üzerinden HTTPS
          protokolüyle iletir.
        </p>

        <p>Uygulamada aşağıdaki üçüncü taraf servisler kullanılmaktadır:</p>

        <h3>Firebase Cloud Messaging</h3>
        <p>
          Bildirim göndermek için kullanılır. Bu kapsamda cihaz bildirim tokenı işlenebilir. Hem iOS hem Android sürümünde
          kullanılır.
        </p>

        <h3>Firebase Analytics</h3>
        <p>
          Uygulama kullanım istatistiklerini, ekran görüntülemelerini, temel etkileşimleri ve teknik performans bilgilerini
          analiz etmek için kullanılır. Firebase Analytics kapsamında kullanıcı ID&apos;si, kullanıcı tipi ve plasiyer
          bilgisi gibi uygulama içi analiz alanları işlenebilir.
        </p>

        <h3>Firebase Crashlytics</h3>
        <p>
          Uygulama çökmesi, hata günlükleri, cihaz modeli, işletim sistemi ve uygulama sürümü gibi teknik bilgileri
          toplamak için kullanılır. Bu veriler hataları tespit etmek ve uygulama kararlılığını artırmak amacıyla kullanılır.
        </p>

        <h3>Uygulama Güncellemeleri</h3>
        <ul>
          <li>
            <strong>iOS:</strong> App Store&apos;daki güncel sürümü kontrol etmek için Apple iTunes Lookup API kullanılır.
            Yeni sürüm tespit edilirse kullanıcıya bildirim gösterilir ve App Store sayfası açılır. Bu istek anonimdir ve
            kişisel veri içermez.
          </li>
          <li>
            <strong>Android:</strong> Google Play In-App Updates aracılığıyla uygulama güncellemeleri kontrol edilir ve
            kullanıcıya sunulur.
          </li>
        </ul>

        <p>
          Reklam ağı, sosyal medya takip SDK&apos;sı veya üçüncü taraf reklam platformu kullanılmamaktadır.
        </p>

        <h2>6. Veri Güvenliği</h2>
        <p>Verilerin korunması için aşağıdaki teknik önlemler uygulanır:</p>
        <ul>
          <li>
            Kullanıcı kimlik bilgileri; iOS sürümünde Apple Keychain (Anahtar Zinciri), Android sürümünde ise Android
            güvenli depolama mekanizmaları ile korunur.
          </li>
          <li>Hassas yerel veriler, platforma özgü güvenli depolama mekanizmaları ile korunur.</li>
          <li>Sunucu iletişimi HTTPS üzerinden yapılır.</li>
          <li>
            API istekleri, güvenli başlık olan <strong>x-api-key</strong> ile yetkilendirilir ve sunucu tarafında
            doğrulanır.
          </li>
          <li>
            Uygulama içi dosya paylaşımı; iOS sürümünde sistem paylaşım sayfası (ShareLink / UIActivityViewController),
            Android sürümünde ise Android FileProvider mekanizması ile kontrol altında tutulur.
          </li>
          <li>Açık HTTP bağlantılarına izin verilmez; tüm trafik TLS ile şifrelenir.</li>
        </ul>

        <h2>7. Veri Saklama Süresi</h2>
        <p>
          Cihazda saklanan kimlik ve oturum bilgileri, kullanıcı uygulamadan çıkış yaptığında veya uygulama kaldırıldığında
          silinebilir.
        </p>
        <p>
          İndirilen kataloglar, PDF dosyaları ve yerel tercihler cihazda tutulabilir. Kullanıcı uygulamayı kaldırarak cihaz
          üzerindeki yerel verileri temizleyebilir.
        </p>
        <p>
          Sunucu tarafındaki ticari, finansal ve operasyonel veriler şirketin iç veri saklama politikalarına ve geçerli
          yasal yükümlülüklere göre saklanır.
        </p>
        <p>
          Firebase Analytics, Crashlytics ve Cloud Messaging kapsamında işlenen teknik veriler, ilgili servis
          sağlayıcıların veri saklama politikalarına tabi olabilir.
        </p>

        <h2>8. Kullanıcı Hakları</h2>
        <p>Kullanıcılar:</p>
        <ul>
          <li>Uygulama üzerinden oturumdan çıkış yaparak cihazda saklanan kimlik bilgilerini silebilir.</li>
          <li>Uygulamayı kaldırarak cihazdaki yerel verileri temizleyebilir.</li>
          <li>Hesaplarına ilişkin veri talepleri için şirket yöneticisi veya veri sorumlusu ile iletişime geçebilir.</li>
          <li>Bildirim izinlerini cihaz ayarlarından yönetebilir.</li>
        </ul>

        <h2>9. Çocukların Gizliliği</h2>
        <p>
          Bu uygulama yalnızca kurumsal ve yetkili kullanıcıların kullanımına yöneliktir. 18 yaş altı bireylerden bilerek
          veri toplanmaz.
        </p>

        <h2>10. Politika Değişiklikleri</h2>
        <p>
          Bu Gizlilik Politikası gerektiğinde güncellenebilir. Önemli değişiklikler uygulama içinde, web sitesi üzerinden
          veya şirketin resmi iletişim kanalları aracılığıyla duyurulabilir.
        </p>

        <h2>11. İletişim</h2>
        <p>
          <strong>Şirket / Veri Sorumlusu:</strong> Tekno İklimlendirme<br />
          <strong>E-posta:</strong> <a href="mailto:info@teknoiklimlendirme.com">info@teknoiklimlendirme.com</a><br />
          <strong>Web:</strong> <a href="https://teknoiklimlendirme.com">teknoiklimlendirme.com</a>
        </p>
        <p>
          <strong>Teknik Geliştirici:</strong> Mehmet Gümrah<br />
          <strong>Web:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
        </p>
      </article>
    </main>
  );
}
