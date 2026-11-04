#!/usr/bin/env node
/**
 * Excel içe aktarıcının testi — `node scripts/borc-ice-aktar-test.mjs`.
 *
 * Gerçek dosyaya dokunmaz: Borç-Takip.xlsx ile AYNI yerleşimde ama tamamen
 * uydurma rakamlı küçük bir .xlsx üretir, okur, dönüştürür ve çıkan SQL'i
 * bellekteki bir SQLite'ta (node:sqlite) gerçek migration'larla çalıştırır.
 */

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { donustur, norm, sqlUret } from "./lib/borc-donustur.mjs";
import { xlsxOku } from "./lib/xlsx-oku.mjs";
import { xlsxYaz } from "./lib/test-xlsx-yaz.mjs";

const T = (tarih) => ({ tarih });

function kitapUret() {
  const hesaplar = [
    ["Hesaplar ve ayarlar"],
    ["Mavi = girilen değer, sarı zemin = ayar."],
    ["Hesap", "Tür", "Kesim günü (yaklaşık)", "Not"],
    ["Örnek A KK", "KK", 9, "not"],
    ["Örnek B KK", "KK", 8],
    ["Örnek C KMH", "KMH"],
    ["Örnek D borcu", "Diğer"],
    [],
    ["Ayar", "Değer", "Kaynak / açıklama"],
    ["Vergi çarpanı (BSMV + KKDF)", 1.3, "x"],
    ["Kart faizi, aylık (devreden ≤ eşik)", 0.035, "x"],
    ["Kart faizi, aylık (devreden > eşik)", 0.04, "x"],
    ["Faiz eşiği (TL)", 25000, "x"],
    ["KMH faizi, aylık", 0.0425, "x"],
    ["Aylık gelir (maaş)", 50000, "x"],
    ["Veri tarihi", T("2026-11-03"), "x"],
    [],
    ["Güncel dönem borcu (bankadan alınan 'güncel dönem' belgesi)"],
    ["Belge yoksa boş bırakın."],
    ["Hesap", "Belge tarihi", "Güncel dönem borcu", "Son ekstre borcu", "Ödenen", "Son ödeme (dönem)", "Güncel toplam borç (limit − kullanılabilir)", "Not"],
    ["Örnek A KK", T("2026-11-04"), 1000, 3000, 0, T("2026-11-20"), 5000.5, "yeni belge"],
    ["Örnek B KK", T("2026-10-30"), 500, 4000, 0, null, 99999, "eski belge, farklı borç"]
  ];

  const durum = [["Ay", "Hesap", "Tür", "Limit", "Borç", "Ekstre", "Asgari", "Son ödeme", "Not"]];
  const aylar = ["2026-07-01", "2026-08-01", "2026-09-01", "2026-10-01"];
  aylar.forEach((ay, i) => {
    durum.push([T(ay), "Örnek A KK", "KK", 100000, 8000 + i * 100, 10000, 4000, T(`2026-${String(7 + i).padStart(2, "0")}-${[18, 19, 20, 19][i]}`), null]);
    durum.push([T(ay), "Örnek B KK", "KK", 200000, 15000 + i * 100, 20000, 4000, T(`2026-${String(7 + i).padStart(2, "0")}-16`), null]);
    durum.push([T(ay), "Örnek C KMH", "KMH", 50000, 1200, null, null, null, null]);
    durum.push([T(ay), "Örnek D borcu", "Diğer", null, 7000, null, null, null, null]);
  });

  const islemler = [
    ["Tarih", "Hesap", "Açıklama", "Tutar", "Taksit", "Ekstre ayı (elle)", "Kategori", "Not", "Aylık taksit", "Ekstre ayı", "Son taksit ayı"],
    [T("2026-10-08"), "Örnek A KK", "Market", 250.5, 1, null, null, null, 250.5, T("2026-10-01"), T("2026-10-01")],
    [T("2026-10-08"), "Örnek A KK", "Market", 250.5, 1, null, null, null, 250.5, T("2026-10-01"), T("2026-10-01")],
    [T("2026-10-12"), "Örnek A KK", "Mobilya", 12000, 6, null, null, null, 2000, T("2026-11-01"), T("2027-04-01")],
    [T("2026-10-20"), "Örnek B KK", "Tatil", 5000, 2, null, null, "not'lu", 2500, T("2026-10-01"), T("2026-11-01")],
    [T("2026-10-21"), "Örnek A KK", "İade", -90, 1, null, null, null, null, null, null],
    [null, "Örnek A KK", "Tarihsiz faiz", 100, 1, T("2026-11-01"), "Faiz", "Eski dosyada tarih", 100, T("2026-11-01"), T("2026-11-01")],
    [T("2026-10-22"), "Örnek A KK", "Tutarsız", null, 1],
    [T("2026-10-22"), "Bilinmeyen KK", "Kayıp kart", 10, 1],
    [T("2026-10-22"), "Örnek C KMH", "KMH'ye işlem", 10, 1],
    []
  ];

  const ozet = [["Borç özeti"], ["Toplam borç (işyeri hariç)", 123456]];
  return { Özet: ozet, Durum: durum, İşlemler: islemler, "Taksit Planı": [["x"]], Hesaplar: hesaplar, Notlar: [["x"]] };
}

