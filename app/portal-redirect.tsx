"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePlatform } from "./use-platform";
import { InstallButton } from "./install-button";
import { portalLinks, portalBadgeless, portalAndroidTest } from "./site-config";
import type { StoreUrls } from "./install-button";

/**
 * Windows's stop before the file: the install section on the download page.
 * The recommended build is the direct Setup.exe, which carries no code-signing
 * certificate — so its first run opens SmartScreen's "unknown publisher"
 * screen. Handing someone a 127 MB download and that warning with no warning
 * of our own is how a working installer gets read as malware and deleted.
 */
export const PORTAL_WINDOWS_PATH = "/tr/apps/teknoportal/download/#windows";

export const PORTAL_STORE_URLS: StoreUrls = {
  ios: portalLinks.appStore,
  // The tester group, not Play — neither the listing nor the opt-in page. Both
  // of those refuse an account that is not on the tester list, and the tester
  // list IS the group (site-config: portalAndroidTest.mode === "grup"). So the
  // group is the only Android door that opens for a visitor who has never been
  // here before, which is who the short link is handed to.
  //
  // What it costs: joining the group does not install anything. Play's
  // 12 testers / 14 days counter counts opt-ins, not members, so step 2 — the
  // opt-in page — still has to be taken, and a visitor dropped straight into
  // the group never sees it. The download page's #android-test section is the
  // one place both steps appear in order; PORTAL_DOWNLOAD_PATH below is where
  // anyone who lands back here is sent.
  android: portalAndroidTest.groupUrl,
  // Not the Microsoft Store: that listing is live but ships without card
  // payment and IBAN. The full build is the direct download, and it needs its
  // instructions read first — see PORTAL_WINDOWS_PATH.
  windows: PORTAL_WINDOWS_PATH
};

/** Where anything we cannot place (macOS, Linux, crawlers) is sent instead. */
export const PORTAL_DOWNLOAD_PATH = "/tr/apps/teknoportal/download/";

type JumpPlatform = keyof StoreUrls;

/**
 * Which platforms are dropped straight into a store — the list site-config
 * defers to.
 *
 * Android is on it, and the door it is dropped into is the tester group's page
 * (see PORTAL_STORE_URLS), because that is the only Android door that opens
 * for someone who has never tested before. Play's own pages — listing and
 * opt-in alike — answer a non-member with "not eligible" and never name the
 * group, which leaves the visitor with nowhere to go.
 *
 * ⚠ What that jump CANNOT do is finish the install. Joining the group makes an
 * account a tester; opening the test is a second, separate step, and the group
 * page says nothing about it. An existing tester pays for this too: they are
 * sent to a group they already joined instead of straight into Play. Both are
 * accepted (decision 16.09.2026, revised): a newcomer stuck at "not eligible"
 * has no way forward at all, while everyone else has the "Yükle" button below
 * and the download page's #android-test section, where the two steps appear in
 * order. Taking android off this list sends Android to the download page
 * instead, which is the other defensible answer.
 *
 * Windows stays off for a different reason. Its listing is Portal's own and
 * open to everyone, but it is the lesser build: the Microsoft Store version
 * ships without card payment and IBAN, because those need a company developer
 * account. The full build is the Setup.exe served from R2 — and that one is
 * unsigned, so its first run hits SmartScreen. Neither route survives being
 * jumped into blind: the store would quietly install a build missing the
 * features the visitor came for, and the file would start a 127 MB download
 * ending in a warning nobody prepared them for. So Windows lands on the
 * install section instead, which says both things before anything downloads.
 */
export const PORTAL_JUMP_PLATFORMS: readonly JumpPlatform[] = ["ios", "android"];

/**
 * The inline script's own detection, one test per platform: a deliberately
 * narrower copy of detectPlatform(), with no userAgentData branch since the UA
 * string alone settles all three. Only the entries named above are emitted.
 */
const JUMP_TESTS: Record<JumpPlatform, string> = {
  ios: "/iPhone|iPad|iPod/i.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)",
  android: "/Android/i.test(u)",
  windows: "/Windows NT/i.test(u)"
};

/**
 * Set the moment a jump is made, and read by both the inline script and the
 * effect below. Leaving for a store app suspends the browser rather than
 * closing it, so coming back lands on this page again — without the guard the
 * visitor would be thrown straight back out and could never reach the page.
 * sessionStorage, not localStorage: a fresh tab should jump again.
 */
export const PORTAL_JUMP_KEY = "teknoportal-store-jump";

/**
 * The manual button's badgeless set on THIS page only — site-config's list plus
 * android, because here the Android route ends at a Google Group. A Google Play
 * badge over a link that opens groups.google.com names a store the visitor will
 * not arrive at, the same objection that keeps Windows off the badge.
 *
 * Not folded into portalBadgeless: the download page's Android button scrolls to
 * its own #android-test section, which ends at Play after the two steps it
 * spells out, so the badge still tells the truth there.
 */
const PORTAL_JUMP_BADGELESS = [...portalBadgeless, "android"] as const;

/**
 * Runs while the HTML is still parsing, so the store opens without waiting for
 * React — on a phone over cellular that is the difference between "the link
 * opened the App Store" and a second of branded limbo.
 *
 * Built from PORTAL_JUMP_PLATFORMS, so adding a store to that list is the only
 * edit needed to include it here. Whatever it declines to place is left to the
 * effect below, which sends it to the download page.
 */
const jumpScript = `(function(){try{
if(sessionStorage.getItem(${JSON.stringify(PORTAL_JUMP_KEY)})==="1")return;
var u=navigator.userAgent,t=null;
${PORTAL_JUMP_PLATFORMS.map(
  (p) => `if(${JUMP_TESTS[p]})t=${JSON.stringify(PORTAL_STORE_URLS[p])};`
).join("\nelse ")}
if(!t)return;
sessionStorage.setItem(${JSON.stringify(PORTAL_JUMP_KEY)},"1");
location.replace(t);
}catch(e){}})();`;

/**
 * The mgumrah.com/portal landing: drops a visitor whose store is listed in
 * PORTAL_JUMP_PLATFORMS straight into it — today iPhone/iPad (App Store) and
 * Android (the closed test's Google Group) — and sends everyone else to the
 * download page, where all three routes sit together. Windows goes to the same
 * page but lands on its own section, the Setup.exe instructions, rather than
 * the top of it. The inline script above jumps before React loads; the
 * effect below covers the rest, and still jumps if the script never ran.
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

    const target =
      platform !== "other" && PORTAL_JUMP_PLATFORMS.includes(platform)
        ? PORTAL_STORE_URLS[platform]
        : platform === "windows"
          ? PORTAL_STORE_URLS.windows
          : PORTAL_DOWNLOAD_PATH;

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
        {/* Not "mağazaya": on Windows this page leads to a file, not a store. */}
        <p className="meta">Cihazınıza uygun kuruluma yönlendiriliyorsunuz…</p>

        <div className="install-row">
          <InstallButton
            locale="tr"
            neutralLabel="Yükle"
            fallbackHref={PORTAL_DOWNLOAD_PATH}
            storeUrls={PORTAL_STORE_URLS}
            badgeless={PORTAL_JUMP_BADGELESS}
          />
          <p className="install-hint">Sayfa kendiliğinden ilerlemezse bu butona dokunun.</p>
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
