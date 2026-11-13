"use client";

import { useBorc } from "./baglam";
import { Bolum } from "./parcalar";

const MADDELER: { yol: string; ad: string; aciklama: string }[] = [
  { yol: "aylar", ad: "Tüm aylar", aciklama: "Ay ay kart, KMH, diğer ve toplam borç tablosu" },
  { yol: "gecmis", ad: "Borç geçmişi", aciklama: "Grafik, en yüksek / en düşük ay, değişim" },
  { yol: "harcama-akisi", ad: "Harcama akışı", aciklama: "Kartlardaki harcamaların kategorilere dağılımı" },
  { yol: "senaryo", ad: "Ödeme senaryosu", aciklama: "Tam öde, asgari ya da özel tutar: devreden borç ve faiz" },
  { yol: "taksit", ad: "Taksit planı", aciklama: "Önümüzdeki 12 ayın taksit yükü" },
  { yol: "ayarlar", ad: "Ayarlar", aciklama: "Düzenli gelirler, döviz kuru, faiz varsayımları, veri yedeği" }
];

/** “Daha fazla”: ana sekmelere sığmayan ekranlara giden liste (iOS'taki gibi). */
export default function Daha() {
  const { git } = useBorc();
  return (
    <Bolum baslik="Daha fazla">
      <ul className="menu">
        {MADDELER.map((m) => (
          <li key={m.yol}>
            <button type="button" className="menu-satir" onClick={() => git(m.yol)}>
              <span className="menu-metin">
                <strong>{m.ad}</strong>
                <span className="alt">{m.aciklama}</span>
              </span>
              <span aria-hidden="true" className="ok">›</span>
            </button>
          </li>
        ))}
      </ul>
    </Bolum>
  );
}
