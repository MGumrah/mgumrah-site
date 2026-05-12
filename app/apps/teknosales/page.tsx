export const metadata = {
  title: "Tekno Satış",
  description: "Tekno Satış iOS ve Android uygulama detayları."
};

export default function TeknoSalesPage() {
  return (
    <main className="document">
      <header className="document-header">
        <div className="app-hero-top">
          <p className="eyebrow">Tek Uygulama, İki Platform</p>
          <div className="platform-badges" aria-label="Desteklenen platformlar">
            <span>iOS</span>
            <span>Android</span>
          </div>
        </div>
        <div className="app-title-row">
          <img className="app-icon large" src="/images/teknosales-icon.png" alt="Tekno Satış uygulama logosu" />
          <div>
            <h1>Tekno Satış</h1>
            <p className="app-subtitle">Tekno Sales</p>
          </div>
        </div>
        <p className="meta">
          B2B satış operasyonlarında müşteri hesapları, finansal hareketler, tahsilat raporları ve ürün katalogları için geliştirilen tek mobil uygulama.
          iOS tarafında Tekno Sales, Türkçe kullanımda Tekno Satış adıyla yer alır.
        </p>
        <div className="language-links" aria-label="Gizlilik politikası bağlantıları">
          <a className="button primary" href="https://play.google.com/store/apps/details?id=com.tekno.satis">
            Google Play
          </a>
          <a className="button primary" href="/tr/apps/teknosales/privacy/">
            Türkçe Gizlilik
          </a>
          <a className="button" href="/en/apps/teknosales/privacy/">
            English Privacy
          </a>
        </div>
      </header>

      <section className="app-detail-card" aria-label="Tekno Satış uygulama detayları">
        <div>
          <h2>Uygulama Detayları</h2>
          <p>
            Tekno Satış; yetkili satış ekiplerinin cari hesapları, fatura bilgilerini, ödeme hareketlerini, tahsilat raporlarını ve ürün kataloglarını
            mobil cihazlardan görüntüleyebilmesi için geliştirilmiştir.
          </p>
        </div>
        <div className="feature-grid">
          <div>
            <strong>Platformlar</strong>
            <p>iOS ve Android</p>
          </div>
          <div>
            <strong>Uygulama Adı</strong>
            <p>TR: Tekno Satış<br />EN: Tekno Sales</p>
          </div>
          <div>
            <strong>Kullanım Alanı</strong>
            <p>B2B satış, tahsilat, fatura ve katalog süreçleri</p>
          </div>
          <div>
            <strong>Durum</strong>
            <p>Android sürümü Google Play üzerinde yayında. iOS mağaza bağlantısı hazır olduğunda bu sayfaya eklenecek.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
