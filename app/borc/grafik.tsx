"use client";

import { binYazi, tarihKisa } from "./bicim";
import { gunFarki, gunEkle, type NakitSatiri } from "./hesap";
import type { Hesap } from "./ortak";

/** Grafik renkleri borc.css'te --g1…--g6 olarak tanımlı (açık/koyu temaya göre). Hesap sırasına göre verilir. */
export const hesapRengi = (sira: number) => `var(--g${(sira % 6) + 1})`;

/** Her hesabın grafik rengi: ekrandan ekrana aynı kalsın diye hesabın sırasına bağlı. */
export function renkHaritasi(hesaplar: Hesap[]): Map<number, string> {
  const sirali = [...hesaplar].sort((a, b) => a.sira - b.sira || a.id - b.id);
  return new Map(sirali.map((h, i) => [h.id, hesapRengi(i)]));
}

/** "Güzel" eksen üst sınırı ve adımı: 1, 2, 2,5, 5 × 10ⁿ (birim: kuruş). */
function eksen(enBuyuk: number, bolum = 4): { ust: number; adim: number } {
  const ham = Math.max(enBuyuk, 1) / bolum;
  const us = Math.pow(10, Math.floor(Math.log10(ham)));
  const adim = ([1, 2, 2.5, 5, 10].find((k) => k * us >= ham) ?? 10) * us;
  return { ust: adim * Math.ceil(Math.max(enBuyuk, 1) / adim), adim };
}

export type Dilim = { anahtar: string | number; ad: string; deger: number; renk: string };

