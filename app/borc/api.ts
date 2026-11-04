import type { DurumGirdisi, DuzenliGelirGirdisi, GelirGirdisi, IslemGirdisi, Oturum, Veri } from "./ortak";

/** Sunucunun Türkçe hata mesajını taşır; `durum` 401 ise oturum kapanmıştır. */
export class ApiHatasi extends Error {
  constructor(
    message: string,
    readonly durum: number
  ) {
    super(message);
  }
}

async function istek<T>(yol: string, secenek: RequestInit = {}): Promise<T> {
  let yanit: Response;
  try {
    // no-store: bu yanıtlar HİÇBİR yerde (tarayıcı önbelleği, ara katman) saklanmamalı.
    yanit = await fetch(`/api/borc/${yol}`, { credentials: "same-origin", cache: "no-store", ...secenek });
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

type VeriYaniti = { veri: Veri };

export const api = {
  giris: (kullaniciAdi: string, sifre: string) => istek<{ ok: true }>("giris", jsonIle("POST", { kullaniciAdi, sifre })),
  cikis: () => istek<{ ok: true }>("cikis", jsonIle("POST", {})),
  veri: () => istek<VeriYaniti & { kullanici: Oturum }>("veri"),

  /** Her yazma güncel verinin tamamını döner. */
  islemEkle: (g: IslemGirdisi) => istek<VeriYaniti>("islemler", jsonIle("POST", g)).then((c) => c.veri),
  islemGuncelle: (id: number, g: IslemGirdisi) => istek<VeriYaniti>(`islemler/${id}`, jsonIle("PUT", g)).then((c) => c.veri),
  islemSil: (id: number) => istek<VeriYaniti>(`islemler/${id}`, jsonIle("DELETE")).then((c) => c.veri),

  durumKaydet: (g: DurumGirdisi) => istek<VeriYaniti>("durum", jsonIle("PUT", g)).then((c) => c.veri),
  durumSil: (id: number) => istek<VeriYaniti>(`durum/${id}`, jsonIle("DELETE")).then((c) => c.veri),

  gelirEkle: (g: GelirGirdisi) => istek<VeriYaniti>("gelirler", jsonIle("POST", g)).then((c) => c.veri),
  gelirGuncelle: (id: number, g: GelirGirdisi) => istek<VeriYaniti>(`gelirler/${id}`, jsonIle("PUT", g)).then((c) => c.veri),
  gelirSil: (id: number) => istek<VeriYaniti>(`gelirler/${id}`, jsonIle("DELETE")).then((c) => c.veri),
  duzenliEkle: (g: DuzenliGelirGirdisi) => istek<VeriYaniti>("duzenli-gelirler", jsonIle("POST", g)).then((c) => c.veri),
  duzenliGuncelle: (id: number, g: DuzenliGelirGirdisi) => istek<VeriYaniti>(`duzenli-gelirler/${id}`, jsonIle("PUT", g)).then((c) => c.veri),
  duzenliSil: (id: number) => istek<VeriYaniti>(`duzenli-gelirler/${id}`, jsonIle("DELETE")).then((c) => c.veri),
  kurGuncelle: (usdTry: number) => istek<VeriYaniti>("kur", jsonIle("PUT", { usdTry })).then((c) => c.veri)
};
