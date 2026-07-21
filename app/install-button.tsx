"use client";

import { usePlatform } from "./use-platform";
import { links } from "./site-config";
import { ArrowIcon } from "./icons";
import { StoreBadge } from "./store-badges";
import type { Locale } from "./locale";

const STORE_URLS = {
  ios: links.appStore,
  android: links.playStore,
  windows: links.microsoftStore
} as const;

/**
 * One button that sends each visitor to the right store: App Store on iOS,
 * Google Play on Android, Microsoft Store on Windows.
 *
 * The static HTML always ships a real link to `fallbackHref` — the download
 * page, which lists every option — so this works with JavaScript disabled, for
 * crawlers, and for anything detection cannot place (macOS, Linux). Hydration
 * only *upgrades* the href; it never turns the link into a button.
 *
 * Once a store is known the label becomes that store's official badge, which is
 * what each store's brand guidelines require. The neutral state is sized to
 * match the badge so swapping one in doesn't shift the page.
 *
 * No target="_blank": store URLs deep-link into the native store app on mobile,
 * and opening a new tab breaks that hand-off.
 */
export function InstallButton({
  locale,
  neutralLabel,
  fallbackHref
}: {
  locale: Locale;
  neutralLabel: string;
  fallbackHref: string;
}) {
  const platform = usePlatform();
  const store = platform && platform !== "other" ? platform : null;

  if (!store) {
    return (
      <a className="install-cta is-neutral" href={fallbackHref}>
        {neutralLabel}
        <ArrowIcon />
      </a>
    );
  }

  return (
    <a className="install-cta is-badge" href={STORE_URLS[store]}>
      <StoreBadge platform={store} locale={locale} />
    </a>
  );
}
