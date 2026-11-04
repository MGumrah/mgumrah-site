"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

type Sekme = { id: string; baslik: string; icerik: ReactNode };

/**
 * "İlan Detayları / Teknik Özellikler" sekmeleri. İki panel de sayfanın
 * HTML'inde hazır duruyor, yalnızca görünen değişiyor — JavaScript yüklenmeden
 * de ilk sekme okunur.
 */
export default function Sekmeler({ sekmeler }: { sekmeler: Sekme[] }) {
  const [aktif, setAktif] = useState(sekmeler[0].id);
  const onEk = useId();

  function oklarla(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const hedef = sekmeler[(i + (e.key === "ArrowRight" ? 1 : -1) + sekmeler.length) % sekmeler.length];
    setAktif(hedef.id);
    document.getElementById(`${onEk}-${hedef.id}-sekme`)?.focus();
  }

  return (
    <div className="ilan-sekmeler">
      <div className="ilan-sekme-listesi" role="tablist" aria-label="İlan bölümleri">
        {sekmeler.map((sekme, i) => (
          <button
            key={sekme.id}
            id={`${onEk}-${sekme.id}-sekme`}
            type="button"
            role="tab"
            className="ilan-sekme"
            aria-selected={aktif === sekme.id}
            aria-controls={`${onEk}-${sekme.id}`}
            tabIndex={aktif === sekme.id ? 0 : -1}
            onClick={() => setAktif(sekme.id)}
            onKeyDown={(e) => oklarla(e, i)}
          >
            {sekme.baslik}
          </button>
        ))}
      </div>
      {sekmeler.map((sekme) => (
        <div
          key={sekme.id}
          id={`${onEk}-${sekme.id}`}
          role="tabpanel"
          aria-labelledby={`${onEk}-${sekme.id}-sekme`}
          className="ilan-sekme-paneli"
          hidden={aktif !== sekme.id}
        >
          {sekme.icerik}
        </div>
      ))}
    </div>
  );
}
