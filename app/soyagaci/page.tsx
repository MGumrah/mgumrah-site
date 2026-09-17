import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "../site-metadata";
import SoyAgaci from "./agac";
import { aile } from "./aile";
import { aileKur, hazirla, kusakBasligi, ozetle, yakinliklar } from "./soy";

// Derleme anında: veri hatalıysa sayfa hiç üretilmez, hata mesajı satırı söyler.
const kisiler = hazirla(aile.kisiler, aile.kok);
const kurulu = aileKur(kisiler);
const yakinlik = yakinliklar(kurulu, aile.kok);
const ozet = ozetle(kurulu, yakinlik);

const ozetYazisi = [`${ozet.kisi} kişi`, `${ozet.kusak} kuşak`, ozet.enEski ? `en eski kayıt ${ozet.enEski}` : null]
  .filter(Boolean)
  .join(" · ");

/** Listede en yaşlı kuşak üstte; bir kuşağın içinde veri sırası. */
const kusaklar = [...new Set(kisiler.map((k) => yakinlik.get(k.id)!.kusak))]
  .sort((a, b) => a - b)
  .map((kusak) => ({
    baslik: kusakBasligi(kusak),
    kisiler: kisiler.filter((k) => yakinlik.get(k.id)!.kusak === kusak).map((k) => k.id)
  }));

const paylasimBasligi = `${aile.baslik} · Soy ağacı`;
const paylasimAciklamasi = `${ozetYazisi}.`;
const kapak = { url: `${SITE_URL}/soyagaci/og.png`, width: 1200, height: 630, alt: paylasimBasligi };

export const metadata: Metadata = {
  title: "Soy Ağacı",
  description: paylasimAciklamasi,
  // Aileye WhatsApp'tan gönderilen bir bağlantı, sitenin bir sayfası değil:
  // /civic ve /brief gibi dizin dışında ve site haritasında yok. Canonical
  // kendini gösteriyor; noindex bir sayfanın başka adresi göstermesi
  // tarayıcıya iki çelişen talimat verir.
  robots: { index: false, follow: false },
  alternates: { canonical: "/soyagaci/" },
  openGraph: {
    title: paylasimBasligi,
    description: paylasimAciklamasi,
    url: `${SITE_URL}/soyagaci/`,
    siteName: SITE_NAME,
    locale: "tr_TR",
    type: "website",
    images: [kapak]
  },
  twitter: {
    card: "summary_large_image",
    title: paylasimBasligi,
    description: paylasimAciklamasi,
    images: [kapak.url]
  }
};

/**
 * mgumrah.com/soyagaci — ailenin soy ağacı. Bütün kişiler ./aile.ts'te;
 * doğrulama, akrabalık adları ve yerleşim ./soy.ts'te, tuval ./agac.tsx'te.
 */
export default function SoyAgaciPage() {
  return (
    <main className="soy container">
      <header className="soy-bas">
        <p className="kicker">
          <span className="dot" />
          Soy ağacı
        </p>
        <h1>{aile.baslik}</h1>
        <p className="soy-ozet">{ozetYazisi}</p>
      </header>

      <SoyAgaci kisiler={kisiler} kok={aile.kok} yakinlik={Object.fromEntries(yakinlik)} kusaklar={kusaklar} />

      <p className="soy-dipnot">
        {aile.kaynak ? `${aile.kaynak} ` : null}
        Hayatta olanların doğum tarihi, doğum yeri ve nüfus kaydı bu sayfada yer almaz.
      </p>
    </main>
  );
}
