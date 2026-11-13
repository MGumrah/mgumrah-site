"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { akisAylari, akisDuzeni, akisHesapla, DUGUM_EN, kategoriRengi, payMetni, type Akis as AkisVerisi, type AkisDonemi, type AkisDuzeni } from "./akis";
import { useBorc } from "./baglam";
import { ayAdi, ayKisa, tl, yuzde } from "./bicim";
import { Bolum, Bos, Tl } from "./parcalar";

/** Seçili dönem: "tum", "son3" ya da "YYYY-MM". */
type DonemAnahtari = string;

const donemOf = (anahtar: DonemAnahtari): AkisDonemi => (anahtar === "tum" ? { tur: "tum" } : anahtar === "son3" ? { tur: "son3" } : { tur: "ay", ay: anahtar });

/** Seçim: bir bant (hesap + kategori) ya da bir kategorinin tamamı (hesapId: null). */
type Secim = { kategori: string; hesapId: number | null };
const ayniSecim = (a: Secim | null, b: Secim | null) => a !== null && b !== null && a.kategori === b.kategori && a.hesapId === b.hesapId;

/** Ortalama harf genişliği (px) ile etiketi sütuna sığdırır; sığmayanın sonu "…". Tam ad listede ve başlıkta durur. */
function kisalt(ad: string, en: number, harfPx = 5.4): string {
  const sinir = Math.max(4, Math.floor(en / harfPx));
  return ad.length <= sinir ? ad : `${ad.slice(0, sinir - 1).trimEnd()}…`;
}

/** Kapsayıcının genişliğini izler (piksel); çizim bu genişlikte 1:1 yerleşir, geniş ekranda yazı büyümez. */
function useGenislik(varsayilan: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [en, setEn] = useState(varsayilan);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const olc = () => setEn(Math.round(el.getBoundingClientRect().width) || varsayilan);
    olc();
    if (typeof ResizeObserver === "undefined") return;
    const izleyici = new ResizeObserver(olc);
    izleyici.observe(el);
    return () => izleyici.disconnect();
  }, [varsayilan]);
  return [ref, en] as const;
}

function donemEtiketi(akis: AkisVerisi, anahtar: DonemAnahtari): string {
  const { aylar } = akis;
  if (aylar.length === 0) return "";
  const sirali = [...aylar].sort();
  if (anahtar === "tum") return sirali.length === 1 ? ayAdi(sirali[0]) : `Tüm aylar (${ayKisa(sirali[0])} – ${ayKisa(sirali[sirali.length - 1])})`;
  if (anahtar === "son3") return `Son 3 ay (${ayKisa(sirali[0])} – ${ayKisa(sirali[sirali.length - 1])})`;
  return ayAdi(anahtar);
}

/** Harcama akışı: kartlardan kategorilere, bant kalınlığı = tutar (Sankey). Sade SVG, dış kütüphane yok. */
export default function HarcamaAkisi() {
  const { veri } = useBorc();
  const aylar = useMemo(() => akisAylari(veri), [veri]);
  const [secili, setSecili] = useState<DonemAnahtari | null>(null);
  // Varsayılan: verideki en yeni ay. Seçili ay verimden kalkarsa (nadir) yine en yeniye dönülür.
  const donem: DonemAnahtari = secili === "tum" || secili === "son3" || (secili !== null && aylar.includes(secili)) ? secili : (aylar[0] ?? "tum");
  const akis = useMemo(() => akisHesapla(veri, donemOf(donem)), [veri, donem]);

  if (aylar.length === 0) {
    return (
      <Bolum baslik="Harcama akışı">
        <Bos>Henüz kart harcaması yok. Bir kartta harcama ekleyince paranın nereye gittiği burada görünür.</Bos>
      </Bolum>
    );
  }

  return (
    <>
      <Bolum baslik="Harcama akışı">
        <DonemSecici aylar={aylar} secili={donem} sec={setSecili} />
        <p className="akis-ust">
          <strong className="t">{tl(akis.toplam)}</strong>
          <span>
            {donemEtiketi(akis, donem)} · kart harcaması
          </span>
        </p>
        {akis.kategoriler.length === 0 ? <Bos>Bu dönemde kart harcaması yok.</Bos> : <Cizim akis={akis} />}
      </Bolum>

      {akis.kategoriler.length > 0 && <Liste akis={akis} />}
    </>
  );
}

