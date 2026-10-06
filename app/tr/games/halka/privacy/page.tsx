import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/halka/privacy",
  title: "Halka Gizlilik Politikası",
  description:
    "Halka oyunu için gizlilik politikası. Hesap gerekmez, ilerleme cihazınızda kalır; reklamları Google AdMob gösterir."
});

// App Store'a bildirilen gizlilik adresi. Oyun 1.1'den beri Google AdMob ile reklam gösterir; bu metin, App Store
// Connect'teki gizlilik beyanıyla (App Privacy) AYNI olmalıdır: reklam ağı, onay formu (UMP), izleme izni (ATT),
// gerçek parayla satın alma ya da analitik değişirse bu metni, İngilizce karşılığını ve App Privacy cevaplarını
// birlikte güncelleyin. Bağımsız yedek: Oyunlar deposu, halka/store/privacy.html.
export default function TurkishHalkaPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="halka">
      <h2>Özet</h2>
      <p>
        Halka hesap açmanızı istemez; adınızı, e-posta adresinizi ya da konumunuzu{" "}
        <strong>biz toplamayız</strong> ve oyun ilerlemeniz yalnızca cihazınızda kalır. Ancak oyun{" "}
        <strong>Google AdMob</strong> ile reklam gösterir: reklamları sunmak ve ölçmek için Google; cihazınızdan
        reklam kimliğinizi (IDFA), IP adresinizi ve cihaz/kullanım verilerini alabilir. Reklam kimliğiniz
        yalnızca <strong>izin verirseniz</strong> kullanılır (iOS “izleme” izni; yasaların gerektirdiği
        bölgelerde ayrıca Google’ın onay formu). Ayrıntılar aşağıdadır.
      </p>

      <h2>Cihazınızda saklanan bilgiler</h2>
      <p>
        Oyun ilerlemeniz (en yüksek skor, oyun içi altın, satın alınan renk/zırh/görünümler, başarımlar, yerel
        skor tablosu), ayarlarınız (dil, ses ve titreşim seviyesi) ve reklam sıklığı sayaçları (son reklamın
        zamanı, günlük bedava altın sayısı gibi) yalnızca cihazınızda saklanır; bize gönderilmez. Uygulamayı
        sildiğinizde bu veriler de silinir (cihaz yedeklemeniz açıksa işletim sisteminin kendi yedeğinde
        kalabilir).
      </p>

      <h2>Reklamlar ve Google AdMob</h2>
      <p>
        Halka ücretsizdir ve reklamlarla desteklenir. Oyunda isteğe bağlı <strong>ödüllü reklamlar</strong>{" "}
        (izlerseniz ücretsiz devam, kazandığınız altını ikiye katlama ya da bedava altın gibi bir ödül
        kazanırsınız) ve tur aralarında seyrek gösterilen <strong>geçiş reklamları</strong> bulunur. Reklamları{" "}
        <strong>Google AdMob</strong> (Google Mobile Ads SDK) sunar.
      </p>
      <p>
        Bir reklam istendiğinde ve gösterildiğinde Google, Halka’nın içinden şu bilgileri alıp kendi gizlilik
        politikasına göre işleyebilir:
      </p>
      <ul>
        <li>
          <strong>Cihaz tanımlayıcıları:</strong> reklam kimliğiniz (IDFA; yalnızca izin verirseniz) ya da
          uygulamaya/geliştiriciye özgü cihaz tanımlayıcıları;
        </li>
        <li>
          <strong>IP adresiniz:</strong> cihazın yaklaşık konumunu tahmin etmek için kullanılabilir (oyun konum
          izni istemediği için hassas konum alınmaz);
        </li>
        <li>
          <strong>Reklam ve kullanım verileri:</strong> hangi reklamların gösterildiği ve reklamlarla
          etkileşiminiz (örn. dokunma, video izleme);
        </li>
        <li>
          <strong>Tanılama verileri:</strong> çökme kayıtları ve başlatma süresi, donma oranı, enerji kullanımı
          gibi performans verileri.
        </li>
      </ul>
      <p>
        Bu veriler; reklam göstermek (kişiselleştirilmiş ya da kişiselleştirilmemiş), reklamların performansını
        ölçmek, analitik yapmak ve reklam yazılımını tanılayıp iyileştirmek için kullanılır. Biz bu verilere
        erişmeyiz; AdMob bize yalnızca toplu raporlar (gösterim sayısı, kazanç gibi) sunar, sizi tanıtan bilgi
        vermez. Google’ın verileri nasıl kullandığı için bkz.{" "}
        <a href="https://policies.google.com/privacy">Google Gizlilik Politikası</a> ve{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          Google, hizmetlerimizi kullanan sitelerdeki veya uygulamalardaki bilgileri nasıl kullanır?
        </a>
      </p>

      <h2>Seçimleriniz: izleme izni ve onay</h2>
      <p>
        <strong>iOS izleme izni.</strong> Oyun, reklam kimliğinizi kullanabilmek için iOS’un “Uygulama İzleme
        Şeffaflığı” penceresiyle sizden izin ister (öncesinde Google’ın kısa bir açıklama mesajı görünebilir).
        İzin verirseniz Google, reklam kimliğinizi başka uygulama ve sitelerden elde ettiği verilerle
        ilişkilendirerek kişiselleştirilmiş reklam göstermek ve reklam ölçümü yapmak için kullanabilir; Apple
        buna “izleme” der. İzin vermezseniz reklam isteklerine reklam kimliğiniz eklenmez; oyun ve ödüllü
        reklamlar aynı şekilde çalışır. İzninizi istediğiniz zaman{" "}
        <em>Ayarlar › Gizlilik ve Güvenlik › İzleme</em> bölümünden değiştirebilirsiniz.
      </p>
      <p>
        <strong>
          Onay formu (Avrupa Ekonomik Alanı, Birleşik Krallık ve yasaların gerektirdiği diğer bölgeler).
        </strong>{" "}
        Bu bölgelerde reklam gösterilmeden önce Google’ın onay formu (User Messaging Platform) açılır; reklam
        amaçlı veri kullanımını kabul edebilir, reddedebilir ya da seçeneklerinizi yönetebilirsiniz.
        Reddederseniz yalnızca kişiselleştirilmemiş reklam gösterilir. Kişiselleştirilmiş reklamların hukuki
        dayanağı onayınızdır; kararınızı istediğiniz zaman oyunda <em>Ayarlar › Gizlilik ayarları</em>{" "}
        düğmesiyle değiştirebilir ya da onayınızı geri çekebilirsiniz (düğme yalnızca bu bölgelerde görünür).
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
        Halka kamera, mikrofon, konum, kişiler veya fotoğraflar gibi hiçbir izin istemez. Tek istisna, yukarıda
        anlatılan iOS “izleme” iznidir (reklam kimliği için; reddedebilirsiniz). Titreşim yalnızca cihazınızın
        titreşim motorunu yerel olarak çalıştırır.
      </p>

      <h2>Üçüncü taraflar</h2>
      <p>
        Halka şu üçüncü taraf yazılımları içerir: <strong>Google Mobile Ads SDK</strong> (AdMob reklamları) ve{" "}
        <strong>Google User Messaging Platform SDK</strong> (onay formu). İkisi de Google’a aittir ve yukarıdaki
        verileri Google’ın kendi gizlilik politikasına göre işler. Skor tablosu için Apple Game Center
        kullanılır (yukarıya bakın). Oyun, MIT lisanslı Godot oyun motoruyla geliştirilmiştir; motor veri
        toplamaz. Başka bir reklam ağı, analitik ya da izleme yazılımı yoktur.
      </p>

      <h2>Çocukların gizliliği</h2>
      <p>
        Halka 13 yaşından küçük çocuklara özel olarak yönelik değildir ve çocuklardan bilerek kişisel veri
        toplamaz. Oyunda şiddet, kumar ya da yetişkin içeriği olmadığı için App Store’da 4+ olarak
        derecelendirilmiştir; bu, oyunun çocuklara yönelik olduğu anlamına gelmez. Reklam isteklerinde,
        Google’ın içerik sınıflandırmasına göre en çok “G” (genel izleyici) düzeyindeki reklamlar istenir. 13
        yaşından küçükseniz (ya da bulunduğunuz yerde dijital rıza yaşı daha yüksekse) izleme ve onay
        isteklerini ebeveyninizle birlikte yanıtlayın. Çocuğunuzun bize veri sağladığını düşünüyorsanız{" "}
        <a href="mailto:support@mgumrah.com">support@mgumrah.com</a> adresine yazın.
      </p>

      <h2>Haklarınız</h2>
      <p>
        Yaşadığınız yere göre (örneğin Türkiye’de KVKK, Avrupa Ekonomik Alanı ve Birleşik Krallık’ta GDPR)
        verilerinize erişme, düzeltme, silme, işlenmesine itiraz etme ve onayı geri çekme gibi haklarınız
        olabilir. Halka’nın cihazınızda tuttuğu bilgileri uygulamayı silerek silebilirsiniz; geliştirici olarak
        sunucularımızda sizinle ilgili veri tutmayız. Reklam amaçlı olarak Google’ın işlediği veriler için bu
        hakları Google’ın sunduğu araçlarla (Google Gizlilik Politikası’ndaki bağlantılar) kullanabilirsiniz;
        sorularınız için bize de yazabilirsiniz.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Oyuna yeni bir reklam ağı, analitik ya da uygulama içi satın alma gibi özellikler eklenirse ya da veri
        kullanımımız değişirse bu politika güncellenir; güncel sürüm bu sayfada yayımlanır ve “Yürürlük
        tarihi” değişir.
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
