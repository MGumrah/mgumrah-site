"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ApiHatasi, type BorcApi } from "./api";
import type { Hesap, Islem, Veri } from "./ortak";

/** Panelin üstüne açılan pencereler; ekranlar `ac(...)` ile ister, panel çizer. */
export type PencereIstegi =
  | { tur: "ekle"; sekme: "harcama" | "durum" | "gelir"; hesapId?: number }
  | { tur: "islem"; islem: Islem }
  | { tur: "hesap"; hesap?: Hesap }
  | { tur: "hesapDetay"; hesapId: number };

/** İki yerde (kişisel /borc ve Balım) aynı ekranlar çalışır; yalnızca söz dağarcığı değişir. */
export type Metinler = {
  /** "Diğer" türündeki hesapların bölüm başlığı. */
  diger: string;
  digerAciklama: string;
  /** Gelir formlarındaki örnek adlar. */
  gelirOrnek: string;
  duzenliOrnek: string;
  duzenliAciklama: string;
};

export const KISISEL_METINLER: Metinler = {
  diger: "Diğer borçlar",
  digerAciklama: "kişi / işyeri borçları; toplamda bir kez sayılır",
  gelirOrnek: "Ekim maaşı",
  duzenliOrnek: "Maaş",
  duzenliAciklama: "Her ay tekrar eden gelirleriniz (maaş, kira, ek iş…). Gelirler sekmesine otomatik eklenir; toplam aylık gelir ve borç/gelir oranı bunlardan hesaplanır."
};

export const ISLETME_METINLER: Metinler = {
  diger: "Tedarikçi ve diğer borçlar",
  digerAciklama: "tedarikçi, ortak ve kişi borçları; toplamda bir kez sayılır",
  gelirOrnek: "Müşteri ödemesi",
  duzenliOrnek: "Kira geliri",
  duzenliAciklama: "Her ay tekrar eden düzenli gelirler (sözleşme, kira, abonelik…). Gelirler sekmesine otomatik eklenir; toplam aylık gelir ve borç/gelir oranı bunlardan hesaplanır."
};

export type BorcBaglami = {
  api: BorcApi;
  veri: Veri;
  /** İstanbul takvimindeki bugün, "YYYY-MM-DD". */
  bugun: string;
  /** Yazma yanıtıyla gelen güncel veriyi ekrana koyar. */
  guncelle: (veri: Veri) => void;
  bildir: (mesaj: string) => void;
  /** Panel içinde başka ekrana geç: "pano", "aylar/2026-11". */
  git: (yol: string) => void;
  yol: string;
  ac: (istek: PencereIstegi) => void;
  /** Hata mesajını döner; oturum/yetki sorunuysa ayrıca sahibine (host) haber verir. */
  hataMesaji: (hata: unknown, varsayilan?: string) => string;
  metin: Metinler;
};

export const Baglam = createContext<BorcBaglami | null>(null);

export function useBorc(): BorcBaglami {
  const baglam = useContext(Baglam);
  if (!baglam) throw new Error("useBorc yalnızca borç panelinin içinde kullanılabilir.");
  return baglam;
}

/**
 * Yazma işlemi çalıştırır: sunucudan dönen güncel veriyi ekrana koyar, kısa mesaj verir, hatayı gösterir.
 * `calisiyor` hangi işlemin sürdüğünü (düğmeyi kilitlemek için) söyler.
 */
export function useIs() {
  const { guncelle, bildir, hataMesaji } = useBorc();
  const [calisiyor, setCalisiyor] = useState<string | null>(null);

  const calistir = useCallback(
    async (anahtar: string, is: () => Promise<Veri>, mesaj: string): Promise<boolean> => {
      setCalisiyor(anahtar);
      try {
        guncelle(await is());
        bildir(mesaj);
        return true;
      } catch (e) {
        bildir(hataMesaji(e, "İşlem yapılamadı"));
        return false;
      } finally {
        setCalisiyor(null);
      }
    },
    [guncelle, bildir, hataMesaji]
  );

  return { calisiyor, calistir };
}

/** Formlar için: gönderme durumu ve hata satırı; başarıda `kaydedildi(veri, mesaj)` çağrılır. */
export function useGonder(kaydedildi: (veri: Veri, mesaj: string) => void) {
  const { hataMesaji } = useBorc();
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  async function gonder(is: () => Promise<Veri>, mesaj: string) {
    setBekliyor(true);
    setHata(null);
    try {
      kaydedildi(await is(), mesaj);
    } catch (e) {
      setHata(hataMesaji(e, "Kaydedilemedi. Tekrar deneyin."));
      setBekliyor(false);
    }
  }
  return { hata, setHata, bekliyor, gonder };
}

export const hataMetni = (e: unknown, varsayilan: string) => (e instanceof ApiHatasi ? e.message : varsayilan);
