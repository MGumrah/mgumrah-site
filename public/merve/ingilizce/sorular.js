/* Merve için İngilizce seviye testi: soru bankası.
 *
 * 42 soru: Gramer 25, Kelime 11, Okuma 6; her bölümde kolaydan zora (A1 → C1).
 * KURAL: her sorunun ilk şıkkı (o[0]) DOĞRU cevaptır. Ekranda şıkların sırası kişiye ve denemeye göre
 * karıştırılır (motor.js › sira), kayıtlarda ise şıkkın bu dizideki yeri tutulur. Bu yüzden bir sorunun
 * şıkları yayına çıktıktan sonra değiştirilirse eski kayıtlar yanlış okunur; soru değişecekse id yenilenir.
 *
 * "konu" alanı dersler.js içindeki bir dersin id'sidir: yanlış yapılan soru, o dersi çalışma listesine taşır.
 */
(function (g) {
  var METINLER = {
    duyuru: {
      baslik: "Duyuru",
      metin:
        "Sunnyside Language Café starts a new evening English club on 3 March. The club meets every Tuesday from 7 to 8 p.m. It is free for members and costs 50 lira for other people. You do not need to book, but please arrive ten minutes early because there are only twenty seats. If you want to join, bring a photo ID and a pen. The club will not run during the school holidays."
    },
    kisaHafta: {
      baslik: "Haber",
      metin:
        "Last year, a mid-sized software company tested a four-day working week for six months. Employees kept their full salary but worked thirty-two hours instead of forty. Surprisingly, productivity did not fall; it rose slightly, mainly because meetings were shorter and staff took fewer sick days. However, the trial was not an unqualified success. Managers in customer-facing teams reported that it was difficult to cover Fridays, and some employees admitted feeling more stressed on the remaining four days as they tried to fit the same workload into less time. The company has therefore decided to extend the trial for another year, with adjustments for teams that deal directly with clients, rather than adopting the system permanently."
    }
  };

  var SORULAR = [
    /* ---------- GRAMER (25) ---------- */
    { id: "g01", bolum: "gramer", seviye: "A1", konu: "be-var", q: "My sister ___ a teacher.", o: ["is", "are", "am", "be"], e: "sister tekil (she) olduğu için is gelir: My sister is a teacher." },
    { id: "g02", bolum: "gramer", seviye: "A1", konu: "simdiki", q: "She ___ coffee every morning.", o: ["drinks", "drink", "is drink", "drinking"], e: "every morning = alışkanlık, yani present simple. she / he / it ile fiile -s gelir: drinks." },
    { id: "g03", bolum: "gramer", seviye: "A1", konu: "artikel", q: "I have ___ apple and a sandwich.", o: ["an", "a", "the", "some"], e: "apple ünlü sesle başlar, tekil ve sayılabilirdir: an apple." },
    { id: "g04", bolum: "gramer", seviye: "A1", konu: "simdiki", q: "___ you speak English?", o: ["Do", "Does", "Are", "Is"], e: "you ile present simple sorusu do ile kurulur: Do you speak English? (Does, he / she / it ile.)" },

    { id: "g05", bolum: "gramer", seviye: "A2", konu: "karsilastirma", q: "This bag is ___ than that one. (cheap)", o: ["cheaper", "cheap", "more cheap", "cheapest"], e: "than görünce karşılaştırma hali gerekir. cheap tek heceli olduğu için -er alır: cheaper." },
    { id: "g06", bolum: "gramer", seviye: "A2", konu: "gecmis", q: "We ___ to the cinema last night.", o: ["went", "go", "goed", "have gone"], e: "last night = zamanı belli, bitmiş olay → past simple. go düzensizdir: go → went." },
    { id: "g07", bolum: "gramer", seviye: "A2", konu: "edat", q: "The meeting is ___ Monday at 10 o'clock.", o: ["on", "in", "at", "by"], e: "Günlerle on kullanılır (on Monday), saatle at (at 10 o'clock)." },
    { id: "g08", bolum: "gramer", seviye: "A2", konu: "artikel", q: "How ___ sugar do you want in your tea?", o: ["much", "many", "few", "several"], e: "sugar sayılamaz bir isimdir; sayılamazlarla much kullanılır. many, sayılabilir çoğul isimlerle gelir (many books)." },
    { id: "g09", bolum: "gramer", seviye: "A2", konu: "gelecek", q: "I promise I ___ you tomorrow.", o: ["will call", "call", "am call", "called"], e: "Söz verirken will + fiil kullanılır: I will call you." },

    { id: "g10", bolum: "gramer", seviye: "B1", konu: "modal", q: "Visitors ___ touch the paintings. They are very old.", o: ["mustn't", "don't have to", "should", "might"], e: "Yasak anlamı mustn't ile verilir. don't have to ise 'gerek yok, istersen yap' demektir; Türkçede ikisi karışır." },
    { id: "g11", bolum: "gramer", seviye: "B1", konu: "mukemmel", q: "I ___ in this city since 2019.", o: ["have lived", "lived", "live", "am living"], e: "since + başlangıç noktası, 'o günden bugüne' anlamı taşır → present perfect: have lived." },
    { id: "g12", bolum: "gramer", seviye: "B1", konu: "kosul", q: "If you ___ hard, you will pass the exam.", o: ["study", "will study", "studied", "would study"], e: "1. tip koşul: if + present simple, ... will + fiil. if cümleciğinin içine will konmaz." },
    { id: "g13", bolum: "gramer", seviye: "B1", konu: "edilgen", q: "This bridge ___ in 1998.", o: ["was built", "built", "has built", "is building"], e: "Köprü yapan değil yapılan şeydir, yani edilgen gerekir. 1998 geçmiş olduğu için was built." },
    { id: "g14", bolum: "gramer", seviye: "B1", konu: "kalip", q: "She enjoys ___ to music while she cooks.", o: ["listening", "to listen", "listen", "listens"], e: "enjoy fiilinden sonra gelen fiil -ing alır: enjoy listening." },
    { id: "g15", bolum: "gramer", seviye: "B1", konu: "iliski", q: "The woman ___ lives next door is a doctor.", o: ["who", "which", "whose", "where"], e: "Kişiyi anlatan ilgi zamiri who'dur (that da olur). which eşya, whose sahiplik, where yer içindir." },

    { id: "g16", bolum: "gramer", seviye: "B2", konu: "kosul", q: "If she had left earlier, she ___ the train.", o: ["would have caught", "would catch", "had caught", "will catch"], e: "3. tip koşul (geçmişte olmamış şey): if + had + V3, would have + V3." },
    { id: "g17", bolum: "gramer", seviye: "B2", konu: "dolayli", q: "He asked me where ___.", o: ["I was going", "was I going", "did I go", "I went to go"], e: "Dolaylı soruda soru dizilişi kalkar: where + özne + fiil. Zaman bir adım geriye gider: am going → was going." },
    { id: "g18", bolum: "gramer", seviye: "B2", konu: "mukemmel", q: "I couldn't open the door because I ___ my keys at the office.", o: ["had left", "have left", "was leaving", "leaves"], e: "Kapıyı açamadığım ana göre daha önce olan olay → past perfect: had left." },
    { id: "g19", bolum: "gramer", seviye: "B2", konu: "edilgen", q: "Please use another road. This one ___ at the moment.", o: ["is being repaired", "is repairing", "has repaired", "repairs"], e: "Yol tamir edilen şeydir (edilgen) ve iş şu an sürüyor: is being repaired." },
    { id: "g20", bolum: "gramer", seviye: "B2", konu: "kalip", q: "I remember ___ the door, so it must be locked.", o: ["locking", "to lock", "lock", "to locking"], e: "remember + -ing = yaptığını hatırlamak. remember to lock = kilitlemeyi unutmamak (henüz yapılacak iş)." },
    { id: "g21", bolum: "gramer", seviye: "B2", konu: "kalip", q: "It took me a long time to get used ___ in a big city.", o: ["to living", "to live", "for living", "living"], e: "get used to içindeki to bir edattır, sonrasında isim veya -ing gelir: get used to living." },
    { id: "g22", bolum: "gramer", seviye: "B2", konu: "iliski", q: "My neighbour, ___ car was stolen last week, is very upset.", o: ["whose", "who", "which", "that"], e: "Sahiplik bildiren ilgi zamiri whose + isim: whose car (komşunun arabası)." },

    { id: "g23", bolum: "gramer", seviye: "C1", konu: "ileri-yapi", q: "Not only ___ late, but he also forgot the documents.", o: ["did he arrive", "he arrived", "he did arrive", "arrived he"], e: "Not only cümle başına gelince özne ile yardımcı fiil yer değiştirir (devrik cümle): Not only did he arrive late..." },
    { id: "g24", bolum: "gramer", seviye: "C1", konu: "ileri-yapi", q: "I'd rather you ___ anyone about this.", o: ["didn't tell", "don't tell", "won't tell", "haven't told"], e: "would rather + özne + past simple, şimdi veya gelecek için tercihi anlatır: I'd rather you didn't tell anyone." },
    { id: "g25", bolum: "gramer", seviye: "C1", konu: "ileri-yapi", q: "___ I known about the problem, I would have helped.", o: ["Had", "If", "Would", "Did"], e: "Resmî dilde 3. tip koşul devrik kurulur: Had I known = If I had known." },

    /* ---------- KELİME (11) ---------- */
    { id: "v01", bolum: "kelime", seviye: "A1", konu: "kelime-gunluk", q: "My mother's sister is my ___.", o: ["aunt", "uncle", "cousin", "niece"], e: "Annenin kız kardeşi teyzedir: aunt. uncle amca / dayı, cousin kuzen, niece (kız) yeğen." },
    { id: "v02", bolum: "kelime", seviye: "A1", konu: "kelime-gunluk", q: "The opposite of 'cheap' is ___.", o: ["expensive", "slow", "heavy", "quiet"], e: "cheap (ucuz) ↔ expensive (pahalı)." },

    { id: "v03", bolum: "kelime", seviye: "A2", konu: "kelime-eslesme", q: "Please ___ the form and sign it at the bottom.", o: ["fill in", "fill on", "full in", "fill of"], e: "fill in a form = formu doldurmak." },
    { id: "v04", bolum: "kelime", seviye: "A2", konu: "kelime-eslesme", q: "Could you ___ me a favour?", o: ["do", "make", "take", "give"], e: "do a favour = iyilik yapmak. make / do karışır: make a mistake, do homework." },

    { id: "v05", bolum: "kelime", seviye: "B1", konu: "kelime-eslesme", q: "I'm really looking ___ to the holidays.", o: ["forward", "ahead", "up", "over"], e: "look forward to = dört gözle beklemek." },
    { id: "v06", bolum: "kelime", seviye: "B1", konu: "kelime-eslesme", q: "Sorry I'm late. I got ___ in traffic.", o: ["stuck", "stack", "stocked", "stick"], e: "get stuck = sıkışıp kalmak: got stuck in traffic." },

    { id: "v07", bolum: "kelime", seviye: "B2", konu: "kelime-ileri", q: "The company wants to ___ ten new employees this year.", o: ["recruit", "retire", "reject", "reduce"], e: "recruit = işe almak. retire emekli olmak, reject reddetmek, reduce azaltmaktır." },
    { id: "v08", bolum: "kelime", seviye: "B2", konu: "kelime-ileri", q: "She is very ___; she always expects things to turn out well.", o: ["optimistic", "pessimistic", "reluctant", "arrogant"], e: "optimistic = iyimser. pessimistic kötümser, reluctant isteksiz, arrogant kibirli." },
    { id: "v09", bolum: "kelime", seviye: "B2", konu: "kelime-eslesme", q: "It is important to ___ a balance between work and family life.", o: ["strike", "beat", "break", "catch"], e: "strike a balance = denge kurmak (sabit kalıp)." },

    { id: "v10", bolum: "kelime", seviye: "C1", konu: "kelime-ileri", q: "His argument was so ___ that nobody could disagree.", o: ["compelling", "compulsory", "compatible", "complacent"], e: "compelling = ikna edici, çok güçlü. compulsory zorunlu, compatible uyumlu, complacent rehavete kapılmış demektir." },
    { id: "v11", bolum: "kelime", seviye: "C1", konu: "kelime-ileri", q: "The decision has been widely ___ as a serious mistake.", o: ["condemned", "contended", "conceded", "condensed"], e: "condemn = kınamak. concede kabul etmek / taviz vermek, condense yoğunlaştırmaktır." },

    /* ---------- OKUMA (6): iki metin, her biri 3 soru ---------- */
    { id: "r01", bolum: "okuma", seviye: "A2", konu: "okuma", metin: "duyuru", q: "How much does the club cost for members?", o: ["Nothing", "50 lira", "Ten lira", "Twenty lira"], e: "Metinde: 'It is free for members.' free = ücretsiz." },
    { id: "r02", bolum: "okuma", seviye: "B1", konu: "okuma", metin: "duyuru", q: "Why should people arrive early?", o: ["There are not many places.", "The club starts at 6 p.m.", "They must book a seat.", "They need to buy a pen."], e: "Metinde: 'please arrive ten minutes early because there are only twenty seats.' because = neden ipucudur." },
    { id: "r03", bolum: "okuma", seviye: "B1", konu: "okuma", metin: "duyuru", q: "When will the club NOT meet?", o: ["During the school holidays", "On Tuesdays", "In March", "After 8 p.m."], e: "Metinde: 'The club will not run during the school holidays.'" },

    { id: "r04", bolum: "okuma", seviye: "B2", konu: "okuma", metin: "kisaHafta", q: "According to the text, why did productivity rise?", o: ["Meetings were shorter and people were ill less often.", "Employees worked longer hours.", "Salaries were increased.", "The company hired more staff."], e: "Metinde: 'mainly because meetings were shorter and staff took fewer sick days.'" },
    { id: "r05", bolum: "okuma", seviye: "B2", konu: "okuma", metin: "kisaHafta", q: "What problem did managers of customer-facing teams mention?", o: ["Covering Fridays was difficult.", "Customers wanted shorter calls.", "Salaries were too high.", "Meetings took too long."], e: "Metinde: 'it was difficult to cover Fridays.'" },
    { id: "r06", bolum: "okuma", seviye: "C1", konu: "okuma", metin: "kisaHafta", q: "What can be inferred about the company's decision?", o: ["It is cautious and wants more evidence before a permanent change.", "It has already decided to adopt the system for all teams.", "It believes the trial failed completely.", "It will stop the trial for client teams at once."], e: "'extend the trial for another year' ve 'rather than adopting the system permanently' birlikte okununca şirketin temkinli davrandığı, daha fazla veri istediği anlaşılır. Bu bir çıkarımdır; cümle olduğu gibi yazmaz." }
  ];

  g.MERVE_TEST = { surum: 1, metinler: METINLER, sorular: SORULAR };
})(typeof globalThis !== "undefined" ? globalThis : this);
