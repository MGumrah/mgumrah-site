"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./language-switcher";
import ThemeToggle from "./theme-toggle";
import { GithubIcon, YoutubeIcon } from "./icons";
import { links } from "./site-config";
import { localeFromPath } from "./locale";

const NAV = {
  tr: { appsHref: "/tr/apps/", appsLabel: "Uygulamalar", sitesHref: "/tr/sites/", sitesLabel: "Web Siteleri" },
  en: { appsHref: "/en/apps/", appsLabel: "Apps", sitesHref: "/en/sites/", sitesLabel: "Websites" }
} as const;

export default function MainNav() {
  const pathname = usePathname();
  const nav = NAV[localeFromPath(pathname)];
  const isAppsRoute = pathname.includes("/apps");
  const isSitesRoute = pathname.includes("/sites");

  return (
    <nav className="nav" aria-label="Ana menü">
      <Link className={`nav-link ${isAppsRoute ? "active" : ""}`} href={nav.appsHref}>
        {nav.appsLabel}
      </Link>
      <Link className={`nav-link ${isSitesRoute ? "active" : ""}`} href={nav.sitesHref}>
        {nav.sitesLabel}
      </Link>
      <a className="icon-btn" href={links.github} aria-label="GitHub">
        <GithubIcon />
      </a>
      <a className="icon-btn" href={links.youtube} aria-label="YouTube">
        <YoutubeIcon />
      </a>
      <LanguageSwitcher />
      <ThemeToggle />
    </nav>
  );
}
