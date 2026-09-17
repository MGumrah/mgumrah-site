"use client";

import { createContext, useContext } from "react";
import type { Kisi, Veri } from "./ortak";

export type SekmeId = "ozet" | "alinacaklar" | "yapilacaklar" | "sohbet" | "giderler" | "gorseller" | "hesap";

export type IslemSecenekleri = {
  /** İş bitince alttan çıkan kısa mesaj. */
  basari?: string;
  /** Hatayı bildirim olarak gösterme; çağıran (çoğunlukla bir form) kendisi gösterecek. */
  sessiz?: boolean;
};

export type BalimBaglami = {
  veri: Veri;
  kisi: (id: number | null | undefined) => Kisi | undefined;
  /**
   * Sunucuya yazar ve dönen güncel veriyi ekrana uygular. Başarıda null, hatada
   * kullanıcıya gösterilecek mesajı döner.
   */
  islem: (is: () => Promise<Veri>, secenek?: IslemSecenekleri) => Promise<string | null>;
  /** Yanıtı beklemeden ekranı değiştirir. İstek başarısız olursa veri sunucudan yeniden çekilir. */
  iyimser: (degistir: (veri: Veri) => Veri) => void;
  bildir: (mesaj: string, tur?: "bilgi" | "hata") => void;
  cikisYapildi: () => void;
  /** Veriyi sunucudan yeniden çeker (örneğin sohbete fotoğraf düşünce Görseller için). */
  yenile: () => void;
  /** En son sohbet mesajının id'si; Sohbet sekmesi bu artınca yenilerini çeker. */
  mesajSurum: number;
  okunmamis: number;
  /** Bu kişinin bu id'ye kadarki mesajları gördüğünü sunucuya yazar. */
  okunduIsaretle: (id: number) => void;
  bildirimAyarlariniAc: () => void;
};

export const Baglam = createContext<BalimBaglami | null>(null);

export function useBalim() {
  const baglam = useContext(Baglam);
  if (!baglam) throw new Error("useBalim yalnızca Balım uygulamasının içinde kullanılabilir.");
  return baglam;
}
