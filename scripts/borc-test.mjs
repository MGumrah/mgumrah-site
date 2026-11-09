#!/usr/bin/env node
/**
 * /borc hesap mantığının testi — `node scripts/borc-test.mjs`.
 *
 * Node, app/borc/hesap.ts'i doğrudan çalıştırır (tip silme): derleyici, paket
 * ya da test kütüphanesi gerekmez. Burada yalnızca UYDURMA rakamlar var.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { kalanYazi, kurusMetni, kurusaCevir, tarihKisa } from "../app/borc/bicim.ts";
import {
  ayDetayi,
  ayEkle,
  ayFarki,
  aylikOzetler,
  borcDagilimi,
  borcGecmisi,
  kartFaizi,
  kmhFaizi,
  nakitAkisi,
  senaryoGirdileri,
  senaryoSatiri,
  senaryoToplami,
  ekstreAyi,
  gecerliTarih,
  aylikGelir,
  borcGelirOrani,
  gelirDurumu,
  gelirOlaylari,
  gelirOzeti,
  tlKarsiligi,
  gunEkle,
  gunFarki,
  panoHesapla,
  senaryoHesapla,
  hesapDurumlari,
  takvimOlaylari,
  taksitDagilimi,
  taksitPlani
} from "../app/borc/hesap.ts";

const TL = (n) => Math.round(n * 100);

const AYARLAR = {
  vergiCarpani: 1.3,
  kartFaiziAlt: 0.035,
  kartFaiziUst: 0.04,
  faizEsigi: TL(25_000),
  kmhFaizi: 0.0425,
  varsayilanAsgariOrani: 0.4,
  usdTry: 50,
  eldekiNakit: 0
};

const hesap = (id, ad, tur, ek = {}) => ({ id, ad, tur, limit: 0, kesimGunu: null, sonOdemeGunu: null, asgariOrani: null, sira: id, ...ek });
const durum = (id, hesapId, tarih, borc, ek = {}) => ({
  id,
  hesapId,
  tarih,
  ay: tarih.slice(0, 7),
  borc,
  limit: null,
  ekstre: null,
  asgari: null,
  sonOdeme: null,
  not: "",
  ...ek
});

const veri = () => ({
  ayarlar: AYARLAR,
  hesaplar: [
    hesap(1, "Kart A", "kart", { limit: TL(100_000), kesimGunu: 9, sonOdemeGunu: 20 }),
    hesap(2, "Kart B", "kart", { limit: TL(200_000), kesimGunu: 6, sonOdemeGunu: 16, asgariOrani: 0.2 }),
    hesap(3, "KMH A", "kmh", { limit: TL(50_000) }),
    hesap(4, "İş borcu", "diger")
  ],
  durum: [
    durum(1, 1, "2026-10-01", TL(10_000)),
    durum(2, 1, "2026-11-04", TL(40_000), { ekstre: TL(30_000), asgari: TL(12_000), sonOdeme: "2026-11-20" }),
    durum(3, 2, "2026-11-04", TL(20_000), { ekstre: TL(10_000), sonOdeme: "2026-11-16" }),
    durum(4, 3, "2026-11-04", TL(5_000)),
    durum(5, 4, "2026-11-04", TL(8_000))
  ],
  islemler: [],
  gelirler: [],
  duzenliGelirler: []
});

const duzenli = (id, ad, tutar, paraBirimi, ek = {}) => ({ id, ad, tutar, paraBirimi, gun: 15, kesin: false, baslangicAy: "2026-11", aktif: true, not: "", ...ek });
const kayit = (id, ad, tutar, beklenenTarih, ek = {}) => ({ id, ad, tutar, paraBirimi: "TRY", beklenenTarih, kesin: true, alindiTarihi: null, duzenliId: null, not: "", ...ek });

test("ekstre ayı: kesim gününden sonraki harcama sonraki ayın ekstresine düşer", () => {
  assert.equal(ekstreAyi("2026-11-08", 9), "2026-11");
  assert.equal(ekstreAyi("2026-11-09", 9), "2026-11", "kesim günü hâlâ bu ekstrede");
  assert.equal(ekstreAyi("2026-11-10", 9), "2026-12");
  assert.equal(ekstreAyi("2026-12-20", 9), "2027-01", "yıl sınırı");
  assert.equal(ekstreAyi("2026-02-28", 31), "2026-02", "31. gün şubatta 28'e iner");
  assert.equal(ekstreAyi("2026-11-30", null), "2026-11", "kesim günü yoksa kendi ayı");
});

test("ay ve gün aritmetiği", () => {
  assert.equal(ayEkle("2026-11", 2), "2027-01");
  assert.equal(ayEkle("2026-01", -1), "2025-12");
  assert.equal(ayFarki("2026-11", "2027-02"), 3);
  assert.equal(gunEkle("2026-11-28", 5), "2026-12-03");
  assert.equal(gunFarki("2026-11-04", "2026-11-15"), 11);
  assert.equal(gecerliTarih("2026-02-30"), false);
  assert.equal(gecerliTarih("2028-02-29"), true);
  assert.equal(gecerliTarih("15.11.2026"), false);
});

test("taksit dağılımı: toplam harcamaya eşit, kuruş artığı ilk taksitte", () => {
  const parcalar = taksitDagilimi(TL(1000.01), 3, "2026-12");
  assert.deepEqual(parcalar.map((p) => p.ay), ["2026-12", "2027-01", "2027-02"]);
  assert.equal(parcalar.reduce((t, p) => t + p.tutar, 0), TL(1000.01));
  assert.equal(parcalar[0].tutar, 33335);
  assert.equal(parcalar[1].tutar, 33333);
  assert.equal(taksitDagilimi(TL(-90), 1, "2026-11")[0].tutar, TL(-90), "iade tek parça kalır");
});

test("pano: toplam = kart + KMH + diğer; diğer ayrı kalem, toplamda bir kez sayılır", () => {
  const p = panoHesapla(veri());
  assert.equal(p.kartBorcu, TL(60_000), "Kart A'nın güncel ölçümü eskisini ezer");
  assert.equal(p.kmhBorcu, TL(5_000));
  assert.equal(p.digerBorcu, TL(8_000));
  assert.equal(p.toplam, TL(73_000));
  assert.equal(p.toplam, p.kartBorcu + p.kmhBorcu + p.digerBorcu, "diğer bir kez eklenir");
  assert.equal("toplamIsyeriHaric" in p || "toplamIsyeriDahil" in p, false, "eski diğer hariç / dahil ikilisi kalmadı");
  assert.equal(p.kartLimit, TL(300_000));
  assert.ok(Math.abs(p.kartKullanim - 0.2) < 1e-9);
  assert.ok(Math.abs(p.toplamKullanim - TL(65_000) / TL(350_000)) < 1e-9, "limit kullanımı yalnızca kart + KMH: diğer payda ve paya girmez");
  assert.equal(p.guncelTarih, "2026-11-04");
});

test("toplam: diğer borç yokken toplam = kart + KMH, diğer borç başlayınca toplam ve fark onu içerir", () => {
  // Ekim: yalnızca kart + KMH. Kasım: aynı kart + KMH, üstüne diğer borç başlıyor.
  const v = {
    ayarlar: AYARLAR,
    hesaplar: [hesap(1, "Kart A", "kart", { limit: TL(100_000) }), hesap(2, "KMH A", "kmh", { limit: TL(50_000) }), hesap(3, "Tedarikçi", "diger")],
    durum: [
      durum(1, 1, "2026-10-15", TL(30_000)),
      durum(2, 2, "2026-10-15", TL(10_000)),
      durum(3, 1, "2026-11-15", TL(30_000)),
      durum(4, 2, "2026-11-15", TL(10_000)),
      durum(5, 3, "2026-11-15", TL(25_000))
    ],
    islemler: [],
    gelirler: [],
    duzenliGelirler: []
  };

  // Diğer kaydı yokken (yalnızca Ekim ölçümleriyle) toplam = kart + KMH.
  const yalnizEkim = { ...v, durum: v.durum.slice(0, 2) };
  assert.equal(panoHesapla(yalnizEkim).digerBorcu, 0);
  assert.equal(panoHesapla(yalnizEkim).toplam, TL(40_000), "diğer yokken toplam = kart + KMH");
  const [ek0] = aylikOzetler(yalnizEkim);
  assert.equal(ek0.diger, null);
  assert.equal(ek0.toplam, TL(40_000));

  // Diğer borç başlayınca toplam onu içerir; fark da.
  assert.equal(panoHesapla(v).toplam, TL(65_000), "30.000 + 10.000 + 25.000");
  const [ekim, kasim] = aylikOzetler(v);
  assert.equal(ekim.toplam, TL(40_000));
  assert.equal(ekim.fark, null);
  assert.equal(kasim.diger, TL(25_000));
  assert.equal(kasim.toplam, TL(65_000), "toplam = kart + KMH + diğer; diğer bir kez");
  assert.equal(kasim.fark, TL(25_000), "kart ve KMH değişmedi, fark yalnızca diğerin başlamasından");
  assert.equal("toplamDigerDahil" in kasim, false, "eski diğer dahil alanı kalmadı");
});

test("toplam: üç türde de kayıt yoksa '–' (null); yalnızca diğer kaydı olan ayda toplam diğerin kendisi", () => {
  const v = {
    ayarlar: AYARLAR,
    hesaplar: [hesap(1, "Kart A", "kart", { limit: TL(100_000) }), hesap(2, "Tedarikçi", "diger")],
    durum: [
      durum(1, 1, "2026-08-10", TL(12_000)),
      // Eylül'de hiçbir türde kayıt yok.
      durum(2, 2, "2026-10-10", TL(9_000)) // Ekim'de yalnızca diğer var
    ]
  };
  const [ag, ey, ek] = aylikOzetler(v);
  assert.equal(ag.toplam, TL(12_000));
  assert.equal(ey.kayitSayisi, 0);
  assert.equal(ey.toplam, null, "hiçbir türde kayıt yok: 0 değil, veri yok");
  assert.equal(ek.kart, null);
  assert.equal(ek.kmh, null);
  assert.equal(ek.diger, TL(9_000));
  assert.equal(ek.toplam, TL(9_000), "yalnızca diğer kaydı olan ayda toplam diğerin kendisi");
  assert.equal(ek.fark, null, "Eylül toplamı yok → fark hesaplanmaz");
});

test("asgari: bankanın yazdığı kazanır, yoksa hesabın oranı, o da yoksa varsayılan", () => {
  const d = hesapDurumlari(veri());
  assert.equal(d[0].asgari, TL(12_000));
  assert.equal(d[0].asgariTahmini, false);
  assert.equal(d[1].asgari, TL(2_000), "Kart B %20 oranıyla");
  assert.equal(d[1].asgariTahmini, true);
  assert.equal(d[2].asgari, null, "KMH'de asgari yok");
});

test("faiz senaryosu: devreden × oran × vergi; eşik üstü farklı oran", () => {
  const s = senaryoHesapla(hesapDurumlari(veri()), AYARLAR);
  assert.equal(s.ekstreToplami, TL(40_000));
  assert.equal(s.asgariToplami, TL(14_000));
  assert.equal(s.devreden, TL(26_000));
  // Kart A: 18.000 devreden (≤ eşik) × 3,5% × 1,3; Kart B: 8.000 × 3,5% × 1,3
  assert.equal(s.kartFaizi, Math.round(TL(18_000) * 0.035 * 1.3 + TL(8_000) * 0.035 * 1.3));
  assert.equal(s.kmhFaizi, Math.round(TL(5_000) * 0.0425 * 1.3));
  assert.equal(s.aylikFaiz, s.kartFaizi + s.kmhFaizi);

  const buyuk = veri();
  buyuk.durum.push(durum(9, 1, "2026-11-05", TL(90_000), { ekstre: TL(80_000), asgari: TL(20_000) }));
  const s2 = senaryoHesapla(hesapDurumlari(buyuk), AYARLAR);
  assert.equal(s2.kartFaizi, Math.round(TL(60_000) * 0.04 * 1.3 + TL(8_000) * 0.035 * 1.3), "60.000 devreden eşiği aştı → %4");
});

test("borç geçmişi: her ay o aya kadarki son ölçüm", () => {
  const g = borcGecmisi(veri());
  assert.deepEqual(g.map((x) => x.ay), ["2026-10", "2026-11"]);
  assert.equal(g[0].kart, TL(10_000));
  assert.equal(g[1].kart, TL(60_000));
});

test("taksit planı: ekstreye düşmüş taksit yük sayılmaz", () => {
  const v = veri();
  // 12.000 TL, 4 taksit, Kart A (kesim 9). 4 Kasım'da Kasım ekstresi henüz kesilmedi.
  v.islemler.push({ id: 1, tarih: "2026-10-20", hesapId: 1, aciklama: "Buzdolabı", tutar: TL(12_000), taksit: 4, ekstreAy: "2026-11", kategori: "", not: "" });
  v.islemler.push({ id: 2, tarih: "2026-11-02", hesapId: 1, aciklama: "Market", tutar: TL(500), taksit: 1, ekstreAy: "2026-11", kategori: "", not: "" });

  const once = taksitPlani(v, "2026-11-04", 6);
  assert.equal(once.satirlar[0].hucreler[0], TL(3_000), "Kasım ekstresi daha kesilmedi: taksit yük");
  assert.equal(once.satirlar[0].toplam, TL(12_000));
  assert.equal(once.sonrakiEkstreyeDusen.get(1), TL(3_500), "tek çekim + taksit birlikte");
  assert.equal(once.taksitliler[0].kalanTaksit, 4);
  assert.equal(once.taksitliler[0].bitisAy, "2027-02");

  const sonra = taksitPlani(v, "2026-11-12", 6);
  assert.equal(sonra.satirlar[0].hucreler[0], 0, "12 Kasım'da Kasım ekstresi kesildi: o taksit artık ekstrede");
  assert.equal(sonra.satirlar[0].toplam, TL(9_000));
  assert.equal(sonra.taksitliler[0].kalanTaksit, 3);
  assert.equal(sonra.sonrakiEkstreyeDusen.get(1), TL(3_000), "sonraki ekstre Aralık: yalnızca bir taksit");
});

test("gelir: beklenen tarih geçmişse ve alınmadıysa gecikmiş alacak", () => {
  const g = kayit(1, "Maaş", TL(65_000), "2026-10-15");
  assert.equal(gelirDurumu(g, "2026-11-04"), "gecikti");
  assert.equal(gelirDurumu({ ...g, beklenenTarih: "2026-11-15" }, "2026-11-04"), "bekliyor");
  assert.equal(gelirDurumu({ ...g, beklenenTarih: "2026-11-04" }, "2026-11-04"), "bekliyor", "bugün beklenen henüz gecikmiş değil");
  assert.equal(gelirDurumu({ ...g, alindiTarihi: "2026-10-16" }, "2026-11-04"), "alindi");

  const v = veri();
  v.gelirler = [g, { ...g, id: 2, beklenenTarih: "2026-11-15", kesin: false }, { ...g, id: 3, alindiTarihi: "2026-11-01" }];
  const o = gelirOzeti(gelirOlaylari(v, "2026-11-04"), "2026-11-04");
  assert.equal(o.geciken, TL(65_000));
  assert.equal(o.bekleyen, TL(65_000));
  assert.equal(o.alinanBuAy, TL(65_000));
});

test("gelir özeti: bekleyen yalnızca önümüzdeki 31 günü sayar (düzenli planın ileri ayları şişirmesin)", () => {
  const v = veri();
  v.duzenliGelirler = [duzenli(1, "Maaş", TL(65_000), "TRY")];
  const o = gelirOzeti(gelirOlaylari(v, "2026-11-04", 4), "2026-11-04");
  assert.equal(o.bekleyenAdet, 1, "yalnızca 15 Kasım; 15 Aralık 41 gün sonra");
  assert.equal(o.bekleyen, TL(65_000));
});

test("döviz: USD tutar kurla TL'ye çevrilir, TRY olduğu gibi kalır", () => {
  assert.equal(tlKarsiligi(15_000, "USD", 50.4), 756_000, "150 USD × 50,40 = 7.560 ₺ (kuruş)");
  assert.equal(tlKarsiligi(20_001, "USD", 50.4), Math.round(20_001 * 50.4), "kuruşa yuvarlanır");
  assert.equal(tlKarsiligi(TL(65_000), "TRY", 50.4), TL(65_000));
  assert.equal(tlKarsiligi(TL(65_000), undefined, 50.4), TL(65_000), "para birimi yoksa TRY");
});

test("düzenli gelir: her ay için plan satırı, kaydı olan ayı atlar, başlangıç ayından öncesini üretmez", () => {
  const v = veri();
  v.duzenliGelirler = [duzenli(1, "Maaş", TL(65_000), "TRY"), duzenli(2, "Kira", 15_000, "USD", { kesin: true }), duzenli(3, "Eski", TL(1_000), "TRY", { baslangicAy: "2026-12" }), duzenli(4, "Pasif", TL(1_000), "TRY", { aktif: false })];
  // Kiranın kasım kaydı var (alındı): Kasım için plan çıkmamalı, Aralık'tan devam etmeli.
  v.gelirler = [kayit(7, "Kira", 15_000, "2026-11-12", { paraBirimi: "USD", duzenliId: 2, alindiTarihi: "2026-11-12" })];

  const o = gelirOlaylari(v, "2026-11-20", 3); // 20 Kasım: Kasım maaşı 15'i geçti
  const plan = (ad) => o.filter((e) => e.planli && e.ad === ad).map((e) => e.tarih);
  assert.deepEqual(plan("Maaş"), ["2026-11-15", "2026-12-15", "2027-01-15"]);
  assert.deepEqual(plan("Kira"), ["2026-12-15", "2027-01-15"], "Kasım'ın gerçek kaydı var");
  assert.deepEqual(plan("Eski"), ["2026-12-15", "2027-01-15"], "başlangıç ayı Aralık");
  assert.deepEqual(plan("Pasif"), [], "pasif kalem plan üretmez");

  const kasimMaas = o.find((e) => e.ad === "Maaş" && e.tarih === "2026-11-15");
  assert.equal(kasimMaas.durum, "gecikti", "günü geçti, 'Alındı' denmedi → geciken alacak");
  assert.equal(kasimMaas.kesin, false);
  const aralikKira = o.find((e) => e.ad === "Kira" && e.tarih === "2026-12-15");
  assert.equal(aralikKira.paraBirimi, "USD");
  assert.equal(aralikKira.tutar, 15_000);
  assert.equal(aralikKira.tl, 750_000, "150 USD × 50 = 7.500 ₺");

  // Ay sonu: 31. gün şubatta ayın son gününe iner.
  const w = veri();
  w.duzenliGelirler = [duzenli(1, "Ay sonu", TL(100), "TRY", { gun: 31, baslangicAy: "2027-02" })];
  assert.deepEqual(gelirOlaylari(w, "2027-02-01", 1).map((e) => e.tarih), ["2027-02-28"]);
});

test("aylık gelir: maaş + dövizli kira TL karşılığıyla toplanır, borç/gelir oranı bundan çıkar", () => {
  const v = veri();
  v.duzenliGelirler = [duzenli(1, "Maaş", TL(65_000), "TRY", { kesin: true }), duzenli(2, "Kira", 15_000, "USD", { kesin: true }), duzenli(3, "Pasif", TL(5_000), "TRY", { aktif: false })];
  const a = aylikGelir(v);
  assert.equal(a.toplam, TL(65_000) + TL(7_500), "65.000 + 150 USD × 50");
  assert.equal(a.kalemler.length, 2);
  assert.equal(a.dovizVar, true);
  assert.equal(a.belirsizVar, false);

  v.duzenliGelirler[1].kesin = false;
  assert.equal(aylikGelir(v).belirsizVar, true);
  v.ayarlar = { ...AYARLAR, usdTry: 60 };
  assert.equal(aylikGelir(v).toplam, TL(65_000) + TL(9_000), "kur değişince TL karşılığı değişir");

  assert.equal(borcGelirOrani(TL(180_000), TL(90_000)), 2);
  assert.equal(borcGelirOrani(TL(180_000), 0), null, "gelir tanımlı değilse oran yok");
  assert.equal(aylikGelir({ ayarlar: AYARLAR }).toplam, 0, "düzenli gelir alanı olmayan eski veri de çalışır");
});

test("takvim: geciken alacak en üstte, sonra tarih sırası; kesin ve tahmini son ödeme ayrı", () => {
  const v = veri();
  v.gelirler.push(
    kayit(1, "Eylül maaşı", TL(65_000), "2026-10-15"),
    kayit(2, "Ekim maaşı", TL(65_000), "2026-11-15", { kesin: false }),
    kayit(3, "Eski maaş", TL(65_000), "2026-09-15", { alindiTarihi: "2026-09-16" })
  );
  const o = takvimOlaylari(v, "2026-11-04", 60);

  assert.equal(o[0].baslik, "Eylül maaşı");
  assert.equal(o[0].gecikmis, true);
  assert.ok(o.every((e) => e.baslik !== "Eski maaş"), "alınmış gelir takvimde yok");
  assert.deepEqual(
    o.slice(1).map((e) => e.tarih),
    [...o.slice(1).map((e) => e.tarih)].sort(),
    "gecikmişten sonrası tarih sırasında"
  );

  const kesinOdeme = o.find((e) => e.anahtar === "son:1:2026-11-20");
  assert.ok(kesinOdeme && kesinOdeme.tahmini === false);
  assert.equal(kesinOdeme.tutar, TL(30_000));
  assert.equal(kesinOdeme.asgari, TL(12_000));

  assert.ok(!o.some((e) => e.anahtar === "tson:1:2026-11-20"), "kesin tarih varken aynı ekstrenin tahmini tekrar gösterilmez");
  const aralik = o.find((e) => e.anahtar === "tson:1:2026-12-20");
  assert.ok(aralik && aralik.tahmini === true, "Aralık ekstresinin son ödemesi kesilmeden tahmin");
  assert.ok(o.some((e) => e.anahtar === "tson:2:2026-12-16"), "Kart B'nin Aralık tahmini son ödemesi");
  assert.ok(o.some((e) => e.tur === "kesim" && e.tarih === "2026-11-06" && e.hesapId === 2), "Kart B kesimi 6 Kasım");
  assert.equal(o.find((e) => e.anahtar === "gelir:kayit:2").belirsiz, true);
});

test("tutar girişi: Türkçe ve düz yazımlar kuruşa çevrilir, saçma girdi reddedilir", () => {
  assert.equal(kurusaCevir("1.249,90"), 124990);
  assert.equal(kurusaCevir("1249,9"), 124990);
  assert.equal(kurusaCevir("1249.90"), 124990);
  assert.equal(kurusaCevir("1.249"), 124900, "tek nokta + 3 hane Türkçe'de bin ayracı");
  assert.equal(kurusaCevir("12.50"), 1250);
  assert.equal(kurusaCevir("1.234.567,89"), 123456789);
  assert.equal(kurusaCevir("₺ 1 249,90"), 124990);
  assert.equal(kurusaCevir("-12.345,60"), -1234560);
  assert.equal(kurusaCevir("0,05"), 5);
  for (const kotu of ["", "abc", "1,2,3", "12,345", "1.2.3", "--5", "1e5"]) assert.equal(kurusaCevir(kotu), null, `"${kotu}" reddedilmeli`);
});

test("gösterim yardımcıları", () => {
  assert.equal(kurusMetni(124990), "1249,90");
  assert.equal(kurusMetni(-500), "-5");
  assert.equal(kurusaCevir(kurusMetni(1234567)), 1234567,"düzenleme kutusuna konan metin geri aynı sayıya döner");
  assert.equal(tarihKisa("2026-11-15"), "15 Kas");
  assert.equal(kalanYazi(0), "bugün");
  assert.equal(kalanYazi(1), "yarın");
  assert.equal(kalanYazi(11), "11 gün sonra");
  assert.equal(kalanYazi(-20), "20 gün gecikti");
});

test("takvim: düzenli maaş ve dövizli kira aynı takvimde; geciken USD alacak TL karşılığıyla ve dövizi korunarak", () => {
  const v = veri();
  v.duzenliGelirler = [duzenli(1, "Maaş", TL(65_000), "TRY"), duzenli(2, "Kira", 15_000, "USD", { kesin: true })];
  // Geçen ayın kirası yatmadı: elle girilmiş gecikmiş alacak (USD).
  v.gelirler = [kayit(9, "Ekim kirası", 15_000, "2026-10-15", { paraBirimi: "USD" })];
  const o = takvimOlaylari(v, "2026-11-04", 60);

  assert.equal(o[0].baslik, "Ekim kirası");
  assert.equal(o[0].gecikmis, true, "geciken alacak en üstte");
  assert.equal(o[0].tutar, 750_000, "TL karşılığı");
  assert.deepEqual(o[0].doviz, { tutar: 15_000, paraBirimi: "USD" }, "asıl döviz tutarı korunur");

  const maas = o.find((e) => e.baslik === "Maaş" && e.tarih === "2026-11-15");
  const kira = o.find((e) => e.baslik === "Kira" && e.tarih === "2026-11-15");
  assert.ok(maas && maas.belirsiz === true && maas.doviz === undefined);
  assert.ok(kira && kira.belirsiz === false && kira.doviz.paraBirimi === "USD");
  assert.ok(o.some((e) => e.baslik === "Kira" && e.tarih === "2026-12-15"), "ufuk içindeki ikinci ay");
});

test("migration 0003: geriye uyumlu (eski gelir satırı TRY kalır), kısıtlar çalışır, kalem silinince kayıt kalır", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  const migration = (ad) => db.exec(readFileSync(new URL(`../migrations/borc/${ad}`, import.meta.url), "utf8"));
  migration("0001_baslangic.sql");
  migration("0002_islem_kaynak.sql");

  // 0003'ten ÖNCE yazılmış, eski biçimde bir gelir satırı.
  db.exec("INSERT INTO gelirler (ad, tutar_kurus, beklenen_tarih, kesin, aciklama_not, olusturuldu) VALUES ('Eski maaş', 6500000, '2026-10-15', 1, '', 'x')");
  migration("0003_duzenli_gelir.sql");
  const eski = db.prepare("SELECT para_birimi, duzenli_id, tutar_kurus FROM gelirler").get();
  assert.deepEqual({ ...eski }, { para_birimi: "TRY", duzenli_id: null, tutar_kurus: 6500000 }, "eski satır bozulmadı, varsayılanlar geldi");

  const ekle = db.prepare("INSERT INTO duzenli_gelirler (ad, tutar_kurus, para_birimi, gun, kesin, baslangic_ay, olusturuldu) VALUES (?, ?, ?, ?, ?, '2026-11', 'x')");
  ekle.run("Örnek kira", 15_000, "USD", 15, 1);
  assert.throws(() => ekle.run("Örnek kira", 1, "TRY", 15, 1), /UNIQUE/, "aynı ad iki kez olmaz");
  assert.throws(() => ekle.run("Euro", 1, "EUR", 15, 1), /CHECK/, "yalnızca TRY ve USD");
  assert.throws(() => ekle.run("Gün 32", 1, "TRY", 32, 1), /CHECK/, "gün 1–31");
  assert.throws(() => ekle.run("Sıfır", 0, "TRY", 15, 1), /CHECK/, "tutar pozitif");

  const kalemId = db.prepare("SELECT id FROM duzenli_gelirler WHERE ad = 'Örnek kira'").get().id;
  db.prepare("INSERT INTO gelirler (ad, tutar_kurus, para_birimi, beklenen_tarih, kesin, alindi_tarihi, duzenli_id, aciklama_not, olusturuldu) VALUES ('Kira', 15000, 'USD', '2026-11-15', 1, '2026-11-15', ?, '', 'x')").run(kalemId);
  assert.throws(
    () => db.prepare("INSERT INTO gelirler (ad, tutar_kurus, beklenen_tarih, duzenli_id, olusturuldu) VALUES ('Yetim', 1, '2026-11-15', 9999, 'x')").run(),
    /FOREIGN KEY/,
    "olmayan kaleme bağlanamaz"
  );

  db.prepare("DELETE FROM duzenli_gelirler WHERE id = ?").run(kalemId);
  const kalan = db.prepare("SELECT duzenli_id, para_birimi FROM gelirler WHERE ad = 'Kira'").get();
  assert.deepEqual({ ...kalan }, { duzenli_id: null, para_birimi: "USD" }, "kalem silinince gerçekleşen kayıt silinmez");
  db.close();
});

/* ── Ortak panel: aylar tablosu, ay detayı, senaryo, nakit akışı ───────── */

