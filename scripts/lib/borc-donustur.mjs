/**
 * Borç-Takip.xlsx → /borc veri modeli. SAF dönüşüm: dosya okumaz, ağa çıkmaz,
 * hiçbir yere yazmaz (okuma ve SQL çalıştırma scripts/borc-ice-aktar.mjs'te).
 *
 * Sütunlar KONUMA göre değil BAŞLIK ADINA göre bulunur: Excel'in yeni sürümü
 * hazırlanırken sütun sırası değişse de içe aktarma bozulmaz. Beklenen başlık
 * bulunamazsa sessizce atlamak yerine HATA verir.
 *
 * Bu dosyada gerçek rakam yok; testleri scripts/borc-test.mjs'te uydurma
 * verilerle yapılır.
 */

import { createHash } from "node:crypto";
import { ayiAl, ayinGunu, ekstreAyi, gecerliTarih } from "../../app/borc/hesap.ts";

/** "Ekstre ayı (elle)" → "ekstreayielle"; Türkçe harfler ASCII'ye, geri kalan atılır. */
export const norm = (metin) =>
  String(metin ?? "")
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");

const kurus = (tl) => (typeof tl === "number" && Number.isFinite(tl) ? Math.round(tl * 100) : null);

/** "2026-10-01", "2026-10-01T00:00", "08.09.2025" → "YYYY-MM-DD"; olmazsa null. */
function tarihAl(deger) {
  if (typeof deger !== "string") return null;
  const iso = deger.slice(0, 10);
  if (gecerliTarih(iso)) return iso;
  const tr = deger.trim().match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (tr) {
    const t = `${tr[3]}-${tr[2].padStart(2, "0")}-${tr[1].padStart(2, "0")}`;
    return gecerliTarih(t) ? t : null;
  }
  return null;
}

const ayAl = (deger) => {
  const t = tarihAl(deger);
  return t ? ayiAl(t) : null;
};

const TUR = { kk: "kart", kart: "kart", kmh: "kmh", diger: "diger" };

function sayfaBul(kitap, ad) {
  const anahtar = Object.keys(kitap).find((k) => norm(k) === norm(ad));
  if (!anahtar) throw new Error(`"${ad}" sayfası bulunamadı (sayfalar: ${Object.keys(kitap).join(", ")}).`);
  return kitap[anahtar];
}

/** Başlık satırını bulur: verilen başlıkların hepsini içeren ilk satır. */
function baslikBul(satirlar, gerekli, sayfaAdi) {
  for (let i = 0; i < satirlar.length; i += 1) {
    const adlar = (satirlar[i] ?? []).map(norm);
    if (gerekli.every((g) => adlar.includes(g))) return { indeks: i, sutun: (ad) => adlar.indexOf(ad), onekSutun: (onek) => adlar.findIndex((a) => a.startsWith(onek)) };
  }
  throw new Error(`"${sayfaAdi}" sayfasında beklenen başlıklar bulunamadı: ${gerekli.join(", ")}.`);
}

const ortanca = (dizi) => {
  const s = [...dizi].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};

/**
 * @param kitap   xlsxOku çıktısı
 * @param secenek { ekHesaplar: [{ad, tur, limit(kuruş), kesimGunu, sonOdemeGunu}] }
 */
