import { statSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "../site-metadata";
import Galeri from "./galeri";
import HasarSemasi from "./hasar-semasi";
import { ilan } from "./ilan";
import PaylasDugmesi from "./paylas-dugmesi";
import Sekmeler from "./sekmeler";

const { arac, satici } = ilan;
const sayi = new Intl.NumberFormat("tr-TR");

const fiyat = ilan.fiyat === null ? null : `${sayi.format(ilan.fiyat)} TL`;
const km = `${sayi.format(arac.km)} km`;
const konum = [ilan.konum.il, ilan.konum.ilce].filter(Boolean).join(" / ");

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul"
});
const tarihYazisi = (gun: string) => tarihBicimi.format(new Date(`${gun}T12:00:00+03:00`));
const ilanTarihi = tarihYazisi(ilan.ilanTarihi);

// Derleme anında okunur: dosya değişince yazan boyut elle güncellenmeye kalmasın.
const dosyaBoyutu = (dosya: string) => `${Math.round(statSync(join(process.cwd(), "public", dosya)).size / 1024)} KB`;

const telefon = satici.telefon;
const telefonYazisi = telefon
  ? `0 (${telefon.slice(2, 5)}) ${telefon.slice(5, 8)} ${telefon.slice(8, 10)} ${telefon.slice(10, 12)}`
  : null;
const whatsapp = telefon
  ? `https://wa.me/${telefon}?text=${encodeURIComponent(
      `Merhaba, ${arac.yil} ${arac.marka} ${arac.seri} ilanınız için yazıyorum: ${SITE_URL}/civic/`
    )}`
  : null;

const paylasimBasligi = `Satılık ${arac.yil} ${arac.marka} ${arac.seri} ${arac.model}`;
const paylasimAciklamasi = [fiyat, km, arac.vites, arac.motorGucu, ...ilan.rozetler, ...ilan.oneCikanlar, konum]
  .filter(Boolean)
  .join(" · ");
const kapak = { url: `${SITE_URL}/images/civic/og.jpg`, width: 1200, height: 630, alt: paylasimBasligi };

