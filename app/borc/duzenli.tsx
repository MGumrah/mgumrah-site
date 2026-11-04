"use client";

import { useState, type FormEvent } from "react";
import { useBorc, useIs } from "./baglam";
import { dovizYazi, kurCevir, kurYazi, kurusMetni, kurusaCevir } from "./bicim";
import { aylikGelir, ayEkle, ayiAl } from "./hesap";
import { KUR_SINIRI, type DuzenliGelir, type ParaBirimi, type Veri } from "./ortak";
import { Bolum, Bos, Tl } from "./parcalar";

type Calistir = (anahtar: string, is: () => Promise<Veri>, mesaj: string) => Promise<boolean>;

/**
 * Ayarlar › Düzenli gelirler: her ay tekrarlayan kalemler (maaş, kira, sözleşme…). Kalemlerin gün/tutar/kesinlik
 * ayarı burada değişir; takvim, aylık gelir ve borç/gelir oranı bundan türetilir.
 */
export default function DuzenliGelirler() {
  const { veri, api, metin } = useBorc();
  const { calisiyor, calistir } = useIs();
  const [form, setForm] = useState<DuzenliGelir | "yeni" | null>(null);
  const aylik = aylikGelir(veri);
  const mesgul = calisiyor !== null;

  return (
    <Bolum
      baslik="Düzenli gelirler"
      sag={
        <button type="button" className="bag" onClick={() => setForm(form === "yeni" ? null : "yeni")}>
          {form === "yeni" ? "Vazgeç" : "+ Düzenli gelir"}
        </button>
      }
    >
      {veri.duzenliGelirler.length === 0 && form !== "yeni" && <Bos>Henüz düzenli gelir yok. {metin.duzenliAciklama}</Bos>}

      {form === "yeni" && <KalemFormu calisiyor={mesgul} calistir={calistir} bitti={() => setForm(null)} />}

      <ul className="liste">
        {veri.duzenliGelirler.map((k) =>
          form !== "yeni" && form !== null && form.id === k.id ? (
            <li key={k.id}>
              <KalemFormu kalem={k} calisiyor={mesgul} calistir={calistir} bitti={() => setForm(null)} />
            </li>
          ) : (
            <li key={k.id} className={`gelir-satiri${k.aktif ? "" : " pasif"}`}>
              <div className="gelir-ust">
                <div>
                  <strong>{k.ad}</strong>
                  <span className="alt">
                    Her ayın {k.gun}'inde · {k.kesin ? "gün kesin" : "gün kesin değil"}
                    {!k.aktif && " · kapalı"}
                  </span>
                  {k.paraBirimi === "USD" && (
                    <span className="alt">
                      {dovizYazi(k.tutar, "USD")}
                      {veri.ayarlar.usdTry > 0 ? ` × ${kurYazi(veri.ayarlar.usdTry)} (tahmini kur)` : " · kur girilmedi, TL toplamına katılmaz"}
                    </span>
                  )}
                  {k.not && <span className="alt">{k.not}</span>}
                </div>
                <span className="pozitif">
                  {k.paraBirimi === "USD" && veri.ayarlar.usdTry <= 0 ? (
                    <small className="yaklasik">{dovizYazi(k.tutar, "USD")}</small>
                  ) : (
                    <>
                      <Tl k={aylik.kalemler.find((x) => x.kalem.id === k.id)?.tl ?? (k.paraBirimi === "TRY" ? k.tutar : 0)} isaret />
                      {k.paraBirimi === "USD" && <small className="yaklasik"> ≈</small>}
                    </>
                  )}
                </span>
              </div>
              <div className="gelir-dugmeler">
                <button type="button" className="ikinci kucuk" disabled={mesgul} onClick={() => setForm(k)}>
                  Düzenle
                </button>
                <button
                  type="button"
                  className="bag"
                  disabled={mesgul}
                  onClick={() =>
                    void calistir(
                      `a${k.id}`,
                      () => api.duzenliGuncelle(k.id, { ad: k.ad, tutar: k.tutar, paraBirimi: k.paraBirimi, gun: k.gun, kesin: k.kesin, baslangicAy: k.baslangicAy, aktif: !k.aktif, not: k.not }),
                      k.aktif ? `${k.ad} kapatıldı` : `${k.ad} açıldı`
                    )
                  }
                >
                  {k.aktif ? "Kapat" : "Aç"}
                </button>
                <button
                  type="button"
                  className="bag tehlike"
                  disabled={mesgul}
                  onClick={() => window.confirm(`“${k.ad}” silinsin mi? Geçmiş kayıtlar kalır.`) && void calistir(`s${k.id}`, () => api.duzenliSil(k.id), "Düzenli gelir silindi")}
                >
                  Sil
                </button>
              </div>
            </li>
          )
        )}
      </ul>

      {veri.duzenliGelirler.length > 0 && (
        <dl className="degerler">
          <div>
            <dt>Toplam aylık gelir</dt>
            <dd className="pozitif"><Tl k={aylik.toplam} tam /></dd>
          </div>
        </dl>
      )}
      {veri.duzenliGelirler.length > 0 && <p className="not">{metin.duzenliAciklama}</p>}
    </Bolum>
  );
}

