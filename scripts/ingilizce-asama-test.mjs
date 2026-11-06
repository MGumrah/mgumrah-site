// /ingilizce "Sonraki aşama": yeni soru bankası, nokta tabloları ve aşama seçim mantığının sınaması.
//   node scripts/ingilizce-asama-test.mjs
// Sayfa tek dosya olduğu için mantık ve veri, sayfadaki <script id="asama-motor"> ve <script id="asama-veri">
// bloklarından okunur; alıştırmalar (EX) ve hazır cevaplar (SEED) ana betikten çıkarılır.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(kok, "public/ingilizce/index.html"), "utf8").replace(/\r\n/g, "\n");

function blok(id) {
  const m = html.match(new RegExp('<script id="' + id + '">\\n([\\s\\S]*?)\\n</script>'));
  assert.ok(m, id + " bloğu bulunamadı");
  return m[1];
}
function nesne(ad, sonraki) {
  const m = html.match(new RegExp("const " + ad + " = (\\{[\\s\\S]*?\\n\\});\\s*" + sonraki));
  assert.ok(m, ad + " bulunamadı");
  return vm.runInNewContext("(" + m[1] + ")");
}

const baglam = {};
vm.createContext(baglam);
vm.runInContext(blok("asama-motor"), baglam, { filename: "asama-motor" });
vm.runInContext(blok("asama-veri"), baglam, { filename: "asama-veri" });
const AM = baglam.AsamaMotor;
const { ASAMA_BANKA: BANKA, ASAMA_ALT: ALT, ASAMA_ETIKET: ETIKET, ASAMA_ONSEL: ONSEL, ASAMA_KONULAR: KONULAR, ASAMA_METIN: METIN } = baglam;
const EX = nesne("EX", "const CARDS");
const SEED = nesne("SEED", "const STORE_KEY");
const V = { banka: BANKA, harita: AM.harita(BANKA), alt: ALT, onsel: ONSEL, konular: KONULAR };

const duz = (x) => JSON.parse(JSON.stringify(x));
const esit = (gercek, beklenen, mesaj) => assert.deepEqual(duz(gercek), duz(beklenen), mesaj);

// Kullanıcının ekran görüntülerinden gelen 21 hazır cevap, motorun beklediği biçimde.
function seedKanit() {
  const out = [];
  for (const [sec, liste] of Object.entries(SEED)) {
    liste.forEach((s, qi) => {
      const it = EX[sec][qi];
      out.push({ k: sec + ":" + qi, s: ETIKET[sec + ":" + qi], ok: it.o.indexOf(s.c) === it.a, z: 0 });
    });
  }
  return out;
}
const bos = () => AM.bosDurum();
const planla = (kanit, durum, tohum) => AM.uret(V, kanit, durum, { tohum });
const idler = (plan) => plan.maddeler.map((x) => x.k);
const altOf = (k) => V.harita[k].s;
/** Bitmiş bir aşama kaydı: cevaplar [[id, c], ...]. */
function asama(tur, cevaplar, z0 = 1000) {
  return { tur, z: z0, maddeler: cevaplar.map(([k, c], i) => ({ k, n: "y", c, z: z0 + i })) };
}
const nokta = (s) => BANKA.filter((m) => m.s === s).map((m) => m.k);

