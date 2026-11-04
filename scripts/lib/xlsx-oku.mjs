/**
 * Bağımlılıksız .xlsx okuyucu — yalnızca Borç-Takip içe aktarması için.
 *
 * Bir .xlsx zip'lenmiş XML'dir; Node'un kendi zlib'i yetiyor, npm paketi
 * (SheetJS vb.) eklemeye gerek yok. Bu dosya gerçek veriyi AĞA göndermez,
 * hiçbir yere yazmaz: yalnızca okur ve satırları döner.
 *
 * Döner: { "Sayfa adı": [[hücre, hücre, ...], ...] }
 *   - sayı → number, metin → string, boş → null
 *   - tarih biçimli hücre → "YYYY-MM-DD" (saat varsa "YYYY-MM-DDTHH:MM")
 *   - formül → Excel'in son kaydettiği DEĞER (formülün kendisi değil)
 */

import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

/* ── zip ───────────────────────────────────────────────────────────────── */

function zipOku(tampon) {
  // End Of Central Directory kaydı: dosyanın sonundan geriye doğru aranır.
  let eocd = -1;
  for (let i = tampon.length - 22; i >= Math.max(0, tampon.length - 65_557); i -= 1) {
    if (tampon.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error("Bu bir .xlsx (zip) dosyası gibi görünmüyor.");

  const kayitSayisi = tampon.readUInt16LE(eocd + 10);
  let konum = tampon.readUInt32LE(eocd + 16);
  const dosyalar = new Map();

  for (let i = 0; i < kayitSayisi; i += 1) {
    if (tampon.readUInt32LE(konum) !== 0x02014b50) throw new Error("Zip dizini bozuk.");
    const yontem = tampon.readUInt16LE(konum + 10);
    const sikismis = tampon.readUInt32LE(konum + 20);
    const adUzunlugu = tampon.readUInt16LE(konum + 28);
    const ekUzunlugu = tampon.readUInt16LE(konum + 30);
    const yorumUzunlugu = tampon.readUInt16LE(konum + 32);
    const yerelKonum = tampon.readUInt32LE(konum + 42);
    const ad = tampon.toString("utf8", konum + 46, konum + 46 + adUzunlugu);
    konum += 46 + adUzunlugu + ekUzunlugu + yorumUzunlugu;

    dosyalar.set(ad, () => {
      const yerelAd = tampon.readUInt16LE(yerelKonum + 26);
      const yerelEk = tampon.readUInt16LE(yerelKonum + 28);
      const bas = yerelKonum + 30 + yerelAd + yerelEk;
      const ham = tampon.subarray(bas, bas + sikismis);
      if (yontem === 0) return ham;
      if (yontem === 8) return inflateRawSync(ham);
      throw new Error(`Desteklenmeyen zip sıkıştırması (${yontem}) — ${ad}`);
    });
  }
  return dosyalar;
}

/* ── xml yardımcıları ──────────────────────────────────────────────────── */

const varlik = (m) =>
  m
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");

const nitelik = (etiket, ad) => {
  const e = etiket.match(new RegExp(`\\s${ad}="([^"]*)"`));
  return e ? varlik(e[1]) : null;
};

/** <t>…</t> parçalarını (zengin metinde birden çok <r>) birleştirir. */
const metinParcalari = (xml) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((e) => varlik(e[1])).join("");

/* ── tarih ─────────────────────────────────────────────────────────────── */

const YERLESIK_TARIH_BICIMLERI = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47]);

function tarihBicimliMi(bicimKodu) {
  const temiz = bicimKodu.replace(/"[^"]*"/g, "").replace(/\[[^\]]*\]/g, "").replace(/\\./g, "");
  return /[dmyhs]/i.test(temiz) && !/^(general|genel)$/i.test(temiz);
}

function seriTarihi(seri) {
  // Excel'in 1900 takvimi: 25569 = 1970-01-01.
  const ms = Math.round((seri - 25569) * 86_400_000);
  const tarih = new Date(ms);
  const gun = tarih.toISOString().slice(0, 10);
  const saatKismi = ms - Math.floor(ms / 86_400_000) * 86_400_000;
  return saatKismi === 0 ? gun : `${gun}T${tarih.toISOString().slice(11, 16)}`;
}

/* ── çalışma kitabı ────────────────────────────────────────────────────── */

