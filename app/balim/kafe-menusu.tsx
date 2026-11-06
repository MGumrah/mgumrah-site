"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Ikon } from "./ikonlar";

/**
 * Üst çubuktaki "Kafe" menüsü: panelden kafenin öteki ekranlarına (balim.cafe) geçiş.
 * Tersi de var: Hesap ve Adisyon'un başlık listelerinde ve ana sayfada "Aile paneli" bağlantısı
 * panel.balim.cafe'ye gider (BalimKafe deposu). Adresler mutlaktır: panel mgumrah.com/balim'den
 * de açılabildiği için göreli yol yanlış siteye giderdi.
 */
const EKRANLAR = [
  { adres: "https://balim.cafe/", ad: "Kafenin sitesi", not: "Ana sayfa, saatler, iletişim" },
  { adres: "https://balim.cafe/menu/", ad: "Menü", not: "Müşterinin gördüğü menü" },
  { adres: "https://balim.cafe/hesap/", ad: "Hesap", not: "Kim ne içti, toplamı gör" },
  { adres: "https://balim.cafe/adisyon/", ad: "Adisyon", not: "Masalar, sipariş ve kasa" },
  { adres: "https://balim.cafe/tv/", ad: "TV menü ekranı", not: "Kafedeki televizyon" }
] as const;

export default function KafeMenusu() {
  const [acik, setAcik] = useState(false);
  const kap = useRef<HTMLDivElement>(null);
  const kimlik = useId();

  useEffect(() => {
    if (!acik) return;
    const disarisi = (e: PointerEvent) => {
      if (!kap.current?.contains(e.target as Node)) setAcik(false);
    };
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcik(false);
    };
    document.addEventListener("pointerdown", disarisi);
    document.addEventListener("keydown", tus);
    return () => {
      document.removeEventListener("pointerdown", disarisi);
      document.removeEventListener("keydown", tus);
    };
  }, [acik]);

  return (
    <div className="b-kafe" ref={kap}>
      <button
        type="button"
        className="b-dugme b-dugme-sade b-kafe-dugme"
        aria-expanded={acik}
        aria-controls={kimlik}
        aria-label="Kafe ekranları"
        onClick={() => setAcik((a) => !a)}
      >
        <Ikon ad="kahve" />
        <span className="b-kafe-yazi">Kafe</span>
        <Ikon ad="asagi" className="b-kafe-ok" />
      </button>
      {acik ? (
        <nav id={kimlik} className="b-kafe-liste" aria-label="Kafe ekranları">
          {EKRANLAR.map((e) => (
            <a key={e.adres} href={e.adres} rel="noopener">
              <span className="b-kafe-ad">{e.ad}</span>
              <span className="b-kafe-not">{e.not}</span>
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
