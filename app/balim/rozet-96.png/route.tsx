import { ImageResponse } from "next/og";
import { LOGO_DAMLA, LOGO_PETEK } from "../ikonlar";
import { svgAdresi } from "../ikon";

export const dynamic = "force-static";

/**
 * Android durum çubuğundaki bildirim rozeti. Android bu resmin yalnızca saydam
 * olmayan piksellerini alıp beyaza boyar; renk taşımaz. Petek dolu, damla
 * oyuk: tek renkte de logo olarak okunsun.
 */
export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill-rule="evenodd" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round" d="${LOGO_PETEK} ${LOGO_DAMLA}"/></svg>`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={svgAdresi(svg)} alt="" width={84} height={84} />
      </div>
    ),
    { width: 96, height: 96 }
  );
}
