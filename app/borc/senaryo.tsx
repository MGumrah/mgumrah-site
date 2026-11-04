"use client";

import { useMemo, useState } from "react";
import { useBorc } from "./baglam";
import { ayAdi, kurusMetni, kurusaCevir } from "./bicim";
import { senaryoGirdileri, senaryoSatiri, senaryoToplami, type BazEkstre, type OdemeSecenegi } from "./hesap";
import { Alan, Bolum, Bos, Segment, Tl } from "./parcalar";

type Tur = "tam" | "asgari" | "ozel";

const yuzdeMetni = (oran: number, hane: number) => (oran * 100).toFixed(hane).replace(".", ",").replace(/,0+$/, "");

/**
 * Ödeme senaryosu (hesap bazında): tam öde / asgari / özel tutar. Ödeme sonrası kalan (devreden) borca bir aylık
 * tahmini faiz işletilir. Baz: son kesilmiş ekstre ya da henüz kesilmemiş sonraki ekstrenin tahmini.
 */
export default function Senaryo() {
  const { veri, bugun } = useBorc();
  const [tur, setTur] = useState<Tur>("asgari");
  const [baz, setBaz] = useState<BazEkstre>("sonraki");
  const [ozel, setOzel] = useState<Record<number, string>>({});
  const a = veri.ayarlar;

  const girdiler = useMemo(() => senaryoGirdileri(veri, bugun, baz), [veri, bugun, baz]);
  const satirlar = useMemo(
    () =>
      girdiler.map((g) => {
        const girilen = ozel[g.hesap.id]?.trim() ? kurusaCevir(ozel[g.hesap.id]) : null;
        const secenek: OdemeSecenegi = tur === "ozel" ? { tur: "ozel", tutar: girilen ?? (g.kmh ? 0 : g.asgari) } : { tur };
        return senaryoSatiri(g, secenek, a);
      }),
    [girdiler, tur, ozel, a]
  );
  const toplam = senaryoToplami(satirlar);

  return (
    <>
      <Bolum baslik="Ne yaparsam?">
        <Segment
          secenekler={[
            { id: "tam", ad: "Tam öde" },
            { id: "asgari", ad: "Asgari" },
            { id: "ozel", ad: "Özel" }
          ]}
          secili={tur}
          sec={setTur}
          etiket="Ödeme şekli"
        />
        <Alan etiket="Baz alınan ekstre">
          <select value={baz} onChange={(e) => setBaz(e.target.value as BazEkstre)}>
            <option value="sonraki">Tahmini sonraki ekstre</option>
            <option value="son">Son kesilen ekstre</option>
          </select>
        </Alan>
        <p className="not">
          Ödeme sonrası kalan (devreden) borca bir aylık tahmini faiz işletilir: kart %{yuzdeMetni(a.kartFaiziAlt, 1)} (devreden ≤ {Math.round(a.faizEsigi / 100).toLocaleString("tr-TR")} TL) / %{yuzdeMetni(a.kartFaiziUst, 1)} üstü, KMH %{yuzdeMetni(a.kmhFaizi, 2)}; hepsi × {String(a.vergiCarpani).replace(".", ",")} (KKDF + BSMV). Yeni harcamalar dahil değildir.
          {baz === "sonraki" && " “Sonraki ekstre” yalnızca henüz kesilmemiş döneme düşecek harcama ve taksitleri içerir; son ekstrenin ödenmemiş kalanı dahil değildir."}
        </p>
      </Bolum>

      {satirlar.length === 0 ? (
        <Bos>{baz === "son" ? "Ekstre borcu girilmiş bir kart yok. Hesaplar › Durumu güncelle ile son ekstre borcunu girin." : "Sonraki ekstreye düşecek harcama ya da taksit yok."}</Bos>
      ) : (
        <>
          {satirlar.map((s) => (
            <Bolum key={s.hesap.id} baslik={`${s.hesap.ad} · ${s.kmh ? "KMH bakiyesi" : s.ekstreAy ? ayAdi(s.ekstreAy) : "son ekstre"}`}>
              <dl className="degerler">
                <div><dt>{s.kmh ? "Borç (eksi bakiye)" : baz === "sonraki" ? "Ekstre (tahmini)" : "Ekstre"}</dt><dd><Tl k={s.ekstre} tam /></dd></div>
                {!s.kmh && <div><dt>Asgari{s.asgariTahmini ? " (tahmini)" : ""}</dt><dd><Tl k={s.asgari} tam /></dd></div>}
                <div><dt>Ödenecek</dt><dd className={s.asgariAltinda ? "negatif" : ""}><Tl k={s.odeme} tam /></dd></div>
                <div><dt>Devreden</dt><dd><Tl k={s.devreden} tam /></dd></div>
                <div><dt>Tahmini aylık faiz</dt><dd className={s.aylikFaiz > 0 ? "negatif" : ""}>{s.aylikFaiz > 0 && "~"}<Tl k={s.aylikFaiz} tam /></dd></div>
              </dl>
              {tur === "ozel" && (
                <Alan etiket="Ödeyeceğim tutar (₺)" ipucu={s.kmh ? "Boşsa 0 sayılır." : `Boşsa asgari (${kurusMetni(s.asgari)}) sayılır.`}>
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={kurusMetni(s.kmh ? 0 : s.asgari)}
                    value={ozel[s.hesap.id] ?? ""}
                    onChange={(e) => setOzel((o) => ({ ...o, [s.hesap.id]: e.target.value }))}
                  />
                </Alan>
              )}
              {s.asgariAltinda && <p className="hata">Asgarinin altında ödeme: gecikme faizi ve kart kısıtlaması riski vardır.</p>}
            </Bolum>
          ))}

          <section className="ozet-kart" aria-label="Senaryo toplamı">
            <p className="etiket">Toplam</p>
            <dl className="degerler">
              <div><dt>Ödenecek</dt><dd className="kalin"><Tl k={toplam.odeme} tam /></dd></div>
              <div><dt>Devreden borç</dt><dd><Tl k={toplam.devreden} tam /></dd></div>
              <div><dt>Tahmini aylık faiz</dt><dd className="negatif">{toplam.faiz > 0 && "~"}<Tl k={toplam.faiz} tam /></dd></div>
            </dl>
            <p className="not">Bankanın günlük faiz hesabı ve ödeme günleri farklı olabilir; bu bir tahmindir.</p>
          </section>
        </>
      )}
    </>
  );
}
