"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";
import { Ikon, type IkonAdi } from "./ikonlar";
import type { Kisi } from "./ortak";

/** Adın baş harfi, kişiye sabit bir renkte. Renk sırası id'den gelir: kişi adını değiştirse de rengi aynı kalır. */
export function Avatar({ kisi, boyut = "orta" }: { kisi: Kisi | undefined; boyut?: "kucuk" | "orta" | "buyuk" }) {
  const harf = kisi ? kisi.ad.trim().charAt(0).toLocaleUpperCase("tr-TR") : "?";
  return (
    <span className={`b-avatar b-avatar-${boyut}`} data-renk={kisi ? ((kisi.id - 1) % 4) + 1 : 0} aria-hidden="true">
      {harf}
    </span>
  );
}

/** 44 piksellik dokunma alanında 26 piksellik kutu — parmakla da ıskalanmaz. */
export function OnayKutusu({ isaretli, etiket, degis }: { isaretli: boolean; etiket: string; degis: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={isaretli} aria-label={etiket} className="b-onay" onClick={degis}>
      <span className="b-onay-kutu">
        <Ikon ad="onay" />
      </span>
    </button>
  );
}

/**
 * Ekranın ortasında (telefonda alttan açılan) pencere. Açık olması için
 * render edilmesi yeterli; kapatınca üst bileşen kaldırır. Böylece her açılışta
 * form sıfırdan kurulur, önceki kalemin yarım bıraktığı değer kalmaz.
 *
 * Dışına dokunmak yalnızca `disaridanKapanir` ile kapatır: formlarda yanlışlıkla
 * boşluğa dokunup yazılanı kaybetmek, bir tuşa fazladan basmaktan pahalı.
 */
export function Pencere({
  baslik,
  kapat,
  children,
  alt,
  disaridanKapanir = false,
  sinif
}: {
  baslik: string;
  kapat: () => void;
  children: ReactNode;
  alt?: ReactNode;
  disaridanKapanir?: boolean;
  sinif?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const basiDisarida = useRef(false);
  const baslikId = useId();

  useEffect(() => {
    const pencere = ref.current;
    if (!pencere) return;
    if (!pencere.open) pencere.showModal();
    // showModal odağı ilk düğmeye (Kapat) verir; yeni kayıt formunda ilk kutuya geçsin.
    pencere.querySelector<HTMLElement>("[data-ilk-odak]")?.focus();
    return () => pencere.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className={sinif ? `b-pencere ${sinif}` : "b-pencere"}
      aria-labelledby={baslikId}
      onCancel={(e) => {
        e.preventDefault();
        kapat();
      }}
      onPointerDown={(e) => {
        basiDisarida.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Kutunun içinde başlayıp dışarıda biten bir sürükleme (metin seçmek gibi) kapatmasın.
        if (disaridanKapanir && basiDisarida.current && e.target === e.currentTarget) kapat();
      }}
    >
      <div className="b-pencere-kutu">
        <header className="b-pencere-ust">
          <h2 id={baslikId}>{baslik}</h2>
          <button type="button" className="b-dugme b-dugme-ikon b-dugme-sade" onClick={kapat} aria-label="Kapat">
            <Ikon ad="kapat" />
          </button>
        </header>
        <div className="b-pencere-govde">{children}</div>
        {alt ? <footer className="b-pencere-alt">{alt}</footer> : null}
      </div>
    </dialog>
  );
}

export function Secim({ children, ...ozellikler }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="b-secim">
      <select className="b-girdi" {...ozellikler}>
        {children}
      </select>
      <Ikon ad="asagi" />
    </span>
  );
}

export function BosDurum({
  ikon,
  baslik,
  children,
  eylem
}: {
  ikon: IkonAdi;
  baslik: string;
  children?: ReactNode;
  eylem?: ReactNode;
}) {
  return (
    <div className="b-bos">
      <span className="b-bos-ikon">
        <Ikon ad={ikon} />
      </span>
      <p className="b-bos-baslik">{baslik}</p>
      {children ? <p className="b-bos-metin">{children}</p> : null}
      {eylem}
    </div>
  );
}

/** Kişi seçimi: "Kim yapacak?", "Kim ödedi?". */
export function KisiSecimi({
  kisiler,
  secili,
  sec,
  bosEtiket
}: {
  kisiler: Kisi[];
  secili: number | null;
  sec: (id: number | null) => void;
  bosEtiket?: string;
}) {
  return (
    <div className="b-cipler">
      {bosEtiket ? (
        <button type="button" className="b-cip-secim" aria-pressed={secili === null} onClick={() => sec(null)}>
          {bosEtiket}
        </button>
      ) : null}
      {kisiler.map((kisi) => (
        <button
          key={kisi.id}
          type="button"
          className="b-cip-secim"
          aria-pressed={secili === kisi.id}
          onClick={() => sec(kisi.id)}
        >
          <Avatar kisi={kisi} boyut="kucuk" />
          {kisi.ad}
        </button>
      ))}
    </div>
  );
}

/** "3 dk önce" gibi yazılar ve "bugün" dakikada bir tazelensin diye. */
export function useDakika() {
  const [, setSayac] = useState(0);
  useEffect(() => {
    const zamanlayici = window.setInterval(() => setSayac((sayac) => sayac + 1), 60_000);
    return () => window.clearInterval(zamanlayici);
  }, []);
}
