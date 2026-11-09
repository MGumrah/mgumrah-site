"use client";

import { useMemo, useState } from "react";
import { useBorc } from "./baglam";
import { ayAdi, ayKisa, tlTam } from "./bicim";
import { YigmaCubuk } from "./grafik";
import { aylikOzetler } from "./hesap";
import { Bolum, Bos, Segment, Tl } from "./parcalar";

type Aralik = "6" | "12" | "tum";

/** Borç geçmişi: ay ay kart + KMH + diğer yığılmış çubuk (çubuğun tepesi toplam borç); değişim özeti. */
export default function Gecmis() {
  const { veri, git, metin } = useBorc();
  const [aralik, setAralik] = useState<Aralik>("12");
  const tum = useMemo(() => aylikOzetler(veri), [veri]);
  const ozetler = useMemo(() => (aralik === "tum" ? tum : tum.slice(-Number(aralik))), [tum, aralik]);

  const dolu = ozetler.filter((o) => o.toplam !== null);
  // "Diğer" rengi ve açıklaması yalnızca görünen aralıkta diğer borç kaydı varsa çıkar (boş açıklama satırı olmasın).
  const digerVar = ozetler.some((o) => (o.diger ?? 0) > 0);
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
            { ad: "KMH", renk: "var(--g3)", degerler: ozetler.map((o) => o.kmh ?? 0) },
            ...(digerVar ? [{ ad: metin.diger, renk: "var(--g4)", degerler: ozetler.map((o) => o.diger ?? 0) }] : [])
          ]}
          ozet={`${ayAdi(ilk.ay)} ile ${ayAdi(son.ay)} arası aylık toplam borç grafiği`}
        />
        <p className="not">
          Çubuklar kart{digerVar ? ", KMH ve diğer borçların" : " ve KMH borcunun"} toplamıdır; çubuğun tepesi toplam borçtur. B = bin TL.
        </p>
      </Bolum>

      <Bolum baslik={`Değişim (${ayKisa(ilk.ay)} → ${ayKisa(son.ay)})`}>
        <dl className="degerler">
          <div>
            <dt>Toplam borç</dt>
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
                <Tl k={o.toplam ?? 0} tam />
                <button type="button" className="bag" onClick={() => git(`aylar/${o.ay}`)} aria-label={`${ayAdi(o.ay)} ayrıntısı`}>›</button>
              </div>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
