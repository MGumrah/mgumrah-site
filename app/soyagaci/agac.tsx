"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type Ref
} from "react";
import { flushSync } from "react-dom";
import type { Olay } from "./aile";
import {
  adSoyad,
  aileKur,
  OLCU,
  tarihYazisi,
  yerlestir,
  yillar,
  type Aile,
  type Gorunen,
  type Yakinlik,
  type Yerlesim
} from "./soy";

type Gorunum = { x: number; y: number; k: number };

const EN_AZ = 0.2;
const EN_COK = 1.6;
/** CSS'teki kart geçişiyle aynı süre: sahne ile kartlar birlikte kaysın. */
const SURE = 480;

const sinirla = (k: number) => Math.min(EN_COK, Math.max(EN_AZ, k));
const azHareket = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Odak çerçevenin ne kadar aşağısında dursun: altındaki torunlar tam sığacak
 * kadar aşağıda, üstteki atalara en çok yer kalsın; ama çerçevenin dörtte
 * birinden yukarı ya da dörtte üçünden aşağı değil. CSS clamp() ile aynı
 * hesap, ilk çizimde de böyle yazılıyor.
 */
function odakY(yer: Yerlesim, h: number, k: number) {
  return Math.max(h * 0.25, Math.min(h - (yer.yukseklik - yer.odak.y) * k, h * 0.75));
}

const olayYazisi = (olay?: Olay) =>
  olay ? [olay.tarih ? tarihYazisi(olay.tarih) : null, olay.yer].filter(Boolean).join(" · ") : "";

function Ikon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

type Props = {
  kisiler: Gorunen[];
  kok: string;
  yakinlik: Record<string, Yakinlik>;
  kusaklar: { baslik: string; kisiler: string[] }[];
};

/**
 * Ağacın kendisi: sürüklenen, yakınlaştırılan bir tuval, kişiye dokununca
 * açılan panel ve altında aynı kişilerin kuşak kuşak listesi.
 *
 * Sahnenin konumu React durumunda değil, doğrudan DOM'da tutuluyor: sürüklerken
 * her harekette yüz kartı yeniden çizmemek için. React'in yazdığı dönüşüm
 * yalnızca ilk çizimdeki (container query birimleriyle, JavaScript'siz de
 * odağı ortalayan) değer ve hiç değişmiyor, yani React onu bir daha ezmiyor.
 */
