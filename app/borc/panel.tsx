"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiHatasi, type BorcApi } from "./api";
import Aylar, { AyDetayi } from "./aylar";
import { Baglam, ISLETME_METINLER, KISISEL_METINLER, type BorcBaglami, type PencereIstegi } from "./baglam";
import { ayAdi } from "./bicim";
import Daha from "./daha";
import Ekle, { IslemDuzenle, type EkleSekmesi } from "./ekle";
import Gecmis from "./gecmis";
import Hesaplar, { HesapDetayi, HesapFormu } from "./hesaplar";
import Islemler from "./islemler";
import Pano from "./pano";
import { Pencere } from "./parcalar";
import Senaryo from "./senaryo";
import Takvim from "./takvim";
import Taksit from "./taksit";
import Ayarlar from "./ayarlar";
import type { Veri } from "./ortak";

/** Ana sekmeler (iOS'taki alt çubuk): Pano · Hesaplar · İşlemler · Takvim · Daha fazla. */
export const ANA_SEKMELER = [
  { id: "pano", ad: "Pano", ikon: "◧" },
  { id: "hesaplar", ad: "Hesaplar", ikon: "▭" },
  { id: "islemler", ad: "İşlemler", ikon: "≣" },
  { id: "takvim", ad: "Takvim", ikon: "▦" },
  { id: "daha", ad: "Daha fazla", ikon: "⋯" }
] as const;

type AnaId = (typeof ANA_SEKMELER)[number]["id"];

/** Eski adresler (#gelir, #taksit…) ve geçersiz adresler: her zaman geçerli bir ekrana çevrilir. */
export function yolCoz(ham: string): { yol: string; ana: AnaId; parcalar: string[] } {
  const temiz = ham.replace(/^\/+|\/+$/g, "");
  const takma: Record<string, string> = { gelir: "takvim/gelirler", "": "pano" };
  const yol = takma[temiz] ?? temiz;
  const parcalar = yol.split("/");
  const [ilk, ikinci] = parcalar;

  const gecerli =
    (parcalar.length === 1 && ["pano", "hesaplar", "islemler", "takvim", "daha", "aylar", "gecmis", "senaryo", "taksit", "ayarlar"].includes(ilk)) ||
    (ilk === "takvim" && parcalar.length === 2 && (ikinci === "gelirler" || ikinci === "nakit" || ikinci === "odemeler")) ||
    (ilk === "aylar" && parcalar.length === 2 && /^\d{4}-(0[1-9]|1[0-2])$/.test(ikinci));
  if (!gecerli) return { yol: "pano", ana: "pano", parcalar: ["pano"] };

  const ana: AnaId = ilk === "pano" || ilk === "hesaplar" || ilk === "islemler" || ilk === "takvim" ? ilk : "daha";
  return { yol, ana, parcalar };
}

const BASLIKLAR: Record<string, string> = {
  pano: "Pano",
  hesaplar: "Hesaplar",
  islemler: "İşlemler",
  takvim: "Takvim",
  daha: "Daha fazla",
  aylar: "Tüm aylar",
  gecmis: "Borç geçmişi",
  senaryo: "Ödeme senaryosu",
  taksit: "Taksit planı",
  ayarlar: "Ayarlar"
};

/** Geri düğmesinin gittiği yer; ana sekmelerde geri yok. */
function ustYol(parcalar: string[]): string | null {
  if (parcalar[0] === "aylar" && parcalar.length === 2) return "aylar";
  if (["aylar", "gecmis", "senaryo", "taksit", "ayarlar"].includes(parcalar[0])) return "daha";
  return null;
}

export type PanelProps = {
  api: BorcApi;
  veri: Veri;
  /** İstanbul takvimindeki bugün, "YYYY-MM-DD". */
  bugun: string;
  guncelle: (veri: Veri) => void;
  bildir: (mesaj: string) => void;
  /** Adresin panel içi kısmı ("pano", "aylar/2026-11"). Adres çubuğunu sahibi yönetir. */
  yol: string;
  git: (yol: string) => void;
  /** "alt": ekranın altında sabit çubuk (/borc). "serit": içeriğin üstünde kaydırmalı sekme şeridi (Balım içinde). */
  nav: "alt" | "serit";
  /** İşletme söz dağarcığı (tedarikçi, düzenli gelir…); false: kişisel. */
  isletme?: boolean;
  /** Sunucu 401/403 verirse (oturum bitti / yetki kalktı) sahibine haber verir. */
  hataIsle?: (hata: ApiHatasi) => void;
};

/**
 * Borç takibinin ortak paneli. mgumrah.com/borc ve Balım › Borçlar AYNI bileşeni kullanır; ikisi arasındaki
 * fark yalnızca api (hangi uca konuştuğu), adres yönetimi, gezinme çubuğu ve söz dağarcığıdır.
 */