const ozetVeri = () => ({
  ayarlar: AYARLAR,
  hesaplar: [hesap(1, "Kart A", "kart", { limit: TL(100_000) }), hesap(2, "KMH A", "kmh", { limit: TL(50_000) }), hesap(3, "Kişi borcu", "diger")],
  durum: [
    durum(1, 1, "2026-08-31", TL(10_000)),
    durum(2, 2, "2026-08-31", TL(2_000)),
    // Eylül'de hiç kayıt yok → boş satır.
    durum(3, 1, "2026-10-10", TL(20_000)),
    durum(4, 1, "2026-10-28", TL(25_000)), // Ekim'in SON ölçümü bu: tablo ikisini toplamaz
    durum(5, 3, "2026-10-28", TL(7_000))
    // Ekim'de KMH kaydı yok → KMH hücresi "–" (0 değil)
  ]
});

test("aylar tablosu: boş aylar satır olur, kayıtsız tür null (0 değil), fark yalnızca iki ay da verili ise", () => {
  const o = aylikOzetler(ozetVeri());
  assert.deepEqual(o.map((x) => x.ay), ["2026-08", "2026-09", "2026-10"]);

  const [ag, ey, ek] = o;
  assert.equal(ag.kart, TL(10_000));
  assert.equal(ag.kmh, TL(2_000));
  assert.equal(ag.toplam, TL(12_000));
  assert.equal(ag.diger, null);
  assert.equal(ag.fark, null, "ilk ayın öncesi yok");

  assert.equal(ey.kayitSayisi, 0);
  assert.equal(ey.toplam, null);
  assert.equal(ey.fark, null);

  assert.equal(ek.kart, TL(25_000), "ayın son ölçümü; aynı ayın iki ölçümü toplanmaz");
  assert.equal(ek.kmh, null, "Ekim'de KMH kaydı yok: 0 değil");
  assert.equal(ek.diger, TL(7_000));
  assert.equal(ek.toplam, TL(32_000), "toplam = kart + KMH + diğer (25.000 + 7.000)");
  assert.equal(ek.fark, null, "Eylül toplamı yok → fark hesaplanmaz");
  assert.deepEqual(aylikOzetler({ hesaplar: [], durum: [] }), []);
});

