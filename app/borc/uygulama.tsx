"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiHatasi } from "./api";
import { tarihKisa } from "./bicim";
import Giris from "./giris";
import { istanbulBugun } from "./hesap";
import type { Oturum, Veri } from "./ortak";
import BorcPaneli from "./panel";

const GIZLI_ANAHTARI = "borc:gizli";
/** Sekme uzun süre arka plandaysa geri gelince veriyi tazele. */
const TAZELEME_ESIGI_MS = 60_000;

const adresYolu = () => window.location.hash.slice(1);

type Durum = "yukleniyor" | "giris" | "hazir" | "hata";

/**
 * /borc'un bütün uygulaması: giriş, üst şerit (rakamları gizle, yenile, çıkış) ve ortak borç paneli
 * (app/borc/panel.tsx — Balım › Borçlar ile aynı bileşen). Sayfa statik ve boş açılır: önce oturumu soran
 * tek bir API çağrısı yapar; 401 ise giriş ekranı, değilse veri. Rakamlar yalnızca bu çağrının yanıtında
 * gelir, hiçbir yere (localStorage, önbellek) yazılmaz.
 */
export default function Uygulama() {
  const [durum, setDurum] = useState<Durum>("yukleniyor");
  const [veri, setVeri] = useState<Veri | null>(null);
  const [kullanici, setKullanici] = useState<Oturum | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yol, setYol] = useState("");
  const [bugun, setBugun] = useState(() => istanbulBugun());
  const [gizli, setGizli] = useState(false);
  const [bildirim, setBildirim] = useState<{ mesaj: string; no: number } | null>(null);
  const [sonYukleme, setSonYukleme] = useState(0);

  const yukle = useCallback(async () => {
    try {
      const yanit = await api.veri();
      setVeri(yanit.veri);
      setKullanici(yanit.kullanici);
      setBugun(istanbulBugun());
      setSonYukleme(Date.now());
      setHata(null);
      setDurum("hazir");
    } catch (e) {
      if (e instanceof ApiHatasi && e.durum === 401) {
        setVeri(null);
        setDurum("giris");
      } else {
        setHata(e instanceof ApiHatasi ? e.message : "Veri yüklenemedi.");
        setDurum((d) => (d === "hazir" ? d : "hata"));
      }
    }
  }, []);

  useEffect(() => {
    setYol(adresYolu());
    try {
      setGizli(localStorage.getItem(GIZLI_ANAHTARI) === "1");
    } catch {
      // localStorage kapalıysa rakamlar açık başlar.
    }
    void yukle();
    const adresDegisti = () => setYol(adresYolu());
    window.addEventListener("hashchange", adresDegisti);
    window.addEventListener("popstate", adresDegisti);
    return () => {
      window.removeEventListener("hashchange", adresDegisti);
      window.removeEventListener("popstate", adresDegisti);
    };
  }, [yukle]);

  // Uygulama arka plandan dönünce (telefonda sık) veri eskimiş olabilir; gün de değişmiş olabilir.
  useEffect(() => {
    const goruldu = () => {
      if (document.visibilityState === "visible" && durum === "hazir" && Date.now() - sonYukleme > TAZELEME_ESIGI_MS) void yukle();
    };
    document.addEventListener("visibilitychange", goruldu);
    return () => document.removeEventListener("visibilitychange", goruldu);
  }, [durum, sonYukleme, yukle]);

  /** Panel içi gezinme: adrese yazılır (geri tuşu bir önceki ekrana döner). */
  const git = useCallback((hedef: string) => {
    window.history.pushState(null, "", `#${hedef}`);
    setYol(hedef);
  }, []);

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

  const bildir = useCallback((mesaj: string) => setBildirim({ mesaj, no: Date.now() }), []);
  useEffect(() => {
    if (!bildirim) return;
    const t = window.setTimeout(() => setBildirim(null), 3200);
    return () => window.clearTimeout(t);
  }, [bildirim]);

  async function cikis() {
    try {
      await api.cikis();
    } catch {
      // Çıkış yapılamadıysa bile ekranı temizle; sunucu çerezi zaten süreyle düşer.
    }
    setVeri(null);
    setKullanici(null);
    setDurum("giris");
  }

  /** Yazma işlemi yanıtıyla gelen güncel veriyi ekrana koyar. */
  const veriyiGuncelle = useCallback((v: Veri) => {
    setVeri(v);
    setBugun(istanbulBugun());
  }, []);

  /** Panelden gelen 401: oturum bitmiş, giriş ekranına dön. */
  const hataIsle = useCallback((h: ApiHatasi) => {
    if (h.durum === 401) {
      setVeri(null);
      setDurum("giris");
    }
  }, []);

  const guncelTarih = useMemo(() => veri?.durum.reduce<string | null>((en, d) => (en === null || d.tarih > en ? d.tarih : en), null) ?? null, [veri]);

  if (durum === "yukleniyor") {
    return (
      <div className="borc" data-yukleniyor>
        <p className="yukleniyor">Yükleniyor…</p>
      </div>
    );
  }

  if (durum === "giris") {
    return (
      <div className="borc">
        <Giris girildi={yukle} />
      </div>
    );
  }

  if (durum === "hata" || !veri) {
    return (
      <div className="borc">
        <main className="giris">
          <div className="giris-kart">
            <h1>Borç takibi</h1>
            <p className="hata" role="alert">
              {hata ?? "Veri yüklenemedi."}
            </p>
            <button type="button" className="birinci" onClick={() => void yukle()}>
              Tekrar dene
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`borc${gizli ? " gizli" : ""}`}>
      <header className="ust">
        <div>
          <h1>Borç takibi</h1>
          <p className="alt-yazi">{guncelTarih ? `Son ölçüm ${tarihKisa(guncelTarih)}` : "Henüz ölçüm yok"}</p>
        </div>
        <div className="ust-dugmeler">
          <button type="button" className="ikon-dugme" onClick={gizliDegistir} aria-pressed={gizli} aria-label={gizli ? "Rakamları göster" : "Rakamları gizle"} title={gizli ? "Rakamları göster" : "Rakamları gizle"}>
            {gizli ? "◌" : "◉"}
          </button>
          <button type="button" className="ikon-dugme" onClick={() => void yukle()} aria-label="Yenile" title="Yenile">
            ↻
          </button>
          <button type="button" className="ikon-dugme metin" onClick={cikis} title={kullanici ? `${kullanici.kullaniciAdi} olarak girildi` : undefined}>
            Çıkış
          </button>
        </div>
      </header>

      <main className="panel-kok">
        <BorcPaneli api={api} veri={veri} bugun={bugun} guncelle={veriyiGuncelle} bildir={bildir} yol={yol} git={git} nav="alt" hataIsle={hataIsle} />
      </main>

      {bildirim && (
        <div className="bildirim" role="status" key={bildirim.no}>
          {bildirim.mesaj}
        </div>
      )}
    </div>
  );
}
