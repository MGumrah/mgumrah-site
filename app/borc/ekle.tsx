"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useBorc, useGonder } from "./baglam";
import { ayAdi, kurusMetni, kurusaCevir, tl, tlTam, yuzde } from "./bicim";
import { ekstreAyi, guncelDurumlar, gunEkle, taksitDagilimi } from "./hesap";
import type { Hesap, Islem, ParaBirimi, Veri } from "./ortak";
import { Alan, Segment } from "./parcalar";

export type EkleSekmesi = "harcama" | "durum" | "gelir";

const SEKMELER: { id: EkleSekmesi; ad: string }[] = [
  { id: "harcama", ad: "Harcama" },
  { id: "durum", ad: "Güncel durum" },
  { id: "gelir", ad: "Gelir" }
];

const TAKSITLER = [1, 2, 3, 4, 6, 9, 12];
const SON_KART = "borc:son-kart";

type Kaydedildi = (veri: Veri, mesaj: string) => void;

/** "+" düğmesinin penceresi: harcama, güncel durum (ölçüm) ya da gelir. */
export default function Ekle({ ilkSekme, hesapId, kaydedildi }: { ilkSekme: EkleSekmesi; hesapId?: number; kaydedildi: Kaydedildi }) {
  const [sekme, setSekme] = useState<EkleSekmesi>(ilkSekme);
  return (
    <>
      <Segment secenekler={SEKMELER} secili={sekme} sec={setSekme} etiket="Kayıt türü" />
      {sekme === "harcama" && <HarcamaFormu hesapId={hesapId} kaydedildi={kaydedildi} />}
      {sekme === "durum" && <DurumFormu hesapId={hesapId} kaydedildi={kaydedildi} />}
      {sekme === "gelir" && <GelirFormu kaydedildi={kaydedildi} />}
    </>
  );
}

/** Var olan bir harcamayı düzenleme / silme penceresi. */
export function IslemDuzenle({ islem, kaydedildi }: { islem: Islem; kaydedildi: Kaydedildi }) {
  return <HarcamaFormu islem={islem} kaydedildi={kaydedildi} />;
}

/* ── Harcama ───────────────────────────────────────────────────────────── */

