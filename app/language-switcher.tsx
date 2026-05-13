"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  return (
    <div className="language-switcher">
      <button
        className="language-trigger"
        type="button"
        aria-label="Language"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        🌐
      </button>
      {isOpen ? (
        <div className="language-menu" aria-label="Language options">
          <Link href={links.tr} onClick={() => setIsOpen(false)}>
            TR
          </Link>
          <Link href={links.en} onClick={() => setIsOpen(false)}>
            EN
          </Link>
        </div>
      ) : null}
    </div>
  );
}
