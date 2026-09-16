"use client";

import { useId, useState, type FormEvent } from "react";
import { api } from "./api";
import { useBalim } from "./baglam";
import { Ikon } from "./ikonlar";
import { AYLAR, SINIR, ayYazisi, girdiTutari, kisaTarih, tl, tlYuvarlak, tutarOku, type Gider, type Odeme } from "./ortak";
import { BosDurum, KisiSecimi, Pencere, Secim, useDakika } from "./parcalar";
import { aktifGiderler, gosterilecekAylar } from "./toplamlar";
import { bugun, gunFarki, kalanGunYazisi } from "./zaman";

type OdemeSecimi = { gider: Gider; ay: string; odeme: Odeme | undefined };

export default function Giderler() {
  const { veri } = useBalim();
  const [giderDuzenle, setGiderDuzenle] = useState<Gider | "yeni" | null>(null);
  const [odemeSecimi, setOdemeSecimi] = useState<OdemeSecimi | null>(null);
  useDakika();

  const gun = bugun();
  const aylik = aktifGiderler(veri.giderler, gun).reduce((toplam, gider) => toplam + gider.tutar, 0);
  const odenen = veri.odemeler.reduce((toplam, odeme) => toplam + odeme.tutar, 0);

  return (
    <div className="b-sayfa">
      <header className="b-sayfa-ust">
        <div>
          <h1>Kira ve giderler</h1>
          <p>
            {veri.giderler.length
              ? `Aylık ${tlYuvarlak(aylik)} · şimdiye kadar ${tlYuvarlak(odenen)} ödendi`
              : "Kira gibi her ay tekrarlanan ödemeler."}
          </p>
        </div>
        <button type="button" className="b-dugme b-dugme-ana" onClick={() => setGiderDuzenle("yeni")}>
          <Ikon ad="arti" />
          Gider ekle
        </button>
      </header>

      {veri.giderler.length === 0 ? (
        <BosDurum ikon="giderler" baslik="Henüz gider yok">
          Kira, elektrik, su, internet, muhasebeci… Her ay ödenecekleri ekleyin; hangi ayın ödendiği burada takip edilir.
        </BosDurum>
      ) : (
        veri.giderler.map((gider) => (
          <GiderKarti
            key={gider.id}
            gider={gider}
            duzenle={() => setGiderDuzenle(gider)}
            ac={(ay, odeme) => setOdemeSecimi({ gider, ay, odeme })}
          />
        ))
      )}

      {giderDuzenle ? (
        <GiderPenceresi gider={giderDuzenle === "yeni" ? null : giderDuzenle} kapat={() => setGiderDuzenle(null)} />
      ) : null}
      {odemeSecimi ? <OdemePenceresi {...odemeSecimi} kapat={() => setOdemeSecimi(null)} /> : null}
    </div>
  );
}