/** USD/TRY kuru. 0 = girilmedi: dövizli tutarlar TL toplamlarına katılmaz. */
export function KurBolumu() {
  const { veri, api } = useBorc();
  const { calisiyor, calistir } = useIs();
  const kur = veri.ayarlar.usdTry;
  const dovizli = veri.duzenliGelirler.some((k) => k.paraBirimi === "USD") || veri.gelirler.some((g) => g.paraBirimi === "USD");
  const [metinDegeri, setMetin] = useState(kur > 0 ? kurYazi(kur).replace(/\./g, "") : "");
  const [hata, setHata] = useState<string | null>(null);

  async function gec(e: FormEvent) {
    e.preventDefault();
    const n = metinDegeri.trim() ? kurCevir(metinDegeri) : 0;
    if (n === null || (n !== 0 && (n < KUR_SINIRI.enAz || n > KUR_SINIRI.enCok))) return setHata("Geçerli bir kur yazın (örn. 40,50). Boş bırakırsanız “girilmedi” sayılır.");
    setHata(null);
    await calistir("kur", () => api.kurGuncelle(n), n === 0 ? "Kur temizlendi" : `Kur ${kurYazi(n)} olarak kaydedildi`);
  }

  return (
    <Bolum baslik="Döviz kuru (USD/TRY)">
      <form className="kur-formu" onSubmit={gec} noValidate>
        <label className="alan">
          <span>1 USD = … ₺</span>
          <input inputMode="decimal" autoComplete="off" placeholder="girilmedi" value={metinDegeri} onChange={(e) => setMetin(e.target.value)} aria-label="USD/TRY kuru" />
        </label>
        <button type="submit" className="ikinci kucuk" disabled={calisiyor === "kur"}>
          Kaydet
        </button>
        {hata && <p className="hata" role="alert">{hata}</p>}
      </form>
      <p className="not">
        Resmî güncel kur değildir; elle girdiğiniz bir tahmindir (uygulama internetten kur çekmez).{dovizli ? " Dövizli gelirlerin TL karşılığı, toplam gelir ve borç/gelir oranı bu kura göre hesaplanır." : ""} Kuru girmezseniz
        (boş ya da 0) dövizli tutarlar TL toplamlarına katılmaz. Gerçek tutar yattığında kuru güncelleyin.
      </p>
    </Bolum>
  );
}

