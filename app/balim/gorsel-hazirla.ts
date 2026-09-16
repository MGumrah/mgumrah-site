/**
 * Yüklenecek fotoğrafı tarayıcıda küçültür: uzun kenar 2000 piksel, bir de
 * ızgara için 560 piksellik küçüğü. Telefonun 6 MB'lık karesi mobil veriden hiç
 * geçmez, R2'de de ekranın ihtiyacı kadarı durur. Yeniden kodlama bir yan
 * fayda daha getiriyor: fotoğrafın içindeki konum bilgisi (EXIF) atılır.
 *
 * WebP destekleyen tarayıcıda WebP, desteklemeyende (iOS Safari) JPEG çıkar.
 * JPEG saydamlık taşımadığı için onun altına beyaz serilir; yoksa saydam PNG
 * siyah zeminle çıkardı.
 */

const BUYUK_KENAR = 2000;
const KUCUK_KENAR = 560;

export type HazirGorsel = {
  buyuk: Blob;
  kucuk: Blob;
  genislik: number;
  yukseklik: number;
};

let webpVar: boolean | null = null;

function webpDestekleniyor() {
  if (webpVar === null) {
    const tuval = document.createElement("canvas");
    tuval.width = tuval.height = 1;
    webpVar = tuval.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return webpVar;
}

async function coz(dosya: File): Promise<{ kaynak: CanvasImageSource; genislik: number; yukseklik: number; birak: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(dosya, { imageOrientation: "from-image" });
      return { kaynak: bitmap, genislik: bitmap.width, yukseklik: bitmap.height, birak: () => bitmap.close() };
    } catch {
      // Bazı tarayıcılar seçenekli çağrıyı desteklemiyor; <img> yolu dener.
    }
  }
  const adres = URL.createObjectURL(dosya);
  const resim = new Image();
  resim.src = adres;
  try {
    await resim.decode();
  } catch {
    URL.revokeObjectURL(adres);
    throw new Error("Bu fotoğraf açılamadı. Farklı bir biçimde (JPEG, PNG) kaydedip tekrar deneyin.");
  }
  return {
    kaynak: resim,
    genislik: resim.naturalWidth,
    yukseklik: resim.naturalHeight,
    birak: () => URL.revokeObjectURL(adres)
  };
}

function ciz(kaynak: CanvasImageSource, genislik: number, yukseklik: number, enUzun: number, kalite: number) {
  const oran = Math.min(1, enUzun / Math.max(genislik, yukseklik));
  const tuval = document.createElement("canvas");
  tuval.width = Math.max(1, Math.round(genislik * oran));
  tuval.height = Math.max(1, Math.round(yukseklik * oran));

  const tur = webpDestekleniyor() ? "image/webp" : "image/jpeg";
  const baglam = tuval.getContext("2d");
  if (!baglam) throw new Error("Fotoğraf hazırlanamadı.");
  if (tur === "image/jpeg") {
    baglam.fillStyle = "#ffffff";
    baglam.fillRect(0, 0, tuval.width, tuval.height);
  }
  baglam.imageSmoothingQuality = "high";
  baglam.drawImage(kaynak, 0, 0, tuval.width, tuval.height);

  return new Promise<Blob>((coz, reddet) => {
    tuval.toBlob((blob) => (blob ? coz(blob) : reddet(new Error("Fotoğraf hazırlanamadı."))), tur, kalite);
  });
}

export async function gorselHazirla(dosya: File): Promise<HazirGorsel> {
  const { kaynak, genislik, yukseklik, birak } = await coz(dosya);
  try {
    const kucuk = await ciz(kaynak, genislik, yukseklik, KUCUK_KENAR, 0.8);
    // Hareketli GIF'i yeniden çizmek onu dondurur; zaten küçük olan bir
    // JPEG/WebP'yi yeniden kodlamak da yalnızca kalite kaybettirir.
    const olduguGibi =
      dosya.type === "image/gif" ||
      ((dosya.type === "image/jpeg" || dosya.type === "image/webp") &&
        Math.max(genislik, yukseklik) <= BUYUK_KENAR &&
        dosya.size <= 1.5 * 1024 * 1024);
    const buyuk = olduguGibi ? dosya : await ciz(kaynak, genislik, yukseklik, BUYUK_KENAR, 0.85);
    const oran = olduguGibi ? 1 : Math.min(1, BUYUK_KENAR / Math.max(genislik, yukseklik));
    return {
      buyuk,
      kucuk,
      genislik: Math.round(genislik * oran),
      yukseklik: Math.round(yukseklik * oran)
    };
  } finally {
    birak();
  }
}
