export default function PrivacyLanguagePage() {
  return (
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">TeknoSales</p>
        <h1>Privacy Policy</h1>
        <p className="meta">Lütfen görüntülemek istediğiniz dili seçin.</p>
        <div className="language-links" aria-label="Dil seçenekleri">
          <a className="button primary" href="/tr/apps/teknosales/privacy/">
            Türkçe
          </a>
          <a className="button" href="/en/apps/teknosales/privacy/">
            English
          </a>
        </div>
      </header>
    </main>
  );
}
