"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useBorc, useIs } from "./baglam";
import { kurYazi, kurusMetni, kurusaCevir, tarihKisa, gunAdi } from "./bicim";
import { BakiyeGrafigi } from "./grafik";
import { nakitAkisi } from "./hesap";
import { Bolum, Bos, Segment, Tl } from "./parcalar";

const UFUK_GUN = 60;

/** Takvim › Nakit akışı: eldeki nakit + gelirler − kartların son ödemeleri; gün gün bakiye seyri. */
export default function Nakit() {
  const { veri, bugun } = useBorc();
  const [varsayim, setVarsayim] = useState<"asgari" | "tam">("asgari");
  const akis = useMemo(() => nakitAkisi(veri, bugun, varsayim, UFUK_GUN), [veri, bugun, varsayim]);
  const kur = veri.ayarlar.usdTry;
  const bos = akis.satirlar.length === 0;

  return (
    <>
      <Bolum baslik="Eldeki nakit">
        <NakitFormu baslangic={veri.ayarlar.eldekiNakit} />
        <Segment
          secenekler={[
            { id: "asgari", ad: "Asgari" },
            { id: "tam", ad: "Tam ekstre" }
          ]}
          secili={varsayim}
          sec={setVarsayim}
          etiket="Kartlardan ne kadar ödenecek"
        />
        <p className="not">
          Önümüzdeki {UFUK_GUN} gün: kartların son ödemeleri ({varsayim === "asgari" ? "yalnızca asgari" : "tam ekstre"}) ile gelirler. KMH faizi ve günlük harcamalar dahil değildir.{" "}
          {kur > 0 ? `USD gelirler, Ayarlar'daki USD/TRY ${kurYazi(kur)} kuruyla TL'ye çevrilir.` : "USD kuru girilmediği için dövizli gelirler hesaba katılmaz (Ayarlar › Döviz kuru)."}
        </p>
      </Bolum>

      {akis.tutarsizOdemeSayisi > 0 && <p className="not uyari-yazi">{akis.tutarsizOdemeSayisi} kartın ödeme tutarı hiç bilinmediği için (ekstre yok, harcama yok) akışa girmedi.</p>}

      <Bolum baslik="Özet">
        <dl className="degerler">
          <div><dt>Toplam çıkış</dt><dd className="negatif"><Tl k={akis.toplamCikis} tam /></dd></div>
          <div><dt>Kesin gelir</dt><dd className="pozitif"><Tl k={akis.toplamKesinGiris} tam /></dd></div>
          <div className="cok-satir-satir">
            <dt>Belirsiz / alacak</dt>
            <dd className="cok-satir">
              <span className="uyari-yazi"><Tl k={akis.toplamBelirsizGiris} tam /></span>
              <small>gelirse eklenir, garanti değil</small>
            </dd>
          </div>
          <div><dt>En düşük bakiye (kesin)</dt><dd className={akis.enDusukKesin < 0 ? "negatif" : ""}><Tl k={akis.enDusukKesin} tam /></dd></div>
          <div><dt>En düşük bakiye (belirsizler dahil)</dt><dd className={akis.enDusukIyimser < 0 ? "negatif" : ""}><Tl k={akis.enDusukIyimser} tam /></dd></div>
        </dl>
      </Bolum>

      {bos ? (
        <Bos>Önümüzdeki {UFUK_GUN} günde tutarı bilinen ödeme ya da gelir yok. Kartlara kesim/son ödeme günü ve gelirlere tarih girilince bakiye seyri çizilir.</Bos>
      ) : (
        <>
          <Bolum baslik="Bakiye seyri">
            <BakiyeGrafigi baslangic={akis.baslangic} satirlar={akis.satirlar} bugun={bugun} ufuk={UFUK_GUN} />
          </Bolum>

          <Bolum baslik="Hareketler">
            <ul className="liste">
              {akis.satirlar.map((s) => (
                <li key={s.anahtar} className="satir">
                  <div>
                    <strong>{s.baslik}</strong>
                    <span className="alt">
                      {tarihKisa(s.tarih)} · {gunAdi(s.tarih)}
                    </span>
                  </div>
                  <div className="sag-kolon">
                    <span className={s.tutar < 0 ? "negatif" : s.tur === "gelirKesin" ? "pozitif" : "uyari-yazi"}>
                      {s.tahmini && <small className="yaklasik">≈ </small>}
                      <Tl k={s.tutar} isaret />
                    </span>
                    <span className="alt">
                      bakiye <span className={s.kesinBakiye < 0 ? "negatif" : ""}><Tl k={s.kesinBakiye} /></span>
                      {s.iyimserBakiye !== s.kesinBakiye && <> · <Tl k={s.iyimserBakiye} /></>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Bolum>
        </>
      )}
    </>
  );
}

function NakitFormu({ baslangic }: { baslangic: number }) {
  const { api } = useBorc();
  const { calisiyor, calistir } = useIs();
  const [metin, setMetin] = useState(baslangic ? kurusMetni(baslangic) : "");
  const [hata, setHata] = useState<string | null>(null);

  async function gec(e: FormEvent) {
    e.preventDefault();
    const kurus = metin.trim() ? kurusaCevir(metin) : 0;
    if (kurus === null) return setHata("Geçerli bir tutar yazın (örn. 12.000).");
    setHata(null);
    await calistir("nakit", () => api.ayarKaydet({ eldekiNakit: kurus }), "Eldeki nakit kaydedildi");
  }

  return (
    <form className="kur-formu" onSubmit={gec} noValidate>
      <label className="alan">
        <span>Bugün eldeki nakit (₺)</span>
        <input inputMode="decimal" autoComplete="off" placeholder="0" value={metin} onChange={(e) => setMetin(e.target.value)} />
      </label>
      <button type="submit" className="ikinci kucuk" disabled={calisiyor === "nakit"}>
        Kaydet
      </button>
      {hata && <p className="hata" role="alert">{hata}</p>}
    </form>
  );
}
