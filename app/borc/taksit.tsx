"use client";

import { useMemo } from "react";
import { useBorc } from "./baglam";
import { ayAdi, ayKisa } from "./bicim";
import { YigmaCubuk, renkHaritasi } from "./grafik";
import { taksitPlani } from "./hesap";
import { Bolum, Bos, Tl } from "./parcalar";

const AY_ADEDI = 12;

/** Taksit planı: kayıtlı taksitli alışverişlerin önümüzdeki 12 ayda ekstrelere dağılımı. */
export default function Taksit() {
  const { veri, bugun } = useBorc();
  const plan = useMemo(() => taksitPlani(veri, bugun, AY_ADEDI), [veri, bugun]);
  const renkler = useMemo(() => renkHaritasi(veri.hesaplar), [veri.hesaplar]);

  return (
    <>
      <section className="ozet-kart">
        <p className="etiket">Önümüzdeki {AY_ADEDI} ay toplam taksit yükü</p>
        <p className="buyuk"><Tl k={plan.genelToplam} tam /></p>
        <dl className="degerler">
          <div><dt>Aylık ortalama</dt><dd><Tl k={Math.round(plan.genelToplam / AY_ADEDI)} tam /></dd></div>
          <div><dt>Devam eden taksitli alışveriş</dt><dd>{plan.taksitliler.length}</dd></div>
          <div className="cok-satir-satir">
            <dt>Başlangıç</dt>
            <dd className="cok-satir">
              <span>{ayAdi(plan.aylar[0])} ekstresi</span>
              <small>son kesilen ekstrenin ertesi ayı</small>
            </dd>
          </div>
        </dl>
        <p className="not">Yalnızca taksitli (2+) alışverişler; her işlem kartın kesim gününe göre ilgili ekstreye dağıtılır. Tek çekim harcamalar bu plana dahil değildir.</p>
      </section>

      {plan.satirlar.length === 0 ? (
        <Bos>Kredi kartı hesabı yok.</Bos>
      ) : (
        <>
          <Bolum baslik="Aylara göre yük">
            {plan.genelToplam > 0 ? (
              <YigmaCubuk
                etiketler={plan.aylar.map((ay) => ayKisa(ay).split(" ")[0])}
                seriler={plan.satirlar.map((s) => ({ ad: s.hesap.ad, renk: renkler.get(s.hesap.id) ?? "var(--g1)", degerler: s.hucreler }))}
                ozet={`Aylara göre taksit yükü, ${ayAdi(plan.aylar[0])} ile ${ayAdi(plan.aylar[plan.aylar.length - 1])} arası`}
              />
            ) : (
              <Bos>Devam eden taksit yok; plan boş.</Bos>
            )}
          </Bolum>

          <Bolum baslik="Aylık tablo">
            <div className="tablo-kaydir" tabIndex={0} role="region" aria-label="Aylık taksit tablosu">
              <table className="tablo">
                <thead>
                  <tr>
                    <th scope="col">Kart</th>
                    {plan.aylar.map((ay) => (
                      <th scope="col" key={ay}>{ayKisa(ay)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plan.satirlar.map((s) => (
                    <tr key={s.hesap.id}>
                      <th scope="row">{s.hesap.ad}</th>
                      {s.hucreler.map((h, i) => (
                        <td key={plan.aylar[i]} className={h === 0 ? "sifir" : ""}>{h === 0 ? "–" : <Tl k={h} />}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">Toplam</th>
                    {plan.toplamlar.map((t, i) => (
                      <td key={plan.aylar[i]}>{t === 0 ? "–" : <Tl k={t} />}</td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="not">Ekstresi kesilmiş aylar yük sayılmaz: o taksit zaten ekstrede ve ekstre borcuna dahil.</p>
          </Bolum>

          <Bolum baslik="Sonraki ekstreye düşecekler" sag={<span className="sag-yazi">tek çekim + taksit</span>}>
            <ul className="liste">
              {plan.satirlar.map((s) => (
                <li key={s.hesap.id} className="satir">
                  <div>
                    <strong>{s.hesap.ad}</strong>
                    <span className="alt">{ayAdi(s.sonrakiEkstre)} ekstresi</span>
                  </div>
                  <Tl k={plan.sonrakiEkstreyeDusen.get(s.hesap.id) ?? 0} />
                </li>
              ))}
            </ul>
          </Bolum>
        </>
      )}

      <Bolum baslik="Devam eden taksitler">
        {plan.taksitliler.length === 0 ? (
          <Bos>Devam eden taksitli alışveriş yok.</Bos>
        ) : (
          <ul className="liste">
            {plan.taksitliler.map((t) => (
              <li key={t.islem.id} className="satir">
                <div>
                  <strong>{t.islem.aciklama}</strong>
                  <span className="alt">
                    {t.hesap.ad} · {t.kalanTaksit}/{t.islem.taksit} taksit kaldı · son {ayKisa(t.bitisAy)}
                  </span>
                </div>
                <div className="sag-kolon">
                  <Tl k={t.aylikTutar} />
                  <span className="alt">/ ay · kalan <Tl k={t.kalanToplam} /></span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Bolum>
    </>
  );
}
