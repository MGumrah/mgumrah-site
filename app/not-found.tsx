import Link from "next/link";

export const metadata = {
  title: "404",
  description: "Sayfa bulunamadı — Page not found."
};

export default function NotFound() {
  return (
    <main className="hero">
      <section className="hero-inner" aria-label="404">
        <p className="eyebrow">404</p>
        <h1>
          Sayfa
          <br />
          bulunamadı
        </h1>
        <p className="summary">
          Aradığınız sayfa taşınmış veya kaldırılmış olabilir. The page you are looking for could not be found.
        </p>
        <div className="actions" aria-label="Bağlantılar">
          <Link className="button primary" href="/tr/">
            Ana sayfa
          </Link>
          <Link className="button" href="/en/">
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