/** Yeni kalem ya da var olanı düzenleme. Başlangıç ayı: günü bu ay geçmediyse bu ay, geçtiyse gelecek ay. */
function KalemFormu({ kalem, calisiyor, calistir, bitti }: { kalem?: DuzenliGelir; calisiyor: boolean; calistir: Calistir; bitti: () => void }) {
  const { bugun, api, metin } = useBorc();
  const [ad, setAd] = useState(kalem?.ad ?? "");
  const [tutar, setTutar] = useState(kalem ? kurusMetni(kalem.tutar) : "");
  const [paraBirimi, setParaBirimi] = useState<ParaBirimi>(kalem?.paraBirimi ?? "TRY");
  const [gun, setGun] = useState(String(kalem?.gun ?? 15));
  const [kesin, setKesin] = useState(kalem?.kesin ?? false);
  const [not, setNot] = useState(kalem?.not ?? "");
  const [hata, setHata] = useState<string | null>(null);

  async function gec(e: FormEvent) {
    e.preventDefault();
    const kurus = kurusaCevir(tutar);
    const g = Number(gun);
    if (!ad.trim()) return setHata(`Kalemin adını yazın (örn. ${metin.duzenliOrnek}).`);
    if (kurus === null || kurus <= 0) return setHata("Geçerli bir tutar yazın.");
    if (!Number.isInteger(g) || g < 1 || g > 31) return setHata("Gün 1 ile 31 arasında olmalı.");
    setHata(null);
    // Yeni kalemde bu ayın günü geçtiyse ilk plan gelecek ay; böylece kayıt anında “geciken alacak” çıkmaz.
    const bugunGun = Number(bugun.slice(8));
    const baslangicAy = kalem?.baslangicAy ?? (g >= bugunGun ? ayiAl(bugun) : ayEkle(ayiAl(bugun), 1));
    const girdi = { ad: ad.trim(), tutar: kurus, paraBirimi, gun: g, kesin, baslangicAy, aktif: kalem?.aktif ?? true, not: not.trim() };
    const tamam = await calistir("kalem", () => (kalem ? api.duzenliGuncelle(kalem.id, girdi) : api.duzenliEkle(girdi)), kalem ? "Kalem güncellendi" : `${girdi.ad} eklendi`);
    if (tamam) bitti();
  }

  return (
    <form className="form kalem-formu" onSubmit={gec} noValidate>
      <label className="alan">
        <span>Ad</span>
        <input autoComplete="off" maxLength={80} placeholder={metin.duzenliOrnek} value={ad} onChange={(e) => setAd(e.target.value)} />
      </label>
      <div className="iki-sutun">
        <label className="alan">
          <span>Tutar ({paraBirimi === "USD" ? "USD" : "₺"})</span>
          <input inputMode="decimal" autoComplete="off" placeholder="0,00" value={tutar} onChange={(e) => setTutar(e.target.value)} />
        </label>
        <label className="alan">
          <span>Para birimi</span>
          <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value as ParaBirimi)}>
            <option value="TRY">TL</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>
      <label className="alan">
        <span>Ayın kaçında yatar?</span>
        <input inputMode="numeric" autoComplete="off" maxLength={2} value={gun} onChange={(e) => setGun(e.target.value)} />
        <small>31 yazarsanız kısa aylarda ayın son günü sayılır.</small>
      </label>
      <label className="onay">
        <input type="checkbox" checked={!kesin} onChange={(e) => setKesin(!e.target.checked)} />
        <span>Yatış günü kesin değil</span>
      </label>
      <label className="alan">
        <span>Not (isteğe bağlı)</span>
        <input autoComplete="off" maxLength={400} value={not} onChange={(e) => setNot(e.target.value)} />
      </label>
      {hata && <p className="hata" role="alert">{hata}</p>}
      <div className="gelir-dugmeler">
        <button type="submit" className="birinci" disabled={calisiyor}>
          {calisiyor ? "Kaydediliyor…" : kalem ? "Kaydet" : "Ekle"}
        </button>
        <button type="button" className="bag" onClick={bitti}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}
