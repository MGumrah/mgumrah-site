import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

// The store icon is the app's face, so the share card borrows it rather than
// inventing a second logo. Read at build time and inlined: the card is baked
// into the static export, and nothing is around to serve a URL to it.
const logo = readFileSync(join(process.cwd(), "public/images/teknoportal-icon.png"));
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

/**
 * The card WhatsApp, iMessage and the rest draw when someone pastes
 * mgumrah.com/portal. Deliberately language-free — the same picture goes out
 * with a Turkish or an English title, and the artwork carries neither.
 *
 * A hand-written route rather than the opengraph-image convention, because
 * that one lands in the export with no file extension: the asset server then
 * has no way to call it a PNG, and answers with no Content-Type beside a
 * nosniff header. A crawler that plays by the rules drops the picture there.
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
          padding: "80px",
          background: "linear-gradient(135deg, #05301b 0%, #0a6b39 100%)",
          color: "#f2fbf5",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
        }}
      >
        {/* The logo's roof and leaf are near-black, so it needs a light tile to
            sit on — the same way it does on a phone home screen. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
            height: 300,
            flexShrink: 0,
            borderRadius: 68,
            background: "#ffffff"
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={216} height={216} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#6fd39b",
              fontWeight: 800
            }}
          >
            Uygulama
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 18,
              letterSpacing: -3
            }}
          >
            Tekno Portal
          </div>
          <div style={{ fontSize: 30, color: "#a7e3c2", marginTop: 18 }}>
            App Store · Google Play · Microsoft Store
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, marginTop: 28 }}>mgumrah.com/portal</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
