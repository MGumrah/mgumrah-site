import Link from "next/link";

export const metadata = {
  title: "404",
  description: "Sayfa bulunamadı — Page not found."
};

export default function NotFound() {
  return (
    <main className="hero container" aria-label="404">
      <p className="kicker">
        <span className="dot" />
        404
      </p>
      <h1 className="display">
        <span className="br">Sayfa</span>
        <span className="br">bulunamadı</span>
      </h1>
      <p className="lede">
        Aradığınız sayfa taşınmış veya kaldırılmış olabilir. The page you are looking for could not be found.
      </p>
      <div className="hero-actions">
        <Link className="btn primary" href="/tr/">
          Ana sayfa
        </Link>
        <Link className="btn" href="/en/">
          Home
        </Link>
      </div>
    </main>
  );
}
