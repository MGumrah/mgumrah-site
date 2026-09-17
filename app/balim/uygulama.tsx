"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Alinacaklar from "./alinacaklar";
import { api, ApiHatasi } from "./api";
import { Baglam, type BalimBaglami, type IslemSecenekleri, type SekmeId } from "./baglam";
import BildirimAyarlari, { KurulumPenceresi } from "./bildirim-ayarlari";
import { swKaydet } from "./bildirim";
import Giderler from "./giderler";
import Giris from "./giris";
import Gorseller from "./gorseller";
import Hesap from "./hesap";
import { BalimLogo, Ikon, type IkonAdi } from "./ikonlar";
import type { Surum, Veri } from "./ortak";
import Ozet from "./ozet";
import { Avatar, Pencere } from "./parcalar";
import Sohbet from "./sohbet";
import UstSerit from "./ust-serit";
import Yapilacaklar from "./yapilacaklar";

/** `kisa`: telefondaki altı sekmelik çubuğa sığan ad. */
const SEKMELER: { id: Exclude<SekmeId, "hesap">; ad: string; kisa: string; ikon: IkonAdi }[] = [
  { id: "ozet", ad: "Özet", kisa: "Özet", ikon: "ozet" },
  { id: "alinacaklar", ad: "Alınacaklar", kisa: "Alınacak", ikon: "alinacaklar" },
  { id: "yapilacaklar", ad: "Yapılacaklar", kisa: "Yapılacak", ikon: "yapilacaklar" },
  { id: "sohbet", ad: "Sohbet", kisa: "Sohbet", ikon: "sohbet" },
  { id: "giderler", ad: "Giderler", kisa: "Giderler", ikon: "giderler" },
  { id: "gorseller", ad: "Görseller", kisa: "Görseller", ikon: "gorseller" }
];

const BASLIKLAR: Record<SekmeId, string> = {
  ozet: "Balım",
  alinacaklar: "Alınacaklar · Balım",
  yapilacaklar: "Yapılacaklar · Balım",
  sohbet: "Sohbet · Balım",
  giderler: "Giderler · Balım",
  gorseller: "Görseller · Balım",
  hesap: "Hesabım · Balım"
};

/**
 * Açık sayfa bu aralıkla "başka biri bir şey değiştirdi mi" diye sorar; soru
 * tek satırlık üç sayı. Sohbet açıkken mesajlar beklemesin diye sıklaşır.
 */
const KONTROL_ARALIGI_MS = 15_000;
const SOHBET_KONTROL_ARALIGI_MS = 3_000;

function adrestekiSekme(): SekmeId {
  const parca = window.location.hash.slice(1);
  return Object.prototype.hasOwnProperty.call(BASLIKLAR, parca) ? (parca as SekmeId) : "ozet";
}

type Bildirim = { mesaj: string; tur: "bilgi" | "hata"; no: number };

/**
 * mgumrah.com/balim'in bütün uygulaması. Sayfa statik; oturum ve veri ilk
 * açılışta API'den gelir. Sekme adreste durur (#alinacaklar), böylece telefonun
 * geri tuşu bir önceki sekmeye döner ve bildirim doğru sekmeyi açabilir.
 */