test("veri: konular, noktalar ve etiketler tutarlı", () => {
  assert.equal(KONULAR.length, 8);
  assert.equal(new Set(KONULAR.map((k) => k.id)).size, 8);
  const bolumler = [...html.matchAll(/<section id="([a-z]+)">\n\s*<h2><span class="num">(\d)<\/span>/g)].map((m) => [m[1], +m[2]]);
  esit(KONULAR.map((k) => [k.id, k.no]), bolumler.filter(([, n]) => n <= 8), "konu kimlikleri ve numaraları sayfadaki bölümlerle aynı olmalı");
  for (const [s, a] of Object.entries(ALT)) {
    assert.ok(KONULAR.some((k) => k.id === a.t), s + ": bilinmeyen konu");
    assert.ok(a.ad && typeof a.ad === "string", s + ": ad yok");
    assert.ok(BANKA.some((m) => m.s === s), s + ": bu noktada hiç yeni soru yok");
  }
  // Her alıştırma tam bir noktaya bağlı ve nokta aynı konudan.
  const exAnahtar = [];
  for (const [sec, liste] of Object.entries(EX)) liste.forEach((_, i) => exAnahtar.push(sec + ":" + i));
  assert.equal(exAnahtar.length, 33);
  esit([...exAnahtar].sort(), Object.keys(ETIKET).sort(), "ETIKET her alıştırmayı tam bir kez kapsamalı");
  for (const k of exAnahtar) {
    assert.ok(ALT[ETIKET[k]], k + ": nokta tanımsız");
    assert.equal(ALT[ETIKET[k]].t, k.split(":")[0], k + ": nokta başka konudan");
  }
  // Seviye testindeki 14 yanlış.
  assert.equal(Object.values(ONSEL).reduce((a, b) => a + b, 0), 14);
  for (const s of Object.keys(ONSEL)) {
    assert.ok(ALT[s], s + ": tanımsız");
    assert.ok(nokta(s).length >= 2, s + ": testte yanlış yapılan nokta için en az 2 yeni soru olmalı");
  }
  // Konu başına seviye testi yanlışları: 1 karşılaştırma, 1 modal, 3 koşul, 1 edilgen, 1 zaman, 2 kalıp, 3 kelime, 2 okuma.
  const konuyaGore = {};
  for (const [s, n] of Object.entries(ONSEL)) konuyaGore[ALT[s].t] = (konuyaGore[ALT[s].t] || 0) + n;
  esit(konuyaGore, { karsilastirma: 1, modal: 1, kosul: 3, edilgen: 1, zaman: 1, kalip: 2, kelime: 3, okuma: 2 });
});

test("soru bankası: sayı, biçim, tekrar yok", () => {
  assert.equal(BANKA.length, 80);
  assert.equal(new Set(BANKA.map((m) => m.k)).size, BANKA.length, "id'ler benzersiz olmalı");
  const exSorular = new Set(Object.values(EX).flat().map((q) => q.q));
  const gorulen = new Set();
  for (const m of BANKA) {
    assert.equal(m.o.length, 4, m.k + ": 4 şık olmalı");
    assert.equal(new Set(m.o).size, 4, m.k + ": şıklar farklı olmalı");
    assert.ok(m.o.every((x) => typeof x === "string" && x.trim() === x && x.length > 0), m.k + ": şık boş ya da boşluklu");
    assert.ok(m.q.trim().length > 8 && m.e.trim().length > 10, m.k + ": soru ya da açıklama eksik");
    assert.ok(!/[<>]/.test(m.q + m.o.join("") + m.e), m.k + ": HTML karakteri");
    assert.ok(!exSorular.has(m.q), m.k + ": alıştırmadaki bir soruyla aynı");
    assert.ok(!gorulen.has(m.q), m.k + ": başka bir yeni soruyla aynı");
    gorulen.add(m.q);
    assert.equal(m.t, ALT[m.s].t, m.k + ": konu, noktanın konusuyla aynı olmalı");
    // Boşluklu soru: okuma dışında hepsinde ___ var (kelime/dilbilgisi), okumada metin var.
    if (m.t === "okuma") assert.ok(m.p && METIN[m.p], m.k + ": okuma sorusunun metni yok");
    else assert.ok(!m.p && m.q.includes("___"), m.k + ": boşluk ___ olmalı, metin olmamalı");
  }
  assert.deepEqual(Object.keys(METIN).sort(), [...new Set(BANKA.filter((m) => m.p).map((m) => m.p))].sort(), "her metin kullanılmalı");
  // Okuma metinlerindeki doğru şık metinde geçen bir bilgiye dayanıyor: açıklama metinden alıntı içermeli.
  for (const m of BANKA.filter((x) => x.p && /'[^']+'/.test(x.e))) {
    const alinti = m.e.match(/'([^']+)'/g).map((x) => x.slice(1, -1)).filter((x) => /[a-z]{3}/i.test(x) && /^[\x20-\x7e]+$/.test(x));
    assert.ok(alinti.some((x) => METIN[m.p].includes(x)), m.k + ": açıklamadaki alıntı metinde yok");
  }
});