function oku(kitap = kitapUret(), secenek) {
  const klasor = mkdtempSync(join(tmpdir(), "borc-test-"));
  try {
    const yol = join(klasor, "uydurma.xlsx");
    xlsxYaz(yol, kitap);
    return xlsxOku(yol);
  } finally {
    rmSync(klasor, { recursive: true, force: true });
  }
}

test("başlık normalleştirme Türkçe harfleri ve işaretleri atar", () => {
  assert.equal(norm("Ekstre ayı (elle)"), "ekstreayielle");
  assert.equal(norm("Güncel toplam borç (limit − kullanılabilir limit)"), "guncel" + "toplamborc" + "limitkullanilabilirlimit");
  assert.equal(norm("İşyerine borç"), "isyerineborc");
});

test("xlsx okuyucu: sayfalar, metin, sayı ve tarih biçimli hücreler", () => {
  const k = oku();
  assert.deepEqual(Object.keys(k), ["Özet", "Durum", "İşlemler", "Taksit Planı", "Hesaplar", "Notlar"]);
  assert.equal(k.Hesaplar[3][0], "Örnek A KK");
  assert.equal(k.Hesaplar[3][2], 9);
  assert.equal(k.Hesaplar[15][1], "2026-11-03", "tarih biçimli hücre ISO metne döner");
  assert.equal(k["İşlemler"][1][3], 250.5);
});

test("dönüşüm: hesaplar, ayarlar, asgari oranı, son ödeme günü", () => {
  const s = donustur(oku());
  assert.deepEqual(s.hesaplar.map((h) => [h.ad, h.tur, h.kesimGunu]), [
    ["Örnek A KK", "kart", 9],
    ["Örnek B KK", "kart", 8],
    ["Örnek C KMH", "kmh", null],
    ["Örnek D borcu", "diger", null]
  ]);
  assert.deepEqual(s.ayarlar, { vergiCarpani: 1.3, kartFaiziAlt: 0.035, kartFaiziUst: 0.04, faizEsigi: 2_500_000, kmhFaizi: 0.0425 });
  assert.equal(s.veriTarihi, "2026-11-03");
  const [a, b, c] = s.hesaplar;
  assert.equal(a.limit, 10_000_000);
  assert.equal(a.asgariOraniBp, 4000, "asgari/ekstre = 0,4 → %40");
  assert.equal(b.asgariOraniBp, 2000, "asgari/ekstre = 0,2 → %20");
  assert.equal(c.asgariOraniBp, null);
  assert.equal(a.sonOdemeGunu, 19, "son 6 ayın son ödeme günlerinin ortancası");
  assert.equal(b.sonOdemeGunu, 16);
});

test("dönüşüm: güncel durum — yeni belge üste biner, eski belge Durum'u bozmaz ama uyarır", () => {
  const s = donustur(oku());
  const son = (ad) => s.durum.filter((d) => d.hesap.ad === ad).sort((x, y) => x.tarih.localeCompare(y.tarih)).at(-1);

  assert.equal(son("Örnek A KK").tarih, "2026-11-04", "belge Durum'un 03.11 ölçümünden yeni");
  assert.equal(son("Örnek A KK").borc, 500_050);
  assert.equal(son("Örnek A KK").ekstre, 300_000);
  assert.equal(son("Örnek A KK").sonOdeme, "2026-11-20");
  assert.equal(s.durum.filter((d) => d.hesap.ad === "Örnek A KK").length, 5, "Ekim ölçümü geçmiş olarak kalır, belge ayrı satır");

  // B: belge 30.10 < veri tarihi 03.11 → Durum'daki değer geçerli
  assert.equal(son("Örnek B KK").tarih, "2026-11-03");
  assert.equal(son("Örnek B KK").borc, 15_300 * 100);
  assert.ok(s.uyarilar.some((u) => u.includes("Örnek B KK") && u.includes("eski")), "eski belge uyarısı");

  assert.equal(son("Örnek C KMH").tarih, "2026-11-03", "son ay satırları Excel'in veri tarihini alır");
  assert.equal(s.toplamlar.isyeriDahil - s.toplamlar.isyeriHaric, 700_000);
  assert.ok(s.uyarilar.some((u) => u.includes("Özet")), "Özet toplamı uyuşmadığında uyarı");
});

