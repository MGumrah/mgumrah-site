"use client";

import { useMemo } from "react";
import { AylarTablosu } from "./aylar";
import { useBorc } from "./baglam";
import { dovizYazi, kalanYazi, katYazi, kurYazi, tarihKisa } from "./bicim";
import { Halka, renkHaritasi } from "./grafik";
import { aylikGelir, aylikOzetler, borcDagilimi, borcGelirOrani, gelirOlaylari, gelirOzeti, panoHesapla, takvimOlaylari, taksitPlani } from "./hesap";
import { Bolum, Bos, Tl } from "./parcalar";

/** Pano'da "Tüm aylar" tablosundan kaç satır görünür; tamamı Daha fazla › Tüm aylar'da. */
const PANODAKI_AY = 6;

export default function Pano() {
  const { veri, bugun, git, ac, metin } = useBorc();
  const pano = useMemo(() => panoHesapla(veri), [veri]);
  const gelir = useMemo(() => gelirOzeti(gelirOlaylari(veri, bugun), bugun), [veri, bugun]);
  const aylik = useMemo(() => aylikGelir(veri), [veri]);
  const yaklasan = useMemo(() => takvimOlaylari(veri, bugun, 21).filter((o) => o.tur !== "kesim" && !o.gecikmis).slice(0, 3), [veri, bugun]);
  const ozetler = useMemo(() => aylikOzetler(veri), [veri]);
  const renkler = useMemo(() => renkHaritasi(veri.hesaplar), [veri.hesaplar]);
  const dagilim = useMemo(() => borcDagilimi(pano), [pano]);
  const sonrakiEkstre = useMemo(() => [...taksitPlani(veri, bugun, 1).sonrakiEkstreyeDusen.values()].reduce((t, n) => t + n, 0), [veri, bugun]);

  const kat = borcGelirOrani(pano.toplamIsyeriHaric, aylik.toplam);
  const katDiger = borcGelirOrani(pano.toplamIsyeriDahil, aylik.toplam);
  const s = pano.senaryo;

  if (veri.hesaplar.length === 0) {
    return (
      <Bolum baslik="Başlayalım">
        <Bos>
          Henüz hesap yok. Önce takip etmek istediğiniz kredi kartlarını, KMH (ek hesap) ve diğer borçları ekleyin; sonra her birinin güncel durumunu girince bu sayfada toplam borç, ödeme senaryosu ve
          aylık tablo oluşur.
        </Bos>
        <div className="hizli tek">
          <button type="button" className="birinci" onClick={() => ac({ tur: "hesap" })}>
            Hesap ekle
          </button>
        </div>
      </Bolum>
    );
  }

  return (
    <>
      <section className="ozet-kart" aria-label="Toplam borç">
        <p className="etiket">Toplam borç (diğer hariç)</p>
        <p className="buyuk">
          <Tl k={pano.toplamIsyeriHaric} tam />
        </p>
        <dl className="degerler">
          <div><dt>Kredi kartları</dt><dd><Tl k={pano.kartBorcu} tam /></dd></div>
          <div><dt>KMH (ek hesap)</dt><dd><Tl k={pano.kmhBorcu} tam /></dd></div>
          <div><dt>{metin.diger}</dt><dd><Tl k={pano.digerBorcu} tam /></dd></div>
          <div className="ayrac"><dt>Toplam (diğer dahil)</dt><dd className="negatif"><Tl k={pano.toplamIsyeriDahil} tam /></dd></div>
          <div>
            <dt>Aylık gelire oranı</dt>
            <dd className="cok-satir">
              {kat === null ? (
                <button type="button" className="bag" onClick={() => git("ayarlar")}>Düzenli gelir ekle</button>
              ) : (
                <>
                  <span>{katYazi(kat)} aylık gelir</span>
                  {katDiger !== null && pano.digerBorcu > 0 && <small>diğer dahil {katYazi(katDiger)} aylık gelir</small>}
                  <small>aylık gelir ≈ <Tl k={aylik.toplam} /></small>
                </>
              )}
            </dd>
          </div>
        </dl>
        {pano.toplamKullanim !== null && <p className="not">Kart + KMH limitlerinin %{Math.round(pano.toplamKullanim * 100)}'i kullanılıyor.</p>}
        {pano.guncelTarih && <p className="not">Veri tarihi: {tarihKisa(pano.guncelTarih)}</p>}
        {aylik.dovizVar && aylik.kalemler.some((k) => k.kalem.paraBirimi !== "TRY") && (
          <p className="not">
            Dövizli gelirin TL karşılığı {veri.ayarlar.usdTry > 0 ? `tahmini kurla (${kurYazi(veri.ayarlar.usdTry)}) hesaplandı; resmî kur değildir.` : "kur girilmediği için toplama katılmadı (Ayarlar › Döviz kuru)."}
          </p>
        )}
      </section>

      {dagilim.length > 0 && (
        <Bolum baslik="Borç dağılımı">
          <Halka
            etiket={`Borç dağılımı: ${dagilim.map((d) => `${d.hesap.ad} %${Math.round(d.pay * 100)}`).join(", ")}`}
            merkezAlt="Diğer hariç"
            merkez={`${Math.round(pano.toplamIsyeriHaric / 100).toLocaleString("tr-TR")} TL`}
            dilimler={dagilim.map((d) => ({ anahtar: d.hesap.id, ad: d.hesap.ad, deger: d.borc, renk: renkler.get(d.hesap.id) ?? "var(--g1)" }))}
          />
        </Bolum>
      )}

      {gelir.gecikenAdet > 0 && (
        <button type="button" className="uyari" onClick={() => git("takvim/gelirler")}>
          <strong>Geciken alacak: <Tl k={gelir.geciken} /></strong>
          <span>
            {gelir.gecikenAdet} gelir beklenen tarihte gelmedi{gelir.bekleyenAdet > 0 ? ` · ${gelir.bekleyenAdet} bekleyen: ` : ""}
            {gelir.bekleyenAdet > 0 && <Tl k={gelir.bekleyen} />}
          </span>
        </button>
      )}

      <Bolum baslik="Ödeme senaryosu" sag={<span className="sag-yazi">tahmini</span>}>
        <dl className="degerler">
          <div><dt>Ekstreleri tamamen ödersem</dt><dd><Tl k={s.ekstreToplami} /></dd></div>
          <div><dt>Sadece asgari ödersem</dt><dd><Tl k={s.asgariToplami} /></dd></div>
          <div><dt>Asgari ödersem devreden kart borcu</dt><dd><Tl k={s.devreden} /></dd></div>
          <div><dt>Tahmini aylık faiz (kart + KMH)</dt><dd className="negatif"><Tl k={s.aylikFaiz} /></dd></div>
          <div><dt>Sonraki ekstreye düşecek (tek çekim + taksit)</dt><dd><Tl k={sonrakiEkstre} /></dd></div>
        </dl>
        <p className="not">
          Kart faizi: devreden × %{(veri.ayarlar.kartFaiziAlt * 100).toFixed(1).replace(".", ",")} / %{(veri.ayarlar.kartFaiziUst * 100).toFixed(1).replace(".", ",")} × {veri.ayarlar.vergiCarpani.toString().replace(".", ",")} (KKDF+BSMV).
          KMH: borç × %{(veri.ayarlar.kmhFaizi * 100).toFixed(2).replace(".", ",")} × {veri.ayarlar.vergiCarpani.toString().replace(".", ",")}. Bankanın günlük hesabından farklı olabilir.
        </p>
        <button type="button" className="satir-dugme" onClick={() => git("senaryo")}>
          Ödeme senaryosuna git <span aria-hidden="true">›</span>
        </button>
      </Bolum>

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
                  {o.doviz && <span className="alt">{dovizYazi(o.doviz.tutar, o.doviz.paraBirimi)}</span>}
                </div>
                {o.tutar !== undefined && (
                  <span className={o.tur === "gelir" ? "pozitif" : ""}>
                    {o.tutarTahmini && <small className="yaklasik">≈ </small>}
                    <Tl k={o.tutar} isaret={o.tur === "gelir"} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Bolum>

      {ozetler.length > 0 && (
        <Bolum
          baslik="Tüm aylar"
          sag={
            <span className="sag-yazi">
              {ozetler.length} ay ·{" "}
              <button type="button" className="bag" onClick={() => git("gecmis")}>
                Grafik
              </button>
            </span>
          }
        >
          <AylarTablosu ozetler={ozetler.slice(-PANODAKI_AY)} ac={(ay) => git(`aylar/${ay}`)} />
          {ozetler.length > PANODAKI_AY && (
            <button type="button" className="satir-dugme" onClick={() => git("aylar")}>
              Tüm {ozetler.length} ayı gör <span aria-hidden="true">›</span>
            </button>
          )}
        </Bolum>
      )}

      <div className="hizli">
        <button type="button" className="birinci" onClick={() => ac({ tur: "ekle", sekme: "durum" })}>Güncel durumu gir</button>
        <button type="button" className="ikinci" onClick={() => ac({ tur: "ekle", sekme: "harcama" })}>Harcama ekle</button>
      </div>

      <p className="not alt-not">
        Tutarlar girdiğiniz ölçümlerden hesaplanır; bankayla bağlantı yoktur. Faiz ve asgari ödeme rakamları tahmindir.
      </p>
    </>
  );
}
