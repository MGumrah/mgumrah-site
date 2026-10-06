import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/tugla/privacy",
  title: "Brick Ricochet Gizlilik Politikası",
  description:
    "Brick Ricochet oyunu için gizlilik politikası. Hesap gerekmez, ilerleme cihazınızda kalır; reklamları Google AdMob gösterir."
});

// App Store'a bildirilen gizlilik adresi. Bu metin, App Store Connect'teki gizlilik beyanıyla (App Privacy) AYNI olmalıdır:
// reklam ağı, onay formu (UMP), izleme izni (ATT), gerçek parayla satın alma ya da analitik değişirse bu metni, İngilizce
// karşılığını ve App Privacy cevaplarını birlikte güncelleyin. Bağımsız yedek: Oyunlar deposu, tugla/store/privacy.html.
export default function TurkishTuglaPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="tugla">
      <h2>Özet</h2>
      <p>
        Brick Ricochet hesap açmanızı istemez ve kişisel verilerinizi kendi sunucularımızda <strong>toplamaz</strong>.
        Oyun ücretsizdir ve <strong>Google AdMob</strong> reklamları içerir (isteğe bağlı ödüllü reklamlar ve
        oyunlar arasında ara sıra gösterilen reklamlar). Reklam gösterilirken Google, aşağıda anlatılan bazı
        verileri işler. Analitik ya da çökme raporlama yazılımı kullanmıyoruz.
      </p>

      <h2>Cihazınızda saklanan bilgiler</h2>
      <p>
        Oyun ilerlemeniz (en yüksek skor, oyun içi altın, satın alınan toplar/tuğla renkleri/temalar/yetenekler,
        başarımlar, yerel skor tablosu, yarım kalan oyun, reklam sıklığı ve bedava altın bekleme sayaçları) ve
        ayarlarınız (dil, ses ve titreşim seviyesi) yalnızca cihazınızda saklanır; bize gönderilmez.
        Uygulamayı sildiğinizde bu veriler de silinir (cihaz yedeklemeniz açıksa işletim sisteminin kendi
        yedeğinde kalabilir).
      </p>

      <h2>Reklamlar (Google AdMob)</h2>
      <p>
        Oyun, reklamları Google AdMob (Google Mobile Ads SDK) ile gösterir. Reklam gösterilirken Google’ın
        reklam yazılımı, Google’ın App Store veri açıklamasına göre şu bilgileri toplayabilir ve işleyebilir:
      </p>
      <ul>
        <li>
          <strong>IP adresiniz</strong> (cihazın genel konumunu tahmin etmek için);
        </li>
        <li>
          <strong>cihaz kimliği</strong> (reklam kimliğiniz ya da uygulama/geliştirici sınırlı cihaz kimlikleri);
        </li>
        <li>
          gördüğünüz <strong>reklamlar</strong>;
        </li>
        <li>
          reklamlarla <strong>etkileşiminiz</strong> (uygulama açma, video izleme gibi);
        </li>
        <li>
          <strong>performans verileri</strong> (uygulama açılış süresi, takılma oranı, enerji kullanımı) ve{" "}
          <strong>çökme günlükleri</strong>.
        </li>
      </ul>
      <p>
        Bu veriler reklam gösterme, reklam performansını iyileştirme, analitik ve yazılımı tanılama amaçlarıyla
        kullanılır ve reklam gösteren diğer kuruluşlarla paylaşılabilir.
      </p>
      <p>
        Bu kişisel verilere biz erişmeyiz; AdMob’da yalnızca toplu reklam istatistiklerini (gösterim, gelir)
        görürüz. Google bu verileri kendi gizlilik politikasına göre işler. Ayrıntılar için bkz.{" "}
        <a href="https://policies.google.com/privacy">Google Gizlilik Politikası</a> ve{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          Google, hizmetlerimizi kullanan sitelerdeki veya uygulamalardaki bilgileri nasıl kullanır?
        </a>
      </p>
      <p>
        <strong>Ödüllü reklamlar isteğe bağlıdır:</strong> izlemezseniz oyun tam olarak çalışır. Oyunlar
        arasında ara sıra gösterilen reklamlar hiçbir zaman oyun sırasında çıkmaz. Gösterilen reklamların içerik
        düzeyi genel izleyici (G) ile sınırlandırılmıştır.
      </p>

      <h2>İzleme izni ve onay tercihleriniz</h2>
      <p>
        <strong>iOS izleme izni (App Tracking Transparency):</strong> Reklam kimliğinizi kişiselleştirilmiş
        reklamlar göstermek için kullanabilmemiz için iOS sizden “İzleme” izni ister. Reddederseniz oyunu
        aynen oynarsınız; reklam kimliği kullanılmaz ve reklamlar kişiselleştirilmez. Tercihinizi istediğiniz
        zaman iOS <em>Ayarlar › Gizlilik ve Güvenlik › İzleme</em> bölümünden değiştirebilirsiniz.
      </p>
      <p>
        <strong>Onay formu (AB, Birleşik Krallık ve yasanın gerektirdiği diğer bölgeler):</strong> Bu
        bölgelerde Google’ın User Messaging Platform (UMP) onay formu gösterilir. Seçiminizi istediğiniz zaman
        oyunun Ayarlar ekranındaki <em>Gizlilik ayarları</em> düğmesinden (yalnızca bu bölgelerde görünür)
        değiştirebilirsiniz.
      </p>

      <h2>Dünya skor tablosu (isteğe bağlı)</h2>
      <p>
        Oyunun dünya skor tablosu <strong>Apple Game Center</strong> üzerinden çalışır. Game Center’da oturum
        açtıysanız en iyi skorunuz Apple’a gönderilir ve Game Center’ın kurallarına göre oyuncu adınızla
        gösterilir. Bu veriyi Apple kendi gizlilik politikasına göre işler; biz herhangi bir kişisel veri
        almayız.
      </p>

      <h2>İzinler</h2>
      <p>
        Brick Ricochet kamera, mikrofon, konum, kişiler veya fotoğraflar gibi hiçbir izin istemez; tek istisna, yukarıda
        anlatılan ve yalnızca reklamlar için olan iOS izleme izni isteğidir. Titreşim yalnızca cihazınızın
        titreşim motorunu yerel olarak çalıştırır.
      </p>

      <h2>Üçüncü taraflar</h2>
      <p>
        Bu sürümde üçüncü taraf olarak yalnızca <strong>Google AdMob</strong> (reklam; Google Mobile Ads SDK ve
        User Messaging Platform) ve isteğe bağlı <strong>Apple Game Center</strong> vardır. Oyun, MIT lisanslı
        Godot oyun motoruyla ve MIT lisanslı bir AdMob eklentisiyle geliştirilmiştir; motor veri toplamaz.
        Analitik, çökme raporlama ya da başka bir reklam ağı yoktur.
      </p>

      <h2>Çocukların gizliliği</h2>
      <p>
        Brick Ricochet 13 yaşından küçük çocuklara özel olarak yönelik değildir ve çocuklardan bilerek kişisel veri
        toplamaz. Gösterilen reklamlar genel izleyici (G) içerik düzeyiyle sınırlıdır.
      </p>

      <h2>Verilerinizle ilgili haklarınız</h2>
      <p>
        Biz sunucularımızda kişisel verinizi saklamadığımız için silinecek bir hesap ya da profil yoktur;
        cihazdaki oyun verisini uygulamayı silerek kaldırabilirsiniz. Google’ın reklamlar için işlediği
        verilerle ilgili haklarınız (erişim, silme, itiraz; AB/Birleşik Krallık’ta yasal haklarınız dahil) için
        Google’ın gizlilik araçlarını ve politikasını kullanabilirsiniz.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Oyuna analitik, gerçek parayla uygulama içi satın alma gibi özellikler eklenirse ya da reklam
        uygulamamız değişirse bu politika güncellenir; güncel sürüm bu sayfada yayımlanır ve “Yürürlük tarihi”
        değişir.
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