/** "Tümü", "Son 3 ay" ve tek tek aylar (en yeni başta). Çok ay olabilir: yatay kayar, seçili çip görünür kalır. */
function DonemSecici({ aylar, secili, sec }: { aylar: string[]; secili: DonemAnahtari; sec: (a: DonemAnahtari) => void }) {
  const kap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const kutu = kap.current;
    const el = kutu?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!kutu || !el) return;
    // Yalnızca görünür alanın dışındaysa, yalnızca yatay kaydır: "Tümü" / "Son 3 ay" gereksiz yere gizlenmesin, sayfa dikeyde oynamasın.
    const sol = el.offsetLeft - 8;
    const sag = el.offsetLeft + el.offsetWidth + 8;
    if (sol < kutu.scrollLeft) kutu.scrollLeft = Math.max(0, sol);
    else if (sag > kutu.scrollLeft + kutu.clientWidth) kutu.scrollLeft = sag - kutu.clientWidth;
  }, [secili]);
  const secenekler = [
    { id: "tum", ad: "Tümü" },
    { id: "son3", ad: "Son 3 ay" },
    ...aylar.map((a) => ({ id: a, ad: ayKisa(a) }))
  ];
  return (
    <div className="akis-donem" role="tablist" aria-label="Dönem" ref={kap}>
      {secenekler.map((s) => (
        <button key={s.id} type="button" role="tab" aria-selected={secili === s.id} className={secili === s.id ? "secili" : ""} onClick={() => sec(s.id)}>
          {s.ad}
        </button>
      ))}
    </div>
  );
}

function Cizim({ akis }: { akis: AkisVerisi }) {
  const [kap, olculen] = useGenislik(343);
  const genislik = Math.min(760, Math.max(280, olculen));
  const duzen = useMemo(() => akisDuzeni(akis, genislik), [akis, genislik]);
  const [sabit, setSabit] = useState<Secim | null>(null);
  const [gecici, setGecici] = useState<Secim | null>(null);
  // Dönem/veri değişince eski seçim anlamsızlaşır.
  useEffect(() => {
    setSabit(null);
    setGecici(null);
  }, [akis]);
  const gorunen = gecici ?? sabit;

  const hesapAdi = useMemo(() => new Map(akis.hesaplar.map((h) => [h.hesapId, h.ad])), [akis]);
  const kategori = useMemo(() => new Map(akis.kategoriler.map((k) => [k.anahtar, k])), [akis]);

  const vurgulu = (hesapId: number, kat: string) => gorunen !== null && gorunen.kategori === kat && (gorunen.hesapId === null || gorunen.hesapId === hesapId);
  const fareGirdi = (s: Secim) => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setGecici(s);
  };
  const sec = (s: Secim) => setSabit((onceki) => (ayniSecim(onceki, s) ? null : s));

  const ozet = `Harcama akışı: ${akis.hesaplar.length} karttan ${akis.kategoriler.length} kategoriye toplam ${tl(akis.toplam)}. Ayrıntılar aşağıdaki listede.`;

  return (
    <div className="akis" ref={kap}>
      <p className="akis-bilgi" aria-live="polite">
        <Bilgi akis={akis} secim={gorunen} hesapAdi={hesapAdi} kategori={kategori} />
      </p>
      <svg className="akis-svg" viewBox={`0 0 ${duzen.genislik} ${duzen.yukseklik}`} width={duzen.genislik} height={duzen.yukseklik} role="img" aria-label={ozet}>
        <rect x={0} y={0} width={duzen.genislik} height={duzen.yukseklik} fill="transparent" onClick={() => setSabit(null)} />
        <g>
          {duzen.bantlar.map((b) => {
            const k = kategori.get(b.kategori);
            const s: Secim = { kategori: b.kategori, hesapId: b.hesapId };
            return (
              <path
                key={`${b.hesapId}:${b.kategori}`}
                d={b.yol}
                className={`akis-bant${vurgulu(b.hesapId, b.kategori) ? " vurgulu" : ""}`}
                fill={kategoriRengi(k?.renk ?? null)}
                onPointerEnter={fareGirdi(s)}
                onPointerLeave={() => setGecici(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  sec(s);
                }}
              />
            );
          })}
        </g>
        <SolSutun duzen={duzen} />
        <SagSutun duzen={duzen} fareGirdi={fareGirdi} cik={() => setGecici(null)} sec={sec} />
      </svg>
    </div>
  );
}

function SolSutun({ duzen }: { duzen: AkisDuzeni }) {
  const x = duzen.solX - 6;
  return (
    <g>
      {duzen.sol.map((d) => (
        <g key={d.hesapId}>
          <title>{d.ad}</title>
          <rect className="akis-sol-dugum" x={duzen.solX} y={d.y} width={DUGUM_EN} height={Math.max(d.yukseklik, 1)} rx={1.5} />
          <text className="akis-ad" x={x} y={d.etiketY - 1.5} textAnchor="end">
            {kisalt(d.ad, duzen.solEtiketEn - 6)}
          </text>
          <text className="akis-tutar t" x={x} y={d.etiketY + 10.5} textAnchor="end">
            {tl(d.toplam)}
          </text>
        </g>
      ))}
    </g>
  );
}

