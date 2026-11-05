/* Merve İngilizce: puanlama, seviye kararı, çalışma planı ve rapor.
 * DOM ve tarayıcı API'si kullanmaz; hepsi saf fonksiyondur, bu yüzden scripts/merve-ingilizce-test.mjs
 * ile Node'da denenir. uygulama.js yalnızca ekranı çizer ve kayıt tutar.
 *
 * Kayıt biçimi (localStorage "merve-ingilizce:v1"):
 *   test.cevap[id]      = şıkkın bankadaki sırası (0 = doğru), -1 = "Bilmiyorum"
 *   denemeler[]         = biten testler, en yenisi başta: { t, sure, cevap }
 *   alistirma[ders:i]   = seçilen şıkkın bankadaki sırası (0 = doğru)
 *   gecmis[ders:i]      = o alıştırmada bugüne kadar yapılan toplam yanlış
 *   tur[ders]           = dersin kaç kez sıfırlandığı (şık karıştırma tohumu)
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

  /* ---------- kayıt doğrulama ---------- */
  function bosDurum() {
    return { v: 1, test: { cevap: {}, konum: 0, sure: 0, basladi: null, tur: 0 }, denemeler: [], alistirma: {}, gecmis: {}, tur: {}, ipucu: false };
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
    d.ipucu = ham.ipucu === true;
    return d;
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
    alistirmaAnahtari: alistirmaAnahtari, bosDurum: bosDurum, durumDogrula: durumDogrula, rapor: rapor, tarihYaz: tarihYaz, dakika: dakika
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
