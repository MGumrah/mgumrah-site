"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLink from "./brand-link";
import MainNav from "./main-nav";
import { hasOwnShell } from "./site-config";

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (hasOwnShell(pathname)) return null;

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="container hdr-inner">
        <BrandLink />
        <MainNav />
      </div>
    </header>
  );
}
