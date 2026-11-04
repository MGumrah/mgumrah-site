import type { Metadata, Viewport } from "next";
import Uygulama from "./uygulama";
import "./borc.css";

// Kişisel panel: dizin dışında, site haritasında yok, bağlantı önizlemesi yok
// (openGraph bilerek verilmedi — paylaşılan bir bağlantıda bile bu sayfanın
// ne olduğu görünmesin). Sayfanın kendisi statik bir kabuk; HİÇBİR rakam
// içermez, hepsi oturum açıldıktan sonra worker/borc.ts'ten gelir.
export const metadata: Metadata = {
  title: { absolute: "Borç takibi" },
  description: "Kişisel panel.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/borc/" },
  manifest: "/borc/manifest.webmanifest",
  icons: { icon: [{ url: "/borc/ikon.svg", type: "image/svg+xml" }] },
  appleWebApp: { capable: true, title: "Borç", statusBarStyle: "black-translucent" },
  referrer: "no-referrer"
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1316" }
  ],
  // Ana ekrandan açılınca alt sekme çubuğu iPhone'un ev çizgisinin altında kalmasın.
  viewportFit: "cover",
  // Android'de klavye açılınca sayfa küçülsün: formun gönder düğmesi klavyenin arkasında kalmasın.
  interactiveWidget: "resizes-content"
};

/**
 * mgumrah.com/borc — kredi kartı, KMH ve işyeri borcunun kişisel takibi.
 * Giriş yapılmadan hiçbir veri gösterilmez.
 */
export default function BorcSayfasi() {
  return <Uygulama />;
}