export function donustur(kitap, secenek = {}) {
  const uyarilar = [];
  const uyar = (m) => uyarilar.push(m);

  /* ── Hesaplar sayfası: hesap listesi, ayarlar, güncel dönem belgeleri ── */
  const hs = sayfaBul(kitap, "Hesaplar");
  const hesapBasligi = baslikBul(hs, ["hesap", "tur"], "Hesaplar");
  const kesimSutunu = hesapBasligi.onekSutun("kesimgunu");
  // Excel v2: limit, son ödeme günü ve asgari oranı doğrudan bu tabloda girilir; v1'de yoktu (-1).
  const limitSutunu = hesapBasligi.sutun("limit");
  const odemeGunuSutunu = hesapBasligi.onekSutun("sonodemegunu");
  const asgariSutunu = hesapBasligi.onekSutun("asgarioran");
  const borcSutunu = hesapBasligi.sutun("borc");
  const gun = (v) => (Number.isInteger(v) && v >= 1 && v <= 31 ? v : null);
  const hesaplar = [];
  const tablodakiBorc = new Map();
  for (let i = hesapBasligi.indeks + 1; i < hs.length; i += 1) {
    const satir = hs[i] ?? [];
    if (!satir[0]) break;
    const tur = TUR[norm(satir[hesapBasligi.sutun("tur")])];
    if (!tur) {
      uyar(`Hesaplar: "${satir[0]}" satırının türü tanınmadı (${satir[hesapBasligi.sutun("tur")]}); atlandı.`);
      continue;
    }
    const kesim = kesimSutunu !== -1 && Number.isInteger(satir[kesimSutunu]) ? satir[kesimSutunu] : null;
    const oran = asgariSutunu !== -1 ? satir[asgariSutunu] : null;
    const hesap = {
      ad: String(satir[0]).trim(),
      tur,
      limit: (limitSutunu !== -1 ? kurus(satir[limitSutunu]) : null) ?? 0,
      kesimGunu: tur === "kart" ? kesim : null,
      sonOdemeGunu: tur === "kart" && odemeGunuSutunu !== -1 ? gun(satir[odemeGunuSutunu]) : null,
      asgariOraniBp: tur === "kart" && typeof oran === "number" && oran > 0 && oran <= 1 ? Math.round(oran * 10_000) : null,
      asgariAcik: false
    };
    hesap.asgariAcik = hesap.asgariOraniBp !== null;
    hesaplar.push(hesap);
    if (borcSutunu !== -1) tablodakiBorc.set(norm(hesap.ad), kurus(satir[borcSutunu]));
  }
  if (hesaplar.length === 0) throw new Error("Hesaplar sayfasında hesap bulunamadı.");

  // Ek hesaplar (komut satırından): Excel'e hiç girmemiş bir kart gibi.
  for (const ek of secenek.ekHesaplar ?? []) {
    const var_ = hesaplar.find((h) => norm(h.ad) === norm(ek.ad));
    if (var_) Object.assign(var_, { limit: ek.limit ?? var_.limit, kesimGunu: ek.kesimGunu ?? var_.kesimGunu, sonOdemeGunu: ek.sonOdemeGunu ?? var_.sonOdemeGunu });
    else hesaplar.push({ ad: ek.ad, tur: ek.tur, limit: ek.limit ?? 0, kesimGunu: ek.kesimGunu ?? null, sonOdemeGunu: ek.sonOdemeGunu ?? null, asgariOraniBp: null, ek: true });
  }
  const hesapBul = (ad) => hesaplar.find((h) => norm(h.ad) === norm(ad));

  // Ayarlar bloğu: "Ayar | Değer | Kaynak"
  let ayarBasligi;
  try {
    ayarBasligi = baslikBul(hs, ["ayar", "deger"], "Hesaplar");
  } catch {
    ayarBasligi = baslikBul(hs, ["ayarlar", "deger"], "Hesaplar");
  }
  const ayarlar = {};
  let veriTarihi = null;
  const AYAR_ESLEME = [
    ["vergicarpani", "vergiCarpani", (v) => v],
    ["kartfaizi", null, null], // alt/üst aşağıda
    ["faizesigi", "faizEsigi", (v) => kurus(v)],
    ["kmhfaizi", "kmhFaizi", (v) => v]
  ];
  for (let i = ayarBasligi.indeks + 1; i < hs.length; i += 1) {
    const satir = hs[i] ?? [];
    if (!satir[0]) break;
    const etiket = norm(satir[0]);
    const deger = satir[1];
    if (etiket === "veritarihi") {
      veriTarihi = tarihAl(deger);
      continue;
    }
    if (typeof deger !== "number") continue;
    // Faiz oranları 0–1 arası, vergi çarpanı 1–2 arası olur; "KMH faizinin hesaba yazıldığı gün = 2" gibi başka bir
    // satır adı "kmhfaizi" ile başlasa da oran sanılmasın.
    if (etiket.includes("gun")) continue;
    if (etiket.includes("esigi")) {
      // "Faiz eşiği (TL)" (v1) ve "Kart faizi eşiği (TL)" (v2): tutar. Oran etiketlerindeki "≤ eşik" bununla karışmaz ("eşiği" ≠ "eşik").
      ayarlar.faizEsigi = kurus(deger);
      continue;
    }
    if (etiket.startsWith("kartfaizi")) {
      // "...(devreden ≤ eşik)" ve "...(devreden > eşik)": işaretler normalize'da düştü; metnin kendisine bak.
      const metin = String(satir[0]);
      ayarlar[/>/.test(metin) ? "kartFaiziUst" : "kartFaiziAlt"] = deger;
      continue;
    }
    const makul = (alan) => (alan === "vergiCarpani" ? deger >= 1 && deger < 2 : alan === "kmhFaizi" ? deger > 0 && deger < 1 : true);
    for (const [onek, alan, don] of AYAR_ESLEME) if (alan && etiket.startsWith(onek) && makul(alan)) ayarlar[alan] = don(deger);
  }

  // Güncel dönem belgeleri: "Hesap | Belge tarihi | Güncel dönem borcu | Son ekstre borcu | Ödenen | Son ödeme (dönem) | Güncel toplam borç ..."
  const belgeler = new Map();
  try {
    const b = baslikBul(hs, ["hesap", "belgetarihi"], "Hesaplar");
    const sTarih = b.sutun("belgetarihi");
    const sToplam = b.onekSutun("guncel" + "toplamborc"); // "Güncel toplam borç (limit − kullanılabilir limit)"
    const sEkstre = b.onekSutun("sonekstreborcu");
    const sOdeme = b.onekSutun("sonodeme");
    for (let i = b.indeks + 1; i < hs.length; i += 1) {
      const satir = hs[i] ?? [];
      if (!satir[0]) break;
      belgeler.set(norm(satir[0]), {
        tarih: tarihAl(satir[sTarih]),
        borc: sToplam === -1 ? null : kurus(satir[sToplam]),
        ekstre: sEkstre === -1 ? null : kurus(satir[sEkstre]),
        sonOdeme: sOdeme === -1 ? null : tarihAl(satir[sOdeme])
      });
    }
  } catch {
    // "Belge tarihi" tablosu v1'de vardı; v2'de güncel değerler Durum'un son ayında. İkisinde de Durum esas, uyarı gerekmez.
    // (belgeler boş kalır; aşağıdaki katman atlanır)
  }

  /* ── Durum sayfası: aylık geçmiş ── */
  const ds = sayfaBul(kitap, "Durum");
  const dB = baslikBul(ds, ["ay", "hesap", "limit", "borc"], "Durum");
  const dS = { ay: dB.sutun("ay"), hesap: dB.sutun("hesap"), limit: dB.sutun("limit"), borc: dB.sutun("borc"), ekstre: dB.sutun("ekstre"), asgari: dB.sutun("asgari"), sonOdeme: dB.sutun("sonodeme"), not: dB.sutun("not") };
  const durumSatirlari = [];
  for (let i = dB.indeks + 1; i < ds.length; i += 1) {
    const satir = ds[i] ?? [];
    if (!satir[dS.hesap]) continue;
    const hesap = hesapBul(satir[dS.hesap]);
    const ay = ayAl(satir[dS.ay]);
    if (!hesap || !ay) {
      uyar(`Durum satır ${i + 1}: hesap ya da ay tanınmadı (${satir[dS.hesap]} / ${satir[dS.ay]}); atlandı.`);
      continue;
    }
    const borc = kurus(satir[dS.borc]);
    if (borc === null) {
      uyar(`Durum satır ${i + 1}: ${hesap.ad} ${ay} borcu sayı değil; atlandı.`);
      continue;
    }
    durumSatirlari.push({
      hesap,
      ay,
      tarih: `${ay}-01`,
      borc: hesap.tur === "kmh" ? Math.max(0, borc) : borc,
      limit: dS.limit === -1 ? null : kurus(satir[dS.limit]),
      ekstre: dS.ekstre === -1 ? null : kurus(satir[dS.ekstre]),
      asgari: dS.asgari === -1 ? null : kurus(satir[dS.asgari]),
      sonOdeme: dS.sonOdeme === -1 ? null : tarihAl(satir[dS.sonOdeme]),
      not: dS.not === -1 ? "" : String(satir[dS.not] ?? "")
    });
  }

  // Hesap bazında: limit (en yeni dolu), son ödeme günü (ortanca), asgari oranı (ortanca).
  for (const hesap of hesaplar) {
    const kendi = durumSatirlari.filter((d) => d.hesap === hesap).sort((a, b) => a.ay.localeCompare(b.ay));
    const sonLimit = [...kendi].reverse().find((d) => d.limit);
    if (sonLimit && !hesap.ek && !hesap.limit) hesap.limit = sonLimit.limit;
    const gunler = kendi.filter((d) => d.sonOdeme).slice(-6).map((d) => Number(d.sonOdeme.slice(8)));
    if (hesap.sonOdemeGunu === null && gunler.length) hesap.sonOdemeGunu = ortanca(gunler);
    const oranlar = kendi.filter((d) => d.ekstre > 0 && d.asgari > 0).slice(-4).map((d) => d.asgari / d.ekstre);
    if (oranlar.length) {
      const oran = ortanca(oranlar);
      // Bankalar %20 / %40 uygular; birine 0,03 yakınsa oraya yuvarla, değilse olduğu gibi bırak.
      const yakin = [0.2, 0.4].find((r) => Math.abs(oran - r) <= 0.03);
      const gozlenen = Math.round((yakin ?? oran) * 10_000);
      if (hesap.asgariAcik) {
        // Excel'de elle girilmiş oran geçerli; ama son ekstrelerdeki gerçek oranla çelişiyorsa söyle.
        if (Math.abs(gozlenen - hesap.asgariOraniBp) > 300) {
          uyar(`${hesap.ad}: Excel'deki asgari oranı %${hesap.asgariOraniBp / 100}, ama son ekstrelerde gerçekleşen asgari/ekstre oranı %${gozlenen / 100}. Excel'dekine uyuldu.`);
        }
      } else {
        hesap.asgariOraniBp = gozlenen;
      }
    }
    if (hesap.tur === "kart" && !hesap.kesimGunu) uyar(`${hesap.ad}: kesim günü yok; harcamalar kendi ayının ekstresine yazılır.`);
  }

  // Son Durum ayının satırları "güncel" ölçümdür; tarihi Excel'in "Veri tarihi"dir (ay başı değil).
  const sonAy = durumSatirlari.reduce((en, d) => (en === null || d.ay > en ? d.ay : en), null);
  const sonSatirlar = durumSatirlari.filter((d) => d.ay === sonAy);
  if (veriTarihi) for (const d of sonSatirlar) d.tarih = veriTarihi;

  // "Güncel dönem" belgesi olan kartlar: belge Durum'daki son ölçümden YENİ ya da aynı gün ise belgedeki
  // değerler güncel ölçüm olur (yeni bir satır ya da aynı günkünün üstüne). ESKİ ise Durum değeri geçerli
  // kalır; yalnızca eksik ekstre/son ödeme tarihi belgeden tamamlanır ve fark uyarı olarak yazılır.
  const durum = [...durumSatirlari];
  for (const hesap of hesaplar.filter((h) => h.tur === "kart")) {
    const belge = belgeler.get(norm(hesap.ad));
    if (!belge || belge.borc === null || !belge.tarih) continue;
    const son = sonSatirlar.find((d) => d.hesap === hesap);

    if (!veriTarihi || !son || belge.tarih >= veriTarihi) {
      const hedef = durum.find((d) => d.hesap === hesap && d.tarih === belge.tarih);
      const yeni = {
        hesap,
        ay: ayiAl(belge.tarih),
        tarih: belge.tarih,
        borc: belge.borc,
        limit: son?.limit ?? null,
        ekstre: belge.ekstre ?? son?.ekstre ?? null,
        asgari: son?.asgari ?? null,
        sonOdeme: belge.sonOdeme ?? son?.sonOdeme ?? null,
        not: "güncel dönem belgesi"
      };
      if (hedef) Object.assign(hedef, yeni);
      else durum.push(yeni);
    } else {
      if (son.borc !== belge.borc) {
        uyar(`${hesap.ad}: Hesaplar sayfasındaki belge (${belge.tarih}) Durum'daki son ölçümden (${veriTarihi}) eski ve borçları farklı; Durum'daki değer kullanıldı.`);
      }
      son.ekstre ??= belge.ekstre;
      son.sonOdeme ??= belge.sonOdeme;
    }
  }

  // Hiç ölçümü olmayan hesaplar için ilk ölçüm (komut satırından eklenenler ya da Durum'a henüz girilmemiş
  // bir kart): ekranda görünsünler. Borç, Hesaplar tablosundaki "Borç" sütunundan; yoksa sıfır.
  for (const hesap of hesaplar.filter((h) => !durum.some((d) => d.hesap === h))) {
    const tarih = veriTarihi ?? `${sonAy ?? "2026-01"}-01`;
    const borc = hesap.ek ? 0 : (tablodakiBorc.get(norm(hesap.ad)) ?? 0);
    durum.push({ hesap, ay: ayiAl(tarih), tarih, borc, limit: hesap.limit || null, ekstre: null, asgari: null, sonOdeme: null, not: hesap.ek ? "elle eklendi" : "Hesaplar sayfasından" });
  }

  /* ── İşlemler ── */
  const isl = sayfaBul(kitap, "İşlemler");
  const iB = baslikBul(isl, ["tarih", "hesap", "aciklama", "tutar"], "İşlemler");
  const iS = { tarih: iB.sutun("tarih"), hesap: iB.sutun("hesap"), aciklama: iB.sutun("aciklama"), tutar: iB.sutun("tutar"), taksit: iB.sutun("taksit"), elle: iB.sutun("ekstreayielle"), hesapli: iB.sutun("ekstreayi"), kategori: iB.sutun("kategori"), not: iB.sutun("not") };
  const islemler = [];
  const sayac = new Map();
  let ekstreFarki = 0;
  let tarihsiz = 0;
  for (let i = iB.indeks + 1; i < isl.length; i += 1) {
    const satir = isl[i] ?? [];
    let tarih = tarihAl(satir[iS.tarih]);
    const tutar = kurus(satir[iS.tutar]);
    if (!tarih && tutar === null && !satir[iS.hesap]) continue; // boş satır
    const hesap = hesapBul(satir[iS.hesap]);
    const excelAy = ayAl(satir[iS.elle]) ?? (iS.hesapli === -1 ? null : ayAl(satir[iS.hesapli]));

    // Eski dosyadan gelen bazı satırların tarihi yok ama ekstre ayı elle yazılı (ör. faiz/ücret satırları). Bunlar
    // GERÇEK borç: atlamak yerine o ekstrenin kesim gününe yazılır ve "tarih bilinmiyor" diye işaretlenir.
    let tarihNotu = "";
    if (!tarih && excelAy && hesap?.tur === "kart" && tutar !== null && tutar !== 0) {
      tarih = ayinGunu(excelAy, hesap.kesimGunu ?? 1);
      tarihNotu = "tarih bilinmiyor";
      tarihsiz += 1;
    }

    if (!tarih || tutar === null || tutar === 0 || !hesap || hesap.tur !== "kart") {
      uyar(`İşlemler satır ${i + 1}: tarih/tutar/kart eksik ya da geçersiz (${satir[iS.hesap] ?? "?"}); atlandı.`);
      continue;
    }
    const taksit = Number.isInteger(satir[iS.taksit]) && satir[iS.taksit] >= 1 && satir[iS.taksit] <= 60 ? satir[iS.taksit] : 1;
    const aciklama = String(satir[iS.aciklama] ?? "").trim() || "(açıklamasız)";

    const bizim = ekstreAyi(tarih, hesap.kesimGunu);
    if (excelAy && excelAy !== bizim) ekstreFarki += 1;

    // Aynı gün, aynı kart, aynı açıklamalı özdeş satırlar (Excel'de çok var) sıra numarasıyla ayrılır.
    const temel = `${tarih}|${norm(hesap.ad)}|${norm(aciklama)}`;
    const sira = (sayac.get(temel) ?? 0) + 1;
    sayac.set(temel, sira);
    islemler.push({
      hesap,
      tarih,
      aciklama: aciklama.slice(0, 160),
      tutar,
      taksit,
      // Excel'in kendi ekstre ayı (elle girilmişse ya da formülle bulunmuşsa) esas; yoksa kesim gününe göre.
      ekstreAy: excelAy ?? bizim,
      kategori: iS.kategori === -1 ? "" : String(satir[iS.kategori] ?? "").slice(0, 40),
      not: [iS.not === -1 ? "" : String(satir[iS.not] ?? ""), tarihNotu].filter(Boolean).join(" · ").slice(0, 400),
      kaynakAnahtar: "xlsx:" + createHash("sha1").update(`${temel}|${sira}`).digest("hex").slice(0, 20)
    });
  }
  if (tarihsiz > 0) uyar(`${tarihsiz} işlemin tarihi Excel'de yok; ekstre ayının kesim gününe yazıldı ve "tarih bilinmiyor" diye işaretlendi.`);
  if (ekstreFarki > 0) uyar(`${ekstreFarki} işlemde Excel'deki ekstre ayı, kesim gününe göre hesaplananla farklı (Excel'dekine uyuldu).`);

  /* ── Çapraz kontrol: Özet sayfasındaki toplamlar ── */
  const guncel = new Map();
  for (const d of durum) {
    const eski = guncel.get(d.hesap);
    if (!eski || d.tarih >= eski.tarih) guncel.set(d.hesap, d);
  }
  const toplam = (...turler) => [...guncel.entries()].filter(([h]) => turler.includes(h.tur)).reduce((t, [, d]) => t + d.borc, 0);
  const toplamlar = { isyeriHaric: toplam("kart", "kmh"), isyeriDahil: toplam("kart", "kmh", "diger") };
  // Çapraz kontrol: Özet (v1) ya da Pano (v2) sayfasındaki "Toplam (işyeri hariç / dahil)" satırları.
  // v1'de rakam etiketin yanındaki sütunda; v2'de "Borç" başlıklı sütunda.
  const ozetSayfasi = Object.keys(kitap).find((k) => ["ozet", "pano"].includes(norm(k)));
  if (ozetSayfasi) {
    const satirlar = kitap[ozetSayfasi];
    satirlar.forEach((satir, i) => {
      const etiket = norm(satir?.[0]);
      const haric = etiket === "toplamisyeriharic" || etiket === "toplamborcisyeriharic";
      const dahil = etiket === "toplamisyeridahil" || etiket === "toplamborcisyeridahil";
      if (!haric && !dahil) return;
      let sutun = 1;
      for (let j = i - 1; j >= 0; j -= 1) {
        const k = (satirlar[j] ?? []).findIndex((h, c) => c > 0 && norm(h) === "borc");
        if (k !== -1) {
          sutun = k;
          break;
        }
      }
      const excel = kurus(satir[sutun]);
      const bizim = haric ? toplamlar.isyeriHaric : toplamlar.isyeriDahil;
      if (excel !== null && Math.abs(excel - bizim) > 1) {
        uyar(`${ozetSayfasi} sayfasındaki 'Toplam (işyeri ${haric ? "hariç" : "dahil"})' ile içe aktarılan güncel durum FARKLI: Excel'i ve belge tarihlerini kontrol edin.`);
      }
    });
  }

  return { hesaplar, ayarlar, durum, islemler, toplamlar, veriTarihi, uyarilar };
}