test("dönüşüm: işlemler — özdeş satırlar ayrı anahtar alır, geçersizler atlanır, Excel'in ekstre ayına uyulur", () => {
  const s = donustur(oku());
  assert.equal(s.islemler.length, 6, "6 geçerli: 2 market, mobilya, tatil, iade, tarihsiz faiz");
  const anahtarlar = new Set(s.islemler.map((i) => i.kaynakAnahtar));
  assert.equal(anahtarlar.size, 6, "özdeş iki market satırı farklı anahtar");

  // Tarihi olmayan ama ekstre ayı yazılı satır gerçek borçtur: atlanmaz, o ekstrenin kesim gününe yazılır.
  const faiz = s.islemler.find((i) => i.aciklama === "Tarihsiz faiz");
  assert.deepEqual([faiz.tarih, faiz.ekstreAy, faiz.kategori], ["2026-11-09", "2026-11", "Faiz"], "Örnek A'nın kesim günü 9");
  assert.equal(faiz.not, "Eski dosyada tarih · tarih bilinmiyor");
  assert.ok(s.uyarilar.some((u) => u.includes("tarihi Excel'de yok")));
  assert.ok([...anahtarlar].every((k) => k.startsWith("xlsx:")));

  const mobilya = s.islemler.find((i) => i.aciklama === "Mobilya");
  assert.deepEqual([mobilya.tutar, mobilya.taksit, mobilya.ekstreAy], [1_200_000, 6, "2026-11"]);
  const tatil = s.islemler.find((i) => i.aciklama === "Tatil");
  assert.equal(tatil.ekstreAy, "2026-10", "Excel Ekim dedi; kesim günü hesabı Kasım derdi — Excel'e uyulur");
  assert.equal(tatil.not, "not'lu");
  assert.equal(s.islemler.find((i) => i.aciklama === "İade").tutar, -9000);

  assert.ok(s.uyarilar.some((u) => u.includes("Bilinmeyen KK")), "bilinmeyen kart uyarısı");
  assert.ok(s.uyarilar.some((u) => u.includes("Örnek C KMH")), "KMH'ye işlem uyarısı");
  assert.ok(s.uyarilar.some((u) => u.includes("ekstre ayı") && u.includes("farklı")));

  // Anahtarlar tekrar çalıştırmada aynı kalmalı (yeniden içe aktarma yeni satır açmasın).
  const ikinci = donustur(oku());
  assert.deepEqual(ikinci.islemler.map((i) => i.kaynakAnahtar), s.islemler.map((i) => i.kaynakAnahtar));
});

test("dönüşüm: ek hesap (--hesap) sıfır borçla eklenir", () => {
  const s = donustur(oku(), { ekHesaplar: [{ ad: "Örnek E KK", tur: "kart", limit: 7_241_200, kesimGunu: 12, sonOdemeGunu: 22 }] });
  const e = s.hesaplar.find((h) => h.ad === "Örnek E KK");
  assert.deepEqual([e.tur, e.limit, e.kesimGunu, e.sonOdemeGunu], ["kart", 7_241_200, 12, 22]);
  const d = s.durum.find((x) => x.hesap === e);
  assert.deepEqual([d.borc, d.limit, d.tarih], [0, 7_241_200, "2026-11-03"]);
});

test("beklenen başlık yoksa sessizce atlamaz, hata verir", () => {
  const k = kitapUret();
  k.Durum[0] = ["Ay", "Hesap", "Tür", "Limit", "BORÇ TUTARI"]; // 'Borç' başlığı yok
  assert.throws(() => donustur(oku(k)), /Durum.*başlık/);
  const k2 = kitapUret();
  delete k2.İşlemler;
  assert.throws(() => donustur(oku(k2)), /İşlemler.*bulunamadı/);
});

