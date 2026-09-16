"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { api } from "./api";
import { useBalim } from "./baglam";
import { Ikon } from "./ikonlar";
import {
  ALINACAK_KATEGORILERI,
  SINIR,
  alanAdi,
  girdiTutari,
  linkDuzelt,
  tl,
  tlYuvarlak,
  tutarOku,
  type Alinacak,
  type Link
} from "./ortak";
import { BosDurum, OnayKutusu, Pencere, Secim } from "./parcalar";
import { kalemOzeti, kalemTutari, kategoriSirasi } from "./toplamlar";

type Filtre = "hepsi" | "alinacak" | "alindi";

export default function Alinacaklar() {
  const { veri, islem, iyimser } = useBalim();
  const [filtre, setFiltre] = useState<Filtre>("hepsi");
  const [arama, setArama] = useState("");
  const [duzenlenen, setDuzenlenen] = useState<Alinacak | "yeni" | null>(null);

  const ozet = useMemo(() => kalemOzeti(veri.alinacaklar), [veri.alinacaklar]);
  const aranan = arama.trim().toLocaleLowerCase("tr-TR");

  const gruplar = useMemo(() => {
    const harita = new Map<string, Alinacak[]>();
    for (const kalem of veri.alinacaklar) {
      if (filtre !== "hepsi" && (filtre === "alindi") !== kalem.alindi) continue;
      if (aranan && !`${kalem.ad} ${kalem.aciklama} ${kalem.kategori}`.toLocaleLowerCase("tr-TR").includes(aranan)) continue;
      harita.set(kalem.kategori, [...(harita.get(kalem.kategori) ?? []), kalem]);
    }
    return [...harita.entries()]
      .sort(([a], [b]) => kategoriSirasi(a, b))
      .map(([kategori, kalemler]) => ({
        kategori,
        // Alınmamışlar üstte, alınanlar grubun dibine çöker.
        kalemler: kalemler.sort((a, b) => Number(a.alindi) - Number(b.alindi) || a.id - b.id),
        toplam: kalemler.reduce((toplam, kalem) => toplam + (kalemTutari(kalem) ?? 0), 0)
      }));
  }, [veri.alinacaklar, filtre, aranan]);

  function isaretle(kalem: Alinacak) {
    const alindi = !kalem.alindi;
    iyimser((v) => ({ ...v, alinacaklar: v.alinacaklar.map((k) => (k.id === kalem.id ? { ...k, alindi } : k)) }));
    void islem(() => api.yaz(`alinacaklar/${kalem.id}`, "PATCH", { alindi }));
  }

  const filtreler: [Filtre, string, number][] = [
    ["hepsi", "Hepsi", ozet.sayi],
    ["alinacak", "Alınacak", ozet.sayi - ozet.alinanSayi],
    ["alindi", "Alındı", ozet.alinanSayi]
  ];

  return (
    <div className="b-sayfa">
      <header className="b-sayfa-ust">
        <div>
          <h1>Alınacaklar</h1>
          <p>{ozet.sayi ? `${ozet.sayi} kalem · toplam ${tlYuvarlak(ozet.toplam)}` : "Kafe için alınacak her şey burada."}</p>
        </div>
        <button type="button" className="b-dugme b-dugme-ana" onClick={() => setDuzenlenen("yeni")}>
          <Ikon ad="arti" />
          Ekle
        </button>
      </header>

      {ozet.sayi === 0 ? (
        <BosDurum
          ikon="alinacaklar"
          baslik="Liste henüz boş"
          eylem={
            <button type="button" className="b-dugme b-dugme-ana" onClick={() => setDuzenlenen("yeni")}>
              <Ikon ad="arti" />
              İlk kalemi ekle
            </button>
          }
        >
          Espresso makinesi, masa ve sandalyeler, buzdolabı… Aklınıza geleni ekleyin; fiyatını ve linkini sonra da
          girebilirsiniz.
        </BosDurum>
      ) : (
        <>
          <div className="b-kart b-serit">
            <div>
              <span>
                <span className="b-lejant-renk is-alindi" aria-hidden="true" />
                Alındı
              </span>
              <strong>{tlYuvarlak(ozet.alinan)}</strong>
            </div>
            <div>
              <span>
                <span className="b-lejant-renk is-kalan" aria-hidden="true" />
                Alınacak
              </span>
              <strong>{tlYuvarlak(ozet.kalan)}</strong>
            </div>
            <div className="b-olcer" aria-hidden="true">
              <span style={{ width: `${ozet.toplam ? (ozet.alinan / ozet.toplam) * 100 : 0}%` }} />
            </div>
            {ozet.fiyatsiz ? (
              <p className="b-not-satiri is-uyari">
                <Ikon ad="uyari" />
                {ozet.fiyatsiz} kalemin fiyatı yok, toplamlara dahil değil.
              </p>
            ) : null}
          </div>

          <div className="b-arac-cubugu">
            <div className="b-bolumlu" role="group" aria-label="Hangileri görünsün">
              {filtreler.map(([id, ad, sayi]) => (
                <button key={id} type="button" aria-pressed={filtre === id} onClick={() => setFiltre(id)}>
                  {ad} <span>{sayi}</span>
                </button>
              ))}
            </div>
            {ozet.sayi > 6 ? (
              <label className="b-arama">
                <Ikon ad="ara" />
                <input
                  type="search"
                  placeholder="Listede ara"
                  aria-label="Alınacaklarda ara"
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                />
              </label>
            ) : null}
          </div>

          {gruplar.length === 0 ? (
            <p className="b-bos-kucuk">Bu seçime uyan kalem yok.</p>
          ) : (
            gruplar.map((grup) => (
              <section key={grup.kategori} className="b-grup" aria-label={grup.kategori}>
                <h2 className="b-grup-baslik">
                  <span>{grup.kategori}</span>
                  {grup.toplam ? <span>{tlYuvarlak(grup.toplam)}</span> : null}
                </h2>
                <ul className="b-kart b-liste">
                  {grup.kalemler.map((kalem) => (
                    <KalemSatiri
                      key={kalem.id}
                      kalem={kalem}
                      isaretle={() => isaretle(kalem)}
                      ac={() => setDuzenlenen(kalem)}
                    />
                  ))}
                </ul>
              </section>
            ))
          )}
        </>
      )}

      {duzenlenen ? (
        <KalemPenceresi kalem={duzenlenen === "yeni" ? null : duzenlenen} kapat={() => setDuzenlenen(null)} />
      ) : null}
    </div>
  );
}