/** Halka grafik: borcun hesaplara dağılımı. Ortada toplam. */
export function Halka({ dilimler, merkezAlt, merkez, etiket }: { dilimler: Dilim[]; merkezAlt: string; merkez: string; etiket: string }) {
  const toplam = dilimler.reduce((t, d) => t + d.deger, 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  const BOSLUK = dilimler.length > 1 ? 3 : 0;
  let ilerleme = 0;

  return (
    <figure className="halka">
      <svg viewBox="0 0 200 200" role="img" aria-label={etiket}>
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--cubuk-iz)" strokeWidth="26" />
        {toplam > 0 &&
          dilimler.map((d) => {
            const uzunluk = (d.deger / toplam) * C;
            const goster = Math.max(uzunluk - BOSLUK, 0.5);
            const el = (
              <circle
                key={d.anahtar}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={d.renk}
                strokeWidth="26"
                strokeDasharray={`${goster} ${C - goster}`}
                strokeDashoffset={-ilerleme}
                transform="rotate(-90 100 100)"
              />
            );
            ilerleme += uzunluk;
            return el;
          })}
        <text x="100" y="94" textAnchor="middle" className="halka-alt">
          {merkezAlt}
        </text>
        <text x="100" y="116" textAnchor="middle" className="halka-ust t">
          {merkez}
        </text>
      </svg>
      <figcaption>
        <ul className="gosterge">
          {dilimler.map((d) => (
            <li key={d.anahtar}>
              <i style={{ background: d.renk }} aria-hidden="true" />
              <span>{d.ad}</span>
              <b className="t">{toplam > 0 ? `%${Math.round((d.deger / toplam) * 100)}` : "–"}</b>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

export type Seri = { ad: string; renk: string; degerler: number[] };

/**
 * Yığılmış çubuk grafik: her sütun bir ay; `cizgi` verilirse üstüne kesikli çizgi (ör. diğer dahil toplam).
 * Değerler kuruş; eksen "B" (bin TL).
 */
export function YigmaCubuk({
  etiketler,
  seriler,
  cizgi,
  ozet
}: {
  etiketler: string[];
  seriler: Seri[];
  cizgi?: { ad: string; renk: string; degerler: (number | null)[] };
  ozet: string;
}) {
  const n = etiketler.length;
  const toplamlar = etiketler.map((_, i) => seriler.reduce((t, s) => t + (s.degerler[i] ?? 0), 0));
  const enBuyuk = Math.max(...toplamlar, ...(cizgi?.degerler.map((d) => d ?? 0) ?? []), 1);
  const { ust, adim } = eksen(enBuyuk);
  const G = 340;
  const Y = 200;
  const sol = 4;
  const sag = 40;
  const ust0 = 10;
  const alt = 24;
  const en = G - sol - sag;
  const yuk = Y - ust0 - alt;
  const x = (i: number) => sol + (i + 0.5) * (en / n);
  const y = (d: number) => ust0 + yuk - (d / ust) * yuk;
  const genislik = Math.min(34, (en / n) * 0.66);
  const etiketAdimi = n <= 8 ? 1 : n <= 14 ? 2 : 3;
  const cizgiNoktalari = cizgi ? cizgi.degerler.map((d, i) => (d === null ? null : ([x(i), y(d)] as const))) : [];
  const yol = cizgiNoktalari.reduce((s, p) => (p ? `${s}${s ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}` : s), "");

  const cizgiler = [];
  for (let d = 0; d <= ust + 1; d += adim) cizgiler.push(d);

  return (
    <figure className="yigma">
      <svg viewBox={`0 0 ${G} ${Y}`} role="img" aria-label={ozet}>
        {cizgiler.map((d) => (
          <g key={d}>
            <line x1={sol} x2={G - sag + 6} y1={y(d)} y2={y(d)} className="izgara" />
            <text x={G - sag + 10} y={y(d) + 3.5} className="eksen">
              {binYazi(d)}
            </text>
          </g>
        ))}
        {etiketler.map((_, i) => {
          let alttan = 0;
          return (
            <g key={i}>
              {seriler.map((s) => {
                const d = s.degerler[i] ?? 0;
                if (d <= 0) return null;
                const yukseklik = (d / ust) * yuk;
                const kutu = <rect key={s.ad} x={x(i) - genislik / 2} y={y(0) - alttan - yukseklik} width={genislik} height={yukseklik} fill={s.renk} rx="2" />;
                alttan += yukseklik;
                return kutu;
              })}
            </g>
          );
        })}
        {cizgi && yol && <path d={yol} fill="none" stroke={cizgi.renk} strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />}
        {cizgi && cizgiNoktalari.map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--yuzey)" stroke={cizgi.renk} strokeWidth="2" />)}
        {etiketler.map((e, i) =>
          i % etiketAdimi === 0 ? (
            <text key={i} x={x(i)} y={Y - 7} textAnchor="middle" className="eksen">
              {e}
            </text>
          ) : null
        )}
      </svg>
      <figcaption>
        <ul className="gosterge">
          {seriler.map((s) => (
            <li key={s.ad}>
              <i style={{ background: s.renk }} aria-hidden="true" />
              <span>{s.ad}</span>
            </li>
          ))}
          {cizgi && (
            <li>
              <i className="kesikli" style={{ borderColor: cizgi.renk }} aria-hidden="true" />
              <span>{cizgi.ad}</span>
            </li>
          )}
        </ul>
      </figcaption>
    </figure>
  );
}

/**
 * Nakit akışı: gün gün bakiye. Kesin seri yalnızca kesin kalemlerle, iyimser seri belirsiz gelirler ve
 * alacaklar da gelirse. Basamaklı çizgi: bakiye bir olay olana kadar sabit.
 */
export function BakiyeGrafigi({ baslangic, satirlar, bugun, ufuk }: { baslangic: number; satirlar: NakitSatiri[]; bugun: string; ufuk: number }) {
  const G = 340;
  const Y = 190;
  const sol = 4;
  const sag = 44;
  const ust0 = 10;
  const alt = 24;
  const en = G - sol - sag;
  const yuk = Y - ust0 - alt;

  const tum = [baslangic, ...satirlar.flatMap((s) => [s.kesinBakiye, s.iyimserBakiye])];
  const enAz = Math.min(...tum, 0);
  const enCok = Math.max(...tum, 0);
  const aralik = Math.max(enCok - enAz, 1);
  const bosluk = aralik * 0.08;
  const alt0 = enAz - (enAz < 0 ? bosluk : 0);
  const ust1 = enCok + bosluk;
  const x = (gun: number) => sol + (Math.min(Math.max(gun, 0), ufuk) / ufuk) * en;
  const y = (d: number) => ust0 + yuk - ((d - alt0) / (ust1 - alt0)) * yuk;

  function basamak(alan: "kesinBakiye" | "iyimserBakiye") {
    let yol = `M${x(0).toFixed(1)},${y(baslangic).toFixed(1)}`;
    let onceki = baslangic;
    for (const s of satirlar) {
      const gx = x(gunFarki(bugun, s.tarih));
      yol += `L${gx.toFixed(1)},${y(onceki).toFixed(1)}L${gx.toFixed(1)},${y(s[alan]).toFixed(1)}`;
      onceki = s[alan];
    }
    return `${yol}L${x(ufuk).toFixed(1)},${y(onceki).toFixed(1)}`;
  }

  const { adim } = eksen(aralik, 4);
  const yIzgara: number[] = [];
  for (let d = Math.ceil(alt0 / adim) * adim; d <= ust1; d += adim) yIzgara.push(d);
  const xIzgara = [0, 0.25, 0.5, 0.75, 1].map((o) => Math.round(ufuk * o));

  return (
    <figure className="yigma bakiye">
      <svg viewBox={`0 0 ${G} ${Y}`} role="img" aria-label={`${ufuk} günlük bakiye seyri`}>
        {yIzgara.map((d) => (
          <g key={d}>
            <line x1={sol} x2={G - sag + 6} y1={y(d)} y2={y(d)} className={d === 0 ? "izgara sifir" : "izgara"} />
            <text x={G - sag + 10} y={y(d) + 3.5} className="eksen">
              {binYazi(d)}
            </text>
          </g>
        ))}
        <path d={basamak("iyimserBakiye")} fill="none" stroke="var(--g3)" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
        <path d={basamak("kesinBakiye")} fill="none" stroke="var(--g2)" strokeWidth="2.4" strokeLinejoin="round" />
        {xIzgara.map((g, i) => (
          <text key={g} x={x(g)} y={Y - 7} textAnchor={i === 0 ? "start" : i === xIzgara.length - 1 ? "end" : "middle"} className="eksen">
            {tarihKisa(gunEkle(bugun, g))}
          </text>
        ))}
      </svg>
      <figcaption>
        <ul className="gosterge">
          <li>
            <i style={{ background: "var(--g2)" }} aria-hidden="true" />
            <span>Kesin</span>
          </li>
          <li>
            <i className="kesikli" style={{ borderColor: "var(--g3)" }} aria-hidden="true" />
            <span>Belirsizler dahil</span>
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