test("aylar tablosu: ardışık aylarda fark = toplam − önceki toplam", () => {
  const v = ozetVeri();
  v.durum.push(durum(6, 1, "2026-09-15", TL(11_000)), durum(7, 2, "2026-09-15", TL(1_000)));
  const o = aylikOzetler(v);
  assert.equal(o[1].toplam, TL(12_000));
  assert.equal(o[1].fark, 0);
  assert.equal(o[2].fark, TL(32_000) - TL(12_000), "Ekim toplamı (kart 25.000 + diğer 7.000, KMH yok) − Eylül toplamı");
});

test("ay detayı: kart → KMH → diğer sırası, ayın son ölçümü, kullanım oranı", () => {
  const d = ayDetayi(ozetVeri(), "2026-10");
  assert.deepEqual(d.map((x) => x.hesap.ad), ["Kart A", "Kişi borcu"]);
  assert.equal(d[0].durum.borc, TL(25_000));
  assert.equal(d[0].kullanim, 0.25);
  assert.equal(d[1].kullanim, null, "limiti olmayan hesapta oran yok");
  assert.deepEqual(ayDetayi(ozetVeri(), "2026-09"), []);
});

test("faiz: devreden eşik altı/üstü oran × vergi; KMH bakiyenin tamamı", () => {
  assert.equal(kartFaizi(TL(10_000), AYARLAR), Math.round(TL(10_000) * 0.035 * 1.3));
  assert.equal(kartFaizi(TL(30_000), AYARLAR), Math.round(TL(30_000) * 0.04 * 1.3));
  assert.equal(kartFaizi(TL(25_000), AYARLAR), Math.round(TL(25_000) * 0.035 * 1.3), "eşiğin kendisi alt orandır");
  assert.equal(kartFaizi(0, AYARLAR), 0);
  assert.equal(kmhFaizi(TL(10_000), AYARLAR), Math.round(TL(10_000) * 0.0425 * 1.3));
  assert.equal(kmhFaizi(-5, AYARLAR), 0);
});

