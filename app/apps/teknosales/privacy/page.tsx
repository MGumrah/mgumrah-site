import Link from "next/link";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/apps/teknosales/privacy",
  title: "Tekno Satış Gizlilik Politikası",
  description: "TeknoSales iOS ve Android mobil uygulamaları için gizlilik politikası."
});

export default function PrivacyLanguagePage() {
  return (
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">TeknoSales</p>
        <h1>Privacy Policy</h1>
        <p className="meta">Lütfen görüntülemek istediğiniz dili seçin.</p>
        <div className="language-links" aria-label="Dil seçenekleri">
          <Link className="button primary" href="/tr/apps/teknosales/privacy/">
            Türkçe
          </Link>
          <Link className="button" href="/en/apps/teknosales/privacy/">
            English
          </Link>
        </div>
      </header>
    </main>
  );
}
