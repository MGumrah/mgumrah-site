"use client";

import { useEffect, useState } from "react";

/**
 * "Ana ekrana ekle" durumu. Chrome'un yükleme isteği (beforeinstallprompt)
 * sayfa açılır açılmaz gelir, düğmenin görüneceği andan çok önce; modül
 * yüklenirken dinlenip saklanıyor. Chrome'un kendi yükleme çubuğu
 * engellenmiyor, o da ayrıca çıkabilir.
 */

type KurulumIstegi = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const KURULDU = "balim:kuruldu";

let istek: KurulumIstegi | null = null;
const dinleyiciler = new Set<() => void>();
const haberVer = () => dinleyiciler.forEach((dinleyici) => dinleyici());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    istek = e as KurulumIstegi;
    haberVer();
  });
  window.addEventListener("appinstalled", () => {
    istek = null;
    try {
      localStorage.setItem(KURULDU, "1");
    } catch {
      // Hatırlanmasa da olur: yalnızca tarayıcı sekmesindeki düğmeyi gizliyor.
    }
    haberVer();
  });
}

/** Ana ekrandan (tarayıcı çubuğu olmadan) mı açıldı. */
export function uygulamaIcinde() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iPadOS kendini Mac diye tanıtıyor; dokunma noktası ayırıyor. */
export function iosMu() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export type Kurulum = {
  /** Şu an ana ekrandan açılmış. */
  uygulamada: boolean;
  /** Bu tarayıcıda daha önce yüklendi (Chrome haber verdi). */
  yuklendi: boolean;
  /** Tek dokunuşla yükleme penceresi açılabiliyor (Android Chrome, masaüstü Chrome/Edge). */
  tekDokunus: boolean;
  ios: boolean;
  /** Telefon ya da tablet. */
  mobil: boolean;
};

function oku(): Kurulum {
  let yuklendi = false;
  try {
    yuklendi = localStorage.getItem(KURULDU) === "1";
  } catch {
    // Gizli sekme: bilinmiyor say.
  }
  return {
    uygulamada: uygulamaIcinde(),
    yuklendi,
    tekDokunus: istek !== null,
    ios: iosMu(),
    mobil: iosMu() || /Android/i.test(navigator.userAgent)
  };
}

/** Sunucuda ve ilk çizimde null: statik HTML ile istemci aynı başlasın. */
export function useKurulum(): Kurulum | null {
  const [durum, setDurum] = useState<Kurulum | null>(null);
  useEffect(() => {
    const guncelle = () => setDurum(oku());
    guncelle();
    dinleyiciler.add(guncelle);
    const sorgu = window.matchMedia("(display-mode: standalone)");
    sorgu.addEventListener?.("change", guncelle);
    return () => {
      dinleyiciler.delete(guncelle);
      sorgu.removeEventListener?.("change", guncelle);
    };
  }, []);
  return durum;
}

/** Chrome'un yükleme penceresini açar. İstek yoksa "yok": çağıran yönergeyi gösterir. */
export async function yukle(): Promise<"kabul" | "ret" | "yok"> {
  const bekleyen = istek;
  if (!bekleyen) return "yok";
  await bekleyen.prompt();
  const secim = await bekleyen.userChoice;
  istek = null;
  haberVer();
  return secim.outcome === "accepted" ? "kabul" : "ret";
}
