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
          <div>
            <p className="eyebrow">iOS & Android</p>
            <h2>Tekno Satış / Tekno Sales</h2>
            <p>
              B2B satış ekipleri için müşteri hesapları, fatura takibi, tahsilat raporları ve ürün kataloglarını tek yerde toplayan mobil uygulama.
            </p>
          </div>
          <div className="actions">
            <a className="button primary" href="/apps/teknosales/">
              Detaylar
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
