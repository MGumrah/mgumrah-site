export const metadata = {
  title: "Apps",
  description: "Mehmet Gümrah tarafından geliştirilen uygulamalar."
};

export default function AppsPage() {
  return (
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">Uygulamalar</p>
        <h1>Apps</h1>
        <p className="meta">
          Geliştirdiğim mobil uygulamalar, destek sayfaları ve resmi dokümantasyon bağlantıları.
        </p>
      </header>

      <section className="app-grid" aria-label="Uygulama listesi">
        <article className="app-card">
          <div className="app-card-top">
            <img className="app-icon" src="/images/teknosales-icon.png" alt="Tekno Satış uygulama logosu" />
            <div className="platform-badges" aria-label="Desteklenen platformlar">
              <span>iOS</span>
              <span>Android</span>
            </div>
          </div>
          <div>
            <p className="eyebrow">Tek Uygulama, İki Platform</p>
            <h2>Tekno Satış</h2>
            <p className="app-subtitle">Tekno Sales</p>
            <p>
              B2B satış ekipleri için müşteri hesapları, fatura takibi, tahsilat raporları ve ürün kataloglarını tek yerde toplayan mobil uygulama.
            </p>
          </div>
          <div className="actions">
            <a className="button primary" href="/apps/teknosales/">
              Detaylar
            </a>
            <a className="button" href="https://play.google.com/store/apps/details?id=com.tekno.satis">
              Google Play
            </a>
            <a className="button" href="/tr/apps/teknosales/privacy/">
              Gizlilik
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
