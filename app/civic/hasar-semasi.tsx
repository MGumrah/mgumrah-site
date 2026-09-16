import type { ParcaDurumu, ParcaId } from "./ilan";

type Parca = { id: ParcaId; ad: string; d: string; merkez: [number, number] };

/**
 * Boya/değişen şeması, sahibinden'deki çizimin düzeninde: ortada üstten görülen
 * gövde (kaput, tavan, bagaj; aralarında camlar), iki yanda dışa açılmış yan
 * görünüş (çamurluklar tekerlek kemerleriyle, kapılar camlarıyla), üstte ve
 * altta tamponlar. Çizim bu sayfanın kendi çizimi; yalnızca yerleşim ve parça
 * listesi aynı. Koordinatlar 312x392'lik bir tuvalde, sol taraf sağın aynası.
 * `merkez`, işaretli parçanın harfinin yazıldığı nokta.
 */
const PARCALAR: Parca[] = [
  { id: "onTampon", ad: "Ön Tampon", merkez: [156, 27], d: "M108 14H204Q210 14 210 20V34Q210 40 204 40H108Q102 40 102 34V20Q102 14 108 14Z" },
  { id: "motorKaputu", ad: "Motor Kaputu", merkez: [156, 84], d: "M106 58Q108 51 118 50Q156 45 194 50Q204 51 206 58L210 126Q156 114 102 126Z" },
  { id: "tavan", ad: "Tavan", merkez: [156, 236], d: "M120 209H192Q195 236 192 262H120Q117 236 120 209Z" },
  { id: "bagajKapagi", ad: "Bagaj Kapağı", merkez: [156, 329], d: "M106 312Q156 327 206 312L209 332Q209 337 203 338Q156 348 109 338Q103 337 103 332Z" },
  { id: "arkaTampon", ad: "Arka Tampon", merkez: [156, 363], d: "M108 350H204Q210 350 210 356V370Q210 376 204 376H108Q102 376 102 370V356Q102 350 108 350Z" },
  { id: "solOnCamurluk", ad: "Sol Ön Çamurluk", merkez: [31, 63], d: "M24 46H38V50H46V95.9A26 26 0 0 0 17 77.3V50H24Z" },
  { id: "solOnKapi", ad: "Sol Ön Kapı", merkez: [41, 166], d: "M21 129A26 26 0 0 0 46.5 108.5L68 120Q93 152 99 211L21 197Z" },
  { id: "solArkaKapi", ad: "Sol Arka Kapı", merkez: [41, 233], d: "M21 199L99 213V263L46.5 277.5A26 26 0 0 0 21 257Z" },
  { id: "solArkaCamurluk", ad: "Sol Arka Çamurluk", merkez: [32, 328], d: "M17 308.7A26 26 0 0 0 46 290.1V342H38V346H24V342H17Z" },
  { id: "sagOnCamurluk", ad: "Sağ Ön Çamurluk", merkez: [281, 63], d: "M288 46H274V50H266V95.9A26 26 0 0 1 295 77.3V50H288Z" },
  { id: "sagOnKapi", ad: "Sağ Ön Kapı", merkez: [271, 166], d: "M291 129A26 26 0 0 1 265.5 108.5L244 120Q219 152 213 211L291 197Z" },
  { id: "sagArkaKapi", ad: "Sağ Arka Kapı", merkez: [271, 233], d: "M291 199L213 213V263L265.5 277.5A26 26 0 0 1 291 257Z" },
  { id: "sagArkaCamurluk", ad: "Sağ Arka Çamurluk", merkez: [280, 328], d: "M295 308.7A26 26 0 0 1 266 290.1V342H274V346H288V342H295Z" }
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
  not,
  tramer
}: {
  durumlar: Partial<Record<ParcaId, ParcaDurumu>> | null;
  /** Boyanın ya da değişimin nedeni; listenin altına yazılır. */
  not: string | null;
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
        <svg viewBox="0 0 312 392" role="img" aria-label="Boyalı ve değişen parça şeması">
          {/* Zemin: gövde silueti, iki yan görünüş ve tampon çıkıntıları. Parça değiller. */}
          <g className="hasar-govde">
            <path d="M104 56Q106 49 116 47Q156 41 196 47Q206 49 208 56L213 120Q214 128 212 134Q203 165 199 206Q197 236 199 264Q201 290 208 312Q213 326 213 334Q213 340 205 342Q156 352 107 342Q99 340 99 334Q99 326 104 312Q111 290 113 264Q115 236 113 206Q109 165 100 134Q98 128 99 120Z" />
            <path d="M17 50H24V46H38V50H52L70 122Q95 152 101 212V264Q98 305 66 342H38V346H24V342H17Z" />
            <path d="M295 50H288V46H274V50H260L242 122Q217 152 211 212V264Q214 305 246 342H274V346H288V342H295Z" />
            <rect x="112" y="2" width="23" height="14" rx="3" />
            <rect x="177" y="2" width="23" height="14" rx="3" />
            <rect x="112" y="374" width="23" height="14" rx="3" />
            <rect x="177" y="374" width="23" height="14" rx="3" />
          </g>

          {PARCALAR.map((p) => {
            const durum = belirtilmemis ? "belirsiz" : (durumlar[p.id] ?? "orijinal");
            return (
              <path key={p.id} className={`hasar-parca ${durum}`} d={p.d}>
                <title>{`${p.ad}: ${DURUMLAR.find((d) => d.id === durum)?.ad ?? "Belirtilmemiş"}`}</title>
              </path>
            );
          })}

          {/* Camlar ve tampon yuvaları parçaların üstüne oyulmuş gibi çizilir. */}
          <g className="hasar-cam">
            <path d="M103 131Q156 119 209 131Q200 165 196 206H116Q112 165 103 131Z" />
            <path d="M119 265H193Q194 290 202 306Q156 322 110 306Q118 290 119 265Z" />
            <path d="M63 131Q88 152 95 203L63 197Z" />
            <path d="M63 212L96 218V257L63 269Z" />
            <path d="M64 283L96 268Q89 285 68 298Z" />
            <path d="M249 131Q224 152 217 203L249 197Z" />
            <path d="M249 212L216 218V257L249 269Z" />
            <path d="M248 283L216 268Q223 285 244 298Z" />
            <path d="M112 21H126Q129 21 131 24L134 33H112Q109 33 109 30V24Q109 21 112 21Z" />
            <path d="M200 21H186Q183 21 181 24L178 33H200Q203 33 203 30V24Q203 21 200 21Z" />
            <rect x="108" y="358" width="21" height="10" rx="5" />
            <rect x="183" y="358" width="21" height="10" rx="5" />
          </g>

          <g className="hasar-teker">
            <circle cx="21" cy="103" r="21.5" />
            <circle cx="21" cy="283" r="21.5" />
            <circle cx="291" cy="103" r="21.5" />
            <circle cx="291" cy="283" r="21.5" />
          </g>

          {/* Harfler en üstte; fareyle üstüne gelinince parçanın başlığı okunsun diye
              tıklamayı geçirirler. */}
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

        {not ? <p className="hasar-not">{not}</p> : null}

        {tramer === null ? null : (
          <p className="hasar-tramer">
            <b>Tramer kaydı:</b> {tramer === 0 ? "Yok" : `${new Intl.NumberFormat("tr-TR").format(tramer)} TL`}
          </p>
        )}
      </div>
    </div>
  );
}