export function xlsxOku(yol) {
  const dosyalar = zipOku(readFileSync(yol));
  const al = (ad) => {
    const oku = dosyalar.get(ad);
    return oku ? oku().toString("utf8") : null;
  };

  const ortakMetinler = [];
  const ortakXml = al("xl/sharedStrings.xml");
  if (ortakXml) {
    for (const e of ortakXml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)) ortakMetinler.push(metinParcalari(e[1]));
  }

  // styles.xml: hangi hücre stili tarih? (cellXfs sırası = hücredeki s="" indeksi)
  const tarihStilleri = new Set();
  const stilXml = al("xl/styles.xml");
  if (stilXml) {
    const ozelBicimler = new Map();
    for (const e of stilXml.matchAll(/<numFmt\s[^>]*>/g)) {
      ozelBicimler.set(Number(nitelik(e[0], "numFmtId")), nitelik(e[0], "formatCode") ?? "");
    }
    const xfBolumu = stilXml.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/);
    if (xfBolumu) {
      [...xfBolumu[1].matchAll(/<xf\s[^>]*?(?:\/>|>)/g)].forEach((e, indeks) => {
        const kod = Number(nitelik(e[0], "numFmtId"));
        if (YERLESIK_TARIH_BICIMLERI.has(kod) || (ozelBicimler.has(kod) && tarihBicimliMi(ozelBicimler.get(kod)))) {
          tarihStilleri.add(indeks);
        }
      });
    }
  }

  const kitapXml = al("xl/workbook.xml");
  const iliskiXml = al("xl/_rels/workbook.xml.rels");
  if (!kitapXml || !iliskiXml) throw new Error("workbook.xml bulunamadı.");

  const hedefler = new Map();
  for (const e of iliskiXml.matchAll(/<Relationship\s[^>]*>/g)) {
    hedefler.set(nitelik(e[0], "Id"), nitelik(e[0], "Target"));
  }

  const kitap = {};
  for (const e of kitapXml.matchAll(/<sheet\s[^>]*>/g)) {
    const ad = nitelik(e[0], "name");
    const hedef = hedefler.get(nitelik(e[0], "r:id"));
    if (!ad || !hedef) continue;
    const yol2 = hedef.startsWith("/") ? hedef.slice(1) : `xl/${hedef}`;
    const sayfaXml = al(yol2);
    if (sayfaXml) kitap[ad] = sayfayiOku(sayfaXml, ortakMetinler, tarihStilleri);
  }
  return kitap;
}

/** "AB12" → sütun indeksi 27 (0'dan). */
function sutunNo(referans) {
  const harfler = referans.match(/^[A-Z]+/)[0];
  let n = 0;
  for (const h of harfler) n = n * 26 + (h.charCodeAt(0) - 64);
  return n - 1;
}

function sayfayiOku(xml, ortakMetinler, tarihStilleri) {
  const satirlar = [];
  for (const satir of xml.matchAll(/<row\s([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const satirNo = Number(nitelik(`<row ${satir[1]}`, "r")) - 1;
    const hucreler = [];
    for (const h of (satir[2] ?? "").matchAll(/<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const baslik = `<c ${h[1]}`;
      const ref = nitelik(baslik, "r");
      if (!ref) continue;
      const tur = nitelik(baslik, "t");
      const stil = Number(nitelik(baslik, "s") ?? 0);
      const govde = h[2] ?? "";
      const deger = govde.match(/<v>([\s\S]*?)<\/v>/)?.[1];

      let sonuc = null;
      if (tur === "s" && deger !== undefined) sonuc = ortakMetinler[Number(deger)] ?? null;
      else if (tur === "inlineStr") sonuc = metinParcalari(govde);
      else if (tur === "str" && deger !== undefined) sonuc = varlik(deger);
      else if (tur === "b" && deger !== undefined) sonuc = deger === "1";
      else if (tur === "e") sonuc = null;
      else if (deger !== undefined && deger !== "") {
        const sayi = Number(deger);
        sonuc = tarihStilleri.has(stil) && Number.isFinite(sayi) ? seriTarihi(sayi) : sayi;
      }
      hucreler[sutunNo(ref)] = sonuc === "" ? null : sonuc;
    }
    for (let i = 0; i < hucreler.length; i += 1) if (hucreler[i] === undefined) hucreler[i] = null;
    satirlar[satirNo] = hucreler;
  }
  for (let i = 0; i < satirlar.length; i += 1) if (satirlar[i] === undefined) satirlar[i] = [];
  return satirlar;
}
