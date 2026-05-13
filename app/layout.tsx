import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import MainNav from "./main-nav";
import "./globals.css";

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
    <html lang="tr" suppressHydrationWarning>
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
            `
          }}
        />
      </head>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/">
              Mehmet Gümrah
            </Link>
            <MainNav />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
