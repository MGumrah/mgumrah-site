"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function HtmlLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = pathname?.startsWith("/en") ? "en" : "tr";
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [pathname]);

  return null;
}