function HarcamaFormu({ islem, hesapId: istenenHesap, kaydedildi }: { islem?: Islem; hesapId?: number; kaydedildi: Kaydedildi }) {
  const { veri, bugun, api } = useBorc();
  const kartlar = veri.hesaplar.filter((h) => h.tur === "kart");
  const [hesapId, setHesapId] = useState<number>(() => {
    if (islem) return islem.hesapId;
    if (istenenHesap && kartlar.some((k) => k.id === istenenHesap)) return istenenHesap;
    try {
      const son = Number(localStorage.getItem(SON_KART));
      if (kartlar.some((k) => k.id === son)) return son;
    } catch {
      // sorun değil
    }
    return kartlar[0]?.id ?? 0;
  });
  const [tutar, setTutar] = useState(islem ? kurusMetni(Math.abs(islem.tutar)) : "");
  const [iade, setIade] = useState(islem ? islem.tutar < 0 : false);
  const [taksit, setTaksit] = useState(islem?.taksit ?? 1);
  const [aciklama, setAciklama] = useState(islem?.aciklama ?? "");
  const [tarih, setTarih] = useState(islem?.tarih ?? bugun);
  const [kategori, setKategori] = useState(islem?.kategori ?? "");
  const [not, setNot] = useState(islem?.not ?? "");
  const { hata, setHata, bekliyor, gonder } = useGonder(kaydedildi);

  const kart: Hesap | undefined = kartlar.find((k) => k.id === hesapId);
  const kurus = kurusaCevir(tutar);
  const net = kurus === null ? null : iade ? -Math.abs(kurus) : Math.abs(kurus);
  const ekstre = kart && /^\d{4}-\d{2}-\d{2}$/.test(tarih) ? ekstreAyi(tarih, kart.kesimGunu) : null;
  const dagilim = net !== null && ekstre ? taksitDagilimi(net, taksit, ekstre) : null;

  function gec(e: FormEvent) {
    e.preventDefault();
    if (!kart) return setHata("Önce bir kart seçin.");
    if (net === null || net === 0) return setHata("Geçerli bir tutar yazın (örn. 1.249,90).");
    if (!aciklama.trim()) return setHata("Ne için olduğunu yazın.");
    try {
      localStorage.setItem(SON_KART, String(kart.id));
    } catch {
      // sorun değil
    }
    const girdi = {
      tarih,
      hesapId: kart.id,
      aciklama: aciklama.trim(),
      tutar: net,
      taksit,
      kategori: kategori.trim(),
      not: not.trim(),
      // Tarih ve kart değişmediyse elle verilmiş/içe aktarılmış ekstre ayı korunur; değiştiyse sunucu yeniden hesaplar.
      ...(islem && islem.tarih === tarih && islem.hesapId === kart.id ? { ekstreAy: islem.ekstreAy } : {})
    };
    void gonder(() => (islem ? api.islemGuncelle(islem.id, girdi) : api.islemEkle(girdi)), islem ? `${girdi.aciklama} güncellendi` : `${girdi.aciklama} eklendi`);
  }

  function sil() {
    if (!islem || !window.confirm(`“${islem.aciklama}” silinsin mi?`)) return;
    void gonder(() => api.islemSil(islem.id), "İşlem silindi");
  }

  if (kartlar.length === 0) return <p className="bos">Önce kredi kartı hesabı gerekli (Hesaplar › Hesap ekle).</p>;

  return (
    <form className="form" onSubmit={gec} noValidate>
      <Alan etiket="Kart">
        <select value={hesapId} onChange={(e) => setHesapId(Number(e.target.value))}>
          {kartlar.map((k) => (
            <option key={k.id} value={k.id}>{k.ad}</option>
          ))}
        </select>
      </Alan>
      <div className="iki-sutun">
        <Alan etiket="Tutar (₺)">
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={tutar} onChange={(e) => setTutar(e.target.value)} />
        </Alan>
        <Alan etiket="Tarih">
          <input type="date" value={tarih} max={gunEkle(bugun, 31)} onChange={(e) => setTarih(e.target.value)} />
        </Alan>
      </div>
      <label className="onay">
        <input type="checkbox" checked={iade} onChange={(e) => setIade(e.target.checked)} />
        <span>İade / ödeme (tutar kartın borcundan düşer)</span>
      </label>
      <fieldset className="taksit-secici">
        <legend>Taksit</legend>
        <div className="cipler">
          {TAKSITLER.map((n) => (
            <button key={n} type="button" className={taksit === n ? "secili" : ""} aria-pressed={taksit === n} onClick={() => setTaksit(n)}>
              {n === 1 ? "Tek" : n}
            </button>
          ))}
          <input
            className="diger-taksit"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            aria-label="Başka taksit sayısı"
            placeholder="diğer"
            value={TAKSITLER.includes(taksit) ? "" : taksit}
            onChange={(e) => setTaksit(Math.min(60, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
          />
        </div>
      </fieldset>
      <Alan etiket="Açıklama">
        <input autoComplete="off" maxLength={160} placeholder="Ne için?" value={aciklama} onChange={(e) => setAciklama(e.target.value)} />
      </Alan>
      <div className="iki-sutun">
        <Alan etiket="Kategori (isteğe bağlı)">
          <input autoComplete="off" maxLength={40} value={kategori} onChange={(e) => setKategori(e.target.value)} />
        </Alan>
        <Alan etiket="Not (isteğe bağlı)">
          <input autoComplete="off" maxLength={400} value={not} onChange={(e) => setNot(e.target.value)} />
        </Alan>
      </div>

      {ekstre && (
        <p className="onizleme">
          {ayAdi(ekstre)} ekstresine düşer
          {kart?.kesimGunu ? ` (kesim günü ${kart.kesimGunu})` : ""}
          {dagilim && taksit > 1 && net !== null && net !== 0 && (
            <>
              <br />
              {taksit} × {tlTam(dagilim[1]?.tutar ?? dagilim[0].tutar)} · {ayAdi(dagilim[0].ay)}–{ayAdi(dagilim[dagilim.length - 1].ay)}
            </>
          )}
        </p>
      )}

      {hata && <p className="hata" role="alert">{hata}</p>}
      <button type="submit" className="birinci" disabled={bekliyor}>{bekliyor ? "Kaydediliyor…" : islem ? "Kaydet" : "Harcamayı ekle"}</button>
      {islem && (
        <button type="button" className="bag tehlike orta" disabled={bekliyor} onClick={sil}>
          Bu harcamayı sil
        </button>
      )}
    </form>
  );
}

/* ── Güncel durum ──────────────────────────────────────────────────────── */

function DurumFormu({ hesapId: istenen, kaydedildi }: { hesapId?: number; kaydedildi: Kaydedildi }) {
  const { veri, bugun } = useBorc();
  const guncel = useMemo(() => guncelDurumlar(veri.durum), [veri.durum]);
  const hesaplar = useMemo(() => [...veri.hesaplar].sort((a, b) => a.sira - b.sira || a.id - b.id), [veri.hesaplar]);
  const [hesapId, setHesapId] = useState<number>(istenen && hesaplar.some((h) => h.id === istenen) ? istenen : (hesaplar[0]?.id ?? 0));
  const hesap = hesaplar.find((h) => h.id === hesapId);
  const onceki = hesap ? guncel.get(hesap.id) : undefined;

  if (hesaplar.length === 0) return <p className="bos">Önce bir hesap ekleyin (Hesaplar › Hesap ekle).</p>;

  // Hesap değişince alanlar o hesabın son bilinen değerleriyle dolsun (anahtar: hesap).
  return <DurumAlanlari key={hesapId} hesaplar={hesaplar} hesap={hesap} onceki={onceki} bugun={bugun} hesapSec={setHesapId} kaydedildi={kaydedildi} />;
}

function DurumAlanlari({
  hesaplar,
  hesap,
  onceki,
  bugun,
  hesapSec,
  kaydedildi
}: {
  hesaplar: Hesap[];
  hesap: Hesap | undefined;
  onceki: Veri["durum"][number] | undefined;
  bugun: string;
  hesapSec: (id: number) => void;
  kaydedildi: Kaydedildi;
}) {
  const { api } = useBorc();
  const limitBaslangic = onceki?.limit ?? hesap?.limit ?? 0;
  const [limit, setLimit] = useState(limitBaslangic ? kurusMetni(limitBaslangic) : "");
  const [deger, setDeger] = useState(""); // kart: kullanılabilir limit · kmh: bakiye · diğer: borç
  const [ekstre, setEkstre] = useState(onceki?.ekstre != null ? kurusMetni(onceki.ekstre) : "");
  const [asgari, setAsgari] = useState(onceki?.asgari != null ? kurusMetni(onceki.asgari) : "");
  const [sonOdeme, setSonOdeme] = useState(onceki?.sonOdeme && onceki.sonOdeme >= bugun ? onceki.sonOdeme : "");
  const [tarih, setTarih] = useState(bugun);
  const { hata, setHata, bekliyor, gonder } = useGonder(kaydedildi);

  if (!hesap) return <p className="bos">Hesap yok.</p>;

  const tur = hesap.tur;
  const limitKurus = kurusaCevir(limit);
  const degerKurus = kurusaCevir(deger);

  // Kart borcu = limit − kullanılabilir limit; KMH borcu = hesabın eksi bakiyesi (artıdaysa 0).
  let borc: number | null = null;
  if (degerKurus !== null) {
    if (tur === "kart") borc = limitKurus === null ? null : limitKurus - degerKurus;
    else if (tur === "kmh") borc = Math.max(0, -degerKurus);
    else borc = degerKurus;
  }

  function gec(e: FormEvent) {
    e.preventDefault();
    if (borc === null) return setHata(tur === "kart" ? "Limit ve kullanılabilir limiti yazın." : "Tutarı yazın.");
    if (borc < 0) return setHata("Kullanılabilir limit, limitten büyük olamaz.");
    const ekstreKurus = ekstre.trim() ? kurusaCevir(ekstre) : null;
    const asgariKurus = asgari.trim() ? kurusaCevir(asgari) : null;
    if ((ekstre.trim() && ekstreKurus === null) || (asgari.trim() && asgariKurus === null)) return setHata("Ekstre ve asgari tutarı geçerli değil.");
    void gonder(
      () =>
        api.durumKaydet({
          hesapId: hesap!.id,
          tarih,
          borc: borc!,
          limit: tur === "diger" ? null : limitKurus,
          ekstre: tur === "kart" ? ekstreKurus : null,
          asgari: tur === "kart" ? asgariKurus : null,
          sonOdeme: tur === "kart" && sonOdeme ? sonOdeme : null
        }),
      `${hesap!.ad} güncellendi · ${tl(borc!)}`
    );
  }

  return (
    <form className="form" onSubmit={gec} noValidate>
      <Alan etiket="Hesap">
        <select value={hesap.id} onChange={(e) => hesapSec(Number(e.target.value))}>
          {hesaplar.map((h) => (
            <option key={h.id} value={h.id}>{h.ad}</option>
          ))}
        </select>
      </Alan>

      {tur !== "diger" && (
        <Alan etiket="Limit (₺)">
          <input inputMode="decimal" autoComplete="off" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </Alan>
      )}

      {tur === "kart" && (
        <Alan etiket="Kullanılabilir limit (₺)" ipucu="Bankanın uygulamasındaki “kullanılabilir limit”. Borç = limit − kullanılabilir limit.">
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={deger} onChange={(e) => setDeger(e.target.value)} />
        </Alan>
      )}
      {tur === "kmh" && (
        <Alan etiket="Hesap bakiyesi (₺)" ipucu="Eksideyse başına − koyun (örn. -12.345,60). Artıdaysa borç 0 sayılır.">
          <input inputMode="decimal" autoComplete="off" placeholder="-0,00" value={deger} onChange={(e) => setDeger(e.target.value)} />
        </Alan>
      )}
      {tur === "diger" && (
        <Alan etiket="Güncel borç (₺)">
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={deger} onChange={(e) => setDeger(e.target.value)} />
        </Alan>
      )}

      {tur === "kart" && (
        <>
          <div className="iki-sutun">
            <Alan etiket="Son ekstre borcu (₺)">
              <input inputMode="decimal" autoComplete="off" placeholder="isteğe bağlı" value={ekstre} onChange={(e) => setEkstre(e.target.value)} />
            </Alan>
            <Alan etiket="Asgari ödeme (₺)">
              <input inputMode="decimal" autoComplete="off" placeholder="boşsa tahmin" value={asgari} onChange={(e) => setAsgari(e.target.value)} />
            </Alan>
          </div>
          <Alan etiket="Son ödeme tarihi">
            <input type="date" value={sonOdeme} onChange={(e) => setSonOdeme(e.target.value)} />
          </Alan>
        </>
      )}

      <Alan etiket="Ölçüm tarihi">
        <input type="date" value={tarih} max={bugun} onChange={(e) => setTarih(e.target.value)} />
      </Alan>

      {borc !== null && borc >= 0 && (
        <p className="onizleme">
          Borç: <strong>{tlTam(borc)}</strong>
          {limitKurus && tur !== "diger" ? ` · limit kullanımı ${yuzde(borc / limitKurus)}` : ""}
        </p>
      )}

      {hata && <p className="hata" role="alert">{hata}</p>}
      <button type="submit" className="birinci" disabled={bekliyor}>{bekliyor ? "Kaydediliyor…" : "Durumu kaydet"}</button>
    </form>
  );
}

/* ── Gelir ─────────────────────────────────────────────────────────────── */

function GelirFormu({ kaydedildi }: { kaydedildi: Kaydedildi }) {
  const { bugun, api, metin } = useBorc();
  const [ad, setAd] = useState("");
  const [tutar, setTutar] = useState("");
  const [tarih, setTarih] = useState(bugun);
  const [paraBirimi, setParaBirimi] = useState<ParaBirimi>("TRY");
  const [kesin, setKesin] = useState(true);
  const [alindi, setAlindi] = useState(false);
  const [not, setNot] = useState("");
  const { hata, setHata, bekliyor, gonder } = useGonder(kaydedildi);

  function gec(e: FormEvent) {
    e.preventDefault();
    const kurus = kurusaCevir(tutar);
    if (!ad.trim()) return setHata(`Gelirin adını yazın (örn. ${metin.gelirOrnek}).`);
    if (kurus === null || kurus <= 0) return setHata("Geçerli bir tutar yazın.");
    void gonder(
      () => api.gelirEkle({ ad: ad.trim(), tutar: kurus, paraBirimi, beklenenTarih: tarih, kesin, alindiTarihi: alindi ? bugun : null, not: not.trim() }),
      `${ad.trim()} eklendi`
    );
  }

  return (
    <form className="form" onSubmit={gec} noValidate>
      <Alan etiket="Ad">
        <input autoComplete="off" maxLength={80} placeholder={metin.gelirOrnek} value={ad} onChange={(e) => setAd(e.target.value)} />
      </Alan>
      <div className="iki-sutun">
        <Alan etiket={`Tutar (${paraBirimi === "USD" ? "USD" : "₺"})`}>
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={tutar} onChange={(e) => setTutar(e.target.value)} />
        </Alan>
        <Alan etiket="Para birimi">
          <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value as ParaBirimi)}>
            <option value="TRY">TL</option>
            <option value="USD">USD</option>
          </select>
        </Alan>
      </div>
      <Alan etiket="Beklenen tarih">
        <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
      </Alan>
      <label className="onay">
        <input type="checkbox" checked={!kesin} onChange={(e) => setKesin(!e.target.checked)} />
        <span>Tarih kesin değil</span>
      </label>
      <label className="onay">
        <input type="checkbox" checked={alindi} onChange={(e) => setAlindi(e.target.checked)} />
        <span>Zaten alındı (bugün)</span>
      </label>
      <Alan etiket="Not (isteğe bağlı)">
        <input autoComplete="off" maxLength={400} value={not} onChange={(e) => setNot(e.target.value)} />
      </Alan>
      {hata && <p className="hata" role="alert">{hata}</p>}
      <button type="submit" className="birinci" disabled={bekliyor}>{bekliyor ? "Kaydediliyor…" : "Geliri ekle"}</button>
    </form>
  );
}
