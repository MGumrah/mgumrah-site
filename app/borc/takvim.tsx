"use client";

import { useMemo } from "react";
import { useBorc } from "./baglam";
import { dovizYazi, gunAdi, kalanYazi, tarihKisa } from "./bicim";
import Gelir from "./gelir";
import { takvimOlaylari, type TakvimOlayi } from "./hesap";
import Nakit from "./nakit";
import { Bolum, Bos, Segment, Tl } from "./parcalar";

const UFUK_GUN = 75;
const NAKIT_PENCERESI_GUN = 30;

const ETIKET: Record<TakvimOlayi["tur"], string> = { kesim: "Ekstre kesimi", sonOdeme: "Son ödeme", gelir: "Gelir" };

type Alt = "odemeler" | "gelirler" | "nakit";
const SEGMENTLER: { id: Alt; ad: string }[] = [
  { id: "odemeler", ad: "Ödemeler" },
  { id: "gelirler", ad: "Gelirler" },
  { id: "nakit", ad: "Nakit akışı" }
];

/** Takvim sekmesi: Ödemeler · Gelirler · Nakit akışı (iOS'taki gibi üç bölüm). `alt` adresin devamıdır (takvim/gelirler). */
export default function Takvim({ alt }: { alt: string }) {
  const { git } = useBorc();
  const secili: Alt = alt === "gelirler" || alt === "nakit" ? alt : "odemeler";
  return (
    <>
      <Segment secenekler={SEGMENTLER} secili={secili} sec={(id) => git(id === "odemeler" ? "takvim" : `takvim/${id}`)} etiket="Takvim bölümü" />
      {secili === "odemeler" && <Odemeler />}
      {secili === "gelirler" && <Gelir />}
      {secili === "nakit" && <Nakit />}
    </>
  );
}

function Odemeler() {
  const { veri, bugun } = useBorc();
  const olaylar = useMemo(() => takvimOlaylari(veri, bugun, UFUK_GUN), [veri, bugun]);
  const geciken = olaylar.filter((o) => o.gecikmis);
  const yaklasan = olaylar.filter((o) => !o.gecikmis);

  // "Önümüzdeki 30 günde ne çıkar, ne girer": tutarı bilinen (ya da tahmin edilebilen) ödemeler sayılır.
  const nakit = useMemo(() => {
    const pencere = yaklasan.filter((o) => o.kalanGun <= NAKIT_PENCERESI_GUN);
    const odemeler = pencere.filter((o) => o.tur === "sonOdeme" && o.tutar !== undefined);
    const gelirler = pencere.filter((o) => o.tur === "gelir");
    const toplam = (liste: TakvimOlayi[], alan: "tutar" | "asgari") => liste.reduce((t, o) => t + (o[alan] ?? o.tutar ?? 0), 0);
    return {
      tamOdeme: toplam(odemeler, "tutar"),
      asgari: toplam(odemeler, "asgari"),
      gelir: gelirler.reduce((t, o) => t + (o.tutar ?? 0), 0),
      kesinOlmayanGelir: gelirler.some((o) => o.belirsiz),
      tahminiOdemeVar: odemeler.some((o) => o.tutarTahmini),
      tutarsizOdemeVar: pencere.some((o) => o.tur === "sonOdeme" && o.tutar === undefined)
    };
  }, [yaklasan]);

  if (olaylar.length === 0) return <Bos>Takvimde gösterilecek bir şey yok. Kartlara kesim günü ve son ödeme günü girilince burada görünür.</Bos>;

  return (
    <>
      {geciken.length > 0 && (
        <Bolum baslik="Geciken alacaklar">
          <ul className="liste">
            {geciken.map((o) => (
              <Olay key={o.anahtar} o={o} />
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum baslik={`Önümüzdeki ${NAKIT_PENCERESI_GUN} gün`}>
        <dl className="degerler">
          <div><dt>Son ödemesi gelen ekstreler (tam)</dt><dd><Tl k={nakit.tamOdeme} /></dd></div>
          <div><dt>…yalnızca asgari ödersem</dt><dd><Tl k={nakit.asgari} /></dd></div>
          <div><dt>Beklenen gelir{nakit.kesinOlmayanGelir ? " (kesin değil)" : ""}</dt><dd className="pozitif"><Tl k={nakit.gelir} /></dd></div>
        </dl>
        {nakit.tahminiOdemeVar && <p className="not">Henüz kesilmemiş ekstrelerin tutarı, o döneme düşen harcama ve taksitlerden tahmin edildi (≈).</p>}
        {nakit.tutarsizOdemeVar && <p className="not">Bazı kartların tutarı hiç bilinmediği için (ekstre yok, harcama yok) bu toplama girmedi.</p>}
      </Bolum>

      <Bolum baslik="Takvim">
        {yaklasan.length === 0 ? (
          <Bos>Yaklaşan olay yok.</Bos>
        ) : (
          <ul className="liste">
            {yaklasan.map((o) => (
              <Olay key={o.anahtar} o={o} />
            ))}
          </ul>
        )}
      </Bolum>
    </>
  );
}

function Olay({ o }: { o: TakvimOlayi }) {
  const [, , gun] = o.tarih.split("-");
  const acil = o.tur === "sonOdeme" && o.kalanGun <= 3;
  return (
    <li className={`olay ${o.tur}${o.gecikmis ? " gecikmis" : ""}${acil ? " acil" : ""}`}>
      <div className="tarih-kutu" aria-hidden="true">
        <b>{Number(gun)}</b>
        <span>{tarihKisa(o.tarih).split(" ")[1]}</span>
      </div>
      <div className="olay-metin">
        <strong>{o.baslik}</strong>
        <span className="alt">
          {ETIKET[o.tur]} · {gunAdi(o.tarih)} · <span className={o.gecikmis || acil ? "negatif" : ""}>{kalanYazi(o.kalanGun)}</span>
          {o.tahmini ? (o.tur === "gelir" ? " · kesin değil" : " · tahmini tarih") : ""}
        </span>
        {o.doviz && <span className="alt">{dovizYazi(o.doviz.tutar, o.doviz.paraBirimi)} · TL karşılığı tahmini kurla</span>}
        {o.asgari !== undefined && o.tutar !== undefined && (
          <span className="alt">
            Ekstre {o.tutarTahmini && "≈ "}<Tl k={o.tutar} /> · asgari {o.tutarTahmini && "≈ "}<Tl k={o.asgari} />
          </span>
        )}
      </div>
      {o.tutar !== undefined && o.asgari === undefined && (
        <span className={o.tur === "gelir" ? "pozitif" : ""}>
          {o.doviz && <small className="yaklasik">≈ </small>}
          <Tl k={o.tutar} isaret={o.tur === "gelir"} />
        </span>
      )}
    </li>
  );
}