function KalemSatiri({ kalem, isaretle, ac }: { kalem: Alinacak; isaretle: () => void; ac: () => void }) {
  const { kisi } = useBalim();
  const tutar = kalemTutari(kalem);
  const ekleyen = kisi(kalem.ekleyenId);
  const adetYazisi =
    kalem.adet > 1 ? (kalem.birimFiyat !== null ? `${kalem.adet} × ${tl(kalem.birimFiyat)}` : `${kalem.adet} adet`) : null;

  return (
    <li className={`b-satir b-kalem${kalem.alindi ? " is-tamam" : ""}`}>
      <OnayKutusu isaretli={kalem.alindi} etiket={`${kalem.ad} alındı`} degis={isaretle} />
      <button type="button" className="b-satir-govde" onClick={ac}>
        <span className="b-satir-baslik">{kalem.ad}</span>
        {kalem.aciklama ? <span className="b-satir-not">{kalem.aciklama}</span> : null}
        <span className="b-satir-alt">
          {adetYazisi ? <span>{adetYazisi}</span> : null}
          {ekleyen ? <span>{ekleyen.ad} ekledi</span> : null}
        </span>
      </button>
      <span className={`b-kalem-tutar${tutar === null ? " is-yok" : ""}`}>{tutar === null ? "Fiyat yok" : tl(tutar)}</span>
      {kalem.linkler.length ? (
        <div className="b-kalem-linkler">
          {kalem.linkler.map((link, i) => (
            <a key={`${i}-${link.url}`} className="b-cip" href={link.url} target="_blank" rel="noopener noreferrer">
              <Ikon ad="link" />
              <span>{link.not || alanAdi(link.url)}</span>
            </a>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function KalemPenceresi({ kalem, kapat }: { kalem: Alinacak | null; kapat: () => void }) {
  const { veri, kisi, islem } = useBalim();
  const formId = useId();
  const [ad, setAd] = useState(kalem?.ad ?? "");
  const [kategori, setKategori] = useState(kalem?.kategori ?? ALINACAK_KATEGORILERI[0]);
  const [adet, setAdet] = useState(String(kalem?.adet ?? 1));
  const [fiyat, setFiyat] = useState(kalem?.birimFiyat != null ? girdiTutari(kalem.birimFiyat) : "");
  const [linkler, setLinkler] = useState<Link[]>(kalem?.linkler ?? []);
  const [aciklama, setAciklama] = useState(kalem?.aciklama ?? "");
  const [alindi, setAlindi] = useState(kalem?.alindi ?? false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  // Listede başka bir kategori kullanılmışsa seçeneklerde o da dursun.
  const kategoriler = useMemo(() => {
    const hepsi = new Set([...ALINACAK_KATEGORILERI, ...veri.alinacaklar.map((k) => k.kategori), kategori]);
    return [...hepsi].sort(kategoriSirasi);
  }, [veri.alinacaklar, kategori]);

  const adetSayisi = Number.parseInt(adet, 10);
  const birimFiyat = tutarOku(fiyat);
  const fiyatGecersiz = Number.isNaN(birimFiyat);
  const toplam = birimFiyat !== null && !fiyatGecersiz && adetSayisi > 0 ? birimFiyat * adetSayisi : null;

  function linkDegistir(sira: number, alan: keyof Link, deger: string) {
    setLinkler((onceki) => onceki.map((link, i) => (i === sira ? { ...link, [alan]: deger } : link)));
  }

  async function kaydet(e: FormEvent) {
    e.preventDefault();
    if (!ad.trim()) return setHata("Ne alınacağını yazın.");
    if (!(adetSayisi >= 1 && adetSayisi <= SINIR.adet)) return setHata("Adet en az 1 olmalı.");
    if (fiyatGecersiz) return setHata("Fiyatı rakamla yazın, örneğin 12.500 ya da 1.249,90");

    const doluLinkler: Link[] = [];
    for (const link of linkler) {
      if (!link.url.trim()) continue;
      const url = linkDuzelt(link.url);
      if (!url) return setHata(`Bu link açılamıyor: ${link.url.slice(0, 60)}`);
      doluLinkler.push({ url, not: link.not.trim() });
    }

    const govde = {
      ad: ad.trim(),
      kategori,
      adet: adetSayisi,
      birimFiyat,
      linkler: doluLinkler,
      aciklama: aciklama.trim(),
      alindi
    };

    if (kalem) {
      const onceki = {
        ad: kalem.ad,
        kategori: kalem.kategori,
        adet: kalem.adet,
        birimFiyat: kalem.birimFiyat,
        linkler: kalem.linkler,
        aciklama: kalem.aciklama,
        alindi: kalem.alindi
      };
      // Hiçbir şey değişmediyse "düzenledi" diye boş bir hareket yazılmasın.
      if (JSON.stringify(onceki) === JSON.stringify(govde)) return kapat();
    }

    setBekliyor(true);
    setHata(null);
    const sonuc = await islem(
      () => (kalem ? api.yaz(`alinacaklar/${kalem.id}`, "PATCH", govde) : api.yaz("alinacaklar", "POST", govde)),
      { basari: kalem ? "Kaydedildi" : "Listeye eklendi", sessiz: true }
    );
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  async function sil() {
    if (!kalem || !window.confirm(`"${kalem.ad}" listeden silinsin mi?`)) return;
    setBekliyor(true);
    const sonuc = await islem(() => api.yaz(`alinacaklar/${kalem.id}`, "DELETE"), { basari: "Silindi", sessiz: true });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  const ekleyen = kalem ? kisi(kalem.ekleyenId) : undefined;

  return (
    <Pencere
      baslik={kalem ? "Kalemi düzenle" : "Yeni alınacak"}
      kapat={kapat}
      alt={
        <>
          {kalem ? (
            <button type="button" className="b-dugme b-dugme-sade is-tehlike" onClick={sil} disabled={bekliyor}>
              <Ikon ad="cop" />
              Sil
            </button>
          ) : null}
          <span className="b-bosluk" />
          <button type="button" className="b-dugme" onClick={kapat}>
            Vazgeç
          </button>
          <button type="submit" form={formId} className="b-dugme b-dugme-ana" disabled={bekliyor}>
            {bekliyor ? "Kaydediliyor…" : kalem ? "Kaydet" : "Ekle"}
          </button>
        </>
      }
    >
      <form id={formId} className="b-form" onSubmit={kaydet}>
        <label className="b-alan">
          <span>Ne alınacak?</span>
          <input
            className="b-girdi"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            maxLength={SINIR.ad}
            placeholder="Örneğin: Espresso makinesi"
            data-ilk-odak={kalem ? undefined : ""}
            enterKeyHint="next"
          />
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

        <div className="b-alan-cift">
          <div className="b-alan">
            <span id={`${formId}-adet`}>Adet</span>
            <div className="b-adet" role="group" aria-labelledby={`${formId}-adet`}>
              <button
                type="button"
                className="b-dugme b-dugme-ikon"
                aria-label="Bir azalt"
                onClick={() => setAdet(String(Math.max(1, (adetSayisi || 1) - 1)))}
              >
                <Ikon ad="eksi" />
              </button>
              <input
                className="b-girdi"
                inputMode="numeric"
                aria-label="Adet"
                value={adet}
                onChange={(e) => setAdet(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <button
                type="button"
                className="b-dugme b-dugme-ikon"
                aria-label="Bir artır"
                onClick={() => setAdet(String(Math.min(SINIR.adet, (adetSayisi || 0) + 1)))}
              >
                <Ikon ad="arti" />
              </button>
            </div>
          </div>

          <label className="b-alan">
            <span>{adetSayisi > 1 ? "Tanesinin fiyatı" : "Fiyatı"}</span>
            <span className="b-tutar-girdi">
              <input
                className="b-girdi"
                inputMode="decimal"
                value={fiyat}
                onChange={(e) => setFiyat(e.target.value)}
                placeholder="Bilinmiyorsa boş"
                aria-invalid={fiyatGecersiz}
              />
              <span aria-hidden="true">TL</span>
            </span>
          </label>
        </div>
        {toplam !== null && adetSayisi > 1 ? <p className="b-form-toplam">Toplam: {tl(toplam)}</p> : null}

        <fieldset className="b-alan b-linkler">
          <legend>Linkler</legend>
          {linkler.map((link, i) => (
            <div key={i} className="b-link-satiri">
              <input
                className="b-girdi"
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Linki yapıştırın"
                aria-label={`${i + 1}. link`}
                value={link.url}
                onChange={(e) => linkDegistir(i, "url", e.target.value)}
              />
              <input
                className="b-girdi"
                placeholder="Not: Trendyol, siyah olan…"
                aria-label={`${i + 1}. linkin notu`}
                maxLength={SINIR.linkNotu}
                value={link.not}
                onChange={(e) => linkDegistir(i, "not", e.target.value)}
              />
              <button
                type="button"
                className="b-dugme b-dugme-ikon b-dugme-sade"
                aria-label={`${i + 1}. linki kaldır`}
                onClick={() => setLinkler((onceki) => onceki.filter((_, sira) => sira !== i))}
              >
                <Ikon ad="kapat" />
              </button>
            </div>
          ))}
          {linkler.length < SINIR.linkSayisi ? (
            <button
              type="button"
              className="b-dugme b-dugme-sade b-dugme-ekle"
              onClick={() => setLinkler((onceki) => [...onceki, { url: "", not: "" }])}
            >
              <Ikon ad="link" />
              {linkler.length ? "Bir link daha ekle" : "Link ekle"}
            </button>
          ) : null}
        </fieldset>

        <label className="b-alan">
          <span>Not</span>
          <textarea
            className="b-girdi"
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            maxLength={SINIR.aciklama}
            rows={3}
            placeholder="Ölçü, renk, kimden alınacak…"
          />
        </label>

        <label className="b-anahtar">
          <input type="checkbox" checked={alindi} onChange={(e) => setAlindi(e.target.checked)} />
          <span className="b-anahtar-kutu" aria-hidden="true" />
          <span>Alındı</span>
        </label>

        {hata ? (
          <p className="b-form-hata" role="alert">
            <Ikon ad="uyari" />
            {hata}
          </p>
        ) : null}

        {ekleyen && kalem ? <p className="b-form-kunye">{ekleyen.ad} ekledi</p> : null}
      </form>
    </Pencere>
  );
}
