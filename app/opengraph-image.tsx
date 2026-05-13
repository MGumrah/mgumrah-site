import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Mehmet Gümrah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #102a43 0%, #243b53 100%)",
          color: "#f0f4f8",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#5fb3d9",
            fontWeight: 800
          }}
        >
          Kişisel Website
        </div>
        <div
          style={{
            fontSize: 160,
            fontWeight: 800,
            lineHeight: 1,
            marginTop: 24,
            letterSpacing: -4
          }}
        >
          Mehmet
        </div>
        <div
          style={{
            fontSize: 160,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -4
          }}
        >
          Gümrah
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#bcccdc",
            marginTop: 32
          }}
        >
          mgumrah.com
        </div>
      </div>
    ),
    { ...size }
  );
}
