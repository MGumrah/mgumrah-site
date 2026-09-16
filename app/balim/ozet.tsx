"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { api } from "./api";
import { useBalim } from "./baglam";
import { Ikon } from "./ikonlar";
import { AYLAR, ayYazisi, tarihYazisi, tl, tlYuvarlak } from "./ortak";
import { Avatar, Pencere, useDakika } from "./parcalar";
import { aktifGiderler, kategoriOzetleri, ozetHesapla, yaklasanlar } from "./toplamlar";
import { bugun, goreceZaman, gunFarki, kalanGunYazisi } from "./zaman";

export default function Ozet() {
  const { veri, kisi } = useBalim();
  const [acilisPenceresi, setAcilisPenceresi] = useState(false);
  useDakika();

  const gun = bugun();
  const ozet = useMemo(() => ozetHesapla(veri, gun), [veri, gun]);
  const kategoriler = useMemo(() => kategoriOzetleri(veri.alinacaklar).filter((k) => k.toplam > 0), [veri.alinacaklar]);
  const yaklasan = useMemo(() => yaklasanlar(veri, gun), [veri, gun]);

  const acilis = veri.ayarlar.acilisTarihi;
  const acilisaKalan = acilis ? gunFarki(gun, acilis) : null;
  const harcananOrani = ozet.toplam > 0 ? Math.min(1, ozet.harcanan / ozet.toplam) : 0;

  const acikIsler = veri.yapilacaklar.filter((is) => !is.tamamlandi);
  const gecikenIsler = acikIsler.filter((is) => is.sonTarih && is.sonTarih < gun).length;
  const giderAdlari = aktifGiderler(veri.giderler, gun).map((gider) => gider.ad);
  const enBuyukKategori = kategoriler[0]?.toplam ?? 0;

  return (
    <div className="b-ozet">
      <section className="b-selam">
        <p className="b-selam-merhaba">Merhaba {veri.ben.ad},</p>
        <h1>
          {acilisaKalan === null ? (
            <>
              Kafe hazırlığında <em>neredeyiz?</em>
            </>
          ) : acilisaKalan > 0 ? (
            <>
              Açılışa <em>{acilisaKalan} gün</em> kaldı
            </>
          ) : acilisaKalan === 0 ? (
            <>
              Bugün <em>açılış günü!</em>
            </>
          ) : (
            <>
              Açılıştan bu yana <em>{-acilisaKalan} gün</em>
            </>
          )}
        </h1>
        <p className="b-selam-alt">
          {acilis ? <span>Açılış: {tarihYazisi(acilis, { haftaGunu: true })}</span> : null}
          <button type="button" className="b-baglanti" onClick={() => setAcilisPenceresi(true)}>
            <Ikon ad="takvim" />
            {acilis ? "Tarihi değiştir" : "Açılış tarihini belirle"}
          </button>
        </p>
      </section>

      <div className="b-ozet-izgara">
        <section className="b-kart b-butce" aria-labelledby="b-butce-baslik">
          <h2 id="b-butce-baslik" className="b-kart-etiket">
            Tahmini toplam maliyet
          </h2>
          <p className="b-kahraman">{tlYuvarlak(ozet.toplam)}</p>
          <p className="b-butce-dokum">
            Alınacaklar {tlYuvarlak(ozet.kalem.toplam)}
            {ozet.giderAySayisi > 0 ? (
              <>
                {" + "}
                {acilis ? "açılışa kadar" : "bugüne kadar"} giderler {tlYuvarlak(ozet.giderToplam)} ({ozet.giderAySayisi} ay)
              </>
            ) : null}
          </p>

          <div className="b-olcer" aria-hidden="true">
            <span style={{ width: `${harcananOrani * 100}%` }} />
          </div>
          <dl className="b-butce-satirlar">
            <div>
              <dt>
                <span className="b-lejant-renk is-alindi" aria-hidden="true" />
                Harcanan
              </dt>
              <dd>
                {tlYuvarlak(ozet.harcanan)}
                <small>%{Math.round(harcananOrani * 100)}</small>
              </dd>
            </div>
            <div>
              <dt>
                <span className="b-lejant-renk is-kalan" aria-hidden="true" />
                Kalan
              </dt>
              <dd>{tlYuvarlak(Math.max(0, ozet.toplam - ozet.harcanan))}</dd>
            </div>
          </dl>

          {ozet.kalem.fiyatsiz > 0 ? (
            <p className="b-not-satiri is-uyari">
              <Ikon ad="uyari" />
              {ozet.kalem.fiyatsiz} kalemin fiyatı girilmedi, toplama dahil değil.
            </p>
          ) : null}
          {!acilis && veri.giderler.length > 0 ? (
            <p className="b-not-satiri">
              <Ikon ad="takvim" />
              Açılış tarihini girersen açılışa kadar ödenecek kira da toplama eklenir.
            </p>
          ) : null}
        </section>

        <div className="b-kutucuklar">
          <a className="b-kart b-kutucuk" href="#alinacaklar">
            <span className="b-kart-etiket">Alışverişte kalan</span>
            <span className="b-kutucuk-deger">{tlYuvarlak(ozet.kalem.kalan)}</span>
            <span className="b-kutucuk-alt">
              {ozet.kalem.sayi === 0
                ? "Liste henüz boş"
                : `${ozet.kalem.sayi - ozet.kalem.alinanSayi} kalem kaldı · ${ozet.kalem.alinanSayi} alındı`}
            </span>
          </a>
          <a className="b-kart b-kutucuk" href="#giderler">
            <span className="b-kart-etiket">Aylık sabit gider</span>
            <span className="b-kutucuk-deger">{tlYuvarlak(ozet.aylikSabit)}</span>
            <span className="b-kutucuk-alt">{giderAdlari.length ? giderAdlari.join(", ") : "Gider eklenmedi"}</span>
          </a>
          <a className="b-kart b-kutucuk" href="#yapilacaklar">
            <span className="b-kart-etiket">Yapılacak işler</span>
            <span className="b-kutucuk-deger">{acikIsler.length} açık iş</span>
            <span className={`b-kutucuk-alt${gecikenIsler ? " is-kotu" : ""}`}>
              {gecikenIsler ? (
                <>
                  <Ikon ad="uyari" />
                  {gecikenIsler} işin tarihi geçti
                </>
              ) : (
                `${veri.yapilacaklar.length - acikIsler.length} iş tamamlandı`
              )}
            </span>
          </a>
        </div>
      </div>

      <div className="b-ozet-izgara">
        <section className="b-kart b-bolum" aria-labelledby="b-dagilim-baslik">
          <div className="b-kart-ust">
            <h2 id="b-dagilim-baslik">Para nereye gidiyor?</h2>
            {kategoriler.length ? (
              <ul className="b-lejant" aria-label="Renkler">
                <li>
                  <span className="b-lejant-renk is-alindi" />
                  Alındı
                </li>
                <li>
                  <span className="b-lejant-renk is-kalan" />
                  Alınacak
                </li>
              </ul>
            ) : null}
          </div>
          {kategoriler.length ? (
            <ul className="b-dagilim">
              {kategoriler.map((k) => (
                <li
                  key={k.kategori}
                  className="b-dagilim-satir"
                  tabIndex={0}
                  style={{ "--oran": k.toplam / enBuyukKategori } as CSSProperties}
                >
                  <span className="b-dagilim-ad">{k.kategori}</span>
                  <span className="b-dagilim-cubuk" aria-hidden="true">
                    {k.alinan > 0 ? <span className="is-alindi" style={{ flexGrow: k.alinan }} /> : null}
                    {k.toplam > k.alinan ? <span className="is-kalan" style={{ flexGrow: k.toplam - k.alinan }} /> : null}
                  </span>
                  <span className="b-dagilim-tutar">{tlYuvarlak(k.toplam)}</span>
                  <span className="b-dagilim-ipucu">
                    {k.sayi} kalem · {tlYuvarlak(k.alinan)} alındı · {tlYuvarlak(k.toplam - k.alinan)} alınacak
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="b-bos-kucuk">Fiyatı girilmiş kalemler oldukça burada kategorilere göre dağılım görünür.</p>
          )}
        </section>

        <section className="b-kart b-bolum" aria-labelledby="b-yaklasan-baslik">
          <div className="b-kart-ust">
            <h2 id="b-yaklasan-baslik">Yaklaşanlar</h2>
          </div>
          {yaklasan.length ? (
            <ul className="b-yaklasan">
              {yaklasan.map((y) => {
                const fark = gunFarki(gun, y.gun);
                const gecikti = fark < 0;
                const [, ayNo, gunNo] = y.gun.split("-").map(Number);
                const sorumlu = y.tur === "is" ? kisi(y.is.sorumluId) : undefined;
                return (
                  <li key={y.tur === "odeme" ? `o-${y.gider.id}-${y.ay}` : `i-${y.is.id}`}>
                    <a className="b-yaklasan-satir" href={y.tur === "odeme" ? "#giderler" : "#yapilacaklar"}>
                      <span className="b-tarih-rozet">
                        <b>{gunNo}</b>
                        <small>{AYLAR[ayNo - 1].slice(0, 3)}</small>
                      </span>
                      <span className="b-yaklasan-metin">
                        <span className="b-yaklasan-baslik">
                          {y.tur === "odeme" ? `${y.gider.ad} · ${ayYazisi(y.ay)}` : y.is.baslik}
                        </span>
                        <span className="b-yaklasan-alt">
                          <span className={`b-durum${gecikti ? " is-kotu" : ""}`}>
                            <Ikon ad={gecikti ? "uyari" : "saat"} />
                            {gecikti ? `${-fark} gün gecikti` : kalanGunYazisi(fark)}
                          </span>
                          <span>
                            {y.tur === "odeme"
                              ? tl(y.gider.tutar)
                              : sorumlu
                                ? `${sorumlu.ad} yapacak`
                                : "Kimin yapacağı belli değil"}
                          </span>
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="b-bos-kucuk">Önümüzdeki 45 günde tarihi gelen bir ödeme ya da iş yok.</p>
          )}
        </section>
      </div>

      <section className="b-kart b-bolum" aria-labelledby="b-akis-baslik">
        <div className="b-kart-ust">
          <h2 id="b-akis-baslik">Son hareketler</h2>
        </div>
        {veri.etkinlikler.length ? (
          <ol className="b-akis">
            {veri.etkinlikler.slice(0, 15).map((e) => {
              const yapan = kisi(e.kullaniciId);
              return (
                <li key={e.id}>
                  <Avatar kisi={yapan} boyut="kucuk" />
                  <p>
                    <b>{yapan?.ad ?? "Biri"}</b> {e.eylem}: <span>{e.metin}</span>
                  </p>
                  <time dateTime={e.zaman}>{goreceZaman(e.zaman)}</time>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="b-bos-kucuk">Henüz hareket yok. İlk kalemi Alınacaklar sekmesinden ekleyebilirsin.</p>
        )}
      </section>

      {acilisPenceresi ? <AcilisPenceresi kapat={() => setAcilisPenceresi(false)} /> : null}
    </div>
  );
}

export function AcilisPenceresi({ kapat }: { kapat: () => void }) {
  const { veri, islem } = useBalim();
  const [tarih, setTarih] = useState(veri.ayarlar.acilisTarihi ?? "");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const formId = useId();

  async function kaydet(yeni: string | null) {
    setBekliyor(true);
    const sonuc = await islem(() => api.yaz("ayarlar", "PATCH", { acilisTarihi: yeni }), {
      basari: yeni ? "Açılış tarihi kaydedildi" : "Açılış tarihi kaldırıldı",
      sessiz: true
    });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else kapat();
  }

  return (
    <Pencere
      baslik="Açılış tarihi"
      kapat={kapat}
      alt={
        <>
          {veri.ayarlar.acilisTarihi ? (
            <button type="button" className="b-dugme b-dugme-sade is-tehlike" disabled={bekliyor} onClick={() => kaydet(null)}>
              Kaldır
            </button>
          ) : null}
          <span className="b-bosluk" />
          <button type="button" className="b-dugme" onClick={kapat}>
            Vazgeç
          </button>
          <button type="submit" form={formId} className="b-dugme b-dugme-ana" disabled={bekliyor || !tarih}>
            Kaydet
          </button>
        </>
      }
    >
      <form
        id={formId}
        className="b-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (tarih) void kaydet(tarih);
        }}
      >
        <p className="b-form-aciklama">
          Kafenin açılmasını planladığınız gün. Özet sayfası geri sayımı ve açılışa kadar ödenecek kirayı buna göre
          hesaplar.
        </p>
        <label className="b-alan">
          <span>Planlanan açılış günü</span>
          <input type="date" className="b-girdi" value={tarih} onChange={(e) => setTarih(e.target.value)} required />
        </label>
        {hata ? (
          <p className="b-form-hata" role="alert">
            <Ikon ad="uyari" />
            {hata}
          </p>
        ) : null}
      </form>
    </Pencere>
  );
}
