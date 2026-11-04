import type { Metadata } from "next";

const baslik = "Satılık Nissan Note";

export const metadata: Metadata = {
  title: baslik,
  // /ilan/civic ile aynı gerekçe: tek tek gönderilen bir satış bağlantısı,
  // sitenin bir sayfası değil.
  robots: { index: false, follow: false },
  alternates: { canonical: "/ilan/note/" }
};

/**
 * mgumrah.com/ilan/note — Nissan Note'un bilgileri gelene kadar yer tutucu.
 *
 * Bilgiler gelince ./civic gibi kurulur: ./ilan.ts (ortak biçim ../tipler.ts'te),
 * fotoğraflar public/images/note/<id>-{lg,md,sm}.jpg + og.jpg, bakım belgeleri
 * public/belgeler/note/; bu dosya da ./civic/page.tsx'in aynısına döner
 * (`ilanMetadata(ilan)` + `<IlanSayfasi ilan={ilan} />`).
 */
export default function NoteIlanPage() {
  return (
    <main className="ilan container">
      <nav className="ilan-yol" aria-label="Kategori">
        {["Vasıta", "Otomobil", "Nissan", "Note"].map((adim) => (
          <span key={adim}>{adim}</span>
        ))}
      </nav>

      <header className="ilan-baslik">
        <div className="ilan-baslik-metin">
          <h1>Sahibinden Nissan Note</h1>
        </div>
      </header>

      <section className="ilan-panel">
        <h2>İlan hazırlanıyor</h2>
        <div className="ilan-panel-govde ilan-aciklama">
          <p>Fotoğraflar ve araç bilgileri eklenince ilan bu sayfada yayınlanacak.</p>
        </div>
      </section>
    </main>
  );
}
