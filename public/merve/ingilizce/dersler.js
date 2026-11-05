/* Merve için İngilizce dersleri: her konu bir ders, her dersin kendi alıştırmaları var.
 *
 * Ders içeriği küçük bir blok dizisidir; uygulama.js bunları güvenli biçimde (innerHTML olmadan) çizer.
 *   { t: "p", x }                    düz paragraf
 *   { t: "baslik", x }               alt başlık
 *   { t: "kural", x }                vurgulu kural kutusu
 *   { t: "ipucu", x }                sarı ipucu / tuzak kutusu
 *   { t: "tablo", b: [..], s: [[..]] }  başlıklar ve satırlar
 *   { t: "liste", m: [..] }          madde işaretli liste
 *   { t: "kartlar", k: [[ing, tr, örnek]] }  tıklayınca Türkçesi açılan kelime kartları
 *   { t: "metin", x }                okuma parçası
 * Metin içinde: **kalın**, `kod`, {{İngilizce örnek}} biçimleri kullanılır.
 *
 * Alıştırma: { q, o: [doğru, yanlış, yanlış, yanlış], e }. İlk şık DOĞRU cevaptır, ekranda karıştırılır.
 * Bir alıştırmanın şıkları değiştirilirse eski kayıtlar yanlış okunur; değişecekse soru metni de değişmeli.
 *
 * seviye: konunun tipik CEFR düzeyi (çalışma sırasını belirler).
 */