test("zaman sırası: aynı noktadaki cevaplar zamana göre okunur", () => {
  const s = "kos-3";
  const eski = { k: "kosul:2", s, ok: false, z: 100 }, yeni = { k: "c07", s, ok: true, z: 200 };
  const a1 = AM.analiz(V, [eski, yeni], bos()).alt[s];
  assert.equal(a1.durum, "dogru");
  assert.equal(a1.son3, 1);
  const a2 = AM.analiz(V, [{ ...eski, z: 300 }, yeni], bos()).alt[s];
  assert.equal(a2.durum, "yanlis", "yanlış sonradan geldiyse nokta yanlış sayılır");
  // Giriş sırası değil zaman damgası belirler.
  const a3 = AM.analiz(V, [yeni, eski], bos()).alt[s];
  assert.equal(a3.durum, "dogru");
  // Son iki cevap doğruysa oturmuş.
  const a4 = AM.analiz(V, [eski, yeni, { k: "c08", s, ok: true, z: 300 }], bos()).alt[s];
  assert.equal(a4.durum, "saglam");
  // Hiç cevap yoksa yeni; seviye testi yanlışı yoksa da yeni.
  assert.equal(AM.analiz(V, [], bos()).alt["kar-enust"].durum, "yeni");
  // Seviye testinde yanlış yapılan nokta, başka bir kanıt yokken "yanlis"tır.
  assert.equal(AM.analiz(V, [], bos()).alt["kos-time"].durum, "yanlis");
  // Eski kayıt (z = 0) seviye testinden sonra, yeni kayıttan önce gelir.
  const eskiDogru = AM.analiz(V, [{ k: "kosul:4", s: "kos-time", ok: true, z: 0 }], bos()).alt["kos-time"];
  assert.equal(eskiDogru.durum, "dogru");
  assert.equal(eskiDogru.son3, 1);
});

test("konu zayıflığı: kanıt yokken ortada, yanlış arttıkça yükselir", () => {
  const bosAnaliz = AM.analiz(V, [], bos(), {});
  const bosV = { ...V, onsel: {} };
  const temiz = AM.analiz(bosV, [], bos());
  for (const k of KONULAR) assert.equal(temiz.konu[k.id].zayif, 0.5, k.id + ": kanıtsız zayıflık 0,5");
  // Seviye testi yanlışları zayıflığı yükseltir; en çok kelime (3 yanlış, hiç alıştırma yok).
  assert.ok(bosAnaliz.konu.kelime.zayif > bosAnaliz.konu.karsilastirma.zayif);
  // Hepsi doğru çözülen konu, hazır cevaplardan sonra düşer.
  const a = AM.analiz(V, seedKanit(), bos());
  assert.ok(a.konu.karsilastirma.zayif < bosAnaliz.konu.karsilastirma.zayif, "4/4 doğru zayıflığı azaltmalı");
  assert.ok(a.konu.kosul.zayif > a.konu.karsilastirma.zayif, "koşul (3/5 + 3 test yanlışı) karşılaştırmadan zayıf");
  assert.ok(a.konu.zaman.zayif > a.konu.modal.zayif);
  assert.equal(a.konu.kosul.n, 5);
  assert.equal(a.konu.kosul.dogru, 3);
  assert.equal(a.konu.kosul.yanlis, 2);
  assert.equal(a.konu.kalip.n, 0, "çözülmemiş bölümde n = 0");
});

test("aşama: kanıtsız başlangıç, seviye testindeki yanlışlara yönelir", () => {
  const p = planla([], bos(), 0);
  assert.equal(p.maddeler.length, 10);
  assert.equal(new Set(idler(p)).size, 10);
  // Hiçbir alıştırma çözülmemişken yanlış noktalar tek kanıt: tekrar kotası (6) dolar, kalan 4 yeni.
  assert.equal(p.ozet.tekrar, 6);
  assert.equal(p.ozet.yeni, 4);
  assert.equal(p.ozet.kontrol, 0);
  for (const x of p.maddeler.filter((y) => y.n === "t")) assert.ok(ONSEL[altOf(x.k)], x.k + ": tekrar sorusu testte yanlış yapılan noktadan olmalı");
  esit(planla([], bos(), 0), planla([], bos(), 0), "aynı veri ve aynı tohum = aynı aşama");
  const farklilar = new Set([1, 2, 3, 4, 5].map((t) => idler(planla([], bos(), t)).join()));
  assert.ok(farklilar.size >= 4, "tohum değişince aşama değişmeli");
});

