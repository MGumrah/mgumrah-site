"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiHatasi } from "./api";
import { BalimLogo, Ikon } from "./ikonlar";
import type { Kisi } from "./ortak";
import { Avatar } from "./parcalar";

/** Bu cihazda en son kim giriş yaptı: ekran bir dahaki sefere o kişiyle açılır. */
const SON_KISI = "balim:son-kisi";

/**
 * Kullanıcı adı yazdırmak yerine dört kişiden biri seçiliyor: telefonda büyük
 * harf, Türkçe karakter ya da boşluk yüzünden "kullanıcı bulunamadı" demenin
 * önüne geçiyor. Şifre yöneticisi yine kullanıcı adıyla kaydetsin diye seçilen
 * kişinin adı görünmez bir alanda formla birlikte gidiyor.
 */
export default function Giris({ girildi }: { girildi: () => Promise<void> }) {
  const [kisiler, setKisiler] = useState<Kisi[] | null>(null);
  const [listeHatasi, setListeHatasi] = useState(false);
  const [secili, setSecili] = useState<Kisi | null>(null);
  const [sifre, setSifre] = useState("");
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const sifreKutusu = useRef<HTMLInputElement>(null);

  const listeyiGetir = useCallback(() => {
    setListeHatasi(false);
    api
      .kisiler()
      .then((liste) => {
        setKisiler(liste);
        try {
          const son = liste.find((kisi) => kisi.kullaniciAdi === localStorage.getItem(SON_KISI));
          if (son) setSecili(son);
        } catch {
          // Gizli sekmede localStorage kapalı olabilir; kişi elle seçilir.
        }
      })
      .catch(() => setListeHatasi(true));
  }, []);

  useEffect(() => {
    listeyiGetir();
  }, [listeyiGetir]);

  useEffect(() => {
    if (secili) sifreKutusu.current?.focus();
  }, [secili]);

  function kisiSec(kisi: Kisi | null) {
    setSecili(kisi);
    setSifre("");
    setHata(null);
  }

  async function gir(e: FormEvent) {
    e.preventDefault();
    if (!secili) return;
    if (!sifre) {
      setHata("Şifreyi yazın.");
      return;
    }
    setBekliyor(true);
    setHata(null);
    try {
      await api.giris(secili.kullaniciAdi, sifre);
      try {
        localStorage.setItem(SON_KISI, secili.kullaniciAdi);
      } catch {
        // Hatırlanmasa da giriş geçerli.
      }
      await girildi();
    } catch (err) {
      setHata(err instanceof ApiHatasi ? err.message : "Giriş yapılamadı. Tekrar deneyin.");
      setBekliyor(false);
    }
  }

  return (
    <main className="b-giris">
      <div className="b-giris-kart">
        <BalimLogo className="b-giris-logo" />
        <h1>Balım</h1>
        <p className="b-giris-alt">Kafe hazırlık planı</p>

        {secili ? (
          <form className="b-giris-form" onSubmit={gir}>
            <div className="b-giris-secili">
              <Avatar kisi={secili} boyut="buyuk" />
              <p>
                <span>Merhaba,</span>
                <strong>{secili.ad}</strong>
              </p>
              <button type="button" className="b-dugme b-dugme-sade" onClick={() => kisiSec(null)}>
                Değiştir
              </button>
            </div>

            <input
              className="b-gizli"
              type="text"
              name="username"
              autoComplete="username"
              value={secili.kullaniciAdi}
              readOnly
              tabIndex={-1}
              aria-hidden="true"
            />

            <label className="b-alan">
              <span>Şifre</span>
              <span className="b-sifre">
                <input
                  ref={sifreKutusu}
                  className="b-girdi"
                  type={goster ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                />
                <button
                  type="button"
                  className="b-sifre-goster"
                  onClick={() => setGoster(!goster)}
                  aria-label={goster ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  <Ikon ad={goster ? "gozKapali" : "goz"} />
                </button>
              </span>
            </label>

            {hata ? (
              <p className="b-form-hata" role="alert">
                <Ikon ad="uyari" />
                {hata}
              </p>
            ) : null}

            <button type="submit" className="b-dugme b-dugme-ana b-dugme-genis" disabled={bekliyor}>
              {bekliyor ? "Giriş yapılıyor…" : "Giriş yap"}
            </button>
            <p className="b-giris-not">Bu cihazda bir kez giriş yapman yeter, bir daha sorulmaz.</p>
          </form>
        ) : (
          <>
            <h2 className="b-giris-soru">Kimsin?</h2>
            {listeHatasi ? (
              <div className="b-giris-hata" role="alert">
                <p>Sunucuya ulaşılamadı.</p>
                <button type="button" className="b-dugme" onClick={listeyiGetir}>
                  <Ikon ad="yenile" />
                  Tekrar dene
                </button>
              </div>
            ) : kisiler === null ? (
              <p className="b-giris-bekle">Yükleniyor…</p>
            ) : kisiler.length === 0 ? (
              <p className="b-giris-bekle">Henüz kimse eklenmemiş.</p>
            ) : (
              <ul className="b-giris-kisiler">
                {kisiler.map((kisi) => (
                  <li key={kisi.id}>
                    <button type="button" className="b-giris-kisi" onClick={() => kisiSec(kisi)}>
                      <Avatar kisi={kisi} boyut="buyuk" />
                      <span>{kisi.ad}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
