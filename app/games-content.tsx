import Link from "next/link";
import type { Locale } from "./locale";
import { links } from "./site-config";

const copy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbGames: "Oyunlar",
    gamesTitle: "Oyunlar",
    gamesIntro: "Geliştirdiğim oyunlar burada toplanacak.",
    gamesListLabel: "Oyun listesi",
    cardEyebrow: "Yeni bölüm",
    cardName: "İlk oyun yolda",
    cardBody: "Bu sayfa hazır; oyunlar hazır oldukça buraya eklenecek.",
    soon: "Yakında"
  },
  en: {
    crumbHome: "Home",
    crumbGames: "Games",
    gamesTitle: "Games",
    gamesIntro: "The games I build will live here.",
    gamesListLabel: "Game list",
    cardEyebrow: "New section",
    cardName: "First game on the way",
    cardBody: "This page is ready; games will be added here as they are finished.",
    soon: "Coming soon"
  }
};

export function GamesIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <span>{t.crumbGames}</span>
        </div>
        <h1>{t.gamesTitle}</h1>
        <p className="meta">{t.gamesIntro}</p>
      </header>

      <section className="feat-grid" aria-label={t.gamesListLabel}>
        <article className="feat-card">
          <div className="site-tile">
            <div className="app-meta">
              <span className="sub">{t.cardEyebrow}</span>
              <span className="name">{t.cardName}</span>
            </div>
          </div>
          <p>{t.cardBody}</p>
          <div className="platform-row">
            <span className="platform-chip">{t.soon}</span>
          </div>
        </article>
      </section>
    </main>
  );
}