test("aşama: sınırlar (kota, konu ve nokta üst sınırı, ekran sırası)", () => {
  const kanit = seedKanit();
  for (let t = 0; t < 30; t++) {
    const p = planla(kanit, bos(), t);
    assert.equal(p.maddeler.length, 10);
    assert.equal(new Set(idler(p)).size, 10, "soru tekrarı");
    assert.ok(p.ozet.tekrar <= 6, "tekrar kotası");
    assert.ok(p.ozet.kontrol <= 1, "ilk aşamada oturmuş nokta yok, kontrol en çok 1");
    const konu = {}, alt = {};
    for (const k of idler(p)) {
      konu[V.harita[k].t] = (konu[V.harita[k].t] || 0) + 1;
      alt[altOf(k)] = (alt[altOf(k)] || 0) + 1;
    }
    assert.ok(Math.max(...Object.values(konu)) <= 4, "tek konudan en çok %40");
    assert.ok(Math.max(...Object.values(alt)) <= 2, "tek noktadan en çok 2 soru");
    // Sıra, sayfadaki konu sırasıdır; okuma sorularında aynı metin yan yana.
    const sira = idler(p).map((k) => KONULAR.findIndex((x) => x.id === V.harita[k].t));
    esit(sira, [...sira].sort((a, b) => a - b), "konu sırası");
    const metinler = idler(p).map((k) => V.harita[k].p).filter(Boolean);
    esit(metinler, [...metinler].sort(), "okuma metinleri bitişik");
    const ozetSayi = p.ozet.konular.reduce((a, b) => a + b.adet, 0);
    assert.equal(ozetSayi, 10);
  }
});

test("aşama: kullanıcının gerçek cevaplarında yanlış yapılan noktalar öne çıkar", () => {
  const kanit = seedKanit();
  // Hazır cevaplarda yanlış: would see (kos-3), finish (kos-time), will prepare (ed-gelecek), worked (zam-prp), have finished (zam-ps).
  const yanlis = ["kos-3", "kos-time", "ed-gelecek", "zam-prp", "zam-ps"];
  assert.equal(kanit.filter((x) => !x.ok).length, 5);
  esit(kanit.filter((x) => !x.ok).map((x) => x.s).sort(), [...yanlis].sort());
  // Hiç yanlışı olmayan, seviye testinde de yanlış yapılmamış, alıştırmada doğru çözülmüş noktalar.
  const guclu = ["kar-uzun", "kar-enust", "kar-duzensiz", "mod-gerekyok", "mod-tavsiye", "mod-zorunlu", "kos-wish", "ed-simdiki", "ed-perfect"];
  const sayi = (grup, t) => idler(planla(kanit, bos(), t)).filter((k) => grup.includes(altOf(k))).length;
  let y = 0, g = 0;
  const bulundu = Object.fromEntries(yanlis.map((s) => [s, 0]));
  for (let t = 0; t < 40; t++) {
    y += sayi(yanlis, t);
    g += sayi(guclu, t);
    for (const k of idler(planla(kanit, bos(), t))) if (bulundu[altOf(k)] !== undefined) bulundu[altOf(k)]++;
  }
  const yBasina = y / yanlis.length, gBasina = g / guclu.length;
  assert.ok(yBasina > 3 * gBasina, `yanlış noktalar (${yBasina.toFixed(1)}) güçlülerden (${gBasina.toFixed(1)}) çok daha sık gelmeli`);
  for (const s of yanlis) assert.ok(bulundu[s] >= 12, s + ": 40 aşamanın en az 12'sinde bulunmalı (" + bulundu[s] + ")");
  // Hiçbirinin sorusu alıştırmadaki soru değil: aşama yalnızca yeni sorulardan oluşur.
  assert.ok(idler(planla(kanit, bos(), 0)).every((k) => V.harita[k]));
});

