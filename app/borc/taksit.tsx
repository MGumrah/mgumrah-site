"use client";

import { useMemo, useState } from "react";
import { api, ApiHatasi } from "./api";
import { ayAdi, ayKisa, tarihKisa } from "./bicim";
import { taksitPlani } from "./hesap";
import type { Veri } from "./ortak";
import { Bolum, Bos, Tl } from "./parcalar";

const SON_ISLEM_SAYISI = 12;

export default function Taksit({
  veri,
  bugun,
  guncelle,
  bildir
}: {
  veri: Veri;
  bugun: string;
  guncelle: (v: Veri) => void;
  bildir: (mesaj: string) => void;
}) {
  const plan = useMemo(() => taksitPlani(veri, bugun, 12), [veri, bugun]);
  const hesapAdi = useMemo(() => new Map(veri.hesaplar.map((h) => [h.id, h.ad])), [veri.hesaplar]);
  const [siliniyor, setSiliniyor] = useState<number | null>(null);
  const son = useMemo(() => [...veri.islemler].sort((a, b) => b.tarih.localeCompare(a.tarih) || b.id - a.id).slice(0, SON_ISLEM_SAYISI), [veri.islemler]);

  async function sil(id: number, aciklama: string) {
    if (!window.confirm(`“${aciklama}” silinsin mi?`)) return;
    setSiliniyor(id);
    try {
      guncelle(await api.islemSil(id));
      bildir("İşlem silindi");
    } catch (e) {
      bildir(e instanceof ApiHatasi ? e.message : "Silinemedi");
    } finally {
      setSiliniyor(null);
    }
  }

  return (
    <>
      <section className="ozet-kart">
        <p className="etiket">Kayıtlı taksitlerin önümüzdeki 12 ay yükü</p>
        <p className="buyuk"><Tl k={plan.genelToplam} /></p>
        <p className="ince">{plan.taksitliler.length} devam eden taksitli alışveriş</p>
      </section>

      <Bolum baslik="Aylara göre">
        {plan.satirlar.length === 0 ? (
          <Bos>Kredi kartı hesabı yok.</Bos>
        ) : (
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
        )}
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

      <Bolum baslik="Son harcamalar">
        {son.length === 0 ? (
          <Bos>Henüz harcama yok.</Bos>
        ) : (
          <ul className="liste">
            {son.map((i) => (
              <li key={i.id} className="satir">
                <div>
                  <strong>{i.aciklama}</strong>
                  <span className="alt">
                    {tarihKisa(i.tarih)} · {hesapAdi.get(i.hesapId) ?? "?"} · {ayKisa(i.ekstreAy)} ekstresi{i.taksit > 1 ? ` · ${i.taksit} taksit` : ""}
                  </span>
                </div>
                <div className="sag-kolon">
                  <span className={i.tutar < 0 ? "pozitif" : ""}><Tl k={i.tutar} tam /></span>
                  <button type="button" className="bag tehlike" disabled={siliniyor === i.id} onClick={() => sil(i.id, i.aciklama)}>
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Bolum>
    </>
  );
}