test("ödeme senaryosu: tam / asgari / özel; asgari altı uyarı; KMH'de asgari yok", () => {
  const v = veri();
  const girdiler = senaryoGirdileri(v, "2026-11-04", "son");
  assert.deepEqual(girdiler.map((g) => g.hesap.ad), ["Kart A", "Kart B", "KMH A"]);
  const a = girdiler[0];
  assert.equal(a.ekstre, TL(30_000));
  assert.equal(a.asgari, TL(12_000));
  assert.equal(a.asgariTahmini, false);
  assert.equal(girdiler[1].asgari, TL(2_000), "Kart B: ekstre 10.000 × %20, bankadan asgari yok → tahmini");
  assert.equal(girdiler[1].asgariTahmini, true);

  const tam = senaryoSatiri(a, { tur: "tam" }, AYARLAR);
  assert.equal(tam.odeme, TL(30_000));
  assert.equal(tam.devreden, 0);
  assert.equal(tam.aylikFaiz, 0);

  const asgari = senaryoSatiri(a, { tur: "asgari" }, AYARLAR);
  assert.equal(asgari.devreden, TL(18_000));
  assert.equal(asgari.aylikFaiz, kartFaizi(TL(18_000), AYARLAR));
  assert.equal(asgari.asgariAltinda, false);

  const az = senaryoSatiri(a, { tur: "ozel", tutar: TL(5_000) }, AYARLAR);
  assert.equal(az.asgariAltinda, true);
  assert.equal(az.devreden, TL(25_000));
  const fazla = senaryoSatiri(a, { tur: "ozel", tutar: TL(99_000) }, AYARLAR);
  assert.equal(fazla.odeme, TL(30_000), "ekstreden fazlası ödenmiş sayılmaz");

  const kmh = girdiler[2];
  assert.equal(kmh.kmh, true);
  assert.equal(senaryoSatiri(kmh, { tur: "asgari" }, AYARLAR).odeme, 0);
  assert.equal(senaryoSatiri(kmh, { tur: "asgari" }, AYARLAR).aylikFaiz, kmhFaizi(TL(5_000), AYARLAR));
  assert.equal(senaryoSatiri(kmh, { tur: "tam" }, AYARLAR).devreden, 0);

  const t = senaryoToplami(girdiler.map((g) => senaryoSatiri(g, { tur: "asgari" }, AYARLAR)));
  assert.equal(t.odeme, TL(12_000) + TL(2_000));
  assert.equal(t.devreden, TL(18_000) + TL(8_000) + TL(5_000));
});