test("aşama: yanlış yapılan nokta sonraki aşamada yeni sorularla geri gelir, iki doğrudan sonra çıkar", () => {
  const kanit = seedKanit().filter((x) => x.s !== "kos-3");
  const ks = nokta("kos-3");
  assert.equal(ks.length, 3);
  // Aşamada kos-3'ten 2 soru yanlış → nokta yanlış, sıradaki aşamada çıkma sıklığı yüksek.
  const yanlisGecmis = [asama(0, [[ks[0], 1], [ks[1], 2]])];
  const d = { ...bos(), tur: 1, gecmis: yanlisGecmis };
  const a = AM.analiz(V, kanit, d);
  assert.equal(a.alt["kos-3"].durum, "yanlis");
  assert.equal(a.madde[ks[0]], "yanlis");
  let geldi = 0;
  for (let t = 0; t < 30; t++) if (idler(planla(kanit, d, t)).some((k) => altOf(k) === "kos-3")) geldi++;
  assert.ok(geldi >= 20, "kos-3, 30 aşamanın en az 20'sinde gelmeli (" + geldi + ")");
  // Üçüncü soru (yeni) doğru gelince nokta "dogru" (düzeliyor); iki doğru art arda gelince oturur.
  const d2 = { ...bos(), tur: 2, gecmis: [asama(1, [[ks[2], 0]], 5000), ...yanlisGecmis] };
  assert.equal(AM.analiz(V, kanit, d2).alt["kos-3"].durum, "dogru");
  assert.equal(AM.analiz(V, kanit, d2).alt["kos-3"].son3, 2);
  const d3 = { ...bos(), tur: 3, gecmis: [asama(2, [[ks[0], 0]], 9000), asama(1, [[ks[2], 0]], 5000), ...yanlisGecmis] };
  const a3 = AM.analiz(V, kanit, d3);
  assert.equal(a3.alt["kos-3"].durum, "saglam");
  let tekrarKos3 = 0, kontrolKos3 = 0;
  for (let t = 0; t < 30; t++) {
    for (const x of planla(kanit, d3, t).maddeler) if (altOf(x.k) === "kos-3") { if (x.n === "t") tekrarKos3++; if (x.n === "k") kontrolKos3++; }
  }
  assert.equal(tekrarKos3, 0, "oturmuş nokta tekrar sayılmaz");
  assert.ok(kontrolKos3 > 0, "ama arada kontrol olarak gelebilir");
  // Oturmuş noktadan en çok 1 kontrol sorusu çıkar.
  for (let t = 0; t < 30; t++) assert.ok(planla(kanit, d3, t).ozet.kontrol <= 1);
});

test("aşama: önceki aşamada çıkan soru hemen tekrar gelmez, havuz bitse de 10 soru çıkar", () => {
  const kanit = seedKanit();
  const p1 = planla(kanit, bos(), 0);
  const d = { ...bos(), tur: 1, gecmis: [asama(0, idler(p1).map((k) => [k, 0]))] };
  let ortak = 0;
  for (let t = 0; t < 30; t++) ortak += idler(planla(kanit, d, t)).filter((k) => idler(p1).includes(k)).length;
  assert.ok(ortak / 30 < 1, "doğru çözülen sorular hemen geri gelmemeli (ortalama " + (ortak / 30).toFixed(2) + ")");

  // Bütün sorular iki kez doğru çözülmüş: yine de 10 farklı soru çıkar ve hepsi "kontrol".
  const hepsi = BANKA.map((m) => [m.k, 0]);
  const d2 = { ...bos(), tur: 9, gecmis: [asama(8, hepsi.slice(40), 9000), asama(7, hepsi.slice(0, 40), 8000), asama(6, hepsi.slice(40), 7000), asama(5, hepsi.slice(0, 40), 6000)] };
  const p2 = planla(kanit, d2, 3);
  assert.equal(p2.maddeler.length, 10);
  assert.equal(new Set(idler(p2)).size, 10);
  assert.ok(p2.maddeler.every((x) => x.n === "k"));
  assert.equal(p2.ozet.kalanYeni, 0);

  // adet seçeneği: havuzdan büyük istenirse havuz kadar, küçükse o kadar.
  assert.equal(AM.uret(V, kanit, bos(), { adet: 1000, tohum: 0 }).maddeler.length, 80);
  assert.equal(AM.uret(V, kanit, bos(), { adet: 3, tohum: 0 }).maddeler.length, 3);
  assert.equal(AM.uret(V, kanit, bos(), { adet: 3, tohum: 0 }).maddeler.filter((x) => x.n === "t").length <= 2, true);
});

