import type { ParcaDurumu, ParcaId } from "./ilan";

type Parca = { id: ParcaId; ad: string; d: string; merkez: [number, number] };

/**
 * Üstten, yan panelleri dışa açılmış araç şeması — sahibinden'deki boya/değişen
 * çiziminin aynı parça listesiyle. Ortada tampon-kaput-tavan-bagaj, iki yanda
 * çamurluk ve kapılar. Camlar, aynalar ve lastikler yalnızca yön vermek için
 * çizili; durum taşımazlar. `merkez`, işaretli parçanın harfinin yazıldığı nokta.
 */
const PARCALAR: Parca[] = [
  { id: "onTampon", ad: "Ön Tampon", merkez: [120, 19], d: "M80 8H160Q170 8 170 18V30H70V18Q70 8 80 8Z" },
  { id: "motorKaputu", ad: "Motor Kaputu", merkez: [120, 76], d: "M82 36H158Q164 36 164 42L166 110Q166 116 160 116H80Q74 116 74 110L76 42Q76 36 82 36Z" },
  { id: "tavan", ad: "Tavan", merkez: [120, 204], d: "M90 156H150Q156 156 156 162V246Q156 252 150 252H90Q84 252 84 246V162Q84 156 90 156Z" },
  { id: "bagajKapagi", ad: "Bagaj Kapağı", merkez: [120, 318], d: "M80 288H160Q166 288 166 294L164 342Q164 348 158 348H82Q76 348 76 342L74 294Q74 288 80 288Z" },
  { id: "arkaTampon", ad: "Arka Tampon", merkez: [120, 365], d: "M70 354H170V366Q170 376 160 376H80Q70 376 70 366Z" },
  { id: "solOnCamurluk", ad: "Sol Ön Çamurluk", merkez: [45, 76], d: "M64 36V116H26V60Q26 36 50 36Z" },
  { id: "solOnKapi", ad: "Sol Ön Kapı", merkez: [45, 163], d: "M30 122H64V204H30Q26 204 26 200V126Q26 122 30 122Z" },
  { id: "solArkaKapi", ad: "Sol Arka Kapı", merkez: [45, 245], d: "M30 208H64V282H30Q26 282 26 278V212Q26 208 30 208Z" },
  { id: "solArkaCamurluk", ad: "Sol Arka Çamurluk", merkez: [45, 318], d: "M26 288H64V348H50Q26 348 26 324Z" },
  { id: "sagOnCamurluk", ad: "Sağ Ön Çamurluk", merkez: [195, 76], d: "M176 36V116H214V60Q214 36 190 36Z" },
  { id: "sagOnKapi", ad: "Sağ Ön Kapı", merkez: [195, 163], d: "M210 122H176V204H210Q214 204 214 200V126Q214 122 210 122Z" },
  { id: "sagArkaKapi", ad: "Sağ Arka Kapı", merkez: [195, 245], d: "M210 208H176V282H210Q214 282 214 278V212Q214 208 210 208Z" },
  { id: "sagArkaCamurluk", ad: "Sağ Arka Çamurluk", merkez: [195, 318], d: "M214 288H176V348H190Q214 348 214 324Z" }
];

/** `harf`: parçanın ortasına yazılan kısaltma, sahibinden'deki gibi. */
const DURUMLAR: { id: ParcaDurumu | "orijinal"; ad: string; harf?: string }[] = [
  { id: "orijinal", ad: "Orijinal" },
  { id: "lokal", ad: "Lokal Boyalı", harf: "LB" },
  { id: "boyali", ad: "Boyalı", harf: "B" },
  { id: "degisen", ad: "Değişen", harf: "D" }
];

export default function HasarSemasi({
  durumlar,
  tramer
}: {
  durumlar: Partial<Record<ParcaId, ParcaDurumu>> | null;
  tramer: number | null;
}) {
  const belirtilmemis = durumlar === null;
  const islenmis = durumlar ? DURUMLAR.filter((d) => d.id !== "orijinal") : [];
  const temiz = durumlar !== null && Object.keys(durumlar).length === 0;

  return (
    <div className="hasar">
      <div className="hasar-cizim">
        <ul className="hasar-lejant">
          {DURUMLAR.map((d) => (
            <li key={d.id} className={d.id}>
              <i className={`hasar-renk ${d.id}`} aria-hidden="true" />
              {d.ad}
            </li>
          ))}
        </ul>
        <svg viewBox="0 0 240 384" role="img" aria-label="Boyalı ve değişen parça şeması">
          {/* Lastikler, aynalar, camlar: yalnızca yön için. */}
          <g className="hasar-sus">
            <rect x="12" y="58" width="10" height="40" rx="5" />
            <rect x="12" y="300" width="10" height="40" rx="5" />
            <rect x="218" y="58" width="10" height="40" rx="5" />
            <rect x="218" y="300" width="10" height="40" rx="5" />
            <path d="M26 128 14 124V140L26 142Z" />
            <path d="M214 128 226 124V140L214 142Z" />
          </g>
          <g className="hasar-cam">
            <path d="M76 122H164L156 150H84Z" />
            <path d="M84 258H156L164 282H76Z" />
          </g>
          {PARCALAR.map((p) => {
            const durum = belirtilmemis ? "belirsiz" : (durumlar[p.id] ?? "orijinal");
            return (
              <path key={p.id} className={`hasar-parca ${durum}`} d={p.d}>
                <title>{`${p.ad}: ${DURUMLAR.find((d) => d.id === durum)?.ad ?? "Belirtilmemiş"}`}</title>
              </path>
            );
          })}
          {/* Harfler parçaların üstünde ayrı bir katmanda: fareyle üstüne gelinince
              parçanın başlığı yine okunsun diye tıklamayı geçirirler. */}
          <g className="hasar-harfler" aria-hidden="true">
            {PARCALAR.map((p) => {
              const harf = DURUMLAR.find((d) => d.id === durumlar?.[p.id])?.harf;
              return harf ? (
                <text key={p.id} x={p.merkez[0]} y={p.merkez[1]} textAnchor="middle" dominantBaseline="central">
                  {harf}
                </text>
              ) : null;
            })}
          </g>
        </svg>
      </div>

      <div className="hasar-ozet">
        {belirtilmemis ? (
          <>
            <p className="hasar-ozet-baslik">Belirtilmemiş</p>
            <p>Boyalı ya da değişen parça bilgisi bu ilana girilmemiş.</p>
          </>
        ) : temiz ? (
          <>
            <p className="hasar-ozet-baslik">
              <i className="hasar-renk orijinal" aria-hidden="true" />
              Orijinal
            </p>
            <p>Aracın tüm parçaları orijinaldir. Değişen ya da boyalı parçası bulunmamaktadır.</p>
          </>
        ) : (
          islenmis.map((d) => {
            const parcalar = PARCALAR.filter((p) => durumlar?.[p.id] === d.id);
            if (parcalar.length === 0) return null;
            return (
              <div key={d.id}>
                <p className="hasar-ozet-baslik">
                  <i className={`hasar-renk ${d.id}`} aria-hidden="true" />
                  {d.ad}
                </p>
                <p>{parcalar.map((p) => p.ad).join(", ")}</p>
              </div>
            );
          })
        )}

        {tramer === null ? null : (
          <p className="hasar-tramer">
            <b>Tramer kaydı:</b> {tramer === 0 ? "Yok" : `${new Intl.NumberFormat("tr-TR").format(tramer)} TL`}
          </p>
        )}
      </div>
    </div>
  );
}