export const metadata: Metadata = {
  title: paylasimBasligi,
  description: paylasimAciklamasi,
  // Tek tek gönderilen bir satış bağlantısı, sitenin bir sayfası değil: /brief
  // gibi dizin dışında ve site haritasında yok. Araç satılınca sayfa kalkar;
  // arama motorunda asılı kalmış bir ilan kimsenin işine yaramaz.
  robots: { index: false, follow: false },
  alternates: { canonical: "/civic/" },
  // Bu adres WhatsApp'a yapıştırılacak; önizlemede kişisel sitenin kartı değil
  // aracın fotoğrafı görünmeli.
  openGraph: {
    title: paylasimBasligi,
    description: paylasimAciklamasi,
    url: `${SITE_URL}/civic/`,
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

const IKONLAR = {
  fiyat: "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8ZM7 7h.01",
  km: "M12 14l4-4M3.3 19a10 10 0 1 1 17.4 0",
  yil: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  yakit: "M4 22V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v17M3 22h13M7 8h5M15 11h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V9l-3-3",
  guc: "M13 2 3 14h9l-1 8 10-12h-9l1-8Z",
  vites: "M5 4v16M12 4v16M19 4v8M5 12h14",
  konum: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  telefon:
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z",
  mesaj: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
  onay: "M20 6 9 17l-5-5",
  belge: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5"
} as const;

function Ikon({ ad }: { ad: keyof typeof IKONLAR }) {
  return (
    <svg className="ilan-ikon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={IKONLAR[ad]} />
    </svg>
  );
}

const bilgiSatirlari: { ad: string; deger: string; vurgu?: boolean }[] = [
  { ad: "İlan Tarihi", deger: ilanTarihi },
  { ad: "Marka", deger: arac.marka },
  { ad: "Seri", deger: arac.seri },
  { ad: "Model", deger: arac.model },
  { ad: "Yıl", deger: String(arac.yil) },
  { ad: "Yakıt / Motor Tipi", deger: arac.yakit },
  { ad: "Vites", deger: arac.vites },
  { ad: "Araç Durumu", deger: arac.durum },
  { ad: "KM", deger: sayi.format(arac.km) },
  { ad: "Kasa Tipi", deger: arac.kasa },
  { ad: "Motor Gücü", deger: arac.motorGucu },
  { ad: "Motor Hacmi", deger: arac.motorHacmi },
  { ad: "Çekiş", deger: arac.cekis },
  {
    ad: "Renk",
    deger: arac.ruhsatRengi ? `${arac.renk} (ruhsatta ${arac.ruhsatRengi.toLocaleLowerCase("tr-TR")})` : arac.renk
  },
  { ad: "Servis Garantisi", deger: arac.servisGarantisi },
  { ad: "Ağır Hasar Kayıtlı", deger: arac.agirHasarKayitli },
  { ad: "Plaka / Uyruk", deger: arac.plaka },
  { ad: "Kimden", deger: arac.kimden, vurgu: true },
  { ad: "Takas", deger: arac.takas }
];

const ilanDetaylari = (
  <>
    <section className="ilan-panel">
      <h2>Açıklama</h2>
      <div className="ilan-panel-govde ilan-aciklama">
        {ilan.aciklama.map((paragraf) => (
          <p key={paragraf}>{paragraf}</p>
        ))}
      </div>
    </section>

    <section className="ilan-panel" id="bakim">
      <h2>Servis Bakım Geçmişi</h2>
      <div className="ilan-panel-govde">
        <p className="bakim-not">{ilan.bakimNotu}</p>
        <ol className="bakim">
          {ilan.belgeler.map((belge) => (
            <li key={belge.dosya}>
              <p className="bakim-zaman">
                <b>{tarihYazisi(belge.tarih)}</b>
                <span>{sayi.format(belge.km)} km</span>
              </p>
              <div className="bakim-icerik">
                <p className="bakim-baslik">
                  {belge.baslik}
                  {belge.yer ? <span> · {belge.yer}</span> : null}
                </p>
                <p className="bakim-yapilan">{belge.yapilanlar}</p>
              </div>
              <a className="bakim-belge" href={belge.dosya} target="_blank" rel="noopener">
                <Ikon ad="belge" />
                <span>
                  Belgeyi aç <small>PDF · {dosyaBoyutu(belge.dosya)}</small>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="ilan-panel">
      <h2>Özellikler</h2>
      <div className="ilan-panel-govde">
        <h3 className="ilan-alt-baslik">Boyalı veya Değişen Parça</h3>
        <div className="ilan-kutu">
          <HasarSemasi durumlar={ilan.boyaDegisen} not={ilan.boyaNotu} tramer={ilan.tramer} />
        </div>

        {ilan.donanim.map((grup) => (
          <div key={grup.baslik}>
            <h3 className="ilan-alt-baslik">{grup.baslik}</h3>
            <ul className="ilan-kutu ilan-donanim">
              {grup.secenekler.map((secenek) => {
                const varMi = grup.var.includes(secenek);
                return (
                  <li key={secenek} className={varMi ? "var" : undefined}>
                    {varMi ? <Ikon ad="onay" /> : <span className="ilan-ikon" aria-hidden="true" />}
                    <span className="ilan-gizli">{varMi ? "Var: " : "Belirtilmedi: "}</span>
                    {secenek}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </>
);

const teknikOzellikler = (
  <section className="ilan-panel">
    <h2>Teknik Özellikler</h2>
    <div className="ilan-panel-govde">
      <dl className="ilan-tablo ilan-teknik">
        {ilan.teknik.map(([ad, deger]) => (
          <div key={ad}>
            <dt>{ad}</dt>
            <dd>{deger}</dd>
          </div>
        ))}
      </dl>
      <p className="ilan-not">
        {arac.yil} {arac.seri} Sedan {arac.model} paketinin katalog değerleridir; araca özel ölçüm değildir.
      </p>
    </div>
  </section>
);

/**
 * mgumrah.com/civic — satılık aracın ilan sayfası, sahibinden'deki ilan
 * düzeninde: galeri, fiyat ve bilgi tablosu, satıcı kutusu, altında açıklama,
 * boya/değişen şeması ve donanım listesi. Bütün içerik ./ilan.ts'ten gelir.
 */
export default function CivicIlanPage() {
  return (
    <main className="ilan container">
      <nav className="ilan-yol" aria-label="Kategori">
        {["Vasıta", "Otomobil", arac.marka, arac.seri, "1.5 VTEC", "Executive Plus"].map((adim) => (
          <span key={adim}>{adim}</span>
        ))}
      </nav>

      <header className="ilan-baslik">
        <div className="ilan-baslik-metin">
          <h1>{ilan.baslik}</h1>
          <ul className="ilan-ozet" aria-label="Özet">
            {fiyat ? (
              <li>
                <Ikon ad="fiyat" />
                {fiyat}
              </li>
            ) : null}
            <li>
              <Ikon ad="km" />
              {km}
            </li>
            <li>
              <Ikon ad="yil" />
              {arac.yil} Model
            </li>
            <li>
              <Ikon ad="yakit" />
              {arac.yakit}
            </li>
            <li>
              <Ikon ad="guc" />
              {arac.motorGucu}
            </li>
            <li>
              <Ikon ad="vites" />
              {arac.vites}
            </li>
          </ul>
        </div>
        <PaylasDugmesi baslik={paylasimBasligi} />
      </header>

      <div className="ilan-ust">
        <Galeri fotograflar={ilan.fotograflar} />

        <section className="ilan-bilgi" aria-label="İlan bilgileri">
          <p className={`ilan-fiyat${fiyat ? "" : " is-bos"}`}>{fiyat ?? "Fiyat için arayın"}</p>
          <p className="ilan-konum">
            <Ikon ad="konum" />
            {konum}
          </p>
          <ul className="ilan-rozetler">
            {ilan.rozetler.map((rozet) => (
              <li key={rozet}>
                <Ikon ad="onay" />
                {rozet}
              </li>
            ))}
          </ul>
          <dl className="ilan-tablo">
            {bilgiSatirlari.map((satir) => (
              <div key={satir.ad} className={satir.vurgu ? "is-vurgu" : undefined}>
                <dt>{satir.ad}</dt>
                <dd>{satir.deger}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="ilan-yan" aria-label="Satıcı">
          <div className="ilan-satici">
            <div className="ilan-satici-ust">
              <span className="ilan-avatar" aria-hidden="true">
                {satici.ad
                  .split(" ")
                  .map((parca) => parca[0])
                  .join("")}
              </span>
              <div>
                <p className="ilan-satici-ad">{satici.ad}</p>
                <p className="ilan-satici-alt">{arac.kimden} · Bireysel satıcı</p>
              </div>
            </div>

            {telefon && whatsapp ? (
              <>
                <a className="ilan-tel" href={`tel:+${telefon}`}>
                  <span>Cep</span>
                  <b>{telefonYazisi}</b>
                </a>
                <div className="ilan-dugmeler">
                  <a className="btn primary" href={`tel:+${telefon}`}>
                    <Ikon ad="telefon" />
                    Ara
                  </a>
                  <a className="btn ilan-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">
                    <Ikon ad="mesaj" />
                    WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <p className="ilan-satici-bos">Telefon numarası eklenecek.</p>
            )}

            <p className="ilan-satici-konum">
              <Ikon ad="konum" />
              {konum}
            </p>
          </div>
        </aside>
      </div>

      <Sekmeler
        sekmeler={[
          { id: "detay", baslik: "İlan Detayları", icerik: ilanDetaylari },
          { id: "teknik", baslik: "Teknik Özellikler", icerik: teknikOzellikler }
        ]}
      />

      {/* Telefonda uzun sayfanın her yerinden tek dokunuşla arama. */}
      {telefon && whatsapp ? (
        <div className="ilan-cubuk">
          <span className="ilan-cubuk-fiyat">{fiyat ?? km}</span>
          <a className="btn primary" href={`tel:+${telefon}`}>
            <Ikon ad="telefon" />
            Ara
          </a>
          <a className="btn ilan-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">
            <Ikon ad="mesaj" />
            WhatsApp
          </a>
        </div>
      ) : null}
    </main>
  );
}