function GiderKarti({
  gider,
  duzenle,
  ac
}: {
  gider: Gider;
  duzenle: () => void;
  ac: (ay: string, odeme: Odeme | undefined) => void;
}) {
  const { veri, kisi } = useBalim();
  const [hepsi, setHepsi] = useState(false);
  const gun = bugun();
  const aylar = gosterilecekAylar(gider, veri.odemeler, gun);

  // Uzun geçmiş katlanır: ödenmiş eski aylardan yalnızca son ikisi görünür.
  // Ödenmemiş bir ay ne kadar eski olursa olsun gizlenmez.
  const ilkOnemli = aylar.findIndex((a) => !a.odeme || a.ay >= gun.slice(0, 7));
  const gizli = hepsi ? 0 : Math.max(0, (ilkOnemli === -1 ? aylar.length : ilkOnemli) - 2);

  const odemeler = veri.odemeler.filter((odeme) => odeme.giderId === gider.id);
  const odenen = odemeler.reduce((toplam, odeme) => toplam + odeme.tutar, 0);
  const geciken = aylar.filter((a) => !a.odeme && a.sonGun < gun).length;

  return (
    <section className="b-kart b-gider" aria-labelledby={`b-gider-${gider.id}`}>
      <header className="b-gider-ust">
        <div className="b-gider-baslik">
          <h2 id={`b-gider-${gider.id}`}>{gider.ad}</h2>
          <p>
            Ayın {gider.odemeGunu}. günü · Başlangıç {ayYazisi(gider.baslangic)}
            {gider.bitis ? ` · Bitiş ${ayYazisi(gider.bitis)}` : ""}
          </p>
        </div>
        <p className="b-gider-tutar">
          <strong>{tl(gider.tutar)}</strong>
          <span>her ay</span>
        </p>
        <button type="button" className="b-dugme b-dugme-ikon b-dugme-sade" onClick={duzenle} aria-label={`${gider.ad}: düzenle`}>
          <Ikon ad="kalem" />
        </button>
      </header>

      {gizli > 0 ? (
        <button type="button" className="b-gider-onceki" onClick={() => setHepsi(true)}>
          <Ikon ad="asagi" />
          Önceki {gizli} ayı göster
        </button>
      ) : null}

      <ol className="b-aylar">
        {aylar.slice(gizli).map((a) => {
          const fark = gunFarki(gun, a.sonGun);
          const odeyen = kisi(a.odeme?.odeyenId);
          const durum = a.odeme ? "odendi" : fark < 0 ? "gecikti" : "bekliyor";
          return (
            <li key={a.ay}>
              <button type="button" className={`b-ay is-${durum}`} onClick={() => ac(a.ay, a.odeme)}>
                <span className="b-ay-bilgi">
                  <span className="b-ay-adi">{ayYazisi(a.ay)}</span>
                  <span className="b-ay-alt">
                    {a.odeme
                      ? `${kisaTarih(a.odeme.odemeTarihi)} tarihinde ${odeyen ? `${odeyen.ad} ödedi` : "ödendi"}`
                      : `Son gün ${kisaTarih(a.sonGun)} · ${fark < 0 ? `${-fark} gün geçti` : kalanGunYazisi(fark)}`}
                  </span>
                </span>
                <span className="b-ay-tutar">{tl(a.odeme?.tutar ?? a.beklenen)}</span>
                <span className={`b-durum is-${durum === "odendi" ? "iyi" : durum === "gecikti" ? "kotu" : "notr"}`}>
                  <Ikon ad={durum === "odendi" ? "onay" : durum === "gecikti" ? "uyari" : "saat"} />
                  {durum === "odendi" ? "Ödendi" : durum === "gecikti" ? "Gecikti" : "Bekliyor"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <footer className="b-gider-alt">
        <span>
          Toplam ödenen <b>{tlYuvarlak(odenen)}</b> · {odemeler.length} ay
        </span>
        {geciken ? (
          <span className="b-durum is-kotu">
            <Ikon ad="uyari" />
            {geciken} ay ödenmedi
          </span>
        ) : null}
      </footer>
    </section>
  );
}

function OdemePenceresi({ gider, ay, odeme, kapat }: OdemeSecimi & { kapat: () => void }) {
  const { veri, islem } = useBalim();
  const formId = useId();
  const [tutar, setTutar] = useState(girdiTutari(odeme?.tutar ?? gider.tutar));
  const [tarih, setTarih] = useState(odeme?.odemeTarihi ?? bugun());
  const [odeyenId, setOdeyenId] = useState<number | null>(odeme?.odeyenId ?? veri.ben.id);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: FormEvent) {
    e.preventDefault();
    const kurus = tutarOku(tutar);
    if (kurus === null || Number.isNaN(kurus)) return setHata("Ödenen tutarı rakamla yazın.");
    if (!tarih) return setHata("Ödeme tarihini seçin.");
    setBekliyor(true);
    setHata(null);
    const sonuc = await islem(
      () => api.yaz("odemeler", "PUT", { giderId: gider.id, ay, tutar: kurus, odemeTarihi: tarih, odeyenId }),
      { basari: `${ayYazisi(ay)} ödendi olarak kaydedildi`, sessiz: true }
    );
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  async function geriAl() {
    if (!odeme || !window.confirm(`${ayYazisi(ay)} ödemesi geri alınsın mı? Ay yeniden "ödenmedi" görünecek.`)) return;
    setBekliyor(true);
    const sonuc = await islem(() => api.yaz(`odemeler/${odeme.id}`, "DELETE"), {
      basari: "Ödeme geri alındı",
      sessiz: true
    });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  return (
    <Pencere
      baslik={`${gider.ad} · ${ayYazisi(ay)}`}
      kapat={kapat}
      alt={
        <>
          {odeme ? (
            <button type="button" className="b-dugme b-dugme-sade is-tehlike" onClick={geriAl} disabled={bekliyor}>
              Geri al
            </button>
          ) : null}
          <span className="b-bosluk" />
          <button type="button" className="b-dugme" onClick={kapat}>
            Vazgeç
          </button>
          <button type="submit" form={formId} className="b-dugme b-dugme-ana" disabled={bekliyor}>
            <Ikon ad="onay" />
            {odeme ? "Kaydet" : "Ödendi olarak kaydet"}
          </button>
        </>
      }
    >
      <form id={formId} className="b-form" onSubmit={kaydet}>
        <p className="b-form-aciklama">
          {odeme
            ? "Bu ay ödendi olarak işaretli. Tutarı, tarihi ya da ödeyeni düzeltebilirsiniz."
            : `Bu ayın ödemesi yapıldıysa kaydedin. Beklenen tutar ${tl(gider.tutar)}.`}
        </p>
        <div className="b-alan-cift">
          <label className="b-alan">
            <span>Ödenen tutar</span>
            <span className="b-tutar-girdi">
              <input className="b-girdi" inputMode="decimal" value={tutar} onChange={(e) => setTutar(e.target.value)} />
              <span aria-hidden="true">TL</span>
            </span>
          </label>
          <label className="b-alan">
            <span>Ödeme tarihi</span>
            <input className="b-girdi" type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
          </label>
        </div>
        <fieldset className="b-alan">
          <legend>Kim ödedi?</legend>
          <KisiSecimi kisiler={veri.kisiler} secili={odeyenId} sec={setOdeyenId} />
        </fieldset>
        {hata ? (
          <p className="b-form-hata" role="alert">
            <Ikon ad="uyari" />
            {hata}
          </p>
        ) : null}
      </form>
    </Pencere>
  );
}

const yillar = (etraf: string[]) => {
  const buYil = Number(bugun().slice(0, 4));
  const liste = new Set<number>();
  for (let yil = buYil - 1; yil <= buYil + 5; yil += 1) liste.add(yil);
  for (const ay of etraf) if (ay) liste.add(Number(ay.slice(0, 4)));
  return [...liste].sort((a, b) => a - b);
};

/** Ay ve yıl iki ayrı listeden seçilir: `<input type="month">` masaüstü Safari ve Firefox'ta düz metin kutusu. */
function AySecimi({ deger, degis, etiket }: { deger: string; degis: (ay: string) => void; etiket: string }) {
  const [yil, ay] = deger.split("-");
  return (
    <div className="b-ay-secimi" role="group" aria-label={etiket}>
      <Secim value={ay} onChange={(e) => degis(`${yil}-${e.target.value}`)} aria-label={`${etiket}: ay`}>
        {AYLAR.map((ad, i) => (
          <option key={ad} value={String(i + 1).padStart(2, "0")}>
            {ad}
          </option>
        ))}
      </Secim>
      <Secim value={yil} onChange={(e) => degis(`${e.target.value}-${ay}`)} aria-label={`${etiket}: yıl`}>
        {yillar([deger]).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Secim>
    </div>
  );
}

function GiderPenceresi({ gider, kapat }: { gider: Gider | null; kapat: () => void }) {
  const { islem } = useBalim();
  const formId = useId();
  const buAy = bugun().slice(0, 7);
  const [ad, setAd] = useState(gider?.ad ?? "");
  const [tutar, setTutar] = useState(gider ? girdiTutari(gider.tutar) : "");
  const [baslangic, setBaslangic] = useState(gider?.baslangic ?? buAy);
  const [odemeGunu, setOdemeGunu] = useState(gider?.odemeGunu ?? 1);
  const [bitisVar, setBitisVar] = useState(Boolean(gider?.bitis));
  const [bitis, setBitis] = useState(gider?.bitis ?? baslangic);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: FormEvent) {
    e.preventDefault();
    const kurus = tutarOku(tutar);
    if (!ad.trim()) return setHata("Giderin adını yazın.");
    if (kurus === null || Number.isNaN(kurus) || kurus <= 0) return setHata("Aylık tutarı rakamla yazın, örneğin 25.000");
    if (bitisVar && bitis < baslangic) return setHata("Bitiş ayı başlangıçtan önce olamaz.");

    setBekliyor(true);
    setHata(null);
    const govde = { ad: ad.trim(), tutar: kurus, baslangic, odemeGunu, bitis: bitisVar ? bitis : null };
    const sonuc = await islem(
      () => (gider ? api.yaz(`giderler/${gider.id}`, "PATCH", govde) : api.yaz("giderler", "POST", govde)),
      { basari: gider ? "Kaydedildi" : "Gider eklendi", sessiz: true }
    );
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  async function sil() {
    if (!gider || !window.confirm(`"${gider.ad}" ve işaretlenmiş bütün ödemeleri silinsin mi?`)) return;
    setBekliyor(true);
    const sonuc = await islem(() => api.yaz(`giderler/${gider.id}`, "DELETE"), { basari: "Gider silindi", sessiz: true });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  return (
    <Pencere
      baslik={gider ? "Gideri düzenle" : "Yeni gider"}
      kapat={kapat}
      alt={
        <>
          {gider ? (
            <button type="button" className="b-dugme b-dugme-sade is-tehlike" onClick={sil} disabled={bekliyor}>
              <Ikon ad="cop" />
              Sil
            </button>
          ) : null}
          <span className="b-bosluk" />
          <button type="button" className="b-dugme" onClick={kapat}>
            Vazgeç
          </button>
          <button type="submit" form={formId} className="b-dugme b-dugme-ana" disabled={bekliyor}>
            {gider ? "Kaydet" : "Ekle"}
          </button>
        </>
      }
    >
      <form id={formId} className="b-form" onSubmit={kaydet}>
        <label className="b-alan">
          <span>Gider</span>
          <input
            className="b-girdi"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            maxLength={SINIR.giderAdi}
            placeholder="Örneğin: Elektrik, İnternet"
            data-ilk-odak={gider ? undefined : ""}
          />
        </label>
        <div className="b-alan-cift">
          <label className="b-alan">
            <span>Aylık tutar</span>
            <span className="b-tutar-girdi">
              <input className="b-girdi" inputMode="decimal" value={tutar} onChange={(e) => setTutar(e.target.value)} />
              <span aria-hidden="true">TL</span>
            </span>
          </label>
          <label className="b-alan">
            <span>Ödeme günü</span>
            <Secim value={odemeGunu} onChange={(e) => setOdemeGunu(Number(e.target.value))}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  Ayın {g}. günü
                </option>
              ))}
            </Secim>
          </label>
        </div>
        <div className="b-alan">
          <span>İlk ödeme ayı</span>
          <AySecimi deger={baslangic} degis={setBaslangic} etiket="İlk ödeme ayı" />
        </div>

        <label className="b-anahtar">
          <input type="checkbox" checked={bitisVar} onChange={(e) => setBitisVar(e.target.checked)} />
          <span className="b-anahtar-kutu" aria-hidden="true" />
          <span>Belli bir ayda bitiyor</span>
        </label>
        {bitisVar ? (
          <div className="b-alan">
            <span>Son ödeme ayı</span>
            <AySecimi deger={bitis} degis={setBitis} etiket="Son ödeme ayı" />
          </div>
        ) : null}

        {hata ? (
          <p className="b-form-hata" role="alert">
            <Ikon ad="uyari" />
            {hata}
          </p>
        ) : null}
      </form>
    </Pencere>
  );
}
