// /merve/ingilizce: soru bankası, ders içeriği ve puanlama/seviye/plan/rapor mantığının sınaması.
//   node scripts/merve-ingilizce-test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const klasor = join(kok, "public/merve/ingilizce");

// Üç dosya tarayıcıda klasik <script> olarak yüklenir; burada aynı biçimde tek bir bağlamda çalıştırılır.
const baglam = {};
vm.createContext(baglam);
for (const dosya of ["sorular.js", "dersler.js", "motor.js"]) {
  vm.runInContext(readFileSync(join(klasor, dosya), "utf8"), baglam, { filename: dosya });
}
const T = baglam.MERVE_TEST;
const D = baglam.MERVE_DERSLER;
const M = baglam.MerveMotor;
const SEVIYELER = ["A1", "A2", "B1", "B2", "C1"];

// vm bağlamında üretilen dizi ve nesnelerin prototipi bu dosyanınkinden farklıdır; karşılaştırmadan önce düz JSON'a çevrilir.
const duz = (x) => JSON.parse(JSON.stringify(x));
const esit = (gercek, beklenen, mesaj) => assert.deepEqual(duz(gercek), duz(beklenen), mesaj);
const farkli = (a, b, mesaj) => assert.notDeepEqual(duz(a), duz(b), mesaj);
const BLOK_TURLERI = new Set(["p", "baslik", "kural", "ipucu", "tablo", "liste", "kartlar", "metin"]);

/** Ekranda gösterilmeyen ama beklenen: doğru (0) ya da yanlış (1) işaretlenmiş bir cevap kümesi. */
function cevapla(kural) {
  const c = {};
  for (const q of T.sorular) {
    const v = kural(q);
    if (v !== undefined) c[q.id] = v;
  }
  return c;
}

test("soru bankası: sayılar ve sıralama", () => {
  assert.equal(T.sorular.length, 42);
  const say = (alan, deger) => T.sorular.filter((q) => q[alan] === deger).length;
  esit([say("bolum", "gramer"), say("bolum", "kelime"), say("bolum", "okuma")], [25, 11, 6]);
  esit(SEVIYELER.map((l) => say("seviye", l)), [6, 8, 10, 12, 6]);
  // Bölümler gramer → kelime → okuma sırasında, her bölümde seviye azalmaz.
  const bolumSirasi = ["gramer", "kelime", "okuma"];
  let onceki = null;
  for (const q of T.sorular) {
    if (onceki) {
      const bi = bolumSirasi.indexOf(q.bolum), bo = bolumSirasi.indexOf(onceki.bolum);
      assert.ok(bi >= bo, `${q.id}: bölüm sırası bozuldu`);
      if (bi === bo) assert.ok(SEVIYELER.indexOf(q.seviye) >= SEVIYELER.indexOf(onceki.seviye), `${q.id}: seviye sırası bozuldu`);
    }
    onceki = q;
  }
});

test("soru bankası: her soru geçerli ve tutarlı", () => {
  const idler = new Set();
  const dersler = new Set(D.dersler.map((d) => d.id));
  for (const q of T.sorular) {
    assert.ok(!idler.has(q.id), `${q.id} iki kez var`);
    idler.add(q.id);
    assert.ok(SEVIYELER.includes(q.seviye), `${q.id}: seviye`);
    assert.ok(dersler.has(q.konu), `${q.id}: konu '${q.konu}' için ders yok`);
    assert.ok(q.q.trim() && q.e.trim(), `${q.id}: soru ve açıklama dolu olmalı`);
    assert.equal(q.o.length, 4, `${q.id}: dört şık`);
    assert.equal(new Set(q.o.map((x) => x.toLowerCase())).size, 4, `${q.id}: şıklar birbirinden farklı olmalı`);
    assert.ok(q.o.every((x) => x.trim()), `${q.id}: boş şık`);
    if (q.bolum === "okuma") assert.ok(T.metinler[q.metin], `${q.id}: okuma metni yok`);
    if (q.bolum === "gramer") assert.match(q.q, /___/, `${q.id}: boşluk işareti`);
  }
  // Her okuma metninin soruları ardışık.
  const okuma = T.sorular.filter((q) => q.bolum === "okuma").map((q) => q.metin);
  esit(okuma, ["duyuru", "duyuru", "duyuru", "kisaHafta", "kisaHafta", "kisaHafta"]);
});

