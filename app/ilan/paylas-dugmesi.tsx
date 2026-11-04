"use client";

import { useState } from "react";

/**
 * Telefonda paylaşım menüsünü açar (WhatsApp oradan seçilir); paylaşım menüsü
 * olmayan tarayıcıda adresi panoya kopyalar.
 */
export default function PaylasDugmesi({ baslik }: { baslik: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);

  async function paylas() {
    const url = window.location.href.split("#")[0];

    if (navigator.share) {
      try {
        await navigator.share({ title: baslik, url });
      } catch {
        // Kullanıcı menüyü kapattı; yapılacak bir şey yok.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setKopyalandi(true);
      window.setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      window.prompt("Bağlantıyı kopyalayın:", url);
    }
  }

  return (
    <button type="button" className="btn ilan-paylas" onClick={paylas}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      <span aria-live="polite">{kopyalandi ? "Bağlantı kopyalandı" : "Paylaş"}</span>
    </button>
  );
}
