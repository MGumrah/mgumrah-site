"use client";

import { useMemo } from "react";
import { ayAdi, ayKisa, farkYazi, liraKisa, tarihKisa, tlTam, yuzde } from "./bicim";
import { useBorc } from "./baglam";
import { ayDetayi, aylikOzetler, type AylikOzet } from "./hesap";
import { Bolum, Bos, Cubuk, Tl, TurRozeti } from "./parcalar";

/** Fark rengi: borç arttıysa kırmızı, azaldıysa yeşil. */
const farkSinifi = (fark: number | null) => (fark === null || fark === 0 ? "" : fark > 0 ? "negatif" : "pozitif");

/**
 * "Tüm aylar" tablosu: ay, kart, KMH, toplam (diğer hariç), diğer, fark. "–" o ay o türden kayıt yok demektir (0 değil).
 * En yeni ay üstte; satıra dokununca ay detayı açılır.
 */
export function AylarTablosu({ ozetler, ac }: { ozetler: AylikOzet[]; ac: (ay: string) => void }) {
  const satirlar = [...ozetler].reverse();
  return (
    <>
      <div className="tablo-kaydir" tabIndex={0} role="region" aria-label="Aylık borç tablosu">
        <table className="tablo aylar">
          <thead>
            <tr>
              <th scope="col">Ay</th>
              <th scope="col">Kart</th>
              <th scope="col">KMH</th>
              <th scope="col">Toplam</th>
              <th scope="col">Diğer</th>
              <th scope="col">Fark</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.map((o) => (
              <tr key={o.ay} className={o.kayitSayisi === 0 ? "bos-ay" : "tiklanir"} onClick={() => o.kayitSayisi > 0 && ac(o.ay)}>
                <th scope="row">
                  {o.kayitSayisi > 0 ? (
                    <button type="button" className="satir-bag" onClick={(e) => { e.stopPropagation(); ac(o.ay); }}>
                      {ayKisa(o.ay)}
                    </button>
                  ) : (
                    ayKisa(o.ay)
                  )}
                </th>
                <td>{o.kart === null ? "–" : <span className="t">{liraKisa(o.kart)}</span>}</td>
                <td>{o.kmh === null ? "–" : <span className="t">{liraKisa(o.kmh)}</span>}</td>
                <td className="kalin">{o.toplam === null ? "–" : <span className="t">{liraKisa(o.toplam)}</span>}</td>
                <td>{o.diger === null ? "–" : <span className="t">{liraKisa(o.diger)}</span>}</td>
                <td className={farkSinifi(o.fark)}>{o.fark === null ? "–" : <span className="t">{farkYazi(o.fark)}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="not">Tutarlar TL, kuruşsuz. Toplam = kart + KMH (diğer hariç). “–” o ay için kayıt yok demektir. Fark, toplamın bir önceki aya göre değişimidir (kırmızı artış, yeşil azalış).</p>
    </>
  );
}

/** Daha fazla › Tüm aylar. */
export default function Aylar() {
  const { veri, git } = useBorc();
  const ozetler = useMemo(() => aylikOzetler(veri), [veri]);
  if (ozetler.length === 0) return <Bos>Henüz ölçüm yok. Hesaplar sekmesinden güncel durumu girince aylar burada görünür.</Bos>;
  return (
    <Bolum
      baslik={`${ozetler.length} ay`}
      sag={
        <button type="button" className="bag" onClick={() => git("gecmis")}>
          Grafik
        </button>
      }
    >
      <AylarTablosu ozetler={ozetler} ac={(ay) => git(`aylar/${ay}`)} />
    </Bolum>
  );
}

/** Bir ayın detayı: özet, hesap kırılımı ve o ayın ekstresine düşen harcamalar. Üst/alt oklar komşu aya geçer. */
export function AyDetayi({ ay }: { ay: string }) {
  const { veri, git, metin } = useBorc();
  const ozetler = useMemo(() => aylikOzetler(veri), [veri]);
  const ozet = ozetler.find((o) => o.ay === ay);
  const kirilim = useMemo(() => ayDetayi(veri, ay), [veri, ay]);
  const hesapAdi = useMemo(() => new Map(veri.hesaplar.map((h) => [h.id, h.ad])), [veri.hesaplar]);
  const harcamalar = useMemo(() => veri.islemler.filter((i) => i.ekstreAy === ay).sort((a, b) => b.tarih.localeCompare(a.tarih) || b.id - a.id), [veri.islemler, ay]);
  const harcamaToplami = harcamalar.reduce((t, i) => t + i.tutar, 0);

  const aylar = ozetler.filter((o) => o.kayitSayisi > 0).map((o) => o.ay);
  const sira = aylar.indexOf(ay);
  const onceki = sira > 0 ? aylar[sira - 1] : null;
  const sonraki = sira >= 0 && sira < aylar.length - 1 ? aylar[sira + 1] : null;

  if (!ozet || ozet.kayitSayisi === 0) return <Bos>{ayAdi(ay)} için kayıt yok.</Bos>;

  return (
    <>
      <div className="ay-gezgin">
        <button type="button" className="ikinci kucuk" disabled={!onceki} onClick={() => onceki && git(`aylar/${onceki}`)} aria-label="Önceki ay">
          ‹ {onceki ? ayKisa(onceki) : ""}
        </button>
        <strong>{ayAdi(ay)}</strong>
        <button type="button" className="ikinci kucuk" disabled={!sonraki} onClick={() => sonraki && git(`aylar/${sonraki}`)} aria-label="Sonraki ay">
          {sonraki ? ayKisa(sonraki) : ""} ›
        </button>
      </div>

      <Bolum baslik="Özet">
        <dl className="degerler">
          <div><dt>Kredi kartları</dt><dd><Tl k={ozet.kart ?? 0} tam /></dd></div>
          <div><dt>KMH</dt><dd><Tl k={ozet.kmh ?? 0} tam /></dd></div>
          <div><dt>Toplam (diğer hariç)</dt><dd><Tl k={ozet.toplam ?? 0} tam /></dd></div>
          <div><dt>{metin.diger}</dt><dd><Tl k={ozet.diger ?? 0} tam /></dd></div>
          {ozet.fark !== null && (
            <div>
              <dt>Önceki aya göre</dt>
              <dd className={farkSinifi(ozet.fark)}>
                <span className="t">{ozet.fark > 0 ? "+" : ozet.fark < 0 ? "−" : ""}{tlTam(Math.abs(ozet.fark))}</span>
              </dd>
            </div>
          )}
        </dl>
      </Bolum>

      <Bolum baslik={`Hesap kırılımı (${kirilim.length})`}>
        <ul className="hesaplar">
          {kirilim.map(({ hesap, durum, kullanim }) => (
            <li key={hesap.id} className="hesap">
              <div className="hesap-ust">
                <strong>
                  {hesap.ad} <TurRozeti tur={hesap.tur} />
                </strong>
                {kullanim !== null && <span className={kullanim > 1 ? "negatif" : "alt"}>{yuzde(kullanim)}</span>}
              </div>
              {kullanim !== null && <Cubuk oran={kullanim} etiket={`${hesap.ad} limit kullanımı`} />}
              <dl className="degerler ince-liste">
                {(durum.limit ?? hesap.limit) > 0 && <div><dt>Limit</dt><dd><Tl k={durum.limit ?? hesap.limit} tam /></dd></div>}
                <div><dt>Borç</dt><dd className="kalin"><Tl k={durum.borc} tam /></dd></div>
                {hesap.tur === "kart" && durum.ekstre !== null && <div><dt>Ekstre</dt><dd><Tl k={durum.ekstre} tam /></dd></div>}
                {hesap.tur === "kart" && durum.asgari !== null && <div><dt>Asgari</dt><dd><Tl k={durum.asgari} tam /></dd></div>}
                {hesap.tur === "kart" && <div><dt>Son ödeme</dt><dd>{durum.sonOdeme ? tarihKisa(durum.sonOdeme) : "–"}</dd></div>}
              </dl>
              {durum.not && <p className="alt">{durum.not}</p>}
            </li>
          ))}
        </ul>
        <p className="not">Her hesap için bu ayın son ölçümü gösterilir ({ayAdi(ay)}).</p>
      </Bolum>

      {harcamalar.length > 0 && (
        <Bolum baslik={`${ayAdi(ay)} ekstresinde yapılan harcamalar`} sag={<span className="sag-yazi"><Tl k={harcamaToplami} /></span>}>
          <ul className="liste">
            {harcamalar.map((i) => (
              <li key={i.id} className="satir">
                <div>
                  <strong>{i.aciklama}</strong>
                  <span className="alt">
                    {tarihKisa(i.tarih)} · {hesapAdi.get(i.hesapId) ?? "?"}{i.taksit > 1 ? ` · ${i.taksit} taksit` : ""}
                  </span>
                </div>
                <span className={i.tutar < 0 ? "pozitif" : ""}><Tl k={i.tutar} tam /></span>
              </li>
            ))}
          </ul>
          <p className="not">Taksitli alışverişin tamamı yazılır; ekstreye düşen kısmı taksit tutarıdır, kalanı sonraki aylara dağılır (Taksit planı).</p>
        </Bolum>
      )}
    </>
  );
}

