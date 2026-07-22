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
          Yalnızca sizin kullanıcı hesabınız altında, yerel olarak tutulur.
        </li>
      </ul>

      <h2>Yerel sistem değişiklikleri (veri toplama değildir)</h2>
      <p>
        Microsoft Store sürümünde Tomar, sistem genelinde kayıt defteri (registry) değişikliği{" "}
        <strong>yapmaz</strong>:
      </p>
      <ul>
        <li>
          <strong>.pdf dosya ilişkilendirmesi</strong> uygulama paketinin manifestinde bildirilir;
          kurulmasını ve kaldırılmasını Windows yönetir.
        </li>
        <li>
          <strong>Girişte otomatik başlatma</strong>{" "}
          Store sürümünde bulunmaz; Ayarlar&apos;daki ilgili seçenek devre dışıdır ve sizi Windows
          Başlangıç ayarlarına yönlendirir.
        </li>
      </ul>

      <h2>Ağ erişimi ve güncellemeler</h2>
      <p>
        Tomar <strong>hiçbir internet bağlantısı kurmaz.</strong> Uygulamada güncelleme denetimi, sürüm
        sorgusu, analitik ucu veya herhangi bir HTTP istemcisi bulunmaz; bu nedenle IP adresiniz dahil
        hiçbir bilgi cihazınızdan çıkmaz.
      </p>
      <p>
        Tomar yalnızca Microsoft Store üzerinden dağıtılır; sürüm yükseltmelerini Store&apos;un kendi
        güncelleme mekanizması getirir.
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
