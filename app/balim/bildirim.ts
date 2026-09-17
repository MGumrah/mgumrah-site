"use client";

/**
 * Tarayıcı tarafındaki bildirim işleri: service worker kaydı ve push
 * aboneliği. sevcanhome-site/src/lib/push-client.ts'ten taşındı; oradaki her
 * kural sahada yaşanmış bir arızadan çıktı (açıklamalar aşağıda).
 */

import { iosMu, uygulamaIcinde } from "./kurulum";

const SW_ADRESI = "/balim/sw.js";

export function b64urlBayt(deger: string): Uint8Array<ArrayBuffer> {
  const b64 = deger.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (deger.length % 4)) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Sayfa açılışında bir kez; tekrar çağrılması zararsız. Fetch dinlemeyen bir SW: önbellek yok. */
export function swKaydet() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register(SW_ADRESI, { scope: "/balim/" }).catch(() => undefined);
}

export type PushDestegi =
  /** Abone olunabilir. */
  | "var"
  /** Tarayıcı desteklemiyor. */
  | "yok"
  /** iPhone/iPad: önce ana ekrana eklenmeli (Safari 16.4+). */
  | "ios-kurulum"
  /** Kullanıcı reddetmiş; tarayıcı bir daha sormaya izin vermez. */
  | "engelli";

export function pushDestegi(): PushDestegi {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    // iOS'ta desteğin yokluğu "hiç olmayacak" değil, "önce ana ekrana ekle" demek.
    return iosMu() && !uygulamaIcinde() ? "ios-kurulum" : "yok";
  }
  if (iosMu() && !uygulamaIcinde()) return "ios-kurulum";
  return Notification.permission === "denied" ? "engelli" : "var";
}

/**
 * `serviceWorker.ready` hiç reddetmez: kayıt başarısızsa sonsuza kadar bekler
 * ve düğme "açılıyor…"da takılı kalırdı. Zaman aşımlı bekleniyor.
 */
async function hazirSw(sinirMs = 10_000): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((coz) => setTimeout(() => coz(null), sinirMs))
  ]);
}

export async function mevcutAbonelik(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const kayit = await hazirSw(4000);
  return kayit ? kayit.pushManager.getSubscription() : null;
}

export type AboneOlSonucu =
  | { ok: true; abonelik: PushSubscription }
  | { ok: false; sebep: "izin-yok" | "engelli" | "sw-yok" | "push-servisi" | "ios-kurulum" | "hata"; detay?: string };

/** FCM kaydı kısıtlı Wi-Fi'de (5228-5230 portları kapalı) tam bu hatayla düşüyor; mobil veri o katmanı atlıyor. */
export const PUSH_SERVISI_MESAJI =
  "Telefonun bildirim servisi kayıt yapamadı. Wi-Fi yerine mobil veriyle deneyin; olmazsa telefonu yeniden başlatıp tekrar deneyin.";

/**
 * İzin ister ve abone olur. Yalnızca bir dokunuşun içinden çağrılmalı:
 * kendiliğinden çıkan izin kutusu çoğunlukla reddediliyor ve tarayıcılar reddi
 * kalıcı sayıyor. requestPermission bu yüzden ilk ifade; önüne bir await
 * girerse iOS dokunuşu tüketilmiş sayıp çağrıyı sessizce reddediyor.
 */
export async function aboneOl(acikAnahtar: string): Promise<AboneOlSonucu> {
  try {
    const izin = await Notification.requestPermission();
    if (izin === "denied") return { ok: false, sebep: "engelli" };
    if (izin !== "granted") return { ok: false, sebep: "izin-yok" };

    const kayit = await hazirSw();
    if (!kayit) return { ok: false, sebep: "sw-yok" };

    // Mevcut abonelik yeniden kullanılır: subscribe'ı ikinci kez çağırmak hata veriyor.
    const abonelik =
      (await kayit.pushManager.getSubscription()) ??
      (await kayit.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64urlBayt(acikAnahtar) }));
    return { ok: true, abonelik };
  } catch (hata) {
    if (iosMu() && !uygulamaIcinde()) return { ok: false, sebep: "ios-kurulum" };
    const e = hata as { name?: string; message?: string };
    const detay = [e?.name, e?.message].filter(Boolean).join(": ").slice(0, 160);
    if (e?.name === "AbortError" || /push service error|Registration failed/i.test(e?.message ?? "")) {
      return { ok: false, sebep: "push-servisi", detay };
    }
    return { ok: false, sebep: "hata", detay: detay || "bilinmeyen hata" };
  }
}