test("SQL: gerçek migration'larla çalışır, tekrar çalıştırınca çoğalmaz, elle girilene dokunmaz", () => {
  const s = donustur(oku());
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const m of ["0001_baslangic.sql", "0002_islem_kaynak.sql"]) db.exec(readFileSync(new URL(`../migrations/borc/${m}`, import.meta.url), "utf8"));

  db.exec(sqlUret(s, "2026-11-04T10:00:00.000Z"));
  const say = (tablo) => db.prepare(`SELECT COUNT(*) AS n FROM ${tablo}`).get().n;
  const ilk = { hesap: say("hesaplar"), durum: say("durum_kayitlari"), islem: say("islemler"), ayar: say("ayarlar") };
  assert.deepEqual(ilk, { hesap: 4, durum: s.durum.length, islem: 6, ayar: 5 });

  // Telefondan elle girilmiş bir işlem (kaynak_anahtar NULL) ve elle girilmiş bir ölçüm.
  db.prepare("INSERT INTO islemler (tarih, hesap_id, aciklama, tutar_kurus, taksit, ekstre_ay, olusturuldu) VALUES ('2026-11-04', 1, 'Elle girilen', 5000, 1, '2026-11', 'x')").run();

  // Excel'de tutar değişti: aynı satır güncellensin, çoğalmasın.
  const k2 = kitapUret();
  k2.İşlemler[3][3] = 13000; // Mobilya (satır sırası: başlık, market, market, mobilya...)
  db.exec(sqlUret(donustur(oku(k2)), "2026-11-05T10:00:00.000Z"));

  assert.equal(say("hesaplar"), 4);
  assert.equal(say("durum_kayitlari"), s.durum.length);
  assert.equal(say("islemler"), 7, "6 içe aktarılan + 1 elle girilen; tekrar çalıştırma yenisini açmadı");
  assert.equal(db.prepare("SELECT tutar_kurus FROM islemler WHERE aciklama = 'Mobilya'").get().tutar_kurus, 1_300_000, "Excel'deki yeni tutar yazıldı");
  assert.equal(db.prepare("SELECT tutar_kurus FROM islemler WHERE aciklama = 'Elle girilen'").get().tutar_kurus, 5000, "elle girilene dokunulmadı");

  // Tırnaklı metin SQL'i bozmadı.
  assert.equal(db.prepare("SELECT aciklama_not FROM islemler WHERE aciklama = 'Tatil'").get().aciklama_not, "not'lu");
  db.close();
});

/* ── Excel v2 yerleşimi: AYARLAR bloğu, tablodaki limit/son ödeme günü/asgari oranı, Özet yerine Pano ── */

function kitapV2Uret() {
  const hesaplar = [
    ["Hesaplar ve ayarlar"],
    ["Mavi yazı = girilen değer"],
    [],
    ["AYARLAR", "Değer", "Açıklama"],
    ["Veri tarihi", T("2026-11-04"), "x"],
    ["Tarihi elle belirle (boş = bugün)", null, "x"],
    ["Vergi çarpanı (KKDF + BSMV)", 1.3, "x"],
    ["Kart faizi, aylık (devreden ≤ eşik)", 0.035, "x"],
    ["Kart faizi, aylık (devreden > eşik)", 0.04, "x"],
    ["Kart faizi eşiği (TL)", 25000, "x"],
    ["KMH faizi, aylık", 0.0425, "x"],
    ["Aylık gelir (maaş)", 50000, "x"],
    ["KMH faizinin hesaba yazıldığı gün", 2, "x"],
    ["Plandaki KMH ödemesinin günü", 20, "x"],
    [],
    ["HESAPLAR"],
    ["Hesap", "Tür", "Limit", "Kullanılabilir", "Borç elle", "Kesim günü", "Son ödeme günü", "Asgari oranı", "Yeni harcama", "Sonraki son ödeme", "Not", "Borç"],
    ["Örnek A KK", "KK", 100000, 90000, null, 9, 21, 0.2, 5000, null, "oran tahmini", 10000],
    ["Örnek B KK", "KK", 200000, 150000, null, 8, 18, 0.4, 0, null, "", 50000],
    ["Örnek N KK", "KK", 30000, 30000, null, null, null, 0.4, 0, null, "yeni kart", 0],
    ["Örnek C KMH", "KMH", 50000, 48800, null, null, null, null, null, null, "", 1200],
    ["Örnek D borcu", "Diğer", null, null, 7000, null, null, null, null, null, "", 7000]
  ];
  const durum = [["Ay", "Hesap", "Tür", "Limit", "Borç", "Ekstre", "Asgari", "Son ödeme", "Ödenen", "Not"]];
  for (const ay of ["2026-08-01", "2026-09-01", "2026-10-01"]) {
    durum.push([T(ay), "Örnek A KK", "KK", 100000, 10000, 9000, 3600, T(`${ay.slice(0, 8)}19`), 3600, null]); // gerçekleşen oran %40, Excel'de %20
    durum.push([T(ay), "Örnek B KK", "KK", 200000, 50000, 40000, 16000, T(`${ay.slice(0, 8)}16`), 16000, null]);
    durum.push([T(ay), "Örnek C KMH", "KMH", 50000, 1200, null, null, null, null, null]);
    durum.push([T(ay), "Örnek D borcu", "Diğer", null, 7000, null, null, null, null, null]);
  }
  const islemler = [
    ["Yeni harcamayı tablonun ..."],
    ["Tarih", "Hesap", "Açıklama", "Tutar", "Taksit", "Ekstre ayı elle", "Kategori", "Not", "Aylık taksit", "Ekstre ayı", "Son taksit ayı", "Taksit no", "Kontrol"],
    [T("2026-10-20"), "Örnek A KK", "Market", 300, 1, null, null, null, 300, T("2026-11-01"), T("2026-11-01"), null, null]
  ];
  const pano = [
    ["Borç Takip — Pano"],
    [],
    ["Hesap", "Limit", "Borç", "Kullanım"],
    ["Toplam (işyeri hariç)", 380000, 61200, 0.1],
    ["Toplam (işyeri dahil)", null, 68200]
  ];
  return { Pano: pano, İşlemler: islemler, Durum: durum, Hesaplar: hesaplar, Notlar: [["x"]] };
}

