import { ImageResponse } from "next/og";
import { aile } from "../aile";
import { aileKur, hazirla, ozetle, yakinliklar } from "../soy";

export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

const kurulu = aileKur(hazirla(aile.kisiler, aile.kok));
const ozet = ozetle(kurulu, yakinliklar(kurulu, aile.kok));

/** Sağdaki küçük ağaç: dört büyük ebeveyn, iki ebeveyn, bir çocuk. Adı yok, yalnızca biçim. */
const KART = { g: 96, y: 58 };
const SATIRLAR = [
  { y: 24, x: [58, 178, 298, 418] },
  { y: 184, x: [118, 358] },
  { y: 344, x: [238] }
];
const CIZGI = "rgba(240, 244, 248, 0.42)";

function Cizgi({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: CIZGI }} />;
}

/**
 * mgumrah.com/soyagaci yapıştırılınca WhatsApp'ın çizdiği kart. Kişi adı
 * yok: kart bağlantıyı alan herkese, sayfayı açmadan önce görünür.
 *
 * opengraph-image kuralı yerine elle yazılmış bir route, /portal/og.png ile
 * aynı sebepten: o kural çıktıya uzantısız bir dosya bırakıyor ve statik
 * sunucu ona Content-Type veremiyor.
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
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #102a43 0%, #243b53 100%)",
          color: "#f0f4f8",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <div style={{ fontSize: 28, letterSpacing: 8, color: "#5fb3d9", fontWeight: 800 }}>SOY AĞACI</div>
          <div style={{ fontSize: 108, fontWeight: 800, lineHeight: 1, marginTop: 24, letterSpacing: -4 }}>
            {aile.baslik}
          </div>
          <div style={{ fontSize: 32, color: "#bcccdc", marginTop: 32 }}>
            {/* Yıla ek yazılmıyor: "1850'den" ama "1830'dan" — ek sayının okunuşuna bağlı. */}
            {`${ozet.kisi} kişi · ${ozet.kusak} kuşak${ozet.enEski ? ` · en eski kayıt ${ozet.enEski}` : ""}`}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 20 }}>mgumrah.com/soyagaci</div>
        </div>

        <div style={{ display: "flex", position: "relative", width: 476, height: 426 }}>
          {SATIRLAR.slice(0, 2).map((satir, i) =>
            satir.x.flatMap((_, j) => {
              if (j % 2) return [];
              const [a, b] = [satir.x[j], satir.x[j + 1]];
              const orta = (a + b) / 2;
              const altSatir = SATIRLAR[i + 1];
              return [
                <Cizgi key={`e${i}${j}`} x={a + KART.g / 2} y={satir.y + KART.y / 2 - 1.5} w={b - a - KART.g} h={3} />,
                <Cizgi key={`i${i}${j}`} x={orta - 1.5} y={satir.y + KART.y / 2} w={3} h={altSatir.y - satir.y - KART.y / 2} />
              ];
            })
          )}
          {SATIRLAR.flatMap((satir, i) =>
            satir.x.map((x) => (
              <div
                key={`k${i}${x}`}
                style={{
                  position: "absolute",
                  left: x - KART.g / 2,
                  top: satir.y,
                  width: KART.g,
                  height: KART.y,
                  borderRadius: 14,
                  border: i === 2 ? "3px solid #5fb3d9" : "3px solid rgba(240, 244, 248, 0.5)",
                  background: i === 2 ? "#5fb3d9" : "rgba(240, 244, 248, 0.08)"
                }}
              />
            ))
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
