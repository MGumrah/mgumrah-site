"use client";

import { usePathname } from "next/navigation";

const copy = {
  tr: {
    rights: "© 2026 Mehmet Gümrah",
    build: "Denizli'de yapıldı"
  },
  en: {
    rights: "© 2026 Mehmet Gümrah",
    build: "Built in Denizli"
  }
};

export default function SiteFooter() {
  const pathname = usePathname();
  const t = pathname.startsWith("/en") ? copy.en : copy.tr;

  return (
    <footer className="site-footer">
      <div className="container ftr-inner">
        <span>{t.rights}</span>
        <span className="ftr-cluster">
          <a href="mailto:support@mgumrah.com">support@mgumrah.com</a>
          <a href="https://github.com/MGumrah" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.youtube.com/@MGumrah" target="_blank" rel="noreferrer">
            YouTube
          </a>
        </span>
        <span>{t.build}</span>
      </div>
    </footer>
  );
}
