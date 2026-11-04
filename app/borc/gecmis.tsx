"use client";

import { useMemo, useState } from "react";
import { useBorc } from "./baglam";
import { ayAdi, ayKisa, tlTam } from "./bicim";
import { YigmaCubuk } from "./grafik";
import { aylikOzetler } from "./hesap";
import { Bolum, Bos, Segment, Tl } from "./parcalar";

type Aralik = "6" | "12" | "tum";

/** Borç geçmişi: ay ay kart + KMH (yığılmış çubuk) ve diğer dahil toplam (kesikli çizgi); değişim özeti. */
export default function Gecmis() {
  const { veri, git, metin } = useBorc();
  const [aralik, setAralik] = useState<Aralik>("12");
  const tum = useMemo(() => aylikOzetler(veri), [veri]);
  const ozetler = useMemo(() => (aralik === "tum" ? tum : tum.slice(-Number(aralik))), [tum, aralik]);

  const dolu = ozetler.filter((o) => o.toplam !== null);
  if (dolu.length === 0) return <Bos>Henüz ölçüm yok. Hesaplar sekmesinden güncel durumu girince geçmiş burada görünür.</Bos>;

  const ilk = dolu[0];
  const son = dolu[dolu.length - 1];
  const degisim = (son.toplam ?? 0) - (ilk.toplam ?? 0);
  const enYuksek = dolu.reduce((e, o) => ((o.toplam ?? 0) > (e.toplam ?? 0) ? o : e), dolu[0]);
  const enDusuk = dolu.reduce((e, o) => ((o.toplam ?? 0) < (e.toplam ?? 0) ? o : e), dolu[0]);

  return (
    <>
      <Bolum baslik="Aylık borç">
        <Segment
          secenekler={[
            { id: "6", ad: "6 ay" },
            { id: "12", ad: "12 ay" },
            { id: "tum", ad: "Tümü" }
          ]}
          secili={aralik}
          sec={setAralik}
          etiket="Zaman aralığı"
        />
        <YigmaCubuk
          etiketler={ozetler.map((o) => ayKisa(o.ay).split(" ")[0])}
          seriler={[
            { ad: "Kredi kartları", renk: "var(--g1)", degerler: ozetler.map((o) => o.kart ?? 0) },
            { ad: "KMH", renk: "var(--g3)", degerler: ozetler.map((o) => o.kmh ?? 0) }
          ]}
          cizgi={{ ad: "Diğer dahil toplam", renk: "var(--kotu)", degerler: ozetler.map((o) => o.toplamDigerDahil) }}
          ozet={`${ayAdi(ilk.ay)} ile ${ayAdi(son.ay)} arası aylık borç grafiği`}
        />
        <p className="not">Çubuklar diğer hariç kart + KMH borcudur; kesikli çizgi {metin.diger.toLocaleLowerCase("tr")} dahil toplamı gösterir. B = bin TL.</p>
      </Bolum>

      <Bolum baslik={`Değişim (${ayKisa(ilk.ay)} → ${ayKisa(son.ay)})`}>
        <dl className="degerler">
          <div>
            <dt>Diğer hariç toplam</dt>
            <dd className={degisim > 0 ? "negatif" : degisim < 0 ? "pozitif" : ""}>
              <span className="t">{degisim > 0 ? "+" : degisim < 0 ? "−" : ""}{tlTam(Math.abs(degisim))}</span>
            </dd>
          </div>
          <div className="cok-satir-satir">
            <dt>En yüksek</dt>
            <dd className="cok-satir"><Tl k={enYuksek.toplam ?? 0} tam /><small>{ayAdi(enYuksek.ay)}</small></dd>
          </div>
          <div className="cok-satir-satir">
            <dt>En düşük</dt>
            <dd className="cok-satir"><Tl k={enDusuk.toplam ?? 0} tam /><small>{ayAdi(enDusuk.ay)}</small></dd>
          </div>
        </dl>
      </Bolum>

      <Bolum baslik="Ay ay">
        <ul className="liste">
          {[...ozetler].reverse().filter((o) => o.kayitSayisi > 0).map((o) => (
            <li key={o.ay} className="satir">
              <div>
                <button type="button" className="satir-bag" onClick={() => git(`aylar/${o.ay}`)}>
                  <strong>{ayAdi(o.ay)}</strong>
                </button>
                <span className="alt">
                  Kart <Tl k={o.kart ?? 0} /> · KMH <Tl k={o.kmh ?? 0} />
                  {o.diger !== null && <> · diğer <Tl k={o.diger} /></>}
                </span>
              </div>
              <div className="sag-kolon">
                <Tl k={o.toplamDigerDahil ?? 0} tam />
                <button type="button" className="bag" onClick={() => git(`aylar/${o.ay}`)} aria-label={`${ayAdi(o.ay)} ayrıntısı`}>›</button>
              </div>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
