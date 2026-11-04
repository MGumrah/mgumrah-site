"use client";

import { useState, type FormEvent } from "react";
import { useBorc, useIs } from "./baglam";
import { carpanCevir, carpanMetni, kurusMetni, kurusaCevir, oranCevir, oranMetni } from "./bicim";
import DuzenliGelirler, { KurBolumu } from "./duzenli";
import { AYAR_SINIRI, type AyarGirdisi, type Ayarlar as AyarlarTipi } from "./ortak";
import { Alan, Bolum } from "./parcalar";

/** Daha fazla › Ayarlar: düzenli gelirler, döviz kuru, faiz varsayımları, veri yedeği. */
export default function Ayarlar() {
  return (
    <>
      <DuzenliGelirler />
      <KurBolumu />
      <FaizBolumu />
      <YedekBolumu />
    </>
  );
}

/** Faiz varsayımları: ödeme senaryosu, panodaki faiz tahmini ve asgari ödeme tahmini bunlarla hesaplanır. */
function FaizBolumu() {
  const { veri, api } = useBorc();
  const { calisiyor, calistir } = useIs();
  const a = veri.ayarlar;
  // Kaydedilmiş değer değişince (başka cihaz, başka sekme) form yeniden dolsun.
  const anahtar = JSON.stringify([a.kartFaiziAlt, a.kartFaiziUst, a.faizEsigi, a.kmhFaizi, a.vergiCarpani, a.varsayilanAsgariOrani]);
  return <FaizFormu key={anahtar} a={a} calisiyor={calisiyor === "faiz"} kaydet={(g) => calistir("faiz", () => api.ayarKaydet(g), "Faiz varsayımları kaydedildi")} />;
}

function FaizFormu({ a, calisiyor, kaydet }: { a: AyarlarTipi; calisiyor: boolean; kaydet: (g: AyarGirdisi) => Promise<boolean> }) {
  const [alt, setAlt] = useState(oranMetni(a.kartFaiziAlt));
  const [ust, setUst] = useState(oranMetni(a.kartFaiziUst));
  const [esik, setEsik] = useState(kurusMetni(a.faizEsigi));
  const [kmh, setKmh] = useState(oranMetni(a.kmhFaizi));
  const [vergi, setVergi] = useState(carpanMetni(a.vergiCarpani));
  const [asgari, setAsgari] = useState(oranMetni(a.varsayilanAsgariOrani));
  const [hata, setHata] = useState<string | null>(null);

  async function gec(e: FormEvent) {
    e.preventDefault();
    const kartAlt = oranCevir(alt);
    const kartUst = oranCevir(ust);
    const kmhOran = oranCevir(kmh);
    const asgariOran = oranCevir(asgari);
    const carpan = carpanCevir(vergi);
    const esikKurus = kurusaCevir(esik);
    const aralik = (n: number | null, s: { enAz: number; enCok: number }) => n !== null && n >= s.enAz && n <= s.enCok;
    if (!aralik(kartAlt, AYAR_SINIRI.kartFaiziAlt) || !aralik(kartUst, AYAR_SINIRI.kartFaiziUst)) return setHata("Kart faizi %0 ile %20 arasında olmalı (aylık, örn. 3,5).");
    if (!aralik(kmhOran, AYAR_SINIRI.kmhFaizi)) return setHata("KMH faizi %0 ile %20 arasında olmalı (aylık, örn. 4,25).");
    if (!aralik(carpan, AYAR_SINIRI.vergiCarpani)) return setHata("Vergi çarpanı 1 ile 3 arasında olmalı (KKDF + BSMV için örn. 1,3).");
    if (!aralik(asgariOran, AYAR_SINIRI.varsayilanAsgariOrani)) return setHata("Varsayılan asgari oranı %0 ile %100 arasında olmalı (örn. 40).");
    if (esikKurus === null || esikKurus < 0) return setHata("Faiz eşiği geçerli değil (örn. 25.000).");
    setHata(null);
    await kaydet({
      kartFaiziAlt: kartAlt!,
      kartFaiziUst: kartUst!,
      faizEsigi: esikKurus,
      kmhFaizi: kmhOran!,
      vergiCarpani: carpan!,
      varsayilanAsgariOrani: asgariOran!
    });
  }

  return (
    <Bolum baslik="Faiz varsayımları">
      <form className="form" onSubmit={gec} noValidate>
        <div className="iki-sutun">
          <Alan etiket="Kart faizi (% / ay)" ipucu="Devreden tutar eşiğe kadar">
            <input inputMode="decimal" autoComplete="off" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Alan>
          <Alan etiket="Kart faizi, eşik üstü (% / ay)">
            <input inputMode="decimal" autoComplete="off" value={ust} onChange={(e) => setUst(e.target.value)} />
          </Alan>
        </div>
        <Alan etiket="Faiz eşiği (₺)" ipucu="Devreden kart borcu bu tutarı aşarsa üst oran işler.">
          <input inputMode="decimal" autoComplete="off" value={esik} onChange={(e) => setEsik(e.target.value)} />
        </Alan>
        <div className="iki-sutun">
          <Alan etiket="KMH faizi (% / ay)">
            <input inputMode="decimal" autoComplete="off" value={kmh} onChange={(e) => setKmh(e.target.value)} />
          </Alan>
          <Alan etiket="Vergi çarpanı" ipucu="KKDF + BSMV; faiz bununla çarpılır.">
            <input inputMode="decimal" autoComplete="off" value={vergi} onChange={(e) => setVergi(e.target.value)} />
          </Alan>
        </div>
        <Alan etiket="Varsayılan asgari ödeme oranı (%)" ipucu="Bankanın yazdığı asgari girilmediyse ekstrenin bu oranı alınır; kartın kendi oranı varsa o geçerlidir.">
          <input inputMode="decimal" autoComplete="off" value={asgari} onChange={(e) => setAsgari(e.target.value)} />
        </Alan>
        {hata && <p className="hata" role="alert">{hata}</p>}
        <button type="submit" className="birinci" disabled={calisiyor}>{calisiyor ? "Kaydediliyor…" : "Varsayımları kaydet"}</button>
      </form>
      <p className="not">Bunlar tahmindir; bankanızın günlük faiz hesabı ve gerçek oranları farklı olabilir.</p>
    </Bolum>
  );
}

/** Verinin bir kopyasını bilgisayara/telefona indirir (JSON). Sunucuya hiçbir şey yazılmaz. */
function YedekBolumu() {
  const { veri, bugun, bildir } = useBorc();

  function indir() {
    try {
      const blob = new Blob([JSON.stringify({ uygulama: "borc-takip", olusturuldu: new Date().toISOString(), veri }, null, 2)], { type: "application/json" });
      const adres = URL.createObjectURL(blob);
      const baglanti = document.createElement("a");
      baglanti.href = adres;
      baglanti.download = `borc-yedek-${bugun}.json`;
      document.body.appendChild(baglanti);
      baglanti.click();
      baglanti.remove();
      window.setTimeout(() => URL.revokeObjectURL(adres), 2000);
      bildir("Yedek indirildi");
    } catch {
      bildir("Yedek indirilemedi");
    }
  }

  return (
    <Bolum baslik="Veri yedeği">
      <p className="not">Tüm hesap, ölçüm, harcama ve gelir kayıtlarınızı JSON dosyası olarak indirir. Dosya borç bilgilerinizi içerir; güvenli bir yerde saklayın, başkalarıyla paylaşmayın.</p>
      <button type="button" className="ikinci" onClick={indir}>
        Yedeği indir (JSON)
      </button>
    </Bolum>
  );
}
