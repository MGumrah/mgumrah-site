import { ImageResponse } from "next/og";

/** "EN" harfleri kalın çizgilerle; font yüklemeden her boyutta aynı kalınlıkta çıkar. */
const HARFLER =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">` +
  `<path d="M40 30H16V70H40M16 50H36"/>` +
  `<path d="M58 70V30L84 70V30"/>` +
  `</svg>`;

const harflerAdresi = `data:image/svg+xml;base64,${Buffer.from(HARFLER).toString("base64")}`;

/**
 * İngilizce rehberinin ana ekran simgesi: sayfanın vurgu rengi kenara kadar
 * dolu, "EN" ortada ve yüzde 62'sinde. iOS köşeleri kendisi yuvarlar, Android'in
 * dairesel maskesi kenarın %10'unu kırpar; harfler güvenli dairenin içinde
 * kaldığı için aynı dosya "maskable" olarak da kullanılabilir.
 * Renk çifti verilmezse /ingilizce'nin mavisi kullanılır; /merve/ingilizce kendi
 * rengini verir, iki simge ana ekranda ayırt edilsin diye.
 */
export function ingilizceIkonu(boyut: number, renkler: [string, string] = ["#3b82f6", "#1d4ed8"]) {
  const harf = Math.round(boyut * 0.62);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(145deg, ${renkler[0]} 0%, ${renkler[1]} 100%)`
        }}
      >
        <img src={harflerAdresi} alt="" width={harf} height={harf} />
      </div>
    ),
    { width: boyut, height: boyut }
  );
}