test("ödeme senaryosu: sonraki ekstre baz alınınca yalnızca o ekstreye düşen harcama + taksit", () => {
  const v = veri();
  v.islemler.push(
    { id: 1, tarih: "2026-11-02", hesapId: 1, aciklama: "Market", tutar: TL(3_000), taksit: 1, ekstreAy: "2026-11", kategori: "", not: "" },
    { id: 2, tarih: "2026-10-30", hesapId: 1, aciklama: "Telefon", tutar: TL(12_000), taksit: 3, ekstreAy: "2026-11", kategori: "", not: "" }
  );
  const g = senaryoGirdileri(v, "2026-11-04", "sonraki");
  assert.deepEqual(g.map((x) => x.hesap.ad), ["Kart A", "KMH A"], "Kart B'ye düşen bir şey yok → listede yok");
  assert.equal(g[0].ekstre, TL(3_000) + TL(4_000));
  assert.equal(g[0].ekstreAy, "2026-11");
  assert.equal(g[0].asgariTahmini, true);
  assert.equal(g[0].asgari, Math.round((TL(3_000) + TL(4_000)) * 0.4));
});

test("takvim: kesilmemiş ekstrenin tahmini son ödemesine dönem içi harcamadan tutar yazılır (yoksa tutarsız kalır)", () => {
  const v = { ...veri(), durum: [], hesaplar: [hesap(1, "Kart C", "kart", { limit: TL(100_000), kesimGunu: 25, sonOdemeGunu: 5 })] };
  const bos = takvimOlaylari(v, "2026-11-04", 60).find((o) => o.anahtar === "tson:1:2026-12-05");
  assert.ok(bos, "Aralık 5 tahmini son ödeme");
  assert.equal(bos.tutar, undefined, "hiç işlem yok: tutar bilinmiyor, 0 yazılmaz");

  v.islemler = [
    { id: 1, tarih: "2026-10-28", hesapId: 1, aciklama: "A", tutar: TL(100_000), taksit: 1, ekstreAy: "2026-11", kategori: "", not: "" },
    { id: 2, tarih: "2026-10-30", hesapId: 1, aciklama: "B", tutar: TL(60_000), taksit: 3, ekstreAy: "2026-11", kategori: "", not: "" }
  ];
  const dolu = takvimOlaylari(v, "2026-11-04", 60).find((o) => o.anahtar === "tson:1:2026-12-05");
  assert.equal(dolu.tutar, TL(120_000));
  assert.equal(dolu.asgari, TL(48_000));
  assert.equal(dolu.tutarTahmini, true);
  assert.equal(dolu.ekstreAy, "2026-11");
});

