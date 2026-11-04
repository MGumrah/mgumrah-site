import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/games/arena2d/privacy",
  title: "ARENA 2D Gizlilik Politikası",
  description:
    "ARENA 2D oyunu için gizlilik politikası. Hesap gerekmez, ilerleme cihazınızda kalır; reklamları Unity LevelPlay ve bağlı reklam ağları gösterir, satın alımları Apple işler."
});

// App Store'a bildirilen gizlilik adresi (oyundaki GİZLİLİK POLİTİKASI düğmesi de buraya açılır: oyun deposunda
// AppLinks.PrivacyPolicyUrl). Bu metin, App Store Connect'teki gizlilik beyanıyla (App Privacy) AYNI olmalıdır; o cevaplar
// Unity LevelPlay'in veri tablosuna ve iOS izleme iznine (ATT) göre verilir: cihaz kimliği (yalnızca ATT izniyle) izleme
// amaçlıdır; reklam verisi, ürün etkileşimi (ortaklar paylaşırsa) ve performans verisi toplanır; hiçbiri bizim tarafımızdan
// kimliğinize bağlanmaz. Reklam aracı ya da bağlı ağlar, ATT, AB/UK/İsviçre reklam desteği penceresi, uygulama içi satın
// alma (Unity IAP / Apple) ya da analitik değişirse bu metni, İngilizce karşılığını ve App Privacy cevaplarını birlikte
// güncelleyin. Oyun deposundaki Release/privacy-policy.html yalnızca ilk şablondur; geçerli metin buradakidir.
export default function TurkishArena2dPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="arena2d">
      <h2>Özet</h2>
      <p>
        ARENA 2D hesap açmanızı istemez; adınızı, e-posta adresinizi ya da konumunuzu{" "}
        <strong>biz toplamayız</strong> ve oyun ilerlemeniz yalnızca cihazınızda kalır. Ancak oyun reklam
        gösterir: reklamları <strong>Unity LevelPlay</strong> reklam aracı hizmeti ve ona bağlı reklam ağları
        sunar; bu ortaklar reklamları göstermek ve ölçmek için cihazınızdan reklam kimliğinizi (IDFA), IP
        adresinizi ve cihaz/uygulama/kullanım verilerini alabilir. Reklam kimliğiniz yalnızca{" "}
        <strong>izin verirseniz</strong> kullanılır (iOS “izleme” izni; Avrupa Ekonomik Alanı, Birleşik Krallık
        ve İsviçre’de ayrıca oyunun reklam desteği onayı). Satın alımları Apple işler; ödeme bilgileriniz bize
        ulaşmaz. Ayrıntılar aşağıdadır.
      </p>

      <h2>Cihazınızda saklanan bilgiler</h2>
      <p>
        Oyun ilerlemeniz (altın, geliştirmeler, açılan görünümler, en yüksek skor ve rekor listesi, günlük görev
        ve başarımlar, günlük ödül seriniz), ayarlarınız (dil, müzik ve ses seviyesi, titreşim), reklam onayı
        cevabınız, reklam sıklığı sayaçları (son reklamın zamanı, günlük bedava altın sayısı gibi) ve “Reklamsız”
        gibi kalıcı bir ürünü satın alıp almadığınız yalnızca cihazınızda saklanır; bize gönderilmez. Uygulamayı
        sildiğinizde bu veriler de silinir (cihaz yedeklemeniz açıksa işletim sisteminin kendi yedeğinde
        kalabilir).
      </p>

      <h2>Reklamlar ve Unity LevelPlay</h2>
      <p>
        ARENA 2D ücretsizdir ve reklamlarla desteklenir. Oyunda isteğe bağlı <strong>ödüllü videolar</strong>{" "}
        (izlerseniz ücretsiz devam, kazandığınız altını ikiye katlama, bedava altın ya da günlük ödülü ikiye
        katlama gibi bir ödül kazanırsınız) ve koşular arasında seyrek gösterilen tam ekran{" "}
        <strong>geçiş reklamları</strong> bulunur; oyun sırasında reklam gösterilmez ve banner reklam yoktur.
        Reklamları <strong>Unity LevelPlay</strong> reklam aracı hizmeti (LevelPlay SDK) ve ona bağlı reklam
        ağları (iş ortakları) sunar; bağlı ağların listesi zamanla değişebilir.
      </p>
      <p>
        Bir reklam istendiğinde ve gösterildiğinde bu ortaklar, ARENA 2D’nin içinden şu bilgileri alıp kendi
        gizlilik politikalarına göre işleyebilir:
      </p>
      <ul>
        <li>
          <strong>Cihaz tanımlayıcıları:</strong> reklam kimliğiniz (IDFA; yalnızca izin verirseniz) ve
          uygulamaya/geliştiriciye özgü cihaz tanımlayıcıları;
        </li>
        <li>
          <strong>IP adresiniz ve yaklaşık konum:</strong> IP adresinden türetilen genel konum (oyun konum izni
          istemediği için hassas konum alınmaz);
        </li>
        <li>
          <strong>Cihaz ve uygulama bilgileri:</strong> cihaz modeli, işletim sistemi sürümü, dil, uygulama
          sürümü ve ağ türü gibi;
        </li>
        <li>
          <strong>Reklam verileri:</strong> hangi reklamların gösterildiği ve reklamlarla etkileşiminiz (örn.
          dokunma, video izleme ya da tamamlama);
        </li>
        <li>
          <strong>Uygulama etkileşimi:</strong> reklam ortaklarının paylaştığı ölçüde, uygulamayı nasıl
          kullandığınıza dair bilgiler (örn. açılış, dokunma);
        </li>
        <li>
          <strong>Performans ve tanılama verileri:</strong> çökme kayıtları ve başlatma süresi gibi performans
          verileri.
        </li>
      </ul>
      <p>
        Bu veriler; reklam göstermek (kişiselleştirilmiş ya da kişiselleştirilmemiş), reklamların performansını
        ölçmek, sahtekârlığı önlemek, analitik yapmak ve reklam yazılımını tanılayıp iyileştirmek için
        kullanılır. Biz bu verilere erişmeyiz ve reklam ortaklarına sizi adınızla ya da e-posta adresinizle
        tanıtan hiçbir şey göndermeyiz; LevelPlay bize yalnızca toplu raporlar (gösterim sayısı, kazanç gibi)
        sunar. Bu ortaklar verileri bulunduğunuz ülkenin dışında da işleyebilir; bunun için kendi
        politikalarındaki güvenceler geçerlidir. Verilerin nasıl kullanıldığı için bkz.{" "}
        <a href="https://unity.com/legal/privacy-policy">Unity Gizlilik Politikası</a> ve{" "}
        <a href="https://unity.com/legal/game-player-and-app-user-privacy-policy">
          Unity Oyuncu ve Uygulama Kullanıcısı Gizlilik Politikası
        </a>
        .
      </p>

      <h2>Seçimleriniz: izleme izni ve reklam onayı</h2>
      <p>
        <strong>iOS izleme izni.</strong> Oyun, reklam kimliğinizi (IDFA) reklam ortaklarıyla paylaşabilmek için
        iOS’un “Uygulama İzleme Şeffaflığı” penceresiyle sizden izin ister (ilk açılışta, bir kez). İzin
        verirseniz reklam ortakları, reklam kimliğinizi başka uygulama ve sitelerden elde ettikleri verilerle
        ilişkilendirerek kişiselleştirilmiş reklam göstermek, reklam ölçümü yapmak ve sahtekârlığı önlemek için
        kullanabilir; Apple buna “izleme” der. İzin vermezseniz reklam isteklerine reklam kimliğiniz eklenmez;
        oyun ve ödüllü videolar aynı şekilde çalışır, yalnızca reklamlar daha az kişiselleştirilir. İzninizi
        istediğiniz zaman <em>Ayarlar › Gizlilik ve Güvenlik › İzleme</em> bölümünden değiştirebilirsiniz.
      </p>
      <p>
        <strong>Reklam desteği onayı (Avrupa Ekonomik Alanı, Birleşik Krallık ve İsviçre).</strong> Bu
        bölgelerde (ve oyun cihazınızın hangi ülkede olduğunu belirleyemezse, temkinli olmak için) oyun, hiçbir
        reklam hizmeti başlamadan önce sizden “REKLAM DESTEĞİ” penceresiyle izin ister: İZİN VER ya da HAYIR’ı
        seçersiniz. HAYIR derseniz reklam yazılımı hiç başlatılmaz: reklam gösterilmez, ödüllü videolar
        sunulmaz ve reklam ortaklarına hiçbir veri gönderilmez; oyun yine de tamamen oynanır. Reklam amaçlı veri
        işlemenin hukuki dayanağı onayınızdır; kararınızı istediğiniz zaman oyunda{" "}
        <em>Ayarlar › Reklam desteği</em> anahtarıyla değiştirebilir ya da onayınızı geri çekebilirsiniz
        (anahtar yalnızca bu bölgelerde görünür). Onayı geri çekmek, geri çekmeden önce yapılan işlemlerin
        hukuka uygunluğunu etkilemez.
      </p>

      <h2>Satın alımlar</h2>
      <p>
        Oyunda isteğe bağlı uygulama içi satın alımlar vardır (altın paketleri, başlangıç paketi ve
        “Reklamsız”). Satın alımları <strong>Apple</strong> (App Store) işler; kart ya da ödeme bilgileriniz
        bize hiç ulaşmaz. Mağaza, ürünü verebilmemiz için oyuna yalnızca satın alımın tamamlanıp tamamlanmadığını
        (geri yüklemede hangi kalıcı ürünlere sahip olduğunuzu) bildirir; ödeme geçmişinizi sunucularımızda
        tutmayız. “Reklamsız”ı satın alırsanız zorunlu (tam ekran) reklamlar kalkar; isteğe bağlı ödüllü
        videolar, izlemeyi seçerseniz kullanılabilir kalır.
      </p>

      <h2>İzinler</h2>
      <p>
        ARENA 2D kamera, mikrofon, konum, kişiler veya fotoğraflar gibi hiçbir izin istemez. Tek istisna,
        yukarıda anlatılan iOS “izleme” iznidir (reklam kimliği için; reddedebilirsiniz). Titreşim yalnızca
        cihazınızın titreşim motorunu yerel olarak çalıştırır.
      </p>

      <h2>Üçüncü taraflar</h2>
      <p>
        ARENA 2D şu üçüncü taraf yazılımları içerir: <strong>Unity LevelPlay SDK</strong> (reklamlar; bağlı
        reklam ağlarının yazılım bileşenlerini de içerebilir) ve <strong>Unity In-App Purchasing</strong>{" "}
        (satın alımlar için App Store bağlantısı). Oyun, <strong>Unity</strong> oyun motoruyla geliştirilmiştir.
        LevelPlay ve bağlı ağlar yukarıda anlatılan reklam verilerini kendi gizlilik politikalarına göre işler;
        satın alımları Apple işler (yukarıya bakın). Biz ayrıca başka bir reklam ağı, analitik, çökme raporlama
        ya da izleme yazılımı eklemedik.
      </p>

      <h2>Çocukların gizliliği</h2>
      <p>
        ARENA 2D 13 yaşından (Avrupa Ekonomik Alanı’nda 16 yaşından) küçük çocuklara yönelik değildir ve
        çocuklardan bilerek kişisel veri toplamaz. Oyunda çizgi film tarzı, silahlı aksiyon (düşmanlara ateş
        etme) bulunur; ayrıca reklam ve isteğe bağlı satın alımlar içerir. Bu yaşın altındaysanız (ya da
        bulunduğunuz yerde dijital rıza yaşı daha yüksekse) izleme ve onay isteklerini ebeveyninizle birlikte
        yanıtlayın. Bir çocuğun bize ya da reklam ortaklarına veri sağladığını düşünüyorsanız{" "}
        <a href="mailto:support@mgumrah.com">support@mgumrah.com</a> adresine yazın; yardımcı oluruz.
      </p>

      <h2>Haklarınız</h2>
      <p>
        Yaşadığınız yere göre (örneğin Türkiye’de KVKK, Avrupa Ekonomik Alanı’nda GDPR, Birleşik Krallık’ta UK
        GDPR) verilerinize erişme, düzeltme, silme, işlenmesine itiraz etme ve onayı geri çekme gibi haklarınız
        olabilir; ayrıca bulunduğunuz yerdeki veri koruma otoritesine şikâyette bulunabilirsiniz. ARENA 2D’nin
        cihazınızda tuttuğu bilgileri uygulamayı silerek silebilirsiniz; geliştirici olarak sunucularımızda
        sizinle ilgili veri tutmayız. Reklam amaçlı olarak reklam ortaklarının işlediği veriler için bu hakları
        ilgili ortakların sunduğu araçlarla (Unity Gizlilik Politikası’ndaki bağlantılar) kullanabilirsiniz;
        sorularınız için bize de yazabilirsiniz, sizi doğru yere yönlendiririz.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Oyuna yeni bir reklam ağı, analitik ya da başka bir veri toplayan özellik eklenirse ya da veri
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
