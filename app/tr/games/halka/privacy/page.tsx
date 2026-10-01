import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/halka/privacy",
  title: "Halka Gizlilik Politikası",
  description: "Halka oyunu için gizlilik politikası. Halka kişisel veri toplamaz; reklam, izleme ve analitik kullanmaz."
});

// App Store'a bildirilen gizlilik adresi. Oyuna reklam, analitik ya da gerçek parayla satın alma
// eklenirse bu metni, İngilizce karşılığını ve App Store'daki gizlilik beyanını (App Privacy) birlikte güncelleyin.
export default function TurkishHalkaPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="halka">
      <h2>Özet</h2>
      <p>
        Halka <strong>kişisel veri toplamaz.</strong> Hesap açmanız gerekmez; oyunda reklam, izleme
        (tracking) ve analitik <strong>yoktur.</strong> İlerlemeniz ve ayarlarınız yalnızca{" "}
        <strong>kendi cihazınızda</strong> saklanır, bize gönderilmez.
      </p>

      <h2>Cihazınızda saklanan bilgiler</h2>
      <p>Aşağıdakiler yalnızca cihazınızda tutulur ve cihazınızdan <strong>çıkmaz</strong>:</p>
      <ul>
        <li>
          <strong>Oyun ilerlemeniz:</strong> en yüksek skor, oyun içi altın, satın aldığınız
          renk/zırh/görünümler, başarımlar ve yerel skor tablosu.
        </li>
        <li>
          <strong>Ayarlarınız:</strong> dil, ses ve titreşim seviyesi.
        </li>
      </ul>
      <p>
        Uygulamayı sildiğinizde bu veriler de silinir. Cihaz yedeklemeniz açıksa işletim sisteminin
        kendi yedeğinde kalmaya devam edebilir.
      </p>

      <h2>Dünya skor tablosu (isteğe bağlı)</h2>
      <p>
        Oyunun dünya skor tablosu <strong>Apple Game Center</strong> üzerinden çalışır. Game Center&apos;da
        oturum açtıysanız en iyi skorunuz Apple&apos;a gönderilir ve Game Center&apos;ın kurallarına göre
        oyuncu adınızla gösterilir. Bu veriyi Apple kendi gizlilik politikasına göre işler; biz herhangi
        bir kişisel veri almayız.
      </p>

      <h2>İzinler</h2>
      <p>
        Halka kamera, mikrofon, konum, kişiler veya fotoğraflar gibi hiçbir izin istemez. Titreşim
        yalnızca cihazınızın titreşim motorunu yerel olarak çalıştırır.
      </p>

      <h2>Üçüncü taraflar</h2>
      <p>
        Bu sürümde üçüncü taraf reklam, analitik ya da izleme yazılımı yoktur. Oyun, MIT lisanslı Godot
        oyun motoruyla geliştirilmiştir; motor veri toplamaz. Kişisel verilerinizi kimseyle paylaşmayız —
        çünkü toplamıyoruz.
      </p>

      <h2>Çocukların gizliliği</h2>
      <p>
        Halka 13 yaşından küçük çocuklara özel olarak yönelik değildir ve çocuklardan bilerek veri
        toplamaz.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Oyuna reklam ya da gerçek parayla satın alma gibi özellikler eklenirse bu politika güncellenir;
        güncel sürüm bu sayfada yayımlanır ve &ldquo;Yürürlük tarihi&rdquo; değişir.
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
