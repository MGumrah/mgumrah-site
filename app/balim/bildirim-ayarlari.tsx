"use client";

import { useEffect, useState } from "react";
import { api, ApiHatasi } from "./api";
import { aboneOl, mevcutAbonelik, pushDestegi, PUSH_SERVISI_MESAJI } from "./bildirim";
import { Ikon } from "./ikonlar";
import { useKurulum } from "./kurulum";
import { VARSAYILAN_TERCIHLER, type BildirimTercihleri } from "./ortak";
import { Pencere } from "./parcalar";

type Durum = "yukleniyor" | "yok" | "ios-kurulum" | "engelli" | "kurulmamis" | "kapali" | "acik";

const TERCIH_ADLARI: [keyof BildirimTercihleri, string, string][] = [
  ["sohbet", "Sohbet mesajları", "Biri sohbete yazınca"],
  ["degisiklikler", "Liste ve işler", "Kalem, iş, gider ya da görsel eklenince; sana iş verilince"],
  ["hatirlatmalar", "Sabah hatırlatmaları", "Kira günü yaklaşınca, bir işin son günü gelince (09:00)"]
];

const hataYazisi = (e: unknown) => (e instanceof ApiHatasi ? e.message : "Bir sorun oluştu. Tekrar deneyin.");

/**
 * Bu cihazın bildirim anahtarı ve tercihleri. Abonelik cihaza bağlı: annenin
 * telefonunda açmak tabletini etkilemez. İzin yalnızca "Bildirimleri aç"a
 * dokununca istenir (gerekçe bildirim.ts > aboneOl).
 */
