import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/gumrahsaha/privacy",
  title: "Gümrah Saha Gizlilik Politikası",
  description:
    "Gümrah Saha saha satış uygulaması için gizlilik politikası. Uygulamada üçüncü taraf SDK, reklam ve izleme yoktur; veriler çalıştığınız işletmenin kendi sunucusuna gider."
});

export default function TurkishGumrahSahaPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="gumrahsaha">
      <p>
        Bu Gizlilik Politikası, Gümrah Saha uygulamasının (&ldquo;Uygulama&rdquo;) hangi bilgileri işlediğini, bu
        bilgilerin nereye gittiğini, hangi amaçlarla kullanıldığını ve nasıl korunduğunu açıklar. Politika,
        uygulamanın <strong>iOS</strong> sürümü için geçerlidir.
      </p>
      <p>
        Gümrah Saha, saha satış ekipleri için geliştirilmiş <strong>çok firmalı</strong> bir uygulamadır ve tek
        başına bir hizmet değildir. Her işletme kendi sunucu kurulumunu çalıştırır; uygulama, girdiğiniz firma
        koduyla (ya da elle yazdığınız sunucu adresiyle) o kuruluma bağlanır. Ekranda gördüğünüz bütün ticari
        veriler — cari hesaplar, bakiyeler, ekstre ve stok — <strong>o işletmenin kendi sistemlerinden</strong>{" "}
        gelir ve orada kalır.
      </p>
      <p>
        Uygulama üzerinden hesap oluşturulamaz. Kullanıcı adı, şifre, firma kodu ve bağlantı anahtarı,
        uygulamayı kullandığınız işletme tarafından tanımlanır ve size o işletme tarafından iletilir.
      </p>

      <h2>1. Özet</h2>
      <ul>
        <li>
          Uygulamada reklam, reklam kimliği, üçüncü taraf izleme (tracking), analitik ve çökme raporlama{" "}
          <strong>bulunmaz</strong>. Uygulama hiçbir üçüncü taraf SDK içermez; ağ, veri çözümleme ve güvenli
          saklama işlerinin tamamı işletim sisteminin kendi çatılarıyla (URLSession, Codable, Anahtar Zinciri)
          yapılır.
        </li>
        <li>
          <strong>Merkezi bir sunucu yoktur.</strong> Uygulama yalnızca bağlandığınız işletmenin kendi sunucusuyla
          konuşur; geliştirici bu trafiğin tarafı değildir ve verilerinizi göremez.
        </li>
        <li>Konum, kamera, mikrofon, rehber, fotoğraf, takvim, sağlık ve sensör izinleri istenmez.</li>
        <li>
          Kullanıcı adı, şifre, oturum jetonu ve firma bağlantı anahtarı yalnızca cihazın Anahtar Zinciri&apos;nde
          (Keychain) tutulur; iCloud ile eşitlenmez ve cihaz yedeğine girmez.
        </li>
        <li>Uygulamada push bildirimi altyapısı yoktur; cihaz bildirim jetonu işlenmez.</li>
        <li>
          Uygulamanın gösterdiği ticari veriler zaten çalıştığınız işletmenin, sizin yetkinize açtığı kendi
          verileridir.
        </li>
      </ul>

      <h2>2. Veri Sorumlusu Kimdir</h2>
      <p>
        Ticari ve kişisel verilerin veri sorumlusu, <strong>uygulamayı kullandığınız işletmedir</strong>. Hesabınızı
        o işletme açar, hangi cari hesapları görebileceğinize o işletmenin sunucusu karar verir ve veriler o
        işletmenin kendi sunucusunda saklanır.
      </p>
      <p>
        <strong>Mehmet Gümrah</strong> uygulamanın geliştiricisi ve App Store yayıncısıdır. Bu sıfatla merkezi bir
        sunucu işletmez; kullanıcı adınızı, şifrenizi, cari verilerinizi ya da kullanım kayıtlarınızı toplamaz,
        saklamaz ve görüntüleyemez. Geliştiriciye ulaşan tek şey, kendi isteğinizle e-posta ile ilettiğiniz destek
        talepleridir.
      </p>

      <h2>3. İşlenen Veriler</h2>

      <h3>Hesap ve Oturum Bilgileri</h3>
      <ul>
        <li>Kullanıcı adı ve şifre (giriş isteğinde işletmenin sunucusuna iletilir)</li>
        <li>Kullanıcı kimliği, ad soyad, rol ve varsa temsilci kodu</li>
        <li>Rol tabanlı olarak kapatılmış işlemlerin listesi (hangi ekranların gizleneceği)</li>
        <li>Oturum jetonu ve jetonun geçerlilik süresi</li>
      </ul>

      <h3>Firma Bağlantı Bilgileri</h3>
      <ul>
        <li>Firma kodu ve firma adı</li>
        <li>Sunucu adresi</li>
        <li>Bağlantı anahtarı (kurulumun API anahtarı; kullanıcı tarafından girilir)</li>
        <li>Firmanın görünüm ayarları: marka rengi ve logo adresi</li>
        <li>Firmada açık olan modüller ve ekran görünürlük ayarları</li>
      </ul>

      <h3>Ticari Veriler</h3>
      <p>
        Aşağıdaki veriler işletmenin sunucusundan alınır ve ekranda gösterilir; uygulama bunları üretmez,
        değiştirmez ve başka bir yere göndermez. Hangi verilerin geleceği, firmada açık olan modüllere ve
        kullanıcının yetkisine göre değişir:
      </p>
      <ul>
        <li>Cari kod, unvan ve bakiye bilgisi</li>
        <li>Cari hareketler (ekstre): tarih, evrak bilgisi, borç / alacak tutarı ve yürüyen bakiye</li>
        <li>Stok kartları: ürün kodu, adı, miktarı ve fiyat bilgisi</li>
      </ul>
      <p>
        Kullanıcının hangi cari hesapları görebileceği <strong>sunucu tarafında</strong>, oturum jetonundaki
        kimlikten türetilir. Uygulama kapsam bilgisi göndermez; kapsam dışındaki bir kayıt için yapılan istek
        sunucu tarafından reddedilir.
      </p>

      <h3>Teknik Veriler</h3>
      <ul>
        <li>
          Uygulama kimliği ve uygulama sürümü. Her istekte <strong>yalnızca işletmenin kendi sunucusuna</strong>{" "}
          gönderilir; sunucunun asgari sürüm denetimi için gereklidir.
        </li>
        <li>
          Ağ bağlantısının durumu. Yalnızca cihazda okunur; &ldquo;internet yok&rdquo; ile &ldquo;sunucuya
          ulaşılamıyor&rdquo; hatalarını ayırmak için kullanılır ve hiçbir yere gönderilmez.
        </li>
      </ul>
      <p>
        Uygulama; kullanım analitiği, ekran izleme, telemetri ve çökme raporlama servisi{" "}
        <strong>kullanmaz</strong>. Cihaz modeli, işletim sistemi sürümü, reklam kimliği (IDFA) ve benzeri
        tanımlayıcılar toplanmaz.
      </p>

      <h3>İstenmeyen İzinler</h3>
      <p>
        Uygulama; konum, kamera, mikrofon, rehber, takvim, fotoğraf, sağlık ve sensör verilerine erişim{" "}
        <strong>talep etmez</strong> ve bu verileri toplamaz. App Tracking Transparency izni istenmez; uygulama
        izleme (tracking) yapmaz.
      </p>

      <h2>4. Cihazda Saklanan Veriler</h2>
      <p>
        Uygulamanın kalıcı olarak sakladığı tek veri, oturumun ve firma bağlantısının sürmesi için gereken
        bilgilerdir. Bunlar iki ayrı kasada, cihazın <strong>Anahtar Zinciri&apos;nde</strong> tutulur:
      </p>
      <ul>
        <li>
          <strong>Oturum kasası:</strong> kullanıcı adı, şifre, kullanıcı bilgileri ve oturum jetonu. Şifre,
          uygulamanın bir sonraki açılışında oturumun kendiliğinden sürmesi için saklanır; sunucuya ya da üçüncü
          bir tarafa gönderilmez ve çıkış yaptığınızda silinir.
        </li>
        <li>
          <strong>Firma kasası:</strong> firma kodu, firma adı, sunucu adresi, bağlantı anahtarı ve firmanın
          görünüm ayarları. Firma değiştirmek oturumu, çıkış yapmak firma bağlantısını silmesin diye ayrı tutulur.
        </li>
      </ul>
      <p>
        Her iki kasa da cihazın ilk açılışından sonra erişilebilir olacak ve <strong>yalnızca bu cihazda</strong>{" "}
        geçerli olacak şekilde işaretlenmiştir: kayıtlar iCloud Anahtar Zinciri ile eşitlenmez, cihaz yedeğine
        girmez ve yeni bir cihaza taşınmaz. Yeni cihazda kullanıcı firmasını yeniden bağlar ve yeniden giriş yapar.
      </p>
      <p>
        Ekranda gösterilen cari ve stok listeleri yalnızca <strong>bellekte</strong> önbelleklenir; uygulama
        kapandığında kaybolur. Bu veriler diske yazılmaz, dışa aktarılmaz ve başka uygulamalarla paylaşılmaz.
        Uygulama kaldırıldığında Anahtar Zinciri kayıtları dahil cihazdaki tüm veriler silinir.
      </p>

      <h2>5. Verilerin Kullanım Amaçları</h2>
      <ul>
        <li>Firma kurulumuna bağlanmak ve firmaya özgü yapılandırmayı (modüller, ekranlar, marka) uygulamak</li>
        <li>Kullanıcının kimliğini doğrulamak ve oturumu yönetmek</li>
        <li>Kullanıcıya yalnızca yetkisindeki cari hesapları ve ilgili verileri göstermek</li>
        <li>Cari ekstre, bakiye ve stok bilgilerini sunmak</li>
        <li>Rol tabanlı erişim kontrollerini uygulamak ve yetkisiz ekranları gizlemek</li>
        <li>Asgari uygulama sürümü denetimini yapabilmek</li>
      </ul>
      <p>
        Veriler; reklam gösterimi, reklam hedefleme, profilleme veya üçüncü taraf pazarlama amacıyla{" "}
        <strong>kullanılmaz</strong>.
      </p>

      <h2>6. Ağ İletişimi ve Güvenlik</h2>
      <ul>
        <li>
          Tüm sunucu iletişimi <strong>HTTPS (TLS)</strong> üzerinden yapılır. Sunucu adresini{" "}
          <code>http://</code> ile yazsanız bile adres https&apos;e çevrilir; şifresiz bağlantıya izin verilmez.
        </li>
        <li>
          İstekler, kurulumun bağlantı anahtarı ve oturum açan kullanıcı için süreli bir oturum jetonu ile
          yetkilendirilir.
        </li>
        <li>
          Sunucu yanıtları sistem ağ önbelleğine yazılmaz; her istek sunucudan taze veri alır. Böylece cihazda
          arta kalan bir yanıt kopyası oluşmaz.
        </li>
        <li>
          Oturum ve firma bilgileri, cihazın işletim sistemi tarafından korunan Anahtar Zinciri&apos;nde saklanır
          (bkz. Bölüm 4).
        </li>
        <li>
          Sunucu tarafında her istek, kullanıcının erişebileceği kayıt kümesine karşı doğrulanır; kapsam dışındaki
          bir kayıt için yapılan istek reddedilir.
        </li>
      </ul>

      <h2>7. Reklam, Analitik ve İzleme</h2>
      <p>
        Gümrah Saha&apos;da reklam gösterilmez; reklam ağı, sosyal medya takip SDK&apos;sı, kullanım analitiği ve
        çökme raporlama hizmeti <strong>kullanılmaz</strong>. Uygulama üçüncü taraf bir kütüphane içermediği için
        cihazınızdan hiçbir veri üçüncü bir tarafa akmaz.
      </p>
      <p>
        Apple Reklam Tanımlayıcısı (IDFA) toplanmaz ve App Tracking Transparency izni istenmez. Uygulamanın
        işlediği tek tanımlayıcı, kimlik doğrulama ve uygulama işlevselliği amacıyla kullanılan kullanıcı
        kimliğidir.
      </p>

      <h2>8. Üçüncü Taraflar</h2>
      <p>Uygulamanın veri paylaştığı üçüncü taraf yoktur. İlişkide olduğu taraflar şunlardır:</p>
      <ul>
        <li>
          <strong>Çalıştığınız işletme:</strong> Uygulamanın bağlandığı sunucu kurulumunun sahibi ve verilerin veri
          sorumlusudur. Verilerin saklanması ve işlenmesi bakımından o işletmenin kendi politikaları geçerlidir.
        </li>
        <li>
          <strong>Apple:</strong> Uygulamanın dağıtımı ve güncellenmesi App Store üzerinden yapılır. İndirme ve
          güncelleme işlemleriyle ilgili veriler Apple&apos;ın kendi politikalarına tabidir.
        </li>
      </ul>
      <p>Veriler pazarlama amacıyla üçüncü taraflara satılmaz veya devredilmez.</p>

      <h2>9. Veri Saklama Süresi</h2>
      <p>
        Cihazda saklanan oturum bilgileri, çıkış yaptığınızda silinir. Firma bağlantısı, firmayı değiştirene ya da
        uygulamayı kaldırana kadar cihazda kalır. Uygulama kaldırıldığında cihazdaki tüm yerel veriler (Anahtar
        Zinciri kayıtları dahil) silinir.
      </p>
      <p>
        Sunucu tarafındaki ticari, finansal ve operasyonel verilerin saklanma süresi, uygulamayı kullandığınız
        işletmenin kendi veri saklama politikalarına ve geçerli yasal yükümlülüklere (ör. ticari defter ve
        belgelerin saklanmasına ilişkin mevzuat) tabidir.
      </p>

      <h2>10. Hesap Oluşturma ve Kapatma</h2>
      <p>
        Uygulama üzerinden yeni hesap oluşturulamaz. Hesaplar, uygulamayı kullandığınız işletme tarafından
        tanımlanır. Hesabınızın kapatılmasını ya da erişiminizin durdurulmasını talep etmek için o işletmenin
        yetkilisine başvurmanız gerekir; geliştiricinin bu hesaplar üzerinde yetkisi ve erişimi yoktur.
      </p>

      <h2>11. Kullanıcı Hakları</h2>
      <p>Kullanıcılar:</p>
      <ul>
        <li>Uygulamadan çıkış yaparak cihazda saklanan oturum bilgilerini silebilir.</li>
        <li>Firma bağlantısını değiştirerek ya da uygulamayı kaldırarak cihazdaki tüm yerel verileri temizleyebilir.</li>
        <li>
          Kişisel verilerine erişim, düzeltme, silme ve işlemeye itiraz taleplerini veri sorumlusuna — yani
          uygulamayı kullandıkları işletmeye — iletebilir. Talepler ilgili mevzuat kapsamında değerlendirilir.
        </li>
      </ul>

      <h2>12. Çocukların Gizliliği</h2>
      <p>
        Bu uygulama yalnızca kurumsal kullanıcılara, işletmelerin yetkilendirdiği çalışanlara yöneliktir. 18 yaş
        altı bireylerden bilerek veri toplanmaz.
      </p>

      <h2>13. Politika Değişiklikleri</h2>
      <p>
        Bu Gizlilik Politikası, uygulamaya yeni modüller eklendikçe güncellenebilir. Güncellenmiş sürüm bu sayfada
        yayımlanır ve &ldquo;Yürürlük tarihi&rdquo; değiştirilir.
      </p>

      <h2>14. İletişim</h2>
      <p>
        <strong>Veri sorumlusu:</strong> Uygulamayı kullandığınız işletme. Hesabınızı açan yetkiliye ya da
        firmanızın sistem sorumlusuna başvurun.
      </p>
      <p>
        <strong>Geliştirici / Uygulama yayıncısı:</strong> Mehmet Gümrah<br />
        <strong>E-posta:</strong> <a href="mailto:support@mgumrah.com">support@mgumrah.com</a>
        <br />
        <strong>Web:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
      </p>
    </PrivacyDocument>
  );
}
