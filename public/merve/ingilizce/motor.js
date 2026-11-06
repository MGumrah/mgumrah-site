/* Merve İngilizce: puanlama, seviye kararı, çalışma planı ve rapor.
 * DOM ve tarayıcı API'si kullanmaz; hepsi saf fonksiyondur, bu yüzden scripts/merve-ingilizce-test.mjs
 * ile Node'da denenir. uygulama.js yalnızca ekranı çizer ve kayıt tutar.
 *
 * Kayıt biçimi (localStorage "merve-ingilizce:v1"):
 *   test.cevap[id]      = şıkkın bankadaki sırası (0 = doğru), -1 = "Bilmiyorum"
 *   denemeler[]         = biten testler, en yenisi başta: { t, sure, cevap }
 *   alistirma[ders:i]   = seçilen şıkkın bankadaki sırası (0 = doğru)
 *   gecmis[ders:i]      = o alıştırmada bugüne kadar yapılan toplam yanlış
 *   zaman[ders:i]       = alıştırmanın en son cevaplandığı an (ms); özel testte olayları zamana dizmek için
 *   tur[ders]           = dersin kaç kez sıfırlandığı (şık karıştırma tohumu)
 *   ozel.tur            = kaç özel test hazırlandığı (hem tohum hem şık karıştırma)
 *   ozel.aktif          = çözülmekte olan özel test: { t, tur, maddeler: [{k, n}], cevap: {k: şık}, konum, sure }
 *   ozel.denemeler[]    = biten özel testler, en yenisi başta: { t, sure, maddeler: [{k, n, c}] }
 *     k = madde anahtarı (test sorusu "g01", ders alıştırması "ders:i"), n = nedeni (t tekrar, y yeni, k kontrol),
 *     c = şıkkın bankadaki sırası (0 doğru, -1 "Bilmiyorum")
 *
 * "Sana özel test": havuz = 42 test sorusu + tüm ders alıştırmaları. Her madde için üç kaynaktaki (seviye testi,
 * alıştırmalar, önceki özel testler) doğru/yanlış olayları zamana dizilir; son duruma göre madde "yeni", "yanlış",
 * "doğru" ya da "sağlam" (son iki olay doğru) sayılır. Konu zayıflığı bu durumlardan, madde ağırlığı da konu
 * zayıflığından, durumdan ve seviyeden çıkar; test bu ağırlıklarla, tohuma bağlı (aynı veri + aynı tohum = aynı
 * test) olarak seçilir.
 */