function SagSutun({
  duzen,
  fareGirdi,
  cik,
  sec
}: {
  duzen: AkisDuzeni;
  fareGirdi: (s: Secim) => (e: React.PointerEvent) => void;
  cik: () => void;
  sec: (s: Secim) => void;
}) {
  return (
    <g>
      {duzen.sag.map((d) => {
        const s: Secim = { kategori: d.anahtar, hesapId: null };
        const merkez = d.y + d.yukseklik / 2;
        const kayik = Math.abs(d.etiketY - merkez) > 4;
        const renk = kategoriRengi(d.renk);
        return (
          <g key={d.anahtar} className="akis-sag" onPointerEnter={fareGirdi(s)} onPointerLeave={cik} onClick={() => sec(s)}>
            <title>{d.ad}</title>
            <rect x={duzen.sagX} y={d.y} width={DUGUM_EN} height={Math.max(d.yukseklik, 1)} rx={1.5} fill={renk} />
            {kayik && <path className="akis-kilavuz" d={`M${duzen.sagX + DUGUM_EN + 1} ${merkez}L${duzen.sagEtiketX - 3} ${d.etiketY}`} />}
            <text className="akis-ad" x={duzen.sagEtiketX} y={d.etiketY - 1.5}>
              {kisalt(d.ad, duzen.sagEtiketEn)}
            </text>
            <text className="akis-tutar t" x={duzen.sagEtiketX} y={d.etiketY + 10.5}>
              {tl(d.toplam)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Dokunulan/üzerine gelinen bandı söyleyen satır: "Kart A → Araç ve servis: 38.453 ₺ (kategorinin %93'ü)". */
function Bilgi({
  akis,
  secim,
  hesapAdi,
  kategori
}: {
  akis: AkisVerisi;
  secim: Secim | null;
  hesapAdi: Map<number, string>;
  kategori: Map<string, AkisVerisi["kategoriler"][number]>;
}): ReactNode {
  const k = secim ? kategori.get(secim.kategori) : undefined;
  if (!secim || !k) return <span className="akis-ipucu">Ayrıntı için bir banda ya da kategoriye dokunun.</span>;
  if (secim.hesapId === null) {
    return (
      <>
        <b>{k.ad}</b>: <Tl k={k.toplam} /> ({payMetni(k.toplam, akis.toplam, "toplamın")})
      </>
    );
  }
  const h = k.hucreler.find((c) => c.hesapId === secim.hesapId);
  if (!h) return null;
  return (
    <>
      <b>{hesapAdi.get(secim.hesapId)}</b> → <b>{k.ad}</b>: <Tl k={h.tutar} /> ({payMetni(h.tutar, k.toplam, "kategorinin")})
    </>
  );
}

/** Yüzde 0,5'in altı "%0" yerine "<%1" okunur (kategori var, yalnızca küçük). */
const kucukPay = (oran: number) => (oran > 0 && oran < 0.005 ? "<%1" : yuzde(oran));

/** Diyagramla aynı veri, ekran okuyucu ve klavye için düz liste: kategori, tutar, toplamdaki pay (+ hangi karttan). */
function Liste({ akis }: { akis: AkisVerisi }) {
  const ad = new Map(akis.hesaplar.map((h) => [h.hesapId, h.ad]));
  return (
    <Bolum baslik="Kategoriler">
      <ul className="liste">
        {akis.kategoriler.map((k) => (
          <li key={k.anahtar} className="satir">
            <div>
              <span className="akis-rozet">
                <i style={{ background: kategoriRengi(k.renk) }} aria-hidden="true" />
                <strong>{k.ad}</strong>
              </span>
              {akis.hesaplar.length > 1 && (
                <span className="alt">
                  {k.hucreler.map((h, i) => (
                    <span key={h.hesapId}>
                      {i > 0 && " · "}
                      {ad.get(h.hesapId)} <Tl k={h.tutar} />
                    </span>
                  ))}
                </span>
              )}
            </div>
            <div className="sag-kolon">
              <Tl k={k.toplam} />
              <span className="alt">{kucukPay(k.toplam / akis.toplam)}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="not">
        Taksitli alışverişin tamamı alındığı ay sayılır. İade, kendi kategorisinden düşer. Kategorisi boş harcamalar açıklamasına göre sınıflanır;
        tutmazsa “Diğer”.
      </p>
    </Bolum>
  );
}
