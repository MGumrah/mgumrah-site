import type { Metadata, Viewport } from "next";
import { SITE_URL } from "../site-metadata";
import Uygulama from "./uygulama";
import "./balim.css";

const aciklama = "Balım kafe için alınacaklar, işler, kira ve görseller: ailece tek yerden.";

export const metadata: Metadata = {
  title: { absolute: "Balım" },
  description: aciklama,
  // Ailenin kendi paneli, sitenin bir sayfası değil: dizin dışında, site
  // haritasında yok. /brief ve /civic ile aynı gerekçe.
  robots: { index: false, follow: false },
  alternates: { canonical: "/balim/" },
  manifest: "/balim/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/balim/ikon.svg", type: "image/svg+xml" },
      { url: "/balim/ikon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/balim/ikon-180.png", sizes: "180x180", type: "image/png" }]
  },
  appleWebApp: { capable: true, title: "Balım", statusBarStyle: "default" },
  // Bağlantı aile grubuna WhatsApp'tan atılacak; önizlemede kişisel sitenin
  // kartı değil Balım'ın kendi kartı görünmeli.
  openGraph: {
    title: "Balım",
    description: aciklama,
    url: `${SITE_URL}/balim/`,
    siteName: "Balım",
    locale: "tr_TR",
    type: "website",
    images: [{ url: `${SITE_URL}/balim/og.png`, width: 1200, height: 630, alt: "Balım · Kafe hazırlık planı" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Balım",
    description: aciklama,
    images: [`${SITE_URL}/balim/og.png`]
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ee" },
    { media: "(prefers-color-scheme: dark)", color: "#15110b" }
  ],
  // Ana ekrandan açılınca alt sekme çubuğu iPhone'un ev çizgisinin altında kalmasın.
  viewportFit: "cover",
  // Android'de klavye açılınca sayfa küçülsün: sohbetin yazma kutusu ve
  // alttan açılan pencereler klavyenin arkasında kalmasın.
  interactiveWidget: "resizes-content"
};

/**
 * mgumrah.com/balim — Balım kafenin hazırlık paneli. Aileden dört kişi
 * alınacakları, işleri, kira ödemelerini ve görselleri buradan birlikte takip
 * ediyor. Sayfa statik bir kabuk; veriler worker/balim.ts'ten gelir.
 */
export default function BalimSayfasi() {
  return <Uygulama />;
}
