"use client";

import { useMemo } from "react";
import { ayKisa, dovizYazi, kalanYazi, katYazi, kurYazi, tarihKisa, tl, yuzde } from "./bicim";
import { aylikGelir, borcGecmisi, borcGelirOrani, gelirOlaylari, gelirOzeti, gunFarki, panoHesapla, takvimOlaylari, type HesapDurumu } from "./hesap";
import type { Veri } from "./ortak";
import type { EkleSekmesi } from "./ekle";
import { Bolum, Bos, Cubuk, Tl } from "./parcalar";

/** Ölçüm bu kadar günden eskiyse rakam "bayat" uyarısı alır. */
const BAYAT_GUN = 7;

export default function Pano({
  veri,
  bugun,
  git,
  ekleAc
}: {
  veri: Veri;
  bugun: string;
  git: (sekme: "takvim" | "taksit" | "gelir") => void;
  ekleAc: (sekme: EkleSekmesi) => void;
}) {
  const pano = useMemo(() => panoHesapla(veri), [veri]);
  const gelir = useMemo(() => gelirOzeti(gelirOlaylari(veri, bugun), bugun), [veri, bugun]);
  const aylik = useMemo(() => aylikGelir(veri), [veri]);
  const kat = borcGelirOrani(pano.toplamIsyeriHaric, aylik.toplam);
  const yaklasan = useMemo(() => takvimOlaylari(veri, bugun, 21).filter((o) => o.tur !== "kesim" && !o.gecikmis).slice(0, 3), [veri, bugun]);
  const gecmis = useMemo(() => borcGecmisi(veri), [veri]);
  const s = pano.senaryo;

  if (veri.hesaplar.length === 0) {
    return (
      <Bos>
        Henüz hesap yok. İçe aktarma betiğiyle Excel'deki hesapları yükleyin (README → “/borc”).
      </Bos>
    );
  }

  const kartlar = pano.hesaplar.filter((h) => h.hesap.tur === "kart");
  const kmhler = pano.hesaplar.filter((h) => h.hesap.tur === "kmh");
  const digerleri = pano.hesaplar.filter((h) => h.hesap.tur === "diger");

  return (
    <>
      <section className="ozet-kart" aria-label="Toplam borç">
        <p className="etiket">Toplam borç · işyeri hariç</p>
        <p className="buyuk">
          <Tl k={pano.toplamIsyeriHaric} />
        </p>
        <p className="ince">
          Kart <Tl k={pano.kartBorcu} /> · KMH <Tl k={pano.kmhBorcu} />
        </p>
        {pano.digerBorcu > 0 && (
          <p className="ince">
            + İşyeri / diğer <Tl k={pano.digerBorcu} /> = <strong><Tl k={pano.toplamIsyeriDahil} /></strong>
          </p>
        )}
        {pano.toplamKullanim !== null && (
          <>
            <Cubuk oran={pano.toplamKullanim} etiket="Toplam limit kullanımı" />
            <p className="ince">Kart + KMH limitlerinin {yuzde(pano.toplamKullanim)}'i kullanılıyor</p>
          </>
        )}
      </section>

      <section className="ozet-kart" aria-label="Aylık gelir">
        <p className="etiket">Aylık gelir</p>
        {aylik.kalemler.length === 0 ? (
          <p className="ince">
            Düzenli gelir tanımlı değil.{" "}
            <button type="button" className="bag" onClick={() => git("gelir")}>Gelir sekmesinden ekle</button>
          </p>
        ) : (
          <>
            <p className="buyuk"><Tl k={aylik.toplam} /></p>
            <p className="ince">
              {aylik.kalemler.map(({ kalem, tl: karsilik }, i) => (
                <span key={kalem.id}>
                  {i > 0 && " · "}
                  {kalem.ad}{" "}
                  {kalem.paraBirimi === "TRY" ? <Tl k={karsilik} /> : <>{dovizYazi(kalem.tutar, kalem.paraBirimi)} ≈ <Tl k={karsilik} /></>}
                </span>
              ))}
            </p>
            {kat !== null && (
              <p className="ince">
                Borç / aylık gelir (işyeri hariç): <strong>{katYazi(kat)}</strong> aylık gelir
              </p>
            )}
            {aylik.dovizVar && <p className="not">Dövizli gelirin TL karşılığı tahmini kurla ({kurYazi(veri.ayarlar.usdTry)}) hesaplandı; resmî kur değildir.</p>}
            {aylik.belirsizVar && <p className="not">Bazı kalemlerin yatış günü kesin değil.</p>}
          </>
        )}
      </section>

      {gelir.gecikenAdet > 0 && (
        <button type="button" className="uyari" onClick={() => git("gelir")}>
          <strong>Geciken alacak: <Tl k={gelir.geciken} /></strong>
          <span>
            {gelir.gecikenAdet} gelir beklenen tarihte gelmedi{gelir.bekleyenAdet > 0 ? ` · ${gelir.bekleyenAdet} bekleyen: ` : ""}
            {gelir.bekleyenAdet > 0 && <Tl k={gelir.bekleyen} />}
          </span>
        </button>
      )}

      <Bolum baslik="Kredi kartları" sag={<span className="sag-yazi"><Tl k={pano.kartBorcu} /> / <Tl k={pano.kartLimit} /></span>}>
        <ul className="hesaplar">
          {kartlar.map((h) => (
            <HesapSatiri key={h.hesap.id} h={h} bugun={bugun} />
          ))}
        </ul>
      </Bolum>

      {kmhler.length > 0 && (
        <Bolum baslik="KMH (ek hesap)" sag={<span className="sag-yazi"><Tl k={pano.kmhBorcu} /> / <Tl k={pano.kmhLimit} /></span>}>
          <ul className="hesaplar">
            {kmhler.map((h) => (
              <HesapSatiri key={h.hesap.id} h={h} bugun={bugun} />
            ))}
          </ul>
        </Bolum>
      )}

      {digerleri.length > 0 && (
        <Bolum baslik="Diğer borçlar" sag={<span className="sag-yazi">toplamda bir kez sayılır</span>}>
          <ul className="hesaplar">
            {digerleri.map((h) => (
              <HesapSatiri key={h.hesap.id} h={h} bugun={bugun} />
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum baslik="Yaklaşan" sag={<button type="button" className="bag" onClick={() => git("takvim")}>Takvim</button>}>
        {yaklasan.length === 0 ? (
          <Bos>Önümüzdeki 3 haftada ödeme ya da gelir görünmüyor.</Bos>
        ) : (
          <ul className="liste">
            {yaklasan.map((o) => (
              <li key={o.anahtar} className="satir">
                <div>
                  <strong>{o.baslik}</strong>
                  <span className="alt">
                    {tarihKisa(o.tarih)} · {kalanYazi(o.kalanGun)}
                    {o.tahmini ? " · tahmini" : ""}
                  </span>
                </div>
                {o.tutar !== undefined && (
                  <span className={o.tur === "gelir" ? "pozitif" : ""}>
                    <Tl k={o.tutar} isaret={o.tur === "gelir"} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Bolum>

      <Bolum baslik="Ödeme senaryosu" sag={<span className="sag-yazi">tahmini</span>}>
        <dl className="degerler">
          <div><dt>Ekstreleri tamamen ödersem</dt><dd><Tl k={s.ekstreToplami} /></dd></div>
          <div><dt>Sadece asgari ödersem</dt><dd><Tl k={s.asgariToplami} /></dd></div>
          <div><dt>Asgari ödersem devreden kart borcu</dt><dd><Tl k={s.devreden} /></dd></div>
          <div><dt>Tahmini aylık faiz (kart + KMH)</dt><dd className="negatif"><Tl k={s.aylikFaiz} /></dd></div>
        </dl>
        <p className="not">
          Kart faizi: devreden × %{(veri.ayarlar.kartFaiziAlt * 100).toFixed(1).replace(".", ",")} / %{(veri.ayarlar.kartFaiziUst * 100).toFixed(1).replace(".", ",")} × {veri.ayarlar.vergiCarpani.toString().replace(".", ",")} (KKDF+BSMV).
          KMH: borç × %{(veri.ayarlar.kmhFaizi * 100).toFixed(2).replace(".", ",")} × {veri.ayarlar.vergiCarpani.toString().replace(".", ",")}. Bankanın günlük hesabından farklı olabilir.
        </p>
      </Bolum>

      {gecmis.length > 1 && (
        <Bolum baslik="Borç geçmişi" sag={<span className="sag-yazi">kart + KMH</span>}>
          <Gecmis veri={gecmis} />
        </Bolum>
      )}

      <div className="hizli">
        <button type="button" className="birinci" onClick={() => ekleAc("durum")}>Güncel durumu gir</button>
        <button type="button" className="ikinci" onClick={() => ekleAc("harcama")}>Harcama ekle</button>
      </div>
    </>
  );
}

function HesapSatiri({ h, bugun }: { h: HesapDurumu; bugun: string }) {
  const yas = h.olcumTarihi ? gunFarki(h.olcumTarihi, bugun) : null;
  const bayat = yas !== null && yas > BAYAT_GUN;
  const asim = h.kullanim !== null && h.kullanim > 1;
  return (
    <li className="hesap">
      <div className="hesap-ust">
        <strong>{h.hesap.ad}</strong>
        <span className="tutar-buyuk"><Tl k={h.borc} /></span>
      </div>
      {h.limit > 0 && (
        <>
          <Cubuk oran={h.kullanim} etiket={`${h.hesap.ad} limit kullanımı ${yuzde(h.kullanim)}`} />
          <div className="hesap-alt">
            <span>{yuzde(h.kullanim)} · limit <Tl k={h.limit} /></span>
            <span className={asim ? "negatif" : ""}>{asim ? "limit aşımı" : <>kalan <Tl k={h.kalanLimit ?? 0} /></>}</span>
          </div>
        </>
      )}
      {h.hesap.tur === "kart" && h.ekstre !== null && (
        <div className="hesap-alt">
          <span>Ekstre <Tl k={h.ekstre} />{h.asgari !== null && <> · asgari <Tl k={h.asgari} />{h.asgariTahmini ? " (tahmini)" : ""}</>}</span>
          {h.sonOdeme && <span>son ödeme {tarihKisa(h.sonOdeme)}</span>}
        </div>
      )}
      {bayat && <p className="bayat">Son ölçüm {yas} gün önce ({tarihKisa(h.olcumTarihi!)}) — güncelleyin</p>}
      {h.durum === null && <p className="bayat">Bu hesap için henüz ölçüm girilmemiş</p>}
    </li>
  );
}

/** Basit çizgi grafik: kart + KMH toplamı, ay ay. Kütüphane yok, ~30 satır SVG. */
function Gecmis({ veri }: { veri: ReturnType<typeof borcGecmisi> }) {
  const degerler = veri.map((m) => m.kart + m.kmh);
  const en = Math.max(...degerler, 1);
  const G = 320;
  const Y = 96;
  const x = (i: number) => 8 + (i * (G - 16)) / Math.max(1, degerler.length - 1);
  const y = (d: number) => Y - 8 - (d / en) * (Y - 24);
  const nokta = degerler.map((d, i) => `${x(i).toFixed(1)},${y(d).toFixed(1)}`).join(" ");
  const son = degerler[degerler.length - 1];
  const onceki = degerler[degerler.length - 2];
  const fark = son - onceki;

  return (
    <figure className="gecmis">
      <svg viewBox={`0 0 ${G} ${Y}`} role="img" aria-label={`Son ${veri.length} ayın toplam borcu: ${tl(degerler[0])} → ${tl(son)}`}>
        <polyline points={nokta} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {degerler.map((d, i) => (
          <circle key={veri[i].ay} cx={x(i)} cy={y(d)} r={i === degerler.length - 1 ? 3.5 : 2} fill="currentColor" />
        ))}
      </svg>
      <figcaption>
        <span>{ayKisa(veri[0].ay)}</span>
        <span className={fark > 0 ? "negatif" : "pozitif"}>
          {fark === 0 ? "değişmedi" : <>geçen aya göre {fark > 0 ? "+" : "−"}<Tl k={Math.abs(fark)} /></>}
        </span>
        <span>{ayKisa(veri[veri.length - 1].ay)}</span>
      </figcaption>
    </figure>
  );
}
