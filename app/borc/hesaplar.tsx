"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useBorc, useGonder, useIs } from "./baglam";
import { oranCevir, oranMetni, tarihKisa, tlTam, kurusMetni, kurusaCevir, yuzde } from "./bicim";
import { gunFarki, hesapDurumlari, panoHesapla, type HesapDurumu } from "./hesap";
import type { Hesap, HesapGirdisi, HesapTuru, Veri } from "./ortak";
import { Alan, Bolum, Bos, Cubuk, Tl, TurRozeti } from "./parcalar";

/** Ölçüm bu kadar günden eskiyse rakam "bayat" uyarısı alır. */
const BAYAT_GUN = 7;

export default function Hesaplar() {
  const { veri, bugun, ac, metin } = useBorc();
  const pano = useMemo(() => panoHesapla(veri), [veri]);

  if (veri.hesaplar.length === 0) {
    return (
      <Bolum baslik="Hesaplar">
        <Bos>Henüz hesap yok. Kredi kartı, KMH (ek hesap) ya da diğer borçlarınızı ekleyin; her birinin güncel durumunu sonra girersiniz.</Bos>
        <div className="hizli tek">
          <button type="button" className="birinci" onClick={() => ac({ tur: "hesap" })}>
            Hesap ekle
          </button>
        </div>
      </Bolum>
    );
  }

  const kartlar = pano.hesaplar.filter((h) => h.hesap.tur === "kart");
  const kmhler = pano.hesaplar.filter((h) => h.hesap.tur === "kmh");
  const digerleri = pano.hesaplar.filter((h) => h.hesap.tur === "diger");

  return (
    <>
      <div className="arac-cubugu">
        <button type="button" className="ikinci kucuk" onClick={() => ac({ tur: "hesap" })}>
          + Hesap ekle
        </button>
      </div>

      {kartlar.length > 0 && (
        <Bolum baslik="Kredi kartları" sag={<span className="sag-yazi"><Tl k={pano.kartBorcu} /> / <Tl k={pano.kartLimit} /></span>}>
          <ul className="hesaplar">
            {kartlar.map((h) => (
              <HesapSatiri key={h.hesap.id} h={h} bugun={bugun} />
            ))}
          </ul>
        </Bolum>
      )}

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
        <Bolum baslik={metin.diger} sag={<span className="sag-yazi">toplamda bir kez sayılır</span>}>
          <ul className="hesaplar">
            {digerleri.map((h) => (
              <HesapSatiri key={h.hesap.id} h={h} bugun={bugun} />
            ))}
          </ul>
        </Bolum>
      )}
    </>
  );
}

function HesapSatiri({ h, bugun }: { h: HesapDurumu; bugun: string }) {
  const { ac } = useBorc();
  const yas = h.olcumTarihi ? gunFarki(h.olcumTarihi, bugun) : null;
  const bayat = yas !== null && yas > BAYAT_GUN;
  const asim = h.kullanim !== null && h.kullanim > 1;
  return (
    <li className="hesap">
      <div className="hesap-ust">
        <strong>
          {h.hesap.ad} <TurRozeti tur={h.hesap.tur} />
        </strong>
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
      <div className="hesap-dugmeler">
        <button type="button" className="ikinci kucuk" onClick={() => ac({ tur: "ekle", sekme: "durum", hesapId: h.hesap.id })}>
          Durumu güncelle
        </button>
        <button type="button" className="bag" onClick={() => ac({ tur: "hesapDetay", hesapId: h.hesap.id })}>
          Ayrıntı ›
        </button>
      </div>
    </li>
  );
}

/* ── Ayrıntı penceresi: ölçüm geçmişi, düzenle ───────────────────────── */

