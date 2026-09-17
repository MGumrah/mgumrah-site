"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { api, ApiHatasi, gorselAdresi } from "./api";
import { useBalim } from "./baglam";
import { gorselHazirla } from "./gorsel-hazirla";
import { Ikon } from "./ikonlar";
import { SINIR, tarihYazisi, type Mesaj } from "./ortak";
import { Avatar, Pencere, useDakika } from "./parcalar";
import { bugun, gunFarki, istanbulGunu } from "./zaman";

const SAAT = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
/** Aynı kişinin bu süre içindeki ardışık mesajları tek grupta, ad ve resim bir kez. */
const GRUP_ARALIGI_MS = 5 * 60 * 1000;
const LINK = /(https?:\/\/[^\s<]+[^\s<.,;:!?)"'\]])/g;

function gunEtiketi(gun: string) {
  const fark = gunFarki(gun, bugun());
  if (fark === 0) return "Bugün";
  if (fark === 1) return "Dün";
  return tarihYazisi(gun, { yil: gun.slice(0, 4) !== bugun().slice(0, 4), haftaGunu: true });
}

/** Mesajdaki adresler dokunulabilir olsun: aile en çok ürün linki paylaşacak. */
function linkli(yazi: string) {
  return yazi.split(LINK).map((parca, i) =>
    i % 2 === 1 ? (
      <a key={i} href={parca} target="_blank" rel="noopener noreferrer">
        {parca}
      </a>
    ) : (
      <Fragment key={i}>{parca}</Fragment>
    )
  );
}

function birlestir(eskiler: Mesaj[], yeniler: Mesaj[]) {
  const harita = new Map(eskiler.map((m) => [m.id, m]));
  for (const mesaj of yeniler) harita.set(mesaj.id, mesaj);
  return [...harita.values()].sort((a, b) => a.id - b.id);
}

const enAltaYakin = () =>
  window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;

const enAlta = (yumusak: boolean) =>
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: yumusak ? "smooth" : "auto" });

/**
 * Ailenin kendi sohbeti. Mesajlar sayfanın kendisiyle kayar, yazma kutusu
 * altta yapışık durur: iç içe kayan bir kutu, telefonda klavye açılınca hem
 * iOS'ta hem Android'de takılıyor. Yeni mesajı açık sayfa yoklamayla bulur
 * (sohbet açıkken 3 saniyede bir), cebindeki telefona bildirim gider.
 */
