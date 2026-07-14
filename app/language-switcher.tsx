"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localeFromPath } from "./locale";

function getLanguageLinks(pathname: string) {
  if (pathname.includes("/apps/teknosales/support")) {
    return {
      tr: "/tr/apps/teknosales/support/",
      en: "/en/apps/teknosales/support/"
    };
  }

  if (pathname.includes("/apps/teknosales/privacy")) {
    return {
      tr: "/tr/apps/teknosales/privacy/",
      en: "/en/apps/teknosales/privacy/"
    };
  }

  if (pathname.includes("/apps/teknosales")) {
    return {
      tr: "/tr/apps/teknosales/",
      en: "/en/apps/teknosales/"
    };
  }

  if (pathname.includes("/apps")) {
    return {
      tr: "/tr/apps/",
      en: "/en/apps/"
    };
  }

  return {
    tr: "/tr/",
    en: "/en/"
  };
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const links = getLanguageLinks(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isEnglish = localeFromPath(pathname) === "en";

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  return (
    <div className="lang-wrap" ref={wrapRef}>
      <button
        className="icon-btn lang-btn"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isEnglish ? "EN" : "TR"}
      </button>
      {isOpen ? (
        <div className="lang-menu" role="menu">
          <Link
            className={isEnglish ? "" : "is-active"}
            href={links.tr}
            onClick={() => setIsOpen(false)}
          >
            Türkçe
          </Link>
          <Link
            className={isEnglish ? "is-active" : ""}
            href={links.en}
            onClick={() => setIsOpen(false)}
          >
            English
          </Link>
        </div>
      ) : null}
    </div>
  );
}
