"use client";

import { useState, type FormEvent } from "react";
import { api } from "./api";
import { useBalim } from "./baglam";
import BildirimAyarlari from "./bildirim-ayarlari";
import { Ikon } from "./ikonlar";
import { useKurulum, yukle } from "./kurulum";
import { SINIR, tarihYazisi } from "./ortak";
import { AcilisPenceresi } from "./ozet";
import { Avatar } from "./parcalar";

export default function Hesap({ kurulumGoster }: { kurulumGoster: () => void }) {
  const { veri, cikisYapildi } = useBalim();
  const [acilisPenceresi, setAcilisPenceresi] = useState(false);
  const [cikiliyor, setCikiliyor] = useState(false);

  async function cikisYap() {
    if (!window.confirm("Bu cihazdaki oturum kapatılsın mı? Tekrar girmek için şifre gerekecek.")) return;
    setCikiliyor(true);
    try {
      await api.cikis();
    } catch {
      // Sunucuya ulaşılamasa da bu cihazda çıkış yapılmış sayılır; çerez bir sonraki istekte düşer.
    }
    cikisYapildi();
  }

  return (
    <div className="b-sayfa b-hesap">
      <header className="b-kart b-hesap-ust">
        <Avatar kisi={veri.ben} boyut="buyuk" />
        <div>
          <h1>{veri.ben.ad}</h1>
          <p>Bu cihazda giriş yapılı. Çıkış yapmadıkça bir daha şifre sorulmaz.</p>
        </div>
      </header>

      <section className="b-kart b-bolum">
        <div className="b-kart-ust">
          <h2>Kafe</h2>
        </div>
        <button type="button" className="b-ayar-satiri" onClick={() => setAcilisPenceresi(true)}>
          <Ikon ad="takvim" />
          <span>
            <span className="b-ayar-baslik">Açılış tarihi</span>
            <span className="b-ayar-deger">
              {veri.ayarlar.acilisTarihi ? tarihYazisi(veri.ayarlar.acilisTarihi, { haftaGunu: true }) : "Belirlenmedi"}
            </span>
          </span>
          <Ikon ad="sag" className="b-ayar-ok" />
        </button>
      </section>

      <TelefonaEkle kurulumGoster={kurulumGoster} />

      <section className="b-kart b-bolum">
        <div className="b-kart-ust">
          <h2>Bildirimler</h2>
        </div>
        <BildirimAyarlari kurulumGoster={kurulumGoster} />
      </section>

      <AdFormu />
      <SifreFormu />

      <section className="b-kart b-bolum">
        <div className="b-kart-ust">
          <h2>Panele girebilenler</h2>
        </div>
        <ul className="b-kisi-listesi">
          {veri.kisiler.map((kisi) => (
            <li key={kisi.id}>
              <Avatar kisi={kisi} boyut="kucuk" />
              {kisi.ad}
              {kisi.id === veri.ben.id ? <span className="b-rozet">sen</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="b-dugme b-dugme-genis is-tehlike" onClick={cikisYap} disabled={cikiliyor}>
        <Ikon ad="cikis" />
        Bu cihazda çıkış yap
      </button>

      {acilisPenceresi ? <AcilisPenceresi kapat={() => setAcilisPenceresi(false)} /> : null}
    </div>
  );
}

function AdFormu() {
  const { veri, islem } = useBalim();
  const [ad, setAd] = useState(veri.ben.ad);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: FormEvent) {
    e.preventDefault();
    if (!ad.trim()) return setHata("Adınızı yazın.");
    setBekliyor(true);
    setHata(null);
    const sonuc = await islem(() => api.yaz("hesap", "PATCH", { ad: ad.trim() }), { basari: "Adın kaydedildi", sessiz: true });
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
  }

  return (
    <form className="b-kart b-bolum b-form" onSubmit={kaydet}>
      <div className="b-kart-ust">
        <h2>Görünen adın</h2>
      </div>
      <p className="b-form-aciklama">Giriş ekranında ve &quot;kim ekledi&quot; yazılarında bu ad görünür.</p>
      <div className="b-satir-form">
        <input
          className="b-girdi"
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          maxLength={SINIR.kisiAdi}
          aria-label="Görünen ad"
        />
        <button type="submit" className="b-dugme" disabled={bekliyor || ad.trim() === veri.ben.ad}>
          Kaydet
        </button>
      </div>
      {hata ? (
        <p className="b-form-hata" role="alert">
          <Ikon ad="uyari" />
          {hata}
        </p>
      ) : null}
    </form>
  );
}

function SifreFormu() {
  const { veri, islem, bildir } = useBalim();
  const [mevcut, setMevcut] = useState("");
  const [yeni, setYeni] = useState("");
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: FormEvent) {
    e.preventDefault();
    if (!mevcut) return setHata("Şu anki şifrenizi yazın.");
    if (yeni.length < SINIR.sifreEnAz) return setHata(`Yeni şifre en az ${SINIR.sifreEnAz} karakter olmalı.`);
    setBekliyor(true);
    setHata(null);
    const sonuc = await islem(() => api.yaz("hesap", "PATCH", { mevcutSifre: mevcut, yeniSifre: yeni }), {
      sessiz: true
    });
    setBekliyor(false);
    if (sonuc) return setHata(sonuc);
    setMevcut("");
    setYeni("");
    bildir("Şifren değişti");
  }

  return (
    <form className="b-kart b-bolum b-form" onSubmit={kaydet}>
      <div className="b-kart-ust">
        <h2>Şifreni değiştir</h2>
      </div>
      <input className="b-gizli" type="text" autoComplete="username" value={veri.ben.kullaniciAdi} readOnly tabIndex={-1} aria-hidden="true" />
      <div className="b-alan-cift">
        <label className="b-alan">
          <span>Şu anki şifre</span>
          <input
            className="b-girdi"
            type={goster ? "text" : "password"}
            autoComplete="current-password"
            value={mevcut}
            onChange={(e) => setMevcut(e.target.value)}
          />
        </label>
        <label className="b-alan">
          <span>Yeni şifre</span>
          <input
            className="b-girdi"
            type={goster ? "text" : "password"}
            autoComplete="new-password"
            value={yeni}
            onChange={(e) => setYeni(e.target.value)}
            maxLength={SINIR.sifreEnFazla}
          />
        </label>
      </div>
      <label className="b-anahtar">
        <input type="checkbox" checked={goster} onChange={(e) => setGoster(e.target.checked)} />
        <span className="b-anahtar-kutu" aria-hidden="true" />
        <span>Şifreleri göster</span>
      </label>
      {hata ? (
        <p className="b-form-hata" role="alert">
          <Ikon ad="uyari" />
          {hata}
        </p>
      ) : null}
      <div>
        <button type="submit" className="b-dugme" disabled={bekliyor}>
          <Ikon ad="anahtar" />
          Şifreyi değiştir
        </button>
      </div>
    </form>
  );
}

function TelefonaEkle({ kurulumGoster }: { kurulumGoster: () => void }) {
  const kurulum = useKurulum();
  if (!kurulum) return null;

  return (
    <section className="b-kart b-bolum">
      <div className="b-kart-ust">
        <h2>Ana ekrana ekle</h2>
      </div>
      {kurulum.uygulamada ? (
        <p className="b-not-satiri is-iyi">
          <Ikon ad="onay" />
          Balım şu an ana ekrandan açılmış, kurulum tamam.
        </p>
      ) : (
        <>
          <p className="b-form-aciklama">
            Ana ekrana eklenince Balım kendi simgesiyle, tarayıcı çubuğu olmadan açılır.
            {kurulum.ios ? " iPhone'da bildirim alabilmek için de gerekli." : ""}
          </p>
          <div>
            <button
              type="button"
              className="b-dugme b-dugme-ana"
              onClick={async () => {
                if (kurulum.tekDokunus && (await yukle()) !== "yok") return;
                kurulumGoster();
              }}
            >
              <Ikon ad="ekranaEkle" />
              {kurulum.tekDokunus ? "Ana ekrana ekle" : "Nasıl eklenir?"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
