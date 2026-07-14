import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/tomar/privacy",
  title: "Tomar Gizlilik Politikası",
  description: "Tomar masaüstü PDF uygulaması için gizlilik politikası. Tomar hiçbir kişisel veri toplamaz."
});

export default function TurkishTomarPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="tomar">
      <h2>Özet</h2>
      <p>
        Tomar <strong>hiçbir kişisel veri toplamaz, saklamaz veya sunuculara iletmez.</strong> PDF
        dosyalarınız yalnızca <strong>kendi cihazınızda, yerel olarak</strong> işlenir; hiçbir zaman
        internete yüklenmez. Uygulamada reklam, izleme (tracking), analitik veya telemetri{" "}
        <strong>yoktur.</strong>
      </p>

      <h2>Cihazınızda kalan veriler</h2>
      <p>Tomar tüm işini yerelde yapar. Aşağıdakiler cihazınızdan <strong>çıkmaz</strong>:</p>
      <ul>
        <li>
          <strong>Açtığınız ve düzenlediğiniz PDF / görüntü dosyaları.</strong> Yalnızca sizin
          başlattığınız işlemler (kaydet, dışa aktar, yazdır) için, sizin seçtiğiniz konumda kullanılır.
        </li>
        <li>
          <strong>Uygulama ayarları</strong> (örn. varsayılan kayıt klasörü, görünüm tercihleri).
          Windows kayıt defterinde (registry) yerel olarak, yalnızca sizin kullanıcı hesabınız
          (<code>HKEY_CURRENT_USER</code>) altında tutulur.
        </li>
      </ul>

      <h2>Yerel sistem değişiklikleri (veri toplama değildir)</h2>
      <p>
        Tomar, düzgün çalışmak için yerel Windows kayıt defterine yazar. Bunlar{" "}
        <strong>cihazınızdaki ayarlardır, kişisel veri toplama değildir</strong> ve hiçbir yere
        gönderilmez:
      </p>
      <ul>
        <li>
          <strong>.pdf dosya ilişkilendirmesi:</strong> Tomar&apos;ı PDF açabilen uygulamalar arasına
          eklemek için.
        </li>
        <li>
          <strong>Hızlı açılış / girişte başlatma:</strong> İsteğe bağlı olarak, Tomar&apos;ın açılışta
          arka planda hazır beklemesi için (menüden kapatabilirsiniz).
        </li>
      </ul>
      <p>
        Not: Microsoft Store&apos;dan kurulan sürümde bu ayarlar, uygulama paketinin kendi yalıtılmış
        alanı üzerinden yönetilir.
      </p>

      <h2>Güncelleme denetimi (yalnızca doğrudan indirilen sürüm)</h2>
      <p>
        Web sitesinden doğrudan indirilen sürüm, yeni bir sürüm olup olmadığını denetlemek için
        güncelleme sunucusuna (<code>dl.tomar.app</code>) bağlanabilir. Bu istek sırasında, herhangi bir
        internet isteğinde olduğu gibi <strong>IP adresiniz</strong> ve{" "}
        <strong>mevcut uygulama sürümünüz</strong> iletilir. Bu bilgiler bir sürüm dosyasını sunmak için
        kullanılır; <strong>saklanmaz, profillenmez, üçüncü taraflarla paylaşılmaz.</strong> Microsoft
        Store sürümünde güncellemeler Store tarafından yönetilir ve bu denetim yapılmaz.
      </p>

      <h2>Üçüncü taraflar</h2>
      <p>
        Tomar hiçbir üçüncü taraf analitik, reklam veya izleme hizmeti içermez. Kişisel verilerinizi
        kimseyle paylaşmayız — çünkü toplamıyoruz.
      </p>

      <h2>Çocukların gizliliği</h2>
      <p>Tomar çocuklara yönelik değildir ve bilerek hiç kimseden kişisel veri toplamaz.</p>

      <h2>Değişiklikler</h2>
      <p>
        Bu politikada değişiklik olursa güncellenmiş sürüm bu sayfada yayımlanır ve
        &ldquo;Yürürlük tarihi&rdquo; güncellenir.
      </p>

      <h2>İletişim</h2>
      <p>
        <strong>Geliştirici / Veri sorumlusu:</strong> Mehmet Gümrah<br />
        <strong>E-posta:</strong> <a href="mailto:support@mgumrah.com">support@mgumrah.com</a>
        <br />
        <strong>Web:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
      </p>
    </PrivacyDocument>
  );
}
