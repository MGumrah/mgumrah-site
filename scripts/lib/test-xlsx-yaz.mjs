/**
 * YALNIZCA TESTLER İÇİN: uydurma verili küçük bir .xlsx üretir (sıkıştırmasız zip).
 * Amaç, içe aktarıcıyı gerçek dosyaya dokunmadan sınamak. Gerçek veriyle ilgisi yok.
 *
 *   xlsxYaz("/yol/dosya.xlsx", { "Sayfa": [[1, "metin", { tarih: "2026-11-04" }], ...] })
 *
 * Hücre: number → sayı, string → metin, { tarih: "YYYY-MM-DD" } → tarih biçimli sayı, null → boş.
 */

import { crc32 } from "node:zlib";
import { writeFileSync } from "node:fs";

const xmlKacis = (m) => String(m).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sutunAdi = (i) => {
  let ad = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) ad = String.fromCharCode(65 + ((n - 1) % 26)) + ad;
  return ad;
};

const tarihSeri = (t) => Date.UTC(...t.split("-").map((p, i) => (i === 1 ? Number(p) - 1 : Number(p)))) / 86_400_000 + 25569;

function sayfaXml(satirlar) {
  const govde = satirlar
    .map((satir, r) => {
      const hucreler = satir
        .map((h, c) => {
          const ref = `${sutunAdi(c)}${r + 1}`;
          if (h === null || h === undefined) return "";
          if (typeof h === "number") return `<c r="${ref}"><v>${h}</v></c>`;
          if (typeof h === "object" && h.tarih) return `<c r="${ref}" s="1"><v>${tarihSeri(h.tarih)}</v></c>`;
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlKacis(h)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${hucreler}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${govde}</sheetData></worksheet>`;
}

function zipYaz(dosyalar) {
  const parcalar = [];
  const dizin = [];
  let konum = 0;
  for (const [ad, icerik] of dosyalar) {
    const adTampon = Buffer.from(ad, "utf8");
    const veri = Buffer.from(icerik, "utf8");
    const crc = crc32(veri);
    const yerel = Buffer.alloc(30);
    yerel.writeUInt32LE(0x04034b50, 0);
    yerel.writeUInt16LE(20, 4);
    yerel.writeUInt16LE(0x0800, 6); // UTF-8 dosya adı
    yerel.writeUInt32LE(crc, 14);
    yerel.writeUInt32LE(veri.length, 18);
    yerel.writeUInt32LE(veri.length, 22);
    yerel.writeUInt16LE(adTampon.length, 26);
    parcalar.push(yerel, adTampon, veri);

    const kayit = Buffer.alloc(46);
    kayit.writeUInt32LE(0x02014b50, 0);
    kayit.writeUInt16LE(20, 4);
    kayit.writeUInt16LE(20, 6);
    kayit.writeUInt16LE(0x0800, 8);
    kayit.writeUInt32LE(crc, 16);
    kayit.writeUInt32LE(veri.length, 20);
    kayit.writeUInt32LE(veri.length, 24);
    kayit.writeUInt16LE(adTampon.length, 28);
    kayit.writeUInt32LE(konum, 42);
    dizin.push(kayit, adTampon);
    konum += 30 + adTampon.length + veri.length;
  }
  const dizinBoyu = dizin.reduce((t, b) => t + b.length, 0);
  const son = Buffer.alloc(22);
  son.writeUInt32LE(0x06054b50, 0);
  son.writeUInt16LE(dosyalar.length, 8);
  son.writeUInt16LE(dosyalar.length, 10);
  son.writeUInt32LE(dizinBoyu, 12);
  son.writeUInt32LE(konum, 16);
  return Buffer.concat([...parcalar, ...dizin, son]);
}

export function xlsxYaz(yol, sayfalar) {
  const adlar = Object.keys(sayfalar);
  const dosyalar = [
    ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>`],
    ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${adlar.map((a, i) => `<sheet name="${xmlKacis(a)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`],
    ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${adlar.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`],
    ["xl/styles.xml", `<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="14"/></cellXfs></styleSheet>`],
    ...adlar.map((a, i) => [`xl/worksheets/sheet${i + 1}.xml`, sayfaXml(sayfalar[a])])
  ];
  writeFileSync(yol, zipYaz(dosyalar));
}
