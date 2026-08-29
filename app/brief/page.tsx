import type { Metadata } from "next";
import BriefForm from "./brief-form";
import { QUESTION_COUNT } from "./questions";

export const metadata: Metadata = {
  title: "Proje Soru Formu",
  description: "E-ticaret hedef takip uygulaması için kapsam soruları.",
  // A private link sent to one person, not a page of the site: it is out of the
  // sitemap and out of the index. The canonical points at itself for the same
  // reason /portal's does — a noindex page whose canonical names another page
  // hands the crawler two contradictory instructions and the noindex wins.
  robots: { index: false, follow: false },
  alternates: { canonical: "/brief/" }
};

/**
 * mgumrah.com/brief — the scoping questions for the e-commerce target-tracking
 * app, in a form that can be answered by tapping instead of writing.
 *
 * There is no backend: the site is a static export, so the form builds one
 * WhatsApp-ready text block in the browser and hands it back through the share
 * sheet, the clipboard or mailto. Nothing is submitted anywhere, which is also
 * why the draft is kept in localStorage — that is the only place it exists.
 */
export default function BriefPage() {
  return (
    <main className="doc container">
      <header className="doc-hdr">
        <p className="kicker">
          <span className="dot" />
          Proje Soru Formu
        </p>
        <h1>E-ticaret hedef takip uygulaması</h1>
        <p className="meta">
          Fikri anladım, mantıklı. Doğru kurabilmem için {QUESTION_COUNT} sorum var. Çoğunda hazır şıklar var —
          dokunman yeterli, yazman gerekmiyor. Emin olmadığın soruyu boş bırak, o da bir bilgi.
        </p>
        <p className="meta subtle">Sonunda &quot;WhatsApp ile gönder&quot; deyip bana yolla.</p>
      </header>

      <BriefForm />
    </main>
  );
}