export default function Sohbet() {
  const { veri, kisi, bildir, mesajSurum, okunduIsaretle, yenile } = useBalim();
  const [mesajlar, setMesajlar] = useState<Mesaj[] | null>(null);
  const [dahaVar, setDahaVar] = useState(false);
  const [eskilerGeliyor, setEskilerGeliyor] = useState(false);
  const [yazi, setYazi] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoOnizleme, setFotoOnizleme] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [secili, setSecili] = useState<number | null>(null);
  const [acikFoto, setAcikFoto] = useState<Mesaj | null>(null);
  const yaziKutusu = useRef<HTMLTextAreaElement>(null);
  const dosyaGirdisi = useRef<HTMLInputElement>(null);
  useDakika();

  const sonId = mesajlar?.length ? mesajlar[mesajlar.length - 1].id : 0;

  useEffect(() => {
    let iptal = false;
    api
      .mesajlar()
      .then((sayfa) => {
        if (iptal) return;
        setMesajlar(sayfa.mesajlar);
        setDahaVar(sayfa.dahaVar);
        requestAnimationFrame(() => enAlta(false));
      })
      .catch((e) => {
        if (!iptal) {
          setMesajlar([]);
          bildir(e instanceof ApiHatasi ? e.message : "Mesajlar yüklenemedi.", "hata");
        }
      });
    return () => {
      iptal = true;
    };
  }, [bildir]);

  // Yoklama yeni bir mesaj haber verdiyse yalnızca bilinen sonuncudan sonrası çekilir.
  const yuklendi = mesajlar !== null;
  useEffect(() => {
    if (!yuklendi || mesajSurum <= sonId) return;
    let iptal = false;
    api
      .mesajlar({ sonra: sonId })
      .then(({ mesajlar: yeniler }) => {
        if (iptal || !yeniler.length) return;
        const alttaydi = enAltaYakin();
        setMesajlar((onceki) => birlestir(onceki ?? [], yeniler));
        if (alttaydi) requestAnimationFrame(() => enAlta(true));
        // Sohbete düşen fotoğraf Görseller'de de görünsün.
        if (yeniler.some((m) => m.gorsel)) yenile();
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, [mesajSurum, sonId, yuklendi, yenile]);

  // Ekrandaki son mesaj görüldü sayılır; sekme arkadayken değil.
  useEffect(() => {
    if (!sonId) return;
    const isaretle = () => {
      if (document.visibilityState === "visible") okunduIsaretle(sonId);
    };
    isaretle();
    document.addEventListener("visibilitychange", isaretle);
    return () => document.removeEventListener("visibilitychange", isaretle);
  }, [sonId, okunduIsaretle]);

  useEffect(() => {
    if (!foto) {
      setFotoOnizleme(null);
      return;
    }
    const adres = URL.createObjectURL(foto);
    setFotoOnizleme(adres);
    return () => URL.revokeObjectURL(adres);
  }, [foto]);

  const kutuyuBoyutla = useCallback(() => {
    const kutu = yaziKutusu.current;
    if (!kutu) return;
    kutu.style.height = "auto";
    kutu.style.height = `${Math.min(kutu.scrollHeight, 144)}px`;
  }, []);

  useEffect(kutuyuBoyutla, [yazi, kutuyuBoyutla]);

  async function eskileriGetir() {
    if (!mesajlar?.length) return;
    setEskilerGeliyor(true);
    const onceYukseklik = document.documentElement.scrollHeight;
    try {
      const sayfa = await api.mesajlar({ once: mesajlar[0].id });
      setMesajlar((onceki) => birlestir(onceki ?? [], sayfa.mesajlar));
      setDahaVar(sayfa.dahaVar);
      // Üste eklenen mesajlar okunan yeri aşağı itmesin.
      requestAnimationFrame(() => window.scrollBy(0, document.documentElement.scrollHeight - onceYukseklik));
    } catch (e) {
      bildir(e instanceof ApiHatasi ? e.message : "Önceki mesajlar yüklenemedi.", "hata");
    } finally {
      setEskilerGeliyor(false);
    }
  }

  async function gonder() {
    const metin = yazi.trim();
    if ((!metin && !foto) || gonderiliyor) return;
    setGonderiliyor(true);
    try {
      let mesaj: Mesaj | null;
      if (foto) {
        const hazir = await gorselHazirla(foto);
        const form = new FormData();
        form.append("dosya", hazir.buyuk, foto.name);
        form.append("kucuk", hazir.kucuk, `kucuk-${foto.name}`);
        form.append("metin", metin);
        form.append("genislik", String(hazir.genislik));
        form.append("yukseklik", String(hazir.yukseklik));
        mesaj = await api.mesajGonder(form);
        yenile();
      } else {
        mesaj = await api.mesajGonder({ metin });
      }
      setYazi("");
      setFoto(null);
      if (mesaj) setMesajlar((onceki) => birlestir(onceki ?? [], [mesaj]));
      requestAnimationFrame(() => enAlta(true));
    } catch (e) {
      // Yazılan kaybolmasın: kutuda kalır, yeniden gönderilebilir.
      bildir(e instanceof Error ? e.message : "Mesaj gönderilemedi.", "hata");
    } finally {
      setGonderiliyor(false);
    }
  }

  async function sil(mesaj: Mesaj) {
    if (!window.confirm(mesaj.gorsel ? "Mesaj ve fotoğrafı herkesten silinsin mi?" : "Mesaj herkesten silinsin mi?")) return;
    try {
      await api.mesajSil(mesaj.id);
      setMesajlar((onceki) => (onceki ?? []).filter((m) => m.id !== mesaj.id));
      setSecili(null);
      setAcikFoto(null);
      if (mesaj.gorsel) yenile();
    } catch (e) {
      bildir(e instanceof ApiHatasi ? e.message : "Mesaj silinemedi.", "hata");
    }
  }

  function tus(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Bilgisayarda Enter gönderir, Shift+Enter alt satır. Telefonda klavyenin
    // Enter'ı alt satırdır; gönderme düğmesi ayrı.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      e.preventDefault();
      void gonder();
    }
  }

  function yapistir(e: ClipboardEvent<HTMLTextAreaElement>) {
    const resim = [...e.clipboardData.files].find((d) => d.type.startsWith("image/"));
    if (resim) {
      e.preventDefault();
      setFoto(resim);
    }
  }


  return (
    <div className="b-sohbet">
      <header className="b-sayfa-ust">
        <div>
          <h1>Sohbet</h1>
          <p>{veri.kisiler.map((k) => k.ad).join(", ")}</p>
        </div>
      </header>

      {mesajlar === null ? <p className="b-bos-kucuk">Mesajlar yükleniyor…</p> : null}

      {dahaVar ? (
        <button type="button" className="b-sohbet-onceki" onClick={eskileriGetir} disabled={eskilerGeliyor}>
          {eskilerGeliyor ? "Yükleniyor…" : "Önceki mesajlar"}
        </button>
      ) : null}

      {mesajlar?.length === 0 ? (
        <div className="b-bos">
          <span className="b-bos-ikon">
            <Ikon ad="sohbet" />
          </span>
          <p className="b-bos-baslik">Henüz mesaj yok</p>
          <p className="b-bos-metin">
            İlk mesajı yazın. Buraya yazılanlar herkesin telefonuna bildirim olarak gider; fotoğraf ve ürün linki de
            paylaşabilirsiniz.
          </p>
        </div>
      ) : null}

      <ol className="b-mesajlar">
        {(mesajlar ?? []).map((mesaj, sira, liste) => {
          const onceki = liste[sira - 1];
          const gun = istanbulGunu(mesaj.olusturuldu);
          const yeniGun = !onceki || istanbulGunu(onceki.olusturuldu) !== gun;
          const ilk =
            yeniGun ||
            onceki.kullaniciId !== mesaj.kullaniciId ||
            Date.parse(mesaj.olusturuldu) - Date.parse(onceki.olusturuldu) > GRUP_ARALIGI_MS;
          const benim = mesaj.kullaniciId === veri.ben.id;
          const yazan = kisi(mesaj.kullaniciId);

          return (
            <Fragment key={mesaj.id}>
              {yeniGun ? (
                <li className="b-mesaj-gun">
                  <span>{gunEtiketi(gun)}</span>
                </li>
              ) : null}
              <li className={`b-mesaj${benim ? " is-benim" : ""}${ilk ? " is-ilk" : ""}`}>
                {!benim ? ilk ? <Avatar kisi={yazan} /> : <span className="b-mesaj-bosluk" aria-hidden="true" /> : null}
                <div className="b-mesaj-icerik">
                  {!benim && ilk ? <span className="b-mesaj-ad">{yazan?.ad ?? "Biri"}</span> : null}
                  {mesaj.gorsel ? (
                    <button
                      type="button"
                      className="b-mesaj-foto"
                      onClick={() => setAcikFoto(mesaj)}
                      style={
                        mesaj.gorsel.genislik && mesaj.gorsel.yukseklik
                          ? { aspectRatio: `${mesaj.gorsel.genislik} / ${mesaj.gorsel.yukseklik}` }
                          : undefined
                      }
                    >
                      <img src={gorselAdresi(mesaj.gorsel.id, true)} alt="Paylaşılan fotoğraf" loading="lazy" decoding="async" />
                    </button>
                  ) : null}
                  {mesaj.metin || !mesaj.gorsel ? (
                    <div
                      className="b-mesaj-balon"
                      role={benim ? "button" : undefined}
                      tabIndex={benim ? 0 : undefined}
                      aria-expanded={benim ? secili === mesaj.id : undefined}
                      onClick={benim ? () => setSecili(secili === mesaj.id ? null : mesaj.id) : undefined}
                      onKeyDown={
                        benim
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSecili(secili === mesaj.id ? null : mesaj.id);
                              }
                            }
                          : undefined
                      }
                    >
                      {mesaj.metin ? (
                        <p className="b-mesaj-metin">{linkli(mesaj.metin)}</p>
                      ) : (
                        <p className="b-mesaj-metin is-silinmis">Fotoğraf silinmiş</p>
                      )}
                      <time dateTime={mesaj.olusturuldu}>{SAAT.format(new Date(mesaj.olusturuldu))}</time>
                    </div>
                  ) : (
                    <time className="b-mesaj-foto-saat" dateTime={mesaj.olusturuldu}>
                      {SAAT.format(new Date(mesaj.olusturuldu))}
                    </time>
                  )}
                  {benim && secili === mesaj.id ? (
                    <button type="button" className="b-mesaj-sil" onClick={() => void sil(mesaj)}>
                      <Ikon ad="cop" />
                      Sil
                    </button>
                  ) : null}
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>

      <form
        className="b-sohbet-yaz"
        onSubmit={(e) => {
          e.preventDefault();
          void gonder();
        }}
      >
        {foto && fotoOnizleme ? (
          <div className="b-sohbet-ek">
            <img src={fotoOnizleme} alt="" />
            <span>Fotoğraf eklendi</span>
            <button
              type="button"
              className="b-dugme b-dugme-ikon b-dugme-sade"
              aria-label="Fotoğrafı çıkar"
              onClick={() => setFoto(null)}
              disabled={gonderiliyor}
            >
              <Ikon ad="kapat" />
            </button>
          </div>
        ) : null}
        <div className="b-sohbet-satir">
          <button
            type="button"
            className="b-dugme b-dugme-ikon b-dugme-sade"
            aria-label="Fotoğraf ekle"
            onClick={() => dosyaGirdisi.current?.click()}
            disabled={gonderiliyor}
          >
            <Ikon ad="gorseller" />
          </button>
          <textarea
            ref={yaziKutusu}
            className="b-girdi"
            rows={1}
            value={yazi}
            onChange={(e) => setYazi(e.target.value)}
            onKeyDown={tus}
            onPaste={yapistir}
            maxLength={SINIR.mesaj}
            placeholder="Mesaj yazın"
            aria-label="Mesaj"
            enterKeyHint="send"
          />
          <button
            type="submit"
            className="b-dugme b-dugme-ana b-dugme-ikon"
            aria-label="Gönder"
            disabled={gonderiliyor || (!yazi.trim() && !foto)}
            // Odak yazı kutusunda kalsın: klavye kapanıp alt çubuk geri gelirse
            // sayfa kayar ve dokunuş düğmeyi ıskalar. Mesajlaşma da klavye açık sürer.
            onPointerDown={(e) => e.preventDefault()}
          >
            <Ikon ad="gonder" />
          </button>
        </div>
        <input
          ref={dosyaGirdisi}
          className="b-gizli"
          type="file"
          accept="image/*"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const dosya = e.target.files?.[0];
            if (dosya) setFoto(dosya);
            e.target.value = "";
          }}
        />
      </form>

      {acikFoto?.gorsel ? (
        <Pencere
          baslik={kisi(acikFoto.kullaniciId)?.ad ?? "Fotoğraf"}
          kapat={() => setAcikFoto(null)}
          disaridanKapanir
          sinif="b-isik-kutusu"
        >
          <div className="b-isik-sahne">
            <img
              src={gorselAdresi(acikFoto.gorsel.id)}
              alt={acikFoto.metin || "Paylaşılan fotoğraf"}
              style={{ backgroundImage: `url(${gorselAdresi(acikFoto.gorsel.id, true)})` }}
            />
          </div>
          <div className="b-isik-bilgi">
            {acikFoto.metin ? <p className="b-isik-baslik">{acikFoto.metin}</p> : null}
            <p className="b-isik-kunye">
              {gunEtiketi(istanbulGunu(acikFoto.olusturuldu))} · {SAAT.format(new Date(acikFoto.olusturuldu))}
            </p>
            <div className="b-isik-eylemler">
              <a className="b-dugme" href={gorselAdresi(acikFoto.gorsel.id)} download="balim-sohbet-fotografi">
                <Ikon ad="indir" />
                İndir
              </a>
              {acikFoto.kullaniciId === veri.ben.id ? (
                <button type="button" className="b-dugme b-dugme-sade is-tehlike" onClick={() => void sil(acikFoto)}>
                  <Ikon ad="cop" />
                  Sil
                </button>
              ) : null}
            </div>
          </div>
        </Pencere>
      ) : null}
    </div>
  );
}
