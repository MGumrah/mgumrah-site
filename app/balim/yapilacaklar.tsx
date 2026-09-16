"use client";

import { useId, useState, type FormEvent } from "react";
import { api } from "./api";
import { useBalim } from "./baglam";
import { Ikon } from "./ikonlar";
import { SINIR, kisaTarih, tarihYazisi, type Yapilacak } from "./ortak";
import { Avatar, BosDurum, KisiSecimi, OnayKutusu, Pencere, useDakika } from "./parcalar";
import { bugun, gunFarki, kalanGunYazisi } from "./zaman";

const tariheGore = (a: Yapilacak, b: Yapilacak) => (a.sonTarih ?? "").localeCompare(b.sonTarih ?? "") || a.id - b.id;

export default function Yapilacaklar() {
  const { veri, islem, iyimser } = useBalim();
  const [yeni, setYeni] = useState("");
  const [ekleniyor, setEkleniyor] = useState(false);
  const [sadeceBenim, setSadeceBenim] = useState(false);
  const [bitenlerAcik, setBitenlerAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Yapilacak | null>(null);
  useDakika();

  const gun = bugun();
  const gorunen = veri.yapilacaklar.filter((is) => !sadeceBenim || is.sorumluId === veri.ben.id);
  const acik = gorunen.filter((is) => !is.tamamlandi).sort(tariheGore);
  const biten = gorunen
    .filter((is) => is.tamamlandi)
    .sort((a, b) => (b.tamamlanmaZamani ?? "").localeCompare(a.tamamlanmaZamani ?? ""));

  const gruplar = [
    { baslik: "Tarihi geçenler", isler: acik.filter((is) => is.sonTarih && is.sonTarih < gun), kotu: true },
    { baslik: "Bu hafta", isler: acik.filter((is) => is.sonTarih && is.sonTarih >= gun && gunFarki(gun, is.sonTarih) <= 7) },
    { baslik: "Daha sonra", isler: acik.filter((is) => is.sonTarih && gunFarki(gun, is.sonTarih) > 7) },
    { baslik: "Tarihi olmayanlar", isler: acik.filter((is) => !is.sonTarih) }
  ].filter((grup) => grup.isler.length);

  async function ekle(e: FormEvent) {
    e.preventDefault();
    const baslik = yeni.trim();
    if (!baslik) return;
    setEkleniyor(true);
    const sonuc = await islem(() =>
      api.yaz("yapilacaklar", "POST", { baslik, sorumluId: sadeceBenim ? veri.ben.id : null })
    );
    setEkleniyor(false);
    if (!sonuc) setYeni("");
  }

  function isaretle(is: Yapilacak) {
    const tamamlandi = !is.tamamlandi;
    iyimser((v) => ({
      ...v,
      yapilacaklar: v.yapilacaklar.map((x) =>
        x.id === is.id ? { ...x, tamamlandi, tamamlanmaZamani: tamamlandi ? new Date().toISOString() : null } : x
      )
    }));
    void islem(() => api.yaz(`yapilacaklar/${is.id}`, "PATCH", { tamamlandi }));
  }

  return (
    <div className="b-sayfa">
      <header className="b-sayfa-ust">
        <div>
          <h1>Yapılacaklar</h1>
          <p>
            {veri.yapilacaklar.length
              ? `${veri.yapilacaklar.filter((is) => !is.tamamlandi).length} açık iş · ${veri.yapilacaklar.filter((is) => is.tamamlandi).length} tamamlandı`
              : "Ruhsat, tabela, usta, tedarikçi… Atılacak her adım."}
          </p>
        </div>
      </header>

      <form className="b-kart b-hizli-ekle" onSubmit={ekle}>
        <input
          className="b-girdi"
          value={yeni}
          onChange={(e) => setYeni(e.target.value)}
          maxLength={SINIR.baslik}
          placeholder="Yeni iş yazın, örneğin: Belediyeye ruhsatı sor"
          aria-label="Yeni iş"
          enterKeyHint="done"
        />
        <button type="submit" className="b-dugme b-dugme-ana" disabled={ekleniyor || !yeni.trim()}>
          <Ikon ad="arti" />
          Ekle
        </button>
      </form>

      {veri.yapilacaklar.length ? (
        <div className="b-arac-cubugu">
          <div className="b-bolumlu" role="group" aria-label="Kimin işleri">
            <button type="button" aria-pressed={!sadeceBenim} onClick={() => setSadeceBenim(false)}>
              Herkesin
            </button>
            <button type="button" aria-pressed={sadeceBenim} onClick={() => setSadeceBenim(true)}>
              Bana verilenler
            </button>
          </div>
        </div>
      ) : null}

      {veri.yapilacaklar.length === 0 ? (
        <BosDurum ikon="yapilacaklar" baslik="Henüz iş eklenmedi">
          Yukarıya yazıp Ekle&apos;ye basın. Tarih ve kimin yapacağı, işe dokununca açılan pencereden eklenir.
        </BosDurum>
      ) : acik.length === 0 && biten.length === 0 ? (
        <p className="b-bos-kucuk">Size verilmiş bir iş yok.</p>
      ) : (
        <>
          {acik.length === 0 ? <p className="b-bos-kucuk">Açık iş kalmadı. Hepsi tamam!</p> : null}
          {gruplar.map((grup) => (
            <section key={grup.baslik} className="b-grup" aria-label={grup.baslik}>
              <h2 className={`b-grup-baslik${grup.kotu ? " is-kotu" : ""}`}>
                <span>
                  {grup.kotu ? <Ikon ad="uyari" /> : null}
                  {grup.baslik}
                </span>
                <span>{grup.isler.length}</span>
              </h2>
              <ul className="b-kart b-liste">
                {grup.isler.map((is) => (
                  <IsSatiri key={is.id} is={is} isaretle={() => isaretle(is)} ac={() => setDuzenlenen(is)} />
                ))}
              </ul>
            </section>
          ))}

          {biten.length ? (
            <section className="b-grup" aria-label="Tamamlananlar">
              <button
                type="button"
                className="b-grup-baslik b-grup-ac"
                aria-expanded={bitenlerAcik}
                onClick={() => setBitenlerAcik(!bitenlerAcik)}
              >
                <span>
                  <Ikon ad={bitenlerAcik ? "asagi" : "sag"} />
                  Tamamlananlar
                </span>
                <span>{biten.length}</span>
              </button>
              {bitenlerAcik ? (
                <ul className="b-kart b-liste">
                  {biten.map((is) => (
                    <IsSatiri key={is.id} is={is} isaretle={() => isaretle(is)} ac={() => setDuzenlenen(is)} />
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </>
      )}

      {duzenlenen ? <IsPenceresi is={duzenlenen} kapat={() => setDuzenlenen(null)} /> : null}
    </div>
  );
}

function IsSatiri({ is, isaretle, ac }: { is: Yapilacak; isaretle: () => void; ac: () => void }) {
  const { kisi } = useBalim();
  const sorumlu = kisi(is.sorumluId);
  const fark = is.sonTarih ? gunFarki(bugun(), is.sonTarih) : null;
  const gecikti = !is.tamamlandi && fark !== null && fark < 0;

  return (
    <li className={`b-satir b-is${is.tamamlandi ? " is-tamam" : ""}`}>
      <OnayKutusu isaretli={is.tamamlandi} etiket={`${is.baslik} tamamlandı`} degis={isaretle} />
      <button type="button" className="b-satir-govde" onClick={ac}>
        <span className="b-satir-baslik">{is.baslik}</span>
        {is.aciklama ? <span className="b-satir-not">{is.aciklama}</span> : null}
        {is.sonTarih || sorumlu ? (
          <span className="b-satir-alt">
            {is.sonTarih && fark !== null ? (
              <span className={`b-durum${gecikti ? " is-kotu" : ""}`}>
                <Ikon ad={gecikti ? "uyari" : "takvim"} />
                {kisaTarih(is.sonTarih)}
                {is.tamamlandi ? "" : ` · ${gecikti ? `${-fark} gün gecikti` : kalanGunYazisi(fark)}`}
              </span>
            ) : null}
            {sorumlu ? (
              <span className="b-satir-kisi">
                <Avatar kisi={sorumlu} boyut="kucuk" />
                {sorumlu.ad}
              </span>
            ) : null}
          </span>
        ) : null}
      </button>
    </li>
  );
}

function IsPenceresi({ is, kapat }: { is: Yapilacak; kapat: () => void }) {
  const { veri, kisi, islem } = useBalim();
  const formId = useId();
  const [baslik, setBaslik] = useState(is.baslik);
  const [aciklama, setAciklama] = useState(is.aciklama);
  const [sonTarih, setSonTarih] = useState(is.sonTarih ?? "");
  const [sorumluId, setSorumluId] = useState<number | null>(is.sorumluId);
  const [tamamlandi, setTamamlandi] = useState(is.tamamlandi);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: FormEvent) {
    e.preventDefault();
    if (!baslik.trim()) return setHata("İşi yazın.");
    const govde = { baslik: baslik.trim(), aciklama: aciklama.trim(), sonTarih: sonTarih || null, sorumluId, tamamlandi };
    const onceki = { baslik: is.baslik, aciklama: is.aciklama, sonTarih: is.sonTarih, sorumluId: is.sorumluId, tamamlandi: is.tamamlandi };
    if (JSON.stringify(govde) === JSON.stringify(onceki)) return kapat();

    setBekliyor(true);
    setHata(null);
    const sonuc = await islem(() => api.yaz(`yapilacaklar/${is.id}`, "PATCH", govde), { basari: "Kaydedildi", sessiz: true });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  async function sil() {
    if (!window.confirm(`"${is.baslik}" silinsin mi?`)) return;
    setBekliyor(true);
    const sonuc = await islem(() => api.yaz(`yapilacaklar/${is.id}`, "DELETE"), { basari: "Silindi", sessiz: true });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  const ekleyen = kisi(is.ekleyenId);

  return (
    <Pencere
      baslik="İşi düzenle"
      kapat={kapat}
      alt={
        <>
          <button type="button" className="b-dugme b-dugme-sade is-tehlike" onClick={sil} disabled={bekliyor}>
            <Ikon ad="cop" />
            Sil
          </button>
          <span className="b-bosluk" />
          <button type="button" className="b-dugme" onClick={kapat}>
            Vazgeç
          </button>
          <button type="submit" form={formId} className="b-dugme b-dugme-ana" disabled={bekliyor}>
            {bekliyor ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </>
      }
    >
      <form id={formId} className="b-form" onSubmit={kaydet}>
        <label className="b-alan">
          <span>Yapılacak iş</span>
          <input className="b-girdi" value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={SINIR.baslik} />
        </label>

        <label className="b-alan">
          <span>Not</span>
          <textarea
            className="b-girdi"
            rows={3}
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            maxLength={SINIR.aciklama}
            placeholder="Telefon numarası, adres, kime sorulacağı…"
          />
        </label>

        <div className="b-alan">
          <label htmlFor={`${formId}-tarih`}>Son tarih</label>
          <div className="b-tarih-satiri">
            <input
              id={`${formId}-tarih`}
              type="date"
              className="b-girdi"
              value={sonTarih}
              onChange={(e) => setSonTarih(e.target.value)}
            />
            {sonTarih ? (
              <button type="button" className="b-dugme b-dugme-sade" onClick={() => setSonTarih("")}>
                Tarihi kaldır
              </button>
            ) : null}
          </div>
          {sonTarih ? <span className="b-alan-ipucu">{tarihYazisi(sonTarih, { haftaGunu: true })}</span> : null}
        </div>

        <fieldset className="b-alan">
          <legend>Kim yapacak?</legend>
          <KisiSecimi kisiler={veri.kisiler} secili={sorumluId} sec={setSorumluId} bosEtiket="Belli değil" />
        </fieldset>

        <label className="b-anahtar">
          <input type="checkbox" checked={tamamlandi} onChange={(e) => setTamamlandi(e.target.checked)} />
          <span className="b-anahtar-kutu" aria-hidden="true" />
          <span>Tamamlandı</span>
        </label>

        {hata ? (
          <p className="b-form-hata" role="alert">
            <Ikon ad="uyari" />
            {hata}
          </p>
        ) : null}
        {ekleyen ? <p className="b-form-kunye">{ekleyen.ad} ekledi</p> : null}
      </form>
    </Pencere>
  );
}