export default function SoyAgaci({ kisiler, kok, yakinlik, kusaklar }: Props) {
  const aile = useMemo(() => aileKur(kisiler), [kisiler]);
  const [odak, setOdak] = useState(kok);
  const [secili, setSecili] = useState<string | null>(null);
  const [gecis, setGecis] = useState(false);
  const [surukleniyor, setSurukleniyor] = useState(false);
  const [ipucu, setIpucu] = useState(false);
  const yer = useMemo(() => yerlestir(aile, odak), [aile, odak]);

  const [ilkDonusum] = useState(() => {
    const k = "var(--soy-olcek)";
    const y = `clamp(25cqh, calc(100cqh - ${yer.yukseklik - yer.odak.y}px * ${k}), 75cqh)`;
    return `translate(calc(50cqw - ${yer.odak.x}px * ${k}), calc(${y} - ${yer.odak.y}px * ${k})) scale(${k})`;
  });

  const cerceve = useRef<HTMLDivElement>(null);
  const sahne = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const gorunum = useRef<Gorunum | null>(null);
  const imlecler = useRef(new Map<number, { x: number; y: number }>());
  const surukleme = useRef({ basX: 0, basY: 0, tasindi: false, mesafe: 0 });
  const odakDegisti = useRef(false);
  /** Ziyaretçi ağacı kaydırdı ya da yakınlaştırdı mı: boyut değişince görünümü ona göre koruruz. */
  const dokunuldu = useRef(false);

  /** `kendiliginden`: sayfanın kendi yerleşimi (açılış, boyut değişimi), ziyaretçinin hareketi değil. */
  function uygula(g: Gorunum, akici = false, kendiliginden = false) {
    if (!kendiliginden) dokunuldu.current = true;
    gorunum.current = g;
    const el = sahne.current;
    if (!el) return;
    el.style.transition = akici ? `transform ${SURE}ms var(--ease)` : "none";
    el.style.transform = `translate(${g.x}px, ${g.y}px) scale(${g.k})`;
  }

  /** Tuvalin panelin örtmediği kısmı. */
  function alan() {
    const c = cerceve.current!;
    let w = c.clientWidth;
    let h = c.clientHeight;
    if (panel.current) {
      const cr = c.getBoundingClientRect();
      const pr = panel.current.getBoundingClientRect();
      if (window.matchMedia("(max-width: 700px)").matches) h = Math.max(120, pr.top - cr.top);
      else w = Math.max(200, pr.left - cr.left);
    }
    return { w, h };
  }

  const kartiBul = (id: string) => yer.kartlar.find((k) => k.id === id);

  /** Kartı yatayda ortalar; odak ise odakY'ye, değilse dikeyde de ortaya koyar. */
  function ortala(id: string) {
    const g = gorunum.current;
    const kart = kartiBul(id);
    if (!g || !kart) return;
    const { w, h } = alan();
    const cx = kart.x + OLCU.kartG / 2;
    const cy = kart.y + OLCU.kartY / 2;
    const hedefY = id === odak ? odakY(yer, h, g.k) : h / 2;
    uygula({ k: g.k, x: w / 2 - cx * g.k, y: hedefY - cy * g.k }, true);
  }

  /** Kart ekranın dışına taşıyorsa en az kaydırmayla içeri alır. */
  function gorunurYap(id: string) {
    const g = gorunum.current;
    const kart = kartiBul(id);
    if (!g || !kart) return;
    const { w, h } = alan();
    const pay = 16;
    const sol = kart.x * g.k + g.x;
    const sag = (kart.x + OLCU.kartG) * g.k + g.x;
    const ust = kart.y * g.k + g.y;
    const alt = (kart.y + OLCU.kartY) * g.k + g.y;
    const dx = sol < pay ? pay - sol : sag > w - pay ? w - pay - sag : 0;
    const dy = ust < pay + 48 ? pay + 48 - ust : alt > h - pay ? h - pay - alt : 0;
    if (dx || dy) uygula({ ...g, x: g.x + dx, y: g.y + dy }, true);
  }

  function yakinlas(carpan: number, px?: number, py?: number, akici = false) {
    const g = gorunum.current;
    const c = cerceve.current;
    if (!g || !c) return;
    const x = px ?? c.clientWidth / 2;
    const y = py ?? c.clientHeight / 2;
    const k = sinirla(g.k * carpan);
    const f = k / g.k;
    uygula({ k, x: x - (x - g.x) * f, y: y - (y - g.y) * f }, akici);
  }

  function sigdir() {
    if (!cerceve.current) return;
    const { w, h } = alan();
    const k = Math.min(1, sinirla(Math.min(w / yer.genislik, h / yer.yukseklik)));
    uygula({ k, x: (w - yer.genislik * k) / 2, y: (h - yer.yukseklik * k) / 2 }, true);
  }

  function merkezeAl(id: string) {
    if (id === odak) {
      ortala(id);
      return;
    }
    odakDegisti.current = true;
    setGecis(true);
    setOdak(id);
  }

  /**
   * Kişiyi seçer; ağaçta görünmüyorsa ağacı ona göre yeniden kurar. Panel
   * flushSync ile hemen çizilir: ortalarken onun kapladığı yer ölçülebilsin.
   */
  function sec(id: string, tuvaleKaydir = false) {
    flushSync(() => setSecili(id));
    if (kartiBul(id)) ortala(id);
    else merkezeAl(id);
    if (tuvaleKaydir) cerceve.current?.scrollIntoView({ behavior: azHareket() ? "auto" : "smooth", block: "nearest" });
  }

  // İlk çizimdeki CSS dönüşümünün sayısal karşılığı: görüntü kıpırdamadan devralınır.
  // Çerçeve sonradan boyut değiştirirse (telefon yan çevrildi, pencere daraldı)
  // dokunulmamış görünüm baştan kurulur — ölçek de medya sorgusuyla değişmiş
  // olabilir; dokunulmuşsa ortadaki nokta ortada kalacak kadar kaydırılır.
  useLayoutEffect(() => {
    const c = cerceve.current;
    if (!c) return;
    const ilkYerlesim = () => {
      const k = parseFloat(getComputedStyle(c).getPropertyValue("--soy-olcek")) || 1;
      const x = c.clientWidth / 2 - yer.odak.x * k;
      uygula({ k, x, y: odakY(yer, c.clientHeight, k) - yer.odak.y * k }, false, true);
    };
    ilkYerlesim();

    let boyut = { w: c.clientWidth, h: c.clientHeight };
    const gozlemci = new ResizeObserver(() => {
      const onceki = boyut;
      boyut = { w: c.clientWidth, h: c.clientHeight };
      if (boyut.w === onceki.w && boyut.h === onceki.h) return;
      const g = gorunum.current;
      if (!dokunuldu.current || !g) ilkYerlesim();
      else uygula({ ...g, x: g.x + (boyut.w - onceki.w) / 2, y: g.y + (boyut.h - onceki.h) / 2 }, false, true);
    });
    gozlemci.observe(c);
    return () => gozlemci.disconnect();
  }, []);

  // Odak değişti: kartlar yeni yerlerine kayarken sahne de yeni odağı ortaya getirir.
  useLayoutEffect(() => {
    if (!odakDegisti.current) return;
    odakDegisti.current = false;
    ortala(odak);
    const t = window.setTimeout(() => setGecis(false), SURE);
    return () => window.clearTimeout(t);
  }, [yer]);

  // Tekerlek: yalnızca Ctrl (ya da dokunmatik yüzeyde iki parmak sıkıştırma)
  // ile yakınlaştırır; düz tekerlek sayfayı kaydırmaya devam eder.
  useEffect(() => {
    const c = cerceve.current;
    if (!c) return;
    let zaman = 0;
    const tekerlek = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIpucu(true);
        window.clearTimeout(zaman);
        zaman = window.setTimeout(() => setIpucu(false), 1500);
        return;
      }
      e.preventDefault();
      const r = c.getBoundingClientRect();
      const d = Math.max(-60, Math.min(60, e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY));
      yakinlas(Math.exp(-d * 0.006), e.clientX - r.left, e.clientY - r.top);
    };
    c.addEventListener("wheel", tekerlek, { passive: false });
    return () => {
      c.removeEventListener("wheel", tekerlek);
      window.clearTimeout(zaman);
    };
  }, []);

  function imlecBas(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    imlecler.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = surukleme.current;
    if (imlecler.current.size === 1) {
      s.basX = e.clientX;
      s.basY = e.clientY;
      s.tasindi = false;
    } else if (imlecler.current.size === 2) {
      const [a, b] = [...imlecler.current.values()];
      s.mesafe = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function imlecTasi(e: PointerEvent<HTMLDivElement>) {
    const onceki = imlecler.current.get(e.pointerId);
    const g = gorunum.current;
    if (!onceki || !g) return;
    const simdi = { x: e.clientX, y: e.clientY };
    const s = surukleme.current;

    if (imlecler.current.size === 1) {
      if (!s.tasindi) {
        // Birkaç piksellik titreme dokunuş sayılır; kart tıklaması kaybolmasın.
        if (Math.hypot(simdi.x - s.basX, simdi.y - s.basY) < 5) return;
        s.tasindi = true;
        setSurukleniyor(true);
        // Yakalama ancak sürükleme başlayınca: baştan yakalanırsa tıklama
        // karttan tuvale kayar.
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      imlecler.current.set(e.pointerId, simdi);
      uygula({ ...g, x: g.x + simdi.x - onceki.x, y: g.y + simdi.y - onceki.y });
      return;
    }

    if (imlecler.current.size === 2) {
      const diger = [...imlecler.current].find(([id]) => id !== e.pointerId)![1];
      imlecler.current.set(e.pointerId, simdi);
      s.tasindi = true;
      const mesafe = Math.hypot(simdi.x - diger.x, simdi.y - diger.y);
      const r = e.currentTarget.getBoundingClientRect();
      const onceX = (onceki.x + diger.x) / 2 - r.left;
      const onceY = (onceki.y + diger.y) / 2 - r.top;
      const k = sinirla(g.k * (mesafe / (s.mesafe || mesafe)));
      const f = k / g.k;
      uygula({
        k,
        x: (simdi.x + diger.x) / 2 - r.left - (onceX - g.x) * f,
        y: (simdi.y + diger.y) / 2 - r.top - (onceY - g.y) * f
      });
      s.mesafe = mesafe;
    }
  }

  function imlecBitti(e: PointerEvent<HTMLDivElement>) {
    imlecler.current.delete(e.pointerId);
    if (imlecler.current.size === 0) setSurukleniyor(false);
  }

  function tus(e: KeyboardEvent<HTMLDivElement>) {
    const g = gorunum.current;
    if (!g) return;
    const adim = 96;
    const oklar: Record<string, [number, number]> = {
      ArrowLeft: [adim, 0],
      ArrowRight: [-adim, 0],
      ArrowUp: [0, adim],
      ArrowDown: [0, -adim]
    };
    if (oklar[e.key]) uygula({ ...g, x: g.x + oklar[e.key][0], y: g.y + oklar[e.key][1] }, true);
    else if (e.key === "+" || e.key === "=") yakinlas(1.25, undefined, undefined, true);
    else if (e.key === "-" || e.key === "_") yakinlas(0.8, undefined, undefined, true);
    else if (e.key === "0") sigdir();
    else return;
    e.preventDefault();
  }

  const sahneStili = {
    width: yer.genislik,
    height: yer.yukseklik,
    transform: ilkDonusum,
    "--kart-g": `${OLCU.kartG}px`,
    "--kart-y": `${OLCU.kartY}px`
  } as CSSProperties;

  return (
    <>
      <div
        className="soy-kabuk"
        onKeyDown={(e) => {
          if (e.key === "Escape" && secili) {
            setSecili(null);
            cerceve.current?.focus();
          }
        }}
      >
        <div className="soy-araclar" role="toolbar" aria-label="Görünüm">
          <button className="soy-arac" type="button" aria-label="Yakınlaştır" onClick={() => yakinlas(1.25, undefined, undefined, true)}>
            <Ikon d="M12 5v14M5 12h14" />
          </button>
          <button className="soy-arac" type="button" aria-label="Uzaklaştır" onClick={() => yakinlas(0.8, undefined, undefined, true)}>
            <Ikon d="M5 12h14" />
          </button>
          <button className="soy-arac" type="button" onClick={sigdir}>
            Sığdır
          </button>
          {odak !== kok ? (
            <button
              className="soy-arac is-vurgu"
              type="button"
              onClick={() => {
                setSecili(null);
                merkezeAl(kok);
              }}
            >
              <Ikon d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
              Başa dön
            </button>
          ) : null}
        </div>

        <div
          ref={cerceve}
          className={`soy-tuval${surukleniyor ? " is-surukleniyor" : ""}`}
          tabIndex={0}
          role="group"
          aria-label="Soy ağacı. Sürükleyerek ya da ok tuşlarıyla gezin, artı ve eksi ile yakınlaştırın."
          onPointerDown={imlecBas}
          onPointerMove={imlecTasi}
          onPointerUp={imlecBitti}
          onPointerCancel={imlecBitti}
          onKeyDown={tus}
        >
          <div ref={sahne} className="soy-sahne" style={sahneStili}>
            <svg
              className={`soy-cizgiler${gecis ? " is-gecis" : ""}`}
              width={yer.genislik}
              height={yer.yukseklik}
              aria-hidden="true"
            >
              {yer.cizgiler.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>

            {yer.kartlar.map((kart) => {
              const k = aile.kisi(kart.id);
              const etiket = yakinlik[kart.id].kisa;
              const yil = yillar(k);
              const sinif = [
                "soy-kart",
                kart.id === kok && "is-kok",
                kart.id === odak && "is-odak",
                kart.id === secili && "is-secili",
                k.sanal && "is-sanal"
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={kart.anahtar}
                  type="button"
                  className={sinif}
                  style={{ transform: `translate(${kart.x}px, ${kart.y}px)` }}
                  aria-label={[adSoyad(k), etiket.toLocaleLowerCase("tr-TR"), yil].filter(Boolean).join(", ")}
                  onClick={(e) => {
                    // Sürüklemenin sonundaki tıklama seçim sayılmaz. Klavyeden
                    // gelen tıklamanın detail'i 0: ondan önce imleç basılmadığı
                    // için bayrak eski sürüklemeden kalmış olabilir.
                    if (e.detail !== 0 && surukleme.current.tasindi) return;
                    flushSync(() => setSecili(kart.id));
                    gorunurYap(kart.id);
                  }}
                  onFocus={(e) => {
                    if (e.currentTarget.matches(":focus-visible")) gorunurYap(kart.id);
                  }}
                >
                  {etiket ? <span className="soy-kart-etiket">{etiket}</span> : null}
                  <span className="soy-kart-ad">{adSoyad(k)}</span>
                  {yil ? <span className="soy-kart-yil">{yil}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <p className={`soy-ipucu${ipucu ? " is-acik" : ""}`} aria-hidden="true">
          Yakınlaştırmak için Ctrl + tekerlek
        </p>

        {secili ? (
          <KisiPaneli
            ref={panel}
            id={secili}
            aile={aile}
            yakinlik={yakinlik}
            odakta={secili === odak}
            onKapat={() => setSecili(null)}
            onSec={(id) => sec(id)}
            onMerkez={merkezeAl}
          />
        ) : null}
      </div>

      <section className="soy-liste" aria-labelledby="soy-liste-baslik">
        <h2 id="soy-liste-baslik">Kişiler</h2>
        {kusaklar.map((kusak) => (
          <div className="soy-kusak" key={kusak.baslik}>
            <h3>{kusak.baslik}</h3>
            <ul>
              {kusak.kisiler.map((id) => {
                const k = aile.kisi(id);
                const alt = [yakinlik[id].kisa, yillar(k)].filter(Boolean).join(" · ");
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`soy-satir${k.sanal ? " is-sanal" : ""}`}
                      aria-current={id === secili || undefined}
                      onClick={() => sec(id, true)}
                    >
                      <span className="soy-satir-ad">{adSoyad(k)}</span>
                      {alt ? <span className="soy-satir-alt">{alt}</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}

type PanelProps = {
  ref: Ref<HTMLElement>;
  id: string;
  aile: Aile;
  yakinlik: Record<string, Yakinlik>;
  odakta: boolean;
  onKapat: () => void;
  onSec: (id: string) => void;
  onMerkez: (id: string) => void;
};

function KisiPaneli({ ref, id, aile, yakinlik, odakta, onKapat, onSec, onMerkez }: PanelProps) {
  const k = aile.kisi(id);
  const { kisa, uzun } = yakinlik[id];
  const dogum = olayYazisi(k.dogum);

  const bilgiler: [string, string][] = [];
  if (k.oncekiSoyad) bilgiler.push(["Önceki soyadı", k.oncekiSoyad]);
  if (dogum) bilgiler.push(["Doğum", dogum]);
  if (k.vefat) bilgiler.push(["Vefat", olayYazisi(k.vefat) || "Tarihi bilinmiyor"]);
  if (k.kutuk) bilgiler.push(["Nüfus kaydı", k.kutuk]);

  const gruplar: [string, string[]][] = [
    ["Anne-babası", [k.baba, k.anne].filter((e): e is string => Boolean(e))],
    [k.esler.length > 1 ? "Eşleri" : "Eşi", k.esler],
    ["Çocukları", aile.cocuklar(id)],
    ["Kardeşleri", aile.kardesler(id)]
  ];

  return (
    <aside ref={ref} className="soy-panel" aria-labelledby="soy-panel-ad">
      <button className="soy-panel-kapat" type="button" aria-label="Kapat" onClick={onKapat}>
        <Ikon d="M18 6 6 18M6 6l12 12" />
      </button>

      {kisa ? <p className="soy-panel-etiket">{kisa}</p> : null}
      <h2 id="soy-panel-ad">{adSoyad(k)}</h2>
      {uzun && uzun !== kisa ? <p className="soy-panel-yol">{uzun}</p> : null}

      {bilgiler.length ? (
        <dl className="soy-panel-bilgi">
          {bilgiler.map(([ad, deger]) => (
            <div key={ad}>
              <dt>{ad}</dt>
              <dd>{deger}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {k.sanal ? <p className="soy-panel-not">Yalnızca adı biliniyor.</p> : null}
      {k.hayatta ? <p className="soy-panel-not">Hayatta; doğum tarihi ve yeri bu sayfada paylaşılmıyor.</p> : null}
      {k.not ? <p className="soy-panel-metin">{k.not}</p> : null}

      {gruplar.map(([baslik, kimler]) =>
        kimler.length ? (
          <div className="soy-panel-grup" key={baslik}>
            <h3>{baslik}</h3>
            <ul>
              {kimler.map((kim) => (
                <li key={kim}>
                  <button type="button" onClick={() => onSec(kim)}>
                    {adSoyad(aile.kisi(kim))}
                    {yakinlik[kim].kisa ? <small>{yakinlik[kim].kisa}</small> : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      )}

      {!odakta ? (
        <button className="btn primary soy-panel-merkez" type="button" onClick={() => onMerkez(id)}>
          Ağacı bu kişiden göster
        </button>
      ) : null}
    </aside>
  );
}