(function (g) {
  var DERSLER = [
    /* ------------------------------------------------------------------ A1 */
    {
      id: "be-var", ad: "to be ve there is / there are", seviye: "A1",
      ozet: "'Olmak' fiili özneye göre değişir. 'Var' demek için have değil there is / there are kullanılır.",
      blok: [
        { t: "tablo", b: ["Özne", "Fiil", "Örnek"], s: [
          ["I", "**am**", "{{I am a student.}}"],
          ["he, she, it", "**is**", "{{She is at home.}}"],
          ["you, we, they", "**are**", "{{They are friends.}}"]
        ] },
        { t: "kural", x: "Olumsuz: **am not, isn't, aren't**. Soruda fiil öne geçer: {{Is she at home?}} {{Are they friends?}}" },
        { t: "baslik", x: "there is / there are" },
        { t: "tablo", b: ["Kalıp", "Ne zaman", "Örnek"], s: [
          ["**there is**", "tekil ve sayılamaz isimle", "{{There is a book on the table.}}<br>{{There is some milk in the fridge.}}"],
          ["**there are**", "çoğul isimle", "{{There are two books on the table.}}"],
          ["**Is there ...? / Are there ...?**", "soru", "{{Is there a bank near here?}}"]
        ] },
        { t: "ipucu", x: "Türkçede 'masada iki kitap var' deriz, ama İngilizcede bunu {{I have two books}} diye kurmayız. Yer belirtiyorsak {{There are two books on the table}} denir." }
      ],
      alistirma: [
        { q: "My parents ___ at home now.", o: ["are", "is", "am", "be"], e: "parents çoğul (they), bu yüzden are." },
        { q: "___ there a bank near here?", o: ["Is", "Are", "Do", "Does"], e: "bank tekil: Is there a bank ...?" },
        { q: "There ___ some milk in the fridge.", o: ["is", "are", "have", "has"], e: "milk sayılamaz, bu yüzden there is." },
        { q: "I ___ not tired.", o: ["am", "is", "are", "do"], e: "I ile am kullanılır: I am not tired." },
        { q: "There ___ three students in the room.", o: ["are", "is", "have", "do"], e: "three students çoğul: there are." }
      ]
    },
    {
      id: "simdiki", ad: "Present simple ve present continuous", seviye: "A1",
      ozet: "Alışkanlıklar ve genel doğrular için present simple, şu an olanlar için present continuous.",
      blok: [
        { t: "tablo", b: ["Zaman", "Yapı", "Ne zaman", "Örnek"], s: [
          ["**Present simple**", "fiil (he / she / it ile **-s**)", "alışkanlık, genel doğru", "{{She drinks coffee every morning.}}"],
          ["**Present continuous**", "am / is / are + fiil**-ing**", "şu an, geçici durum", "{{She is drinking coffee now.}}"]
        ] },
        { t: "kural", x: "Present simple'ın olumsuzu ve sorusu **do / does** ile kurulur: {{Do you speak English?}} {{She doesn't work here.}} **does** geldiyse fiilden -s kalkar: {{Does she work?}} ({{Does she works?}} yanlıştır.)" },
        { t: "ipucu", x: "**always, usually, every day** → present simple. **now, at the moment, today (geçici)** → continuous. **like, know, want, understand** gibi durum fiilleri genelde -ing almaz: {{I want tea.}} ({{I am wanting}} yanlıştır.)" }
      ],
      alistirma: [
        { q: "He ___ to work by bus every day.", o: ["goes", "go", "is going", "going"], e: "every day = alışkanlık, he → goes." },
        { q: "Look! The baby ___.", o: ["is sleeping", "sleeps", "sleep", "sleeping"], e: "Look! = şu an oluyor: is sleeping." },
        { q: "___ she work in a bank?", o: ["Does", "Do", "Is", "Has"], e: "she ile present simple sorusu: Does she work ...?" },
        { q: "I ___ what you mean.", o: ["understand", "am understanding", "understanding", "understands"], e: "understand bir durum fiilidir, -ing almaz." },
        { q: "They don't ___ meat.", o: ["eat", "eats", "eating", "to eat"], e: "don't / doesn't'tan sonra fiil yalın halde gelir." }
      ]
    },
    {
      id: "artikel", ad: "a / an / the ve sayılabilir-sayılamaz isimler", seviye: "A1",
      ozet: "Hangi isimle a, an, the; hangi isimle much, many, some, any kullanılır?",
      blok: [
        { t: "tablo", b: ["Sözcük", "Ne zaman", "Örnek"], s: [
          ["**a**", "ünsüz sesle başlayan tekil isim, ilk kez söz edilen", "{{a book, a university}}"],
          ["**an**", "ünlü sesle başlayan tekil isim", "{{an apple, an hour}}"],
          ["**the**", "belli, bilinen ya da dünyada tek olan şey", "{{the sun, Close the door.}}"]
        ] },
        { t: "ipucu", x: "Yazıya değil **sese** bakılır: {{an hour}} (h okunmaz), {{a university}} (ilk ses 'yu')." },
        { t: "baslik", x: "Sayılabilir ve sayılamaz" },
        { t: "tablo", b: ["", "Sayılabilir (book, person)", "Sayılamaz (water, money, information)"], s: [
          ["çok", "**many** {{many books}}", "**much** {{much water}}"],
          ["az", "**a few / few** {{a few friends}}", "**a little / little** {{a little time}}"],
          ["ikisinde de", "**some** (olumlu, teklif), **any** (olumsuz, soru), **a lot of**", ""]
        ] },
        { t: "kural", x: "{{There isn't any milk.}} {{Would you like some tea?}} (Teklif ve rica cümlelerinde some kullanılır.) **information, advice, news, furniture** sayılamazdır: {{an information}} ve {{informations}} yanlıştır." }
      ],
      alistirma: [
        { q: "She is ___ honest person.", o: ["an", "a", "the", "some"], e: "honest'in h'si okunmaz, ilk ses ünlü: an honest person." },
        { q: "We don't have ___ bread.", o: ["any", "some", "many", "a"], e: "olumsuz cümle + sayılamaz isim: any bread." },
        { q: "How ___ people came to the party?", o: ["many", "much", "a little", "any"], e: "people sayılabilir, bu yüzden many." },
        { q: "I need ___ information about the course.", o: ["some", "an", "many", "a few"], e: "information sayılamaz; a, an, many, a few kullanılmaz. some doğrudur." },
        { q: "___ moon goes around the Earth.", o: ["The", "A", "An", "Some"], e: "Dünya çevresinde tek bir Ay var, belli olduğu için the." }
      ]
    },

    /* ------------------------------------------------------------------ A2 */
    {
      id: "gecmis", ad: "Past simple", seviye: "A2",
      ozet: "Bitmiş ve zamanı belli olaylar: yesterday, last week, in 2019, two days ago.",
      blok: [
        { t: "tablo", b: ["Tür", "Kural", "Örnek"], s: [
          ["Düzenli", "fiil + **-ed**", "{{work → worked}}, {{stop → stopped}}, {{study → studied}}"],
          ["Düzensiz", "ezberlenir", "{{go → went}}, {{have → had}}, {{see → saw}}, {{buy → bought}}, {{come → came}}, {{take → took}}, {{eat → ate}}, {{write → wrote}}"]
        ] },
        { t: "kural", x: "Olumsuz ve soru **did** ile kurulur ve fiil yalın kalır: {{I didn't go.}} {{Did you see him?}} **did** varken fiili ikinci hale koymayız: {{didn't went}} yanlıştır." },
        { t: "ipucu", x: "**yesterday, last night, in 2019, two days ago** gördüğünde past simple düşün." }
      ],
      alistirma: [
        { q: "I ___ my keys yesterday.", o: ["lost", "loosed", "have lost", "lose"], e: "yesterday geçmiş ve belli bir zaman: past simple. lose → lost." },
        { q: "Did you ___ the film last night?", o: ["see", "saw", "seen", "sees"], e: "did'den sonra fiil yalın halde gelir: see." },
        { q: "She ___ to school last year.", o: ["didn't go", "didn't went", "doesn't go", "not went"], e: "olumsuz geçmiş: didn't + yalın fiil." },
        { q: "We ___ a lot of photos on holiday.", o: ["took", "taked", "take", "taken"], e: "take düzensizdir: take → took." },
        { q: "When ___ you buy this car?", o: ["did", "do", "have", "were"], e: "When ile geçmiş soru: did + özne + yalın fiil." }
      ]
    },
    {
      id: "karsilastirma", ad: "Karşılaştırma ve üstünlük", seviye: "A2",
      ozet: "İki şeyi kıyaslarken sıfata -er eklenir ya da önüne more gelir; 'en ...' için the + -est.",
      blok: [
        { t: "tablo", b: ["Sıfat türü", "Kural", "Örnek"], s: [
          ["Tek heceli", "sıfat + **-er** + than", "{{cheap → cheaper}}, {{small → smaller}}"],
          ["Sessiz-sesli-sessiz biten", "son harf ikilenir", "{{big → bigger}}, {{hot → hotter}}"],
          ["-e ile biten", "sadece **-r**", "{{large → larger}}"],
          ["-y ile biten", "y → i + **-er**", "{{easy → easier}}, {{busy → busier}}"],
          ["İki ve daha çok heceli", "**more** + sıfat + than", "{{more expensive}}, {{more difficult}}"],
          ["Düzensiz", "ezberlenir", "{{good → better}}, {{bad → worse}}, {{far → farther / further}}"]
        ] },
        { t: "kural", x: "**En üstünlük** (en ...): {{the cheapest}}, {{the busiest}}, {{the most expensive}}. Önünde **the** olur. Eşitlik: {{as tall as}}, olumsuzu {{not as tall as}}." },
        { t: "ipucu", x: "Şunlar yanlıştır: {{more tall}}, {{more taller}}, {{gooder}}. Kısa sıfat için -er, uzun sıfat için more kullanılır; ikisi birlikte kullanılmaz." }
      ],
      alistirma: [
        { q: "This phone is ___ than mine. (expensive)", o: ["more expensive", "expensiver", "most expensive", "more expensiver"], e: "expensive uzun sıfat (3 hece): more expensive than." },
        { q: "Summer is ___ than winter. (hot)", o: ["hotter", "hoter", "more hot", "hottest"], e: "hot sessiz-sesli-sessiz biter, son harf ikilenir: hotter." },
        { q: "She is the ___ student in our class. (good)", o: ["best", "better", "goodest", "most good"], e: "good düzensizdir: good → better → best. 'En' anlamı için the best." },
        { q: "This exercise is not as ___ as the last one. (easy)", o: ["easy", "easier", "easiest", "more easy"], e: "as ... as arasında sıfat yalın halde kalır." },
        { q: "London is ___ city in England.", o: ["the biggest", "bigger", "the most big", "more big"], e: "'En büyük': the + -est. big → the biggest." }
      ]
    },
    {
      id: "edat", ad: "in / on / at ve for / since", seviye: "A2",
      ozet: "Zaman ve yer edatlarında hangi sözcüğün hangi kalıpla kullanıldığı ezberlenecek küçük bir tablo.",
      blok: [
        { t: "tablo", b: ["Edat", "Zamanda", "Yerde"], s: [
          ["**at**", "saat, gece, hafta sonu: {{at 5 o'clock, at night, at the weekend}}", "nokta: {{at the bus stop, at work, at home}}"],
          ["**on**", "gün ve tarih: {{on Monday, on 12 June}}", "yüzey: {{on the table, on the second floor}}"],
          ["**in**", "ay, yıl, mevsim, günün bölümü: {{in May, in 2024, in summer, in the morning}}", "içinde: {{in a room, in Istanbul}}"]
        ] },
        { t: "kural", x: "**for** + süre: {{for two years}}. **since** + başlangıç noktası: {{since 2022}}. İkisi de genelde present perfect ile kullanılır." },
        { t: "ipucu", x: "İstisna: {{in the morning}} ama {{at night}}; belirli bir günün sabahı için {{on Monday morning}}." }
      ],
      alistirma: [
        { q: "My birthday is ___ 12 June.", o: ["on", "in", "at", "by"], e: "tarihlerle on kullanılır: on 12 June." },
        { q: "The shop closes ___ 8 p.m.", o: ["at", "in", "on", "to"], e: "saatle at: at 8 p.m." },
        { q: "We moved here ___ 2020.", o: ["in", "on", "at", "since"], e: "yıl ile in: in 2020. since, moved gibi geçmiş zamanla kullanılmaz." },
        { q: "He has lived here ___ five years.", o: ["for", "since", "during", "in"], e: "süre (five years) için for." },
        { q: "She is ___ work until six.", o: ["at", "in", "on", "to"], e: "at work = işte." }
      ]
    },
    {
      id: "gelecek", ad: "will, going to ve plan yapılmış gelecek", seviye: "A2",
      ozet: "Gelecek için üç yol var; hangisini seçtiğin 'karar ne zaman verildi?' sorusuna bağlı.",
      blok: [
        { t: "tablo", b: ["Yapı", "Ne zaman", "Örnek"], s: [
          ["**will** + fiil", "anlık karar, söz, görüş / tahmin", "{{I'll help you.}} {{I think it will rain.}}"],
          ["**be going to** + fiil", "önceden verilmiş karar; elde kanıt olan tahmin", "{{I'm going to study law.}} {{Look at the clouds! It's going to rain.}}"],
          ["**present continuous**", "kesinleşmiş plan, randevu", "{{I'm meeting Ali at 6.}}"]
        ] },
        { t: "kural", x: "**when, if, as soon as, before, after, unless, until** sözcüklerinden sonra will kullanılmaz; present simple gelir: {{When I arrive, I'll call you.}}" }
      ],
      alistirma: [
        { q: "Look at those black clouds! It ___ rain.", o: ["is going to", "won't", "would", "was"], e: "Elde kanıt var (kara bulutlar): be going to." },
        { q: "I promise I ___ you the money back tomorrow.", o: ["will give", "am going give", "give", "gave"], e: "Söz verme: will + yalın fiil." },
        { q: "We have decided: next month we ___ a new flat.", o: ["are going to buy", "will buying", "buy", "bought"], e: "Önceden verilmiş karar: be going to + fiil." },
        { q: "When she ___ here, I will tell her.", o: ["arrives", "will arrive", "arrived", "is arriving"], e: "when'den sonra will kullanılmaz; present simple: arrives." },
        { q: "I ___ my dentist at 4 tomorrow; it's in my diary.", o: ["am seeing", "will see", "see", "saw"], e: "Ajandaya yazılmış kesin randevu: present continuous." }
      ]
    },

    /* ------------------------------------------------------------------ B1 */
    {
      id: "modal", ad: "can, must, mustn't, don't have to, should", seviye: "B1",
      ozet: "Türkçede 'yapma' ile 'yapmak zorunda değilsin' çok farklıdır; İngilizcede de öyle.",
      blok: [
        { t: "tablo", b: ["İfade", "Anlamı", "Örnek"], s: [
          ["**must / have to**", "zorunlu", "{{Employees have to wear a badge.}}"],
          ["**mustn't**", "**YASAK**, yapılmamalı", "{{You mustn't park here.}}"],
          ["**don't have to**", "gerek yok (serbest, istersen yap)", "{{You don't have to come on Sunday.}}"],
          ["**should**", "tavsiye", "{{You should see a doctor.}}"],
          ["**can**", "yapabilmek, izin", "{{She can swim.}} {{Can I sit here?}}"],
          ["**could**", "nazik rica, geçmişte yapabilmek", "{{Could you help me, please?}}"]
        ] },
        { t: "kural", x: "Kısa hatırlatma: **mustn't = yapma** · **don't have to = yapmak zorunda değilsin**. 'Forbidden, dangerous, illegal' gibi sözcükler görürsen mustn't düşün." },
        { t: "ipucu", x: "Modal fiillerden sonra fiil yalın gelir ve fiile -s / -ing / to eklenmez: {{She can speak}} ({{She cans speaks}} ve {{She can to speak}} yanlış)." }
      ],
      alistirma: [
        { q: "You ___ drive without a licence. It's illegal.", o: ["mustn't", "don't have to", "needn't to", "aren't"], e: "Yasadışı = yasak: mustn't." },
        { q: "It's Sunday. I ___ get up early.", o: ["don't have to", "mustn't", "can't to", "must"], e: "Pazar, gerek yok: don't have to." },
        { q: "___ you help me with this bag, please?", o: ["Could", "Do", "Must", "Are"], e: "Nazik rica: Could you ...?" },
        { q: "She can ___ three languages.", o: ["speak", "speaks", "to speak", "speaking"], e: "can'den sonra yalın fiil: speak." },
        { q: "You look tired. You ___ get some rest.", o: ["should", "must to", "shoulds", "are"], e: "Tavsiye: should + yalın fiil." }
      ]
    },
    {
      id: "mukemmel", ad: "Past simple, present perfect, past perfect", seviye: "B1",
      ozet: "Üçü de 'geçmiş' ama zaman çizgisindeki yerleri farklı.",
      blok: [
        { t: "tablo", b: ["Zaman", "Ne zaman kullanılır", "Örnek"], s: [
          ["**Past simple**<br>V2", "bitmiş, zamanı belli olay (yesterday, last week, in 2020)", "{{I sent the file yesterday.}}"],
          ["**Present perfect**<br>have / has + V3", "şimdiyle bağlantılı ya da zamanı belirsiz (since, for, already, just, ever, never, yet)", "{{I have worked here since 2022.}} {{She has never eaten sushi.}}"],
          ["**Past perfect**<br>had + V3", "geçmişteki bir andan **önce** tamamlanmış olay", "{{When we arrived, the film had already started.}}"]
        ] },
        { t: "kural", x: "**Zaman çizgisi:** 1) film başladı (<i>had started</i>) → 2) biz geldik (<i>arrived</i>). İki geçmiş olaydan **önce olanı** past perfect, sonra olanı past simple yap." },
        { t: "ipucu", x: "**yesterday, last week, ago, in 2019** ile present perfect kullanılmaz: {{I have seen him yesterday}} yanlıştır. **since** ve **for** present perfect ister: {{I have lived here for five years.}}" }
      ],
      alistirma: [
        { q: "I have never ___ sushi.", o: ["eaten", "ate", "eat", "eating"], e: "have never + V3: eaten (eat → ate → eaten)." },
        { q: "She ___ in Paris in 2015.", o: ["lived", "has lived", "had lived", "lives"], e: "in 2015 geçmişte belli bir yıl: past simple." },
        { q: "I have ___ finished my homework.", o: ["just", "yesterday", "ago", "last"], e: "have just + V3: az önce bitirdim." },
        { q: "When we arrived, the concert ___ already started.", o: ["had", "has", "was", "did"], e: "Gelişimizden önce başlamış: had + V3 (past perfect)." },
        { q: "How long ___ you worked here?", o: ["have", "are", "do", "will"], e: "How long + have you + V3: 'ne zamandır' sorusu." }
      ]
    },
    {
      id: "kosul", ad: "Koşul cümleleri (if) ve wish", seviye: "B1",
      ozet: "Dört kalıp var; hangisini seçeceğin olayın gerçekçi mi hayali mi olduğuna bağlı.",
      blok: [
        { t: "tablo", b: ["Tür", "Yapı", "Anlam", "Örnek"], s: [
          ["0", "If + present, present", "genel doğru", "{{If you heat water to 100°C, it boils.}}"],
          ["**1**", "If + **present simple**, **will** + fiil", "gerçekçi gelecek", "{{If you study hard, you will pass.}}"],
          ["**2**", "If + **past simple**, **would** + fiil", "şimdi / gelecek için hayali", "{{If I were taller, I would play basketball.}}"],
          ["**3**", "If + **had + V3**, **would have + V3**", "geçmiş, pişmanlık", "{{If she had left earlier, she would have caught the train.}}"]
        ] },
        { t: "kural", x: "**En büyük tuzak:** tür 1 ve 2'de **if** cümleciğine will ve would **konmaz**. {{If it will rain}} ve {{If I would have}} yanlıştır. Aynısı when, as soon as, before, after, unless, until için de geçerli." },
        { t: "baslik", x: "wish" },
        { t: "tablo", b: ["Kalıp", "Anlam", "Örnek"], s: [
          ["**I wish + past simple**", "şu anki durumdan memnuniyetsizlik", "{{I wish I had a bigger house.}}"],
          ["**I wish + had + V3**", "geçmiş için pişmanlık", "{{I wish I had accepted the offer.}}"]
        ] },
        { t: "ipucu", x: "{{If I were you}} kalıbında tüm öznelerle **were** kullanılır: {{If I were you, I would take the job.}}" }
      ],
      alistirma: [
        { q: "If you heat water to 100°C, it ___.", o: ["boils", "will boiled", "boiling", "would boil"], e: "Genel doğru (tür 0): present simple." },
        { q: "If I ___ you, I would take the job.", o: ["were", "am", "will be", "would be"], e: "Tür 2'de 'if I were you' kalıbı." },
        { q: "If we leave now, we ___ the bus.", o: ["will catch", "would catch", "had caught", "catching"], e: "Tür 1: if + present simple, ... will + fiil." },
        { q: "If he had studied harder, he ___ the exam.", o: ["would have passed", "would pass", "will pass", "had passed"], e: "Tür 3: if + had + V3, would have + V3." },
        { q: "I wish I ___ a bigger house.", o: ["had", "have", "would have", "will have"], e: "Şu anki durum için wish + past simple." }
      ]
    },
    {
      id: "edilgen", ad: "Edilgen (passive)", seviye: "B1",
      ozet: "Eylemi kimin yaptığı önemsiz ya da bilinmiyorsa, işin yapıldığı şeyi özne yaparız.",
      blok: [
        { t: "kural", x: "**Formül:** <code>be</code> (zamana göre) + <code>V3</code><br>Etken: {{The manager wrote the report.}}<br>Edilgen: {{The report was written by the manager.}}" },
        { t: "tablo", b: ["Zaman", "Yapı", "Örnek"], s: [
          ["Present simple", "am / is / are + V3", "{{Invoices are sent every Friday.}}"],
          ["Past simple", "was / were + V3", "{{The bridge was built in 1998.}}"],
          ["Present continuous", "am / is / are **being** + V3", "{{The road is being repaired.}}"],
          ["Present perfect", "has / have **been** + V3", "{{The accounts have been checked.}}"],
          ["Future", "will **be** + V3", "{{The report will be sent tomorrow.}}"],
          ["Modal", "can / must / should **be** + V3", "{{The file must be saved.}}"]
        ] },
        { t: "tablo", b: ["V1", "V2", "V3", "V1", "V2", "V3"], s: [
          ["write", "wrote", "**written**", "send", "sent", "**sent**"],
          ["do", "did", "**done**", "make", "made", "**made**"],
          ["see", "saw", "**seen**", "take", "took", "**taken**"],
          ["give", "gave", "**given**", "know", "knew", "**known**"]
        ] },
        { t: "ipucu", x: "Yanlış: {{English speaks all over the world}} (İngilizce konuşmaz, konuşulur). Doğru: {{English is spoken all over the world.}}" }
      ],
      alistirma: [
        { q: "English ___ all over the world.", o: ["is spoken", "speaks", "is speaking", "spoke"], e: "İngilizce konuşulan şeydir: is spoken." },
        { q: "The tickets ___ yesterday.", o: ["were sold", "sold", "are sold", "have sold"], e: "Biletler satılan şeydir, yesterday geçmiştir: were sold." },
        { q: "The windows ___ at the moment.", o: ["are being cleaned", "are cleaning", "clean", "cleaned"], e: "Şu an süren edilgen iş: are being cleaned." },
        { q: "The report ___ by Friday.", o: ["must be finished", "must finish", "must be finish", "must finished"], e: "Modal edilgen: must be + V3." },
        { q: "This room ___ since last year.", o: ["hasn't been used", "didn't use", "hasn't used", "isn't used"], e: "since + edilgen: has / have been + V3, olumsuzu hasn't been used." }
      ]
    },
    {
      id: "kalip", ad: "-ing mi, to mu? used to ve be used to", seviye: "B1",
      ozet: "Bir fiilden sonra gelen fiilin biçimi, o fiile bağlıdır. Burada sık yapılan hataları topladık.",
      blok: [
        { t: "tablo", b: ["Fiilden sonra", "Hangi fiiller", "Örnek"], s: [
          ["**-ing**", "enjoy, finish, avoid, mind, keep, suggest, consider", "{{I enjoy cooking.}} {{She avoided answering.}}"],
          ["**to + fiil**", "want, need, decide, hope, plan, learn, promise, manage", "{{She decided to leave.}} {{I hope to see you.}}"],
          ["**edat + -ing**", "interested in, good at, before, after, instead of", "{{She is good at drawing.}} {{Before leaving, call me.}}"]
        ] },
        { t: "baslik", x: "Anlamı değişenler" },
        { t: "tablo", b: ["Kalıp", "Anlam", "Örnek"], s: [
          ["stop + -ing", "yapmayı bırakmak", "{{I stopped smoking.}}"],
          ["stop + to", "yapmak için durmak", "{{I stopped to smoke.}}"],
          ["remember + -ing", "yaptığını hatırlamak", "{{I remember locking the door.}}"],
          ["remember + to", "yapmayı unutmamak", "{{Remember to lock the door.}}"]
        ] },
        { t: "baslik", x: "used to ve be used to" },
        { t: "tablo", b: ["Kalıp", "Sonrası", "Anlam", "Örnek"], s: [
          ["**used to**", "fiil (V1)", "eskiden ...-erdim, artık değil", "{{I used to work in a bank.}}"],
          ["**be used to**", "**-ing** ya da isim", "...e alışığım", "{{I'm used to working late.}}"],
          ["**get used to**", "**-ing** ya da isim", "...e alışmak", "{{You'll get used to the new system.}}"]
        ] },
        { t: "kural", x: "**Neden 'to living'?** <code>be used to</code> ve <code>get used to</code> içindeki <code>to</code> bir edattır, fiil işareti değil. Edattan sonra isim ya da -ing gelir. Deneme: {{I'm used to the noise}} diyebiliyorsan, {{I'm used to living here}} de diyebilirsin." }
      ],
      alistirma: [
        { q: "He avoided ___ the question.", o: ["answering", "to answer", "answer", "answered"], e: "avoid + -ing." },
        { q: "We decided ___ a taxi.", o: ["to take", "taking", "take", "took"], e: "decide + to + yalın fiil." },
        { q: "She is good at ___ pictures.", o: ["drawing", "to draw", "draw", "draws"], e: "Edattan (at) sonra -ing gelir." },
        { q: "I used to ___ a lot of coffee.", o: ["drink", "drinking", "drank", "drunk"], e: "used to + yalın fiil: eskiden içerdim." },
        { q: "He isn't used to ___ on his own.", o: ["living", "live", "lived", "to live"], e: "be used to + -ing: yalnız yaşamaya alışık değil." },
        { q: "Don't forget ___ the lights when you leave.", o: ["to turn off", "turning off", "turn off", "turned off"], e: "forget to + fiil: yapmayı unutmak (henüz yapılmamış iş)." }
      ]
    },
    {
      id: "iliski", ad: "İlgi cümlecikleri (who, which, that, whose, where)", seviye: "B1",
      ozet: "Bir ismi ayrıntılı anlatmak için cümleye 'ki' bağlayan sözcükler.",
      blok: [
        { t: "tablo", b: ["Sözcük", "Ne için", "Örnek"], s: [
          ["**who**", "kişi", "{{The man who called you is my uncle.}}"],
          ["**which**", "eşya, hayvan", "{{The book which I bought is great.}}"],
          ["**that**", "kişi ya da eşya (tanımlayıcı cümlede)", "{{The film that we watched was boring.}}"],
          ["**whose**", "sahiplik", "{{The woman whose car was stolen is upset.}}"],
          ["**where**", "yer", "{{This is the village where I was born.}}"]
        ] },
        { t: "kural", x: "Virgüllü ek bilgi cümleciğinde (<i>non-defining</i>) **that** kullanılmaz: {{My phone, which I bought last week, is broken.}} Nesne durumundaki ilgi zamiri atılabilir: {{The book (that) I read}}." },
        { t: "ipucu", x: "whose'dan sonra daima isim gelir: {{whose car}}, {{whose idea}}." }
      ],
      alistirma: [
        { q: "The man ___ called you is my uncle.", o: ["who", "which", "whose", "where"], e: "Kişi için who." },
        { q: "This is the village ___ I was born.", o: ["where", "who", "which", "whose"], e: "Yer için where." },
        { q: "The film ___ we watched last night was boring.", o: ["that", "who", "whose", "where"], e: "Eşya için that (ya da which) kullanılır." },
        { q: "She works for a company ___ products are sold worldwide.", o: ["whose", "who", "which", "that"], e: "Şirketin ürünleri: whose + isim." },
        { q: "The book, ___ I bought yesterday, is very interesting.", o: ["which", "that", "who", "whose"], e: "Virgüllü ek bilgi cümleciğinde that olmaz, which gelir." }
      ]
    },

    /* ------------------------------------------------------------------ B2 */
    {
      id: "dolayli", ad: "Dolaylı anlatım (reported speech)", seviye: "B2",
      ozet: "Birinin söylediğini aktarırken zaman bir adım geri gider, soru dizilişi kalkar.",
      blok: [
        { t: "tablo", b: ["Söylenen", "Aktarılan"], s: [
          ["am / is", "{{was}}"],
          ["present simple", "{{past simple}}"],
          ["will / can", "{{would / could}}"],
          ["present perfect / past simple", "{{past perfect (had + V3)}}"]
        ] },
        { t: "tablo", b: ["Söz", "Aktarım"], s: [
          ["{{'I'm tired,' she said.}}", "{{She said (that) she was tired.}}"],
          ["{{'Where do you live?' he asked.}}", "{{He asked me where I lived.}} (soru dizilişi yok, do / does yok)"],
          ["{{'Please close the window.'}}", "{{He asked me to close the window.}}"]
        ] },
        { t: "kural", x: "**say / tell:** {{He told me that ...}} ama {{He said that ...}}. Kişiden bahsediyorsan tell, yoksa say. {{He said me}} yanlıştır." },
        { t: "ipucu", x: "Zaman sözcükleri de kayar: **tomorrow → the next day**, **yesterday → the day before**, **now → then**, **here → there**, **today → that day**." }
      ],
      alistirma: [
        { q: "'Where do you live?' he asked me. → He asked me ___.", o: ["where I lived", "where did I live", "where I did live", "where lived I"], e: "Dolaylı soruda soru dizilişi kalkar: where + özne + fiil (zaman geriye)." },
        { q: "She ___ me that the office was closed.", o: ["told", "said", "spoke", "asked"], e: "Kişi (me) varsa told kullanılır." },
        { q: "'Please close the window,' he said. → He asked me ___ the window.", o: ["to close", "close", "closing", "that I close"], e: "Rica ve emirler: ask + kişi + to + fiil." },
        { q: "'I'm leaving tomorrow,' she said. → She said she was leaving ___.", o: ["the next day", "yesterday", "last day", "the day before today"], e: "tomorrow dolaylı anlatımda the next day olur." },
        { q: "'I have finished,' he said. → He said he ___ finished.", o: ["had", "was", "did", "would"], e: "present perfect dolaylı anlatımda past perfect olur: had finished." }
      ]
    },
    {
      id: "ileri-yapi", ad: "İleri yapılar: devrik cümle, would rather, devrik koşul", seviye: "C1",
      ozet: "Resmî dilde ve akademik metinlerde sık geçen, ama günlük konuşmada az duyulan kalıplar.",
      blok: [
        { t: "tablo", b: ["Yapı", "Kural", "Örnek"], s: [
          ["Olumsuz zarflarla devrik cümle", "Never, Rarely, Not only, No sooner, Hardly + **yardımcı fiil + özne**", "{{Never have I seen such a beautiful place.}}<br>{{Not only did he arrive late, but he also forgot the documents.}}"],
          ["no sooner ... than", "No sooner **had** + özne + V3 ... **than** ...", "{{No sooner had we sat down than the waiter came.}}"],
          ["Devrik koşul", "Had I known ... / Should you need ... / Were I you ...", "{{Had I known, I would have helped.}}<br>{{Should you need help, please call.}}"],
          ["would rather", "özne + **past simple** (şimdi / gelecek için tercih)", "{{I'd rather you didn't tell anyone.}}"],
          ["Karma koşul", "If + had + V3, would + yalın fiil (geçmiş neden, şimdiki sonuç)", "{{If I had taken that job, I would be living in London now.}}"]
        ] },
        { t: "ipucu", x: "Devrik yapı resmî bir üsluptur: {{If you need any help, call me}} günlük dilde çok doğaldır; {{Should you need any help, please call me}} bir yazılı duyuruda ya da e-postada." }
      ],
      alistirma: [
        { q: "Never ___ such a beautiful place.", o: ["have I seen", "I have seen", "I saw", "did I seen"], e: "Never cümle başında olduğunda yardımcı fiil özneden önce gelir: Never have I seen." },
        { q: "___ you need any help, please call me.", o: ["Should", "Would", "Could", "Did"], e: "Should you need = If you need (resmî ve devrik)." },
        { q: "I'd rather you ___ so loud.", o: ["didn't talk", "don't talk", "won't talk", "haven't talked"], e: "would rather + özne + past simple." },
        { q: "No sooner had we sat down ___ the waiter brought the menu.", o: ["than", "when", "then", "that"], e: "no sooner ... than kalıbı." },
        { q: "If I had taken that job, I ___ in London now.", o: ["would be living", "would have lived", "had lived", "will live"], e: "Karma koşul: geçmiş neden (had taken), şimdiki sonuç (would be living)." }
      ]
    },

    /* ------------------------------------------------------------------ Kelime */
    {
      id: "kelime-gunluk", ad: "Günlük hayat kelimeleri", seviye: "A1",
      ozet: "Aile, yiyecek, zıt anlamlılar ve günlük hayattan temel sözcükler.",
      blok: [
        { t: "p", x: "Kartlara dokun, Türkçesi açılsın. Önce Türkçeyi tahmin etmeye çalış, sonra kartı çevir." },
        { t: "kartlar", k: [
          ["aunt / uncle", "teyze-hala / amca-dayı", "My aunt lives in Izmir."],
          ["cousin", "kuzen", "My cousin is the same age as me."],
          ["niece / nephew", "yeğen (kız / erkek)", "My nephew is five years old."],
          ["neighbour", "komşu", "Our neighbour is very kind."],
          ["expensive ↔ cheap", "pahalı ↔ ucuz", "This coat is expensive."],
          ["early ↔ late", "erken ↔ geç", "I woke up early today."],
          ["heavy ↔ light", "ağır ↔ hafif", "The bag is heavy."],
          ["quiet ↔ noisy", "sessiz ↔ gürültülü", "The street is quiet at night."],
          ["thirsty / hungry", "susamış / aç", "I'm hungry. Let's have lunch."],
          ["umbrella", "şemsiye", "It's raining. Take an umbrella."],
          ["post office", "postane", "We buy stamps at the post office."],
          ["wallet", "cüzdan", "I lost my wallet."],
          ["lend / borrow", "ödünç vermek / ödünç almak", "Can you lend me a pen?"],
          ["bring / take", "getirmek / götürmek", "Bring your ID to the office."],
          ["wake up / get up", "uyanmak / yataktan kalkmak", "I wake up at 7 but get up at 7:15."],
          ["kitchen / bathroom / bedroom", "mutfak / banyo / yatak odası", "The bathroom is next to the bedroom."]
        ] }
      ],
      alistirma: [
        { q: "My father's brother is my ___.", o: ["uncle", "aunt", "cousin", "niece"], e: "Babanın erkek kardeşi amcadır: uncle." },
        { q: "The opposite of 'early' is ___.", o: ["late", "slow", "short", "low"], e: "early (erken) ↔ late (geç)." },
        { q: "I'm thirsty. Can I have a glass of ___?", o: ["water", "bread", "rice", "meat"], e: "Bir bardak ... içilecek bir şey olmalı: water." },
        { q: "We buy stamps at the ___ office.", o: ["post", "bank", "police", "ticket"], e: "post office = postane." },
        { q: "It's raining. Take an ___.", o: ["umbrella", "uniform", "table", "sandwich"], e: "umbrella = şemsiye. Ünlü sesle başladığı için an umbrella." }
      ]
    },
    {
      id: "kelime-eslesme", ad: "Sabit kalıplar ve phrasal verbs", seviye: "A2",
      ozet: "make / do / take / have ve fiil + edat kalıpları sözlükten tek tek değil, bütün olarak öğrenilir.",
      blok: [
        { t: "tablo", b: ["make", "do", "take", "have"], s: [
          ["a mistake, a decision, a phone call, money, a plan", "homework, the dishes, a favour, business, research", "a break, a photo, a taxi, a bus, a seat", "breakfast, a shower, a rest, a look, a good time"]
        ] },
        { t: "kural", x: "Kural değil, alışkanlık. Kalıbı bütün olarak öğren: **make a decision**, **do a favour**, **take a break**, **have a rest**." },
        { t: "baslik", x: "Sık kullanılan phrasal verbs" },
        { t: "kartlar", k: [
          ["look forward to", "dört gözle beklemek", "I'm looking forward to the holidays."],
          ["fill in", "(formu) doldurmak", "Please fill in this form."],
          ["give up", "bırakmak, pes etmek", "He gave up smoking last year."],
          ["turn on / turn off", "açmak / kapatmak (cihaz)", "Turn off the lights, please."],
          ["pick up", "almak, (kapıdan) alıp götürmek", "I'll pick you up at six."],
          ["find out", "öğrenmek, keşfetmek", "I found out the answer yesterday."],
          ["carry on", "devam etmek", "Carry on working."],
          ["get on with", "iyi anlaşmak / ilerlemek", "I get on well with my colleagues."],
          ["put off", "ertelemek", "Don't put off the decision."],
          ["run out of", "bitmek, tükenmek", "We've run out of milk."],
          ["set up", "kurmak", "They set up a new company."],
          ["get stuck", "sıkışıp kalmak", "I got stuck in traffic."],
          ["strike a balance", "denge kurmak", "It's hard to strike a balance."]
        ] }
      ],
      alistirma: [
        { q: "I'm looking forward ___ you.", o: ["to seeing", "to see", "for seeing", "seeing"], e: "look forward to'daki to edattır; sonrasında -ing gelir." },
        { q: "Please ___ the form in black ink.", o: ["fill in", "fill on", "full in", "fill of"], e: "fill in a form = formu doldurmak." },
        { q: "He ___ smoking last year.", o: ["gave up", "gave in", "gave out", "gave off"], e: "give up + -ing = bırakmak." },
        { q: "We've ___ of milk. Can you buy some?", o: ["run out", "run on", "run up", "run in"], e: "run out of = bitmek, tükenmek." },
        { q: "Let's ___ a break.", o: ["take", "do", "make", "put"], e: "take a break = mola vermek." },
        { q: "She ___ a big mistake in the report.", o: ["made", "did", "took", "had"], e: "make a mistake = hata yapmak." }
      ]
    },
    {
      id: "kelime-ileri", ad: "İş ve akademik kelimeler, kelime türetme", seviye: "B2",
      ozet: "B2 ve C1 düzeyinde metinlerde sık geçen sözcükler; ön ek ve son eklerle kelime ailesi kurma.",
      blok: [
        { t: "tablo", b: ["Ek", "Ne yapar", "Örnek"], s: [
          ["**un- / in- / im- / dis-**", "olumsuz yapar", "{{possible → impossible}}, {{honest → dishonest}}, {{regular → irregular}}"],
          ["**-tion / -ment**", "fiilden isim", "{{decide → decision}}, {{improve → improvement}}"],
          ["**-ful / -less**", "'-li / -siz'", "{{careful, careless}}"],
          ["**-able / -ible**", "'yapılabilir'", "{{reliable, flexible}}"]
        ] },
        { t: "kartlar", k: [
          ["recruit", "işe almak", "We want to recruit ten new employees."],
          ["optimistic ↔ pessimistic", "iyimser ↔ kötümser", "She is optimistic about the future."],
          ["reluctant", "isteksiz", "He was reluctant to admit his mistake."],
          ["substantial", "önemli ölçüde, hatırı sayılır", "There has been a substantial increase in prices."],
          ["tackle", "(bir sorunla) uğraşmak, ele almak", "We must tackle the problem."],
          ["compelling", "ikna edici", "He made a compelling argument."],
          ["condemn", "kınamak", "The decision was widely condemned."],
          ["concede", "kabul etmek, taviz vermek", "She conceded that she was wrong."],
          ["assess", "değerlendirmek", "We need to assess the risks."],
          ["outcome", "sonuç", "The outcome of the meeting was positive."],
          ["drawback", "dezavantaj", "The main drawback is the price."],
          ["reliable", "güvenilir", "He is a reliable colleague."]
        ] },
        { t: "ipucu", x: "Benzer görünen sözcükleri karıştırma: <i>recruit / retire / reject / reduce</i>, <i>compelling / compulsory / compatible / complacent</i>. Bir sözcüğü öğrenirken yanındaki 'yakın akrabayı' da yaz." }
      ],
      alistirma: [
        { q: "He was ___ to admit his mistake.", o: ["reluctant", "reliable", "relevant", "remarkable"], e: "reluctant to + fiil = yapmaya isteksiz." },
        { q: "There has been a ___ increase in prices this year.", o: ["substantial", "subjective", "sensible", "secure"], e: "substantial increase = önemli ölçüde artış." },
        { q: "The new manager will ___ the problem immediately.", o: ["tackle", "tickle", "tide", "tangle"], e: "tackle a problem = bir sorunu ele almak." },
        { q: "Her decision was ___ by a desire to help.", o: ["motivated", "motivating", "motivation", "motive"], e: "was motivated by = ...den güç almış, ...ye dayalı." },
        { q: "It is ___ to predict the weather months ahead.", o: ["impossible", "unpossible", "inpossible", "dispossible"], e: "possible'ın olumsuzu im- ile yapılır: impossible (p, b, m'den önce im-)." }
      ]
    },

    /* ------------------------------------------------------------------ Okuma */
    {
      id: "okuma", ad: "Okuma soruları: metinde yazanı bul", seviye: "B1",
      ozet: "Okuma sorusunda doğru şık çoğunlukla metinde yazanın başka sözcüklerle yeniden yazılmış halidir.",
      blok: [
        { t: "baslik", x: "4 adımlı yöntem" },
        { t: "liste", m: [
          "**1.** Soruyu oku, anahtar sözcüğü bul (Why, advantage, when ...).",
          "**2.** Metinde o anahtar sözcüğün ipucunu ara (aşağıdaki tabloya bak).",
          "**3.** O cümleyi dikkatle oku ve cevabı kendi cümlenle kur.",
          "**4.** Şıklarla karşılaştır. **Metinde olmayan şey yanlıştır.**"
        ] },
        { t: "tablo", b: ["Soru", "Metinde aranacak sözcükler"], s: [
          ["Why ...? (neden)", "{{because, since, so, due to, as}}"],
          ["Advantage / benefit", "{{helps, saves, supporters say, widens}}"],
          ["Problem / criticism", "{{but, however, unfortunately, critics}}"],
          ["What should ... do?", "{{please, should, must, need to, by (tarih)}}"],
          ["When ...?", "gün, tarih ve saat ifadeleri"]
        ] },
        { t: "ipucu", x: "**İki tuzak:** (a) şık metindeki bir sözcüğü kullanır ama anlamı değiştirir; (b) şık mantıklı görünür ama metinde hiç geçmez. Soruda **NOT** varsa metinde olmayanı değil, **metne uymayanı** ararsın." },
        { t: "baslik", x: "Deneme metni" },
        { t: "metin", x: "Pinecrest Library is changing its opening hours from 1 April. From Monday to Friday it will open at 9 a.m. instead of 10 a.m., but it will close earlier, at 6 p.m. On Saturdays the library will stay open until 2 p.m. Because the building is being repaired, the children's section will be closed until the end of May. Members can still borrow books from the main desk." }
      ],
      alistirma: [
        { q: "What will change on weekdays?", o: ["The library will open an hour earlier.", "The library will open later.", "The library will stay open longer.", "The library will close on Fridays."], e: "Metinde: 'will open at 9 a.m. instead of 10 a.m.' yani bir saat erken açılacak." },
        { q: "Why is the children's section closed?", o: ["The building is being repaired.", "There are too few books.", "It is only for members.", "Nobody uses it."], e: "'Because' ipucu: 'Because the building is being repaired ...'." },
        { q: "Where can members borrow books?", o: ["At the main desk", "In the children's section", "On Saturdays only", "Online only"], e: "Metinde: 'Members can still borrow books from the main desk.'" }
      ]
    }
  ];

  g.MERVE_DERSLER = { surum: 1, dersler: DERSLER };
})(typeof globalThis !== "undefined" ? globalThis : this);
