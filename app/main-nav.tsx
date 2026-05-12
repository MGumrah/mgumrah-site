"use client";

import { usePathname } from "next/navigation";
import LanguageSwitcher from "./language-switcher";
import ThemeToggle from "./theme-toggle";

function getAppsHref(pathname: string) {
  if (pathname.startsWith("/en")) {
    return "/en/apps/";
  }

  return "/tr/apps/";
}

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Ana menü">
      <a href={getAppsHref(pathname)}>Apps</a>
      <a className="icon-link" href="https://github.com/MGumrah" aria-label="GitHub">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.59 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49v-1.73c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.78c0 .27.18.58.69.48A10.1 10.1 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z"
          />
        </svg>
      </a>
      <LanguageSwitcher />
      <ThemeToggle />
    </nav>
  );
}
