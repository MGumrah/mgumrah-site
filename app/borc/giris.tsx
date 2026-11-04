"use client";

import { useState, type FormEvent } from "react";
import { api, ApiHatasi } from "./api";

/** Kullanıcı adı gizli değil; cihaz hatırlasın, yalnızca şifre yazılsın. */
const SON_KULLANICI = "borc:kullanici";

/**
 * Giriş ekranı. Burada rakam yok, kim olduğunu söyleyen bir şey de yok: "Borç
 * takibi" yazısından başka bir şey göstermiyor. Alanlar şifre yöneticisinin
 * (iCloud Anahtar Zinciri) tanıyacağı biçimde: username + current-password.
 */
export default function Giris({ girildi }: { girildi: () => Promise<void> }) {
  const [kullanici, setKullanici] = useState(() => {
    try {
      return localStorage.getItem(SON_KULLANICI) ?? "";
    } catch {
      return "";
    }
  });
  const [sifre, setSifre] = useState("");
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function gir(e: FormEvent) {
    e.preventDefault();
    if (!kullanici.trim() || !sifre) {
      setHata("Kullanıcı adı ve şifreyi yazın.");
      return;
    }
    setBekliyor(true);
    setHata(null);
    try {
      await api.giris(kullanici.trim(), sifre);
      try {
        localStorage.setItem(SON_KULLANICI, kullanici.trim());
      } catch {
        // Gizli sekmede localStorage kapalı olabilir; sorun değil.
      }
      setSifre("");
      await girildi();
    } catch (err) {
      setHata(err instanceof ApiHatasi ? err.message : "Giriş yapılamadı. Tekrar deneyin.");
      setBekliyor(false);
    }
  }

  return (
    <main className="giris">
      <form className="giris-kart" onSubmit={gir} noValidate>
        <div className="logo" aria-hidden="true">
          ₺
        </div>
        <h1>Borç takibi</h1>
        <label>
          <span>Kullanıcı adı</span>
          <input
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={kullanici}
            onChange={(e) => setKullanici(e.target.value)}
          />
        </label>
        <label>
          <span>Şifre</span>
          <div className="sifre-satiri">
            <input
              name="password"
              type={goster ? "text" : "password"}
              autoComplete="current-password"
              autoCapitalize="none"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
            <button type="button" className="ikinci" onClick={() => setGoster((g) => !g)} aria-pressed={goster}>
              {goster ? "Gizle" : "Göster"}
            </button>
          </div>
        </label>
        {hata && (
          <p className="hata" role="alert">
            {hata}
          </p>
        )}
        <button type="submit" className="birinci" disabled={bekliyor}>
          {bekliyor ? "Giriliyor…" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}
