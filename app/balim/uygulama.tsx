"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Alinacaklar from "./alinacaklar";
import { api, ApiHatasi } from "./api";
import { Baglam, type BalimBaglami, type IslemSecenekleri, type SekmeId } from "./baglam";
import Giderler from "./giderler";
import Giris from "./giris";
import Gorseller from "./gorseller";
import Hesap from "./hesap";
import { BalimLogo, Ikon, type IkonAdi } from "./ikonlar";
import type { Veri } from "./ortak";
import Ozet from "./ozet";
import { Avatar } from "./parcalar";
import Yapilacaklar from "./yapilacaklar";

const SEKMELER: { id: Exclude<SekmeId, "hesap">; ad: string; ikon: IkonAdi }[] = [
  { id: "ozet", ad: "Özet", ikon: "ozet" },
  { id: "alinacaklar", ad: "Alınacaklar", ikon: "alinacaklar" },
  { id: "yapilacaklar", ad: "Yapılacaklar", ikon: "yapilacaklar" },
  { id: "giderler", ad: "Giderler", ikon: "giderler" },
  { id: "gorseller", ad: "Görseller", ikon: "gorseller" }
];

const BASLIKLAR: Record<SekmeId, string> = {
  ozet: "Balım",
  alinacaklar: "Alınacaklar · Balım",
  yapilacaklar: "Yapılacaklar · Balım",
  giderler: "Giderler · Balım",
  gorseller: "Görseller · Balım",
  hesap: "Hesabım · Balım"
};

/** Açık sayfa bu aralıkla "başka biri bir şey değiştirdi mi" diye sorar; soru tek satırlık bir sayı. */
const KONTROL_ARALIGI_MS = 15_000;

function adrestekiSekme(): SekmeId {
  const parca = window.location.hash.slice(1);
  return Object.prototype.hasOwnProperty.call(BASLIKLAR, parca) ? (parca as SekmeId) : "ozet";
}

type Bildirim = { mesaj: string; tur: "bilgi" | "hata"; no: number };

/**
 * mgumrah.com/balim'in bütün uygulaması. Sayfa statik; oturum ve veri ilk
 * açılışta API'den gelir. Sekme adreste durur (#alinacaklar), böylece telefonun
 * geri tuşu bir önceki sekmeye döner ve bir sekmenin bağlantısı paylaşılabilir.
 */
export default function Uygulama() {
  const [durum, setDurum] = useState<"yukleniyor" | "giris" | "hazir" | "hata">("yukleniyor");
  const [veri, setVeri] = useState<Veri | null>(null);
  const [sekme, setSekme] = useState<SekmeId>("ozet");
  const [bildirim, setBildirim] = useState<Bildirim | null>(null);
  const surum = useRef(0);
  const bekleyenIslem = useRef(0);

  const bildir = useCallback((mesaj: string, tur: "bilgi" | "hata" = "bilgi") => {
    setBildirim({ mesaj, tur, no: Date.now() });
  }, []);

  useEffect(() => {
    if (!bildirim) return;
    const zamanlayici = window.setTimeout(() => setBildirim(null), bildirim.tur === "hata" ? 6000 : 3000);
    return () => window.clearTimeout(zamanlayici);
  }, [bildirim]);

  const uygula = useCallback((yeni: Veri) => {
    surum.current = yeni.surum;
    setVeri(yeni);
    setDurum("hazir");
  }, []);

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
  }, [yukle]);

  useEffect(() => {
    const oku = () => setSekme(adrestekiSekme());
    oku();
    window.addEventListener("hashchange", oku);
    return () => window.removeEventListener("hashchange", oku);
  }, []);

  useEffect(() => {
    document.title = BASLIKLAR[sekme];
    window.scrollTo(0, 0);
  }, [sekme]);

  // Başkasının yaptığı değişikliği yakalamak: yalnızca sayfa gözükürken, ve
  // yarım kalmış bir yazma varken değil (iyimser değişiklik geri sıçramasın).
  useEffect(() => {
    if (durum !== "hazir") return;
    let calisiyor = false;

    const kontrol = async () => {
      if (calisiyor || bekleyenIslem.current > 0 || document.visibilityState !== "visible") return;
      calisiyor = true;
      try {
        if ((await api.surum()) !== surum.current) await yukle();
      } catch (e) {
        if (e instanceof ApiHatasi && e.durum === 401) setDurum("giris");
      } finally {
        calisiyor = false;
      }
    };

    const zamanlayici = window.setInterval(kontrol, KONTROL_ARALIGI_MS);
    document.addEventListener("visibilitychange", kontrol);
    window.addEventListener("focus", kontrol);
    return () => {
      window.clearInterval(zamanlayici);
      document.removeEventListener("visibilitychange", kontrol);
      window.removeEventListener("focus", kontrol);
    };
  }, [durum, yukle]);

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
        window.location.hash = "";
      }
    };
  }, [veri, islem, bildir]);

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
                </a>
              ))}
            </nav>
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

        <main className="b-icerik">
          {sekme === "ozet" ? <Ozet /> : null}
          {sekme === "alinacaklar" ? <Alinacaklar /> : null}
          {sekme === "yapilacaklar" ? <Yapilacaklar /> : null}
          {sekme === "giderler" ? <Giderler /> : null}
          {sekme === "gorseller" ? <Gorseller /> : null}
          {sekme === "hesap" ? <Hesap /> : null}
        </main>

        <nav className="b-alt-sekmeler" aria-label="Bölümler">
          {SEKMELER.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={sekme === s.id ? "page" : undefined}>
              <span className="b-alt-ikon">
                <Ikon ad={s.ikon} />
              </span>
              {s.ad}
            </a>
          ))}
        </nav>
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