test("nakit akışı: kesin bakiye belirsiz/alacağa güvenmez, iyimser seri hepsini sayar; asgari varsayımı daha az çıkış", () => {
  const v = veri();
  v.ayarlar = { ...AYARLAR, eldekiNakit: TL(10_000) };
  v.gelirler.push(
    kayit(1, "Kesin gelir", TL(50_000), "2026-11-10"),
    kayit(2, "Belirsiz gelir", TL(20_000), "2026-11-12", { kesin: false }),
    kayit(3, "Geciken alacak", TL(7_000), "2026-10-15")
  );

  const asgari = nakitAkisi(v, "2026-11-04", "asgari", 30);
  const tam = nakitAkisi(v, "2026-11-04", "tam", 30);

  assert.equal(asgari.baslangic, TL(10_000));
  assert.equal(asgari.toplamKesinGiris, TL(50_000));
  assert.equal(asgari.toplamBelirsizGiris, TL(27_000), "belirsiz + alacak");
  assert.ok(asgari.toplamCikis < tam.toplamCikis, "asgari çıkışı tam ekstreden az");
  assert.equal(asgari.toplamCikis, TL(12_000) + TL(2_000), "Kart A bankanın asgarisi, Kart B ekstre × %20");
  assert.equal(tam.toplamCikis, TL(30_000) + TL(10_000));

  const alacak = asgari.satirlar.find((s) => s.tur === "alacak");
  assert.equal(alacak.tarih, "2026-11-04", "geçmiş vadeli alacak bugün sırasına konur");

  const son = asgari.satirlar[asgari.satirlar.length - 1];
  assert.equal(son.kesinBakiye, TL(10_000) + TL(50_000) - asgari.toplamCikis);
  assert.equal(son.iyimserBakiye, son.kesinBakiye + TL(27_000));
  assert.ok(asgari.enDusukIyimser >= asgari.enDusukKesin);

  const tarihler = asgari.satirlar.map((s) => s.tarih);
  assert.deepEqual(tarihler, [...tarihler].sort());
});

