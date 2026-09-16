"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type UIEvent } from "react";
import type { Foto } from "./ilan";

type Boy = "lg" | "md" | "sm";

const yol = (foto: Foto, boy: Boy) => `/images/civic/${foto.id}-${boy}.jpg`;

/** Uzun kenar lg'de 1600, md'de 960 piksel; dikey karede genişlik bunun 3/4'ü. */
const genislik = (foto: Foto, uzunKenar: number) => (foto.dikey ? (uzunKenar * 3) / 4 : uzunKenar);

const srcSet = (foto: Foto) =>
  `${yol(foto, "md")} ${genislik(foto, 960)}w, ${yol(foto, "lg")} ${genislik(foto, 1600)}w`;

const azHareket = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Eski karelerde tarih görsel etiketle birlikte ekran okuyucuya da söylensin. */
const altYazisi = (foto: Foto) => (foto.tarih ? `${foto.alt} (${foto.tarih})` : foto.alt);

function TarihEtiketi({ foto }: { foto: Foto }) {
  return foto.tarih ? (
    <span className="galeri-tarih" aria-hidden="true">
      {foto.tarih} fotoğrafı
    </span>
  ) : null;
}

/** Şeridi i. kareye kaydırır. Kareler şeridin tam genişliği olduğu için hedef i × genişlik. */
function kaydir(serit: HTMLElement | null, i: number, yumusak = true) {
  if (!serit) return;
  serit.scrollTo({ left: i * serit.clientWidth, behavior: yumusak && !azHareket() ? "smooth" : "instant" });
}

