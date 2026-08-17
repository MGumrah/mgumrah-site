"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePlatform } from "./use-platform";
import { InstallButton } from "./install-button";
import { portalLinks } from "./site-config";
import type { StoreUrls } from "./install-button";

export const PORTAL_STORE_URLS: StoreUrls = {
  ios: portalLinks.appStore,
  android: portalLinks.playStore,
  windows: portalLinks.microsoftStore
};

/** Where anything we cannot place (macOS, Linux, crawlers) is sent instead. */
export const PORTAL_DOWNLOAD_PATH = "/tr/apps/teknoportal/download/";

/**
 * Set the moment a jump is made, and read by both the inline script and the
 * effect below. Leaving for a store app suspends the browser rather than
 * closing it, so coming back lands on this page again — without the guard the
 * visitor would be thrown straight back out and could never reach the page.
 * sessionStorage, not localStorage: a fresh tab should jump again.
 */
export const PORTAL_JUMP_KEY = "teknoportal-store-jump";

/**
 * Runs while the HTML is still parsing, so the store opens without waiting for
 * React — on a phone over cellular that is the difference between "the link
 * opened the App Store" and a second of branded limbo.
 *
 * Detection is a deliberately narrower copy of detectPlatform(): only the three
 * cases that have a store to open, and no userAgentData branch, since the UA
 * string alone settles all three. Whatever it declines to place is left to the
 * effect below, which sends it to the download page.
 */
const jumpScript = `(function(){try{
if(sessionStorage.getItem(${JSON.stringify(PORTAL_JUMP_KEY)})==="1")return;
var u=navigator.userAgent,t=null;
if(/iPhone|iPad|iPod/i.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1))t=${JSON.stringify(PORTAL_STORE_URLS.ios)};
else if(/Android/i.test(u))t=${JSON.stringify(PORTAL_STORE_URLS.android)};
else if(/Windows NT/i.test(u))t=${JSON.stringify(PORTAL_STORE_URLS.windows)};
if(!t)return;
sessionStorage.setItem(${JSON.stringify(PORTAL_JUMP_KEY)},"1");
location.replace(t);
}catch(e){}})();`;

/**
 * The mgumrah.com/portal landing: sends the visitor to their own store without
 * a second tap. The inline script above handles the three store platforms
 * before React loads; the effect covers what it left — desktop and anything the
 * UA string could not place — and still jumps if the script never ran.
 *
 * What renders is the fallback, not the main path: a manual store button for
 * when the jump is guarded, blocked, or JavaScript is off.
 */
export function PortalRedirect() {
  const platform = usePlatform();

  useEffect(() => {
    if (!platform) return;

    let jumped = false;
    try {
      jumped = sessionStorage.getItem(PORTAL_JUMP_KEY) === "1";
    } catch {
      // Private mode / blocked storage: fall through and jump once per load.
    }
    if (jumped) return;

    try {
      sessionStorage.setItem(PORTAL_JUMP_KEY, "1");
    } catch {
      // Ignored for the same reason.
    }

    const target = platform === "other" ? PORTAL_DOWNLOAD_PATH : PORTAL_STORE_URLS[platform];

    // replace(), not assign(): the short link is a hop, not a destination, and
    // should not sit in history between the store and wherever the visitor came
    // from.
    window.location.replace(target);
  }, [platform]);

  return (
    <main className="doc container">
      <script dangerouslySetInnerHTML={{ __html: jumpScript }} />
      <header className="doc-hdr">
        <div className="app-hero">
          <img
            className="app-tile-icon lg"
            src="/images/teknoportal-icon.png"
            alt="Tekno Portal"
            width={512}
            height={512}
          />
          <div className="meta-stack">
            <span className="kicker">
              <span className="dot" />
              Müşteri portalı
            </span>
            <h1>Tekno Portal</h1>
          </div>
        </div>
        <p className="meta">Cihazınıza uygun mağazaya yönlendiriliyorsunuz…</p>

        <div className="install-row">
          <InstallButton
            locale="tr"
            neutralLabel="Yükle"
            fallbackHref={PORTAL_DOWNLOAD_PATH}
            storeUrls={PORTAL_STORE_URLS}
          />
          <p className="install-hint">Mağaza kendiliğinden açılmazsa bu butona dokunun.</p>
        </div>

        <div className="actions-row">
          <Link className="btn" href={PORTAL_DOWNLOAD_PATH}>
            Tüm indirme seçenekleri
          </Link>
        </div>
      </header>
    </main>
  );
}