test("Excel v2: AYARLAR bloğu, tablodaki limit / son ödeme günü / asgari oranı ve Pano çapraz kontrolü", () => {
  const s = donustur(oku(kitapV2Uret()));

  // "Kart faizi eşiği (TL)" bir oran sanılıp kartFaiziAlt'ın üstüne yazılmamalı; "KMH faizinin ... günü = 2" de KMH oranını ezmemeli.
  assert.deepEqual(s.ayarlar, { vergiCarpani: 1.3, kartFaiziAlt: 0.035, kartFaiziUst: 0.04, faizEsigi: 2_500_000, kmhFaizi: 0.0425 });
  assert.equal(s.veriTarihi, "2026-11-04");

  const [a, b, yeni, kmh, isyeri] = s.hesaplar;
  assert.equal(a.limit, 10_000_000);
  assert.equal(a.sonOdemeGunu, 21, "tablodaki son ödeme günü, geçmişten türetilen 19'u ezer");
  assert.equal(a.asgariOraniBp, 2000, "Excel'de elle girilen %20 geçerli");
  assert.ok(s.uyarilar.some((u) => u.includes("Örnek A KK") && u.includes("%20") && u.includes("%40")), "gerçekleşen oranla çelişki uyarısı");
  assert.equal(b.asgariOraniBp, 4000);
  assert.ok(!s.uyarilar.some((u) => u.includes("Örnek B KK") && u.includes("asgari")), "tutarlı orana uyarı yok");
  assert.equal(kmh.limit, 5_000_000);
  assert.equal(isyeri.tur, "diger");

  // Durum'da hiç satırı olmayan kart: ilk ölçümle ekranda görünür, borcu tablodan.
  assert.equal(yeni.limit, 3_000_000);
  const yeniOlcum = s.durum.filter((d) => d.hesap === yeni);
  assert.equal(yeniOlcum.length, 1);
  assert.equal(yeniOlcum[0].tarih, "2026-11-04");
  assert.equal(yeniOlcum[0].borc, 0);
  assert.ok(s.uyarilar.some((u) => u.includes("Örnek N KK") && u.includes("kesim")), "kesim günü yok uyarısı");

  // Özet yok, Pano var: toplamlar tutuyor → "FARKLI" uyarısı çıkmaz.
  assert.equal(s.toplamlar.isyeriHaric, 6_120_000);
  assert.equal(s.toplamlar.isyeriDahil, 6_820_000);
  assert.ok(!s.uyarilar.some((u) => u.includes("FARKLI")), s.uyarilar.join("\n"));
});

test("Excel v2: Pano'daki toplam içe aktarılandan farklıysa uyarır", () => {
  const k = kitapV2Uret();
  k.Pano[3][2] = 99999;
  const s = donustur(oku(k));
  assert.ok(s.uyarilar.some((u) => u.includes("Pano") && u.includes("FARKLI")));
});
