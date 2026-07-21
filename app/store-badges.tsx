import type { Locale } from "./locale";

/**
 * Official store badge artwork, served unmodified from public/images/badges.
 *
 * All three stores require their own supplied badge rather than a hand-drawn
 * logo — Apple in particular licenses the Apple mark only as part of the badge,
 * with a 40px minimum height. So these are used as images, at size, instead of
 * inline SVG glyphs.
 *
 * The heights differ per store and locale on purpose. Apple's and Microsoft's
 * SVGs are trimmed to the badge, but the Google Play PNG bakes the required
 * clear space into the canvas — only 67% of the English file's height is badge
 * (77% for Turkish). The values below make every badge read at the same ~44px
 * optical height while keeping each asset untouched.
 */
export type StorePlatform = "ios" | "android" | "windows";

type Badge = {
  src: string;
  /** Set when the store ships a separate variant for dark backgrounds. */
  darkSrc?: string;
  width: number;
  height: number;
  /** Mirrors the text printed on the badge, per each store's guidelines. */
  alt: string;
};

const BADGES: Record<StorePlatform, Record<Locale, Badge>> = {
  ios: {
    tr: {
      src: "/images/badges/apple-black-tr.svg",
      darkSrc: "/images/badges/apple-white-tr.svg",
      width: 166,
      height: 44,
      alt: "App Store'dan İndirin"
    },
    en: {
      src: "/images/badges/apple-black-en.svg",
      darkSrc: "/images/badges/apple-white-en.svg",
      width: 132,
      height: 44,
      alt: "Download on the App Store"
    }
  },
  android: {
    // One asset for both themes: the badge carries its own border.
    tr: { src: "/images/badges/gplay-tr.png", width: 147, height: 57, alt: "Google Play'den indirin" },
    en: { src: "/images/badges/gplay-en.png", width: 168, height: 65, alt: "Get it on Google Play" }
  },
  windows: {
    tr: {
      src: "/images/badges/ms-light-tr.svg",
      darkSrc: "/images/badges/ms-dark-tr.svg",
      width: 180,
      height: 44,
      alt: "Microsoft Store'dan indirin"
    },
    en: {
      src: "/images/badges/ms-light-en.svg",
      darkSrc: "/images/badges/ms-dark-en.svg",
      width: 161,
      height: 44,
      alt: "Download from the Microsoft Store"
    }
  }
};

/**
 * Renders a store's official badge. When the store ships a dark variant both
 * are emitted and CSS shows one — the same is-light/is-dark pattern the phone
 * mockups use, so theme switching needs no JavaScript. Only one is ever
 * displayed, so only one alt text reaches assistive tech.
 */
export function StoreBadge({ platform, locale }: { platform: StorePlatform; locale: Locale }) {
  const badge = BADGES[platform][locale];

  if (!badge.darkSrc) {
    return (
      <img className="store-badge-img" src={badge.src} alt={badge.alt} width={badge.width} height={badge.height} />
    );
  }

  return (
    <>
      <img
        className="store-badge-img is-light"
        src={badge.src}
        alt={badge.alt}
        width={badge.width}
        height={badge.height}
      />
      <img
        className="store-badge-img is-dark"
        src={badge.darkSrc}
        alt={badge.alt}
        width={badge.width}
        height={badge.height}
      />
    </>
  );
}