export default function BorcPaneli({ api, veri, bugun, guncelle, bildir, yol, git, nav, isletme = false, hataIsle }: PanelProps) {
  const cozulen = useMemo(() => yolCoz(yol), [yol]);
  const [pencere, setPencere] = useState<PencereIstegi | null>(null);
  const kapat = useCallback(() => setPencere(null), []);
  const ac = useCallback((istek: PencereIstegi) => setPencere(istek), []);

  const hataMesaji = useCallback(
    (hata: unknown, varsayilan = "Bir sorun oluştu. Tekrar deneyin.") => {
      if (hata instanceof ApiHatasi) {
        if (hata.durum === 401 || hata.durum === 403) hataIsle?.(hata);
        return hata.message;
      }
      return varsayilan;
    },
    [hataIsle]
  );

  const baglam = useMemo<BorcBaglami>(
    () => ({ api, veri, bugun, guncelle, bildir, git, yol: cozulen.yol, ac, hataMesaji, metin: isletme ? ISLETME_METINLER : KISISEL_METINLER }),
    [api, veri, bugun, guncelle, bildir, git, cozulen.yol, ac, hataMesaji, isletme]
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [cozulen.yol]);

  const [ilk, ikinci] = cozulen.parcalar;
  const geriYol = ustYol(cozulen.parcalar);
  // Ay detayında ayın adı zaten ay gezgininde (‹ Eki 26 · Kasım 2026 · Ara 26 ›) yazıyor; başlıkta tekrarlanmaz.
  const baslik = ilk === "aylar" && ikinci ? "Ay detayı" : (BASLIKLAR[ilk] ?? "Pano");

  const kaydedildi = (v: Veri, mesaj: string) => {
    guncelle(v);
    setPencere(null);
    bildir(mesaj);
  };

  /** "+" düğmesinin açtığı pencerenin ilk sekmesi, bulunulan ekrana göre. */
  const eklemeSekmesi: EkleSekmesi = ilk === "takvim" && ikinci === "gelirler" ? "gelir" : ilk === "hesaplar" ? "durum" : "harcama";

  let ekran: ReactNode;
  switch (ilk) {
    case "hesaplar":
      ekran = <Hesaplar />;
      break;
    case "islemler":
      ekran = <Islemler />;
      break;
    case "takvim":
      ekran = <Takvim alt={ikinci ?? "odemeler"} />;
      break;
    case "daha":
      ekran = <Daha />;
      break;
    case "aylar":
      ekran = ikinci ? <AyDetayi ay={ikinci} /> : <Aylar />;
      break;
    case "gecmis":
      ekran = <Gecmis />;
      break;
    case "senaryo":
      ekran = <Senaryo />;
      break;
    case "taksit":
      ekran = <Taksit />;
      break;
    case "ayarlar":
      ekran = <Ayarlar />;
      break;
    default:
      ekran = <Pano />;
  }

  const sekmeler = (
    <>
      {ANA_SEKMELER.map((s) => (
        <button key={s.id} type="button" className={cozulen.ana === s.id ? "secili" : ""} aria-current={cozulen.ana === s.id ? "page" : undefined} onClick={() => git(s.id)}>
          {nav === "alt" && <span aria-hidden="true">{s.ikon}</span>}
          {s.ad}
        </button>
      ))}
    </>
  );

  return (
    <Baglam.Provider value={baglam}>
      {nav === "serit" && (
        <nav className="serit" aria-label="Borç bölümleri">
          {sekmeler}
        </nav>
      )}

      <div className="panel-ust">
        {geriYol ? (
          <button type="button" className="ikon-dugme geri" onClick={() => git(geriYol)} aria-label="Geri">
            ‹
          </button>
        ) : (
          <span className="geri-yer" aria-hidden="true" />
        )}
        <h2>{baslik}</h2>
        <button type="button" className="ikon-dugme arti" onClick={() => ac({ tur: "ekle", sekme: eklemeSekmesi })} aria-label="Yeni kayıt ekle" title="Yeni kayıt ekle">
          +
        </button>
      </div>

      <div className="icerik">{ekran}</div>

      {nav === "alt" && (
        <nav className="alt-cubuk" aria-label="Bölümler">
          {sekmeler}
        </nav>
      )}

      {pencere?.tur === "ekle" && (
        <Pencere baslik="Yeni kayıt" kapat={kapat}>
          <Ekle ilkSekme={pencere.sekme} hesapId={pencere.hesapId} kaydedildi={kaydedildi} />
        </Pencere>
      )}
      {pencere?.tur === "islem" && (
        <Pencere baslik="Harcamayı düzenle" kapat={kapat}>
          <IslemDuzenle islem={pencere.islem} kaydedildi={kaydedildi} />
        </Pencere>
      )}
      {pencere?.tur === "hesap" && (
        <Pencere baslik={pencere.hesap ? "Hesabı düzenle" : "Hesap ekle"} kapat={kapat}>
          <HesapFormu hesap={pencere.hesap} kaydedildi={kaydedildi} />
        </Pencere>
      )}
      {pencere?.tur === "hesapDetay" && (
        <Pencere baslik={veri.hesaplar.find((h) => h.id === pencere.hesapId)?.ad ?? "Hesap"} kapat={kapat}>
          <HesapDetayi hesapId={pencere.hesapId} kapat={kapat} />
        </Pencere>
      )}
    </Baglam.Provider>
  );
}