test("her ders: içerik ve alıştırmalar geçerli", () => {
  const idler = new Set();
  for (const d of D.dersler) {
    assert.ok(!idler.has(d.id), `${d.id} iki kez var`);
    idler.add(d.id);
    assert.ok(SEVIYELER.includes(d.seviye), `${d.id}: seviye`);
    assert.ok(d.ad && d.ozet, `${d.id}: ad ve özet`);
    assert.ok(d.blok.length >= 2, `${d.id}: içerik çok kısa`);
    for (const b of d.blok) {
      assert.ok(BLOK_TURLERI.has(b.t), `${d.id}: bilinmeyen blok '${b.t}'`);
      if (b.t === "tablo") {
        assert.ok(b.b.length && b.s.length, `${d.id}: boş tablo`);
        for (const satir of b.s) assert.equal(satir.length, b.b.length, `${d.id}: tablo satırı başlıkla uyuşmuyor: ${satir[0]}`);
      }
      if (b.t === "kartlar") for (const k of b.k) assert.equal(k.length, 3, `${d.id}: kart [ing, tr, örnek] olmalı`);
      if (["p", "baslik", "kural", "ipucu", "metin"].includes(b.t)) assert.ok(b.x && b.x.trim(), `${d.id}: boş ${b.t}`);
    }
    assert.ok(d.alistirma.length >= 3, `${d.id}: en az üç alıştırma`);
    const sorular = new Set();
    for (const a of d.alistirma) {
      assert.ok(!sorular.has(a.q), `${d.id}: aynı alıştırma iki kez: ${a.q}`);
      sorular.add(a.q);
      assert.equal(a.o.length, 4, `${d.id}: dört şık: ${a.q}`);
      assert.equal(new Set(a.o.map((x) => x.toLowerCase())).size, 4, `${d.id}: şıklar farklı olmalı: ${a.q}`);
      assert.ok(a.e && a.e.trim(), `${d.id}: açıklama: ${a.q}`);
      assert.match(a.q, /___|\?$|→/, `${d.id}: boşluk ya da soru işareti yok: ${a.q}`);
    }
  }
  // Test sorularının doğrudan kopyası alıştırma olmasın (alıştırma öğretir, test ölçer).
  const testMetinleri = new Set(T.sorular.map((q) => q.q));
  for (const d of D.dersler) for (const a of d.alistirma) assert.ok(!testMetinleri.has(a.q), `${d.id}: alıştırma testteki bir sorunun aynısı: ${a.q}`);
});

