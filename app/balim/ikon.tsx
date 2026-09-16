import { ImageResponse } from "next/og";
import { LOGO_DAMLA, LOGO_PETEK } from "./ikonlar";

const PETEK_RENGI = "#3b2612";
const DAMLA_RENGI = "#f5b93f";

/** Logonun kendi renkleriyle SVG'si; ImageResponse'a resim olarak verilir. */
export const logoSvg = (petek: string, damla: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="${LOGO_PETEK}" fill="${petek}" stroke="${petek}" stroke-width="3" stroke-linejoin="round"/><path d="${LOGO_DAMLA}" fill="${damla}"/></svg>`;

export const svgAdresi = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/**
 * Ana ekran simgesi: bal sarısı zemin kenara kadar dolu, logo ortada ve
 * yüzde 56'sında. Android'in dairesel maskesi kenarın %10'unu kırpar, iOS da
 * köşeleri kendisi yuvarlar; logo bu yüzden güvenli dairenin içinde kalıyor ve
 * aynı dosya "maskable" olarak da kullanılabiliyor.
 */
export function balimIkonu(boyut: number) {
  const logo = Math.round(boyut * 0.56);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #f7c95a 0%, #e59a1e 100%)"
        }}
      >
        <img src={svgAdresi(logoSvg(PETEK_RENGI, DAMLA_RENGI))} alt="" width={logo} height={logo} />
      </div>
    ),
    { width: boyut, height: boyut }
  );
}
