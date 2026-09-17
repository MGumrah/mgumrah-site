// Balım service worker — yalnızca bildirimler için.
//
// Sayfa önbelleğe ALINMIYOR, fetch dinlenmiyor: panel dört kişinin anlık
// verisini gösteriyor ve önbellekten gelen eski bir liste, hiç açılmayan bir
// sayfadan daha zararlı. Tarayıcı push olayını yalnızca bir service worker'a
// teslim ettiği için bu dosya var.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (olay) => olay.waitUntil(self.clients.claim()));

self.addEventListener("push", (olay) => {
  let veri;
  try {
    veri = olay.data ? olay.data.json() : {};
  } catch {
    // Çözülemese de görünür bir bildirim şart: `userVisibleOnly` sözleşmesini
    // bozan siteden tarayıcı önce uyarıp sonra izni geri alıyor.
    veri = {};
  }

  olay.waitUntil(
    self.registration.showNotification(veri.baslik || "Balım", {
      body: veri.govde || "Panelde yeni bir şey var.",
      icon: "/balim/ikon-192.png",
      // Android durum çubuğundaki tek renk simge; yoksa bildirim Chrome'dan geliyormuş gibi görünür.
      badge: "/balim/rozet-96.png",
      tag: veri.etiket || undefined,
      // Aynı etiketli yeni bildirim eskisinin yerine geçer; değişiklik akışı
      // yeniden titretmesin, sohbet titretsin.
      renotify: Boolean(veri.etiket) && !veri.sessiz,
      lang: "tr",
      data: { adres: typeof veri.adres === "string" ? veri.adres : "/balim/" }
    })
  );
});

self.addEventListener("notificationclick", (olay) => {
  olay.notification.close();

  // Yalnızca /balim/ altındaki yollar: gövdeyi ele geçiren biri bildirimi
  // başka bir siteye açılan bir tuzağa çeviremesin.
  const ham = olay.notification.data && olay.notification.data.adres;
  const adres = typeof ham === "string" && ham.startsWith("/balim/") ? ham : "/balim/";
  const hedef = new URL(adres, self.location.origin).href;
  const sekme = new URL(hedef).hash.slice(1);

  olay.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((pencereler) => {
      // Panel zaten açıksa yeni pencere açılmaz: öne alınır, sekmesi değişir.
      const acik = pencereler.find((p) => new URL(p.url).pathname.startsWith("/balim"));
      if (acik) {
        acik.postMessage({ tur: "git", sekme });
        return acik.focus();
      }
      return self.clients.openWindow(hedef);
    })
  );
});

// Tarayıcı aboneliği kendiliğinden yenilediğinde (anahtar süresi, servis
// değişikliği) sunucudaki kaydı da güncelle; yoksa bildirimler sessizce kesilir.
self.addEventListener("pushsubscriptionchange", (olay) => {
  olay.waitUntil(
    (async () => {
      const eski = olay.oldSubscription;
      const yeni =
        olay.newSubscription ||
        (eski ? await self.registration.pushManager.subscribe(eski.options) : null);
      if (!yeni) return;
      await fetch("/api/balim/bildirim", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ abonelik: yeni.toJSON() })
      });
      if (eski && eski.endpoint !== yeni.endpoint) {
        await fetch("/api/balim/bildirim", {
          method: "DELETE",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: eski.endpoint })
        });
      }
    })().catch(() => undefined)
  );
});
