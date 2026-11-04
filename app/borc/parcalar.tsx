"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { tl, tlTam, yuzde } from "./bicim";

/** Tutar: "rakamları gizle" açıkken bulanıklaşır (sınıf kökte, bkz. borc.css .gizli). */
export function Tl({ k, tam = false, isaret = false }: { k: number; tam?: boolean; isaret?: boolean }) {
  return <span className="t">{isaret && k > 0 ? "+" : ""}{tam ? tlTam(k) : tl(k)}</span>;
}

/** Limit kullanımı çubuğu. Renk eşiği: %60 sarı, %85 kırmızı. */
export function Cubuk({ oran, etiket }: { oran: number | null; etiket?: string }) {
  if (oran === null) return null;
  const seviye = oran >= 0.85 ? "yuksek" : oran >= 0.6 ? "orta" : "iyi";
  return (
    <div
      className={`cubuk ${seviye}`}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(oran * 100)}
      aria-label={etiket ?? `Limit kullanımı ${yuzde(oran)}`}
    >
      <span style={{ width: `${Math.min(100, Math.max(0, oran * 100))}%` }} />
    </div>
  );
}

export function Bolum({ baslik, sag, children }: { baslik: string; sag?: ReactNode; children: ReactNode }) {
  return (
    <section className="bolum">
      <header className="bolum-ust">
        <h2>{baslik}</h2>
        {sag}
      </header>
      {children}
    </section>
  );
}

export function Bos({ children }: { children: ReactNode }) {
  return <p className="bos">{children}</p>;
}

/**
 * Alttan açılan pencere. Kapatma: arka plana dokunma, Esc, ✕. Açılınca ilk
 * alana odaklanır; klavye açılınca içerik kayar (viewport interactiveWidget).
 */
export function Pencere({ baslik, kapat, children }: { baslik: string; kapat: () => void; children: ReactNode }) {
  const kutu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onceki = document.activeElement as HTMLElement | null;
    const tus = (e: KeyboardEvent) => e.key === "Escape" && kapat();
    document.addEventListener("keydown", tus);
    document.body.style.overflow = "hidden";
    kutu.current?.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea")?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", tus);
      document.body.style.overflow = "";
      onceki?.focus?.({ preventScroll: true });
    };
  }, [kapat]);

  return (
    <div className="pencere-zemin" onMouseDown={(e) => e.target === e.currentTarget && kapat()}>
      <div className="pencere" role="dialog" aria-modal="true" aria-label={baslik} ref={kutu}>
        <header className="pencere-ust">
          <h2>{baslik}</h2>
          <button type="button" className="kapat" onClick={kapat} aria-label="Kapat">
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

/** Etiketli form alanı. */
export function Alan({ etiket, ipucu, children }: { etiket: string; ipucu?: ReactNode; children: ReactNode }) {
  return (
    <label className="alan">
      <span>{etiket}</span>
      {children}
      {ipucu && <small>{ipucu}</small>}
    </label>
  );
}

/** İki-üç seçenekli kaydırıcı (iOS "segmented control"): ekranın içindeki alt bölümler, süreler, seçenekler. */
export function Segment<T extends string>({
  secenekler,
  secili,
  sec,
  etiket
}: {
  secenekler: { id: T; ad: string }[];
  secili: T;
  sec: (id: T) => void;
  etiket: string;
}) {
  return (
    <div className="segment" role="tablist" aria-label={etiket} style={{ gridTemplateColumns: `repeat(${secenekler.length}, 1fr)` }}>
      {secenekler.map((s) => (
        <button key={s.id} type="button" role="tab" aria-selected={secili === s.id} className={secili === s.id ? "secili" : ""} onClick={() => sec(s.id)}>
          {s.ad}
        </button>
      ))}
    </div>
  );
}

/** Hesap türü etiketi: KK / KMH / Diğer. */
export function TurRozeti({ tur }: { tur: "kart" | "kmh" | "diger" }) {
  return <span className={`tur-rozet ${tur}`}>{tur === "kart" ? "KK" : tur === "kmh" ? "KMH" : "Diğer"}</span>;
}
