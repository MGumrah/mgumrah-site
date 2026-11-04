"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiHatasi } from "./api";
import { tarihKisa } from "./bicim";
import Ekle, { type EkleSekmesi } from "./ekle";
import Gelir from "./gelir";
import Giris from "./giris";
import { istanbulBugun } from "./hesap";
import type { Oturum, Veri } from "./ortak";
import Pano from "./pano";
import Takvim from "./takvim";
import Taksit from "./taksit";

type SekmeId = "pano" | "takvim" | "taksit" | "gelir";

const SEKMELER: { id: SekmeId; ad: string; ikon: string }[] = [
  { id: "pano", ad: "Pano", ikon: "◧" },
  { id: "takvim", ad: "Takvim", ikon: "▦" },
  { id: "taksit", ad: "Taksit", ikon: "≣" },
  { id: "gelir", ad: "Gelir", ikon: "↧" }
];

const GIZLI_ANAHTARI = "borc:gizli";
/** Sekme uzun süre arka plandaysa geri gelince veriyi tazele. */
const TAZELEME_ESIGI_MS = 60_000;

function adrestekiSekme(): SekmeId {
  const parca = window.location.hash.slice(1);
  return SEKMELER.some((s) => s.id === parca) ? (parca as SekmeId) : "pano";
}

type Durum = "yukleniyor" | "giris" | "hazir" | "hata";

/**
 * /borc'un bütün uygulaması. Sayfa statik ve boş açılır: önce oturumu soran
 * tek bir API çağrısı yapar; 401 ise giriş ekranı, değilse veri. Rakamlar
 * yalnızca bu çağrının yanıtında gelir, hiçbir yere (localStorage, önbellek)
 * yazılmaz.
 */
export default function Uygulama() {
  const [durum, setDurum] = useState<Durum>("yukleniyor");
  const [veri, setVeri] = useState<Veri | null>(null);
  const [kullanici, setKullanici] = useState<Oturum | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [sekme, setSekme] = useState<SekmeId>("pano");
  const [ekle, setEkle] = useState<EkleSekmesi | null>(null);
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
    setSekme(adrestekiSekme());
    try {
      setGizli(localStorage.getItem(GIZLI_ANAHTARI) === "1");
    } catch {
      // localStorage kapalıysa rakamlar açık başlar.
    }
    void yukle();
    const hashDegisti = () => setSekme(adrestekiSekme());
    window.addEventListener("hashchange", hashDegisti);
    return () => window.removeEventListener("hashchange", hashDegisti);
  }, [yukle]);

  // Uygulama arka plandan dönünce (telefonda sık) veri eskimiş olabilir; gün de değişmiş olabilir.
  useEffect(() => {
    const goruldu = () => {
      if (document.visibilityState === "visible" && durum === "hazir" && Date.now() - sonYukleme > TAZELEME_ESIGI_MS) void yukle();
    };
    document.addEventListener("visibilitychange", goruldu);
    return () => document.removeEventListener("visibilitychange", goruldu);
  }, [durum, sonYukleme, yukle]);

  const sekmeAc = (id: SekmeId) => {
    setSekme(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  };

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

      <main className="icerik">
        {sekme === "pano" && <Pano veri={veri} bugun={bugun} git={sekmeAc} ekleAc={setEkle} />}
        {sekme === "takvim" && <Takvim veri={veri} bugun={bugun} />}
        {sekme === "taksit" && <Taksit veri={veri} bugun={bugun} guncelle={veriyiGuncelle} bildir={bildir} />}
        {sekme === "gelir" && <Gelir veri={veri} bugun={bugun} guncelle={veriyiGuncelle} bildir={bildir} ekleAc={() => setEkle("gelir")} />}
      </main>

      <nav className="alt-cubuk" aria-label="Bölümler">
        {SEKMELER.slice(0, 2).map((s) => (
          <button key={s.id} type="button" className={sekme === s.id ? "secili" : ""} aria-current={sekme === s.id ? "page" : undefined} onClick={() => sekmeAc(s.id)}>
            <span aria-hidden="true">{s.ikon}</span>
            {s.ad}
          </button>
        ))}
        <button type="button" className="ekle-dugmesi" onClick={() => setEkle("harcama")} aria-label="Yeni kayıt ekle">
          +
        </button>
        {SEKMELER.slice(2).map((s) => (
          <button key={s.id} type="button" className={sekme === s.id ? "secili" : ""} aria-current={sekme === s.id ? "page" : undefined} onClick={() => sekmeAc(s.id)}>
            <span aria-hidden="true">{s.ikon}</span>
            {s.ad}
          </button>
        ))}
      </nav>

      {ekle && (
        <Ekle
          veri={veri}
          bugun={bugun}
          ilkSekme={ekle}
          kapat={() => setEkle(null)}
          kaydedildi={(v, mesaj) => {
            veriyiGuncelle(v);
            setEkle(null);
            bildir(mesaj);
          }}
        />
      )}

      {bildirim && (
        <div className="bildirim" role="status" key={bildirim.no}>
          {bildirim.mesaj}
        </div>
      )}
    </div>
  );
}
