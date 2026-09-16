import { links, portalAndroidTest } from "./site-config";
import type { Locale } from "./locale";

/**
 * Google Play kapalı testine giriş — GRUP yolu.
 *
 * Kapalı testte Play listesi yalnız tester listesindeki hesaba açılır. O liste
 * iki şekilde tutulabilir: Play Console'a tek tek yazılan e-posta listesi ya da
 * bir Google Grubu. E-posta listesi yolunda ziyaretçi adresini bırakır ve
 * BEKLER — birinin Play Console'a girip adresi eklemesi gerekir, çünkü Play
 * Developer API e-posta listelerini yönetmez (`edits.testers` yalnız
 * `googleGroups[]` alır). Grup yolunda bekleme yoktur: ziyaretçi gruba kendi
 * katılır, o anda tester listesine girmiş olur.
 *
 * Bu bileşen o yolun sayfa ayağıdır ve iki adımı ayrı ayrı gösterir, çünkü
 * ikisi TEK tıkla birleşmez ve sıraları da değişmez:
 *   1. gruba katıl  → hesap tester listesine girer,
 *   2. testi aç     → hesap teste opt-in eder ve Play açılır.
 * Grup üyeliği tek başına kurulumu AÇMAZ: Google'ın 12 tester / 14 gün sayacı
 * opt-in edenleri sayar, üyeleri değil. İkinci adım atlanırsa ziyaretçi Play'de
 * "bulunamadı" görmeye devam eder, üye olduğu hâlde.
 *
 * Hangi yolun gösterildiğini `portalAndroidTest.mode` söyler — sayfa tarafı
 * Play Console'daki ayarın aynadaki hâli olmak zorunda: Play hâlâ e-posta
 * listesi kullanırken burada grup göstermek, gruba katılan ziyaretçiyi tester
 * OLMADAN Play'e yollar ve aynı "bulunamadı" ekranına düşürür.
 */

const copy = {
  tr: {
    eyebrow: "Android · kapalı test",
    title: "Android sürümü iki adımda kurulur",
    intro:
      "Tekno Portal'ın Android sürümü Google Play'de kapalı testte. Kurulumun açılması için iki adım var ve ikisi de sizde bitiyor — bizim sizi bir listeye eklememizi beklemeniz gerekmiyor.",
    step1Head: "Test grubuna katılın",
    step1Body:
      "Açılan sayfada \"Gruba katıl\" deyin. Telefonunuzdaki Play Store'da oturum açtığınız Google hesabıyla katılmanız şart: başka bir adresle katılmak kurulumu açmaz.",
    step1Cta: "1 · Test grubuna katıl",
    step2Head: "Testi açın ve indirin",
    step2Body:
      "Gruba katıldıktan sonra bu sayfada \"Test kullanıcısı ol\" deyin. Google Play bağlantısı ancak bundan sonra sizin için açılır.",
    step2Cta: "2 · Testi aç ve indir",
    note: "İki adımı da aynı Google hesabıyla yapın ve sırayı bozmayın: gruba katılmadan testi açarsanız Google \"test kullanıcısı değilsiniz\" der.",
    alreadyTester: "Zaten test listesindeyim — Google Play'de aç",
    help: "Takıldığınız yerde yazın:"
  },
  en: {
    eyebrow: "Android · closed testing",
    title: "The Android build installs in two steps",
    intro:
      "Tekno Portal's Android build is in closed testing on Google Play. Two steps open it, and both are yours to take — there is no waiting for us to add you to a list.",
    step1Head: "Join the test group",
    step1Body:
      "Press \"Join group\" on the page that opens. It has to be the Google account your phone is signed into on the Play Store: joining with any other address will not open the install.",
    step1Cta: "1 · Join the test group",
    step2Head: "Open the test and install",
    step2Body:
      "Once you are in the group, press \"Become a tester\" on that page. Only then does the Google Play link open for you.",
    step2Cta: "2 · Open the test and install",
    note: "Use the same Google account for both steps, and keep the order: opening the test before joining the group gets you \"you are not a tester\".",
    alreadyTester: "I'm already on the tester list — open Google Play",
    help: "Stuck anywhere? Write to:"
  }
} as const;

export function AndroidTesterJoin({
  locale,
  playStoreUrl
}: {
  locale: Locale;
  /** Play listesinin kendisi — yalnız zaten tester olan için, en altta. */
  playStoreUrl: string;
}) {
  const t = copy[locale];

  return (
    <section className="tester" id="android-test" aria-labelledby="android-test-title">
      <span className="kicker">
        <span className="dot" />
        {t.eyebrow}
      </span>
      <h2 id="android-test-title">{t.title}</h2>
      <p className="tester-intro">{t.intro}</p>

      {/* Numaralar düğmelerin üstünde: adımların sırası bilgi değil KURAL, ve
          liste imi kaydırıldığında ya da kopyalandığında kaybolabilir. */}
      <ol className="tester-steps">
        <li className="tester-step">
          <p className="tester-step-head">{t.step1Head}</p>
          <p className="tester-step-body">{t.step1Body}</p>
          <a className="btn primary" href={portalAndroidTest.groupUrl}>
            {t.step1Cta}
          </a>
        </li>

        <li className="tester-step">
          <p className="tester-step-head">{t.step2Head}</p>
          <p className="tester-step-body">{t.step2Body}</p>
          <a className="btn" href={portalAndroidTest.optInUrl}>
            {t.step2Cta}
          </a>
        </li>
      </ol>

      <p className="tester-hint">{t.note}</p>

      <p className="tester-hint">
        {t.help} <a href={`mailto:${links.email}`}>{links.email}</a>
      </p>

      {/* Aynı gerekçe form yolundaki satırla aynı: listede olan kişi adım
          okumak zorunda kalmasın. */}
      <a className="tester-skip" href={playStoreUrl}>
        {t.alreadyTester}
      </a>
    </section>
  );
}
