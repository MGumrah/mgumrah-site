import { ImageResponse } from "next/og";
import { logoAdresi } from "../ikon";

export const dynamic = "force-static";

/**
 * mgumrah.com/balim WhatsApp'a yapıştırılınca çıkan kart. /portal'ın kartı gibi
 * elle yazılmış bir route: opengraph-image kuralı dosyayı uzantısız üretiyor,
 * o zaman da sunucu PNG olduğunu bilemiyor (bkz. app/portal/og.png/route.tsx).
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "80px 96px",
          background: "#faf6ee",
          color: "#2a1d10"
        }}
      >
        <img src={logoAdresi} alt="" width={340} height={340} style={{ flexShrink: 0 }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, lineHeight: 1, letterSpacing: -4 }}>Balım</div>
          <div style={{ fontSize: 44, marginTop: 20, color: "#5a4632" }}>Kafe hazırlık planı</div>
          <div style={{ fontSize: 30, marginTop: 36, color: "#8a7359" }}>Alınacaklar · İşler · Kira · Görseller</div>
          <div style={{ fontSize: 30, marginTop: 14, color: "#9a5f00" }}>mgumrah.com/balim</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
