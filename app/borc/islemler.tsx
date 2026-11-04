"use client";

import { useMemo, useState } from "react";
import { useBorc } from "./baglam";
import { ayAdi, ayKisa, tarihKisa } from "./bicim";
import { Bolum, Bos, Tl } from "./parcalar";

const SAYFA = 40;

/** Harcama listesi: arama, kart ve ekstre ayı süzgeci. Satırdaki “Düzenle” harcamayı düzenleme/silme penceresini açar. */
export default function Islemler() {
  const { veri, ac } = useBorc();
  const [ara, setAra] = useState("");
  const [hesapId, setHesapId] = useState(0);
  const [ay, setAy] = useState("");
  const [goster, setGoster] = useState(SAYFA);

  const hesapAdi = useMemo(() => new Map(veri.hesaplar.map((h) => [h.id, h.ad])), [veri.hesaplar]);
  const aylar = useMemo(() => [...new Set(veri.islemler.map((i) => i.ekstreAy))].sort().reverse(), [veri.islemler]);

  const eslesen = useMemo(() => {
    const kelimeler = ara.toLocaleLowerCase("tr").split(/\s+/).filter(Boolean);
    return veri.islemler
      .filter((i) => (hesapId === 0 || i.hesapId === hesapId) && (ay === "" || i.ekstreAy === ay))
      .filter((i) => {
        if (kelimeler.length === 0) return true;
        const metin = `${i.aciklama} ${i.kategori} ${i.not} ${hesapAdi.get(i.hesapId) ?? ""}`.toLocaleLowerCase("tr");
        return kelimeler.every((k) => metin.includes(k));
      })
      .sort((a, b) => b.tarih.localeCompare(a.tarih) || b.id - a.id);
  }, [veri.islemler, ara, hesapId, ay, hesapAdi]);

  const toplam = eslesen.reduce((t, i) => t + i.tutar, 0);
  const kartVar = veri.hesaplar.some((h) => h.tur === "kart");

  return (
    <>
      <div className="arac-cubugu">
        <button type="button" className="ikinci kucuk" disabled={!kartVar} onClick={() => ac({ tur: "ekle", sekme: "harcama" })}>
          + Harcama ekle
        </button>
      </div>

      <section className="bolum filtre">
        <input type="search" inputMode="search" autoComplete="off" placeholder="Ara: açıklama, kategori, not…" aria-label="İşlem ara" value={ara} onChange={(e) => { setAra(e.target.value); setGoster(SAYFA); }} />
        <div className="iki-sutun">
          <select aria-label="Karta göre süz" value={hesapId} onChange={(e) => { setHesapId(Number(e.target.value)); setGoster(SAYFA); }}>
            <option value={0}>Tüm kartlar</option>
            {veri.hesaplar.filter((h) => h.tur === "kart").map((h) => (
              <option key={h.id} value={h.id}>{h.ad}</option>
            ))}
          </select>
          <select aria-label="Ekstre ayına göre süz" value={ay} onChange={(e) => { setAy(e.target.value); setGoster(SAYFA); }}>
            <option value="">Tüm aylar</option>
            {aylar.map((a) => (
              <option key={a} value={a}>{ayAdi(a)}</option>
            ))}
          </select>
        </div>
      </section>

      <Bolum baslik="İşlemler" sag={<span className="sag-yazi">{eslesen.length} kayıt · <Tl k={toplam} /></span>}>
        {veri.islemler.length === 0 ? (
          <Bos>Henüz harcama yok. “+ Harcama ekle” ile kart harcamalarını girin; taksitliler Taksit planına işlenir.</Bos>
        ) : eslesen.length === 0 ? (
          <Bos>Aramaya uyan işlem yok.</Bos>
        ) : (
          <ul className="liste">
            {eslesen.slice(0, goster).map((i) => (
              <li key={i.id} className="satir">
                <div>
                  <strong>{i.aciklama}</strong>
                  <span className="alt">
                    {tarihKisa(i.tarih)} · {hesapAdi.get(i.hesapId) ?? "?"} · {ayKisa(i.ekstreAy)} ekstresi{i.taksit > 1 ? ` · ${i.taksit} taksit` : ""}
                    {i.kategori ? ` · ${i.kategori}` : ""}
                  </span>
                </div>
                <div className="sag-kolon">
                  <span className={i.tutar < 0 ? "pozitif" : ""}><Tl k={i.tutar} tam /></span>
                  <button type="button" className="bag" onClick={() => ac({ tur: "islem", islem: i })}>
                    Düzenle
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {eslesen.length > goster && (
          <button type="button" className="satir-dugme" onClick={() => setGoster((g) => g + SAYFA)}>
            Daha fazla göster ({eslesen.length - goster} kayıt daha) <span aria-hidden="true">›</span>
          </button>
        )}
      </Bolum>
    </>
  );
}
