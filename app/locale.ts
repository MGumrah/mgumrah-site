export type Locale = "tr" | "en";

/** Derive the active locale from a Next.js pathname (defaults to Turkish). */
export function localeFromPath(pathname: string): Locale {
  return pathname.startsWith("/en") ? "en" : "tr";
}
