import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/gezegen/privacy",
  title: "Gezegen Gizlilik Politikası",
  description:
    "Gezegen: Planet Merge oyunu için gizlilik politikası. Hesap gerekmez, ilerleme cihazınızda kalır; reklamları Google AdMob gösterir."
});

// App Store'a bildirilen gizlilik adresi. Bu metin, App Store Connect'teki gizlilik beyanıyla (App Privacy) AYNI olmalıdır:
// reklam ağı, onay formu (UMP), izleme izni (ATT), gerçek parayla satın alma ya da analitik değişirse bu metni, İngilizce
// karşılığını ve App Privacy cevaplarını birlikte güncelleyin. Bağımsız yedek: Oyunlar deposu, gezegen/store/privacy.html.
export default function TurkishGezegenPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="gezegen">
      <h2>Özet</h2>
      <p>
        Gezegen için <strong>hesap açmanız gerekmez</strong> ve biz sizden doğrudan kişisel veri toplamayız;
        kendi sunucumuz yoktur. Oyun ücretsizdir ve <strong>reklam içerir</strong>: reklamlar Google AdMob
        tarafından gösterilir ve bu sırada Google, aşağıda anlatılan sınırlı veriyi toplayabilir. Sizi izleyen
        bir analitik yazılım kullanmayız.
      </p>

      <h2>Cihazınızda saklanan bilgiler</h2>
      <p>
        Aşağıdakiler yalnızca cihazınızda saklanır ve bize <strong>gönderilmez</strong>:
      </p>
      <ul>
        <li>
          <strong>Oyun ilerlemeniz:</strong> en yüksek skor, oyun içi altın, satın aldığınız kavanoz, gökyüzü ve
          gezegen stilleri ile yetenekler, başarımlar, yerel skor tablosu, yarım kalan oyun ve reklam sayaçları.
        </li>
        <li>
          <strong>Ayarlarınız:</strong> dil, ses ve titreşim seviyesi.
        </li>
      </ul>
      <p>
        Uygulamayı sildiğinizde bu veriler de silinir. Cihaz yedeklemeniz açıksa işletim sisteminin kendi
        yedeğinde kalmaya devam edebilir.
      </p>

      <h2>Reklamlar (Google AdMob)</h2>
      <p>
        Gezegen iki tür reklam gösterir: (1) isteğe bağlı <em>ödüllü reklamlar</em> — yalnızca bir düğmeye
        dokunursanız açılır ve karşılığında oyuna devam hakkı, turun altınını ikiye katlama ya da mağazada bedava
        altın verir; (2) turlar arasında, “Tekrar oyna”ya dokunduğunuzda seyrek gösterilen{" "}
        <em>tam ekran reklamlar</em>. Oyun sırasında reklam gösterilmez. Reklamlar Google’ın Mobile Ads SDK’sı ile
        gösterilir.
      </p>
      <p>Reklam hizmeti için Google’ın SDK’sı, Google’ın belgelerine göre şu bilgileri toplayabilir:</p>
      <ul>
        <li>
          IP adresinizden tahmin edilen <strong>yaklaşık konum</strong>;
        </li>
        <li>
          <strong>cihaz kimliği</strong> (izin verirseniz cihazın reklam kimliği, aksi halde uygulamaya veya
          geliştiriciye özgü cihaz tanımlayıcıları);
        </li>
        <li>
          gördüğünüz <strong>reklamlar</strong>;
        </li>
        <li>
          reklamlarla <strong>etkileşiminiz</strong> (ör. video izleme);
        </li>
        <li>
          uygulama <strong>çökme kayıtları</strong>, başlatma süresi gibi <strong>performans verileri</strong> ve
          diğer tanılama verileri.
        </li>
      </ul>
      <p>
        Bu veriler reklam gösterme ve ölçme, analitik ve SDK’nın hata ayıklaması amaçlarıyla kullanılır ve reklam
        sunumuna katılan diğer taraflarla paylaşılabilir. Bu verileri biz görmeyiz ve almayız; Google tarafından
        Google’ın gizlilik politikasına göre işlenir.
        Ayrıntılar için bkz. <a href="https://policies.google.com/privacy">Google Gizlilik Politikası</a> ve{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          Google, hizmetlerimizi kullanan sitelerdeki veya uygulamalardaki bilgileri nasıl kullanır?
        </a>
      </p>

      <h2>Onay ve izleme izni</h2>
      <p>
        Avrupa Ekonomik Alanı, Birleşik Krallık ve benzeri bölgelerde ilk açılışta Google’ın{" "}
        <strong>onay formu</strong> (User Messaging Platform) gösterilir; tercihinizi daha sonra{" "}
        <em>Ayarlar › Gizlilik ayarları</em> düğmesinden değiştirebilirsiniz (düğme yalnızca onay gerektiren
        bölgelerde görünür). Onay vermezseniz yalnızca sınırlı (kişiselleştirilmemiş) reklam gösterilir.
      </p>
      <p>
        iOS’ta ayrıca <strong>“İzleme izni” (App Tracking Transparency)</strong> penceresi gösterilebilir: izin
        verirseniz Google, cihazın reklam kimliğini kişiselleştirilmiş reklamlar için kullanabilir; izin
        vermezseniz reklam kimliği gönderilmez, reklamlar yine de gösterilir. Tercihinizi iOS{" "}
        <em>Ayarlar › Gizlilik ve Güvenlik › İzleme</em> bölümünden istediğiniz zaman değiştirebilirsiniz.
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
        Gezegen kamera, mikrofon, konum, kişiler veya fotoğraflar gibi hiçbir izin istemez (yukarıda anlatılan
        isteğe bağlı izleme izni hariç). Titreşim yalnızca cihazınızın titreşim motorunu yerel olarak çalıştırır.
      </p>

      <h2>Üçüncü taraflar</h2>
      <p>
        Bu sürümde üçüncü taraf olarak yalnızca <strong>Google AdMob</strong> (Google Mobile Ads SDK ve User
        Messaging Platform SDK) kullanılır; başka reklam ağı ya da analitik yazılımı yoktur. Oyun, MIT lisanslı
        Godot oyun motoruyla geliştirilmiştir; motor veri toplamaz.
      </p>

      <h2>Çocukların gizliliği</h2>
      <p>
        Gezegen 13 yaşından küçük çocuklara özel olarak yönelik değildir ve çocuklardan bilerek veri toplamaz.
        Gösterilen reklamların içerik derecesi en uygun düzeyle (genel izleyici) sınırlandırılır.
      </p>

      <h2>Haklarınız</h2>
      <p>
        Bizde sizinle ilişkilendirilmiş bir veri bulunmadığından silinecek ya da düzeltilecek bir kaydımız
        yoktur. Google’ın reklam amaçlı topladığı verilerle ilgili talepleriniz (erişim, silme, kişiselleştirmeyi
        kapatma) için Google’ın gizlilik araçlarını (<a href="https://myaccount.google.com/">Google Hesabım</a>{" "}
        ve yukarıdaki bağlantılar) ve cihazınızdaki izleme/reklam ayarlarını kullanabilirsiniz.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Oyuna gerçek parayla satın alma, yeni bir reklam ağı ya da analitik gibi özellikler eklenirse bu politika
        güncellenir; güncel sürüm bu sayfada yayımlanır ve “Yürürlük tarihi” değişir.
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