const gezegenCopy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbGames: "Oyunlar",
    gameName: "Gezegen",
    crumbSupport: "Destek",
    supportTitle: "Destek",
    supportTitleIt: "Kanalları",
    supportIntro:
      "Gezegen ile ilgili bir sorununuz, öneriniz ya da geri bildiriminiz varsa bize yazın. Sık sorulan soruların yanıtlarını aşağıda bulabilirsiniz.",
    supportSectionLabel: "Destek kanalları",
    supportDeveloper: "Geliştirici",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Yazarken cihaz modelinizi (iPhone/iPad), iOS sürümünüzü ve yaşadığınız sorunu kısaca belirtin; mümkünse ekran görüntüsü ekleyin.",
    supportResponse: "Yanıt Süresi",
    supportResponseHeading: "Yanıt süresi",
    supportResponseText: "Talepler iş günleri içinde, genellikle aynı gün değerlendirilir.",
    privacyCta: "Gizlilik",
    supportPrivacyText:
      "Gezegen hesap gerektirmez ve ilerlemenizi yalnızca cihazınızda saklar; reklamları Google AdMob gösterir. Ayrıntılar için gizlilik sayfasına bakın.",
    faqHeading: "Sık sorulan sorular",
    faq: [
      {
        q: "Oynamak için hesap açmam gerekir mi?",
        a: "Hayır. Gezegen’de hesap, kayıt ya da giriş yoktur; indirip hemen oynayabilirsiniz. Yalnızca dünya sıralaması için, isteğe bağlı olarak cihazınızın Game Center hesabı kullanılır."
      },
      {
        q: "Gezegenler nasıl birleşir? Oyun ne zaman biter?",
        a: "Aynı iki gezegen birbirine değince bir üst gezegene dönüşür: Asteroit, Ay, Merkür, Mars, Venüs, Dünya, Neptün, Uranüs, Satürn, Jüpiter ve Güneş. İki Güneş birleşirse Süpernova patlar. Gezegenler kavanozun üstündeki çizginin üzerinde çok uzun kalırsa oyun biter."
      },
      {
        q: "İlerlemem nerede saklanıyor? Uygulamayı silersem ya da yeni cihaza geçersem ne olur?",
        a: "En yüksek skorunuz, altınınız, mağazadan aldıklarınız, başarımlarınız ve ayarlarınız yalnızca cihazınızda saklanır; bir hesaba ya da sunucuya bağlı değildir. Uygulamayı silerseniz bu veriler de silinir ve yeni bir cihaza kendiliğinden taşınmaz; yalnızca cihaz yedeğinizden geri yüklenebilir."
      },
      {
        q: "Yarım bıraktığım oyuna ne olur?",
        a: "Yarım kalan oyun, iOS uygulamayı arka planda kapatsa bile kaydedilir. Ana menüde “Devam et” ile kaldığınız yerden sürdürebilir ya da “Yeni oyun” ile baştan başlayabilirsiniz."
      },
      {
        q: "Oyun bitince nasıl devam ederim? Altınla devam ile reklamla devam arasındaki fark ne?",
        a: "Oyun bitince tur başına bir kez devam edebilirsiniz: “Devam et” düğmesi altın harcar, “Reklam izle” düğmesi ise ücretsizdir (kısa bir reklam izlersiniz). İkisi aynı hakkı kullanır; biri kullanılınca diğeri kalkar. Devam edince üstteki gezegenler kalkar ve oyun sürer."
      },
      {
        q: "Sesi, titreşimi ya da dili nasıl değiştiririm?",
        a: "Ana menünün altındaki dişli simgesine dokunarak Ayarlar’ı açın. Ses ve Titreşim çubuklarıyla seviyeyi ayarlayabilir, çubuğu en sola çekerek kapatabilirsiniz. Gezegen cihazınızın diliyle açılır; cihaz diliniz desteklenmiyorsa İngilizce kullanılır. Dili değiştirmek için Ayarlar’daki Dil listesinden istediğiniz dili seçin; seçiminiz kaydedilir. Oyun 73 dilde sunulur."
      },
      {
        q: "Neden reklam görüyorum? Reklamlar nasıl çalışıyor?",
        a: "Gezegen ücretsizdir ve reklamlarla desteklenir; reklamları Google AdMob gösterir. Ödüllü reklamlar isteğe bağlıdır: yalnızca “Reklam izle” yazan ya da oynat (▶) simgesi taşıyan bir düğmeye dokunursanız açılır ve karşılığında oyuna devam hakkı, turun altınını ikiye katlama (×2) ya da mağazada bedava altın verir; mağazadaki bedava altının bekleme süresi ve günlük sınırı vardır. Turlar arasında, “Tekrar oyna”ya dokunduğunuzda seyrek bir tam ekran reklam çıkabilir; oyun sırasında hiç reklam gösterilmez. İnternet yokken ya da reklam hazır değilken reklam düğmeleri görünmez ve oyun etkilenmez."
      },
      {
        q: "Reklam onay formunu ya da izleme tercihimi nasıl yeniden açarım?",
        a: "Avrupa Ekonomik Alanı, Birleşik Krallık ve benzeri bölgelerde ilk açılışta Google’ın onay formu gösterilir. Tercihinizi sonradan değiştirmek için oyunda Ayarlar › Gizlilik ayarları düğmesine dokunun; bu düğme yalnızca onay gerektiren bölgelerde görünür. iOS’un izleme izni için iPhone ya da iPad’inizde Ayarlar › Gizlilik ve Güvenlik › İzleme bölümüne bakın."
      },
      {
        q: "Dünya skor tablosuna nasıl katılırım? Skorum neden görünmüyor?",
        a: "Skor Tablosu ekranı bu cihazdaki en iyi oyunlarınızı gösterir. Dünya sıralaması Apple Game Center üzerinden çalışır: iPhone ya da iPad’inizde Game Center’a giriş yaptıysanız en yüksek skorunuz Apple’a gönderilir ve Skor Tablosu ekranındaki “Dünya sıralaması” düğmesi Game Center sıralamasını açar. Giriş yapmadıysanız bu düğme görünmez; iOS Ayarlar’dan Game Center’a giriş yapın, bekleyen rekorunuz giriş yapınca gönderilir."
      },
      {
        q: "Bir hata buldum ya da önerim var. Nasıl bildirebilirim?",
        a: `${links.email} adresine yazın. Cihaz modelinizi (iPhone/iPad), iOS sürümünüzü ve ne olduğunu kısaca anlatın; mümkünse ekran görüntüsü ekleyin. Çeviri hatalarını ve görmek istediğiniz özellikleri de aynı adrese gönderebilirsiniz.`
      }
    ],
    purchasesHeading: "Mağaza ve satın alımlar",
    purchases: [
      {
        q: "Oyunda gerçek parayla satın alma var mı?",
        a: "Şu anda yok. Gezegen ücretsizdir ve gerçek parayla satın alma sunmaz. Mağazadaki kavanozlar, gökyüzleri, gezegen stilleri ve kalıcı yetenekler oyun içi altınla alınır; altın oynayarak, başarımlarla, günlük ödülle ya da isteğe bağlı reklam izleyerek kazanılır."
      },
      {
        q: "Mağazadan yanlışlıkla bir ürün aldım. Geri alabilir miyim?",
        a: "Mağazada satın alma iki dokunuşla onaylanır. Yine de yanlışlıkla aldıysanız Mağaza ekranındaki “Sat” düğmesine, ardından ürüne dokunup tekrar dokunarak onaylayın: ürünü yarı fiyatına geri satarsınız. Varsayılan ürünler ve başarımla açılan ürünler satılamaz."
      }
    ]
  },
  en: {
    crumbHome: "Home",
    crumbGames: "Games",
    gameName: "Gezegen",
    crumbSupport: "Support",
    supportTitle: "Support",
    supportTitleIt: "Channels",
    supportIntro:
      "If you have a problem, a suggestion or feedback about Gezegen, write to us. You will find answers to frequently asked questions below.",
    supportSectionLabel: "Support channels",
    supportDeveloper: "Developer",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Please mention your device model (iPhone/iPad), your iOS version and a short description of the problem; add a screenshot if you can.",
    supportResponse: "Response Time",
    supportResponseHeading: "Response time",
    supportResponseText: "Requests are reviewed during business days, usually within the same day.",
    privacyCta: "Privacy",
    supportPrivacyText:
      "Gezegen needs no account and keeps your progress only on your device; ads are served by Google AdMob. See the privacy page for details.",
    faqHeading: "Frequently asked questions",
    faq: [
      {
        q: "Do I need an account to play?",
        a: "No. Gezegen has no accounts, sign-up or login; download it and play right away. Your device’s Game Center account is used only for the world ranking, and only if you choose to."
      },
      {
        q: "How do planets merge? When does the game end?",
        a: "When two matching planets touch they merge into the next one up: Asteroid, Moon, Mercury, Mars, Venus, Earth, Neptune, Uranus, Saturn, Jupiter and the Sun. Merge two Suns and a Supernova explodes. If planets stay above the line at the top of the jar for too long, the game ends."
      },
      {
        q: "Where is my progress stored? What happens if I delete the app or switch devices?",
        a: "Your best score, gold, shop items, achievements and settings are stored only on your device; they are not tied to an account or a server. If you delete the app, this data is deleted too and does not move to a new device by itself; it can only be restored from a device backup."
      },
      {
        q: "What happens to a game I leave unfinished?",
        a: "An unfinished game is saved, even if iOS closes the app in the background. From the main menu, tap “Continue” to pick up where you left off, or “New game” to start over."
      },
      {
        q: "How do I continue after the game ends? What is the difference between continuing with gold and with an ad?",
        a: "When the game ends you can continue once per round: the “Continue” button spends gold, while the “Watch ad” button is free (you watch a short ad). Both use the same chance; once one is used the other disappears. After you continue, the planets at the top are cleared and the game goes on."
      },
      {
        q: "How do I change the sound, vibration or language?",
        a: "Tap the gear icon at the bottom of the main menu to open Settings. Use the Sound and Vibration sliders to set the level, or drag a slider all the way to the left to turn it off. Gezegen opens in your device’s language, or in English if your language is not supported. To change it, pick a language from the Language list in Settings; your choice is saved. The game is available in 73 languages."
      },
      {
        q: "Why do I see ads? How do they work?",
        a: "Gezegen is free and supported by ads, which are served by Google AdMob. Rewarded ads are optional: they open only if you tap a button labelled “Watch ad” or marked with a play (▶) icon, and in return give you a chance to continue a game, double a round’s gold (×2) or free gold in the shop; the shop’s free gold has a waiting time and a daily limit. Between rounds, an occasional full-screen ad may appear when you tap “Play again”; no ads are ever shown during play. When you are offline or no ad is ready, the ad buttons are hidden and the game is not affected."
      },
      {
        q: "How do I reopen the ad consent form or change my tracking choice?",
        a: "In the European Economic Area, the United Kingdom and similar regions, Google’s consent form is shown at first launch. To change your choice later, tap Settings › Privacy settings in the game; this button appears only in regions where consent is required. For iOS’s tracking permission, see Settings › Privacy & Security › Tracking on your iPhone or iPad."
      },
      {
        q: "How do I join the world leaderboard? Why is my score missing?",
        a: "The Leaderboard screen shows your best games on this device. The world ranking runs on Apple Game Center: if you are signed in to Game Center on your iPhone or iPad, your best score is submitted to Apple and the “World ranking” button on the Leaderboard screen opens the Game Center ranking. If you are not signed in, that button is hidden; sign in to Game Center in iOS Settings and your pending record is submitted once you do."
      },
      {
        q: "I found a bug or have a suggestion. How do I report it?",
        a: `Write to ${links.email}. Briefly describe your device model (iPhone/iPad), your iOS version and what happened, and add a screenshot if you can. You can also send us translation mistakes and feature ideas at the same address.`
      }
    ],
    purchasesHeading: "Shop and purchases",
    purchases: [
      {
        q: "Does the game have real-money purchases?",
        a: "Not at the moment. Gezegen is free and offers no real-money purchases. Jars, skies, planet styles and permanent perks in the shop are bought with in-game gold, which you earn by playing, through achievements, the daily reward, or by watching an optional ad."
      },
      {
        q: "I bought something in the shop by mistake. Can I get it back?",
        a: "Purchases in the shop are confirmed with two taps. If you still bought something by mistake, tap the “Sell” button on the Shop screen, then tap the item and tap again to confirm: you sell it back for half its price. Default items and items unlocked by achievements cannot be sold."
      }
    ]
  }
};