test("ders içeriğinde işaretleme kapanıyor (kalın, kod, İngilizce örnek)", () => {
  const metinler = [];
  for (const d of D.dersler) {
    metinler.push(d.ozet);
    for (const b of d.blok) {
      for (const alan of ["x"]) if (b[alan]) metinler.push(b[alan]);
      if (b.t === "tablo") for (const s of b.s) metinler.push(...s);
      if (b.t === "liste") metinler.push(...b.m);
    }
  }
  for (const m of metinler) {
    assert.equal((m.match(/\*\*/g) || []).length % 2, 0, `** eşleşmiyor: ${m}`);
    assert.equal((m.match(/\{\{/g) || []).length, (m.match(/\}\}/g) || []).length, `{{ }} eşleşmiyor: ${m}`);
    assert.equal((m.match(/`/g) || []).length % 2, 0, `\` eşleşmiyor: ${m}`);
    assert.equal((m.match(/<i>/g) || []).length, (m.match(/<\/i>/g) || []).length, `<i> eşleşmiyor: ${m}`);
    assert.equal((m.match(/<code>/g) || []).length, (m.match(/<\/code>/g) || []).length, `<code> eşleşmiyor: ${m}`);
    assert.ok(!/<(?!\/?(i|code|br)>)/i.test(m), `izin verilmeyen etiket: ${m}`);
  }
});

test("her ders için testte en az bir soru var ya da ders bağımsız çalışılabilir; testteki her konunun dersi var", () => {
  const dersler = new Set(D.dersler.map((d) => d.id));
  for (const q of T.sorular) assert.ok(dersler.has(q.konu));
});

test("şık karıştırma: aynı anahtar aynı sırayı verir, her sıra bir permütasyondur, doğru şık her yere düşer", () => {
  esit(M.sira("g01:0", 4), M.sira("g01:0", 4));
  const yerler = [0, 0, 0, 0];
  for (const q of T.sorular) {
    const s = M.sira(q.id + ":0", 4);
    esit([...s].sort(), [0, 1, 2, 3]);
    yerler[s.indexOf(0)]++;
  }
  // 42 sorudan doğru şık en az üç yere dağılmalı ve hiçbir yer 21'den fazla olmamalı (çok çarpık dağılım olmasın).
  assert.ok(yerler.filter((n) => n > 0).length >= 3, `doğru şık yerleri: ${yerler}`);
  assert.ok(Math.max(...yerler) <= 21, `doğru şık yerleri: ${yerler}`);
  farkli(M.sira("g01:0", 4), M.sira("g01:1", 4), "farklı deneme farklı sıra vermeli (bu anahtar çifti için)");
});

test("puanlama: hepsi doğru → 42/42, C1", () => {
  const s = M.puanla(T.sorular, cevapla(() => 0));
  assert.equal(s.dogru, 42);
  assert.equal(s.hatalar.length, 0);
  const k = M.seviyeKarari(s);
  assert.equal(k.kod, "C1");
  assert.equal(k.sinirda, null);
});

test("puanlama: hepsi yanlış → A1 altı; hepsi 'Bilmiyorum' → aynı, sayaçlar ayrı", () => {
  const yanlis = M.puanla(T.sorular, cevapla(() => 1));
  assert.equal(yanlis.dogru, 0);
  assert.equal(yanlis.yanlis, 42);
  assert.equal(M.seviyeKarari(yanlis).kod, "A0");
  assert.equal(M.seviyeKarari(yanlis).etiket, "A1 altı");
  const bilmiyor = M.puanla(T.sorular, cevapla(() => -1));
  assert.equal(bilmiyor.bilmiyorum, 42);
  assert.equal(bilmiyor.yanlis, 0);
  const bos = M.puanla(T.sorular, {});
  assert.equal(bos.bos, 42);
  assert.equal(bos.hatalar.length, 42);
  assert.equal(bos.hatalar[0].secim, null);
});

test("seviye kararı: B1'e kadar doğru, üstü yanlış → B1", () => {
  const s = M.puanla(T.sorular, cevapla((q) => (["A1", "A2", "B1"].includes(q.seviye) ? 0 : 1)));
  const k = M.seviyeKarari(s);
  assert.equal(k.kod, "B1");
  assert.equal(k.sinirda, null);
  assert.match(k.aciklama, /Orta/);
});

test("seviye kararı: üst seviyede yarı yarıya doğru → 'sınırda' notu", () => {
  let b2 = 0;
  const s = M.puanla(T.sorular, cevapla((q) => {
    if (["A1", "A2", "B1"].includes(q.seviye)) return 0;
    if (q.seviye === "B2") return b2++ < 6 ? 0 : 1; // 12 sorunun 6'sı = %50, geçme eşiğinin (%60) altında
    return 1;
  }));
  const k = M.seviyeKarari(s);
  assert.equal(k.kod, "B1");
  assert.equal(k.sinirda, "B2");
  assert.equal(k.etiket, "B1 (B2'ye yakın)");
});

test("seviye kararı: tek tük şanslı üst seviye cevabı seviyeyi yükseltmez", () => {
  // A1 ve A2 tam, B1 yarı yarıya, B2 ve C1'de dörder doğru gibi 'tahmin' desenleri.
  let b1 = 0;
  const s = M.puanla(T.sorular, cevapla((q) => {
    if (q.seviye === "A1" || q.seviye === "A2") return 0;
    if (q.seviye === "B1") return b1++ < 5 ? 0 : 1; // 5/10
    if (q.seviye === "B2" || q.seviye === "C1") return q.id.endsWith("1") || q.id.endsWith("5") ? 0 : 1;
    return 1;
  }));
  const k = M.seviyeKarari(s);
  assert.equal(k.kod, "A2", `beklenen A2, çıkan ${k.kod}`);
});

test("konu ve seviye sayıları toplamla tutarlı", () => {
  const s = M.puanla(T.sorular, cevapla((q) => (q.id.charCodeAt(1) % 2 ? 0 : 1)));
  const seviyeToplam = SEVIYELER.reduce((a, l) => a + s.seviye[l][1], 0);
  const konuToplam = Object.values(s.konu).reduce((a, k) => a + k.t, 0);
  const konuDogru = Object.values(s.konu).reduce((a, k) => a + k.d, 0);
  assert.equal(seviyeToplam, 42);
  assert.equal(konuToplam, 42);
  assert.equal(konuDogru, s.dogru);
  assert.equal(s.dogru + s.hatalar.length, 42);
});

test("ders durumu ve çalışma sırası: yanlış çıkan konular başa, alt seviye önce", () => {
  // Yanlış: koşul (B1) ve artikel (A1) sorularının hepsi; gerisi doğru.
  const s = M.puanla(T.sorular, cevapla((q) => (q.konu === "kosul" || q.konu === "artikel" ? 1 : 0)));
  const sira = M.dersSirasi(D.dersler, s, {});
  const ilkIki = sira.slice(0, 2).map((x) => x.ders.id);
  esit(ilkIki, ["artikel", "kosul"]);
  assert.equal(sira[0].durum, "calis");
  assert.equal(sira[0].testYanlis, 2);
  // Testte soru olup hepsi doğru olan ders 'testte-iyi', testte hiç sorusu olmayan 'yeni'.
  const durum = (id) => sira.find((x) => x.ders.id === id).durum;
  assert.equal(durum("simdiki"), "testte-iyi");
  assert.equal(durum("gelecek"), "testte-iyi");
  assert.equal(durum("kelime-gunluk"), "testte-iyi");
  assert.equal(durum("be-var"), "testte-iyi");
  // Test yokken hepsi 'yeni' ve seviye sırasında.
  const testsiz = M.dersSirasi(D.dersler, null, {});
  assert.ok(testsiz.every((x) => x.durum === "yeni"));
  const sev = testsiz.map((x) => SEVIYELER.indexOf(x.ders.seviye));
  esit(sev, [...sev].sort((a, b) => a - b));
});

test("alıştırma sonucu durumu değiştirir: yeterince doğru → tamam, çok yanlış → pekiştir", () => {
  const s = M.puanla(T.sorular, cevapla((q) => (q.konu === "kosul" ? 1 : 0)));
  const kosul = D.dersler.find((d) => d.id === "kosul");
  const kayit = (cevaplar) => Object.fromEntries(cevaplar.map((v, i) => [M.alistirmaAnahtari("kosul", i), v]));
  assert.equal(M.dersDurumu(kosul, s, {}).durum, "calis");
  assert.equal(M.dersDurumu(kosul, s, kayit([0, 0, 0, 0, 0])).durum, "tamam");
  assert.equal(M.dersDurumu(kosul, s, kayit([1, 1, 0, 1, 1])).durum, "pekistir");
  assert.equal(M.dersDurumu(kosul, s, kayit([0, 1])).durum, "calis", "iki cevap yetmez, hâlâ çalışılacak");
  // Testte doğru yapılan bir konuda alıştırma çok yanlış çıkarsa yine 'pekiştir'.
  const iyi = M.puanla(T.sorular, cevapla(() => 0));
  assert.equal(M.dersDurumu(kosul, iyi, kayit([1, 1, 1, 1, 0])).durum, "pekistir");
  // Sadece 3 alıştırması olan okuma dersi 3 cevapla tamamlanabilir.
  const okuma = D.dersler.find((d) => d.id === "okuma");
  assert.equal(okuma.alistirma.length, 3);
  assert.equal(M.dersDurumu(okuma, iyi, { "okuma:0": 0, "okuma:1": 0, "okuma:2": 0 }).durum, "tamam");
});

test("kayıt doğrulama: bozuk ve eski veri güvenle temizlenir", () => {
  esit(M.durumDogrula(null, T, D), M.bosDurum());
  esit(M.durumDogrula({ v: 2 }, T, D), M.bosDurum());
  esit(M.durumDogrula("x", T, D), M.bosDurum());
  const ham = {
    v: 1,
    test: { cevap: { g01: 0, g02: 3, g03: 7, yok: 0, g04: "1", v01: -1 }, konum: 999, sure: -4, basladi: 1700000000000, tur: 2 },
    denemeler: [{ t: 1700000000000, sure: 600, cevap: { g01: 1, bozuk: 0 } }, { t: "x" }, null],
    alistirma: { "kosul:0": 0, "kosul:9": 0, "yok:0": 0, "kosul:1": 2, "kosul:2": 9 },
    gecmis: { "kosul:0": 2, "kosul:1": -3 },
    tur: { kosul: 1, yok: 3 },
    ipucu: true
  };
  const d = M.durumDogrula(ham, T, D);
  esit(d.test.cevap, { g01: 0, g02: 3, v01: -1 });
  assert.equal(d.test.konum, 0);
  assert.equal(d.test.sure, 0);
  assert.equal(d.test.tur, 2);
  assert.equal(d.denemeler.length, 1);
  esit(d.denemeler[0].cevap, { g01: 1 });
  esit(d.alistirma, { "kosul:0": 0, "kosul:1": 2 });
  esit(d.gecmis, { "kosul:0": 2 });
  esit(d.tur, { kosul: 1 });
  assert.equal(d.ipucu, true);
  // Doğrulanmış veri tekrar doğrulanınca değişmez.
  esit(M.durumDogrula(JSON.parse(JSON.stringify(d)), T, D), d);
});

test("rapor: test yokken ve test varken beklenen bilgileri içerir", () => {
  const simdi = Date.UTC(2026, 10, 5, 12, 0, 0);
  const bos = M.rapor(T, D, M.bosDurum(), simdi);
  assert.match(bos, /MERVE · İNGİLİZCE RAPORU/);
  assert.match(bos, /henüz çözülmedi/);
  assert.match(bos, /Henüz alıştırma çözülmedi/);

  const durum = M.bosDurum();
  durum.denemeler.push({ t: simdi, sure: 25 * 60, cevap: cevapla((q) => (q.id === "g12" ? 1 : q.id === "g17" ? -1 : 0)) });
  durum.alistirma["kosul:0"] = 1;
  durum.alistirma["kosul:1"] = 0;
  durum.gecmis["kosul:0"] = 2;
  const r = M.rapor(T, D, durum, simdi);
  assert.match(r, /Sonuç: 40\/42/);
  assert.match(r, /süre: 25 dk/);
  assert.match(r, /Yanlış: 1 · 'Bilmiyorum': 1 · boş: 0/);
  assert.match(r, /\[g12 · B1 · kosul\] If you ___ hard, you will pass the exam\. → seçtiği: will study · doğru: study/);
  assert.match(r, /\[g17 · B2 · dolayli\].*→ seçtiği: Bilmiyorum/);
  assert.match(r, /- kosul \(Koşul cümleleri \(if\) ve wish, B1\): 1\/2/);
  assert.match(r, /kosul \(Koşul cümleleri \(if\) ve wish\): 2\/5 çözüldü, 1 doğru · bugüne kadar toplam 2 yanlış/);
  assert.match(r, /· If you heat water to 100°C, it ___\. → seçtiği: will boiled · doğru: boils/);
  assert.match(r, /ÇALIŞMA SIRASI/);
  assert.ok(!r.includes("undefined") && !r.includes("NaN") && !r.includes("[object"), "rapor temiz olmalı");
});
