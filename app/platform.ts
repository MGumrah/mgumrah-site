/**
 * Client-side platform detection for the single "Install" button.
 *
 * The site is a static export, so there is no server-side User-Agent to read —
 * detection has to happen after hydration. Anything we cannot confidently
 * identify (macOS, Linux, ChromeOS, crawlers) falls back to "other", which
 * routes to the on-site download page listing every option.
 */
export type Platform = "ios" | "android" | "windows" | "other";

type NavigatorUAData = {
  platform?: string;
  mobile?: boolean;
};

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";

  const ua = navigator.userAgent;

  // iOS first: WebKit is the only engine allowed on iOS and it never ships
  // userAgentData, so Chrome and Firefox on iPhone land here too.
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";

  // iPadOS 13+ sends a desktop Macintosh UA. Touch points are what separate an
  // iPad from a real Mac — iPads report 5, Macs report 0 or 1 depending on the
  // browser, so the threshold has to be `> 1` rather than `> 0`.
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";

  // Chromium's structured hint is preferred over the UA string because
  // "Request desktop site" does not rewrite it. Only the synchronous
  // low-entropy field is used; getHighEntropyValues() is async and would make
  // this detector return a promise for no added value here.
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  switch (uaData?.platform) {
    case "Android":
      return "android";
    case "Windows":
      return "windows";
    default:
      // macOS / Linux / ChromeOS / unknown fall through for a second chance
      // at the UA string rather than short-circuiting to "other".
      break;
  }

  // Safari and Firefox have both declined to implement userAgentData, so the
  // regex path stays load-bearing.
  if (/Android/i.test(ua)) return "android";
  if (/Windows NT/i.test(ua)) return "windows";

  return "other";
}