test("öğrenme döngüsü: düzelen kullanıcıda tekrar azalır, hep yanlış yapan noktada kalır", () => {
  const kanit = seedKanit();
  // Kullanıcı B: kos-time ve ed-gelecek noktalarını hep yanlış yapıyor, gerisi doğru.
  function oyna(kural, tur) {
    let durum = bos();
    const gorulenNokta = new Set();
    const tekrarlar = [];
    const sabit = [];
    for (let r = 0; r < tur; r++) {
      const p = AM.uret(V, kanit, durum, {});
      tekrarlar.push(p.ozet.tekrar);
      sabit.push(p.maddeler.filter((x) => ["kos-time", "ed-gelecek"].includes(altOf(x.k))).length);
      const cevaplar = p.maddeler.map((x) => {
        const s = altOf(x.k);
        const ilk = !gorulenNokta.has(s);
        gorulenNokta.add(s);
        return [x.k, kural(s, ilk)];
      });
      durum = { ...durum, tur: durum.tur + 1, gecmis: [asama(r, cevaplar, 100000 * (r + 1)), ...durum.gecmis] };
    }
    return { tekrarlar, sabit };
  }
  // Kullanıcı A her soruyu doğru yapıyor: yanlış yaptığı ve seviye testinde takıldığı noktalar iki doğrudan sonra oturur,
  // tekrar kotası boşalır (önce kendi yanlışları, sonra seviye testindekiler).
  const A = oyna(() => 0, 8);
  assert.equal(A.tekrarlar[0], 6);
  assert.ok(A.tekrarlar.slice(5).some((n) => n < 6), "düzelen kullanıcıda tekrar kotası artık dolmamalı: " + A.tekrarlar);
  assert.ok(A.tekrarlar[7] <= 1, "sekizinci aşamada neredeyse tekrar kalmamalı: " + A.tekrarlar);
  const B = oyna((s) => (["kos-time", "ed-gelecek"].includes(s) ? 1 : 0), 6);
  const toplamB = B.sabit.reduce((a, b) => a + b, 0);
  assert.ok(B.sabit.every((n) => n >= 1), "hep yanlış yapılan noktalar her aşamada gelmeli: " + B.sabit);
  assert.ok(toplamB >= 6 * 2 - 2, "ve çoğunlukla ikişer soruyla: " + B.sabit);
});

test("puanlama", () => {
  const kosul = nokta("kos-3")[0], edilgen = nokta("ed-gelecek")[0], okuma = nokta("oku-neden")[0];
  const p = AM.puanla(V, [
    { k: kosul, n: "t", c: 0 }, { k: edilgen, n: "t", c: 2 }, { k: okuma, n: "y", c: 0 }, { k: nokta("kel-deadlock")[0], n: "k", c: 3 }
  ]);
  assert.equal(p.toplam, 4);
  assert.equal(p.dogru, 2);
  assert.equal(p.yanlis, 2);
  esit(p.neden, { t: [1, 2], y: [1, 1], k: [0, 1] });
  esit(p.konu, { kosul: [1, 1], edilgen: [0, 1], okuma: [1, 1], kelime: [0, 1] });
  esit(p.alt["kos-3"], [1, 1]);
  esit(p.hatalar, [{ k: edilgen, n: "t", secim: 2 }, { k: nokta("kel-deadlock")[0], n: "k", secim: 3 }]);
  assert.equal(AM.puanla(V, [{ k: "yok", n: "t", c: 0 }]).toplam, 0, "bilinmeyen soru sayılmaz");
});

