import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Balım Cafe ve Ev Lezzetleri logosu, şeffaf (BalimKafe-tutar/tasarim/logo/balim-logo.svg'den üretildi); derlemede bir kez okunur.
export const logoAdresi = `data:image/png;base64,${readFileSync(join(process.cwd(), "app/balim/logo-seffaf.png")).toString("base64")}`;

export const svgAdresi = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const KREM = "#fefdf5";

/**
 * Ana ekran simgesi: krem zemin kenara kadar dolu, logo ortada. Logo yuvarlağa
 * yakın bir bütün; Android'in dairesel maskesi kenarın %10'unu kırpar, iOS da
 * köşeleri kendisi yuvarlar. "Maskable" kullanılacak boyutta (512) oran 0,74
 * ile logo güvenli dairenin içinde kalır; yalnız "any" olanlarda daha büyüğü
 * seçilebilir.
 */
export function balimIkonu(boyut: number, oran = 0.74) {
  const logo = Math.round(boyut * oran);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: KREM
        }}
      >
        <img src={logoAdresi} alt="" width={logo} height={logo} />
      </div>
    ),
    { width: boyut, height: boyut }
  );
}
