"use client";

import { useEffect, useState } from "react";
import { useBalim } from "./baglam";
import { mevcutAbonelik, pushDestegi } from "./bildirim";
import { Ikon } from "./ikonlar";
import { useKurulum, yukle } from "./kurulum";

/** Kapatılan şerit bu kadar süre görünmez; sonra bir kez daha hatırlatır. */
const KAPALI_KALMA_MS = 7 * 24 * 60 * 60 * 1000;
const anahtar = (tur: string) => `balim:serit:${tur}`;

function kapatildiMi(tur: string) {
  try {
    return Date.now() - Number(localStorage.getItem(anahtar(tur)) ?? 0) < KAPALI_KALMA_MS;
  } catch {
    return false;
  }
}

/**
 * Sayfanın en üstündeki tek satırlık davet. Sırası sabit: önce ana ekrana
 * ekleme (iPhone'da bildirimin de ön koşulu), o tamamsa bildirimleri açma.
 * İkisi de bittiğinde ya da kapatıldığında hiç yer kaplamaz.
 */
export default function UstSerit({ kurulumGoster }: { kurulumGoster: () => void }) {
  const { bildirimAyarlariniAc } = useBalim();
  const kurulum = useKurulum();
  const [bildirimKapali, setBildirimKapali] = useState(false);
  const [kapatilan, setKapatilan] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setKapatilan({ kurulum: kapatildiMi("kurulum"), bildirim: kapatildiMi("bildirim") });
  }, []);

  useEffect(() => {
    if (!kurulum || pushDestegi() !== "var") return;
    let iptal = false;
    mevcutAbonelik()
      .then((abonelik) => {
        if (!iptal) setBildirimKapali(!abonelik);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, [kurulum]);

  if (!kurulum) return null;

  const kurulumSeridi =
    !kurulum.uygulamada && !kurulum.yuklendi && (kurulum.mobil || kurulum.tekDokunus) && !kapatilan.kurulum;
  const bildirimSeridi = !kurulumSeridi && bildirimKapali && !kapatilan.bildirim;
  if (!kurulumSeridi && !bildirimSeridi) return null;

  const tur = kurulumSeridi ? "kurulum" : "bildirim";

  function kapat() {
    try {
      localStorage.setItem(anahtar(tur), String(Date.now()));
    } catch {
      // Hatırlanmasa da bu açılışta kapanır.
    }
    setKapatilan((onceki) => ({ ...onceki, [tur]: true }));
  }

  async function ekle() {
    if (kurulum?.tekDokunus && (await yukle()) !== "yok") return;
    kurulumGoster();
  }

  return (
    <aside className="b-serit-davet" aria-label={kurulumSeridi ? "Ana ekrana ekle" : "Bildirimler"}>
      <span className="b-serit-davet-ikon">
        <Ikon ad={kurulumSeridi ? "telefon" : "zil"} />
      </span>
      <p>
        <b>{kurulumSeridi ? "Balım'ı telefonuna ekle" : "Bildirimleri aç"}</b>
        <span>
          {kurulumSeridi
            ? "Ana ekrandan tek dokunuşla açılır, bildirim alabilirsin."
            : "Yeni mesaj ve değişikliklerden anında haberin olsun."}
        </span>
      </p>
      <button type="button" className="b-dugme b-dugme-ana" onClick={kurulumSeridi ? ekle : bildirimAyarlariniAc}>
        {kurulumSeridi ? "Ana ekrana ekle" : "Aç"}
      </button>
      <button type="button" className="b-dugme b-dugme-ikon b-dugme-sade" onClick={kapat} aria-label="Şimdilik kapat">
        <Ikon ad="kapat" />
      </button>
    </aside>
  );
}
