import { ImageResponse } from "next/og";
import { svgAdresi } from "../ikon";

export const dynamic = "force-static";

/**
 * Android durum çubuğundaki bildirim rozeti. Android bu resmin yalnızca saydam
 * olmayan piksellerini alıp beyaza boyar; renk taşımaz. Logonun tamamı bu
 * boyutta okunmaz: çatı, baca ve bal damlası tek renkte logoyu hatırlatır.
 */
const CATI = "M3 15 16 4 29 15";
const BACA = "M21.4 5h3.4v6.8h-3.4Z";
const DAMLA = "M16 14.4c-3 4-4.5 6.4-4.5 8.2a4.5 4.5 0 0 0 9 0c0-1.8-1.5-4.2-4.5-8.2Z";

export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" d="${CATI}"/><path fill="#fff" d="${BACA} ${DAMLA}"/></svg>`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={svgAdresi(svg)} alt="" width={84} height={84} />
      </div>
    ),
    { width: 96, height: 96 }
  );
}
