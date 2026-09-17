import type { BildirimTercihleri, Kisi, Mesaj, Surum, Veri } from "./ortak";

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
    yanit = await fetch(`/api/balim/${yol}`, { credentials: "same-origin", cache: "no-store", ...secenek });
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

const jsonIle = (method: string, govde: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(govde)
});

export type BildirimKaydi = { acikAnahtar: string | null; kayitli: boolean; tercihler: BildirimTercihleri };

export const api = {
  kisiler: () => istek<{ kisiler: Kisi[] }>("kisiler").then((c) => c.kisiler),
  giris: (kullaniciAdi: string, sifre: string) => istek<{ ok: true }>("giris", jsonIle("POST", { kullaniciAdi, sifre })),
  cikis: () => istek<{ ok: true }>("cikis", { method: "POST" }),
  veri: () => istek<{ veri: Veri }>("veri").then((c) => c.veri),
  surum: () => istek<Surum>("surum"),
  /** Her yazma işlemi güncel verinin tamamını döner. */
  yaz: (yol: string, yontem: "POST" | "PATCH" | "PUT" | "DELETE", govde?: unknown) =>
    istek<{ veri: Veri }>(yol, govde === undefined ? { method: yontem } : jsonIle(yontem, govde)).then((c) => c.veri),
  gorselYukle: (form: FormData) =>
    istek<{ veri: Veri }>("gorseller", { method: "POST", body: form }).then((c) => c.veri),

  /** Son sayfa; `once` ile daha eskisi, `sonra` ile yalnızca yeni gelenler. */
  mesajlar: (secenek: { once?: number; sonra?: number } = {}) => {
    const sorgu = secenek.sonra !== undefined ? `?sonra=${secenek.sonra}` : secenek.once ? `?once=${secenek.once}` : "";
    return istek<{ mesajlar: Mesaj[]; dahaVar: boolean }>(`mesajlar${sorgu}`);
  },
  /** Fotoğraflı mesaj FormData ile, düz metin JSON ile gider. */
  mesajGonder: (icerik: FormData | { metin: string }) =>
    istek<{ mesaj: Mesaj | null }>(
      "mesajlar",
      icerik instanceof FormData ? { method: "POST", body: icerik } : jsonIle("POST", icerik)
    ).then((c) => c.mesaj),
  mesajSil: (id: number) => istek<{ ok: true }>(`mesajlar/${id}`, { method: "DELETE" }),
  okundu: (id: number) => istek<Surum>("mesajlar/okundu", jsonIle("PUT", { id })),

  bildirimDurumu: (endpoint: string | null) => istek<BildirimKaydi>("bildirim/durum", jsonIle("POST", { endpoint })),
  bildirimKaydet: (abonelik: PushSubscriptionJSON, tercihler: BildirimTercihleri) =>
    istek<BildirimKaydi>("bildirim", jsonIle("PUT", { abonelik, tercihler })),
  bildirimSil: (endpoint: string) => istek<{ ok: true }>("bildirim", jsonIle("DELETE", { endpoint })),
  bildirimDene: (endpoint: string) => istek<{ ok: true }>("bildirim/deneme", jsonIle("POST", { endpoint }))
};

export const gorselAdresi = (id: string, kucuk = false) => `/api/balim/gorseller/${id}${kucuk ? "?boyut=kucuk" : ""}`;
