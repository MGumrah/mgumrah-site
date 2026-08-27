import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal/privacy-microsoft-store",
  title: "Tekno Portal — Microsoft Store Sürümü Gizlilik Politikası",
  description:
    "Tekno Portal’ın Microsoft Store’dan kurulan Windows sürümü için gizlilik politikası. Bu sürümde kart ile ödeme ve IBAN girişi bulunmaz.",
  image: TEKNO_PORTAL_CARD
});

export default function TurkishTeknoPortalMicrosoftStorePrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="teknoportal-microsoft-store">
      <p>
        Bu politika, Tekno Portal&apos;ın <strong>yalnızca Microsoft Store&apos;dan kurulan Windows sürümü</strong> için
        geçerlidir. Uygulamanın iOS, Android ve şirket tarafından doğrudan dağıtılan Windows sürümleri için{" "}
        <a href="/tr/apps/teknoportal/privacy/">genel gizlilik politikası</a> geçerlidir.
      </p>
      <p>
        Tekno Portal, Tekno İklimlendirme müşterilerine yönelik kurumsal (B2B) bir self-servis uygulamasıdır. Genel
        tüketiciye yönelik değildir. Uygulama üzerinden hesap oluşturulamaz; hesaplar Tekno İklimlendirme tarafından
        tanımlanır ve kullanıcı adı ile şifre satış temsilcisi aracılığıyla iletilir.
      </p>

      <h2>1. Bu sürümde bulunmayanlar</h2>
      <p>Aşağıdakiler bu sürümde <strong>yoktur</strong> ve uygulama bunları hiçbir şekilde istemez:</p>
      <ul>
        <li>
          <strong>Kart ile ödeme yoktur.</strong> Uygulama kart sahibi adı, kart numarası, son kullanma tarihi veya
          güvenlik kodu (CVV) sormaz; kart bilgisi işlemez, iletmez ve saklamaz.
        </li>
        <li>
          <strong>IBAN girişi ve IBAN görüntüleme yoktur.</strong> Uygulama sizden banka hesap numarası istemez.
        </li>
        <li>
          <strong>Hiçbir finansal işlem başlatılmaz veya işlenmez.</strong>
        </li>
        <li>Reklam, reklam kimliği, üçüncü taraf izleme (tracking) veya analitik yazılımı bulunmaz.</li>
        <li>Çökme raporlama servisi kullanılmaz.</li>
        <li>Konum, kamera, mikrofon, rehber, takvim, sağlık ve sensör verilerine erişim istenmez.</li>
      </ul>

      <h2>2. İşlenen veriler</h2>

      <h3>Hesap ve oturum bilgileri</h3>
      <p>
        Kullanıcı adı ve şifre (yalnızca giriş isteğinde şirketin sunucusuna iletilir), kullanıcı kimliği, ad soyad ve
        rol bilgisi, hesaba bağlı cari kod ve erişim yetkileri, oturum jetonu ve geçerlilik süresi.
      </p>
      <p>
        Bir sonraki açılışta oturumunuzun kendiliğinden sürmesi için{" "}
        <strong>kullanıcı adınız ve şifreniz cihazınızda saklanır</strong>: Windows veri koruma mekanizması (DPAPI) ile
        şifrelenir, yalnızca aynı Windows kullanıcısı çözebilir, oturum jetonundan ayrı bir kayıtta tutulur, sunucuya ya
        da üçüncü bir tarafa gönderilmez ve <strong>çıkış yaptığınızda silinir</strong>.
      </p>

      <h3>Ticari veriler (yalnızca görüntülenir)</h3>
      <p>
        Cari kod, ticari unvan ve gösterim adı; bakiye, borç ve alacak durumu; cari hareket (ekstre) geçmişi; fatura
        bilgileri, fatura kalemleri ve fatura PDF belgeleri; tahsilat makbuzu belgeleri; siparişler, bekleyen siparişler
        ve teklifler; geçmiş ürün (stok) hareketleri; ürün katalogları.
      </p>
      <p>
        Bu veriler zaten <strong>sizin kendi cari hesabınıza ait</strong> verilerdir ve şirketin kendi sunucusundan
        (ERP) çekilir. Uygulama bunları görüntüler; üzerlerinde bir ödeme ya da tahsilat işlemi yapılmaz.
      </p>

      <h3>Fatura künyesi</h3>
      <p>
        Unvan, adres, ilçe, il, vergi dairesi, vergi numarası, telefon ve e-posta görüntülenir. Bunlardan{" "}
        <strong>yalnızca adres, ilçe ve telefon</strong> alanları uygulama üzerinden güncellenebilir ve güncellendiğinde
        şirketin sunucusuna iletilir. Unvan, vergi dairesi, vergi numarası ve il alanları uygulama üzerinden
        değiştirilemez.
      </p>

      <h3>Sipariş ve teklif verileri</h3>
      <p>
        Kendi kataloğunuzdaki ürün bilgileri ve ürüne özel fiyat sorguları, oluşturduğunuz siparişler ve sipariş
        kalemleri, bekleyen siparişler ve teklif kayıtları. Sipariş isteğinde fiyat ve cari kod istemciden gönderilmez;
        her ikisi de sunucu tarafında türetilir. Her sepet için üretilen tek kullanımlık bir işlem kimliği, aynı
        siparişin ikinci kez kaydedilmesini engeller.
      </p>

      <h3>Yalnızca cihazda tutulan veriler</h3>
      <p>
        Profil bölümünde kendi elinizle girdiğiniz <strong>konum (adres) kayıtları</strong> sunucuya hiç gönderilmez;
        yalnızca uygulamanın cihazdaki alanında tutulur. Bu kayıtlar koordinat içermez; harita, yazdığınız adres
        metniyle aratılır. Ayrıca indirilen ürün katalogları (PDF), görüntülenen ekstre/fatura/makbuz belgeleri,
        tamamlanmamış sipariş taslakları, hesaplama araçlarındaki geçici girdiler ve &ldquo;Sürüm Notları&rdquo;
        penceresinin gösterilip gösterilmediği gibi basit uygulama tercihleri cihazda kalır.
      </p>

      <h3>Teknik veriler</h3>
      <p>
        Uygulama sürümü ve uygulama kimliği (sunucunun asgari sürüm denetimi için gönderilir) ve ağ bağlantısının
        durumu (yalnızca cihazda okunur; &ldquo;internet yok&rdquo; ile &ldquo;sunucuya ulaşılamıyor&rdquo; hatalarını
        ayırmak için).
      </p>

      <h3>Çökme kayıtları cihazda kalır</h3>
      <p>
        Uygulama beklenmedik şekilde kapanırsa teknik hata bilgisi <code>%LocalAppData%\TeknoPortal\cokme.log</code>{" "}
        dosyasına <strong>yalnızca cihazınızda</strong> yazılır. Bu dosya otomatik olarak hiçbir yere gönderilmez;
        yalnızca siz destek talebiyle birlikte iletirseniz incelenir.
      </p>

      <h2>3. Verilerin kullanım amaçları</h2>
      <ul>
        <li>Kullanıcının kimliğini doğrulamak ve oturumu yönetmek</li>
        <li>Kullanıcıya yalnızca kendi cari hesaplarına ait verileri göstermek</li>
        <li>Cari ekstre, bakiye ve fatura bilgilerini sunmak</li>
        <li>Sipariş ve teklif süreçlerini yürütmek</li>
        <li>Fatura künyesindeki adres, ilçe ve telefon bilgisini güncellemek</li>
        <li>Ürün kataloglarını ve belgeleri indirip görüntülemek</li>
        <li>Vade farkı ve iskonto hesaplama araçlarını çalıştırmak</li>
        <li>Asgari uygulama sürümünü denetleyip gerektiğinde güncelleme uyarısı göstermek</li>
        <li>Yetki bazlı erişim kontrollerini uygulamak</li>
      </ul>
      <p>
        Veriler; reklam gösterimi, reklam hedefleme, profilleme veya üçüncü taraf pazarlama amacıyla{" "}
        <strong>kullanılmaz</strong>.
      </p>

      <h2>4. Veri aktarımı ve paylaşımı</h2>
      <ul>
        <li>
          <strong>Şirketin kendi sunucusu.</strong> Hesap, cari, ticari ve sipariş verileri yalnızca{" "}
          <strong>api.teknoiklimlendirme.com</strong> adresine HTTPS ile iletilir.
        </li>
        <li>
          <strong>Microsoft Store.</strong> Uygulamanın dağıtımı ve güncellenmesi Microsoft Store üzerinden yapılır; bu
          işlem yalnızca uygulama dosyalarının indirilmesini kapsar.
        </li>
        <li>
          <strong>Harita uygulaması.</strong> Konum ekranındaki bağlantıya tıklandığında varsayılan tarayıcıda harita
          araması, <strong>yazdığınız adres metniyle</strong> açılır. Uygulama cihazın konumunu okumaz ve iletmez.
        </li>
        <li>
          Bunların dışında hiçbir üçüncü tarafa veri iletilmez. Veriler pazarlama amacıyla üçüncü taraflara satılmaz
          veya devredilmez.
        </li>
      </ul>

      <h2>5. Veri güvenliği</h2>
      <ul>
        <li>Tüm sunucu iletişimi HTTPS (TLS) üzerinden yapılır; şifresiz bağlantıya izin verilmez.</li>
        <li>
          İstekler, sunucu tarafında doğrulanan bir API anahtarı ve oturum açan kullanıcı için süreli bir oturum jetonu
          ile yetkilendirilir.
        </li>
        <li>Oturum bilgileri Windows veri koruma mekanizması (DPAPI) ile şifrelenerek saklanır.</li>
        <li>
          Sessiz giriş için saklanan kullanıcı adı ve şifre, oturum jetonundan ayrı bir kayıtta ve yine DPAPI ile
          şifrelenir; çıkış yapıldığında silinir.
        </li>
        <li>
          Sunucu tarafında her istek, kullanıcının erişebileceği cari kümesine karşı doğrulanır; kapsam dışındaki bir
          cari için yapılan istek reddedilir.
        </li>
      </ul>

      <h2>6. Veri saklama süresi</h2>
      <p>
        Cihazda saklanan oturum bilgileri, çıkış yapıldığında veya oturum jetonunun süresi dolduğunda geçersiz hâle
        gelir; sessiz giriş kaydı çıkış yapıldığında silinir. Uygulama kaldırıldığında cihazdaki tüm yerel veriler
        silinir. Kendi girdiğiniz konum kayıtları yalnızca cihazda tutulduğu için uygulama kaldırıldığında veya cihaz
        değiştirildiğinde kaybolur; cihazlar arasında eşitlenmez. Sunucu tarafındaki ticari ve mali veriler, şirketin
        veri saklama politikalarına ve geçerli yasal yükümlülüklere göre saklanır.
      </p>

      <h2>7. Hesap oluşturma ve kapatma</h2>
      <p>
        Uygulama üzerinden yeni hesap oluşturulamaz; hesaplar Tekno İklimlendirme tarafından tanımlanır. Hesabınızın
        kapatılmasını veya erişiminizin durdurulmasını talep etmek için satış temsilcinize ya da aşağıdaki iletişim
        adreslerine başvurabilirsiniz.
      </p>

      <h2>8. KVKK kapsamındaki haklarınız</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme,
        işlenmişse bilgi talep etme, düzeltilmesini veya silinmesini isteme haklarına sahipsiniz. Bu hesap çalıştığınız
        işletme tarafından oluşturulduğundan veri sorumlusu öncelikle o işletmedir.
      </p>

      <h2>9. Çocukların gizliliği</h2>
      <p>
        Uygulama yalnızca kurumsal müşterilerin yetkili kullanıcılarına yöneliktir; 18 yaş altı bireylerden bilerek veri
        toplanmaz.
      </p>

      <h2>10. Politika değişiklikleri</h2>
      <p>
        Bu politika güncellenebilir; güncel sürüm her zaman bu adreste yayımlanır ve yürürlük tarihi değiştirilir.
      </p>

      <h2>11. İletişim</h2>
      <p>
        <strong>Şirket / Veri Sorumlusu:</strong> Tekno İklimlendirme<br />
        <strong>E-posta:</strong> <a href="mailto:info@teknoiklimlendirme.com">info@teknoiklimlendirme.com</a><br />
        <strong>Web:</strong> <a href="https://teknoiklimlendirme.com">teknoiklimlendirme.com</a>
      </p>
      <p>
        <strong>Teknik Geliştirici:</strong> Mehmet Gümrah<br />
        <strong>E-posta:</strong> <a href="mailto:support@mgumrah.com">support@mgumrah.com</a><br />
        <strong>Web:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
      </p>
    </PrivacyDocument>
  );
}