(function (g) {
  var SEVIYELER = ["A1", "A2", "B1", "B2", "C1"];
  var BOLUMLER = ["gramer", "kelime", "okuma"];
  var BOLUM_AD = { gramer: "Gramer", kelime: "Kelime", okuma: "Okuma" };
  var SEVIYE_ACIKLAMA = {
    A0: "Başlangıç noktasındasın. Temel dersler hazır, oradan başlayacağız.",
    A1: "Başlangıç: tanıdık günlük ifadeleri ve çok basit cümleleri anlıyorsun.",
    A2: "Temel: kısa ve basit konularda anlaşabilir, tanıdık işleri anlatabilirsin.",
    B1: "Orta: tanıdık konularda ana fikri anlar, basit ve bağlantılı metin yazabilirsin.",
    B2: "Orta üstü: karmaşık metinleri anlar, akıcı ve doğal konuşabilirsin.",
    C1: "İleri: uzun ve zor metinleri anlar, kendini esnek ve akıcı ifade edersin."
  };
  var DURUM_SIRASI = { calis: 0, pekistir: 0, suruyor: 1, yeni: 2, "testte-iyi": 3, tamam: 4 };
  var OZEL_ADET = 15;          // bir özel testteki soru sayısı
  var OZEL_TEKRAR_ORANI = 0.5; // soruların en fazla bu kadarı daha önce yanlış yapılanlardan
  var OZEL_KONU_ORANI = 0.3;   // tek bir konudan en fazla bu oranda soru (yeterli çeşit varsa)
  var OZEL_KAYIT_SINIRI = 8;   // saklanan özel test sayısı
  var ON_ZAYIF = 0.5, ON_KANIT = 2; // kanıt azken konu zayıflığı 0,5'e yaslanır (2 sahte gözlem)

  /* ---------- karıştırma: aynı anahtar her zaman aynı sırayı verir ---------- */
  function tohum(s) {
    var h = 1779033703 ^ s.length;
    for (var i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function rastgele(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** 0..n-1 sayılarının anahtara bağlı sabit bir permütasyonu: sira[i] = ekranda i. sırada görünen şıkkın bankadaki yeri. */
  function sira(anahtar, n) {
    var r = rastgele(tohum(String(anahtar)));
    var d = [];
    for (var i = 0; i < n; i++) d.push(i);
    for (var j = n - 1; j > 0; j--) {
      var k = Math.floor(r() * (j + 1));
      var x = d[j];
      d[j] = d[k];
      d[k] = x;
    }
    return d;
  }

  /* ---------- puanlama ---------- */
  function puanla(sorular, cevaplar) {
    var s = { toplam: sorular.length, dogru: 0, yanlis: 0, bilmiyorum: 0, bos: 0, bolum: {}, seviye: {}, konu: {}, hatalar: [] };
    BOLUMLER.forEach(function (b) { s.bolum[b] = [0, 0]; });
    SEVIYELER.forEach(function (l) { s.seviye[l] = [0, 0]; });
    sorular.forEach(function (q) {
      var c = cevaplar ? cevaplar[q.id] : undefined;
      var k = s.konu[q.konu] || (s.konu[q.konu] = { d: 0, t: 0, hatalar: [] });
      s.bolum[q.bolum][1]++;
      s.seviye[q.seviye][1]++;
      k.t++;
      if (c === 0) {
        s.dogru++;
        s.bolum[q.bolum][0]++;
        s.seviye[q.seviye][0]++;
        k.d++;
        return;
      }
      if (c === -1) s.bilmiyorum++;
      else if (c === undefined) s.bos++;
      else s.yanlis++;
      s.hatalar.push({ id: q.id, secim: c === undefined ? null : c });
      k.hatalar.push(q.id);
    });
    return s;
  }

  /**
   * Seviye kararı. Bir seviye "geçilmiş" sayılır: o seviyedeki sorularının en az %60'ı doğru VE o seviye ile
   * altındaki tüm soruların en az %70'i doğru. Karar, geçilen en yüksek seviyedir. Bir üst seviyede %50 ve üzeri
   * doğru varsa "sınırda" notu düşülür.
   */
  function seviyeKarari(s) {
    var kod = "A0";
    var kumD = 0, kumT = 0;
    SEVIYELER.forEach(function (l) {
      var d = s.seviye[l][0], t = s.seviye[l][1];
      kumD += d;
      kumT += t;
      if (t > 0 && d / t >= 0.6 && kumD / kumT >= 0.7) kod = l;
    });
    var i = SEVIYELER.indexOf(kod);
    var sonraki = SEVIYELER[i + 1] || null;
    var sinirda = null;
    if (sonraki && s.seviye[sonraki][1] > 0 && s.seviye[sonraki][0] / s.seviye[sonraki][1] >= 0.5) sinirda = sonraki;
    return { kod: kod, sinirda: sinirda, etiket: etiket(kod, sinirda), aciklama: SEVIYE_ACIKLAMA[kod] };
  }
  function etiket(kod, sinirda) {
    var ad = kod === "A0" ? "A1 altı" : kod;
    return sinirda ? ad + " (" + sinirda + "'ye yakın)" : ad;
  }

  /* ---------- dersler ve çalışma planı ---------- */
  function alistirmaAnahtari(dersId, i) { return dersId + ":" + i; }

  function dersDurumu(ders, s, alistirma) {
    var c = 0, d = 0;
    for (var i = 0; i < ders.alistirma.length; i++) {
      var a = alistirma ? alistirma[alistirmaAnahtari(ders.id, i)] : undefined;
      if (a !== undefined) { c++; if (a === 0) d++; }
    }
    var tk = s && s.konu[ders.id] ? s.konu[ders.id] : null;
    var testT = tk ? tk.t : 0;
    var testYanlis = tk ? tk.t - tk.d : 0;
    var esik = Math.min(4, ders.alistirma.length);
    var oran = c ? d / c : null;
    var durum;
    if (c >= esik && oran >= 0.8) durum = "tamam";
    else if (c >= esik && oran < 0.7) durum = "pekistir";
    else if (testYanlis > 0) durum = "calis";
    else if (c > 0) durum = "suruyor";
    else if (testT > 0) durum = "testte-iyi";
    else durum = "yeni";
    return { ders: ders, durum: durum, cozulen: c, dogru: d, testT: testT, testYanlis: testYanlis };
  }

  /** Derslerin çalışma sırası: önce yanlış çıkanlar (alt seviye önce), sonra devam edenler, yeni olanlar, testte iyi çıkanlar, bitenler. */
  function dersSirasi(dersler, s, alistirma) {
    return dersler
      .map(function (ders, i) { var x = dersDurumu(ders, s, alistirma); x.sira = i; return x; })
      .sort(function (a, b) {
        if (DURUM_SIRASI[a.durum] !== DURUM_SIRASI[b.durum]) return DURUM_SIRASI[a.durum] - DURUM_SIRASI[b.durum];
        var sa = SEVIYELER.indexOf(a.ders.seviye), sb = SEVIYELER.indexOf(b.ders.seviye);
        if (sa !== sb) return sa - sb;
        if (a.testYanlis !== b.testYanlis) return b.testYanlis - a.testYanlis;
        return a.sira - b.sira;
      });
  }

  /* ---------- sana özel test: havuz ve madde durumu ---------- */

  /** Seviye testi soruları + tüm ders alıştırmaları, tek biçimde. k: test sorusu için "g01", alıştırma için "ders:i". */
  function havuz(T, D) {
    var out = [];
    T.sorular.forEach(function (q) {
      out.push({ k: q.id, kaynak: "test", bolum: q.bolum, konu: q.konu, seviye: q.seviye, metin: q.metin || null, q: q.q, o: q.o, e: q.e });
    });
    D.dersler.forEach(function (ders) {
      var bolum = ders.id === "okuma" ? "okuma" : ders.id.indexOf("kelime-") === 0 ? "kelime" : "gramer";
      ders.alistirma.forEach(function (a, i) {
        out.push({ k: alistirmaAnahtari(ders.id, i), kaynak: "ders", bolum: bolum, konu: ders.id, seviye: ders.seviye, metin: null, q: a.q, o: a.o, e: a.e });
      });
    });
    return out;
  }
  function havuzHaritasi(T, D) {
    var h = Object.create(null);
    havuz(T, D).forEach(function (m) { h[m.k] = m; });
    return h;
  }

  /**
   * Bir maddenin bugüne kadarki doğru/yanlış olayları, eskiden yeniye.
   *  - test sorusu: her seviye testi denemesi
   *  - ders alıştırması: önceki yanlışlar (zamanı bilinmez, en eskiye konur) + şimdiki cevap (zaman[] ile)
   *  - her ikisi: bitmiş özel testler
   */
  function olaylar(m, durum) {
    var ol = [];
    var sayac = 0;
    function ekle(t, c) { ol.push({ t: t, ok: c === 0, bil: c === -1, s: sayac++ }); }
    if (m.kaynak === "test") {
      durum.denemeler.forEach(function (d) { if (d.cevap[m.k] !== undefined) ekle(d.t, d.cevap[m.k]); });
    } else {
      var v = durum.alistirma[m.k];
      var yanlis = durum.gecmis[m.k] || 0;
      var eski = Math.min(5, v !== undefined && v !== 0 ? yanlis - 1 : yanlis); // şimdiki yanlış sayaca dahildir
      for (var i = 0; i < eski; i++) ekle(0, 1);
      if (v !== undefined) ekle(durum.zaman[m.k] || 0, v);
    }
    durum.ozel.denemeler.forEach(function (d) {
      d.maddeler.forEach(function (x) { if (x.k === m.k) ekle(d.t, x.c); });
    });
    ol.sort(function (a, b) { return a.t - b.t || a.s - b.s; });
    return ol;
  }

  /**
   * yeni: hiç cevaplanmadı · yanlis: son cevap yanlış (ya da "Bilmiyorum") · dogru: son cevap doğru ama henüz
   * oturmadı · saglam: son iki cevap doğru. d/y: toplam doğru/yanlış, bil: son cevap "Bilmiyorum".
   */
  function maddeDurumu(m, durum) {
    var ol = olaylar(m, durum);
    var d = 0, y = 0;
    ol.forEach(function (x) { if (x.ok) d++; else y++; });
    if (!ol.length) return { durum: "yeni", d: 0, y: 0, bil: false };
    var son = ol[ol.length - 1];
    var onceki = ol.length > 1 ? ol[ol.length - 2] : null;
    return { durum: !son.ok ? "yanlis" : onceki && onceki.ok ? "saglam" : "dogru", d: d, y: y, bil: !son.ok && son.bil };
  }

  /** Son seviye testinden çıkan seviyenin SEVIYELER'deki yeri (A1 altı = -1; test yoksa da -1). */
  function seviyeIndeksi(T, durum) {
    var d = durum.denemeler[0];
    if (!d) return -1;
    return SEVIYELER.indexOf(seviyeKarari(puanla(T.sorular, d.cevap)).kod);
  }

  /**
   * Konu konu zayıflık. Cevaplanan her madde 0 (sağlam) ile 1 (yanlış) arasında bir puan getirir:
   * yanlış 1, daha önce yanlışı olan doğru 0,5, temiz doğru 0,3, sağlam 0. Konu zayıflığı bunların ortalamasıdır;
   * kanıt azsa 0,5'e yaslanır (hiç cevap yoksa tam 0,5).
   */
  function analiz(T, D, durum) {
    var h = havuz(T, D);
    var durumlar = Object.create(null);
    var konu = Object.create(null);
    D.dersler.forEach(function (ders) { konu[ders.id] = { id: ders.id, sayi: 0, cevaplanan: 0, yanlis: 0, saglam: 0, yeni: 0, toplam: 0, zayif: 0 }; });
    h.forEach(function (m) {
      var st = maddeDurumu(m, durum);
      durumlar[m.k] = st;
      var kk = konu[m.konu];
      if (!kk) return;
      kk.sayi++;
      if (st.durum === "yeni") { kk.yeni++; return; }
      kk.cevaplanan++;
      if (st.durum === "yanlis") { kk.yanlis++; kk.toplam += 1; }
      else if (st.durum === "dogru") kk.toplam += st.y > 0 ? 0.5 : 0.3;
      else kk.saglam++;
    });
    Object.keys(konu).forEach(function (id) {
      var kk = konu[id];
      kk.zayif = (kk.toplam + ON_ZAYIF * ON_KANIT) / (kk.cevaplanan + ON_KANIT);
    });
    return { havuz: h, durum: durumlar, konu: konu, seviye: seviyeIndeksi(T, durum) };
  }

  /** Bir maddenin seçilme ağırlığı: zayıf konu × durum × seviye uygunluğu × (az önceki testte çıktıysa) ara. */
  function maddeAgirligi(m, st, a, onceki) {
    var kk = a.konu[m.konu];
    var zayif = kk ? kk.zayif : ON_ZAYIF;
    var durumKatsayisi;
    if (st.durum === "yanlis") durumKatsayisi = 3 + Math.min(1.5, 0.5 * Math.max(0, st.y - 1)) + (st.bil ? 0.5 : 0);
    else if (st.durum === "yeni") durumKatsayisi = 1.5;
    else if (st.durum === "dogru") durumKatsayisi = st.y > 0 ? 0.9 : 0.5;
    else durumKatsayisi = 0.08;
    // Seviyenin en fazla bir basamak üstüne kadar tam ağırlık; daha üstü az, çok üstü çok az. Alt seviyeler hep tam.
    var fark = SEVIYELER.indexOf(m.seviye) - a.seviye;
    var seviyeKatsayisi = fark <= 1 ? 1 : fark === 2 ? 0.35 : 0.1;
    // Bir önceki özel testte çıkan madde hemen aynı sırayla dönmesin: doğruysa iyice geri çekilir, yanlışsa az.
    var ara = 1;
    if (onceki && onceki[m.k] !== undefined) ara = onceki[m.k] === 0 ? 0.25 : 0.7;
    return zayif * zayif * durumKatsayisi * seviyeKatsayisi * ara;
  }

  /**
   * Özel testi seçer. ayar: { adet, tohum }. Aynı veri ve aynı tohumla hep aynı testi verir.
   * Sıra: önce en çok yarısı kadar "tekrar" (son cevabı yanlış olanlar), sonra yeni ve henüz oturmamış doğrular;
   * yetmezse kalan yanlışlar, en sonda sağlam olanlar. Tek konudan en fazla %30 (yetmezse gevşer).
   * Seçim ağırlıklı ve rastgeledir (Efraimidis–Spirakis), ama tohuma bağlı olduğu için tekrarlanabilir.
   * Dönen maddeler seviyeye göre kolaydan zora sıralıdır; n: t tekrar, y yeni, k kontrol.
   */
  function ozelTestUret(T, D, durum, ayar) {
    ayar = ayar || {};
    var a = analiz(T, D, durum);
    var adet = Math.max(1, Math.min(ayar.adet || OZEL_ADET, a.havuz.length));
    var r = rastgele(tohum("ozel:" + (ayar.tohum !== undefined ? ayar.tohum : durum.ozel.tur)));
    var ustSinir = Math.max(2, Math.ceil(adet * OZEL_KONU_ORANI));
    var onceki = null;
    if (durum.ozel.denemeler.length) {
      onceki = {};
      durum.ozel.denemeler[0].maddeler.forEach(function (x) { onceki[x.k] = x.c; });
    }
    var aday = a.havuz.map(function (m) {
      var st = a.durum[m.k];
      return { m: m, st: st, w: maddeAgirligi(m, st, a, onceki) };
    });
    var secilen = [];
    var secildi = Object.create(null);
    var sayac = Object.create(null);

    function sec(filtre, sayi, sinir) {
      var liste = aday
        .filter(function (c) { return !secildi[c.m.k] && c.w > 0 && filtre(c); })
        .map(function (c) { return { c: c, anahtar: Math.pow(Math.max(r(), 1e-12), 1 / c.w) }; })
        .sort(function (x, y) { return y.anahtar - x.anahtar; });
      for (var i = 0; i < liste.length && sayi > 0; i++) {
        var c = liste[i].c;
        if ((sayac[c.m.konu] || 0) >= sinir) continue;
        secildi[c.m.k] = true;
        sayac[c.m.konu] = (sayac[c.m.konu] || 0) + 1;
        secilen.push(c);
        sayi--;
      }
    }
    sec(function (c) { return c.st.durum === "yanlis"; }, Math.ceil(adet * OZEL_TEKRAR_ORANI), ustSinir);
    sec(function (c) { return c.st.durum !== "yanlis" && c.st.durum !== "saglam"; }, adet - secilen.length, ustSinir);
    [ustSinir, adet].forEach(function (sinir) {
      sec(function (c) { return c.st.durum === "yanlis"; }, adet - secilen.length, sinir);
      sec(function () { return true; }, adet - secilen.length, sinir);
    });

    secilen.forEach(function (c) { c.sirala = SEVIYELER.indexOf(c.m.seviye) + r() * 0.99; });
    secilen.sort(function (x, y) { return x.sirala - y.sirala; });
    var maddeler = secilen.map(function (c) {
      return { k: c.m.k, n: c.st.durum === "yanlis" ? "t" : c.st.durum === "yeni" ? "y" : "k" };
    });
    var konular = {};
    secilen.forEach(function (c) { konular[c.m.konu] = (konular[c.m.konu] || 0) + 1; });
    var ozet = {
      tekrar: maddeler.filter(function (x) { return x.n === "t"; }).length,
      yeni: maddeler.filter(function (x) { return x.n === "y"; }).length,
      kontrol: maddeler.filter(function (x) { return x.n === "k"; }).length,
      konular: Object.keys(konular)
        .map(function (id) { return { id: id, adet: konular[id], zayif: a.konu[id] ? a.konu[id].zayif : ON_ZAYIF }; })
        .sort(function (x, y) { return y.adet - x.adet || y.zayif - x.zayif; })
    };
    return { maddeler: maddeler, ozet: ozet, seviye: a.seviye };
  }

  /** Biten bir özel testin puanı. harita: havuzHaritasi(T, D); maddeler: [{k, n, c}]. */
  function ozelPuanla(harita, maddeler) {
    var s = { toplam: maddeler.length, dogru: 0, yanlis: 0, bilmiyorum: 0, konu: {}, neden: { t: [0, 0], y: [0, 0], k: [0, 0] }, hatalar: [] };
    maddeler.forEach(function (x) {
      var m = harita[x.k];
      var kk = s.konu[m.konu] || (s.konu[m.konu] = [0, 0]);
      kk[1]++;
      s.neden[x.n][1]++;
      if (x.c === 0) {
        s.dogru++;
        kk[0]++;
        s.neden[x.n][0]++;
      } else {
        if (x.c === -1) s.bilmiyorum++;
        else s.yanlis++;
        s.hatalar.push({ k: x.k, n: x.n, secim: x.c });
      }
    });
    return s;
  }

  /* ---------- kayıt doğrulama ---------- */
  function bosDurum() {
    return {
      v: 1, test: { cevap: {}, konum: 0, sure: 0, basladi: null, tur: 0 }, denemeler: [], alistirma: {}, gecmis: {}, zaman: {}, tur: {},
      ozel: { tur: 0, aktif: null, denemeler: [] }, ipucu: false
    };
  }
  function tamSayi(x, en, ust) { return typeof x === "number" && isFinite(x) && Math.floor(x) === x && x >= en && x <= ust; }

  /** Yerel depodan okunan ham veriyi güvenli biçime getirir; bankada olmayan id'leri ve bozuk değerleri atar. */
  function durumDogrula(ham, T, D) {
    var d = bosDurum();
    if (!ham || typeof ham !== "object" || ham.v !== 1) return d;
    var soruMap = {};
    T.sorular.forEach(function (q) { soruMap[q.id] = q; });
    var dersMap = {};
    D.dersler.forEach(function (x) { dersMap[x.id] = x; });

    function cevaplar(src) {
      var out = {};
      if (src && typeof src === "object") {
        Object.keys(src).forEach(function (id) {
          var q = soruMap[id];
          if (q && tamSayi(src[id], -1, q.o.length - 1)) out[id] = src[id];
        });
      }
      return out;
    }
    if (ham.test && typeof ham.test === "object") {
      d.test.cevap = cevaplar(ham.test.cevap);
      d.test.konum = tamSayi(ham.test.konum, 0, T.sorular.length - 1) ? ham.test.konum : 0;
      d.test.sure = tamSayi(ham.test.sure, 0, 86400) ? ham.test.sure : 0;
      d.test.basladi = tamSayi(ham.test.basladi, 1, 4e12) ? ham.test.basladi : null;
      d.test.tur = tamSayi(ham.test.tur, 0, 1000) ? ham.test.tur : 0;
    }
    if (Array.isArray(ham.denemeler)) {
      ham.denemeler.slice(0, 6).forEach(function (x) {
        if (x && tamSayi(x.t, 1, 4e12)) d.denemeler.push({ t: x.t, sure: tamSayi(x.sure, 0, 86400) ? x.sure : 0, cevap: cevaplar(x.cevap) });
      });
    }
    function alistirmaKaydi(src, hedef, yanlisMi) {
      if (!src || typeof src !== "object") return;
      Object.keys(src).forEach(function (key) {
        var p = key.lastIndexOf(":");
        var ders = dersMap[key.slice(0, p)];
        var i = Number(key.slice(p + 1));
        if (!ders || !tamSayi(i, 0, ders.alistirma.length - 1)) return;
        if (yanlisMi) { if (tamSayi(src[key], 0, 1000)) hedef[key] = src[key]; }
        else if (tamSayi(src[key], 0, ders.alistirma[i].o.length - 1)) hedef[key] = src[key];
      });
    }
    alistirmaKaydi(ham.alistirma, d.alistirma, false);
    alistirmaKaydi(ham.gecmis, d.gecmis, true);
    if (ham.tur && typeof ham.tur === "object") {
      Object.keys(ham.tur).forEach(function (id) { if (dersMap[id] && tamSayi(ham.tur[id], 0, 1000)) d.tur[id] = ham.tur[id]; });
    }
    var harita = havuzHaritasi(T, D);
    if (ham.zaman && typeof ham.zaman === "object") {
      Object.keys(ham.zaman).forEach(function (key) {
        var m = harita[key];
        if (m && m.kaynak === "ders" && tamSayi(ham.zaman[key], 1, 4e12)) d.zaman[key] = ham.zaman[key];
      });
    }
    d.ozel = ozelDogrula(ham.ozel, harita);
    d.ipucu = ham.ipucu === true;
    return d;
  }

  /** [{k, n, c?}] → havuzda olan, tekrarsız maddeler. cevapli: c de (geçerli bir şık olarak) aranır. */
  function ozelMaddeler(src, harita, cevapli) {
    var out = [];
    var gorulen = Object.create(null);
    if (!Array.isArray(src)) return out;
    src.slice(0, 60).forEach(function (x) {
      if (!x || typeof x !== "object" || typeof x.k !== "string") return;
      var m = harita[x.k];
      if (!m || gorulen[x.k]) return;
      var e = { k: x.k, n: x.n === "t" || x.n === "y" || x.n === "k" ? x.n : "y" };
      if (cevapli) {
        if (!tamSayi(x.c, -1, m.o.length - 1)) return;
        e.c = x.c;
      }
      gorulen[x.k] = true;
      out.push(e);
    });
    return out;
  }

  function ozelDogrula(ham, harita) {
    var o = { tur: 0, aktif: null, denemeler: [] };
    if (!ham || typeof ham !== "object") return o;
    o.tur = tamSayi(ham.tur, 0, 100000) ? ham.tur : 0;
    if (Array.isArray(ham.denemeler)) {
      ham.denemeler.slice(0, OZEL_KAYIT_SINIRI).forEach(function (x) {
        if (!x || typeof x !== "object" || !tamSayi(x.t, 1, 4e12)) return;
        var md = ozelMaddeler(x.maddeler, harita, true);
        if (md.length) o.denemeler.push({ t: x.t, sure: tamSayi(x.sure, 0, 86400) ? x.sure : 0, maddeler: md });
      });
    }
    var a = ham.aktif;
    if (a && typeof a === "object" && tamSayi(a.t, 1, 4e12)) {
      var md2 = ozelMaddeler(a.maddeler, harita, false);
      if (md2.length) {
        var cevap = {};
        if (a.cevap && typeof a.cevap === "object") {
          md2.forEach(function (x) { if (tamSayi(a.cevap[x.k], -1, harita[x.k].o.length - 1)) cevap[x.k] = a.cevap[x.k]; });
        }
        o.aktif = {
          t: a.t, tur: tamSayi(a.tur, 0, 100000) ? a.tur : o.tur, maddeler: md2, cevap: cevap,
          konum: tamSayi(a.konum, 0, md2.length - 1) ? a.konum : 0, sure: tamSayi(a.sure, 0, 86400) ? a.sure : 0
        };
      }
    }
    return o;
  }

  /* ---------- rapor ---------- */
  function tarihYaz(ms) {
    try {
      return new Date(ms).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return new Date(ms).toISOString();
    }
  }
  function dakika(sn) { return Math.max(1, Math.round(sn / 60)); }

  /** Raporun "sana özel testler" bölümü: her testin sonucu, son testin yanlışları ve şu anki en zayıf konular. */
  function ozelRaporu(T, D, durum, satir) {
    var harita = havuzHaritasi(T, D);
    var dersAd = {};
    D.dersler.forEach(function (x) { dersAd[x.id] = x.ad; });
    var oran = function (p) { return p[0] + "/" + p[1]; };
    satir.push("");
    satir.push("SANA ÖZEL TESTLER (" + durum.ozel.denemeler.length + " test; tekrar = daha önce yanlış yapılanlar, yeni = hiç çözülmemişler, kontrol = doğru yapılmışlar)");
    durum.ozel.denemeler.forEach(function (x, i) {
      var p = ozelPuanla(harita, x.maddeler);
      satir.push("- " + (i === 0 ? "Son test" : i + " test önce") + " (" + tarihYaz(x.t) + "): " + p.dogru + "/" + p.toplam + " doğru · " + dakika(x.sure) + " dk · tekrar " + oran(p.neden.t) + " · yeni " + oran(p.neden.y) + " · kontrol " + oran(p.neden.k));
    });
    var son = ozelPuanla(harita, durum.ozel.denemeler[0].maddeler);
    if (son.hatalar.length) {
      satir.push("Son testte yanlış yapılanlar:");
      son.hatalar.forEach(function (h) {
        var m = harita[h.k];
        var secim = h.secim === -1 ? "Bilmiyorum" : m.o[h.secim];
        satir.push("[" + m.konu + " · " + m.seviye + "] " + m.q + " → seçtiği: " + secim + " · doğru: " + m.o[0]);
      });
    }
    var a = analiz(T, D, durum);
    var zayif = Object.keys(a.konu)
      .map(function (id) { return a.konu[id]; })
      .filter(function (k) { return k.yanlis > 0; })
      .sort(function (x, y) { return y.zayif - x.zayif || y.yanlis - x.yanlis; })
      .slice(0, 5);
    satir.push(zayif.length
      ? "Şu an son cevabı yanlış olan maddelere göre en zayıf konular: " + zayif.map(function (k) { return k.id + " (" + (dersAd[k.id] || k.id) + "): " + k.yanlis + " yanlış / " + k.cevaplanan + " cevap"; }).join(" · ")
      : "Şu an son cevabı yanlış olan madde yok.");
  }

  /** Mehmet'in (ya da dersleri hazırlayan kişinin) okuyacağı düz metin rapor. */
  function rapor(T, D, durum, simdi) {
    var soruMap = {};
    T.sorular.forEach(function (q) { soruMap[q.id] = q; });
    var satir = [];
    satir.push("MERVE · İNGİLİZCE RAPORU");
    satir.push("Rapor tarihi: " + tarihYaz(simdi) + " · soru bankası sürüm " + T.surum + "/" + D.surum);
    satir.push("");
    var deneme = durum.denemeler[0];
    var s = null;
    if (!deneme) {
      satir.push("SEVİYE TESTİ: henüz çözülmedi.");
    } else {
      s = puanla(T.sorular, deneme.cevap);
      var k = seviyeKarari(s);
      satir.push("SEVİYE TESTİ (" + durum.denemeler.length + ". deneme · " + tarihYaz(deneme.t) + ")");
      satir.push("Sonuç: " + s.dogru + "/" + s.toplam + " · tahmini seviye: " + k.etiket + " · süre: " + dakika(deneme.sure) + " dk");
      satir.push("Bölümler: " + BOLUMLER.map(function (b) { return BOLUM_AD[b] + " " + s.bolum[b][0] + "/" + s.bolum[b][1]; }).join(" · "));
      satir.push("Seviyeler: " + SEVIYELER.map(function (l) { return l + " " + s.seviye[l][0] + "/" + s.seviye[l][1]; }).join(" · "));
      satir.push("Yanlış: " + s.yanlis + " · 'Bilmiyorum': " + s.bilmiyorum + " · boş: " + s.bos);
      if (durum.denemeler.length > 1) {
        satir.push("Önceki denemeler: " + durum.denemeler.slice(1).map(function (x) { return puanla(T.sorular, x.cevap).dogru + "/" + s.toplam + " (" + tarihYaz(x.t) + ")"; }).join(" · "));
      }
      satir.push("");
      satir.push("KONU BAZINDA (testte yanlış / soru)");
      var konular = Object.keys(s.konu).filter(function (id) { return s.konu[id].hatalar.length > 0; });
      konular.sort(function (a, b) { return s.konu[b].hatalar.length - s.konu[a].hatalar.length; });
      if (!konular.length) satir.push("- Yanlış yok.");
      konular.forEach(function (id) {
        var ders = D.dersler.filter(function (x) { return x.id === id; })[0];
        satir.push("- " + id + (ders ? " (" + ders.ad + ", " + ders.seviye + ")" : "") + ": " + s.konu[id].hatalar.length + "/" + s.konu[id].t);
      });
      satir.push("");
      satir.push("TESTTE YANLIŞ YAPILAN SORULAR");
      if (!s.hatalar.length) satir.push("- Yok.");
      s.hatalar.forEach(function (h) {
        var q = soruMap[h.id];
        var secim = h.secim === null ? "boş bıraktı" : h.secim === -1 ? "Bilmiyorum" : q.o[h.secim];
        satir.push("[" + q.id + " · " + q.seviye + " · " + q.konu + "] " + q.q + " → seçtiği: " + secim + " · doğru: " + q.o[0]);
      });
    }
    satir.push("");
    satir.push("DERS ALIŞTIRMALARI");
    var bir = false;
    D.dersler.forEach(function (ders) {
      var c = 0, d = 0, yanlisSatirlari = [], tekrar = 0;
      ders.alistirma.forEach(function (a, i) {
        var key = alistirmaAnahtari(ders.id, i);
        var v = durum.alistirma[key];
        if (v !== undefined) {
          c++;
          if (v === 0) d++;
          else yanlisSatirlari.push("  · " + a.q + " → seçtiği: " + a.o[v] + " · doğru: " + a.o[0]);
        }
        if ((durum.gecmis[key] || 0) > 1) tekrar++;
      });
      var topYanlis = 0;
      ders.alistirma.forEach(function (a, i) { topYanlis += durum.gecmis[alistirmaAnahtari(ders.id, i)] || 0; });
      if (!c && !topYanlis) return;
      bir = true;
      satir.push("- " + ders.id + " (" + ders.ad + "): " + c + "/" + ders.alistirma.length + " çözüldü, " + d + " doğru" + (topYanlis ? " · bugüne kadar toplam " + topYanlis + " yanlış" : "") + (tekrar ? " · " + tekrar + " soruda birden çok kez yanlış" : ""));
      yanlisSatirlari.forEach(function (x) { satir.push(x); });
    });
    if (!bir) satir.push("- Henüz alıştırma çözülmedi.");
    if (durum.ozel.denemeler.length) ozelRaporu(T, D, durum, satir);
    if (s) {
      satir.push("");
      satir.push("ÇALIŞMA SIRASI (şimdiki öneri)");
      dersSirasi(D.dersler, s, durum.alistirma)
        .filter(function (x) { return x.durum === "calis" || x.durum === "pekistir"; })
        .forEach(function (x) { satir.push("- " + x.ders.id + " (" + x.ders.ad + "): " + (x.durum === "pekistir" ? "alıştırmada takıldı" : "testte " + x.testYanlis + " yanlış")); });
    }
    return satir.join("\n");
  }

  g.MerveMotor = {
    SEVIYELER: SEVIYELER, BOLUMLER: BOLUMLER, BOLUM_AD: BOLUM_AD, SEVIYE_ACIKLAMA: SEVIYE_ACIKLAMA,
    sira: sira, puanla: puanla, seviyeKarari: seviyeKarari, dersDurumu: dersDurumu, dersSirasi: dersSirasi,
    alistirmaAnahtari: alistirmaAnahtari, bosDurum: bosDurum, durumDogrula: durumDogrula, rapor: rapor, tarihYaz: tarihYaz, dakika: dakika,
    OZEL_ADET: OZEL_ADET, OZEL_KAYIT_SINIRI: OZEL_KAYIT_SINIRI,
    havuz: havuz, havuzHaritasi: havuzHaritasi, maddeDurumu: maddeDurumu, analiz: analiz, ozelTestUret: ozelTestUret, ozelPuanla: ozelPuanla
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