export function HesapDetayi({ hesapId, kapat }: { hesapId: number; kapat: () => void }) {
  const { veri, bugun, ac, api } = useBorc();
  const { calisiyor, calistir } = useIs();
  const durum = useMemo(() => hesapDurumlari(veri).find((h) => h.hesap.id === hesapId), [veri, hesapId]);
  const olcumler = useMemo(() => veri.durum.filter((d) => d.hesapId === hesapId).sort((a, b) => b.tarih.localeCompare(a.tarih) || b.id - a.id).slice(0, 12), [veri.durum, hesapId]);
  const islemSayisi = useMemo(() => veri.islemler.filter((i) => i.hesapId === hesapId).length, [veri.islemler, hesapId]);

  if (!durum) return <p className="bos">Hesap bulunamadı.</p>;
  const { hesap } = durum;

  return (
    <>
      <p className="alt hesap-ozet">
        <TurRozeti tur={hesap.tur} />{" "}
        {hesap.tur === "kart" && hesap.kesimGunu && <>kesim günü {hesap.kesimGunu}</>}
        {hesap.tur === "kart" && hesap.sonOdemeGunu && <> · son ödeme günü {hesap.sonOdemeGunu}</>}
        {hesap.tur === "kart" && hesap.asgariOrani !== null && <> · asgari %{oranMetni(hesap.asgariOrani)}</>}
      </p>
      <dl className="degerler">
        <div><dt>Güncel borç</dt><dd className="kalin"><Tl k={durum.borc} tam /></dd></div>
        {durum.limit > 0 && <div><dt>Limit</dt><dd><Tl k={durum.limit} tam /></dd></div>}
        {durum.kullanim !== null && <div><dt>Limit kullanımı</dt><dd>{yuzde(durum.kullanim)}</dd></div>}
        {durum.olcumTarihi && <div><dt>Son ölçüm</dt><dd>{tarihKisa(durum.olcumTarihi)}{gunFarki(durum.olcumTarihi, bugun) > 0 ? ` (${gunFarki(durum.olcumTarihi, bugun)} gün önce)` : " (bugün)"}</dd></div>}
      </dl>

      <div className="hizli">
        <button type="button" className="birinci" onClick={() => { kapat(); ac({ tur: "ekle", sekme: "durum", hesapId }); }}>
          Durumu güncelle
        </button>
        <button type="button" className="ikinci" onClick={() => { kapat(); ac({ tur: "hesap", hesap }); }}>
          Düzenle
        </button>
      </div>

      <h3 className="alt-baslik">Ölçüm geçmişi</h3>
      {olcumler.length === 0 ? (
        <Bos>Henüz ölçüm yok.</Bos>
      ) : (
        <ul className="liste">
          {olcumler.map((d) => (
            <li key={d.id} className="satir">
              <div>
                <strong>{tarihKisa(d.tarih)} {d.tarih.slice(0, 4)}</strong>
                <span className="alt">
                  {d.ekstre !== null ? <>Ekstre {tlTam(d.ekstre)}</> : "ekstre girilmemiş"}
                  {d.asgari !== null && <> · asgari {tlTam(d.asgari)}</>}
                </span>
              </div>
              <div className="sag-kolon">
                <Tl k={d.borc} tam />
                <button
                  type="button"
                  className="bag tehlike"
                  disabled={calisiyor === `d${d.id}`}
                  onClick={() => window.confirm(`${tarihKisa(d.tarih)} tarihli ölçüm silinsin mi?`) && void calistir(`d${d.id}`, () => api.durumSil(d.id), "Ölçüm silindi")}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="not">{islemSayisi > 0 ? `${islemSayisi} harcama kaydı bu hesaba bağlı (İşlemler sekmesi).` : "Bu hesaba bağlı harcama kaydı yok."}</p>
    </>
  );
}

/* ── Hesap ekle / düzenle ──────────────────────────────────────────────── */

const TURLER: { id: HesapTuru; ad: string }[] = [
  { id: "kart", ad: "Kredi kartı" },
  { id: "kmh", ad: "KMH (kredili mevduat)" },
  { id: "diger", ad: "Diğer borç" }
];

export function HesapFormu({ hesap, kaydedildi }: { hesap?: Hesap; kaydedildi: (veri: Veri, mesaj: string) => void }) {
  const { veri, api, metin } = useBorc();
  const [ad, setAd] = useState(hesap?.ad ?? "");
  const [tur, setTur] = useState<HesapTuru>(hesap?.tur ?? "kart");
  const [limit, setLimit] = useState(hesap && hesap.limit > 0 ? kurusMetni(hesap.limit) : "");
  const [kesim, setKesim] = useState(hesap?.kesimGunu ? String(hesap.kesimGunu) : "");
  const [sonOdeme, setSonOdeme] = useState(hesap?.sonOdemeGunu ? String(hesap.sonOdemeGunu) : "");
  const [asgari, setAsgari] = useState(hesap?.asgariOrani != null ? oranMetni(hesap.asgariOrani) : "");
  const { hata, setHata, bekliyor, gonder } = useGonder(kaydedildi);
  const varsayilanAsgari = oranMetni(veri.ayarlar.varsayilanAsgariOrani);

  function gun(metinDegeri: string, ne: string): number | null | undefined {
    if (!metinDegeri.trim()) return null;
    const n = Number(metinDegeri);
    if (!Number.isInteger(n) || n < 1 || n > 31) {
      setHata(`${ne} 1 ile 31 arasında bir gün olmalı.`);
      return undefined;
    }
    return n;
  }

  function gec(e: FormEvent) {
    e.preventDefault();
    if (!ad.trim()) return setHata("Hesabın adını yazın.");
    const girdi: HesapGirdisi = { ad: ad.trim(), tur };
    if (tur !== "diger") {
      const l = limit.trim() ? kurusaCevir(limit) : 0;
      if (l === null || l < 0) return setHata("Limit geçerli değil (örn. 150.000).");
      girdi.limit = l;
    }
    if (tur === "kart") {
      const k = gun(kesim, "Hesap kesim günü");
      if (k === undefined) return;
      const s = gun(sonOdeme, "Son ödeme günü");
      if (s === undefined) return;
      let oran: number | null = null;
      if (asgari.trim()) {
        oran = oranCevir(asgari);
        if (oran === null || oran > 1) return setHata("Asgari ödeme oranı %0 ile %100 arasında olmalı (örn. 40).");
      }
      girdi.kesimGunu = k;
      girdi.sonOdemeGunu = s;
      girdi.asgariOrani = oran;
    }
    void gonder(() => (hesap ? api.hesapGuncelle(hesap.id, girdi) : api.hesapEkle(girdi)), hesap ? `${girdi.ad} güncellendi` : `${girdi.ad} eklendi`);
  }

  function sil() {
    if (!hesap) return;
    const kayit = veri.islemler.filter((i) => i.hesapId === hesap.id).length;
    const olcum = veri.durum.filter((d) => d.hesapId === hesap.id).length;
    const uyari = `“${hesap.ad}” silinsin mi?\n\nBu hesabın ${olcum} ölçümü ve ${kayit} harcama kaydı da silinir. Geri alınamaz.`;
    if (window.confirm(uyari)) void gonder(() => api.hesapSil(hesap.id), `${hesap.ad} silindi`);
  }

  return (
    <form className="form" onSubmit={gec} noValidate>
      <Alan etiket="Ad">
        <input autoComplete="off" maxLength={80} placeholder={tur === "diger" ? "Örn. Tedarikçi, ortak" : "Örn. Mavi Banka KK"} value={ad} onChange={(e) => setAd(e.target.value)} />
      </Alan>
      <Alan etiket="Tür" ipucu={hesap ? "Tür sonradan değiştirilemez; yanlışsa hesabı silip yeniden ekleyin." : tur === "diger" ? metin.digerAciklama : undefined}>
        <select value={tur} disabled={!!hesap} onChange={(e) => setTur(e.target.value as HesapTuru)}>
          {TURLER.map((t) => (
            <option key={t.id} value={t.id}>{t.ad}</option>
          ))}
        </select>
      </Alan>
      {tur !== "diger" && (
        <Alan etiket="Limit (₺)">
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </Alan>
      )}
      {tur === "kart" && (
        <>
          <div className="iki-sutun">
            <Alan etiket="Hesap kesim günü">
              <input inputMode="numeric" autoComplete="off" maxLength={2} placeholder="örn. 7" value={kesim} onChange={(e) => setKesim(e.target.value)} />
            </Alan>
            <Alan etiket="Son ödeme günü">
              <input inputMode="numeric" autoComplete="off" maxLength={2} placeholder="örn. 17" value={sonOdeme} onChange={(e) => setSonOdeme(e.target.value)} />
            </Alan>
          </div>
          <Alan etiket="Asgari ödeme oranı (%)" ipucu={`Boşsa varsayılan %${varsayilanAsgari} kullanılır (Ayarlar › Faiz varsayımları). Ekstrede bankanın yazdığı asgari varsa o kullanılır.`}>
            <input inputMode="decimal" autoComplete="off" placeholder={varsayilanAsgari} value={asgari} onChange={(e) => setAsgari(e.target.value)} />
          </Alan>
        </>
      )}
      {hata && <p className="hata" role="alert">{hata}</p>}
      <button type="submit" className="birinci" disabled={bekliyor}>{bekliyor ? "Kaydediliyor…" : hesap ? "Kaydet" : "Hesabı ekle"}</button>
      {hesap && (
        <button type="button" className="bag tehlike orta" disabled={bekliyor} onClick={sil}>
          Hesabı sil
        </button>
      )}
    </form>
  );
}
