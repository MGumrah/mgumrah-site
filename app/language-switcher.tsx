"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localeFromPath } from "./locale";

/**
 * The same page in the other locale. Every route is mirrored under /tr/ and
 * /en/, so swapping the leading segment is enough — no per-route table to keep
 * in sync as pages are added. Anything without a locale prefix (the 404) falls
 * back to the locale home page.
 */
function getLanguageLinks(pathname: string) {
  const rest = pathname.replace(/^\/(tr|en)(?=\/|$)/, "");
  const path = rest === pathname || rest === "" ? "/" : rest;

  return {
    tr: `/tr${path}`,
    en: `/en${path}`
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
