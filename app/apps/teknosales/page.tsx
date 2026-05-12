export const metadata = {
  title: "Tekno Satış / Tekno Sales",
  description: "Tekno Satış iOS ve Android uygulama detayları."
};

const platforms = [
  {
    name: "iOS",
    title: "Tekno Sales",
    status: "App Store",
    description:
      "Authorized sales teams can review customer accounts, invoices, collection reports, and product catalogs from iPhone and iPad.",
    privacyHref: "/en/apps/teknosales/privacy/",
    supportText: "Support information will be added after App Store listing details are finalized."
  },
  {
    name: "Android",
    title: "Tekno Satış",
    status: "Google Play",
    description:
      "Yetkili satış ekipleri Android cihazlardan cari hesapları, fatura bilgilerini, tahsilat raporlarını ve ürün kataloglarını görüntüleyebilir.",
    privacyHref: "/tr/apps/teknosales/privacy/",
    supportText: "Google Play mağaza bağlantısı hazır olduğunda bu sayfaya eklenecek."
  }
];

export default function TeknoSalesPage() {
  return (
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">Tekno Satış / Tekno Sales</p>
        <h1>iOS ve Android Uygulama Detayları</h1>
        <p className="meta">
          Tekno Satış, B2B satış operasyonlarında müşteri hesapları, finansal hareketler, tahsilat raporları ve ürün katalogları için geliştirilen mobil uygulamadır.
        </p>
        <div className="language-links" aria-label="Gizlilik politikası bağlantıları">
          <a className="button primary" href="/tr/apps/teknosales/privacy/">
            Türkçe Gizlilik
          </a>
          <a className="button" href="/en/apps/teknosales/privacy/">
            English Privacy
          </a>
        </div>
      </header>

      <section className="platform-grid" aria-label="Platform detayları">
        {platforms.map((platform) => (
          <article className="platform-card" key={platform.name}>
            <div className="platform-heading">
              <span>{platform.name}</span>
              <strong>{platform.status}</strong>
            </div>
            <h2>{platform.title}</h2>
            <p>{platform.description}</p>
            <p>{platform.supportText}</p>
            <div className="actions">
              <a className="button primary" href={platform.privacyHref}>
                Privacy Policy
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
