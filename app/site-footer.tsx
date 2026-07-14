"use client";

import { usePathname } from "next/navigation";
import { links } from "./site-config";
import { localeFromPath } from "./locale";

const copy = {
  tr: {
    rights: "© 2026 MEHMET GÜMRAH",
    build: "DENİZLİ'DE YAPILDI"
  },
  en: {
    rights: "© 2026 MEHMET GUMRAH",
    build: "BUILT IN DENIZLI"
  }
};

export default function SiteFooter() {
  const pathname = usePathname();
  const t = copy[localeFromPath(pathname)];

  return (
    <footer className="site-footer">
      <div className="container ftr-inner">
        <span>{t.rights}</span>
        <span className="ftr-cluster">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GITHUB
          </a>
          <a href={links.youtube} target="_blank" rel="noreferrer">
            YOUTUBE
          </a>
        </span>
        <span>{t.build}</span>
      </div>
    </footer>
  );
}
