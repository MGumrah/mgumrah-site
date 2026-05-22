import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import HtmlLangSync from "./html-lang-sync";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mgumrah.com"),
  title: {
    default: "Mehmet Gümrah",
    template: "%s | Mehmet Gümrah"
  },
  description: "Mehmet Gümrah kişisel website ve uygulama dokümantasyon merkezi."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = window.localStorage.getItem("theme");
                const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                document.documentElement.dataset.theme = savedTheme || preferredTheme;
              } catch {
                document.documentElement.dataset.theme = "light";
              }
              try {
                document.documentElement.lang = window.location.pathname.startsWith("/en") ? "en" : "tr";
              } catch {}
            `
          }}
        />
      </head>
      <body>
        <HtmlLangSync />
        <div className="site-shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
