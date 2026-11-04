"use client";

import { useMemo, useState } from "react";
import { api, ApiHatasi } from "./api";
import { dovizYazi, kalanYazi, tarihKisa } from "./bicim";
import DuzenliGelirler from "./duzenli";
import { gelirOlaylari, gelirOzeti, gunEkle, gunFarki, type GelirOlayi } from "./hesap";
import type { Veri } from "./ortak";
import { Bolum, Bos, Tl } from "./parcalar";

export default function Gelir({
  veri,
  bugun,
  guncelle,
  bildir,
  ekleAc
}: {
  veri: Veri;
  bugun: string;
  guncelle: (v: Veri) => void;
  bildir: (mesaj: string) => void;
  ekleAc: () => void;
}) {
  const olaylar = useMemo(() => gelirOlaylari(veri, bugun), [veri, bugun]);
  const ozet = useMemo(() => gelirOzeti(olaylar, bugun), [olaylar, bugun]);
  // Geciken her şey + önümüzdeki iki ayın beklenenleri; daha ilerisi takvimde.
  const bekleyenler = useMemo(() => olaylar.filter((o) => !o.alindiTarihi && (o.durum === "gecikti" || o.tarih <= gunEkle(bugun, 62))), [olaylar, bugun]);
  const alinanlar = useMemo(
    () => olaylar.filter((o) => o.alindiTarihi).sort((a, b) => (b.alindiTarihi ?? "").localeCompare(a.alindiTarihi ?? "")),
    [olaylar]
  );
  const [calisiyor, setCalisiyor] = useState<string | null>(null);

  async function calistir(anahtar: string, is: () => Promise<Veri>, mesaj: string) {
    setCalisiyor(anahtar);
    try {
      guncelle(await is());
      bildir(mesaj);
    } catch (e) {
      bildir(e instanceof ApiHatasi ? e.message : "İşlem yapılamadı");
    } finally {
      setCalisiyor(null);
    }
  }

  // Planlı satırda kayıt yok: “Alındı” kaydı ilk kez açar (düzenli kaleme bağlı), böylece o ay için plan kalkar.
  const alindi = (o: GelirOlayi) => {
    const girdi = { ad: o.ad, tutar: o.tutar, paraBirimi: o.paraBirimi, beklenenTarih: o.tarih, kesin: o.kesin, alindiTarihi: bugun, duzenliId: o.duzenliId, not: o.not };
    return calistir(o.anahtar, () => (o.kayitId === null ? api.gelirEkle(girdi) : api.gelirGuncelle(o.kayitId, girdi)), `${o.ad} alındı olarak işaretlendi`);
  };

  const sil = (o: GelirOlayi) => {
    if (o.kayitId !== null && window.confirm(`“${o.ad}” kaydı silinsin mi?`)) {
      const kayitId = o.kayitId;
      void calistir(o.anahtar, () => api.gelirSil(kayitId), "Gelir kaydı silindi");
    }
  };

  return (
    <>
      <section className="ozet-kart">
        <p className="etiket">Geciken alacak</p>
        <p className={`buyuk${ozet.geciken > 0 ? " negatif" : ""}`}><Tl k={ozet.geciken} /></p>
        <p className="ince">
          Önümüzdeki 31 günde bekleyen <Tl k={ozet.bekleyen} /> · bu ay alınan <Tl k={ozet.alinanBuAy} />
        </p>
      </section>

      <Bolum baslik="Beklenen gelirler" sag={<button type="button" className="bag" onClick={ekleAc}>+ Gelir ekle</button>}>
        {bekleyenler.length === 0 ? (
          <Bos>Bekleyen gelir yok.</Bos>
        ) : (
          <ul className="liste">
            {bekleyenler.map((o) => (
              <li key={o.anahtar} className={`gelir-satiri${o.durum === "gecikti" ? " gecikmis" : ""}`}>
                <div className="gelir-ust">
                  <div>
                    <strong>{o.ad}</strong>
                    <span className="alt">
                      {tarihKisa(o.tarih)} ·{" "}
                      <span className={o.durum === "gecikti" ? "negatif" : ""}>
                        {o.durum === "gecikti" ? `${-gunFarki(bugun, o.tarih)} gün gecikti` : kalanYazi(gunFarki(bugun, o.tarih))}
                      </span>
                      {!o.kesin && " · kesin değil"}
                      {o.planli && " · düzenli"}
                    </span>
                    {o.paraBirimi !== "TRY" && (
                      <span className="alt">{dovizYazi(o.tutar, o.paraBirimi)} · TL karşılığı tahmini kurla</span>
                    )}
                    {o.not && <span className="alt">{o.not}</span>}
                  </div>
                  <span className="pozitif">
                    {o.paraBirimi !== "TRY" && <small className="yaklasik">≈ </small>}
                    <Tl k={o.tl} isaret />
                  </span>
                </div>
                <div className="gelir-dugmeler">
                  <button type="button" className="ikinci kucuk" disabled={calisiyor === o.anahtar} onClick={() => alindi(o)}>
                    Alındı
                  </button>
                  {o.kayitId !== null && (
                    <button type="button" className="bag tehlike" disabled={calisiyor === o.anahtar} onClick={() => sil(o)}>
                      Sil
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Bolum>

      <DuzenliGelirler veri={veri} bugun={bugun} guncelle={guncelle} bildir={bildir} />

      {alinanlar.length > 0 && (
        <Bolum baslik="Son alınanlar">
          <ul className="liste">
            {alinanlar.map((o) => (
              <li key={o.anahtar} className="satir">
                <div>
                  <strong>{o.ad}</strong>
                  <span className="alt">
                    {tarihKisa(o.alindiTarihi!)} tarihinde alındı{o.paraBirimi !== "TRY" ? ` · ${dovizYazi(o.tutar, o.paraBirimi)}` : ""}
                  </span>
                </div>
                <Tl k={o.tl} isaret />
              </li>
            ))}
          </ul>
        </Bolum>
      )}
    </>
  );
}
