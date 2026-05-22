import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var p=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t||p;}catch(e){document.documentElement.dataset.theme="light";}try{document.documentElement.lang=location.pathname.indexOf("/en")===0?"en":"tr";}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable} data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