export default function Uygulama() {
  const [durum, setDurum] = useState<"yukleniyor" | "giris" | "hazir" | "hata">("yukleniyor");
  const [veri, setVeri] = useState<Veri | null>(null);
  const [sekme, setSekme] = useState<SekmeId>("ozet");
  const [bildirim, setBildirim] = useState<Bildirim | null>(null);
  const [sohbetDurumu, setSohbetDurumu] = useState({ mesajSurum: 0, okunmamis: 0 });
  const [pencere, setPencere] = useState<"bildirim" | "kurulum" | null>(null);
  const surum = useRef(0);
  const bekleyenIslem = useRef(0);
  const sonOkunan = useRef(0);

  const bildir = useCallback((mesaj: string, tur: "bilgi" | "hata" = "bilgi") => {
    setBildirim({ mesaj, tur, no: Date.now() });
  }, []);

  useEffect(() => {
    if (!bildirim) return;
    const zamanlayici = window.setTimeout(() => setBildirim(null), bildirim.tur === "hata" ? 6000 : 3000);
    return () => window.clearTimeout(zamanlayici);
  }, [bildirim]);

  const surumuUygula = useCallback((s: Surum) => {
    setSohbetDurumu((onceki) =>
      onceki.mesajSurum === s.mesajSurum && onceki.okunmamis === s.okunmamis
        ? onceki
        : { mesajSurum: s.mesajSurum, okunmamis: s.okunmamis }
    );
  }, []);

  const uygula = useCallback(
    (yeni: Veri) => {
      surum.current = yeni.surum;
      setVeri(yeni);
      surumuUygula(yeni);
      setDurum("hazir");
    },
    [surumuUygula]
  );

  const yukle = useCallback(async () => {
    try {
      uygula(await api.veri());
    } catch (e) {
      if (e instanceof ApiHatasi && e.durum === 401) {
        setVeri(null);
        setDurum("giris");
        return;
      }
      // Ekranda zaten veri varsa onu bırak; yalnızca ilk açılışta hata ekranına düş.
      setDurum((onceki) => (onceki === "hazir" ? onceki : "hata"));
    }
  }, [uygula]);

  useEffect(() => {
    void yukle();
    swKaydet();
  }, [yukle]);

  useEffect(() => {
    const oku = () => setSekme(adrestekiSekme());
    oku();
    window.addEventListener("hashchange", oku);
    // Bildirime dokununca panel zaten açıksa service worker sekmeyi söyler.
    const swMesaji = (e: MessageEvent) => {
      const sekmeAdi = (e.data as { tur?: string; sekme?: string } | null)?.sekme;
      if ((e.data as { tur?: string } | null)?.tur === "git" && typeof sekmeAdi === "string") window.location.hash = sekmeAdi;
    };
    navigator.serviceWorker?.addEventListener("message", swMesaji);
    return () => {
      window.removeEventListener("hashchange", oku);
      navigator.serviceWorker?.removeEventListener("message", swMesaji);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sekme]);

  const { okunmamis } = sohbetDurumu;
  useEffect(() => {
    document.title = okunmamis ? `(${okunmamis}) ${BASLIKLAR[sekme]}` : BASLIKLAR[sekme];
    // Ana ekrana eklenmiş uygulamanın simgesinde okunmamış sayısı.
    const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (okunmamis) nav.setAppBadge?.(okunmamis).catch(() => undefined);
    else nav.clearAppBadge?.().catch(() => undefined);
  }, [sekme, okunmamis]);

  // Başkasının yaptığı değişikliği yakalamak: yalnızca sayfa gözükürken, ve
  // yarım kalmış bir yazma varken değil (iyimser değişiklik geri sıçramasın).
  useEffect(() => {
    if (durum !== "hazir") return;
    let calisiyor = false;

    const kontrol = async () => {
      if (calisiyor || bekleyenIslem.current > 0 || document.visibilityState !== "visible") return;
      calisiyor = true;
      try {
        const yeni = await api.surum();
        surumuUygula(yeni);
        if (yeni.surum !== surum.current) await yukle();
      } catch (e) {
        if (e instanceof ApiHatasi && e.durum === 401) setDurum("giris");
      } finally {
        calisiyor = false;
      }
    };

    const zamanlayici = window.setInterval(kontrol, sekme === "sohbet" ? SOHBET_KONTROL_ARALIGI_MS : KONTROL_ARALIGI_MS);
    document.addEventListener("visibilitychange", kontrol);
    window.addEventListener("focus", kontrol);
    return () => {
      window.clearInterval(zamanlayici);
      document.removeEventListener("visibilitychange", kontrol);
      window.removeEventListener("focus", kontrol);
    };
  }, [durum, sekme, yukle, surumuUygula]);

  const islem = useCallback(
    async (is: () => Promise<Veri>, secenek: IslemSecenekleri = {}) => {
      bekleyenIslem.current += 1;
      try {
        uygula(await is());
        if (secenek.basari) bildir(secenek.basari);
        return null;
      } catch (e) {
        if (e instanceof ApiHatasi && e.durum === 401) {
          setDurum("giris");
          return e.message;
        }
        const mesaj = e instanceof Error ? e.message : "Bir sorun oluştu. Tekrar deneyin.";
        if (!secenek.sessiz) bildir(mesaj, "hata");
        // Ekrandaki iyimser değişikliği geri al, başkasının sildiği kaydı düşür.
        void yukle();
        return mesaj;
      } finally {
        bekleyenIslem.current -= 1;
      }
    },
    [bildir, uygula, yukle]
  );

  const okunduIsaretle = useCallback(
    (id: number) => {
      if (id <= sonOkunan.current) return;
      sonOkunan.current = id;
      api
        .okundu(id)
        .then(surumuUygula)
        .catch(() => {
          sonOkunan.current = 0;
        });
    },
    [surumuUygula]
  );

  const yenile = useCallback(() => void yukle(), [yukle]);
  const bildirimAyarlariniAc = useCallback(() => setPencere("bildirim"), []);

  const baglam = useMemo<BalimBaglami | null>(() => {
    if (!veri) return null;
    const kisiler = new Map(veri.kisiler.map((kisi) => [kisi.id, kisi]));
    return {
      veri,
      kisi: (id) => (id == null ? undefined : kisiler.get(id)),
      islem,
      iyimser: (degistir) => setVeri((onceki) => (onceki ? degistir(onceki) : onceki)),
      bildir,
      cikisYapildi: () => {
        setVeri(null);
        setDurum("giris");
        // Ortak tablette sıradaki kişi kendi okunmamışlarını baştan işaretlesin.
        sonOkunan.current = 0;
        window.location.hash = "";
      },
      yenile,
      mesajSurum: sohbetDurumu.mesajSurum,
      okunmamis: sohbetDurumu.okunmamis,
      okunduIsaretle,
      bildirimAyarlariniAc
    };
  }, [veri, islem, bildir, yenile, sohbetDurumu, okunduIsaretle, bildirimAyarlariniAc]);

  const rozet = (id: SekmeId) =>
    id === "sohbet" && okunmamis > 0 ? (
      <span className="b-rozet-sayi" aria-label={`${okunmamis} okunmamış mesaj`}>
        {okunmamis > 99 ? "99+" : okunmamis}
      </span>
    ) : null;

  let icerik: ReactNode;
  if (durum === "yukleniyor") {
    icerik = (
      <div className="b-acilis" role="status">
        <BalimLogo className="b-acilis-logo" />
        <span>Yükleniyor…</span>
      </div>
    );
  } else if (durum === "giris") {
    icerik = <Giris girildi={yukle} />;
  } else if (!baglam) {
    icerik = (
      <div className="b-acilis" role="alert">
        <BalimLogo className="b-acilis-logo" />
        <p>Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.</p>
        <button type="button" className="b-dugme b-dugme-ana" onClick={() => void yukle()}>
          <Ikon ad="yenile" />
          Tekrar dene
        </button>
      </div>
    );
  } else {
    const { ben } = baglam.veri;
    icerik = (
      <Baglam.Provider value={baglam}>
        <header className="b-ust">
          <div className="b-ust-ic">
            <a className="b-marka" href="#ozet">
              <BalimLogo className="b-logo" />
              <span className="b-marka-ad">
                Balım
                <small>Kafe hazırlığı</small>
              </span>
            </a>
            <nav className="b-ust-sekmeler" aria-label="Bölümler">
              {SEKMELER.map((s) => (
                <a key={s.id} href={`#${s.id}`} aria-current={sekme === s.id ? "page" : undefined}>
                  <Ikon ad={s.ikon} />
                  {s.ad}
                  {rozet(s.id)}
                </a>
              ))}
            </nav>
            <button
              type="button"
              className="b-dugme b-dugme-ikon b-dugme-sade b-ust-zil"
              onClick={() => setPencere("bildirim")}
              aria-label="Bildirim ayarları"
            >
              <Ikon ad="zil" />
            </button>
            <a
              className="b-ust-kisi"
              href="#hesap"
              aria-label={`Hesabım (${ben.ad})`}
              aria-current={sekme === "hesap" ? "page" : undefined}
            >
              <span className="b-ust-kisi-ad">{ben.ad}</span>
              <Avatar kisi={ben} />
            </a>
          </div>
        </header>

        <main className={`b-icerik${sekme === "sohbet" ? " is-sohbet" : ""}`}>
          <UstSerit kurulumGoster={() => setPencere("kurulum")} />
          {sekme === "ozet" ? <Ozet /> : null}
          {sekme === "alinacaklar" ? <Alinacaklar /> : null}
          {sekme === "yapilacaklar" ? <Yapilacaklar /> : null}
          {sekme === "sohbet" ? <Sohbet /> : null}
          {sekme === "giderler" ? <Giderler /> : null}
          {sekme === "gorseller" ? <Gorseller /> : null}
          {sekme === "hesap" ? <Hesap kurulumGoster={() => setPencere("kurulum")} /> : null}
        </main>

        <nav className="b-alt-sekmeler" aria-label="Bölümler">
          {SEKMELER.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={sekme === s.id ? "page" : undefined}>
              <span className="b-alt-ikon">
                <Ikon ad={s.ikon} />
                {rozet(s.id)}
              </span>
              {s.kisa}
            </a>
          ))}
        </nav>

        {pencere === "bildirim" ? (
          <Pencere baslik="Bildirimler" kapat={() => setPencere(null)} disaridanKapanir>
            <BildirimAyarlari kurulumGoster={() => setPencere("kurulum")} />
          </Pencere>
        ) : null}
        {pencere === "kurulum" ? <KurulumPenceresi kapat={() => setPencere(null)} /> : null}
      </Baglam.Provider>
    );
  }

  return (
    <div className="balim">
      {icerik}
      <div className="b-bildirim-alani" aria-live="polite">
        {bildirim ? (
          <p key={bildirim.no} className={`b-bildirim${bildirim.tur === "hata" ? " is-hata" : ""}`}>
            {bildirim.tur === "hata" ? <Ikon ad="uyari" /> : <Ikon ad="onay" />}
            {bildirim.mesaj}
          </p>
        ) : null}
      </div>
    </div>
  );
}
