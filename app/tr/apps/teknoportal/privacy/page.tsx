import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknoportal/privacy",
  title: "Tekno Portal Gizlilik Politikası",
  description: "Tekno Portal iOS, Android ve Windows uygulamaları için gizlilik politikası.",
  image: TEKNO_PORTAL_CARD
});

export default function TurkishTeknoPortalPrivacyPage() {
  return (
    <PrivacyDocument locale="tr" app="teknoportal">
      <p>
        Bu Gizlilik Politikası, Tekno Portal uygulamasının (&ldquo;Uygulama&rdquo;) kullanıcılarından hangi bilgileri
        işlediğini, bu bilgilerin hangi amaçlarla kullanıldığını, kimlerle paylaşılabileceğini ve nasıl korunduğunu
        açıklar. Politika; uygulamanın iOS, Android ve Windows sürümlerinin tamamı için geçerlidir.
      </p>
      <p>
        Tekno Portal, Tekno İklimlendirme müşterilerine yönelik bir B2B self-servis uygulamasıdır. Müşteri; kendi cari
        hesabını, bakiyesini, fatura ve ödeme hareketlerini, siparişlerini ve tekliflerini görüntüleyebilir, kart ile
        ödeme yapabilir ve kendi ürün kataloğundan sipariş oluşturabilir. Her hesap yalnızca kendi cari kümesindeki
        verilere erişir; başka bir müşterinin verisi görüntülenemez.
      </p>
      <p>
        Uygulama üzerinden hesap oluşturulamaz. Kullanıcı hesapları Tekno İklimlendirme tarafından tanımlanır ve
        kullanıcı adı ile şifre satış temsilcisi aracılığıyla iletilir.
      </p>

      <h2>1. Özet</h2>
      <ul>
        <li>Uygulamada reklam, reklam kimliği, üçüncü taraf izleme (tracking) veya analitik SDK&apos;sı bulunmaz.</li>
        <li>
          Yalnızca çökme teşhisi amacıyla Firebase Crashlytics kullanılır; kullanıcı adı, cari bilgileri, bakiye ve kart
          bilgileri bu servise iletilmez.
        </li>
        <li>Konum, kamera, mikrofon, rehber ve sensör izinleri istenmez.</li>
        <li>Kart bilgileri cihaza kaydedilmez; ödeme bankanın 3D Secure sayfasında tamamlanır.</li>
        <li>
          Oturum, cihazda şifreli olarak saklanan süreli bir erişim jetonuyla sürer. Windows ve iOS sürümlerinde, bir
          sonraki açılışta oturumunuzun kendiliğinden sürmesi için kullanıcı adınız ve şifreniz de cihazınızda şifreli
          olarak saklanır; sunucuya ya da üçüncü bir tarafa gönderilmez ve çıkış yaptığınızda silinir. Android
          sürümünde şifre cihazda saklanmaz.
        </li>
        <li>Profil altında kendiniz girdiğiniz IBAN ve adres kayıtları sunucuya gönderilmez, yalnızca cihazınızda kalır.</li>
        <li>Uygulamanın işlediği ticari veriler zaten sizin kendi cari hesabınıza ait verilerdir.</li>
      </ul>

      <h2>2. İşlenen Veriler</h2>

      <h3>Hesap ve Oturum Bilgileri</h3>
      <ul>
        <li>Kullanıcı adı ve şifre (giriş isteğinde sunucuya iletilir)</li>
        <li>Kullanıcı ID bilgisi, ad soyad ve rol bilgisi</li>
        <li>Hesaba bağlı cari kod ve erişim yetkileri</li>
        <li>Oturum jetonu ve jetonun geçerlilik süresi</li>
      </ul>
      <p>
        Oturum, güvenli bir erişim jetonu (token) ile cihazda yerel olarak tutulur. <strong>Windows ve iOS</strong>{" "}
        sürümlerinde, bir sonraki açılışta oturumunuzun kendiliğinden sürmesi için kullanıcı adınız ve şifreniz de
        cihazınızda saklanır: Windows sürümünde Windows veri koruma mekanizması (DPAPI) ile şifrelenir ve yalnızca aynı
        Windows kullanıcısı çözebilir; iOS sürümünde Anahtar Zinciri&apos;nde (Keychain) yalnızca bu cihazda geçerli
        olacak şekilde tutulur ve iCloud ile eşitlenmez. Her iki sürümde de bu bilgiler sunucuya ya da üçüncü bir tarafa
        gönderilmez ve çıkış yaptığınızda silinir. <strong>Android</strong> sürümünde şifre cihazda saklanmaz; orada
        oturum sürekliliği yalnızca süreli oturum jetonuyla sağlanır.
      </p>

      <h3>Cari ve Finansal Veriler</h3>
      <ul>
        <li>Cari kod, ticari unvan ve gösterim adı</li>
        <li>Bakiye, borç ve alacak durumu</li>
        <li>Cari hareket (ekstre) geçmişi</li>
        <li>Fatura bilgileri, fatura kalemleri ve fatura PDF belgeleri</li>
        <li>Tahsilat makbuzları ve geçmiş kart tahsilatlarının kayıtları</li>
        <li>Fatura künyesi: unvan, adres, ilçe, il, vergi dairesi, vergi numarası, telefon ve e-posta</li>
      </ul>
      <p>
        Fatura künyesi ekranında yalnızca <strong>adres, ilçe ve telefon</strong> alanları kullanıcı tarafından
        güncellenebilir. Unvan, vergi dairesi, vergi numarası ve il alanları uygulama üzerinden değiştirilemez.
      </p>

      <h3>Sipariş, Teklif ve Ürün Verileri</h3>
      <ul>
        <li>Kullanıcının kendi kataloğundaki ürün bilgileri ve ürüne özel fiyat sorguları</li>
        <li>Oluşturulan siparişler ve sipariş kalemleri</li>
        <li>Bekleyen siparişler ve teklif kayıtları</li>
        <li>Kullanıcının kendi geçmiş ürün (stok) hareketleri</li>
      </ul>
      <p>
        Sipariş isteği gövdesinde fiyat ve cari kod istemciden gönderilmez; her ikisi de sunucu tarafında türetilir.
        Her sepet için üretilen tek kullanımlık bir işlem kimliği, aynı siparişin ikinci kez kaydedilmesini engeller.
      </p>

      <h3>Kart ile Ödeme Verileri</h3>
      <ul>
        <li>Kart sahibi adı, kart numarası, son kullanma tarihi ve CVV (yalnızca ödeme anında)</li>
        <li>Ödeme tutarı, taksit sayısı ve ödemenin işleneceği cari hesap</li>
        <li>Ödeme sonucu: işlem numarası, tarih, tutar, banka onay kodu, kart tipi ve kart numarasının son dört hanesi</li>
      </ul>

      <h3>Yalnızca Cihazda Tutulan Veriler</h3>
      <ul>
        <li>
          <strong>Kendi IBAN ve konum kayıtlarınız.</strong> Profil bölümünde kendi elinizle girdiğiniz banka hesabı ve
          adres kayıtları <strong>sunucuya hiç gönderilmez</strong>; yalnızca uygulamanın cihazdaki özel alanında
          tutulur. Bu kayıtlar koordinat içermez; harita, yazdığınız adres metniyle aratılır.
        </li>
        <li>İndirilen ürün katalogları (PDF) ve görüntülenen ekstre, fatura, makbuz belgeleri</li>
        <li>Tamamlanmamış sipariş taslakları ve hesaplama araçlarındaki geçici girdiler</li>
        <li>&ldquo;Yenilikler&rdquo; ekranının gösterilip gösterilmediği gibi basit uygulama tercihleri</li>
      </ul>

      <h3>Teknik Veriler</h3>
      <ul>
        <li>Uygulama sürümü ve uygulama kimliği (sunucunun asgari sürüm denetimi için gönderilir)</li>
        <li>Ağ bağlantısının durumu (yalnızca cihazda okunur; &ldquo;internet yok&rdquo; ile &ldquo;sunucuya ulaşılamıyor&rdquo; hatalarını ayırmak için)</li>
        <li>
          Çökme anına ait teknik bilgiler: hata günlüğü (stack trace), cihaz modeli, işletim sistemi sürümü, uygulama
          sürümü ve çökme zamanı (yalnızca çökme raporlama servisine iletilir; bkz. Bölüm 5)
        </li>
      </ul>
      <p>
        Uygulama; kullanım analitiği, ekran izleme veya telemetri servisi <strong>kullanmaz</strong> ve reklam kimliği
        toplamaz. Cihaz modeli ile işletim sistemi sürümü yalnızca bir çökme meydana geldiğinde, hata teşhisi amacıyla
        çökme raporlama servisine iletilir; şirketin kendi sunucusuna gönderilmez.
      </p>

      <h3>İstenmeyen İzinler</h3>
      <p>
        Uygulama; konum, kamera, mikrofon, rehber, takvim, sağlık ve sensör verilerine erişim <strong>talep etmez</strong>{" "}
        ve bu verileri toplamaz. Android sürümünde yalnızca internet erişimi ve ağ durumu izinleri tanımlıdır.
        Uygulamada gösterilen harita bağlantıları, cihazın konumunu okumadan yalnızca adres metniyle harita uygulamasını
        açar.
      </p>

      <h2>3. Verilerin Kullanım Amaçları</h2>
      <ul>
        <li>Kullanıcının kimliğini doğrulamak ve oturumu yönetmek</li>
        <li>Kullanıcıya yalnızca kendi cari hesaplarına ait verileri göstermek</li>
        <li>Cari ekstre, bakiye, fatura ve tahsilat bilgilerini sunmak</li>
        <li>Sipariş ve teklif süreçlerini yürütmek</li>
        <li>Kart ile ödeme işlemini başlatmak, sonuçlandırmak ve tahsilat makbuzunu oluşturmak</li>
        <li>Ürün kataloglarını ve belgeleri indirip görüntülemek</li>
        <li>Vade farkı ve iskonto hesaplama araçlarını çalıştırmak</li>
        <li>Asgari uygulama sürümünü denetleyip gerektiğinde güncelleme uyarısı göstermek</li>
        <li>Yetki bazlı erişim kontrollerini uygulamak</li>
        <li>Uygulamanın kararlılığını izlemek; çökme kayıtlarını inceleyerek hataları teşhis edip gidermek</li>
      </ul>
      <p>
        Veriler; reklam gösterimi, reklam hedefleme, profilleme veya üçüncü taraf pazarlama amacıyla{" "}
        <strong>kullanılmaz</strong>.
      </p>

      <h2>4. Kart ile Ödeme ve 3D Secure</h2>
      <p>
        Kart ile ödeme, banka tarafından yürütülen 3D Secure akışıyla tamamlanır. Süreç şu şekilde işler:
      </p>
      <ul>
        <li>
          Kart bilgileri ödeme formuna girilir ve HTTPS üzerinden şirketin sunucusuna (
          <strong>api.teknoiklimlendirme.com</strong>) iletilir; sunucu bankanın sanal POS altyapısıyla 3D oturumunu
          başlatır.
        </li>
        <li>
          Doğrulama adımı, uygulama içindeki güvenli bir tarayıcı bileşeninde <strong>bankanın kendi sayfasında</strong>{" "}
          tamamlanır. SMS doğrulama kodu ve benzeri bilgiler bankaya aittir; uygulama bu bilgileri okumaz.
        </li>
        <li>
          Kart numarası, son kullanma tarihi ve CVV bilgisi <strong>cihazda hiçbir şekilde saklanmaz</strong>: diske
          yazılmaz, yedeklenmez, günlüklere (log) düşmez ve ekranlar arası geçişte kalıcı bir alanda tutulmaz. Bu
          bilgiler yalnızca ödeme isteği süresince bellekte bulunur ve istek gönderildikten sonra silinir.
        </li>
        <li>
          Ödeme tamamlandıktan sonra sunucu tarafında yalnızca işlem kaydı ve kart numarasının{" "}
          <strong>son dört hanesi</strong> saklanır. Tam kart numarası ve CVV saklanmaz.
        </li>
        <li>
          Kart bilgilerinin girildiği ve görüntülendiği ekranlarda ekran görüntüsü / ekran kaydı koruması{" "}
          <strong>platforma göre değişir</strong>: Android sürümünde ekran görüntüsü alınması engellenir; iOS sürümünde
          ekran kaydı veya yansıtma tespit edildiğinde hassas alanlar gizlenir (iOS&apos;ta ekran görüntüsünü engelleyen
          bir arayüz bulunmadığı için koruma kayıt ve yansıtmayla sınırlıdır).{" "}
          <strong>Windows sürümünde bu ekranlar için ekran görüntüsü veya ekran kaydı koruması bulunmaz.</strong>
        </li>
        <li>Uygulama, sonraki ödemelerde kullanılmak üzere kart saklama (kart kaydetme) özelliği sunmaz.</li>
      </ul>
      <p>
        &ldquo;Kartlarım&rdquo; ekranında listelenen kayıtlar, hesabınıza işlenmiş geçmiş tahsilat makbuzlarıdır; kart
        bilgisi değil, yalnızca tarih, tutar, taksit, banka ve varsa kartın son dört hanesi bilgisini içerir.
      </p>

      <h2>5. Reklam, Analitik ve İzleme</h2>
      <p>
        Tekno Portal&apos;da reklam gösterilmez; reklam ağı veya sosyal medya takip SDK&apos;sı{" "}
        <strong>kullanılmaz</strong>.
      </p>
      <p>
        Uygulama, kararlılığını izlemek amacıyla Google Firebase Crashlytics hizmetini kullanır. Bu hizmet; uygulama
        çökmesi anındaki hata günlüğünü (stack trace), cihaz modelini, işletim sistemi sürümünü, uygulama sürümünü ve
        çökme zamanını toplar. Toplanan bilgiler yalnızca hata teşhisi ve giderilmesi amacıyla kullanılır; kullanıcı
        adı, cari bilgileri, bakiye veya kart bilgileri bu kapsamda toplanmaz ve Crashlytics&apos;e iletilmez.
      </p>
      <p>
        Uygulama Firebase Analytics veya Firebase Cloud Messaging kullanmaz; reklam kimliği (Advertising ID) toplanmaz.
        Uygulamada push bildirimi altyapısı bulunmaz ve cihaz bildirim tokenı işlenmez.
      </p>
      <p>
        iOS sürümünde Apple Reklam Tanımlayıcısı (IDFA) toplanmaz ve App Tracking Transparency izni istenmez.
        Uygulamanın <strong>PrivacyInfo.xcprivacy</strong> dosyasında izleme (tracking) yapılmadığı beyan edilmiştir;
        beyan edilen tek veri türü, kimlik doğrulama ve uygulama işlevselliği amacıyla işlenen kullanıcı kimliğidir.
        Android sürümünde Google Play Hizmetleri reklam kimliği kullanılmaz.
      </p>

      <h2>6. Veri Aktarımı ve Paylaşımı</h2>
      <p>
        Uygulama; hesap, cari, finansal ve sipariş verilerini yalnızca şirketin kendi sunucusuna{" "}
        <strong>api.teknoiklimlendirme.com</strong> adresi üzerinden HTTPS protokolüyle iletir. Bunun tek istisnası,
        aşağıda belirtilen çökme raporlama hizmetine iletilen teknik hata verisidir. Veriler pazarlama amacıyla üçüncü
        taraflara satılmaz veya devredilmez.
      </p>
      <ul>
        <li>
          <strong>Bankalar ve sanal POS sağlayıcıları:</strong> Kart ile ödeme işlemi, ilgili bankanın 3D Secure
          altyapısı üzerinden gerçekleştirilir. Bu kapsamda kart ve işlem bilgileri bankaya iletilir; banka bu veriler
          bakımından kendi gizlilik politikası kapsamında ayrı bir veri sorumlusudur.
        </li>
        <li>
          <strong>Uygulama mağazaları:</strong> Uygulamanın dağıtımı ve güncellenmesi App Store, Google Play ve
          Microsoft Store üzerinden yapılır. İndirme ve güncelleme işlemleriyle ilgili veriler ilgili mağaza
          sağlayıcısının politikalarına tabidir.
        </li>
        <li>
          <strong>Harita uygulaması:</strong> Konum ekranındaki bağlantıya dokunulduğunda cihazın harita uygulaması
          adres metniyle açılır. Bu noktadan sonra ilgili harita sağlayıcısının gizlilik politikası geçerlidir; uygulama
          cihazın konumunu okumaz ve iletmez.
        </li>
        <li>
          <strong>Kilitlenme raporlama:</strong> Google Firebase Crashlytics (yalnızca teknik hata verisi; bkz. Bölüm
          5).
        </li>
      </ul>

      <h2>7. Veri Güvenliği</h2>
      <ul>
        <li>Tüm sunucu iletişimi HTTPS (TLS) üzerinden yapılır; şifresiz HTTP bağlantılarına izin verilmez.</li>
        <li>
          İstekler, sunucu tarafında doğrulanan bir API anahtarı (<strong>x-api-key</strong>) ve oturum açan kullanıcı
          için süreli bir oturum jetonu (<strong>Authorization: Bearer</strong>) ile yetkilendirilir.
        </li>
        <li>
          Oturum bilgileri platforma özgü güvenli depolarda tutulur: Android&apos;de şifreli tercih deposu, iOS&apos;ta
          Anahtar Zinciri (Keychain; yalnız bu cihazda geçerli, iCloud eşitlemesi kapalı), Windows&apos;ta işletim
          sisteminin veri koruma (DPAPI) mekanizması.
        </li>
        <li>
          Sessiz giriş için saklanan kullanıcı adı ve şifre, oturum jetonundan <strong>ayrı</strong> bir kayıtta tutulur
          ve ayrıca şifrelenir: Windows sürümünde ayrı bir dosyada, yine Windows veri koruma mekanizmasıyla (DPAPI) ve
          yalnızca aynı Windows kullanıcısı çözebilecek şekilde; iOS sürümünde ayrı bir Anahtar Zinciri kaydında ve
          yalnızca bu cihazda geçerli olacak şekilde. Çıkış yapıldığında bu kayıt silinir. Android sürümünde şifre hiç
          saklanmaz; oturum sürekliliği yalnızca süreli oturum jetonu ile sağlanır.
        </li>
        <li>
          Android sürümünde oturum bilgileri bulut yedeklemesinden ve cihaz transferinden hariç tutulur; iOS&apos;ta
          oturum jetonu iCloud ile eşitlenmez.
        </li>
        <li>
          Dosya paylaşımı sınırlı ve denetimlidir: yalnızca indirilen katalog ve belge klasörleri paylaşıma açıktır;
          oturum verilerinin bulunduğu alanlar paylaşılamaz.
        </li>
        <li>
          Sunucu tarafında her istek, kullanıcının erişebileceği cari kümesine karşı doğrulanır; kapsam dışındaki bir
          cari için yapılan istek reddedilir.
        </li>
      </ul>

      <h2>8. Veri Saklama Süresi</h2>
      <p>
        Cihazda saklanan oturum bilgileri, kullanıcı çıkış yaptığında veya oturum jetonunun süresi dolduğunda geçersiz
        hâle gelir; uygulama kaldırıldığında cihazdaki tüm yerel veriler silinir. Windows ve iOS sürümlerinde sessiz
        giriş için saklanan kullanıcı adı ve şifre, jetonun süresi dolmasıyla silinmez — sessiz girişin amacı tam olarak
        bu durumda oturumu sürdürmektir; bu kayıt çıkış yapıldığında silinir.
      </p>
      <p>
        İndirilen kataloglar cihazda kalıcı olarak tutulur; ekstre, fatura ve makbuz belgeleri geçici önbellekte
        tutulur ve işletim sistemi tarafından temizlenebilir.
      </p>
      <p>
        Profil altında kendi girdiğiniz IBAN ve adres kayıtları yalnızca cihazda tutulduğu için, uygulama kaldırıldığında
        veya cihaz değiştirildiğinde bu kayıtlar kaybolur; cihazlar arasında eşitlenmez.
      </p>
      <p>
        Sunucu tarafındaki ticari, finansal ve operasyonel veriler şirketin iç veri saklama politikalarına ve geçerli
        yasal yükümlülüklere (ör. ticari defter ve belgelerin saklanmasına ilişkin mevzuat) göre saklanır.
      </p>

      <h2>9. Hesap Oluşturma ve Kapatma</h2>
      <p>
        Uygulama üzerinden yeni hesap oluşturulamaz; hesaplar Tekno İklimlendirme tarafından tanımlanır. Hesabınızın
        kapatılmasını veya erişiminizin durdurulmasını talep etmek için satış temsilcinize ya da aşağıdaki iletişim
        adreslerine başvurabilirsiniz. Hesabın kapatılması, ticari ve mali kayıtların yasal saklama süreleri boyunca
        şirket sistemlerinde tutulmasına engel değildir.
      </p>

      <h2>10. Kullanıcı Hakları</h2>
      <p>Kullanıcılar:</p>
      <ul>
        <li>Uygulamadan çıkış yaparak cihazda saklanan oturum bilgilerini silebilir.</li>
        <li>Uygulamayı kaldırarak cihazdaki tüm yerel verileri temizleyebilir.</li>
        <li>Profil altında kendi girdikleri IBAN ve adres kayıtlarını istedikleri zaman silebilir.</li>
        <li>
          Kişisel verilerine erişim, düzeltme, silme ve işlemeye itiraz taleplerini veri sorumlusuna iletebilir.
          Talepler, ilgili mevzuat kapsamında değerlendirilir.
        </li>
      </ul>

      <h2>11. Çocukların Gizliliği</h2>
      <p>
        Bu uygulama yalnızca kurumsal müşterilerin yetkili kullanıcılarına yöneliktir. 18 yaş altı bireylerden bilerek
        veri toplanmaz.
      </p>

      <h2>12. Politika Değişiklikleri</h2>
      <p>
        Bu Gizlilik Politikası, uygulamaya yeni modüller eklendikçe güncellenebilir. Güncellenmiş sürüm bu sayfada
        yayımlanır ve &ldquo;Yürürlük tarihi&rdquo; değiştirilir. Önemli değişiklikler uygulama içinde veya şirketin
        resmi iletişim kanalları aracılığıyla duyurulabilir.
      </p>

      <h2>13. İletişim</h2>
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
