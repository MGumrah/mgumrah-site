"use client";

import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { api, gorselAdresi } from "./api";
import { useBalim } from "./baglam";
import { gorselHazirla } from "./gorsel-hazirla";
import { Ikon } from "./ikonlar";
import { GORSEL_KATEGORILERI, SINIR, type Gorsel } from "./ortak";
import { BosDurum, Pencere, Secim, useDakika } from "./parcalar";
import { goreceZaman } from "./zaman";

/** Bir seferde seçilebilecek fotoğraf: fazlası sırayla yüklenirken sayfa çok uzun meşgul kalır. */
const TEK_SEFERDE = 30;

const kategoriSirasi = (a: string, b: string) => {
  const sira = (k: string) => (GORSEL_KATEGORILERI.includes(k) ? GORSEL_KATEGORILERI.indexOf(k) : GORSEL_KATEGORILERI.length - 1.5);
  return sira(a) - sira(b) || a.localeCompare(b, "tr");
};

export default function Gorseller() {
  const { veri, bildir } = useBalim();
  const [kategori, setKategori] = useState<string | null>(null);
  const [secilenler, setSecilenler] = useState<File[] | null>(null);
  const [acik, setAcik] = useState<number | null>(null);
  const [surukleniyor, setSurukleniyor] = useState(false);
  const dosyaGirdisi = useRef<HTMLInputElement>(null);
  useDakika();

  const kategoriler = useMemo(() => {
    const sayilar = new Map<string, number>();
    for (const g of veri.gorseller) sayilar.set(g.kategori, (sayilar.get(g.kategori) ?? 0) + 1);
    return [...sayilar.entries()].sort(([a], [b]) => kategoriSirasi(a, b));
  }, [veri.gorseller]);

  const gorunen = kategori ? veri.gorseller.filter((g) => g.kategori === kategori) : veri.gorseller;

  function dosyalariAl(liste: FileList | File[] | null | undefined) {
    const resimler = [...(liste ?? [])].filter((dosya) => dosya.type.startsWith("image/") || dosya.type === "");
    if (!resimler.length) return;
    if (resimler.length > TEK_SEFERDE) bildir(`Bir seferde en fazla ${TEK_SEFERDE} fotoğraf; ilk ${TEK_SEFERDE} tanesi alındı.`);
    setSecilenler(resimler.slice(0, TEK_SEFERDE));
  }

  // Bilgisayarda panodan yapıştırmak: yapay zekanın ürettiği görseli
  // "Kopyala" deyip buraya Ctrl+V ile bırakmak en kısa yol.
  useEffect(() => {
    const yapistir = (e: ClipboardEvent) => {
      const dosyalar = [...(e.clipboardData?.files ?? [])].filter((d) => d.type.startsWith("image/"));
      if (!dosyalar.length || document.querySelector("dialog[open]")) return;
      e.preventDefault();
      setSecilenler(dosyalar.slice(0, TEK_SEFERDE));
    };
    document.addEventListener("paste", yapistir);
    return () => document.removeEventListener("paste", yapistir);
  }, []);

  const surukle = {
    onDragOver: (e: DragEvent) => {
      if (![...e.dataTransfer.types].includes("Files")) return;
      e.preventDefault();
      setSurukleniyor(true);
    },
    onDragLeave: (e: DragEvent) => {
      // İçerideki bir kareden ötekine geçmek de dragleave atar; yalnızca sayfadan çıkınca söndür.
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSurukleniyor(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setSurukleniyor(false);
      dosyalariAl(e.dataTransfer.files);
    }
  };

  const dosyaSec = () => dosyaGirdisi.current?.click();

  return (
    <div className={`b-sayfa b-gorseller${surukleniyor ? " is-surukleniyor" : ""}`} {...surukle}>
      <input
        ref={dosyaGirdisi}
        className="b-gizli"
        type="file"
        accept="image/*"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          dosyalariAl(e.target.files);
          e.target.value = "";
        }}
      />
      <header className="b-sayfa-ust">
        <div>
          <h1>Görseller</h1>
          <p>
            {veri.gorseller.length
              ? `${veri.gorseller.length} görsel`
              : "Yapay zeka çizimleri, dükkanın hâli, beğendiğiniz örnekler."}
          </p>
        </div>
        <button type="button" className="b-dugme b-dugme-ana" onClick={dosyaSec}>
          <Ikon ad="yukle" />
          Fotoğraf ekle
        </button>
      </header>

      {veri.gorseller.length === 0 ? (
        <BosDurum
          ikon="gorseller"
          baslik="Henüz görsel yok"
          eylem={
            <button type="button" className="b-dugme b-dugme-ana" onClick={dosyaSec}>
              <Ikon ad="yukle" />
              İlk fotoğrafı ekle
            </button>
          }
        >
          Telefondan fotoğraf seçebilir, bilgisayarda sürükleyip bırakabilir ya da kopyaladığınız görseli Ctrl+V ile
          yapıştırabilirsiniz.
        </BosDurum>
      ) : (
        <>
          <div className="b-cipler b-gorsel-filtre" role="group" aria-label="Kategori">
            <button type="button" className="b-cip-secim" aria-pressed={kategori === null} onClick={() => setKategori(null)}>
              Hepsi <span>{veri.gorseller.length}</span>
            </button>
            {kategoriler.map(([ad, sayi]) => (
              <button key={ad} type="button" className="b-cip-secim" aria-pressed={kategori === ad} onClick={() => setKategori(ad)}>
                {ad} <span>{sayi}</span>
              </button>
            ))}
          </div>

          <ul className="b-gorsel-izgara">
            {gorunen.map((g, i) => (
              <GorselKarti key={g.id} gorsel={g} ac={() => setAcik(i)} />
            ))}
          </ul>
          <p className="b-gorsel-ipucu">Bilgisayarda görseli sayfaya sürükleyebilir ya da Ctrl+V ile yapıştırabilirsiniz.</p>
        </>
      )}

      {secilenler ? (
        <YuklemePenceresi
          dosyalar={secilenler}
          varsayilanKategori={kategori ?? GORSEL_KATEGORILERI[0]}
          kapat={() => setSecilenler(null)}
        />
      ) : null}
      {acik !== null && gorunen.length ? (
        <GorselGosterici gorseller={gorunen} baslangic={acik} kapat={() => setAcik(null)} />
      ) : null}
    </div>
  );
}

