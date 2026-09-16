-- Balım kafe hazırlık paneli — ilk şema.
--
-- Kişiler bu dosyada YOK: depo herkese açık ve kısa bir şifrenin hash'i burada
-- herkesin önünde dururdu. Kişiler scripts/balim-kullanici.mjs ile eklenir.
--
-- Tutarlar kuruş cinsinden tamsayı (25.000 TL = 2500000): 1.249,90 TL gibi
-- fiyatlar kayan noktaya düşmeden toplanır. *_zamani / olusturuldu alanları
-- UTC ISO-8601; son_tarih, ay ve odeme_tarihi ise İstanbul takvimindeki gün.

CREATE TABLE kullanicilar (
  id INTEGER PRIMARY KEY,
  kullanici_adi TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  -- "pbkdf2-sha256$<tur>$<tuz>$<hash>", tuz ve hash base64
  sifre TEXT NOT NULL,
  olusturuldu TEXT NOT NULL
);

CREATE TABLE oturumlar (
  -- Çerezdeki jetonun SHA-256'sı. Jetonun kendisi hiçbir yerde saklanmaz:
  -- bu tablo sızsa bile içindekiyle kimse giriş yapamaz.
  anahtar TEXT PRIMARY KEY,
  kullanici_id INTEGER NOT NULL REFERENCES kullanicilar (id) ON DELETE CASCADE,
  olusturuldu TEXT NOT NULL,
  son_gorulme TEXT NOT NULL,
  cihaz TEXT NOT NULL DEFAULT ''
);
CREATE INDEX oturumlar_kullanici ON oturumlar (kullanici_id);

-- Hatalı giriş sayacı: IP başına 15 dakikalık pencere.
CREATE TABLE giris_denemeleri (
  id INTEGER PRIMARY KEY,
  ip TEXT NOT NULL,
  zaman TEXT NOT NULL
);
CREATE INDEX giris_denemeleri_ip ON giris_denemeleri (ip, zaman);

CREATE TABLE alinacaklar (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL,
  kategori TEXT NOT NULL,
  adet INTEGER NOT NULL DEFAULT 1,
  -- NULL: fiyatı henüz belli değil. Toplama katılmaz, ayrıca sayılır.
  birim_fiyat INTEGER,
  -- JSON: [{ "url": "https://...", "not": "Trendyol'daki" }]
  linkler TEXT NOT NULL DEFAULT '[]',
  aciklama TEXT NOT NULL DEFAULT '',
  alindi INTEGER NOT NULL DEFAULT 0,
  alinma_zamani TEXT,
  ekleyen_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  olusturuldu TEXT NOT NULL,
  guncellendi TEXT NOT NULL
);

CREATE TABLE yapilacaklar (
  id INTEGER PRIMARY KEY,
  baslik TEXT NOT NULL,
  aciklama TEXT NOT NULL DEFAULT '',
  son_tarih TEXT,
  sorumlu_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  tamamlandi INTEGER NOT NULL DEFAULT 0,
  tamamlanma_zamani TEXT,
  ekleyen_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  olusturuldu TEXT NOT NULL,
  guncellendi TEXT NOT NULL
);

-- Her ay tekrarlanan giderler: kira, elektrik, internet...
CREATE TABLE giderler (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL,
  tutar INTEGER NOT NULL,
  -- "YYYY-MM": ilk ödemenin ayı. bitis NULL ise gider süresiz.
  baslangic TEXT NOT NULL,
  bitis TEXT,
  odeme_gunu INTEGER NOT NULL DEFAULT 1,
  ekleyen_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  olusturuldu TEXT NOT NULL,
  guncellendi TEXT NOT NULL
);

-- Bir giderin bir ayı en fazla bir kez ödenir; ikinci işaret ilkinin üstüne yazar.
CREATE TABLE odemeler (
  id INTEGER PRIMARY KEY,
  gider_id INTEGER NOT NULL REFERENCES giderler (id) ON DELETE CASCADE,
  ay TEXT NOT NULL,
  tutar INTEGER NOT NULL,
  odeme_tarihi TEXT NOT NULL,
  odeyen_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  olusturuldu TEXT NOT NULL,
  UNIQUE (gider_id, ay)
);

CREATE TABLE gorseller (
  -- R2'deki anahtarı da bu: gorseller/<id> ve küçüğü gorseller/<id>-kucuk
  id TEXT PRIMARY KEY,
  baslik TEXT NOT NULL DEFAULT '',
  kategori TEXT NOT NULL,
  tur TEXT NOT NULL,
  boyut INTEGER NOT NULL,
  genislik INTEGER,
  yukseklik INTEGER,
  kucuk_var INTEGER NOT NULL DEFAULT 0,
  ekleyen_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  olusturuldu TEXT NOT NULL
);

CREATE TABLE ayarlar (
  anahtar TEXT PRIMARY KEY,
  deger TEXT NOT NULL
);

-- "Kim ne yaptı" akışı. En büyük id aynı zamanda verinin sürümü: açık sayfalar
-- yalnızca bu sayıyı sorar, değiştiyse her şeyi yeniden çeker. AUTOINCREMENT
-- bu yüzden: sayı hiçbir koşulda geri gitmemeli.
CREATE TABLE etkinlikler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kullanici_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  tur TEXT NOT NULL,
  eylem TEXT NOT NULL,
  metin TEXT NOT NULL,
  zaman TEXT NOT NULL
);

-- Dükkan kirası: Ekim 2026'dan itibaren her ayın 1'i, ayda 25.000 TL.
INSERT INTO giderler (ad, tutar, baslangic, odeme_gunu, olusturuldu, guncellendi)
VALUES ('Dükkan kirası', 2500000, '2026-10', 1, '2026-09-16T12:00:00.000Z', '2026-09-16T12:00:00.000Z');
