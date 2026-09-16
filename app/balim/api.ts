import type { Kisi, Veri } from "./ortak";

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

export const api = {
  kisiler: () => istek<{ kisiler: Kisi[] }>("kisiler").then((c) => c.kisiler),
  giris: (kullaniciAdi: string, sifre: string) => istek<{ ok: true }>("giris", jsonIle("POST", { kullaniciAdi, sifre })),
  cikis: () => istek<{ ok: true }>("cikis", { method: "POST" }),
  veri: () => istek<{ veri: Veri }>("veri").then((c) => c.veri),
  surum: () => istek<{ surum: number }>("surum").then((c) => c.surum),
  /** Her yazma işlemi güncel verinin tamamını döner. */
  yaz: (yol: string, yontem: "POST" | "PATCH" | "PUT" | "DELETE", govde?: unknown) =>
    istek<{ veri: Veri }>(yol, govde === undefined ? { method: yontem } : jsonIle(yontem, govde)).then((c) => c.veri),
  gorselYukle: (form: FormData) =>
    istek<{ veri: Veri }>("gorseller", { method: "POST", body: form }).then((c) => c.veri)
};

export const gorselAdresi = (id: string, kucuk = false) => `/api/balim/gorseller/${id}${kucuk ? "?boyut=kucuk" : ""}`;