/**
 * Support page for Gezegen, the address given to the App Store as the support URL. Same skeleton as HalkaSupport (three
 * cards) plus the FAQ sections; the game has no page of its own yet, so its name in the breadcrumb is plain text.
 */
export function GezegenSupport({ locale }: { locale: Locale }) {
  const t = gezegenCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/games/`}>{t.crumbGames}</Link>
          <span>/</span>
          <span>{t.gameName}</span>
          <span>/</span>
          <span>{t.crumbSupport}</span>
        </div>
        <h1>
          {t.supportTitle} <span className="it">{t.supportTitleIt}</span>
        </h1>
        <p className="meta">{t.supportIntro}</p>
      </header>

      <section className="feature-grid" aria-label={t.supportSectionLabel}>
        <div className="channel-card">
          <span className="label">{t.supportDeveloper}</span>
          <h3>{t.supportDeveloperName}</h3>
          <p>{t.supportDeveloperText}</p>
          <a className="link" href={`mailto:${links.email}`}>
            {links.email}
          </a>
          <a className="link" href={`https://${links.domain}`} target="_blank" rel="noreferrer">
            {links.domain}
          </a>
        </div>

        <div className="channel-card">
          <span className="label">{t.supportResponse}</span>
          <h3>{t.supportResponseHeading}</h3>
          <p>{t.supportResponseText}</p>
        </div>

        <div className="channel-card">
          <span className="label">{t.privacyCta}</span>
          <h3>{t.privacyCta}</h3>
          <p>{t.supportPrivacyText}</p>
          <Link className="link" href={`/${locale}/games/gezegen/privacy/`}>
            {t.privacyCta} →
          </Link>
        </div>
      </section>

      <section className="doc-section" style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}>
        <h2>{t.faqHeading}</h2>
        {t.faq.map((item) => (
          <div key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </section>

      <section className="doc-section" style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}>
        <h2>{t.purchasesHeading}</h2>
        {t.purchases.map((item) => (
          <div key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

const halkaCopy = {
  tr: {
    crumbHome: "Anasayfa",
    crumbGames: "Oyunlar",
    gameName: "Halka",
    crumbSupport: "Destek",
    supportTitle: "Destek",
    supportTitleIt: "Kanalları",
    supportIntro: "Halka ile ilgili bir sorununuz, öneriniz ya da geri bildiriminiz varsa bize yazın.",
    supportSectionLabel: "Destek kanalları",
    supportDeveloper: "Geliştirici",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Yazarken cihaz modelinizi (iPhone/iPad), iOS sürümünüzü ve yaşadığınız sorunu kısaca belirtin; mümkünse ekran görüntüsü ekleyin.",
    supportResponse: "Yanıt Süresi",
    supportResponseHeading: "Yanıt süresi",
    supportResponseText: "Talepler iş günleri içinde, genellikle aynı gün değerlendirilir.",
    privacyCta: "Gizlilik",
    supportPrivacyText:
      "Halka hesap gerektirmez ve ilerlemenizi yalnızca cihazınızda saklar; reklamları Google AdMob gösterir. Ayrıntılar için gizlilik sayfasına bakın."
  },
  en: {
    crumbHome: "Home",
    crumbGames: "Games",
    gameName: "Halka",
    crumbSupport: "Support",
    supportTitle: "Support",
    supportTitleIt: "Channels",
    supportIntro: "If you have a problem, a suggestion or feedback about Halka, write to us.",
    supportSectionLabel: "Support channels",
    supportDeveloper: "Developer",
    supportDeveloperName: "Mehmet Gümrah",
    supportDeveloperText:
      "Please mention your device model (iPhone/iPad), your iOS version and a short description of the problem; add a screenshot if you can.",
    supportResponse: "Response Time",
    supportResponseHeading: "Response time",
    supportResponseText: "Requests are reviewed during business days, usually within the same day.",
    privacyCta: "Privacy",
    supportPrivacyText:
      "Halka needs no account and keeps your progress only on your device; ads are served by Google AdMob. See the privacy page for details."
  }
};

/**
 * Support page for Halka, the address given to the App Store as the support URL. Mirrors the app support pages
 * (TomarSupport); the game has no page of its own yet, so its name in the breadcrumb is plain text.
 */
export function HalkaSupport({ locale }: { locale: Locale }) {
  const t = halkaCopy[locale];

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/games/`}>{t.crumbGames}</Link>
          <span>/</span>
          <span>{t.gameName}</span>
          <span>/</span>
          <span>{t.crumbSupport}</span>
        </div>
        <h1>
          {t.supportTitle} <span className="it">{t.supportTitleIt}</span>
        </h1>
        <p className="meta">{t.supportIntro}</p>
      </header>

      <section className="feature-grid" aria-label={t.supportSectionLabel}>
        <div className="channel-card">
          <span className="label">{t.supportDeveloper}</span>
          <h3>{t.supportDeveloperName}</h3>
          <p>{t.supportDeveloperText}</p>
          <a className="link" href={`mailto:${links.email}`}>
            {links.email}
          </a>
          <a className="link" href={`https://${links.domain}`} target="_blank" rel="noreferrer">
            {links.domain}
          </a>
        </div>

        <div className="channel-card">
          <span className="label">{t.supportResponse}</span>
          <h3>{t.supportResponseHeading}</h3>
          <p>{t.supportResponseText}</p>
        </div>

        <div className="channel-card">
          <span className="label">{t.privacyCta}</span>
          <h3>{t.privacyCta}</h3>
          <p>{t.supportPrivacyText}</p>
          <Link className="link" href={`/${locale}/games/halka/privacy/`}>
            {t.privacyCta} →
          </Link>
        </div>
      </section>
    </main>
  );
}
