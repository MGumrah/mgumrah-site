export default function HomePage() {
  return (
    <main className="hero">
      <section className="hero-inner" aria-label="Kişisel tanıtım">
        <p className="eyebrow">Kişisel Website</p>
        <h1>
          Mehmet
          <br />
          Gümrah
        </h1>
        <p className="summary">
          Merhaba, ben Mehmet Gümrah. Burası projelerimi, uygulamalarımı ve resmi dokümantasyon sayfalarını paylaşacağım kişisel web sitem.
        </p>
        <div className="actions" aria-label="Bağlantılar">
          <a className="button primary" href="/apps/">
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
