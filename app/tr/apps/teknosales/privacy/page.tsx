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
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">Tekno Satış</p>
        <h1>Gizlilik Politikası</h1>
        <p className="meta">
          Tekno Satış B2B mobil uygulaması için geçerlidir. iOS ve Android sürümleri aynı veri işleme prensiplerini kullanır.
          <br />
          Son güncelleme: Mayıs 2026
        </p>
        <div className="language-links" aria-label="Dil seçenekleri">
          <Link className="button primary" href="/tr/apps/teknosales/privacy/">Türkçe</Link>
          <Link className="button" href="/en/apps/teknosales/privacy/">English</Link>
        </div>
      </header>

      <article className="content">
        <h2>1. Genel Bilgi</h2>
        <p>
          Bu Gizlilik Politikası, Tekno Satış mobil uygulamasının ("Uygulama") kullanıcılarından hangi bilgileri topladığını,
          bu bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır. Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.
        </p>
        <p>
          Uygulama; yetkili satış temsilcilerine ve yöneticilere müşteri hesapları, fatura takibi, tahsilat raporları ve
          ürün katalogları gibi B2B satış süreçlerini yönetme imkanı sunar.
        </p>

        <h2>2. Toplanan Veriler</h2>
        <h3>Kullanıcı Kimlik Bilgileri</h3>
        <ul>
          <li>Kullanıcı adı ve şifre, yalnızca giriş doğrulama amacıyla kullanılır.</li>
        </ul>

        <h3>Müşteri ve Ticari Veriler</h3>
        <ul>
          <li>Cari kod, ticari unvan, vergi numarası ve vergi dairesi</li>
          <li>İletişim bilgileri, e-posta ve cep telefonu</li>
          <li>Bakiye, borç ve alacak durumu</li>
        </ul>

        <h3>Finansal ve İşlem Verileri</h3>
        <ul>
          <li>Fatura bilgileri, seri, sıra, tarih, tutar, KDV ve iskonto</li>
          <li>Ödeme ve hareket geçmişi</li>
          <li>Tahsilat raporları, nakit, kredi kartı, çek ve senet</li>
          <li>Sorumluluk merkezi bakiye bilgileri</li>
        </ul>

        <h3>Plasiyer / Satış Temsilcisi Verileri</h3>
        <ul>
          <li>Plasiyer kodu, adı, satış ve tahsilat tutarları</li>
          <li>Hedef ve kota bilgileri</li>
        </ul>

        <h3>Cihazda Saklanan Veriler</h3>
        <ul>
          <li>Kullanıcı adı ve şifre, cihazda AES-256 şifreleme ile korunarak saklanır.</li>
          <li>İndirilen ürün katalogları PDF olarak cihazın yerel depolama alanında tutulur.</li>
          <li>Uygulama; konum, kamera, mikrofon, rehber veya kişisel sensör verilerine erişim talep etmez ve bunları toplamaz.</li>
        </ul>

        <h2>3. Verilerin Kullanım Amacı</h2>
        <ul>
          <li>Kullanıcının kimliğini doğrulamak ve oturumunu yönetmek</li>
          <li>Yetkili kullanıcıya ait müşteri, fatura ve tahsilat bilgilerini görüntülemek</li>
          <li>Satış performans raporlarını sunmak</li>
          <li>Güncel ürün kataloglarını indirip görüntülemek</li>
        </ul>
        <p>
          Veriler yalnızca yukarıda belirtilen iş süreçleri için kullanılır; pazarlama, reklam veya yetkisiz üçüncü taraf
          paylaşımı amacıyla işlenmez.
        </p>

        <h2>4. Veri Aktarımı ve Paylaşımı</h2>
        <p>
          Uygulama, verileri yalnızca şirketin kendi sunucusuna <strong>api.teknoiklimlendirme.com</strong> adresi üzerinden HTTPS protokolüyle iletir.
        </p>
        <p>
          Uygulamada hata izleme, teknik kararlılık takibi ve kullanım analizi amacıyla Firebase Crashlytics ve Firebase Analytics
          kullanılmaktadır. Bu servisler; uygulama çökmesi, hata günlükleri, cihaz ve sürüm bilgileri, uygulama etkileşimleri ve
          kullanım istatistikleri gibi teknik verileri toplayabilir.
        </p>
        <p>
          Firebase Analytics verileri uygulama deneyimini iyileştirmek ve teknik performansı takip etmek amacıyla kullanılır. Reklam ağı
          veya sosyal medya platformları bu kapsamda kullanılmamaktadır. Tüm ağ trafiği HTTPS ile şifrelenmektedir; açık HTTP bağlantısına
          izin verilmemektedir.
        </p>

        <h2>5. Veri Güvenliği</h2>
        <ul>
          <li>Şifreler cihazda AES-256-GCM şifreleme ile saklanır.</li>
          <li>API anahtarı her istekte güvenli başlık olan <strong>x-api-key</strong> aracılığıyla iletilir.</li>
          <li>Uygulama içi dosya paylaşımı, Android FileProvider mekanizması ile kontrol altında tutulur.</li>
        </ul>

        <h2>6. Veri Saklama Süresi</h2>
        <p>
          Cihaz üzerindeki kimlik bilgileri; kullanıcı uygulamadan çıkış yaptığında veya uygulamayı kaldırdığında silinir.
          Sunucu tarafındaki veriler şirketin iç veri saklama politikasına tabidir.
        </p>

        <h2>7. Kullanıcı Hakları</h2>
        <ul>
          <li>Cihazda saklanan kimlik bilgilerini uygulama üzerinden silebilir.</li>
          <li>Uygulamayı kaldırarak cihaz üzerindeki yerel verileri temizleyebilir.</li>
          <li>Hesaplarına ilişkin veri talepleri için şirket yöneticisiyle iletişime geçebilir.</li>
        </ul>

        <h2>8. Çocukların Gizliliği</h2>
        <p>Bu uygulama yalnızca kurumsal kullanıcılara yöneliktir ve 18 yaş altı bireylerden bilerek veri toplanmaz.</p>

        <h2>9. Politika Değişiklikleri</h2>
        <p>
          Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler uygulama içinde veya şirketin resmi
          kanalları aracılığıyla duyurulacaktır.
        </p>

        <h2>10. İletişim</h2>
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
