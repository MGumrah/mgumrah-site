/* Merve İngilizce: ekranlar ve kayıt. Mantık motor.js'te, içerik sorular.js ve dersler.js'te.
 * Her şey bu tarayıcının localStorage'ında kalır; sunucuya hiçbir şey gönderilmez.
 * Metinler innerHTML ile değil, DOM düğümleriyle yazılır (içerik küçük bir işaretleme dili kullanır). */
(function () {
  "use strict";

  var T = window.MERVE_TEST, D = window.MERVE_DERSLER, M = window.MerveMotor;
  var ANAHTAR = "merve-ingilizce:v1";
  var kok = document.getElementById("app");
  var navKutu = document.getElementById("nav");
  var depoAcik = true;
  var durum = yukle();
  var soruZamani = null;
  var sonRota = null;

  var dersMap = {};
  D.dersler.forEach(function (d) { dersMap[d.id] = d; });
  var soruMap = {};
  T.sorular.forEach(function (q) { soruMap[q.id] = q; });

  /* ---------------------------------------------------------------- kayıt */
  function yukle() {
    try { return M.durumDogrula(JSON.parse(localStorage.getItem(ANAHTAR)), T, D); }
    catch (e) { return M.bosDurum(); }
  }
  function kaydet() {
    try { localStorage.setItem(ANAHTAR, JSON.stringify(durum)); depoAcik = true; }
    catch (e) { depoAcik = false; }
  }
  kaydet();

  /* ---------------------------------------------------------------- DOM yardımcıları */
  function ekle(n, k) {
    if (k === null || k === undefined || k === false) return;
    if (Array.isArray(k)) { k.forEach(function (x) { ekle(n, x); }); return; }
    if (typeof k === "string" || typeof k === "number") n.appendChild(document.createTextNode(String(k)));
    else n.appendChild(k);
  }
  function el(tag, ozellik, cocuk) {
    var n = document.createElement(tag);
    if (ozellik) {
      Object.keys(ozellik).forEach(function (a) {
        var v = ozellik[a];
        if (v === null || v === undefined || v === false) return;
        if (a === "class") n.className = v;
        else if (a === "text") n.textContent = v;
        else if (a.slice(0, 2) === "on") n.addEventListener(a.slice(2), v);
        else n.setAttribute(a, v === true ? "" : v);
      });
    }
    ekle(n, cocuk);
    return n;
  }
  var ISARET = /(<br>|<i>.*?<\/i>|<code>.*?<\/code>|\*\*.+?\*\*|`.+?`|\{\{.+?\}\})/;
  /** **kalın**, `kod`, {{İngilizce örnek}}, <i>, <code>, <br> → güvenli düğümler. */
  function isaretle(s) {
    var f = document.createDocumentFragment();
    String(s).split(ISARET).forEach(function (p) {
      if (!p) return;
      if (p === "<br>") f.appendChild(document.createElement("br"));
      else if (p.indexOf("<i>") === 0) f.appendChild(el("i", { text: p.slice(3, -4) }));
      else if (p.indexOf("<code>") === 0) f.appendChild(el("code", { text: p.slice(6, -7) }));
      else if (p.indexOf("**") === 0 && p.length > 4) f.appendChild(el("b", { text: p.slice(2, -2) }));
      else if (p.charAt(0) === "`" && p.length > 2) f.appendChild(el("code", { text: p.slice(1, -1) }));
      else if (p.indexOf("{{") === 0) f.appendChild(el("span", { class: "en", text: p.slice(2, -2) }));
      else f.appendChild(document.createTextNode(p));
    });
    return f;
  }
  /** "I ___ tea" → boşluk çizgili düğümler. */
  function bosluklu(s) {
    var parcalar = String(s).split("___");
    var f = document.createDocumentFragment();
    parcalar.forEach(function (p, i) {
      f.appendChild(document.createTextNode(p));
      if (i < parcalar.length - 1) f.appendChild(el("span", { class: "bosluk", text: "   " }));
    });
    return f;
  }
  function git(hedef) { location.hash = hedef; }
  function dugme(metin, tur, tikla, ek) {
    return el("button", Object.assign({ type: "button", class: "dugme" + (tur ? " " + tur : ""), onclick: tikla }, ek || {}), metin);
  }
  function baglanti(metin, href, tur) { return el("a", { class: "dugme" + (tur ? " " + tur : ""), href: href }, metin); }

  /* ---------------------------------------------------------------- yönlendirme */
  var SEKMELER = [["ana", "Ana"], ["test", "Test"], ["sonuc", "Sonuç"], ["dersler", "Dersler"], ["rapor", "Rapor"]];

  function rota() {
    var p = location.hash.replace(/^#\/?/, "").split("/");
    var ad = p[0] || "ana";
    return { ad: ad, arg: p[1] || null };
  }

  function navCiz(r) {
    navKutu.textContent = "";
    var aktif = r.ad === "ders" ? "dersler" : r.ad;
    SEKMELER.forEach(function (s) {
      navKutu.appendChild(el("a", { href: "#/" + (s[0] === "ana" ? "" : s[0]), "aria-current": aktif === s[0] ? "page" : null }, s[1]));
    });
  }

  function ciz() {
    var r = rota();
    // Testten çıkarken süreyi kaydet.
    if (r.ad !== "test") sureEkle();
    kok.textContent = "";
    navCiz(r);
    var sayfa = { ana: sayfaAna, test: sayfaTest, sonuc: sayfaSonuc, dersler: sayfaDersler, ders: sayfaDers, rapor: sayfaRapor }[r.ad] || sayfaAna;
    sayfa(r.arg);
    var anahtar = r.ad + ":" + (r.arg || "");
    if (anahtar !== sonRota) window.scrollTo(0, 0);
    sonRota = anahtar;
  }
  window.addEventListener("hashchange", ciz);

  /* ---------------------------------------------------------------- süre */
  function sureEkle() {
    if (soruZamani) {
      durum.test.sure += Math.min(180, Math.max(0, Math.round((Date.now() - soruZamani) / 1000)));
      soruZamani = null;
      kaydet();
    }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { sureEkle(); }
    else if (rota().ad === "test" && durum.test.basladi) { soruZamani = Date.now(); }
  });
  window.addEventListener("pagehide", sureEkle);

  /* ---------------------------------------------------------------- yardımcılar */
  function testBitti() { return durum.denemeler.length > 0; }
  function sonSonuc() {
    var d = durum.denemeler[0];
    if (!d) return null;
    var s = M.puanla(T.sorular, d.cevap);
    return { deneme: d, s: s, k: M.seviyeKarari(s) };
  }
  function cevapSayisi() { return Object.keys(durum.test.cevap).length; }
  function iphoneMi() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function ekranUygulamasi() {
    return window.navigator.standalone === true || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  }
  function oranCubugu(ad, d, t) {
    return el("div", { class: "bolum-bar" }, [
      el("span", { class: "ad", text: ad }),
      el("span", { class: "cubuk" }, el("i", { style: "width:" + (t ? Math.round((d / t) * 100) : 0) + "%" })),
      el("span", { class: "sy", text: d + " / " + t })
    ]);
  }
  function depoUyarisi() {
    return depoAcik ? null : el("div", { class: "ipucu" }, "Bu tarayıcıda kayıt yapılamıyor (gizli pencere olabilir). Cevapların sayfa kapanınca silinir; çalışmaya normal bir pencereden devam et.");
  }
  function durumMetni(x) {
    switch (x.durum) {
      case "calis": return "Testte " + x.testYanlis + " yanlış · çalışılacak";
      case "pekistir": return "Alıştırmada takıldın (" + x.dogru + " / " + x.cozulen + " doğru) · pekiştir";
      case "suruyor": return "Devam ediyor · " + x.cozulen + " / " + x.ders.alistirma.length + " çözüldü";
      case "testte-iyi": return "Testte hepsi doğru";
      case "tamam": return "Tamamlandı · " + x.dogru + " / " + x.cozulen + " doğru";
      default: return "Yeni";
    }
  }
  function dersKarti(x) {
    return el("a", { class: "ders " + x.durum, href: "#/ders/" + x.ders.id }, [
      el("b", { text: x.ders.ad }), el("span", { class: "chip", text: x.ders.seviye }),
      el("div", { class: "d", text: durumMetni(x) })
    ]);
  }

  /* ---------------------------------------------------------------- Ana */
  function sayfaAna() {
    kok.appendChild(el("h1", { text: "İngilizce" }));
    kok.appendChild(el("p", { class: "muted" }, "Merve'nin kişisel İngilizce çalışma sayfası: önce seviye testi, sonra yanlışlarına göre ders."));
    ekle(kok, depoUyarisi());

    if (iphoneMi() && !ekranUygulamasi() && !durum.ipucu) {
      kok.appendChild(el("div", { class: "kart vurgu" }, [
        el("b", { text: "iPhone ana ekranına ekle" }),
        el("p", { class: "muted" }, "Safari'de Paylaş düğmesine (kareden yukarı çıkan ok) dokun, Ana Ekrana Ekle'yi seç. Simgeden açınca sayfa uygulama gibi tam ekran açılır. Safari'de verdiğin cevaplar ana ekran uygulamasına geçmez; ekledikten sonra hep simgeden aç."),
        el("button", { class: "lnk", type: "button", onclick: function () { durum.ipucu = true; kaydet(); ciz(); } }, "Anladım, gösterme")
      ]));
    }

    var sonuc = sonSonuc();
    var kart = el("div", { class: "kart vurgu" });
    if (sonuc) {
      kart.appendChild(el("h2", { text: "Seviyen" }));
      kart.appendChild(el("div", { class: "rozet", text: sonuc.k.etiket }));
      kart.appendChild(el("p", { class: "muted" }, sonuc.k.aciklama));
      kart.appendChild(el("p", { text: sonuc.s.dogru + " / " + sonuc.s.toplam + " doğru · " + M.tarihYaz(sonuc.deneme.t) }));
      kart.appendChild(el("div", { class: "satir" }, [baglanti("Sonucu aç", "#/sonuc", "ana"), baglanti("Dersler", "#/dersler")]));
    } else if (durum.test.basladi) {
      kart.appendChild(el("h2", { text: "Seviye testi devam ediyor" }));
      kart.appendChild(el("p", { class: "muted" }, cevapSayisi() + " / " + T.sorular.length + " soru cevaplandı. Kaldığın yerden devam edebilirsin."));
      kart.appendChild(el("div", { class: "satir" }, baglanti("Teste devam et", "#/test", "ana")));
    } else {
      kart.appendChild(el("h2", { text: "1. Seviye testi" }));
      kart.appendChild(el("p", { class: "muted" }, "42 soru, kolaydan zora. Gramer, kelime ve okuma. Yaklaşık 25–30 dakika. Sonunda seviyeni ve hangi konulardan başlayacağını görürsün."));
      kart.appendChild(el("div", { class: "satir" }, baglanti("Teste başla", "#/test", "ana")));
    }
    kok.appendChild(kart);

    var sira = M.dersSirasi(D.dersler, sonuc ? sonuc.s : null, durum.alistirma);
    if (sonuc) {
      var oncelik = sira.filter(function (x) { return x.durum === "calis" || x.durum === "pekistir"; }).slice(0, 3);
      var k2 = el("div", { class: "kart" }, el("h2", { text: oncelik.length ? "Önce şunlara bak" : "Dersler" }));
      if (oncelik.length) k2.appendChild(el("div", { class: "dersler" }, oncelik.map(dersKarti)));
      else k2.appendChild(el("p", { class: "muted" }, "Testte öne çıkan bir eksik yok. Yine de derslerden istediğini açıp alıştırma çözebilirsin."));
      k2.appendChild(el("div", { class: "satir" }, baglanti("Tüm dersler", "#/dersler")));
      kok.appendChild(k2);
    }

    kok.appendChild(el("div", { class: "kart" }, [
      el("h2", { text: "Nasıl çalışıyoruz?" }),
      el("div", { class: "adim" }, [el("b", { text: "1" }), el("div", {}, "Seviye testini çöz. Test sırasında doğru-yanlış gösterilmez.")]),
      el("div", { class: "adim" }, [el("b", { text: "2" }), el("div", {}, "Sonuçta yanlışların konularına göre bir çalışma sırası çıkar. Her ders kısa bir kural özeti ve alıştırmalardan oluşur.")]),
      el("div", { class: "adim" }, [el("b", { text: "3" }), el("div", {}, "Alıştırmalarda takıldığın konular listede yukarıda kalır. Rapor sayfasından çalışmanı Mehmet'e gönderebilirsin; dersleri senin hatalarına göre birlikte şekillendiririz.")])
    ]));
  }

  /* ---------------------------------------------------------------- Test */
  function sayfaTest() {
    var t = durum.test;
    if (!t.basladi) { testGiris(); return; }
    var q = T.sorular[t.konum];
    soruZamani = Date.now();

    var oran = Math.round(((t.konum + 1) / T.sorular.length) * 100);
    kok.appendChild(el("div", { class: "kart" }, [
      el("div", { class: "ust" }, [el("span", { text: "Soru " + (t.konum + 1) + " / " + T.sorular.length }), el("span", { text: M.BOLUM_AD[q.bolum] })]),
      el("div", { class: "ilerleme", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(T.sorular.length), "aria-valuenow": String(t.konum + 1) }, el("i", { style: "width:" + oran + "%" })),
      q.metin ? el("div", { class: "metin" }, [el("div", { class: "l", text: T.metinler[q.metin].baslik }), T.metinler[q.metin].metin]) : null,
      el("div", { class: "soru" }, bosluklu(q.q)),
      secenekler(q),
      el("div", { class: "satir" }, [
        dugme("Geri", "", function () { gez(-1); }, t.konum === 0 ? { disabled: true } : null),
        t.konum < T.sorular.length - 1
          ? dugme("İleri", "ana", function () { gez(1); }, q.id in t.cevap ? null : { disabled: true })
          : dugme("Testi bitir", "ana", bitir, q.id in t.cevap ? null : { disabled: true })
      ]),
      el("p", { class: "muted", style: "margin-top:14px;font-size:.88rem" }, "Emin değilsen tahmin etme, 'Bilmiyorum' seç. İstediğin zaman çıkabilirsin; kaldığın yerden devam edersin."),
      el("div", { class: "satir", style: "margin-top:0" }, [
        el("button", { class: "lnk", type: "button", onclick: function () { sureEkle(); git("#/"); } }, "Şimdilik çık")
      ])
    ]));
  }

  function secenekler(q) {
    var t = durum.test;
    var sir = M.sira(q.id + ":" + t.tur, q.o.length);
    var secili = t.cevap[q.id];
    var kutu = el("div", { class: "opts", role: "group", "aria-label": "Cevap şıkları" });
    sir.forEach(function (orijinal) {
      kutu.appendChild(el("button", { type: "button", class: secili === orijinal ? "secili" : "", "aria-pressed": secili === orijinal ? "true" : "false", onclick: function () { cevapla(q, orijinal); } }, q.o[orijinal]));
    });
    kutu.appendChild(el("button", { type: "button", class: "bil" + (secili === -1 ? " secili" : ""), "aria-pressed": secili === -1 ? "true" : "false", onclick: function () { cevapla(q, -1); } }, "Bilmiyorum"));
    return kutu;
  }

  function cevapla(q, secim) {
    durum.test.cevap[q.id] = secim;
    kaydet();
    // Sadece şıkları ve ileri düğmesini yenilemek için sayfayı yeniden çiz; süreyi bozmadan.
    var onceki = soruZamani;
    kok.textContent = "";
    sayfaTest();
    soruZamani = onceki || soruZamani;
  }

  function gez(yon) {
    sureEkle();
    durum.test.konum = Math.max(0, Math.min(T.sorular.length - 1, durum.test.konum + yon));
    kaydet();
    ciz();
    window.scrollTo(0, 0);
  }

  function testGiris() {
    ekle(kok, depoUyarisi());
    var kart = el("div", { class: "kart vurgu" });
    kart.appendChild(el("h1", { text: "Seviye testi", style: "margin-top:0" }));
    if (testBitti()) {
      kart.appendChild(el("p", { class: "muted" }, "Daha önce bir test çözdün. Yeniden çözersen önceki sonucun silinmez; ilerlemeni karşılaştırırız. Sorular aynı, şıkların sırası değişir."));
    }
    kart.appendChild(el("ul", { class: "l" }, [
      el("li", {}, "42 soru: gramer, kelime, okuma. Kolaydan zora doğru gider."),
      el("li", {}, "Yaklaşık 25–30 dakika. Acele etme, her soruyu bir kez dikkatle oku."),
      el("li", {}, "Test sırasında doğru-yanlış gösterilmez. Sonunda her sorunun açıklamasını görürsün."),
      el("li", {}, "Emin değilsen tahmin etme, 'Bilmiyorum' seç. Tahminle şanslı çıkan sorular seviyeni olduğundan yüksek gösterir ve dersleri yanlış yere kaydırır."),
      el("li", {}, "Sözlük ve çeviri kullanma. İstediğin zaman çıkıp devam edebilirsin.")
    ]));
    kart.appendChild(el("div", { class: "satir" }, dugme(testBitti() ? "Yeniden başla" : "Başla", "ana", function () {
      durum.test = { cevap: {}, konum: 0, sure: 0, basladi: Date.now(), tur: durum.test.tur };
      kaydet();
      ciz();
      window.scrollTo(0, 0);
    })));
    if (testBitti()) kart.appendChild(el("div", { class: "satir" }, baglanti("Önceki sonucu aç", "#/sonuc")));
    kok.appendChild(kart);
  }

  function bitir() {
    sureEkle();
    var t = durum.test;
    var bos = T.sorular.length - cevapSayisi();
    if (bos > 0 && !window.confirm(bos + " soru boş. Boş sorular 'Bilmiyorum' sayılır. Testi bitirelim mi?")) return;
    var cevap = {};
    T.sorular.forEach(function (q) { cevap[q.id] = q.id in t.cevap ? t.cevap[q.id] : -1; });
    durum.denemeler.unshift({ t: Date.now(), sure: t.sure, cevap: cevap });
    durum.denemeler = durum.denemeler.slice(0, 6);
    durum.test = { cevap: {}, konum: 0, sure: 0, basladi: null, tur: t.tur + 1 };
    kaydet();
    git("#/sonuc");
  }

  /* ---------------------------------------------------------------- Sonuç */
  function sayfaSonuc() {
    var sonuc = sonSonuc();
    if (!sonuc) {
      kok.appendChild(el("h1", { text: "Sonuç" }));
      kok.appendChild(el("div", { class: "kart" }, [el("p", {}, "Henüz bir test çözmedin. Sonuç sayfası testi bitirince dolar."), baglanti("Teste git", "#/test", "ana")]));
      return;
    }
    var s = sonuc.s, k = sonuc.k, d = sonuc.deneme;
    kok.appendChild(el("h1", { text: "Sonucun" }));

    var ana = el("div", { class: "kart vurgu" }, [
      el("div", { class: "muted", text: "Tahmini seviye" }),
      el("div", { class: "rozet", text: k.etiket }),
      el("p", {}, k.aciklama),
      el("p", { class: "muted" }, s.dogru + " / " + s.toplam + " doğru · " + M.dakika(d.sure) + " dk · " + M.tarihYaz(d.t))
    ]);
    if (durum.denemeler.length > 1) {
      var onceki = M.puanla(T.sorular, durum.denemeler[1].cevap);
      var fark = s.dogru - onceki.dogru;
      ana.appendChild(el("p", { class: "muted" }, "Önceki deneme: " + onceki.dogru + " / " + onceki.toplam + (fark > 0 ? " · " + fark + " doğru artış" : fark < 0 ? " · " + -fark + " doğru azalış" : " · aynı")));
    }
    kok.appendChild(ana);

    var dakika = M.dakika(d.sure);
    var notlar = [];
    if (d.sure < 12 * 60 && s.dogru < s.toplam - 2) notlar.push("Testi " + dakika + " dakikada bitirdin; önerilen süre 25–30 dakika. Acele edince bilmediğin yerde de bildiğin yerde de hata artar. Bir sonraki denemede soruları bir kez daha kontrol etmeyi dene.");
    if (s.bilmiyorum > 0) notlar.push(s.bilmiyorum + " soruda 'Bilmiyorum' dedin. Bu hata sayılır ama dersleri doğru yere yönlendirmek için en değerli bilgi budur.");
    if (notlar.length) kok.appendChild(el("div", { class: "ipucu" }, notlar.map(function (n) { return el("p", {}, n); })));

    var kart = el("div", { class: "kart" }, [el("h2", { text: "Nerede kaybettin?" })]);
    kart.appendChild(el("h3", { text: "Bölümler" }));
    M.BOLUMLER.forEach(function (b) { kart.appendChild(oranCubugu(M.BOLUM_AD[b], s.bolum[b][0], s.bolum[b][1])); });
    kart.appendChild(el("h3", { text: "Seviyeler" }));
    M.SEVIYELER.forEach(function (l) { kart.appendChild(oranCubugu(l, s.seviye[l][0], s.seviye[l][1])); });
    kart.appendChild(el("p", { class: "muted", style: "margin-top:10px;font-size:.9rem" }, "Üst seviyelerde birkaç doğru, o seviyeye çıktığın anlamına gelmez. Seviye, bir basamaktaki soruların çoğunu ve altındakileri tutarlı yapmakla belirlenir."));
    kok.appendChild(kart);

    var sira = M.dersSirasi(D.dersler, s, durum.alistirma).filter(function (x) { return x.durum === "calis" || x.durum === "pekistir"; });
    var plan = el("div", { class: "kart" }, [el("h2", { text: "Önce bunlara bak" })]);
    if (!sira.length) plan.appendChild(el("p", { class: "muted" }, "Her konuda doğru çıktın. Dersler sayfasından istediğin konuyu pekiştirebilirsin."));
    else {
      plan.appendChild(el("p", { class: "muted" }, "Yanlış çıkan konular, temelden üste doğru sıralandı. Alt seviye konular genelde üsttekilerin temelidir; sırayla gitmek en çabuk sonuç verir."));
      plan.appendChild(el("div", { class: "dersler" }, sira.slice(0, 5).map(dersKarti)));
      if (sira.length > 5) plan.appendChild(el("p", { class: "muted", style: "margin:10px 0 0" }, "Ayrıca " + (sira.length - 5) + " konu daha var; hepsi Dersler sayfasında. Önce yukarıdaki beşini bitirmek yeter."));
    }
    plan.appendChild(el("div", { class: "satir" }, baglanti("Tüm dersler", "#/dersler", sira.length ? "ana" : "")));
    kok.appendChild(plan);

    var yanlis = el("div", { class: "kart" }, [el("h2", { text: "Yanlışların (" + s.hatalar.length + ")" })]);
    if (!s.hatalar.length) yanlis.appendChild(el("p", { class: "muted" }, "Yanlış yok."));
    s.hatalar.forEach(function (h) {
      var q = soruMap[h.id];
      var secim = h.secim === null || h.secim === -1 ? "Bilmiyorum" : q.o[h.secim];
      yanlis.appendChild(el("div", { class: "yanlis" }, [
        el("div", { class: "k", text: M.BOLUM_AD[q.bolum] + " · " + q.seviye + " · " + (dersMap[q.konu] ? dersMap[q.konu].ad : q.konu) }),
        el("div", { class: "en" }, bosluklu(q.q)),
        el("div", {}, ["Senin cevabın: ", el("b", { text: secim }), " · Doğrusu: ", el("b", { text: q.o[0] })]),
        el("div", { class: "muted" }, q.e),
        el("a", { href: "#/ders/" + q.konu }, "Dersi aç")
      ]));
    });
    kok.appendChild(yanlis);

    kok.appendChild(el("div", { class: "satir" }, [baglanti("Raporu gönder", "#/rapor", "ana"), baglanti("Testi yeniden çöz", "#/test")]));
  }

  /* ---------------------------------------------------------------- Dersler */
  function sayfaDersler() {
    var sonuc = sonSonuc();
    kok.appendChild(el("h1", { text: "Dersler" }));
    if (!sonuc) kok.appendChild(el("p", { class: "muted" }, "Henüz seviye testini çözmedin. Testi çözünce dersler yanlışlarına göre sıralanır. İstersen şimdi de istediğin dersi açabilirsin."));
    else kok.appendChild(el("p", { class: "muted" }, "Yanlış çıkan ve alıştırmada takıldığın konular üstte. Alıştırmaları çözdükçe sıra kendiliğinden güncellenir."));
    var sira = M.dersSirasi(D.dersler, sonuc ? sonuc.s : null, durum.alistirma);
    var gruplar = [
      ["Önce bunlar", function (x) { return x.durum === "calis" || x.durum === "pekistir"; }],
      ["Devam eden ve yeni dersler", function (x) { return x.durum === "suruyor" || x.durum === "yeni"; }],
      ["Testte tamamdı", function (x) { return x.durum === "testte-iyi"; }],
      ["Tamamlananlar", function (x) { return x.durum === "tamam"; }]
    ];
    gruplar.forEach(function (g) {
      var liste = sira.filter(g[1]);
      if (!liste.length) return;
      kok.appendChild(el("h3", { text: g[0] }));
      kok.appendChild(el("div", { class: "dersler" }, liste.map(dersKarti)));
    });
  }

  /* ---------------------------------------------------------------- Ders */
  function sayfaDers(id) {
    var ders = dersMap[id];
    if (!ders) { git("#/dersler"); return; }
    var sonuc = sonSonuc();
    kok.appendChild(el("p", { style: "margin:18px 0 0" }, el("a", { href: "#/dersler" }, "← Dersler")));
    kok.appendChild(el("h1", { style: "margin-top:8px" }, [ders.ad, el("span", { class: "chip", text: ders.seviye })]));
    kok.appendChild(el("p", { class: "muted" }, ders.ozet));

    // Testte bu konudan yanlışlar (kısa hatırlatma kutusu).
    if (sonuc && sonuc.s.konu[id] && sonuc.s.konu[id].hatalar.length) {
      var kutu = el("div", { class: "mine" }, el("p", {}, el("b", { text: "Testte bu konudan yaptığın yanlışlar" })));
      sonuc.s.hatalar.filter(function (h) { return soruMap[h.id].konu === id; }).forEach(function (h) {
        var q = soruMap[h.id];
        var secim = h.secim === null || h.secim === -1 ? "Bilmiyorum" : q.o[h.secim];
        kutu.appendChild(el("p", {}, [bosluklu(q.q), " → ", el("b", { text: secim }), ", doğrusu ", el("b", { text: q.o[0] })]));
      });
      kok.appendChild(kutu);
    }

    var kart = el("div", { class: "kart" });
    ders.blok.forEach(function (b) { kart.appendChild(blokCiz(b)); });
    kok.appendChild(kart);

    var alis = el("div", { class: "kart vurgu" });
    var baslikSatiri = el("h2", { text: "Alıştırmalar" });
    var ozet = el("p", { class: "muted" });
    alis.appendChild(baslikSatiri);
    alis.appendChild(ozet);
    var liste = el("div");
    alis.appendChild(liste);
    // Yalnızca yanlış yapılanları açar; doğrular kilitli kalır. Yanlış sayacı rapor için korunur.
    var yanlisDugmesi = dugme("Yanlışlarımı tekrar çöz", "ana", function () {
      ders.alistirma.forEach(function (a, i) {
        var key = M.alistirmaAnahtari(ders.id, i);
        if (durum.alistirma[key] !== undefined && durum.alistirma[key] !== 0) delete durum.alistirma[key];
      });
      durum.tur[ders.id] = (durum.tur[ders.id] || 0) + 1;
      kaydet();
      ciz();
    });
    yanlisDugmesi.hidden = true;

    function ozetYaz() {
      var c = 0, dg = 0;
      ders.alistirma.forEach(function (a, i) {
        var v = durum.alistirma[M.alistirmaAnahtari(ders.id, i)];
        if (v !== undefined) { c++; if (v === 0) dg++; }
      });
      ozet.textContent = c ? c + " / " + ders.alistirma.length + " çözüldü · " + dg + " doğru" + (c === ders.alistirma.length && dg === c ? " · hepsi doğru" : "") : "Cevap verince hemen doğru-yanlış ve Türkçe açıklama görürsün.";
      yanlisDugmesi.hidden = !(c - dg > 0);
    }
    ders.alistirma.forEach(function (a, i) { liste.appendChild(alistirmaCiz(ders, i, ozetYaz)); });
    ozetYaz();
    alis.appendChild(el("div", { class: "satir" }, yanlisDugmesi));
    alis.appendChild(el("div", { class: "satir" }, el("button", { class: "lnk", type: "button", onclick: function () {
      if (!window.confirm("Bu dersin alıştırma cevapları silinsin mi? Yanlış sayacı rapor için kalır.")) return;
      ders.alistirma.forEach(function (a, i) { delete durum.alistirma[M.alistirmaAnahtari(ders.id, i)]; });
      durum.tur[ders.id] = (durum.tur[ders.id] || 0) + 1;
      kaydet();
      ciz();
    } }, "Bu dersin alıştırmalarını sıfırla")));
    kok.appendChild(alis);
    kok.appendChild(el("div", { class: "satir" }, baglanti("Tüm dersler", "#/dersler")));
  }

  function alistirmaCiz(ders, i, ozetYaz) {
    var a = ders.alistirma[i];
    var key = M.alistirmaAnahtari(ders.id, i);
    var kutu = el("div", { class: "yanlis", style: "border-top:" + (i ? "1px dashed var(--line)" : "0") });
    function yaz() {
      kutu.textContent = "";
      var verilen = durum.alistirma[key];
      kutu.appendChild(el("div", { class: "en" }, [(i + 1) + ". ", bosluklu(a.q)]));
      var opts = el("div", { class: "opts", style: "margin-top:8px" });
      M.sira(key + ":" + (durum.tur[ders.id] || 0), a.o.length).forEach(function (orijinal) {
        var sinif = "";
        if (verilen !== undefined) sinif = orijinal === 0 ? "good" : orijinal === verilen ? "wrong" : "";
        opts.appendChild(el("button", { type: "button", class: sinif, disabled: verilen !== undefined, onclick: function () {
          durum.alistirma[key] = orijinal;
          if (orijinal !== 0) durum.gecmis[key] = (durum.gecmis[key] || 0) + 1;
          kaydet();
          yaz();
          ozetYaz();
        } }, a.o[orijinal]));
      });
      kutu.appendChild(opts);
      if (verilen !== undefined) {
        kutu.appendChild(el("div", { class: "fb " + (verilen === 0 ? "ok" : "no"), role: "status" }, [el("b", { text: verilen === 0 ? "Doğru. " : "Yanlış. Doğrusu: " + a.o[0] + ". " }), a.e]));
      }
    }
    yaz();
    return kutu;
  }

  function blokCiz(b) {
    switch (b.t) {
      case "p": return el("p", {}, isaretle(b.x));
      case "baslik": return el("h3", {}, isaretle(b.x));
      case "kural": return el("div", { class: "kural" }, isaretle(b.x));
      case "ipucu": return el("div", { class: "ipucu" }, isaretle(b.x));
      case "metin": return el("div", { class: "metin" }, b.x);
      case "liste": return el("ul", { class: "l" }, b.m.map(function (m) { return el("li", {}, isaretle(m)); }));
      case "tablo": {
        var tablo = el("table", {}, [
          el("tr", {}, b.b.map(function (h) { return el("th", { text: h }); })),
          b.s.map(function (satir) { return el("tr", {}, satir.map(function (h) { return el("td", {}, isaretle(h)); })); })
        ]);
        return el("div", { class: "tw" }, tablo);
      }
      case "kartlar": {
        var kutu = el("div", { class: "kartlar" });
        b.k.forEach(function (k) {
          var dugme = el("button", { type: "button", class: "kk", "aria-pressed": "false", onclick: function () {
            var acik = dugme.classList.toggle("flip");
            dugme.setAttribute("aria-pressed", acik ? "true" : "false");
          } }, [
            el("div", { class: "f" }, [el("div", { class: "w", text: k[0] }), el("div", { class: "x", text: "Dokun: Türkçesi" })]),
            el("div", { class: "b" }, [el("div", { class: "w", text: k[1] }), el("div", { class: "x", text: k[2] })])
          ]);
          kutu.appendChild(dugme);
        });
        return kutu;
      }
      default: return document.createDocumentFragment();
    }
  }

  /* ---------------------------------------------------------------- Rapor */
  function sayfaRapor() {
    kok.appendChild(el("h1", { text: "Rapor" }));
    kok.appendChild(el("p", { class: "muted" }, "Testteki ve alıştırmalardaki yanlışların düz metin özeti. Mehmet'e gönderirsen dersleri senin hatalarına göre birlikte şekillendiririz. Kişisel bilgi içermez; yalnızca cevapların yer alır."));
    var metin = M.rapor(T, D, durum, Date.now());
    kok.appendChild(el("pre", { class: "rapor", id: "rapor-metni", text: metin }));
    var mesaj = el("p", { class: "muted", role: "status", "aria-live": "polite" });
    var satir = el("div", { class: "satir" });
    if (navigator.share) {
      satir.appendChild(dugme("Paylaş", "ana", function () {
        navigator.share({ title: "Merve İngilizce raporu", text: metin }).catch(function () {});
      }));
    }
    satir.appendChild(dugme("Kopyala", navigator.share ? "" : "ana", function () {
      kopyala(metin).then(function (ok) { mesaj.textContent = ok ? "Kopyalandı. Mesaj olarak yapıştırabilirsin." : "Kopyalanamadı; metni elle seçip kopyala."; });
    }));
    kok.appendChild(satir);
    kok.appendChild(mesaj);
    kok.appendChild(el("div", { class: "kart" }, [
      el("h2", { text: "Verilerim" }),
      el("p", { class: "muted" }, "Cevapların yalnızca bu tarayıcıda saklanır. Telefonu ya da tarayıcıyı değiştirirsen yeniden başlaman gerekir; bu yüzden raporu zaman zaman gönder."),
      el("button", { class: "lnk", type: "button", onclick: function () {
        if (!window.confirm("Test sonuçların ve alıştırma cevapların tamamen silinsin mi? Bu geri alınamaz.")) return;
        try { localStorage.removeItem(ANAHTAR); } catch (e) { /* sorun değil */ }
        durum = M.bosDurum();
        kaydet();
        git("#/");
        ciz();
      } }, "Tüm verilerimi sil")
    ]));
  }

  function kopyala(metin) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(metin).then(function () { return true; }, function () { return yedekKopya(metin); });
    }
    return Promise.resolve(yedekKopya(metin));
  }
  function yedekKopya(metin) {
    var ta = el("textarea", { style: "position:fixed;left:-9999px;top:0", "aria-hidden": "true" });
    ta.value = metin;
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  ciz();
})();
