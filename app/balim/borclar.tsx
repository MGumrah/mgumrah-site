"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiHatasi, borcApiOlustur } from "../borc/api";
import { istanbulBugun } from "../borc/hesap";
import type { Veri as BorcVeri } from "../borc/ortak";
import BorcPaneli from "../borc/panel";
import { BORC_API_YOLU } from "./adres";
import { useBalim } from "./baglam";
import { Ikon } from "./ikonlar";

/** Başka biri borç verisini değiştirdi mi diye bu aralıkla tek bir sayı sorulur. */
const KONTROL_ARALIGI_MS = 20_000;
const GIZLI_ANAHTARI = "balim:borc-gizli";

type Durum = "yukleniyor" | "hazir" | "hata" | "yetkisiz";

/**
 * Balım › Borçlar: kart, KMH, kredi ve tedarikçi borçlarının takibi. /borc ile AYNI panel bileşenini
 * (app/borc/panel.tsx) kullanır; fark yalnızca konuştuğu uç (/api/balim/borc/…), adres yönetimi (#borclar/…)
 * ve işletme söz dağarcığıdır.
 *
 * Bu sekme yalnızca sunucuda borç yetkisi olan kişilere çizilir (veri.borcYetkisi), ama asıl denetim API'dedir:
 * yetkisiz biri adresi elle yazsa da sunucu 403 döner ve hiçbir borç verisi gelmez. Borç verisi Balım'ın ortak
 * `veri`sine KONMAZ; yalnızca bu bileşende, bellekte tutulur, hiçbir yere (localStorage, önbellek) yazılmaz.
 */
export default function Borclar({ yol }: { yol: string }) {
  const { yenile, bildir } = useBalim();
  const [durum, setDurum] = useState<Durum>("yukleniyor");
  const [veri, setVeri] = useState<BorcVeri | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [bugun, setBugun] = useState(() => istanbulBugun());
  const [gizli, setGizli] = useState(false);
  const surum = useRef<number | null>(null);

  const api = useMemo(
    () =>
      borcApiOlustur(BORC_API_YOLU, (n) => {
        surum.current = n;
      }),
    []
  );

  const yukle = useCallback(async () => {
    try {
      const yanit = await api.veri();
      setVeri(yanit.veri);
      surum.current = yanit.surum ?? null;
      setBugun(istanbulBugun());
      setHata(null);
      setDurum("hazir");
    } catch (e) {
      if (e instanceof ApiHatasi && e.durum === 403) {
        // Yetki alınmış: sekme listesini sunucudaki duruma göre yenile (sekme kaybolur).
        setVeri(null);
        setDurum("yetkisiz");
        yenile();
      } else if (e instanceof ApiHatasi && e.durum === 401) {
        yenile();
      } else {
        setHata(e instanceof ApiHatasi ? e.message : "Borç verisi yüklenemedi.");
        setDurum((d) => (d === "hazir" ? d : "hata"));
      }
    }
  }, [api, yenile]);

  useEffect(() => {
    void yukle();
    try {
      setGizli(localStorage.getItem(GIZLI_ANAHTARI) === "1");
    } catch {
      // localStorage kapalıysa rakamlar açık başlar.
    }
  }, [yukle]);

  // Başka biri değiştirdiyse yeniden çek: yalnızca sayfa görünürken ve yalnızca tek sayı sorarak.
  useEffect(() => {
    if (durum !== "hazir") return;
    let calisiyor = false;
    const kontrol = async () => {
      if (calisiyor || document.visibilityState !== "visible") return;
      calisiyor = true;
      try {
        const yeni = await api.surum();
        if (surum.current !== null && yeni !== surum.current) await yukle();
        else {
          surum.current = yeni;
          // Gün değişmiş olabilir (gece açık kalan sekme).
          setBugun((b) => (b === istanbulBugun() ? b : istanbulBugun()));
        }
      } catch (e) {
        if (e instanceof ApiHatasi && (e.durum === 401 || e.durum === 403)) await yukle();
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
  }, [durum, api, yukle]);

  const git = useCallback((hedef: string) => {
    window.location.hash = hedef === "pano" || hedef === "" ? "borclar" : `borclar/${hedef}`;
  }, []);

  const guncelle = useCallback((v: BorcVeri) => {
    setVeri(v);
    setBugun(istanbulBugun());
  }, []);

  const duyur = useCallback((mesaj: string) => bildir(mesaj), [bildir]);

  const hataIsle = useCallback(
    (h: ApiHatasi) => {
      if (h.durum === 403) setDurum("yetkisiz");
      yenile();
    },
    [yenile]
  );

  const gizliDegistir = () => {
    setGizli((g) => {
      try {
        localStorage.setItem(GIZLI_ANAHTARI, g ? "0" : "1");
      } catch {
        // sorun değil
      }
      return !g;
    });
  };

  if (durum === "yukleniyor") {
    return (
      <div className="borc borc-gomulu">
        <p className="yukleniyor" role="status">Borçlar yükleniyor…</p>
      </div>
    );
  }

  if (durum === "yetkisiz") {
    return (
      <div className="borc borc-gomulu">
        <section className="bolum">
          <div className="bolum-ust"><h2>Borç takibi</h2></div>
          <p className="bos">Bu bölümü görme yetkiniz yok. Yetki, panel yöneticisi tarafından kişi bazında verilir.</p>
        </section>
      </div>
    );
  }

  if (durum === "hata" || !veri) {
    return (
      <div className="borc borc-gomulu">
        <section className="bolum">
          <div className="bolum-ust"><h2>Borç takibi</h2></div>
          <p className="hata" role="alert">{hata ?? "Borç verisi yüklenemedi."}</p>
          <div className="hizli tek">
            <button type="button" className="birinci" onClick={() => void yukle()}>Tekrar dene</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`borc borc-gomulu${gizli ? " gizli" : ""}`}>
      <div className="gomulu-ust">
        <p>Borç bilgileri yalnızca yetkili kişilere görünür.</p>
        <button type="button" className="ikon-dugme" onClick={gizliDegistir} aria-pressed={gizli} aria-label={gizli ? "Rakamları göster" : "Rakamları gizle"} title={gizli ? "Rakamları göster" : "Rakamları gizle"}>
          <Ikon ad={gizli ? "gozKapali" : "goz"} />
        </button>
      </div>
      <BorcPaneli api={api} veri={veri} bugun={bugun} guncelle={guncelle} bildir={duyur} yol={yol} git={git} nav="serit" isletme hataIsle={hataIsle} />
    </div>
  );
}