/* ── SQL ───────────────────────────────────────────────────────────────── */

const q = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(Math.trunc(v)) : `'${String(v).replace(/'/g, "''")}'`);
const hesapId = (h) => `(SELECT id FROM hesaplar WHERE ad = ${q(h.ad)})`;

/** Yeniden çalıştırılabilir (upsert) SQL. DELETE yok: telefondan girilenlere dokunmaz. */
export function sqlUret(sonuc, zaman = new Date().toISOString()) {
  const s = [];
  const ayarEsleme = { vergiCarpani: "vergiCarpani", kartFaiziAlt: "kartFaiziAlt", kartFaiziUst: "kartFaiziUst", faizEsigi: "faizEsigi", kmhFaizi: "kmhFaizi" };
  for (const [anahtar, deger] of Object.entries(sonuc.ayarlar)) {
    if (ayarEsleme[anahtar]) s.push(`INSERT INTO ayarlar (anahtar, deger) VALUES (${q(anahtar)}, ${q(String(deger))}) ON CONFLICT (anahtar) DO UPDATE SET deger = excluded.deger`);
  }
  sonuc.hesaplar.forEach((h, sira) => {
    s.push(
      `INSERT INTO hesaplar (ad, tur, limit_kurus, kesim_gunu, son_odeme_gunu, asgari_orani_bp, sira, aktif) VALUES (${[h.ad, h.tur, h.limit, h.kesimGunu, h.sonOdemeGunu, h.asgariOraniBp, sira, 1].map(q).join(", ")})
       ON CONFLICT (ad) DO UPDATE SET tur = excluded.tur, limit_kurus = excluded.limit_kurus, kesim_gunu = excluded.kesim_gunu, son_odeme_gunu = excluded.son_odeme_gunu, asgari_orani_bp = excluded.asgari_orani_bp, sira = excluded.sira`
    );
  });
  for (const d of sonuc.durum) {
    s.push(
      `INSERT INTO durum_kayitlari (hesap_id, tarih, ay, borc_kurus, limit_kurus, ekstre_kurus, asgari_kurus, son_odeme, aciklama, olusturuldu)
       VALUES (${hesapId(d.hesap)}, ${[d.tarih, d.ay, d.borc, d.limit, d.ekstre, d.asgari, d.sonOdeme, d.not, zaman].map(q).join(", ")})
       ON CONFLICT (hesap_id, tarih) DO UPDATE SET ay = excluded.ay, borc_kurus = excluded.borc_kurus, limit_kurus = excluded.limit_kurus, ekstre_kurus = excluded.ekstre_kurus, asgari_kurus = excluded.asgari_kurus, son_odeme = excluded.son_odeme, aciklama = excluded.aciklama`
    );
  }
  for (const i of sonuc.islemler) {
    s.push(
      `INSERT INTO islemler (tarih, hesap_id, aciklama, tutar_kurus, taksit, ekstre_ay, kategori, aciklama_not, olusturuldu, kaynak_anahtar)
       VALUES (${q(i.tarih)}, ${hesapId(i.hesap)}, ${[i.aciklama, i.tutar, i.taksit, i.ekstreAy, i.kategori, i.not, zaman, i.kaynakAnahtar].map(q).join(", ")})
       ON CONFLICT (kaynak_anahtar) DO UPDATE SET tarih = excluded.tarih, hesap_id = excluded.hesap_id, aciklama = excluded.aciklama, tutar_kurus = excluded.tutar_kurus, taksit = excluded.taksit, ekstre_ay = excluded.ekstre_ay, kategori = excluded.kategori, aciklama_not = excluded.aciklama_not`
    );
  }
  return s.join(";\n") + ";\n";
}
