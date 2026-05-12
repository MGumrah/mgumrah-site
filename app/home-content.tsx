type Locale = "tr" | "en";

const homeCopy = {
  tr: {
    eyebrow: "Kişisel Website",
    summary:
      "Merhaba, ben Mehmet Gümrah. Burası projelerimi, uygulamalarımı ve resmi dokümantasyon sayfalarını paylaşacağım kişisel web sitem.",
    appsHref: "/tr/apps/"
  },
  en: {
    eyebrow: "Personal Website",
    summary:
      "Hi, I am Mehmet Gümrah. This is my personal website for projects, apps, and official documentation pages.",
    appsHref: "/en/apps/"
  }
};

export default function HomeContent({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];

  return (
    <main className="hero">
      <section className="hero-inner" aria-label={locale === "tr" ? "Kişisel tanıtım" : "Personal intro"}>
        <p className="eyebrow hero-reveal hero-reveal-1">{copy.eyebrow}</p>
        <h1 className="hero-reveal hero-reveal-2">
          Mehmet
          <br />
          Gümrah
        </h1>
        <p className="summary hero-reveal hero-reveal-3">{copy.summary}</p>
        <div className="actions hero-reveal hero-reveal-4" aria-label={locale === "tr" ? "Bağlantılar" : "Links"}>
          <a className="button primary" href={copy.appsHref}>
            Apps
          </a>
          <a className="button" href="https://github.com/MGumrah">
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
}
