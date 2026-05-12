import type { Metadata } from "next";
import LanguageSwitcher from "./language-switcher";
import ThemeToggle from "./theme-toggle";
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
    <html lang="tr">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <a className="brand" href="/">
              Mehmet Gümrah
            </a>
            <nav className="nav" aria-label="Ana menü">
              <a href="/apps/">Apps</a>
              <a href="https://github.com/MGumrah">GitHub</a>
              <LanguageSwitcher />
              <ThemeToggle />
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
