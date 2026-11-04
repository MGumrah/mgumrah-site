import type { AyarGirdisi, DurumGirdisi, DuzenliGelirGirdisi, GelirGirdisi, HesapGirdisi, IslemGirdisi, Oturum, Veri } from "./ortak";

/** Sunucunun Türkçe hata mesajını taşır; `durum` 401 ise oturum kapanmıştır, 403 ise yetki yoktur. */
export class ApiHatasi extends Error {
  constructor(
    message: string,
    readonly durum: number
  ) {
    super(message);
  }
}

type VeriYaniti = { veri: Veri };

/**
 * Borç panelinin konuştuğu uçlar. İki yerde aynı kod çalışır, yalnızca taban adres değişir:
 *   /api/borc/        → mgumrah.com/borc  (kişisel panel, kendi D1'i, kendi girişi)
 *   /api/balim/borc/  → Balım › Borçlar   (Balım oturumu + kişi başına borç yetkisi)
 */
export function borcApiOlustur(taban: string, surumBildir?: (surum: number) => void) {
  async function istek<T>(yol: string, secenek: RequestInit = {}): Promise<T> {
    let yanit: Response;
    try {
      // no-store: bu yanıtlar HİÇBİR yerde (tarayıcı önbelleği, ara katman) saklanmamalı.
      yanit = await fetch(`${taban}${yol}`, { credentials: "same-origin", cache: "no-store", ...secenek });
    } catch {
      throw new ApiHatasi("İnternet bağlantısı yok gibi görünüyor. Tekrar deneyin.", 0);
    }

    let govde: { ok?: boolean; hata?: string } = {};
    try {
      govde = (await yanit.json()) as typeof govde;
    } catch {
      // Gövde JSON değilse aşağıdaki genel mesaj yeter.
    }
    if (!yanit.ok || govde.ok === false) {
      throw new ApiHatasi(govde.hata ?? "Bir sorun oluştu. Tekrar deneyin.", yanit.status);
    }
    return govde as T;
  }

  const jsonIle = (method: string, govde?: unknown): RequestInit => ({
    method,
    headers: { "content-type": "application/json" },
    body: govde === undefined ? undefined : JSON.stringify(govde)
  });

  /** Her yazma güncel verinin tamamını döner. */
  const yaz = (yol: string, yontem: string, govde?: unknown) =>
    istek<VeriYaniti & { surum?: number }>(yol, jsonIle(yontem, govde)).then((c) => {
      // Balım tarafı her yazma yanıtında yeni borç sürümünü de söyler: kendi yazdığımız değişiklik "başkası değiştirdi" sanılmasın.
      if (typeof c.surum === "number") surumBildir?.(c.surum);
      return c.veri;
    });

  return {
    istek,
    jsonIle,
    veri: () => istek<VeriYaniti & { surum?: number; kullanici?: Oturum }>("veri"),
    /** Başkası borç verisini değiştirdi mi diye tek sayı sorar (yalnızca Balım tarafında var). */
    surum: () => istek<{ surum: number }>("surum").then((c) => c.surum),

    islemEkle: (g: IslemGirdisi) => yaz("islemler", "POST", g),
    islemGuncelle: (id: number, g: IslemGirdisi) => yaz(`islemler/${id}`, "PUT", g),
    islemSil: (id: number) => yaz(`islemler/${id}`, "DELETE"),

    durumKaydet: (g: DurumGirdisi) => yaz("durum", "PUT", g),
    durumSil: (id: number) => yaz(`durum/${id}`, "DELETE"),

    hesapEkle: (g: HesapGirdisi) => yaz("hesaplar", "POST", g),
    hesapGuncelle: (id: number, g: HesapGirdisi) => yaz(`hesaplar/${id}`, "PUT", g),
    hesapSil: (id: number) => yaz(`hesaplar/${id}`, "DELETE"),

    gelirEkle: (g: GelirGirdisi) => yaz("gelirler", "POST", g),
    gelirGuncelle: (id: number, g: GelirGirdisi) => yaz(`gelirler/${id}`, "PUT", g),
    gelirSil: (id: number) => yaz(`gelirler/${id}`, "DELETE"),
    duzenliEkle: (g: DuzenliGelirGirdisi) => yaz("duzenli-gelirler", "POST", g),
    duzenliGuncelle: (id: number, g: DuzenliGelirGirdisi) => yaz(`duzenli-gelirler/${id}`, "PUT", g),
    duzenliSil: (id: number) => yaz(`duzenli-gelirler/${id}`, "DELETE"),

    /** 0 = "kur girilmedi" (dövizli tutarlar TL toplamlarına katılmaz). */
    kurGuncelle: (usdTry: number) => yaz("kur", "PUT", { usdTry }),
    ayarKaydet: (g: AyarGirdisi) => yaz("ayarlar", "PUT", g)
  };
}

export type BorcApi = ReturnType<typeof borcApiOlustur>;

/** mgumrah.com/borc: kendi girişi ve oturumu var. */
const kisisel = borcApiOlustur("/api/borc/");
export const api = {
  ...kisisel,
  giris: (kullaniciAdi: string, sifre: string) => kisisel.istek<{ ok: true }>("giris", kisisel.jsonIle("POST", { kullaniciAdi, sifre })),
  cikis: () => kisisel.istek<{ ok: true }>("cikis", kisisel.jsonIle("POST", {})),
  veri: () => kisisel.istek<VeriYaniti & { kullanici: Oturum }>("veri")
};
