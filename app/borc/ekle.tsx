"use client";

import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useBorc, useGonder } from "./baglam";
import { ayAdi, kurusMetni, kurusaCevir, tl, tlTam, yuzde } from "./bicim";
import {
  dahaFazlaOzeti,
  depoYaz,
  durumBorcu,
  durumDahaFazlaAlanlari,
  durumGirdisi,
  durumGizliOzet,
  durumIlk,
  durumLimitAnaGorunumde,
  gelirGirdisi,
  gelirGizliOzet,
  gelirIlk,
  harcamaGirdisi,
  harcamaGizliOzet,
  harcamaIlk,
  hesapKimligiOku,
  sonHesapAnahtari,
  sonKartAnahtari,
  tarayiciDeposu,
  varsayilanHesapId,
  type DurumDegerleri,
  type GelirDegerleri,
  type HarcamaDegerleri,
  type Para
} from "./form";
import { ekstreAyi, guncelDurumlar, gunEkle, taksitDagilimi } from "./hesap";
import type { Hesap, Islem, ParaBirimi, Veri } from "./ortak";
import { Alan, DahaFazla, Hata, HesapCipi, Segment, useDahaFazla } from "./parcalar";

/*
 * Üç ekleme formu da aynı düzende: ana görünümde yalnızca Tarih, Tutar, Açıklama (+ borcun yazılacağı hesabı gösteren
 * çip); kalan her alan tek bir "Daha fazla" bölümünde. Kural ve girdi kurulumu form.ts'te (testli); burası yalnızca ekran.
 * Gizli alanların değerleri formun durumunda durur ve kaydedilir, yani hiçbir özellik kapanmaz.
 */

export type EkleSekmesi = "harcama" | "durum" | "gelir";

const SEKMELER: { id: EkleSekmesi; ad: string }[] = [
  { id: "harcama", ad: "Harcama" },
  { id: "durum", ad: "Güncel durum" },
  { id: "gelir", ad: "Gelir" }
];

const TAKSITLER = [1, 2, 3, 4, 6, 9, 12];
const PARA: Para = { cevir: kurusaCevir, yaz: kurusMetni };

type Kaydedildi = (veri: Veri, mesaj: string) => void;