function GorselKarti({ gorsel, ac }: { gorsel: Gorsel; ac: () => void }) {
  const { kisi } = useBalim();
  const ekleyen = kisi(gorsel.ekleyenId);
  return (
    <li>
      <button type="button" className="b-gorsel-kart" onClick={ac}>
        <span className="b-gorsel-cerceve">
          <img src={gorselAdresi(gorsel.id, true)} alt="" loading="lazy" decoding="async" />
        </span>
        <span className="b-gorsel-yazi">
          <span className="b-gorsel-baslik">{gorsel.baslik || gorsel.kategori}</span>
          <span className="b-gorsel-kunye">
            {ekleyen ? `${ekleyen.ad} · ` : ""}
            {goreceZaman(gorsel.olusturuldu)}
          </span>
        </span>
      </button>
    </li>
  );
}

function YuklemePenceresi({
  dosyalar,
  varsayilanKategori,
  kapat
}: {
  dosyalar: File[];
  varsayilanKategori: string;
  kapat: () => void;
}) {
  const { islem, bildir } = useBalim();
  const formId = useId();
  const [kategori, setKategori] = useState(varsayilanKategori);
  const [baslik, setBaslik] = useState("");
  const [ilerleme, setIlerleme] = useState<string | null>(null);
  const [hatalar, setHatalar] = useState<string[]>([]);
  const [onizlemeler, setOnizlemeler] = useState<string[]>([]);

  useEffect(() => {
    const adresler = dosyalar.map((dosya) => URL.createObjectURL(dosya));
    setOnizlemeler(adresler);
    return () => adresler.forEach((adres) => URL.revokeObjectURL(adres));
  }, [dosyalar]);

  async function yukle(e: FormEvent) {
    e.preventDefault();
    const sorunlar: string[] = [];
    let yuklenen = 0;

    for (let i = 0; i < dosyalar.length; i += 1) {
      const dosya = dosyalar[i];
      const sira = dosyalar.length > 1 ? ` (${i + 1}/${dosyalar.length})` : "";
      try {
        setIlerleme(`Hazırlanıyor${sira}…`);
        const hazir = await gorselHazirla(dosya);
        setIlerleme(`Yükleniyor${sira}…`);

        const form = new FormData();
        form.append("dosya", hazir.buyuk, dosya.name);
        form.append("kucuk", hazir.kucuk, `kucuk-${dosya.name}`);
        form.append("baslik", baslik.trim());
        form.append("kategori", kategori);
        form.append("genislik", String(hazir.genislik));
        form.append("yukseklik", String(hazir.yukseklik));

        const hata = await islem(() => api.gorselYukle(form), { sessiz: true });
        if (hata) sorunlar.push(`${dosya.name}: ${hata}`);
        else yuklenen += 1;
      } catch (hata) {
        sorunlar.push(`${dosya.name}: ${hata instanceof Error ? hata.message : "yüklenemedi"}`);
      }
    }

    setIlerleme(null);
    if (yuklenen) bildir(yuklenen === 1 ? "Fotoğraf yüklendi" : `${yuklenen} fotoğraf yüklendi`);
    if (sorunlar.length) setHatalar(sorunlar);
    else kapat();
  }

  const yukleniyor = ilerleme !== null;

  return (
    <Pencere
      baslik={dosyalar.length === 1 ? "Fotoğraf ekle" : `${dosyalar.length} fotoğraf ekle`}
      kapat={() => {
        if (!yukleniyor) kapat();
      }}
      alt={
        <>
          {ilerleme ? (
            <span className="b-ilerleme" role="status">
              {ilerleme}
            </span>
          ) : null}
          <span className="b-bosluk" />
          <button type="button" className="b-dugme" onClick={kapat} disabled={yukleniyor}>
            {hatalar.length ? "Kapat" : "Vazgeç"}
          </button>
          {hatalar.length ? null : (
            <button type="submit" form={formId} className="b-dugme b-dugme-ana" disabled={yukleniyor}>
              <Ikon ad="yukle" />
              Yükle
            </button>
          )}
        </>
      }
    >
      <form id={formId} className="b-form" onSubmit={yukle}>
        <ul className="b-onizlemeler">
          {onizlemeler.map((adres, i) => (
            <li key={adres}>
              <img src={adres} alt={dosyalar[i].name} />
            </li>
          ))}
        </ul>

        <label className="b-alan">
          <span>Kategori</span>
          <Secim value={kategori} onChange={(e) => setKategori(e.target.value)} disabled={yukleniyor}>
            {GORSEL_KATEGORILERI.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Secim>
        </label>
        <label className="b-alan">
          <span>{dosyalar.length > 1 ? "Açıklama (hepsine yazılır)" : "Açıklama"}</span>
          <input
            className="b-girdi"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            maxLength={SINIR.baslik}
            placeholder="Örneğin: Vitrin için ahşap tezgâh fikri"
            disabled={yukleniyor}
          />
        </label>

        {hatalar.length ? (
          <div className="b-form-hata" role="alert">
            <Ikon ad="uyari" />
            <div>
              <p>Bazı fotoğraflar yüklenemedi:</p>
              <ul>
                {hatalar.map((hata) => (
                  <li key={hata}>{hata}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </form>
    </Pencere>
  );
}

const UZANTILAR: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif"
};

function dosyaAdi(gorsel: Gorsel) {
  const ad = (gorsel.baslik || gorsel.kategori)
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `balim-${ad || "gorsel"}.${UZANTILAR[gorsel.tur] ?? "jpg"}`;
}

function GorselGosterici({ gorseller, baslangic, kapat }: { gorseller: Gorsel[]; baslangic: number; kapat: () => void }) {
  const { kisi, islem } = useBalim();
  const [sira, setSira] = useState(baslangic);
  const [duzenleniyor, setDuzenleniyor] = useState(false);
  const dokunus = useRef<{ x: number; y: number } | null>(null);

  // Başkası sildiyse ya da filtre küçüldüyse sıra listenin dışında kalmasın.
  const gecerliSira = Math.min(sira, gorseller.length - 1);
  const gorsel = gorseller[gecerliSira];

  useEffect(() => {
    if (duzenleniyor || gorseller.length < 2) return;
    const tus = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setSira((s) => (Math.min(s, gorseller.length - 1) + 1) % gorseller.length);
      if (e.key === "ArrowLeft") setSira((s) => (Math.min(s, gorseller.length - 1) - 1 + gorseller.length) % gorseller.length);
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [duzenleniyor, gorseller.length]);

  if (!gorsel) return null;

  const git = (adim: number) => {
    setDuzenleniyor(false);
    setSira((gecerliSira + adim + gorseller.length) % gorseller.length);
  };

  async function sil() {
    if (!window.confirm("Bu görsel herkes için silinsin mi?")) return;
    const kalan = gorseller.length - 1;
    const sonuc = await islem(() => api.yaz(`gorseller/${gorsel.id}`, "DELETE"), { basari: "Görsel silindi" });
    if (!sonuc && kalan === 0) kapat();
  }

  const ekleyen = kisi(gorsel.ekleyenId);

  return (
    <Pencere baslik={gorsel.baslik || gorsel.kategori} kapat={kapat} disaridanKapanir sinif="b-isik-kutusu">
      <div
        className="b-isik-sahne"
        onTouchStart={(e) => {
          dokunus.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          const bas = dokunus.current;
          dokunus.current = null;
          if (!bas || gorseller.length < 2) return;
          const dx = e.changedTouches[0].clientX - bas.x;
          const dy = e.changedTouches[0].clientY - bas.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) git(dx < 0 ? 1 : -1);
        }}
      >
        <img
          key={gorsel.id}
          src={gorselAdresi(gorsel.id)}
          alt={gorsel.baslik || gorsel.kategori}
          style={{ backgroundImage: `url(${gorselAdresi(gorsel.id, true)})` }}
        />
        {gorseller.length > 1 ? (
          <>
            <button type="button" className="b-isik-ok is-sol" onClick={() => git(-1)} aria-label="Önceki görsel">
              <Ikon ad="sol" />
            </button>
            <button type="button" className="b-isik-ok is-sag" onClick={() => git(1)} aria-label="Sonraki görsel">
              <Ikon ad="sag" />
            </button>
          </>
        ) : null}
      </div>

      {duzenleniyor ? (
        <GorselDuzenle key={gorsel.id} gorsel={gorsel} bitti={() => setDuzenleniyor(false)} />
      ) : (
        <div className="b-isik-bilgi">
          <p className="b-isik-kunye">
            {gorsel.kategori}
            {ekleyen ? ` · ${ekleyen.ad} ekledi` : ""} · {goreceZaman(gorsel.olusturuldu)}
            {gorseller.length > 1 ? ` · ${gecerliSira + 1}/${gorseller.length}` : ""}
          </p>
          <div className="b-isik-eylemler">
            <button type="button" className="b-dugme" onClick={() => setDuzenleniyor(true)}>
              <Ikon ad="kalem" />
              Düzenle
            </button>
            <a className="b-dugme" href={gorselAdresi(gorsel.id)} download={dosyaAdi(gorsel)}>
              <Ikon ad="indir" />
              İndir
            </a>
            <button type="button" className="b-dugme b-dugme-sade is-tehlike" onClick={sil}>
              <Ikon ad="cop" />
              Sil
            </button>
          </div>
        </div>
      )}
    </Pencere>
  );
}

function GorselDuzenle({ gorsel, bitti }: { gorsel: Gorsel; bitti: () => void }) {
  const { islem } = useBalim();
  const [baslik, setBaslik] = useState(gorsel.baslik);
  const [kategori, setKategori] = useState(gorsel.kategori);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: FormEvent) {
    e.preventDefault();
    if (baslik.trim() === gorsel.baslik && kategori === gorsel.kategori) return bitti();
    setBekliyor(true);
    const sonuc = await islem(() => api.yaz(`gorseller/${gorsel.id}`, "PATCH", { baslik: baslik.trim(), kategori }), {
      sessiz: true
    });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else bitti();
  }

  const kategoriler = GORSEL_KATEGORILERI.includes(gorsel.kategori)
    ? GORSEL_KATEGORILERI
    : [...GORSEL_KATEGORILERI, gorsel.kategori];

  return (
    <form className="b-isik-bilgi b-form" onSubmit={kaydet}>
      <div className="b-alan-cift">
        <label className="b-alan">
          <span>Açıklama</span>
          <input className="b-girdi" value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={SINIR.baslik} />
        </label>
        <label className="b-alan">
          <span>Kategori</span>
          <Secim value={kategori} onChange={(e) => setKategori(e.target.value)}>
            {kategoriler.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Secim>
        </label>
      </div>
      {hata ? (
        <p className="b-form-hata" role="alert">
          <Ikon ad="uyari" />
          {hata}
        </p>
      ) : null}
      <div className="b-isik-eylemler">
        <button type="button" className="b-dugme" onClick={bitti}>
          Vazgeç
        </button>
        <button type="submit" className="b-dugme b-dugme-ana" disabled={bekliyor}>
          Kaydet
        </button>
      </div>
    </form>
  );
}