function OkIkonu({ yon }: { yon: "sol" | "sag" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={yon === "sol" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

/**
 * Sahibinden düzeninde galeri: büyük sahne, altında küçük resimler, tıklayınca
 * tam ekran. Sahne bir scroll-snap şeridi — telefonda parmakla kaydırma
 * tarayıcının kendi hareketi olsun, taklit edilmesin diye. Hangi karede
 * olunduğu kaydırma konumundan okunur; oklar ve küçük resimler yalnızca
 * şeridi kaydırır, sayaç kendiliğinden güncellenir.
 */
export default function Galeri({ fotograflar }: { fotograflar: Foto[] }) {
  const adet = fotograflar.length;
  const [sira, setSira] = useState(0);
  const sahne = useRef<HTMLDivElement>(null);
  const perde = useRef<HTMLDialogElement>(null);
  const perdeSerit = useRef<HTMLDivElement>(null);
  const kucukler = useRef<HTMLDivElement>(null);

  // Bir kez kurulan ResizeObserver güncel kareyi buradan okur.
  const siraRef = useRef(0);
  useEffect(() => {
    siraRef.current = sira;
  }, [sira]);

  const git = (serit: HTMLElement | null, i: number) => kaydir(serit, (i + adet) % adet);

  function kaydirmayiOku(e: UIEvent<HTMLDivElement>) {
    const serit = e.currentTarget;
    if (!serit.clientWidth) return;
    const i = Math.round(serit.scrollLeft / serit.clientWidth);
    setSira(Math.min(adet - 1, Math.max(0, i)));
  }

  function oklarlaGez(e: KeyboardEvent<HTMLElement>, serit: HTMLElement | null) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    git(serit, sira + (e.key === "ArrowRight" ? 1 : -1));
  }

  function perdeyiAc(i: number) {
    perde.current?.showModal();
    kaydir(perdeSerit.current, i, false);
  }

  // Tam ekranda gezilen kare, perde kapanınca sahnede de açık kalsın.
  function perdeKapandi() {
    kaydir(sahne.current, sira, false);
  }

  function boslugaTiklandi(e: MouseEvent<HTMLElement>) {
    if (e.target === e.currentTarget) perde.current?.close();
  }

  // Pencere boyu değişince kaydırma konumu eski genişlikte kalır; kareyi yeniden hizala.
  useEffect(() => {
    const serit = sahne.current;
    if (!serit) return;
    const gozlemci = new ResizeObserver(() => kaydir(serit, siraRef.current, false));
    gozlemci.observe(serit);
    return () => gozlemci.disconnect();
  }, []);

  // Telefonda küçük resimler tek satır kayar; açık olanı görünür tut. Izgara
  // düzeninde şerit taşmadığı için bu hiçbir şey yapmaz.
  useEffect(() => {
    const serit = kucukler.current;
    const kucuk = serit?.children[sira] as HTMLElement | undefined;
    if (!serit || !kucuk || serit.scrollWidth <= serit.clientWidth) return;
    serit.scrollTo({
      left: kucuk.offsetLeft - (serit.clientWidth - kucuk.clientWidth) / 2,
      behavior: azHareket() ? "instant" : "smooth"
    });
  }, [sira]);

  const sayac = `${sira + 1}/${adet} Fotoğraf`;

  return (
    <section className="galeri" aria-label="Fotoğraflar">
      <div className="galeri-sahne">
        <div
          ref={sahne}
          className="galeri-serit"
          tabIndex={0}
          aria-label="Fotoğraflar — sağ ve sol ok tuşlarıyla gezilebilir"
          onScroll={kaydirmayiOku}
          onKeyDown={(e) => oklarlaGez(e, sahne.current)}
        >
          {fotograflar.map((foto, i) => (
            <button
              key={foto.id}
              type="button"
              className="galeri-kare"
              title="Büyüt"
              tabIndex={-1}
              onClick={() => perdeyiAc(i)}
            >
              <img
                src={yol(foto, "md")}
                srcSet={srcSet(foto)}
                sizes={foto.dikey ? "(max-width: 760px) 57vw, 420px" : "(max-width: 760px) 100vw, 640px"}
                width={genislik(foto, 960)}
                height={foto.dikey ? 960 : 720}
                alt={altYazisi(foto)}
                // Kapak sayfanın en büyük görseli: ilk karede boş sahne görünmesin diye
                // eşzamansız çözülmüyor, diğerleri gerektikçe yüklenip çözülüyor.
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                decoding={i === 0 ? "sync" : "async"}
                draggable={false}
              />
              <TarihEtiketi foto={foto} />
            </button>
          ))}
        </div>

        <button type="button" className="galeri-ok onceki" aria-label="Önceki fotoğraf" onClick={() => git(sahne.current, sira - 1)}>
          <OkIkonu yon="sol" />
        </button>
        <button type="button" className="galeri-ok sonraki" aria-label="Sonraki fotoğraf" onClick={() => git(sahne.current, sira + 1)}>
          <OkIkonu yon="sag" />
        </button>
        <span className="galeri-sayac" aria-live="polite">
          {sayac}
        </span>
        <button type="button" className="galeri-buyut" onClick={() => perdeyiAc(sira)}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          Büyük Fotoğraf
        </button>
      </div>

      <div ref={kucukler} className="galeri-kucukler">
        {fotograflar.map((foto, i) => (
          <button
            key={foto.id}
            type="button"
            className={`galeri-kucuk${i === sira ? " is-aktif" : ""}`}
            aria-label={`${i + 1}. fotoğraf: ${altYazisi(foto)}`}
            aria-current={i === sira}
            onClick={() => git(sahne.current, i)}
          >
            <img src={yol(foto, "sm")} alt="" width={genislik(foto, 320)} height={foto.dikey ? 320 : 240} decoding="async" />
          </button>
        ))}
      </div>

      <dialog
        ref={perde}
        className="galeri-perde"
        aria-label="Fotoğraflar, tam ekran"
        onClose={perdeKapandi}
        onKeyDown={(e) => oklarlaGez(e, perdeSerit.current)}
      >
        <div ref={perdeSerit} className="galeri-serit" onScroll={kaydirmayiOku}>
          {fotograflar.map((foto) => (
            <figure key={foto.id} className="galeri-kare" onClick={boslugaTiklandi}>
              <img
                src={yol(foto, "lg")}
                srcSet={srcSet(foto)}
                sizes="100vw"
                width={genislik(foto, 1600)}
                height={foto.dikey ? 1600 : 1200}
                alt={altYazisi(foto)}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <TarihEtiketi foto={foto} />
            </figure>
          ))}
        </div>
        <span className="galeri-sayac">{sayac}</span>
        <button type="button" className="galeri-kapat" aria-label="Kapat" onClick={() => perde.current?.close()}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <button type="button" className="galeri-ok onceki" aria-label="Önceki fotoğraf" onClick={() => git(perdeSerit.current, sira - 1)}>
          <OkIkonu yon="sol" />
        </button>
        <button type="button" className="galeri-ok sonraki" aria-label="Sonraki fotoğraf" onClick={() => git(perdeSerit.current, sira + 1)}>
          <OkIkonu yon="sag" />
        </button>
      </dialog>
    </section>
  );
}