/** Tutarda Enter: açıklama boşsa imleç açıklamaya geçer (hata göstermeden), doluysa form kaydedilir. */
function tutardaEnter(e: KeyboardEvent<HTMLInputElement>, aciklamaBos: boolean, aciklama: { current: HTMLInputElement | null }) {
  if (e.key !== "Enter" || !aciklamaBos || !aciklama.current) return;
  e.preventDefault();
  aciklama.current.focus();
}

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
  const { veri, bugun, api, kapsam } = useBorc();
  const kartlar = veri.hesaplar.filter((h) => h.tur === "kart");
  const [f, setF] = useState<HarcamaDegerleri>(() =>
    harcamaIlk({ islem, kartlar, istenen: istenenHesap, son: hesapKimligiOku(tarayiciDeposu(), sonKartAnahtari(kapsam)), bugun }, PARA)
  );
  const ayarla = (k: Partial<HarcamaDegerleri>) => setF((s) => ({ ...s, ...k }));
  // Düzenlenen kayıtta iade/taksit/kategori/not varsa bölüm baştan açık: değerler gizli kalmasın.
  const { acik, degistir } = useDahaFazla(kapsam, "harcama", islem !== undefined && harcamaGizliOzet(f).length > 0);
  const aciklamaKutusu = useRef<HTMLInputElement>(null);
  const { hata, setHata, bekliyor, gonder } = useGonder(kaydedildi);

  const kart: Hesap | undefined = kartlar.find((k) => k.id === f.hesapId);
  const kurus = kurusaCevir(f.tutar);
  const net = kurus === null ? null : f.iade ? -Math.abs(kurus) : Math.abs(kurus);
  const ekstre = kart && /^\d{4}-\d{2}-\d{2}$/.test(f.tarih) ? ekstreAyi(f.tarih, kart.kesimGunu) : null;
  const dagilim = net !== null && ekstre ? taksitDagilimi(net, f.taksit, ekstre) : null;

  function gec(e: FormEvent) {
    e.preventDefault();
    const sonuc = harcamaGirdisi(f, kartlar, islem, PARA);
    if (!sonuc.tamam) return setHata(sonuc.hata);
    const girdi = sonuc.girdi;
    depoYaz(tarayiciDeposu(), sonKartAnahtari(kapsam), String(girdi.hesapId));
    void gonder(() => (islem ? api.islemGuncelle(islem.id, girdi) : api.islemEkle(girdi)), islem ? `${girdi.aciklama} güncellendi` : `${girdi.aciklama} eklendi`);
  }

  function sil() {
    if (!islem || !window.confirm(`“${islem.aciklama}” silinsin mi?`)) return;
    void gonder(() => api.islemSil(islem.id), "İşlem silindi");
  }

  if (kartlar.length === 0) return <p className="bos">Önce kredi kartı hesabı gerekli (Hesaplar › Hesap ekle).</p>;

  return (
    <form className="form" onSubmit={gec} noValidate>
      <HesapCipi etiket="Kart" hesaplar={kartlar} secili={f.hesapId} sec={(id) => ayarla({ hesapId: id })} />
      <div className="iki-sutun">
        <Alan etiket="Tutar (₺)">
          <input
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={f.tutar}
            autoFocus={!islem}
            data-odak={islem ? undefined : "tutar"}
            onChange={(e) => ayarla({ tutar: e.target.value })}
            onKeyDown={(e) => tutardaEnter(e, !f.aciklama.trim(), aciklamaKutusu)}
          />
        </Alan>
        <Alan etiket="Tarih">
          <input type="date" value={f.tarih} max={gunEkle(bugun, 31)} onChange={(e) => ayarla({ tarih: e.target.value })} />
        </Alan>
      </div>
      <Alan etiket="Açıklama">
        <input ref={aciklamaKutusu} autoComplete="off" maxLength={160} placeholder="Ne için?" value={f.aciklama} onChange={(e) => ayarla({ aciklama: e.target.value })} />
      </Alan>

      <DahaFazla acik={acik} degistir={degistir} ozet={dahaFazlaOzeti(harcamaGizliOzet(f))}>
        <label className="onay">
          <input type="checkbox" checked={f.iade} onChange={(e) => ayarla({ iade: e.target.checked })} />
          <span>İade / ödeme (tutar kartın borcundan düşer)</span>
        </label>
        <fieldset className="taksit-secici">
          <legend>Taksit</legend>
          <div className="cipler">
            {TAKSITLER.map((n) => (
              <button key={n} type="button" className={f.taksit === n ? "secili" : ""} aria-pressed={f.taksit === n} onClick={() => ayarla({ taksit: n })}>
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
              value={TAKSITLER.includes(f.taksit) ? "" : f.taksit}
              onChange={(e) => ayarla({ taksit: Math.min(60, Math.max(1, Math.floor(Number(e.target.value)) || 1)) })}
            />
          </div>
        </fieldset>
        <div className="iki-sutun">
          <Alan etiket="Kategori (isteğe bağlı)">
            <input autoComplete="off" maxLength={40} value={f.kategori} onChange={(e) => ayarla({ kategori: e.target.value })} />
          </Alan>
          <Alan etiket="Not (isteğe bağlı)">
            <input autoComplete="off" maxLength={400} value={f.not} onChange={(e) => ayarla({ not: e.target.value })} />
          </Alan>
        </div>
      </DahaFazla>

      {ekstre && (
        <p className="onizleme">
          {ayAdi(ekstre)} ekstresine düşer
          {kart?.kesimGunu ? ` (kesim günü ${kart.kesimGunu})` : ""}
          {dagilim && f.taksit > 1 && net !== null && net !== 0 && (
            <>
              <br />
              {f.taksit} × {tlTam(dagilim[1]?.tutar ?? dagilim[0].tutar)} · {ayAdi(dagilim[0].ay)}–{ayAdi(dagilim[dagilim.length - 1].ay)}
            </>
          )}
        </p>
      )}

      <Hata hata={hata} />
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
  const { veri, bugun, kapsam } = useBorc();
  const guncel = useMemo(() => guncelDurumlar(veri.durum), [veri.durum]);
  const hesaplar = useMemo(() => [...veri.hesaplar].sort((a, b) => a.sira - b.sira || a.id - b.id), [veri.hesaplar]);
  // Ekran bir hesabı açtıysa o, yoksa son kullanılan, yoksa ilk hesap: borç yanlış hesaba yazılmasın (hesap çipte görünür).
  const [hesapId, setHesapId] = useState<number>(() => varsayilanHesapId(hesaplar, istenen, hesapKimligiOku(tarayiciDeposu(), sonHesapAnahtari(kapsam))));
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
  const { api, kapsam } = useBorc();
  const [f, setF] = useState<DurumDegerleri>(() => durumIlk({ hesapLimit: hesap?.limit ?? 0, onceki, bugun }, PARA));
  const ayarla = (k: Partial<DurumDegerleri>) => setF((s) => ({ ...s, ...k }));
  const tur = hesap?.tur ?? "diger";
  // Kartın limiti hiç bilinmiyorsa borç hesaplanamaz: o durumda limit ana görünümde sorulur (açılışta karar verilir, yazarken kaybolmaz).
  const [limitAna] = useState(() => durumLimitAnaGorunumde(tur, f));
  const alanlar = durumDahaFazlaAlanlari(tur, limitAna);
  const { acik, degistir, ac } = useDahaFazla(kapsam, "durum");
  const { hata, setHata, bekliyor, gonder } = useGonder(kaydedildi);

  if (!hesap) return <p className="bos">Hesap yok.</p>;
  const h = hesap;

  const limitKurus = kurusaCevir(f.limit);
  const borc = durumBorcu(tur, limitKurus, kurusaCevir(f.deger));

  function gec(e: FormEvent) {
    e.preventDefault();
    const sonuc = durumGirdisi(h, f, PARA);
    if (!sonuc.tamam) {
      // Hata gizli bir alanla ilgiliyse bölüm kendiliğinden açılır (tercih değişmez).
      if (sonuc.dahaFazla && alanlar.length > 0) ac();
      return setHata(sonuc.hata);
    }
    depoYaz(tarayiciDeposu(), sonHesapAnahtari(kapsam), String(h.id));
    const { girdi, borc: yeniBorc } = sonuc.girdi;
    void gonder(() => api.durumKaydet(girdi), `${h.ad} güncellendi · ${tl(yeniBorc)}`);
  }

  const limitKutusu = (ana: boolean) => (
    <Alan etiket="Limit (₺)">
      <input
        inputMode="decimal"
        autoComplete="off"
        value={f.limit}
        autoFocus={ana}
        data-odak={ana ? "limit" : undefined}
        onChange={(e) => ayarla({ limit: e.target.value })}
      />
    </Alan>
  );
  const degerOdagi = { autoFocus: !limitAna, "data-odak": limitAna ? undefined : "tutar" };

  return (
    <form className="form" onSubmit={gec} noValidate>
      <HesapCipi etiket="Hesap" hesaplar={hesaplar} secili={hesap.id} sec={hesapSec} />

      {limitAna && limitKutusu(true)}

      {tur === "kart" && (
        <Alan etiket="Kullanılabilir limit (₺)" ipucu="Bankanın uygulamasındaki “kullanılabilir limit”. Borç = limit − kullanılabilir limit.">
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={f.deger} onChange={(e) => ayarla({ deger: e.target.value })} {...degerOdagi} />
        </Alan>
      )}
      {tur === "kmh" && (
        <Alan etiket="Hesap bakiyesi (₺)" ipucu="Eksideyse başına − koyun (örn. -12.345,60). Artıdaysa borç 0 sayılır.">
          <input inputMode="decimal" autoComplete="off" placeholder="-0,00" value={f.deger} onChange={(e) => ayarla({ deger: e.target.value })} {...degerOdagi} />
        </Alan>
      )}
      {tur === "diger" && (
        <Alan etiket="Güncel borç (₺)">
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={f.deger} onChange={(e) => ayarla({ deger: e.target.value })} {...degerOdagi} />
        </Alan>
      )}

      <Alan etiket="Ölçüm tarihi">
        <input type="date" value={f.tarih} max={bugun} onChange={(e) => ayarla({ tarih: e.target.value })} />
      </Alan>
      <Alan etiket="Açıklama (isteğe bağlı)">
        <input autoComplete="off" maxLength={400} value={f.not} onChange={(e) => ayarla({ not: e.target.value })} />
      </Alan>

      {alanlar.length > 0 && (
        <DahaFazla acik={acik} degistir={degistir} ozet={dahaFazlaOzeti(durumGizliOzet(tur, f, limitAna))}>
          {alanlar.includes("limit") && limitKutusu(false)}
          {tur === "kart" && (
            <>
              <div className="iki-sutun">
                <Alan etiket="Son ekstre borcu (₺)">
                  <input inputMode="decimal" autoComplete="off" placeholder="isteğe bağlı" value={f.ekstre} onChange={(e) => ayarla({ ekstre: e.target.value })} />
                </Alan>
                <Alan etiket="Asgari ödeme (₺)">
                  <input inputMode="decimal" autoComplete="off" placeholder="boşsa tahmin" value={f.asgari} onChange={(e) => ayarla({ asgari: e.target.value })} />
                </Alan>
              </div>
              <Alan etiket="Son ödeme tarihi">
                <input type="date" value={f.sonOdeme} onChange={(e) => ayarla({ sonOdeme: e.target.value })} />
              </Alan>
            </>
          )}
        </DahaFazla>
      )}

      {borc !== null && borc >= 0 && (
        <p className="onizleme">
          Borç: <strong>{tlTam(borc)}</strong>
          {limitKurus && tur !== "diger" ? ` · limit ${tlTam(limitKurus)} · kullanım ${yuzde(borc / limitKurus)}` : ""}
        </p>
      )}

      <Hata hata={hata} />
      <button type="submit" className="birinci" disabled={bekliyor}>{bekliyor ? "Kaydediliyor…" : "Durumu kaydet"}</button>
    </form>
  );
}

/* ── Gelir ─────────────────────────────────────────────────────────────── */

function GelirFormu({ kaydedildi }: { kaydedildi: Kaydedildi }) {
  const { bugun, api, metin, kapsam } = useBorc();
  const [f, setF] = useState<GelirDegerleri>(() => gelirIlk(bugun));
  const ayarla = (k: Partial<GelirDegerleri>) => setF((s) => ({ ...s, ...k }));
  const { acik, degistir } = useDahaFazla(kapsam, "gelir");
  const aciklamaKutusu = useRef<HTMLInputElement>(null);
  const { hata, setHata, bekliyor, gonder } = useGonder(kaydedildi);

  function gec(e: FormEvent) {
    e.preventDefault();
    const sonuc = gelirGirdisi(f, bugun, metin.gelirOrnek, PARA);
    if (!sonuc.tamam) return setHata(sonuc.hata);
    const girdi = sonuc.girdi;
    void gonder(() => api.gelirEkle(girdi), `${girdi.ad} eklendi`);
  }

  return (
    <form className="form" onSubmit={gec} noValidate>
      <div className="iki-sutun">
        <Alan etiket={`Tutar (${f.paraBirimi === "USD" ? "USD" : "₺"})`}>
          <input
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={f.tutar}
            autoFocus
            data-odak="tutar"
            onChange={(e) => ayarla({ tutar: e.target.value })}
            onKeyDown={(e) => tutardaEnter(e, !f.ad.trim(), aciklamaKutusu)}
          />
        </Alan>
        <Alan etiket="Beklenen tarih">
          <input type="date" value={f.tarih} onChange={(e) => ayarla({ tarih: e.target.value })} />
        </Alan>
      </div>
      <Alan etiket="Açıklama">
        <input ref={aciklamaKutusu} autoComplete="off" maxLength={80} placeholder={metin.gelirOrnek} value={f.ad} onChange={(e) => ayarla({ ad: e.target.value })} />
      </Alan>

      <DahaFazla acik={acik} degistir={degistir} ozet={dahaFazlaOzeti(gelirGizliOzet(f))}>
        <Alan etiket="Para birimi">
          <select value={f.paraBirimi} onChange={(e) => ayarla({ paraBirimi: e.target.value as ParaBirimi })}>
            <option value="TRY">TL</option>
            <option value="USD">USD</option>
          </select>
        </Alan>
        <label className="onay">
          <input type="checkbox" checked={!f.kesin} onChange={(e) => ayarla({ kesin: !e.target.checked })} />
          <span>Tarih kesin değil</span>
        </label>
        <label className="onay">
          <input type="checkbox" checked={f.alindi} onChange={(e) => ayarla({ alindi: e.target.checked })} />
          <span>Zaten alındı (bugün)</span>
        </label>
        <Alan etiket="Not (isteğe bağlı)">
          <input autoComplete="off" maxLength={400} value={f.not} onChange={(e) => ayarla({ not: e.target.value })} />
        </Alan>
      </DahaFazla>

      <Hata hata={hata} />
      <button type="submit" className="birinci" disabled={bekliyor}>{bekliyor ? "Kaydediliyor…" : "Geliri ekle"}</button>
    </form>
  );
}