test("nakit akışı: tutarı bilinmeyen son ödeme akışa girmez ama sayılır", () => {
  const v = { ...veri(), durum: [], hesaplar: [hesap(1, "Kart C", "kart", { limit: TL(100_000), kesimGunu: 25, sonOdemeGunu: 5 })] };
  const n = nakitAkisi(v, "2026-11-04", "tam", 60);
  assert.equal(n.satirlar.length, 0);
  assert.ok(n.tutarsizOdemeSayisi >= 1);
});

test("kur 0 = girilmedi: dövizli tutar TL toplamlara katılmaz, TL kalem etkilenmez", () => {
  assert.equal(tlKarsiligi(20_000, "USD", 0), 0);
  assert.equal(tlKarsiligi(20_000, "USD", 50), 1_000_000);
  assert.equal(tlKarsiligi(20_000, "TRY", 0), 20_000);
});

test("borç dağılımı: diğer de bir dilim, borcu olmayanlar hariç, büyükten küçüğe; dilimler toplam borcu verir", () => {
  const pano = panoHesapla(veri());
  const dagilim = borcDagilimi(pano);
  assert.deepEqual(dagilim.map((d) => d.hesap.ad), ["Kart A", "Kart B", "İş borcu", "KMH A"]);
  assert.ok(Math.abs(dagilim.reduce((t, d) => t + d.pay, 0) - 1) < 1e-9);
  assert.equal(dagilim.reduce((t, d) => t + d.borc, 0), pano.toplam, "halkanın ortasındaki toplam dilimlerin toplamıyla aynı");

  const borcsuz = veri();
  borcsuz.durum.push(durum(9, 4, "2026-11-05", 0));
  assert.deepEqual(borcDagilimi(panoHesapla(borcsuz)).map((d) => d.hesap.ad), ["Kart A", "Kart B", "KMH A"], "borcu 0 olan diğer dilim vermez");
});