export default function BildirimAyarlari({ kurulumGoster }: { kurulumGoster: () => void }) {
  const [durum, setDurum] = useState<Durum>("yukleniyor");
  const [acikAnahtar, setAcikAnahtar] = useState<string | null>(null);
  const [tercihler, setTercihler] = useState<BildirimTercihleri>(VARSAYILAN_TERCIHLER);
  const [mesgul, setMesgul] = useState(false);
  const [mesaj, setMesaj] = useState<{ yazi: string; hata: boolean } | null>(null);

  useEffect(() => {
    let iptal = false;
    (async () => {
      const destek = pushDestegi();
      if (destek !== "var") {
        if (!iptal) setDurum(destek);
        return;
      }
      try {
        const abonelik = await mevcutAbonelik();
        const kayit = await api.bildirimDurumu(abonelik?.endpoint ?? null);
        if (iptal) return;
        setAcikAnahtar(kayit.acikAnahtar);
        setTercihler(kayit.tercihler);
        // Tarayıcı abone ama sunucuda kayıt yoksa "açık" göstermek, hiç gelmeyecek bildirimi beklemek olurdu.
        setDurum(!kayit.acikAnahtar ? "kurulmamis" : abonelik && kayit.kayitli ? "acik" : "kapali");
      } catch {
        if (!iptal) setDurum("yok");
      }
    })();
    return () => {
      iptal = true;
    };
  }, []);

  async function ac() {
    if (!acikAnahtar) return;
    setMesgul(true);
    setMesaj(null);
    const sonuc = await aboneOl(acikAnahtar);
    if (!sonuc.ok) {
      setMesgul(false);
      if (sonuc.sebep === "engelli") return setDurum("engelli");
      if (sonuc.sebep === "ios-kurulum") return setDurum("ios-kurulum");
      if (sonuc.sebep === "izin-yok") return;
      return setMesaj({
        hata: true,
        yazi:
          sonuc.sebep === "push-servisi"
            ? PUSH_SERVISI_MESAJI
            : sonuc.sebep === "sw-yok"
              ? "Arka plan servisi başlamadı. Sayfayı yenileyip tekrar deneyin."
              : `Bildirimler açılamadı: ${sonuc.detay ?? "bilinmeyen hata"}`
      });
    }
    try {
      await api.bildirimKaydet(sonuc.abonelik.toJSON(), tercihler);
      setDurum("acik");
      setMesaj({ hata: false, yazi: "Bildirimler bu cihazda açıldı. İstersen bir deneme gönder." });
    } catch (e) {
      // Sunucu kaydetmediyse tarayıcı aboneliği de bırakılır: yoksa cihaz "abone"
      // sayılır, bildirim hiç gelmez ve kapatacak düğme de görünmez.
      await sonuc.abonelik.unsubscribe().catch(() => undefined);
      setMesaj({ hata: true, yazi: hataYazisi(e) });
    } finally {
      setMesgul(false);
    }
  }

  async function kapat() {
    setMesgul(true);
    setMesaj(null);
    try {
      const abonelik = await mevcutAbonelik();
      if (abonelik) {
        // Önce sunucu: tersi sırada unsubscribe başarılı olup istek düşerse
        // silinemeyen bir kayıt kalırdı, endpoint'i bir daha öğrenemeyiz.
        await api.bildirimSil(abonelik.endpoint);
        await abonelik.unsubscribe().catch(() => undefined);
      }
      setDurum("kapali");
    } catch (e) {
      setMesaj({ hata: true, yazi: hataYazisi(e) });
    } finally {
      setMesgul(false);
    }
  }

  async function tercihDegistir(ad: keyof BildirimTercihleri, deger: boolean) {
    const yeni = { ...tercihler, [ad]: deger };
    setTercihler(yeni);
    try {
      const abonelik = await mevcutAbonelik();
      if (abonelik) await api.bildirimKaydet(abonelik.toJSON(), yeni);
    } catch (e) {
      setTercihler(tercihler);
      setMesaj({ hata: true, yazi: hataYazisi(e) });
    }
  }

  async function dene() {
    setMesgul(true);
    setMesaj(null);
    try {
      const abonelik = await mevcutAbonelik();
      if (!abonelik) return setDurum("kapali");
      await api.bildirimDene(abonelik.endpoint);
      setMesaj({ hata: false, yazi: "Deneme bildirimi gönderildi, birkaç saniye içinde gelmeli." });
    } catch (e) {
      setMesaj({ hata: true, yazi: hataYazisi(e) });
    } finally {
      setMesgul(false);
    }
  }

  return (
    <div className="b-bildirim-ayari">
      {durum === "yukleniyor" ? <p className="b-bos-kucuk">Yükleniyor…</p> : null}

      {durum === "yok" ? (
        <p className="b-form-aciklama">
          Bu tarayıcı bildirimleri desteklemiyor. Telefonda Chrome ya da Safari ile açıp tekrar deneyin.
        </p>
      ) : null}

      {durum === "kurulmamis" ? <p className="b-form-aciklama">Bildirimler henüz hazır değil.</p> : null}

      {durum === "ios-kurulum" ? (
        <>
          <p className="b-form-aciklama">
            iPhone&apos;da bildirim alabilmek için Balım&apos;ı önce ana ekrana ekleyin. Sonra ana ekrandaki simgeden
            açıp bildirimleri buradan açın.
          </p>
          <button type="button" className="b-dugme b-dugme-ana" onClick={kurulumGoster}>
            <Ikon ad="ekranaEkle" />
            Ana ekrana nasıl eklenir?
          </button>
        </>
      ) : null}

      {durum === "engelli" ? (
        <p className="b-form-aciklama">
          Bu tarayıcıda Balım&apos;ın bildirim izni kapatılmış; site bir daha soramıyor. Açmak için: Chrome&apos;da adres
          çubuğundaki simgeye dokunun → İzinler → Bildirimler → İzin ver. iPhone&apos;da: Ayarlar → Bildirimler → Balım.
        </p>
      ) : null}

      {durum === "kapali" ? (
        <>
          <p className="b-form-aciklama">
            Yeni mesajlar, listeye eklenenler ve kira hatırlatmaları bu cihaza bildirim olarak gelsin. Her cihazda ayrı
            açılır.
          </p>
          <button type="button" className="b-dugme b-dugme-ana" onClick={ac} disabled={mesgul}>
            <Ikon ad="zil" />
            {mesgul ? "Açılıyor…" : "Bildirimleri aç"}
          </button>
        </>
      ) : null}

      {durum === "acik" ? (
        <>
          <p className="b-not-satiri is-iyi">
            <Ikon ad="onay" />
            Bu cihazda bildirimler açık.
          </p>
          <div className="b-tercihler">
            {TERCIH_ADLARI.map(([ad, baslik, aciklama]) => (
              <label key={ad} className="b-anahtar b-tercih">
                <input type="checkbox" checked={tercihler[ad]} onChange={(e) => void tercihDegistir(ad, e.target.checked)} />
                <span className="b-anahtar-kutu" aria-hidden="true" />
                <span>
                  <span className="b-tercih-baslik">{baslik}</span>
                  <span className="b-tercih-aciklama">{aciklama}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="b-dugme-satiri">
            <button type="button" className="b-dugme" onClick={dene} disabled={mesgul}>
              <Ikon ad="zil" />
              Deneme gönder
            </button>
            <button type="button" className="b-dugme b-dugme-sade is-tehlike" onClick={kapat} disabled={mesgul}>
              <Ikon ad="zilKapali" />
              Bu cihazda kapat
            </button>
          </div>
        </>
      ) : null}

      {mesaj ? (
        <p className={mesaj.hata ? "b-form-hata" : "b-not-satiri is-iyi"} role={mesaj.hata ? "alert" : "status"}>
          <Ikon ad={mesaj.hata ? "uyari" : "onay"} />
          {mesaj.yazi}
        </p>
      ) : null}
    </div>
  );
}

/** Telefonun kendi menüsünden "Ana ekrana ekle" adımları; tek dokunuşla yükleme olmayan yerler için. */
export function KurulumPenceresi({ kapat }: { kapat: () => void }) {
  const kurulum = useKurulum();

  return (
    <Pencere baslik="Ana ekrana ekle" kapat={kapat} disaridanKapanir>
      <div className="b-form">
        <p className="b-form-aciklama">
          Balım ana ekranda kendi simgesiyle durur ve tarayıcı çubuğu olmadan uygulama gibi açılır.
          {kurulum?.ios ? " iPhone'da bildirim alabilmek için de bu adım gerekli." : ""}
        </p>
        {kurulum?.ios ? (
          <ol className="b-adimlar">
            <li>
              Safari&apos;de <Ikon ad="paylas" /> <b>Paylaş</b> düğmesine dokunun (ekranın altında ya da üstünde).
            </li>
            <li>
              Listeyi kaydırıp <b>Ana Ekrana Ekle</b>&apos;yi seçin.
            </li>
            <li>
              Sağ üstteki <b>Ekle</b>&apos;ye dokunun.
            </li>
            <li>Ana ekrandaki Balım simgesinden açın. Ayrı bir uygulama sayıldığı için bir kez daha giriş yapmanız gerekir.</li>
          </ol>
        ) : kurulum?.mobil ? (
          <ol className="b-adimlar">
            <li>
              Chrome&apos;da sağ üstteki <Ikon ad="menu" /> menüye dokunun.
            </li>
            <li>
              <b>Ana ekrana ekle</b> ya da <b>Uygulamayı yükle</b>&apos;yi seçin.
            </li>
            <li>
              Çıkan pencerede <b>Ekle</b>&apos;ye dokunun.
            </li>
          </ol>
        ) : (
          <ol className="b-adimlar">
            <li>Chrome ya da Edge&apos;de adres çubuğunun sağındaki yükle simgesine tıklayın.</li>
            <li>
              Çıkan pencerede <b>Yükle</b>&apos;ye tıklayın.
            </li>
          </ol>
        )}
      </div>
    </Pencere>
  );
}