test("kayıt doğrulama: bozuk veri sayfayı bozmaz", () => {
  for (const ham of [null, undefined, 5, "x", [], {}, { v: 2 }, { v: 1, gecmis: "x", aktif: 5 }]) {
    const d = AM.durumDogrula(ham, V);
    esit(d.gecmis, []);
    assert.equal(d.aktif, null);
    assert.equal(d.tur, 0);
  }
  const k1 = BANKA[0].k, k2 = BANKA[1].k;
  const ham = {
    v: 1, tur: 2,
    gecmis: [
      { tur: 1, z: 5000, maddeler: [{ k: k1, n: "t", c: 0, z: 4000 }, { k: k1, n: "t", c: 1, z: 4001 }, { k: "__proto__", n: "t", c: 0 }, { k: "yok", n: "y", c: 0 }, { k: k2, n: "x", c: 0 }, { k: BANKA[2].k, n: "y", c: 9 }] },
      { tur: 0, z: "bozuk", maddeler: "x" },
      { tur: -3, maddeler: [] },
      null
    ],
    aktif: { tur: 2, z: 9000, maddeler: [{ k: k2, n: "y" }, { k: k2, n: "y" }, { k: "__proto__", n: "y" }, { k: "yok", n: "y" }],
      cevap: { [k2]: { c: 3, z: 9100 }, [k1]: { c: 0, z: 9200 }, "__proto__": { c: 0 } } }
  };
  const d = AM.durumDogrula(ham, V);
  esit(d.gecmis.map((g) => g.maddeler.map((x) => x.k)), [[k1]], "tekrar eden, bilinmeyen, geçersiz şıklı sorular elenir");
  assert.equal(d.gecmis[0].maddeler[0].c, 0, "ilk geçerli kayıt kalır");
  esit(d.aktif.maddeler, [{ k: k2, n: "y" }]);
  esit(d.aktif.cevap, { [k2]: { c: 3, z: 9100 } }, "aşamada olmayan soru için gelen cevap atılır");
  assert.equal(d.tur, 2);
  esit(AM.durumDogrula(duz(d), V), d, "doğrulanmış kayıt tekrar doğrulanınca değişmez");
  // Geçmişteki aşama numarası sayaçtan büyükse sayaç ilerletilir.
  assert.equal(AM.durumDogrula({ v: 1, tur: 0, gecmis: [{ tur: 4, maddeler: [{ k: k1, n: "y", c: 0 }] }] }, V).tur, 5);
  // Saklanan aşama sayısı sınırlıdır.
  const cok = Array.from({ length: 30 }, (_, i) => ({ tur: i, maddeler: [{ k: k1, n: "y", c: 0 }] }));
  assert.equal(AM.durumDogrula({ v: 1, tur: 30, gecmis: cok }, V).gecmis.length, AM.KAYIT_SINIRI);
  // Nesne çıktısı JSON'a çevrilebilir ve prototipi kirlenmez.
  assert.equal(({}).z, undefined);
});

test("karıştırma: şık sırası sabit, her şık bir kez", () => {
  const a = AM.sira("c07:3", 4), b = AM.sira("c07:3", 4);
  esit(a, b);
  esit([...a].sort(), [0, 1, 2, 3]);
  const farkli = new Set(BANKA.map((m) => AM.sira(m.k + ":0", 4).join()));
  assert.ok(farkli.size >= 8, "farklı sorular farklı sıralar almalı");
  // Doğru şık (0) her konumda bulunabilmeli, hep aynı yerde olmamalı.
  const konum = new Set(BANKA.map((m) => AM.sira(m.k + ":0", 4).indexOf(0)));
  assert.equal(konum.size, 4);
});

test("sayfa: bölüm, gezinti ve betikler yerinde", () => {
  assert.ok(html.includes('<section id="asama">') && html.includes('<div id="asama-ic"></div>'));
  assert.ok(html.includes('<a href="#asama">★ Sonraki aşama</a>'));
  // Aşama bölümü 8. bölümle 9. bölüm arasında.
  assert.ok(html.indexOf('id="okuma"') < html.indexOf('id="asama"') && html.indexOf('id="asama"') < html.indexOf('id="plan"'));
  const betikler = [...html.matchAll(/<script(?: id="[^"]+")?>\n([\s\S]*?)\n<\/script>/g)].map((m) => m[1]);
  assert.equal(betikler.length, 3);
  for (const b of betikler) new vm.Script(b); // söz dizimi hatası varsa fırlatır
  const ana = betikler[2];
  for (const ad of ["asamaCiz", "asamaYenile", "asamaKanit", "asamaBitir", "asamaPlan", "asamaSorular", "asamaSonuc"]) assert.ok(ana.includes("function " + ad), ad);
  // Alıştırma cevapları zaman damgası taşır (aşama, olayları zamana göre sıralıyor).
  assert.ok(ana.includes("saved[key] = {q: it.q, k: k, o: order, t: Date.now()}"));
  // Devam eden aşamanın şıkları ekranda bankadaki sıra (AM.sira) ile karıştırılır.
  assert.ok(ana.includes("AM.sira(m.k"));
});
