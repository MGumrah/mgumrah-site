"use client";

import { useEffect } from "react";

export default function LocaleRedirectPage() {
  useEffect(() => {
    const language = navigator.language.toLowerCase();
    const target = language.startsWith("tr") ? "/tr/" : "/en/";
    window.location.replace(target);
  }, []);

  return (
    <main className="hero">
      <section className="hero-inner" aria-label="Language redirect">
        <p className="eyebrow">Mehmet Gümrah</p>
        <h1>Loading</h1>
        <p className="summary">Selecting language...</p>
      </section>
    </main>
  );
}
